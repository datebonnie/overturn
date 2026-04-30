"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type ForgotResult = { error: string } | { ok: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function forgotPasswordAction(
  _prevState: ForgotResult | null,
  formData: FormData,
): Promise<ForgotResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ||
    `https://${headersList.get("host") ?? "hioverturn.com"}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=recovery`,
  });

  // Always return success to avoid disclosing whether the email is registered.
  if (error) {
    console.error("[forgot-password] resetPasswordForEmail error:", error);
  }

  return { ok: true };
}
