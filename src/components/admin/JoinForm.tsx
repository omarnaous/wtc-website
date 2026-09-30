"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { acceptInvite, type JoinState } from "@/app/admin/join-actions";
import { Button, INPUT, Label, Notice } from "./ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button tone="primary" type="submit" disabled={pending} className="w-full">
      {pending ? "Creating…" : "Create my account"}
    </Button>
  );
}

export default function JoinForm({ token, email }: { token: string; email: string }) {
  const [state, action] = useActionState<JoinState, FormData>(acceptInvite, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <div>
        <Label htmlFor="name">Your name</Label>
        <input id="name" name="name" required className={INPUT} />
      </div>
      <div>
        <Label htmlFor="email-display">Email</Label>
        <input id="email-display" value={email} readOnly disabled className={INPUT} />
      </div>
      <div>
        <Label htmlFor="password" help="At least 10 characters, with a number.">
          Choose a password
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
        <Label htmlFor="confirm">Confirm password</Label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={INPUT}
        />
      </div>
      <Submit />
    </form>
  );
}
