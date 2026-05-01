import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { requireUserAndPractice } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { recordAudit } from "@/lib/audit";

export const metadata: Metadata = {
  title: "Appeal",
  robots: { index: false, follow: false },
};

type AppealRow = {
  id: string;
  practice_id: string;
  claim_number: string | null;
  patient_identifier_last4: string | null;
  payer: string | null;
  service_date: string | null;
  denial_reason_code: string | null;
  denial_reason_category: string | null;
  cpt_codes: string[];
  icd10_codes: string[];
  appeal_letter_text: string;
  appeal_strategy: string | null;
  citations_used: string[];
  appeal_deadline: string | null;
  confidence: "high" | "medium" | "low" | null;
  confidence_rationale: string | null;
  status: string;
  generated_at: string;
};

const STATUS_DISPLAY: Record<string, { label: string; classes: string }> = {
  draft: { label: "Draft", classes: "bg-slate-100 text-slate-700 ring-slate-200" },
  ready_to_send: { label: "Ready", classes: "bg-accent-50 text-accent-700 ring-accent-100" },
  sent: { label: "Sent", classes: "bg-navy-50 text-navy-800 ring-navy-100" },
  won: { label: "Won", classes: "bg-emerald-50 text-emerald-800 ring-emerald-100" },
  lost: { label: "Lost", classes: "bg-slate-100 text-slate-700 ring-slate-200" },
  withdrawn: { label: "Withdrawn", classes: "bg-slate-100 text-slate-700 ring-slate-200" },
};

export default async function AppealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, practice } = await requireUserAndPractice();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appeals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const appeal = data as AppealRow;

  // Audit the read.
  await recordAudit({
    practiceId: practice.id,
    userId: user.id,
    action: "appeal_view",
    targetType: "appeal",
    targetId: appeal.id,
  });

  const status =
    STATUS_DISPLAY[appeal.status] ?? {
      label: appeal.status,
      classes: "bg-slate-100 text-slate-700 ring-slate-200",
    };

  const lowConfidence = appeal.confidence === "low";

  return (
    <main className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All appeals
      </Link>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            APPEAL
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-800 sm:text-4xl">
            {appeal.payer ?? "Appeal"} · {appeal.claim_number ?? "(no claim #)"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Generated {new Date(appeal.generated_at).toLocaleString()}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ring-1 ring-inset ${status.classes}`}
        >
          {status.label}
        </span>
      </div>

      {lowConfidence ? (
        <div
          role="alert"
          className="mt-8 rounded-md bg-amber-50 px-4 py-4 ring-1 ring-inset ring-amber-200"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Low confidence — review carefully before sending.
              </p>
              {appeal.confidence_rationale ? (
                <p className="mt-1 text-sm text-amber-900/90">
                  {appeal.confidence_rationale}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-navy-700">
            Appeal letter
          </h2>
          <div className="mt-3 rounded-xl bg-white ring-1 ring-navy-100 p-6 sm:p-8">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-navy-800 sm:text-base">
              {appeal.appeal_letter_text}
            </pre>
          </div>

          {/* Download/edit/status controls land in pause point #4. */}
          <div className="mt-4 flex flex-wrap gap-3">
            <DisabledButton>Download PDF</DisabledButton>
            <DisabledButton>Download DOCX</DisabledButton>
            <DisabledButton>Edit</DisabledButton>
            <DisabledButton>Mark as sent</DisabledButton>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Edit + download + status updates ship in the next phase.
          </p>
        </div>

        <aside className="lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-navy-700">
            Details
          </h2>
          <dl className="mt-3 rounded-xl bg-white ring-1 ring-navy-100 p-5 sm:p-6 space-y-3 text-sm">
            <Row label="Payer" value={appeal.payer ?? "—"} />
            <Row label="Claim #" value={appeal.claim_number ?? "—"} mono />
            <Row label="Patient (last 4)" value={appeal.patient_identifier_last4 ?? "—"} mono />
            <Row label="Service date" value={fmt(appeal.service_date)} />
            <Row label="Denial code" value={appeal.denial_reason_code ?? "—"} mono />
            <Row label="Category" value={appeal.denial_reason_category ?? "—"} />
            <Row
              label="CPT"
              value={appeal.cpt_codes.length ? appeal.cpt_codes.join(", ") : "—"}
              mono
            />
            <Row
              label="ICD-10"
              value={appeal.icd10_codes.length ? appeal.icd10_codes.join(", ") : "—"}
              mono
            />
            <Row label="Appeal deadline" value={fmt(appeal.appeal_deadline)} />
            <Row
              label="Confidence"
              value={appeal.confidence ?? "—"}
              tone={appeal.confidence === "low" ? "warn" : "neutral"}
            />
          </dl>

          {appeal.appeal_strategy ? (
            <>
              <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-navy-700">
                Strategy
              </h3>
              <p className="mt-3 rounded-xl bg-white ring-1 ring-navy-100 p-5 sm:p-6 text-sm leading-relaxed text-navy-800">
                {appeal.appeal_strategy}
              </p>
            </>
          ) : null}

          {appeal.citations_used.length > 0 ? (
            <>
              <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-navy-700">
                Citations used
              </h3>
              <ul className="mt-3 rounded-xl bg-white ring-1 ring-navy-100 p-5 sm:p-6 space-y-2 text-sm leading-relaxed text-navy-800">
                {appeal.citations_used.map((c, i) => (
                  <li key={i} className="list-disc list-inside">
                    {c}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className="flex items-baseline gap-4">
      <dt className="w-32 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`${mono ? "font-mono text-xs" : ""} ${
          tone === "warn" ? "font-semibold text-amber-700" : "text-navy-800"
        } break-words`}
      >
        {value}
      </dd>
    </div>
  );
}

function DisabledButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 ring-1 ring-inset ring-slate-200 cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function fmt(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString();
}
