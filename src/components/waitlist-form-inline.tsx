"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { content } from "@/lib/content";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistFormInline() {
  const { placeholder, button, footnote, success } = content.finalCta;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setError("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "final-cta" }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-3 rounded-lg bg-white/10 px-5 py-4 ring-1 ring-inset ring-white/20"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-300" />
        <p className="text-base font-semibold text-white">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Join the waitlist">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="waitlist-email" className="sr-only">
          Work email
        </label>
        <input
          id="waitlist-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setError(null);
            }
          }}
          placeholder={placeholder}
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "waitlist-error" : undefined}
          className="flex-1 rounded-md bg-white px-4 py-4 text-base text-navy-800 placeholder:text-slate-400 ring-1 ring-inset ring-white/20 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 disabled:opacity-70 disabled:cursor-not-allowed sm:text-lg"
        >
          {status === "submitting" ? "Joining…" : button}
          {status !== "submitting" ? (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          ) : null}
        </button>
      </div>
      {status === "error" && error ? (
        <p
          id="waitlist-error"
          role="alert"
          className="mt-3 text-sm font-medium text-accent-300"
        >
          {error}
        </p>
      ) : (
        <p className="mt-4 text-sm text-navy-200">{footnote}</p>
      )}
    </form>
  );
}
