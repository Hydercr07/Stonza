import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Security headers applied to every response. CSP uses a per-request nonce
 * for scripts (with `strict-dynamic` so Next's own chunk-loading scripts are
 * trusted transitively) while styles stay `unsafe-inline` — Tailwind's
 * arbitrary-value classes compile to real stylesheet rules, but a handful of
 * components (root layout font vars, GSAP/Three.js driven inline styles) set
 * `style=""` attributes directly, and nonce-ing those isn't practical here.
 */
function buildCspHeader(nonce: string) {
  const isDev = process.env.NODE_ENV !== "production";

  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const connectSrc = ["'self'", "https://*.supabase.co"];
  if (isDev) connectSrc.push("ws:", "http://localhost:*");

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc.join(" ")}`,
    `worker-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    !isDev ? `upgrade-insecure-requests` : "",
  ]
    .filter(Boolean)
    .join("; ");
}

function applyResponseSecurityHeaders(response: NextResponse, nonce: string, cspHeader: string) {
  const isDev = process.env.NODE_ENV !== "production";

  response.headers.set("x-nonce", nonce);
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return response;
}

/**
 * Refreshes the Supabase Auth session cookie (expired access token ->
 * refreshed via the refresh token) before the admin portal's Server
 * Components run -- they can only read cookies, not write them, so this is
 * the one place in the request that can persist a refreshed token.
 * Supabase's documented pattern for Next.js middleware. Scoped to /admin
 * routes only and gated behind the same ADMIN_AUTH_BACKEND=supabase flag as
 * the rest of the Supabase Auth cutover, so it adds no cost to the
 * storefront and is a no-op until the auth migration is actually enabled.
 */
async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  if (
    process.env.ADMIN_AUTH_BACKEND !== "supabase" ||
    !env.NEXT_PUBLIC_SUPABASE_URL ||
    !env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Must be awaited: setAll() above (which is what actually attaches the
  // refreshed cookies to `response`) runs as a side effect of this resolving.
  await supabase.auth.getUser();

  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = buildCspHeader(nonce);

  // Next's App Router auto-injects this same nonce into every script tag IT
  // manages (chunk loaders, the RSC hydration payload, etc.) -- but only if
  // it can read the CSP header off the *incoming request*, not just see it
  // on the outgoing response. Without this, none of those framework-managed
  // scripts carry a nonce, so 'strict-dynamic' (which trusts a script only
  // by nonce, never by host) blocks nearly everything: broken hydration,
  // broken client-side interactivity, sitewide CSP console errors.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);
  // A full NextRequest clone (not just a Headers object) so refreshSupabaseSession
  // below still has working `.cookies` while also carrying the CSP-bearing headers.
  const requestWithCsp = new NextRequest(request, { headers: requestHeaders });

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (request.nextUrl.pathname.startsWith("/admin")) {
    response = await refreshSupabaseSession(requestWithCsp, response);
  }

  return applyResponseSecurityHeaders(response, nonce, cspHeader);
}

export const config = {
  matcher: [
    // Skip static assets and Next internals; apply to every page/route/action request.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};
