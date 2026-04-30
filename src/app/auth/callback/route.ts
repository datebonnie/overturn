/**
 * Auth callback. Supabase email-verification and password-recovery links
 * point here with a `code` query param. We exchange the code for a session,
 * set the cookies, and redirect.
 *
 *   - signup verification → /app
 *   - password recovery   → /reset-password (the form completes the flow)
 *   - magic link          → /app
 *
 * `next` query param overrides the default destination if the link was
 * generated with a custom redirect.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type"); // 'signup' | 'recovery' | 'invite' | 'email_change' | 'magiclink'
  const next = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url),
    );
  }

  const destination =
    next ?? (type === "recovery" ? "/reset-password" : "/app");
  return NextResponse.redirect(new URL(destination, url));
}
