"use client";

import { type InputHTMLAttributes } from "react";

export function FieldLabel({
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

export function TextInput(
  props: InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
  },
) {
  const { invalid, className = "", ...rest } = props;
  const ring = invalid
    ? "ring-accent-300 focus:ring-accent-500"
    : "ring-navy-100 focus:ring-accent-500";
  return (
    <input
      {...rest}
      className={`mt-1.5 block w-full rounded-md bg-white px-3.5 py-2.5 text-base text-navy-800 placeholder:text-slate-400 ring-1 ring-inset ${ring} focus:outline-none focus:ring-2 ${className}`}
    />
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-md bg-accent-50 px-3.5 py-3 ring-1 ring-inset ring-accent-100"
    >
      <p className="text-sm font-medium text-accent-700">{message}</p>
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-md bg-accent-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? "Working..." : children}
    </button>
  );
}
