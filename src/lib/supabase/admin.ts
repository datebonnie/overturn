/**
 * Service-role Supabase client. **Server-only.** Bypasses Row-Level
 * Security; use exclusively from server actions and route handlers for
 * operations that legitimately need RLS-bypass:
 *
 *   - Creating a `practices` row + `users` row in the signup flow
 *     (the new user has no practice_id yet, so RLS would block).
 *   - Stripe webhook handlers updating subscription state.
 *   - Cron jobs running outside an authenticated request.
 *
 * Never import this from a client component or expose its return value
 * to the browser. Module-level guard catches accidental client imports.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
