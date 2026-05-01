"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe/billing";

async function loadPracticeAndUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("users")
    .select(
      "email, practice_id, practices(id, name, stripe_customer_id)",
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("Could not load your account.");
  }

  type ProfileRow = {
    email: string;
    practice_id: string;
    practices: {
      id: string;
      name: string;
      stripe_customer_id: string | null;
    } | null;
  };
  const p = profile as unknown as ProfileRow;
  if (!p.practices) {
    throw new Error("Your user record is not attached to a practice.");
  }

  return { practice: p.practices, userEmail: p.email };
}

async function originFromHeaders(): Promise<string> {
  const h = await headers();
  return (
    h.get("origin") ||
    `https://${h.get("host") ?? "hioverturn.com"}`
  );
}

export async function startCheckoutAction() {
  const { practice, userEmail } = await loadPracticeAndUser();
  const origin = await originFromHeaders();
  const url = await createCheckoutSession({ practice, userEmail, origin });
  redirect(url);
}

export async function openPortalAction() {
  const { practice, userEmail } = await loadPracticeAndUser();
  const origin = await originFromHeaders();
  const url = await createPortalSession({ practice, userEmail, origin });
  redirect(url);
}
