import "server-only";

import crypto from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/types/domain";
import { canRole, type Permission } from "@/lib/permissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

const ADMIN_COOKIE = "stonza-admin-session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 10; // 10 hours

export interface AdminSession {
  email: string;
  role: AdminRole;
  mode: "demo" | "supabase";
}

interface SignedSessionPayload {
  email: string;
  role: AdminRole;
  mode: "demo";
  issuedAt: number;
}

export function getOwnerEmail() {
  return process.env.OWNER_EMAIL ?? "owner@stonza.local";
}

export function getOwnerPassword() {
  return process.env.OWNER_PASSWORD ?? "stonza-admin-demo";
}

/**
 * Deliberately a separate, explicit opt-in (same pattern as DATA_BACKEND for
 * the database migration) -- cutting admin login over to real Supabase Auth
 * is only safe once the owner's auth user, profile, and role have actually
 * been bootstrapped (scripts/bootstrap-supabase-auth.cjs). Until
 * ADMIN_AUTH_BACKEND=supabase is set, admin login keeps using the signed
 * demo cookie exactly as before, so shipping this code can't lock anyone
 * out of a deployment that hasn't run the bootstrap yet.
 */
export function isSupabaseAuthEnabled() {
  return (
    process.env.ADMIN_AUTH_BACKEND === "supabase" &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY && env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

/**
 * Secret used to sign the demo admin session cookie so it cannot be forged
 * by simply writing a cookie value in the browser (e.g. via devtools). Must
 * be set explicitly in production; falls back to a local-only value in
 * development so `npm run dev` keeps working without extra setup.
 */
function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to a strong random value in production. Refusing to start admin auth without it.",
    );
  }

  return `dev-only-insecure-secret:${getOwnerEmail()}:${getOwnerPassword()}`;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function encodeSessionCookie(email: string, role: AdminRole) {
  const payload: SignedSessionPayload = { email, role, mode: "demo", issuedAt: Date.now() };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/**
 * Looks up the admin role assigned to a signed-in Supabase Auth user via
 * public.user_roles / public.roles. Uses the service-role client because
 * those tables are locked to service_role by RLS (see the initial
 * migration) -- this lookup happens entirely server-side and is never
 * exposed to the client, so bypassing RLS here is safe.
 */
async function lookupSupabaseUserRole(userId: string): Promise<AdminRole | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(key)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle<{ roles: { key: AdminRole } | null }>();

  if (error || !data?.roles) return null;
  return data.roles.key;
}

async function getAdminSessionFromSupabase(): Promise<AdminSession | null> {
  const supabase = await createSupabaseServerClient();
  // getUser() (not getSession()) re-validates the JWT against Supabase
  // itself rather than trusting whatever is in the local cookie -- the
  // recommended check for anything server-side that gates access.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const role = await lookupSupabaseUserRole(user.id);
  if (!role) return null; // Signed in, but no admin role assigned -- not an admin.

  return { email: user.email, role, mode: "supabase" };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  noStore();

  if (isSupabaseAuthEnabled()) {
    return getAdminSessionFromSupabase();
  }

  const cookieStore = await cookies();
  return parseAdminSessionCookie(cookieStore.get(ADMIN_COOKIE)?.value);
}

/** Demo-mode only -- Supabase Auth manages its own session cookies via signInWithPassword(). */
export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, encodeSessionCookie(email, "owner"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  if (isSupabaseAuthEnabled()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return;
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

/**
 * Parses and verifies the demo-mode admin session cookie. Returns null for
 * a missing, malformed, unsigned, tampered-with, or expired cookie.
 */
export function parseAdminSessionCookie(raw: string | undefined): AdminSession | null {
  if (!raw) return null;

  const separatorIndex = raw.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const encodedPayload = raw.slice(0, separatorIndex);
  const signature = raw.slice(separatorIndex + 1);

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SignedSessionPayload;
    const ageSeconds = (Date.now() - payload.issuedAt) / 1000;
    if (!Number.isFinite(ageSeconds) || ageSeconds < 0 || ageSeconds > SESSION_MAX_AGE_SECONDS) {
      return null;
    }

    const { email, role, mode } = payload;
    if (!email || !role || mode !== "demo") return null;

    return { email, role, mode };
  } catch {
    return null;
  }
}

export async function requireAdminSession(permission: Permission) {
  const session = await getAdminSession();

  if (!session || !canRole(session.role, permission)) {
    redirect("/admin/login");
  }

  return session;
}
