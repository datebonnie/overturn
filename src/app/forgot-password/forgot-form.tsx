"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ErrorBanner,
  FieldLabel,
  SubmitButton,
  TextInput,
} from "@/components/auth/form-elements";
import { forgotPasswordAction, type ForgotResult } from "./actions";

function SubmitButtonInner() {
  const { pending } = useFormStatus();
  return <SubmitButton pending={pending}>Send reset link</SubmitButton>;
}

export function ForgotForm() {
  const [state, formAction] = useActionState<ForgotResult | null, FormData>(
    forgotPasswordAction,
    null,
  );

  if (state && "ok" in state) {
    return (
      <div
        role="status"
        className="rounded-md bg-emerald-50 px-4 py-4 ring-1 ring-inset ring-emerald-100"
      >
        <p className="text-base font-semibold text-emerald-900">
          Check your inbox.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-800">
          If an account exists for that email, a reset link is on the way.
          The link is valid for one hour.
        </p>
      </div>
    );
  }

  const error = state && "error" in state ? state.error : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <ErrorBanner message={error} />

      <div>
        <FieldLabel htmlFor="email">Work email</FieldLabel>
        <TextInput
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@yourpractice.com"
        />
      </div>

      <SubmitButtonInner />
    </form>
  );
}
