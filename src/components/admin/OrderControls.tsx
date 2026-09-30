"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addNote, changePayment, changeStatus, type State } from "@/app/admin/(dash)/orders/actions";
import { Button, Card, INPUT, Notice, cx } from "./ui";
import { ORDER_STATUSES } from "@/lib/orders/constants";

function Pending({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button tone="primary" type="submit" disabled={pending}>
      {pending ? "Saving…" : children}
    </Button>
  );
}

/**
 * Status, payment and notes. Each is its own form so one failing does not
 * discard what was typed into the others.
 */
export default function OrderControls({
  id,
  status,
  payment,
  stockApplied,
}: {
  id: string;
  status: string;
  payment: string;
  stockApplied: number;
}) {
  const [statusState, statusAction] = useActionState<State, FormData>(changeStatus, {});
  const [payState, payAction] = useActionState<State, FormData>(changePayment, {});
  const [noteState, noteAction] = useActionState<State, FormData>(addNote, {});

  const held =
    stockApplied === 2
      ? "Stock has been taken off the shelf for this order."
      : stockApplied === 1
        ? "Stock is held for this order and off the count."
        : "No stock is held for this order.";

  return (
    <div className="space-y-4">
      <Card title="Status" description={held}>
        {statusState.error && (
          <div className="mb-3">
            <Notice tone="error">{statusState.error}</Notice>
          </div>
        )}
        <form action={statusAction}>
          <input type="hidden" name="id" value={id} />
          <div className="flex flex-wrap gap-1.5">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s.value}
                type="submit"
                name="status"
                value={s.value}
                aria-current={status === s.value}
                className={cx(
                  "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  status === s.value
                    ? "border-transparent bg-[var(--admin-text)] text-white"
                    : "border-[var(--admin-line)] bg-white hover:bg-[var(--admin-line-soft)]",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--admin-mute)]">
          Pending, confirmed and packed reserve the stock — so a piece someone has ordered stops
          being sellable straight away. Shipped and delivered take it off the shelf. Cancelled and
          refunded put it all back.
        </p>
      </Card>

      <Card title="Payment">
        {payState.error && (
          <div className="mb-3">
            <Notice tone="error">{payState.error}</Notice>
          </div>
        )}
        <form action={payAction} className="flex flex-wrap gap-1.5">
          <input type="hidden" name="id" value={id} />
          {["unpaid", "paid", "refunded"].map((p) => (
            <button
              key={p}
              type="submit"
              name="payment"
              value={p}
              className={cx(
                "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors",
                payment === p
                  ? "border-transparent bg-[var(--admin-text)] text-white"
                  : "border-[var(--admin-line)] bg-white hover:bg-[var(--admin-line-soft)]",
              )}
            >
              {p}
            </button>
          ))}
        </form>
      </Card>

      <Card title="Add a note" description="Kept on the order's timeline for whoever picks it up next.">
        {noteState.error && (
          <div className="mb-3">
            <Notice tone="error">{noteState.error}</Notice>
          </div>
        )}
        <form action={noteAction} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <textarea
            name="message"
            rows={3}
            placeholder="Customer asked to deliver after 6pm…"
            className={cx(INPUT, "resize-y")}
          />
          <Pending>Add note</Pending>
        </form>
      </Card>
    </div>
  );
}
