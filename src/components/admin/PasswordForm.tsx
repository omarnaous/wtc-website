"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changeOwnPassword, type FormState } from "@/app/admin/auth-actions";
import { Button, Card, INPUT, Label, Notice } from "./ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button tone="primary" type="submit" disabled={pending}>
      {pending ? "Changing…" : "Change password"}
    </Button>
  );
}

export default function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changeOwnPassword, {});

  return (
    <form action={action}>
      <Card title="Password" description="Changing it signs you out everywhere else.">
        {state.error && (
          <div className="mb-4">
            <Notice tone="error">{state.error}</Notice>
          </div>
        )}
        {state.ok && (
          <div className="mb-4">
            <Notice tone="success">{state.ok}</Notice>
          </div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="current">Current password</Label>
            <input
              id="current"
              name="current"
              type="password"
              autoComplete="current-password"
              required
              className={INPUT}
            />
          </div>
          <div>
            <Label htmlFor="password" help="At least 10 characters, with a number.">
              New password
            </Label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={INPUT}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              className={INPUT}
            />
          </div>
          <div className="sm:col-span-2">
            <Submit />
          </div>
        </div>
      </Card>
    </form>
  );
}
