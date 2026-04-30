"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SignupResult = { error: string } | { ok: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRIAL_DAYS = 14;

export async function signupAction(
  _prevState: SignupResult | null,
  formData: FormData,
): Promise<SignupResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const practiceName = String(formData.get("practice_name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim() || null;

  // Validation
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 12) {
    return { error: "Password must be at least 12 characters." };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: "Password must include a letter and a number." };
  }
  if (!practiceName) {
    return { error: "Practice name is required." };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    `https://${headersList.get("host") ?? "hioverturn.com"}`;

  const supabase = await createClient();
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?type=signup`,
      data: { full_name: fullName, practice_name: practiceName },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }
  if (!authData.user) {
    return { error: "Signup did not create an account. Try again." };
  }

  // RLS would block these inserts because the new user's session has no
  // practice_id resolvable yet. Use the admin (service-role) client.
  const admin = createAdminClient();

  const trialEndsAt = new Date(
    Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: practice, error: practiceError } = await admin
    .from("practices")
    .insert({
      name: practiceName,
      subscription_status: "trial",
      trial_ends_at: trialEndsAt,
    })
    .select("id")
    .single();

  if (practiceError || !practice) {
    // Roll back the auth user so the email isn't permanently held.
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    return {
      error: practiceError?.message ?? "Could not create practice record.",
    };
  }

  const { error: userError } = await admin.from("users").insert({
    id: authData.user.id,
    practice_id: practice.id,
    email,
    full_name: fullName,
    role: "owner",
  });

  if (userError) {
    await admin.from("practices").delete().eq("id", practice.id);
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    return { error: userError.message };
  }

  redirect("/check-email");
}
