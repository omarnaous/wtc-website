/**
 * The cart, and what the server is willing to say about it.
 *
 * A stored line is only a reference and a quantity. Names, prices and stock
 * are never kept in the browser: they are resolved against D1 every time the
 * cart is shown and again when the order is placed, so a stale tab or an
 * edited localStorage entry cannot buy a watch at yesterday's price.
 */

export type LineKind = "watch" | "strap";

export interface CartLine {
  kind: LineKind;
  ref: string;
  qty: number;
}

/** One line, priced and checked by the server. */
export interface ResolvedLine extends CartLine {
  name: string;
  image: string;
  price: number;
  href: string;
  /** Null when the item is not stock-tracked. */
  available: number | null;
  /** Reduced to what is actually on the shelf, or 0 if it has gone. */
  sellable: number;
  problem?: string;
}

export interface CartTotals {
  subtotal: number;
  delivery: number;
  total: number;
  /** How much more to spend for free delivery, when that is on. */
  freeDeliveryAt: number | null;
  items: number;
}

export interface ResolvedCart {
  lines: ResolvedLine[];
  totals: CartTotals;
  /** True when anything had to be trimmed or dropped. */
  adjusted: boolean;
}

export const MAX_QTY = 10;

export function sameLine(a: CartLine, b: Pick<CartLine, "kind" | "ref">) {
  return a.kind === b.kind && a.ref === b.ref;
}

/** Discards anything that is not a well-formed line. */
export function parseLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const out: CartLine[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const { kind, ref, qty } = raw as Record<string, unknown>;
    if (kind !== "watch" && kind !== "strap") continue;
    if (typeof ref !== "string" || !ref) continue;
    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n < 1) continue;
    if (out.some((l) => sameLine(l, { kind, ref }))) continue;
    out.push({ kind, ref, qty: Math.min(MAX_QTY, n) });
  }
  return out.slice(0, 20);
}
