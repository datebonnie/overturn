/**
 * Server-side auth guards used by /app/* server components and API routes.
 *
 * Every guard returns the resolved session info or throws/redirects on
 * failure. Use the right guard for the route's needs:
 *
 *   - requireUser            — any authenticated user; signup callback only
 *   - requireUserAndPractice — authenticated user attached to a practice
 *
 * RLS does the actual data isolation; these guards are the application-layer
 * convenience that turns "not authenticated" into a redirect.
 */

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ResolvedUser = {
  user: {
    id: string;
    email: string;
  };
  practice: {
    id: string;
    name: string;
    subscription_status: "trial" | "active" | "past_due" | "cancelled";
    trial_ends_at: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
  };
  appUserRole: "owner" | "admin" | "biller";
};

export async function requireUserAndPractice(): Promise<ResolvedUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("users")
    .select(
      "role, email, practices(id, name, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id)",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // No user row attached — orphaned auth.users entry. Push them out.
    redirect("/login?error=no_practice");
  }

  type Row = {
    role: ResolvedUser["appUserRole"];
    email: string;
    practices: ResolvedUser["practice"] | null;
  };
  const row = data as unknown as Row;
  if (!row.practices) {
    redirect("/login?error=no_practice");
  }

  return {
    user: { id: user.id, email: row.email },
    practice: row.practices,
    appUserRole: row.role,
  };
}
