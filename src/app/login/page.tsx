import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type Search = { next?: string; error?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { next, error } = await searchParams;
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in to Overturn."
      footer={
        <>
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-navy-800 hover:text-accent-600 transition-colors"
          >
            Create an account
          </Link>
          {" · "}
          <Link
            href="/forgot-password"
            className="font-semibold text-navy-800 hover:text-accent-600 transition-colors"
          >
            Forgot password?
          </Link>
        </>
      }
    >
      {error ? (
        <p className="mb-4 text-sm text-accent-700">
          Sign-in error: {decodeURIComponent(error)}
        </p>
      ) : null}
      <LoginForm next={safeNext} />
    </AuthShell>
  );
}
