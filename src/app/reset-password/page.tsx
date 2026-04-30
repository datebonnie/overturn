import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Set new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="NEW PASSWORD"
      title="Set a new password."
      subtitle="Once set, you'll be signed in automatically."
    >
      <ResetForm />
    </AuthShell>
  );
}
