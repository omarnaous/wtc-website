import { tryAll } from "@/lib/db/sql";
import { getSetting } from "./settings";
import {
  MAX_QTY,
  type CartLine,
  type ResolvedCart,
  type ResolvedLine,
} from "@/lib/cart/types";

/**
 * Prices and stock come from here, never from the browser.
 *
 * The cart in localStorage is a list of references. Everything a customer
 * sees — and everything an order is written with — is resolved against D1 by
 * this module, so the price on the invoice is the price in the catalogue at
 * the moment the order was placed.
 */

export interface Delivery {
  fee: number;
  /** Order value above which delivery is free. 0 turns that off. */
  freeOver: number;
}

export const DELIVERY_DEFAULT: Delivery = { fee: 5, freeOver: 0 };

export const getDelivery = () => getSetting<Delivery>("delivery", DELIVERY_DEFAULT);

interface WatchRow {
  slug: string;
  name: string;
  price: number;
  image_front: string;
  status: string;
  availability: string;
  on_hand: number | null;
  reserved: number | null;
  track: number | null;
}

interface StrapRow {
  sku: string;
  name: string;
  price: number;
  image: string;
  status: string;
  on_hand: number;
  track: number;
}

export async function resolveCart(lines: CartLine[]): Promise<ResolvedCart> {
  if (!lines.length) {
    return {
      lines: [],
      totals: { subtotal: 0, delivery: 0, total: 0, freeDeliveryAt: null, items: 0 },
      adjusted: false,
    };
  }

  const watchRefs = lines.filter((l) => l.kind === "watch").map((l) => l.ref);
  const strapRefs = lines.filter((l) => l.kind === "strap").map((l) => l.ref);

  const watches = watchRefs.length
    ? await tryAll<WatchRow>(
        `SELECT p.slug, p.name, p.price, p.image_front, p.status, p.availability,
                i.on_hand, i.reserved, i.track
           FROM products p
           LEFT JOIN inventory i ON i.product_slug = p.slug
          WHERE p.slug IN (${watchRefs.map(() => "?").join(",")})`,
        watchRefs,
      )
    : [];

  const straps = strapRefs.length
    ? await tryAll<StrapRow>(
        `SELECT sku, name, price, image, status, on_hand, track
           FROM straps
          WHERE sku IN (${strapRefs.map(() => "?").join(",")})`,
        strapRefs,
      )
    : [];

  const watchBy = new Map(watches.map((w) => [w.slug, w]));
  const strapBy = new Map(straps.map((s) => [s.sku, s]));

  const resolved: ResolvedLine[] = [];
  let adjusted = false;

  for (const line of lines) {
    const wanted = Math.min(MAX_QTY, Math.max(1, line.qty));

    if (line.kind === "watch") {
      const row = watchBy.get(line.ref);
      if (!row || row.status !== "active") {
        adjusted = true;
        continue;
      }
      // Pre-order pieces are sold without a stock check on purpose.
      const tracked = row.track === 1 && row.availability !== "pre-order";
      const free = tracked ? Math.max(0, (row.on_hand ?? 0) - (row.reserved ?? 0)) : null;
      const sellable = free === null ? wanted : Math.min(wanted, free);
      if (sellable !== wanted) adjusted = true;

      resolved.push({
        ...line,
        qty: wanted,
        name: row.name,
        image: row.image_front,
        price: row.price,
        href: `/products/${row.slug}`,
        available: free,
        sellable,
        problem:
          sellable === 0
            ? "Sold out"
            : sellable < wanted
              ? `Only ${sellable} left`
              : undefined,
      });
      continue;
    }

    const row = strapBy.get(line.ref);
    if (!row || row.status !== "active") {
      adjusted = true;
      continue;
    }
    const free = row.track === 1 ? Math.max(0, row.on_hand) : null;
    const sellable = free === null ? wanted : Math.min(wanted, free);
    if (sellable !== wanted) adjusted = true;

    resolved.push({
      ...line,
      qty: wanted,
      name: row.name,
      image: row.image,
      price: row.price,
      href: "/products",
      available: free,
      sellable,
      problem:
        sellable === 0 ? "Sold out" : sellable < wanted ? `Only ${sellable} left` : undefined,
    });
  }

  const delivery = await getDelivery();
  const subtotal = resolved.reduce((n, l) => n + l.price * l.sellable, 0);
  const items = resolved.reduce((n, l) => n + l.sellable, 0);
  const freeOver = delivery.freeOver > 0 ? delivery.freeOver : null;
  const charge =
    items === 0 ? 0 : freeOver !== null && subtotal >= freeOver ? 0 : delivery.fee;

  return {
    lines: resolved,
    totals: {
      subtotal,
      delivery: charge,
      total: subtotal + charge,
      freeDeliveryAt: freeOver !== null && subtotal < freeOver ? freeOver - subtotal : null,
      items,
    },
    adjusted,
  };
}
