"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginResult = { error: string } | { ok: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loginAction(
  _prevState: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/app");

  if (!EMAIL_RE.test(email) || !password) {
    return { error: "Enter a valid email and your password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Generic message — don't reveal whether the email exists.
    return { error: "Email or password is incorrect." };
  }

  // Only allow internal redirects.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  redirect(safeNext);
}
