"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ErrorBanner,
  FieldLabel,
  SubmitButton,
  TextInput,
} from "@/components/auth/form-elements";
import { signupAction, type SignupResult } from "./actions";

function SubmitButtonInner() {
  const { pending } = useFormStatus();
  return <SubmitButton pending={pending}>Create account</SubmitButton>;
}

export function SignupForm() {
  const [state, formAction] = useActionState<SignupResult | null, FormData>(
    signupAction,
    null,
  );
  const error = state && "error" in state ? state.error : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <ErrorBanner message={error} />

      <div>
        <FieldLabel htmlFor="practice_name">Practice name</FieldLabel>
        <TextInput
          id="practice_name"
          name="practice_name"
          type="text"
          autoComplete="organization"
          required
          placeholder="Cedar Family Medicine"
        />
      </div>

      <div>
        <FieldLabel htmlFor="full_name" hint="optional">
          Your name
        </FieldLabel>
        <TextInput
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          placeholder="Dr. Sarah Chen"
        />
      </div>

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

      <div>
        <FieldLabel htmlFor="password" hint="12+ characters, letter + number">
          Password
        </FieldLabel>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </div>

      <SubmitButtonInner />

      <p className="text-xs text-slate-500 text-center">
        14-day free trial. No credit card required. Cancel anytime.
      </p>
    </form>
  );
}
