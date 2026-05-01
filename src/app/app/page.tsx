import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { requireUserAndPractice } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

type AppealRow = {
  id: string;
  payer: string | null;
  claim_number: string | null;
  appeal_deadline: string | null;
  status: string;
  confidence: string | null;
  generated_at: string;
};

const STATUS_DISPLAY: Record<
  string,
  { label: string; classes: string }
> = {
  draft: {
    label: "Draft",
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  ready_to_send: {
    label: "Ready",
    classes: "bg-accent-50 text-accent-700 ring-accent-100",
  },
  sent: {
    label: "Sent",
    classes: "bg-navy-50 text-navy-800 ring-navy-100",
  },
  won: {
    label: "Won",
    classes: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  },
  lost: {
    label: "Lost",
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  withdrawn: {
    label: "Withdrawn",
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

export default async function DashboardPage() {
  const { practice, user } = await requireUserAndPractice();
  const supabase = await createClient();

  const { data: appealsData } = await supabase
    .from("appeals")
    .select(
      "id, payer, claim_number, appeal_deadline, status, confidence, generated_at",
    )
    .order("generated_at", { ascending: false })
    .limit(50);

  const appeals = (appealsData ?? []) as AppealRow[];
  const isEmpty = appeals.length === 0;

  const trialEnd = practice.trial_ends_at
    ? new Date(practice.trial_ends_at)
    : null;
  const trialDaysLeft = trialEnd ? daysUntil(trialEnd) : null;
  const showTrialBadge =
    practice.subscription_status === "trial" && trialDaysLeft !== null;

  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            DASHBOARD
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
            {greeting(user.email)}
          </h1>
        </div>
        {showTrialBadge ? (
          <span className="inline-flex items-center rounded-full bg-accent-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-700 ring-1 ring-inset ring-accent-100">
            {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left in your
            trial
          </span>
        ) : null}
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <FilledState appeals={appeals} />
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-2xl bg-white ring-1 ring-navy-100 p-8 sm:p-12 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 ring-1 ring-inset ring-accent-100">
        <FileText className="h-6 w-6 text-accent-600" aria-hidden="true" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-navy-800 sm:text-3xl">
        No appeals yet.
      </h2>
      <p className="mt-3 mx-auto max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
        Drop in a denial letter, paste your chart notes, and get a
        payer-formatted appeal in under 60 seconds.
      </p>
      <Link
        href="/app/new"
        className="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-accent-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      >
        Generate Your First Appeal
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function FilledState({ appeals }: { appeals: AppealRow[] }) {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight text-navy-800">
          Your appeals
        </h2>
        <Link
          href="/app/new"
          className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New appeal
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-white ring-1 ring-navy-100">
        <table className="w-full divide-y divide-navy-100">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-navy-700">
              <th className="px-4 py-3 sm:px-6">Payer</th>
              <th className="px-4 py-3 sm:px-6">Claim #</th>
              <th className="px-4 py-3 sm:px-6">Deadline</th>
              <th className="px-4 py-3 sm:px-6">Status</th>
              <th className="px-4 py-3 sm:px-6 text-right">Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-50">
            {appeals.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-navy-50/40 transition-colors text-sm"
              >
                <td className="px-4 py-3 sm:px-6">
                  <Link
                    href={`/app/appeals/${a.id}`}
                    className="font-semibold text-navy-800 hover:text-accent-600 transition-colors"
                  >
                    {a.payer ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 sm:px-6 font-mono text-xs text-slate-700">
                  {a.claim_number ?? "—"}
                </td>
                <td className="px-4 py-3 sm:px-6 text-slate-700">
                  <DeadlineCell deadline={a.appeal_deadline} />
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <StatusPill status={a.status} />
                </td>
                <td className="px-4 py-3 sm:px-6 text-right text-slate-500">
                  {new Date(a.generated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeadlineCell({ deadline }: { deadline: string | null }) {
  if (!deadline) return <span className="text-slate-400">—</span>;
  const d = new Date(deadline);
  const days = daysUntil(d);
  const tone =
    days <= 7
      ? "text-accent-600 font-semibold"
      : days <= 30
        ? "text-amber-700"
        : "text-slate-700";
  return (
    <span className={tone}>
      {d.toLocaleDateString()}
      <span className="ml-2 text-xs text-slate-500">
        ({days} {days === 1 ? "day" : "days"})
      </span>
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const meta = STATUS_DISPLAY[status] ?? {
    label: status,
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ring-1 ring-inset ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}

function greeting(email: string): string {
  const prefix = email.split("@")[0] ?? "founder";
  return `Welcome back, ${prefix}.`;
}

function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
