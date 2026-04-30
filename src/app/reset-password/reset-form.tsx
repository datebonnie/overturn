"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ErrorBanner,
  FieldLabel,
  SubmitButton,
  TextInput,
} from "@/components/auth/form-elements";
import { resetPasswordAction, type ResetResult } from "./actions";

function SubmitButtonInner() {
  const { pending } = useFormStatus();
  return <SubmitButton pending={pending}>Set new password</SubmitButton>;
}

export function ResetForm() {
  const [state, formAction] = useActionState<ResetResult | null, FormData>(
    resetPasswordAction,
    null,
  );
  const error = state && "error" in state ? state.error : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <ErrorBanner message={error} />

      <div>
        <FieldLabel htmlFor="password" hint="12+ characters, letter + number">
          New password
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

      <div>
        <FieldLabel htmlFor="confirm_password">Confirm new password</FieldLabel>
        <TextInput
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </div>

      <SubmitButtonInner />
    </form>
  );
}
