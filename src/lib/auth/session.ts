import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/types/domain";
import { canRole, type Permission } from "@/lib/permissions";

const ADMIN_COOKIE = "stonza-admin-session";

export interface AdminSession {
  email: string;
  role: AdminRole;
  mode: "demo";
}

export function getOwnerEmail() {
  return process.env.OWNER_EMAIL ?? "owner@stonza.local";
}

export function getOwnerPassword() {
  return process.env.OWNER_PASSWORD ?? "stonza-admin-demo";
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return parseAdminSessionCookie(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_COOKIE,
    JSON.stringify({
      email,
      role: "owner",
      mode: "demo",
    } satisfies AdminSession),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 10,
    },
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export function parseAdminSessionCookie(raw: string | undefined) {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminSession;
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
