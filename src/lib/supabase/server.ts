import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Server-side Supabase client backed by the request's cookies, for Supabase
 * Auth (sign in/out, session lookups). `cookies().set()` is only legal from
 * a Server Action or Route Handler -- called from a plain Server Component
 * it throws, so setAll() swallows that case; the session still gets
 * refreshed because src/proxy.ts also runs this same refresh on every
 * request and (as middleware) is allowed to write response cookies.
 */
export async function createSupabaseServerClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY) {
    throw new Error("Supabase server environment variables are missing.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component -- proxy.ts's own refresh covers it.
        }
      },
    },
  });
}
