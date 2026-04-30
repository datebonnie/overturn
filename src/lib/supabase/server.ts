/**
 * Server-side Supabase client. Use in server components, server actions,
 * route handlers. Reads/writes auth cookies via the Next.js cookies() API.
 *
 * Respects Row-Level Security — runs as the authenticated user.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component (read-only cookies). Safe to
            // ignore — middleware refreshes the session on the next request.
          }
        },
      },
    },
  );
}
