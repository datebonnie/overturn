import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <AuthShell
      eyebrow="ONE MORE STEP"
      title="Check your inbox."
      subtitle="We just sent you a verification link. Click it and you'll land in your dashboard. The link is good for one hour."
      footer={
        <>
          Wrong address?{" "}
          <Link
            href="/signup"
            className="font-semibold text-navy-800 hover:text-accent-600 transition-colors"
          >
            Start over
          </Link>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600">
        If you don&apos;t see the email in a minute, check your spam folder.
        It comes from <span className="font-mono">hello@hioverturn.com</span>.
      </p>
    </AuthShell>
  );
}
