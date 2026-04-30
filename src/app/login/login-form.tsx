"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ErrorBanner,
  FieldLabel,
  SubmitButton,
  TextInput,
} from "@/components/auth/form-elements";
import { loginAction, type LoginResult } from "./actions";

function SubmitButtonInner() {
  const { pending } = useFormStatus();
  return <SubmitButton pending={pending}>Sign in</SubmitButton>;
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<LoginResult | null, FormData>(
    loginAction,
    null,
  );
  const error = state && "error" in state ? state.error : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <ErrorBanner message={error} />

      <input type="hidden" name="next" value={next} />

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
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <SubmitButtonInner />
    </form>
  );
}
