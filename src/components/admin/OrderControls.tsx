"use client";

import { useActionState, useEffect, useState } from "react";
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
  customerName,
  customerEmail,
}: {
  id: string;
  status: string;
  payment: string;
  stockApplied: number;
  customerName: string;
  customerEmail: string | null;
}) {
  const [statusState, statusAction, statusPending] = useActionState<State, FormData>(changeStatus, {});
  // Marking an order delivered asks first whether to tell the customer.
  const [asking, setAsking] = useState(false);
  useEffect(() => {
    if (!asking) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAsking(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [asking]);
  useEffect(() => {
    if (!statusPending) setAsking(false);
  }, [statusPending]);
  const first = customerName.split(/\s+/)[0] || customerName;
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
        {statusState.ok && !statusState.error && (
          <div className="mb-3">
            <Notice tone="success">{statusState.ok}</Notice>
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
                onClick={(e) => {
                  if (s.value === "delivered" && status !== "delivered") {
                    e.preventDefault();
                    setAsking(true);
                  }
                }}
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
        {asking && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            onClick={(e) => e.target === e.currentTarget && setAsking(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="deliver-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 id="deliver-title" className="text-[16px] font-semibold">
                Mark this order delivered
              </h3>
              {customerEmail ? (
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--admin-mute)]">
                  Do you want to email {first} at <strong className="text-[var(--admin-text)]">{customerEmail}</strong>{" "}
                  that the order has been delivered, with a link to leave a review?
                </p>
              ) : (
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--admin-mute)]">
                  This order has no email address, so {first} cannot be emailed. It will just be
                  marked delivered.
                </p>
              )}
              <form action={statusAction} className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="status" value="delivered" />
                {customerEmail && (
                  <Button tone="primary" type="submit" name="notify" value="1" disabled={statusPending}>
                    {statusPending ? "Sending…" : "Yes, mark delivered & email"}
                  </Button>
                )}
                <Button type="submit" name="notify" value="0" disabled={statusPending}>
                  {customerEmail ? "Mark delivered, no email" : "Mark delivered"}
                </Button>
                <Button type="button" onClick={() => setAsking(false)} disabled={statusPending}>
                  Cancel
                </Button>
              </form>
            </div>
          </div>
        )}
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
