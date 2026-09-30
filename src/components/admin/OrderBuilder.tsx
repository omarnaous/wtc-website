"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { recordOrder, type State } from "@/app/admin/(dash)/orders/actions";
import { Button, Card, INPUT, Label, Notice, cx, money } from "./ui";

export interface Sellable {
  kind: "watch" | "strap";
  ref: string;
  name: string;
  detail: string;
  price: number;
  image: string;
  free: number | null;
}

interface Line extends Sellable {
  qty: number;
  unitPrice: number;
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button tone="primary" type="submit" disabled={pending}>
      {pending ? "Recording…" : "Record the order"}
    </Button>
  );
}

/**
 * Recording an order taken over WhatsApp, Instagram or across the counter, so
 * the stock and the figures include it.
 */
export default function OrderBuilder({ catalogue }: { catalogue: Sellable[] }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [query, setQuery] = useState("");
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [state, action] = useActionState<State, FormData>(recordOrder, {});

  const chosen = new Set(lines.map((l) => `${l.kind}:${l.ref}`));
  const matches = useMemo(
    () =>
      query
        ? catalogue
            .filter((s) => !chosen.has(`${s.kind}:${s.ref}`))
            .filter((s) => `${s.name} ${s.ref}`.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, catalogue, lines],
  );

  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
  const total = Math.max(0, subtotal + shipping - discount);

  const payload = JSON.stringify(
    lines.map((l) => ({
      kind: l.kind,
      ref: l.ref,
      name: l.name,
      image: l.image,
      unit_price: l.unitPrice,
      qty: l.qty,
    })),
  );

  const patch = (ref: string, kind: string, p: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.ref === ref && l.kind === kind ? { ...l, ...p } : l)));

  return (
    <form action={action} className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <input type="hidden" name="items" value={payload} />
      <input type="hidden" name="shipping" value={shipping} />
      <input type="hidden" name="discount" value={discount} />

      <div className="space-y-4">
        {state.error && <Notice tone="error">{state.error}</Notice>}

        <Card title="What they bought">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a watch or a strap…"
              aria-label="Search the catalogue"
              className={INPUT}
            />
            {matches.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-[280px] w-full overflow-y-auto rounded-lg border border-[var(--admin-line)] bg-white p-1 shadow-lg">
                {matches.map((s) => (
                  <li key={`${s.kind}:${s.ref}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setLines((prev) => [...prev, { ...s, qty: 1, unitPrice: s.price }]);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-[var(--admin-line-soft)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--admin-line)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {s.image && <img src={s.image} alt="" className="h-full w-full object-contain" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{s.name}</span>
                        <span className="block truncate text-[11.5px] text-[var(--admin-mute)]">
                          {s.detail}
                          {s.free != null && ` · ${s.free} free`}
                        </span>
                      </span>
                      <span className="tnum text-[12.5px]">{money(s.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {lines.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-[var(--admin-line)] px-4 py-8 text-center text-[13px] text-[var(--admin-mute)]">
              Nothing on this order yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {lines.map((l) => (
                <li
                  key={`${l.kind}:${l.ref}`}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--admin-line)] p-2.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--admin-line)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.image && <img src={l.image} alt="" className="h-full w-full object-contain p-0.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{l.name}</span>
                    <span className="block truncate text-[11.5px] text-[var(--admin-mute)]">
                      {l.detail}
                      {l.free != null && l.qty > l.free && (
                        <span className="text-amber-600"> · only {l.free} in stock</span>
                      )}
                    </span>
                  </span>
                  <label className="flex items-center gap-1.5 text-[11.5px] text-[var(--admin-mute)]">
                    $
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={l.unitPrice}
                      aria-label={`Unit price for ${l.name}`}
                      onChange={(e) => patch(l.ref, l.kind, { unitPrice: Number(e.target.value) || 0 })}
                      className="tnum w-20 rounded-md border border-[var(--admin-line)] px-2 py-1 text-right"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-[11.5px] text-[var(--admin-mute)]">
                    ×
                    <input
                      type="number"
                      min={1}
                      value={l.qty}
                      aria-label={`Quantity of ${l.name}`}
                      onChange={(e) =>
                        patch(l.ref, l.kind, { qty: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="tnum w-14 rounded-md border border-[var(--admin-line)] px-2 py-1 text-right"
                    />
                  </label>
                  <button
                    type="button"
                    aria-label={`Remove ${l.name}`}
                    onClick={() =>
                      setLines((prev) => prev.filter((x) => !(x.ref === l.ref && x.kind === l.kind)))
                    }
                    className="rounded-md px-1.5 py-1 text-[var(--admin-mute-2)] hover:bg-red-50 hover:text-red-600"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Customer">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customer_name">Name</Label>
              <input id="customer_name" name="customer_name" required className={INPUT} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <input id="phone" name="phone" required className={cx(INPUT, "tnum")} placeholder="+961 …" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email" help="Optional.">
                Email
              </Label>
              <input id="email" name="email" type="email" className={INPUT} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address_line">Address</Label>
              <input id="address_line" name="address_line" className={INPUT} />
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <input id="area" name="area" className={INPUT} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <input id="city" name="city" className={INPUT} defaultValue="Beirut" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="note" help="Only you see this.">
                Note
              </Label>
              <textarea id="note" name="note" rows={2} className={cx(INPUT, "resize-y")} />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card title="Total">
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[var(--admin-mute)]">Subtotal</span>
              <span className="tnum">{money(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--admin-mute)]">Delivery</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={shipping}
                aria-label="Delivery charge"
                onChange={(e) => setShipping(Number(e.target.value) || 0)}
                className="tnum w-24 rounded-md border border-[var(--admin-line)] px-2 py-1 text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--admin-mute)]">Discount</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={discount}
                aria-label="Discount"
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="tnum w-24 rounded-md border border-[var(--admin-line)] px-2 py-1 text-right"
              />
            </div>
            <div className="flex justify-between border-t border-[var(--admin-line-soft)] pt-3 text-[15px] font-semibold">
              <span>Total</span>
              <span className="tnum">{money(total)}</span>
            </div>
          </div>
        </Card>

        <Card title="How it came in">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="channel">Channel</Label>
              <select id="channel" name="channel" className={cx(INPUT, "pr-8")} defaultValue="whatsapp">
                <option value="website">Website</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="walk-in">Walk-in</option>
              </select>
            </div>
            <div>
              <Label htmlFor="payment_method">Payment method</Label>
              <select id="payment_method" name="payment_method" className={cx(INPUT, "pr-8")}>
                <option value="cash-on-delivery">Cash on delivery</option>
                <option value="cash">Cash</option>
                <option value="bank-transfer">Bank transfer</option>
                <option value="whish">Whish</option>
                <option value="omt">OMT</option>
              </select>
            </div>
            <div>
              <Label htmlFor="payment_status">Paid?</Label>
              <select id="payment_status" name="payment_status" className={cx(INPUT, "pr-8")}>
                <option value="unpaid">Not yet</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status" help="Pending and later reserve or move stock.">
                Status
              </Label>
              <select id="status" name="status" className={cx(INPUT, "pr-8")} defaultValue="confirmed">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <Submit />
          </div>
        </Card>
      </div>
    </form>
  );
}
