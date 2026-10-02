"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrder, type CheckoutResult } from "@/app/(site)/checkout/actions";
import { useCart } from "@/lib/cart/CartContext";
import type { ResolvedCart } from "@/lib/cart/types";
import { cx, usd } from "@/lib/format";
import { thumb } from "@/lib/thumb";

const FIELD =
  "w-full rounded-xl border border-line bg-surface/60 px-4 py-3 text-sm text-chalk outline-none transition-colors placeholder:text-mute-2 focus:border-mute-2";

function Submit({ label, disabled }: { label: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-full bg-chalk py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-mute-2"
    >
      {pending ? "Placing your order…" : label}
    </button>
  );
}

function Field({
  name,
  label,
  hint,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  hint?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[12px] text-mute">
        {label}
        {!required && <span className="text-mute-2"> · optional</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={FIELD}
      />
      {hint && <p className="mt-1 text-[11px] text-mute-2">{hint}</p>}
    </div>
  );
}

/**
 * Checkout.
 *
 * The bag lives in the browser, so this has to be a client component; the
 * prices it shows are fetched from the server on mount and re-checked inside
 * the action before anything is written. Nothing here is authoritative.
 */
export default function CheckoutForm({
  copy,
  whatsapp,
}: {
  copy: Record<string, string>;
  whatsapp: string;
}) {
  const { lines, clear, ready } = useCart();
  const router = useRouter();
  const [cart, setCart] = useState<ResolvedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, action] = useActionState<CheckoutResult, FormData>(placeOrder, {});

  const resolve = useCallback(async () => {
    if (!lines.length) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      setCart(res.ok ? ((await res.json()) as ResolvedCart) : null);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [lines]);

  useEffect(() => {
    if (ready) void resolve();
  }, [ready, resolve]);

  // The order is placed; empty the bag and show the receipt.
  useEffect(() => {
    if (!state.orderId) return;
    clear();
    router.push(`/order/${state.orderId}`);
  }, [state.orderId, clear, router]);

  if (!ready || loading) {
    return <p className="py-20 text-center text-sm text-mute">Loading your bag…</p>;
  }

  if (!lines.length || !cart || cart.totals.items === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">{copy.emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-mute">{copy.emptyCopy}</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full border border-line px-6 py-3 text-[12px] text-chalk transition-colors hover:border-gold hover:text-gold"
        >
          {copy.emptyCta}
        </Link>
      </div>
    );
  }

  const unavailable = cart.lines.filter((l) => l.problem);

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      <div className="min-w-0 space-y-8">
        {/* On a phone the summary sits below the whole form, so it is
            repeated at the top — always open, so what is being ordered is
            in view the whole time the form is being filled in. Desktop
            keeps the column beside the form. */}
        <div className="rounded-2xl border border-line bg-surface/40 lg:hidden">
          <div className="flex min-h-14 items-center justify-between gap-3 px-5">
            <span className="flex items-center gap-2 text-[13px] text-mute">
              {copy.summaryHeading}
              <span className="text-mute-2">
                · {cart.totals.items} item{cart.totals.items === 1 ? "" : "s"}
              </span>
            </span>
            <span className="font-display text-base font-semibold tabular-nums">
              {usd(cart.totals.total)}
            </span>
          </div>
          <ul className="space-y-3 border-t border-line px-5 py-4">
            {cart.lines.map((l) => (
              <li key={`m-${l.kind}:${l.ref}`} className="flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                  {l.image && (
                    <Image src={thumb(l.image)} alt="" fill sizes="48px" className="object-contain p-1" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{l.name}</span>
                  <span className="text-[12px] text-mute-2">
                    {l.kind === "watch" ? "Watch" : "Strap"} · {l.sellable} × {usd(l.price)}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] tabular-nums">{usd(l.price * l.sellable)}</span>
              </li>
            ))}
          </ul>
        </div>

        {state.error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4 text-[13px] leading-relaxed text-red-300">
            {state.error}
            {/* The bag was re-priced by the action; show the new numbers. */}
            <button
              type="button"
              onClick={() => void resolve()}
              className="mt-2 block text-[12px] text-red-200 underline underline-offset-2"
            >
              Refresh my bag
            </button>
          </div>
        )}

        {unavailable.length > 0 && (
          <div className="rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4 text-[13px] leading-relaxed text-gold-soft">
            Stock has moved since you added these:
            <ul className="mt-1.5 list-disc pl-4">
              {unavailable.map((l) => (
                <li key={`${l.kind}:${l.ref}`}>
                  {l.name} — {l.problem}
                </li>
              ))}
            </ul>
          </div>
        )}

        <section>
          <h2 className="font-display text-sm font-semibold tracking-tight">{copy.detailsHeading}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field name="name" label="Full name" required autoComplete="name" />
            </div>
            <Field
              name="phone"
              label="Phone"
              required
              placeholder="03 123 456"
              autoComplete="tel"
              hint="How we confirm the order and arrange delivery."
            />
            <Field
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              hint="Your order confirmation is sent here."
            />
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm font-semibold tracking-tight">{copy.addressHeading}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                name="address"
                label="Street, building, floor"
                required
                autoComplete="street-address"
              />
            </div>
            <Field name="city" label="City" required placeholder="Beirut" autoComplete="address-level2" />
            <Field name="area" label="Area" placeholder="Achrafieh" autoComplete="address-level3" />
            <div className="sm:col-span-2">
              <label htmlFor="note" className="mb-1.5 block text-[12px] text-mute">
                Anything we should know<span className="text-mute-2"> · optional</span>
              </label>
              <textarea id="note" name="note" rows={3} className={cx(FIELD, "resize-y")} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-sm font-semibold tracking-tight">{copy.paymentHeading}</h2>
          <div className="mt-4 rounded-2xl border border-line bg-surface/40 px-5 py-4">
            <p className="text-[13px] font-medium">{copy.paymentMethod}</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-mute">{copy.paymentCopy}</p>
          </div>
        </section>
      </div>

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-surface/40 p-6">
          <h2 className="font-display text-sm font-semibold tracking-tight">{copy.summaryHeading}</h2>

          <ul className="mt-5 space-y-4">
            {cart.lines.map((l) => (
              <li key={`${l.kind}:${l.ref}`} className="flex gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                  {l.image && (
                    <Image src={thumb(l.image)} alt="" fill sizes="56px" className="object-contain p-1" />
                  )}
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[11px] text-chalk ring-1 ring-line">
                    {l.sellable}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{l.name}</span>
                  <span className="text-[11px] text-mute-2">
                    {l.kind === "watch" ? "Watch" : "Strap"}
                  </span>
                </span>
                <span className="shrink-0 text-[13px]">{usd(l.price * l.sellable)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd>{usd(cart.totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Delivery</dt>
              <dd>{cart.totals.delivery === 0 ? "Free" : usd(cart.totals.delivery)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-sm">Total</dt>
              <dd className="font-display text-xl font-semibold">{usd(cart.totals.total)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <Submit label={copy.submitLabel} disabled={cart.totals.items === 0} />
          </div>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-mute-2">
            {copy.reassurance}
          </p>

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-center text-[12px] text-mute transition-colors hover:text-gold"
            >
              Rather order on WhatsApp?
            </a>
          )}
        </div>
      </aside>
    </form>
  );
}
