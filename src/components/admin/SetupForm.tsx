"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createFirstOwner, type FormState } from "@/app/admin/auth-actions";
import { Button, INPUT, Label, Notice } from "./ui";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button tone="primary" type="submit" disabled={pending} className="w-full">
      {pending ? "Creating…" : "Create the owner account"}
    </Button>
  );
}

export default function SetupForm({ token }: { token?: string }) {
  const [state, action] = useActionState<FormState, FormData>(createFirstOwner, {});

  return (
    <form action={action} className="space-y-4">
      {/* Re-checked on the server: the action is callable without the page. */}
      {token && <input type="hidden" name="token" value={token} />}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <div>
        <Label htmlFor="name">Your name</Label>
        <input id="name" name="name" required className={INPUT} placeholder="Omar" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={INPUT}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password" help="At least 10 characters, with a number.">
          Password
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
