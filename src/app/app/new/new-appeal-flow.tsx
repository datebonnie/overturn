"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileUp, Loader2, Upload, X } from "lucide-react";

type UploadResult = {
  upload_id: string;
  file_name: string;
  extracted_text: string | null;
};

type GenerationProgress = {
  active: boolean;
  step: number;
};

const PROGRESS_STEPS = [
  "Reading the denial...",
  "Identifying the payer...",
  "Building the strategy...",
  "Writing the appeal...",
];

export function NewAppealFlow({ practiceName }: { practiceName: string }) {
  const router = useRouter();

  const [denialUpload, setDenialUpload] = useState<UploadResult | null>(null);
  const [denialText, setDenialText] = useState("");
  const [denialUploading, setDenialUploading] = useState(false);
  const [denialError, setDenialError] = useState<string | null>(null);

  const [chartText, setChartText] = useState("");
  const [chartUpload, setChartUpload] = useState<UploadResult | null>(null);
  const [chartUploading, setChartUploading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    active: false,
    step: 0,
  });
  const [stillWorking, setStillWorking] = useState(false);
  const [serverError, setServerError] = useState<{
    reason: string;
    suggestion?: string;
    requestId?: string;
    retry?: boolean;
  } | null>(null);

  // Cycle through progress messages while submitting.
  useEffect(() => {
    if (!progress.active) return;
    const id = setInterval(() => {
      setProgress((p) =>
        p.active && p.step < PROGRESS_STEPS.length - 1
          ? { ...p, step: p.step + 1 }
          : p,
      );
    }, 8000);
    return () => clearInterval(id);
  }, [progress.active]);

  // Show "Still working..." after 60s so the user knows the request hasn't
  // hung. The progress cycle keeps animating regardless. The setStillWorking
  // calls run async (cleanup or timer fire), not during render.
  useEffect(() => {
    if (!progress.active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStillWorking(false);
      return;
    }
    const id = setTimeout(() => setStillWorking(true), 60_000);
    return () => clearTimeout(id);
  }, [progress.active]);

  async function uploadFile(
    file: File,
    documentType: "denial_letter" | "chart_notes",
  ): Promise<UploadResult> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("document_type", documentType);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(humanizeUploadError(data, res.status));
    }
    return res.json();
  }

  async function onDenialFile(file: File) {
    setDenialError(null);
    setDenialUploading(true);
    try {
      const result = await uploadFile(file, "denial_letter");
      setDenialUpload(result);
      if (result.extracted_text && !denialText) {
        setDenialText(result.extracted_text);
      }
    } catch (err) {
      setDenialError((err as Error).message);
    } finally {
      setDenialUploading(false);
    }
  }

  async function onChartFile(file: File) {
    setChartError(null);
    setChartUploading(true);
    try {
      const result = await uploadFile(file, "chart_notes");
      setChartUpload(result);
      if (result.extracted_text && !chartText) {
        setChartText(result.extracted_text);
      }
    } catch (err) {
      setChartError((err as Error).message);
    } finally {
      setChartUploading(false);
    }
  }

  async function generate() {
    setServerError(null);
    setSubmitting(true);
    setProgress({ active: true, step: 0 });

    // 180-second client-side abort. Server has matching maxDuration so
    // a genuine hang surfaces as a timeout instead of a stuck spinner.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180_000);

    try {
      const res = await fetch("/api/appeals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          denial_letter_text: denialText,
          chart_notes_text: chartText,
          denial_document_id: denialUpload?.upload_id ?? null,
          chart_notes_document_id: chartUpload?.upload_id ?? null,
        }),
        signal: controller.signal,
      });

      if (res.status === 422) {
        const data = await res.json().catch(() => ({}));
        setServerError({
          reason: data.reason ?? "Validation failed.",
          suggestion: data.suggestion,
        });
        return;
      }
      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as {
          retry_after_seconds?: number;
        };
        const minutes = data.retry_after_seconds
          ? Math.max(1, Math.ceil(data.retry_after_seconds / 60))
          : 60;
        setServerError({
          reason: `You've hit the hourly generation limit (30 appeals per hour). Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`,
          suggestion: "Need a higher limit? Email support@hioverturn.com.",
        });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError({
          reason: "Something went wrong on our side.",
          suggestion: "Try again. If it persists, contact support.",
          requestId: data.request_id,
          retry: true,
        });
        return;
      }

      const data = (await res.json()) as { appeal_id: string };
      router.push(`/app/appeals/${data.appeal_id}`);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setServerError({
          reason: "Generation timed out after 3 minutes.",
          suggestion:
            "Claude may have been slow to respond. Try again — the same inputs usually work on a retry.",
          retry: true,
        });
        return;
      }
      setServerError({
        reason: "Network error.",
        suggestion: "Check your connection and try again.",
        retry: true,
      });
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
      setProgress({ active: false, step: 0 });
    }
  }

  const canSubmit =
    !submitting &&
    denialText.trim().length >= 50 &&
    chartText.trim().length >= 100;

  return (
    <div className="mt-10 space-y-8">
      {/* STEP 1: Denial letter */}
      <Section
        n={1}
        title="Upload the denial"
        subtitle="Drag-and-drop the denial letter PDF. We'll extract the text. Up to 10MB."
      >
        <DropZone
          accept="application/pdf"
          loading={denialUploading}
          uploaded={denialUpload}
          onFile={onDenialFile}
          onClear={() => {
            setDenialUpload(null);
            setDenialText("");
          }}
          error={denialError}
        />
        {denialUpload || denialText ? (
          <div className="mt-4">
            {denialUpload &&
            !denialUpload.extracted_text &&
            !denialText.trim() ? (
              <div
                role="status"
                className="mb-2.5 rounded-md bg-amber-50 px-3.5 py-2.5 ring-1 ring-inset ring-amber-200"
              >
                <p className="text-sm font-semibold text-amber-900">
                  We couldn&apos;t read your PDF.
                </p>
                <p className="mt-0.5 text-sm text-amber-900/90">
                  This usually happens with scanned or password-protected
                  files. Paste the denial text below instead.
                </p>
              </div>
            ) : null}
            <Label htmlFor="denial-text" hint="Editable">
              {denialUpload?.extracted_text || denialText
                ? "Extracted denial-letter text"
                : "Denial-letter text"}
            </Label>
            <textarea
              id="denial-text"
              value={denialText}
              onChange={(e) => setDenialText(e.target.value)}
              rows={6}
              className="mt-1.5 block w-full rounded-md bg-white px-3.5 py-2.5 text-sm font-mono leading-relaxed text-navy-800 placeholder:text-slate-400 ring-1 ring-inset ring-navy-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Paste the denial letter text here..."
            />
          </div>
        ) : null}
      </Section>

      {/* STEP 2: Chart notes */}
      <Section
        n={2}
        title="Add the chart notes"
        subtitle="Paste the relevant clinical documentation, or upload a PDF / DOCX / TXT. Include diagnoses, exam findings, and treatment rationale."
      >
        <Label htmlFor="chart-text">Chart notes</Label>
        <textarea
          id="chart-text"
          value={chartText}
          onChange={(e) => setChartText(e.target.value)}
          rows={10}
          className="mt-1.5 block w-full rounded-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-navy-800 placeholder:text-slate-400 ring-1 ring-inset ring-navy-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="Paste relevant chart-note text here..."
        />
        <div className="mt-3">
          <DropZone
            label="Or upload a file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            loading={chartUploading}
            uploaded={chartUpload}
            onFile={onChartFile}
            onClear={() => {
              setChartUpload(null);
              if (
                chartUpload?.extracted_text &&
                chartText === chartUpload.extracted_text
              ) {
                setChartText("");
              }
            }}
            error={chartError}
            compact
          />
        </div>
      </Section>

      {/* STEP 3: Practice letterhead (display only) */}
      <Section
        n={3}
        title="Letterhead"
        subtitle="Pulled from your practice settings. Edit the practice info from /app/settings (coming soon)."
      >
        <div className="rounded-md bg-navy-50/40 px-4 py-3 ring-1 ring-inset ring-navy-100">
          <p className="text-sm font-semibold text-navy-800">
            {practiceName}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Address, phone, NPI, and TIN will be added once Settings ships
            (next phase). For now, the appeal will use the practice name only.
          </p>
        </div>
      </Section>

      {/* STEP 4: Generate */}
      <div className="border-t border-navy-100 pt-8">
        {serverError ? (
          <div
            role="alert"
            className="mb-6 rounded-md bg-accent-50 px-4 py-4 ring-1 ring-inset ring-accent-100"
          >
            <p className="text-sm font-semibold text-accent-700">
              {serverError.reason}
            </p>
            {serverError.suggestion ? (
              <p className="mt-1 text-sm text-accent-700">
                {serverError.suggestion}
              </p>
            ) : null}
            {serverError.requestId ? (
              <p className="mt-2 font-mono text-[11px] text-accent-600">
                request_id: {serverError.requestId}
              </p>
            ) : null}
            {serverError.retry ? (
              <button
                type="button"
                onClick={generate}
                disabled={submitting}
                className="mt-3 inline-flex items-center justify-center rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 disabled:opacity-60"
              >
                Retry generation
              </button>
            ) : null}
          </div>
        ) : null}

        {progress.active ? (
          <div className="mb-6 rounded-md bg-navy-800 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-accent-300" />
              <p className="text-base font-semibold">
                {PROGRESS_STEPS[progress.step]}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1">
              {PROGRESS_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full ${
                    i <= progress.step ? "bg-accent-500" : "bg-navy-600"
                  }`}
                />
              ))}
            </div>
            {stillWorking ? (
              <p className="mt-3 text-xs text-navy-200">
                Still working — Claude is producing the letter. Long denials
                with rich chart notes can take up to 90 seconds.
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={generate}
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center rounded-md bg-accent-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed sm:text-lg"
        >
          {submitting ? "Generating..." : "Generate appeal"}
        </button>
        <p className="mt-3 text-center text-xs text-slate-500">
          Typically 30–60 seconds. The page will redirect when the appeal is
          ready.
        </p>
      </div>
    </div>
  );
}

function Section({
  n,
  title,
  subtitle,
  children,
}: {
  n: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm font-bold text-accent-500">
          {String(n).padStart(2, "0")}
        </span>
        <h2 className="text-lg font-bold text-navy-800 sm:text-xl">{title}</h2>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-navy-800"
      >
        {children}
      </label>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}

function DropZone({
  label,
  accept,
  loading,
  uploaded,
  onFile,
  onClear,
  error,
  compact,
}: {
  label?: string;
  accept: string;
  loading: boolean;
  uploaded: UploadResult | null;
  onFile: (file: File) => void;
  onClear: () => void;
  error: string | null;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      {label ? (
        <p className="mb-2 text-sm font-semibold text-navy-800">{label}</p>
      ) : null}
      {uploaded ? (
        <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3.5 py-2.5 ring-1 ring-inset ring-emerald-100">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">
              {uploaded.file_name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file"
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-white text-center transition-colors ${
            compact ? "py-5" : "py-10"
          } ${
            dragging
              ? "border-accent-500 bg-accent-50/40"
              : "border-navy-200 hover:border-accent-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          {loading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-accent-500" />
              <p className="mt-2 text-sm font-medium text-navy-700">
                Uploading...
              </p>
            </>
          ) : (
            <>
              {compact ? (
                <FileUp className="h-5 w-5 text-navy-400" />
              ) : (
                <Upload className="h-7 w-7 text-navy-400" />
              )}
              <p className="mt-2 text-sm font-semibold text-navy-700">
                {compact ? "Click or drag a file" : "Drop your denial PDF here"}
              </p>
              {!compact ? (
                <p className="mt-1 text-xs text-slate-500">
                  or click to browse — PDF up to 10MB
                </p>
              ) : null}
            </>
          )}
        </div>
      )}
      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-accent-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function humanizeUploadError(data: { error?: string }, status: number): string {
  switch (data.error) {
    case "file_too_large":
      return "File is too large. Maximum upload is 10MB.";
    case "unsupported_mime_type":
      return "That file type isn't supported here.";
    case "missing_file_or_document_type":
      return "Couldn't read the upload. Try again.";
    case "unauthenticated":
      return "Your session expired. Please sign in again.";
    case "storage_failed":
    case "db_failed":
      return "Upload server error. Try again.";
    default:
      return `Upload failed (HTTP ${status}). Try again.`;
  }
}
