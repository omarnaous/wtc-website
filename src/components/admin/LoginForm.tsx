"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type FormState } from "@/app/admin/auth-actions";
import { Button, INPUT, Label, Notice } from "./ui";

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button tone="primary" type="submit" disabled={pending} className="w-full">
      {pending ? "One moment…" : children}
    </Button>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState<FormState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="error">{state.error}</Notice>}
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
        <Label htmlFor="password">Password</Label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT}
        />
      </div>
      <Submit>Sign in</Submit>
    </form>
  );
}
