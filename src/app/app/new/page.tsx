import type { Metadata } from "next";
import { requireUserAndPractice } from "@/lib/auth/guards";
import { NewAppealFlow } from "./new-appeal-flow";

export const metadata: Metadata = {
  title: "New appeal",
  robots: { index: false, follow: false },
};

export default async function NewAppealPage() {
  const { practice } = await requireUserAndPractice();

  return (
    <main className="mx-auto max-w-3xl px-5 sm:px-8 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
        NEW APPEAL
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
        Generate an appeal letter.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
        Upload the denial. Paste the relevant chart notes. We&apos;ll write
        the appeal in under 60 seconds. You review, edit if you want, and
        submit through your existing channels.
      </p>

      <NewAppealFlow practiceName={practice.name} />
    </main>
  );
}
