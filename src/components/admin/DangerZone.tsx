"use client";

import { useActionState, useState } from "react";
import { Button, Card, INPUT, Notice } from "./ui";

/**
 * Delete, behind a typed confirmation. The action is passed in so the same
 * panel serves watches, straps and anything else that can be removed.
 */
export default function DangerZone({
  action,
  label,
  confirmWord,
  hiddenName,
  hiddenValue,
  description,
}: {
  action: (state: { error?: string; ok?: string }, data: FormData) => Promise<{ error?: string; ok?: string }>;
  label: string;
  confirmWord: string;
  hiddenName: string;
  hiddenValue: string;
  description: string;
}) {
  const [state, formAction] = useActionState<{ error?: string; ok?: string }, FormData>(action, {});
  const [typed, setTyped] = useState("");

  return (
    <form action={formAction}>
      <input type="hidden" name={hiddenName} value={hiddenValue} />
      <Card title="Delete" description={description} className="border-red-200">
        {state.error && (
          <div className="mb-4">
            <Notice tone="error">{state.error}</Notice>
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="confirm-delete" className="mb-1.5 block text-[12.5px] font-medium">
              Type <code className="rounded bg-black/5 px-1">{confirmWord}</code> to confirm
            </label>
            <input
              id="confirm-delete"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className={INPUT}
              autoComplete="off"
            />
          </div>
          <Button type="submit" tone="danger" disabled={typed !== confirmWord}>
            {label}
          </Button>
        </div>
      </Card>
    </form>
  );
}
