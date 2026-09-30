"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { importCatalogue, type ActionState } from "@/app/admin/(dash)/actions";
import { Button, Notice } from "./ui";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button tone="primary" type="submit" disabled={pending}>
      {pending ? "Importing…" : label}
    </Button>
  );
}

export default function ImportCatalogue({ label = "Import the catalogue" }: { label?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(async () => importCatalogue(), {});

  return (
    <form action={action} className="space-y-3">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.ok}</Notice>}
      <Submit label={label} />
    </form>
  );
}
