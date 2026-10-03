import { tryAll } from "@/lib/db/sql";
import type { ColorGroup } from "@/data/types";
import { bool } from "./json";
import { thumb } from "@/lib/thumb";
import { memo } from "./memo";

/**
 * Two kinds of strap live in one table.
 *
 *  - The official Swatch references (ACSO33…), which is what a watch ships on.
 *  - The straps WTC actually sells, each photographed fitted to the watches it
 *    suits. Those pairings are `product_straps` rows, and they are what the
 *    Strap Studio cross-fades between.
 */

export interface StrapRow {
  sku: string;
  name: string;
  type: string;
  colorway: string;
  color_group: string;
  price: number;
  image: string;
  primary_color: string;
  secondary_color: string;
  paired_with: string | null;
  on_hand: number;
  low_stock_at: number;
  track: number;
  status: string;
  position: number;
}

export interface AdminStrap {
  sku: string;
  name: string;
  type: "velcro" | "rubber";
  colorway: string;
  colorGroup: ColorGroup;
  price: number;
  image: string;
  primary: string;
  secondary: string;
  pairedWith?: string;
  onHand: number;
  lowStockAt: number;
  track: boolean;
  status: "active" | "draft" | "archived";
  position: number;
  /** How many watches offer this strap in the studio. */
  fittedTo?: number;
}

/** One strap as the Strap Studio shows it, fitted to one watch. */
export interface StrapOption {
  id: string;
  name: string;
  color: string;
  image: string;
  chip: string;
  price: number;
  soldOut?: boolean;
  /** Pieces in stock; null when stock is not tracked. */
  available?: number | null;
  type?: "velcro" | "rubber";
  colorGroup?: ColorGroup;
  /**
   * In the full catalogue only: the watch the photograph shows it on, when it
   * has been photographed fitted to one. Absent means `image` is the strap's
   * own packshot.
   */
  shownOn?: string;
}

export function rowToStrap(row: StrapRow & { fitted?: number }): AdminStrap {
  return {
    sku: row.sku,
    name: row.name,
    type: row.type as "velcro" | "rubber",
    colorway: row.colorway,
    colorGroup: row.color_group as ColorGroup,
    price: row.price,
    image: row.image,
    primary: row.primary_color,
    secondary: row.secondary_color,
    pairedWith: row.paired_with ?? undefined,
    onHand: row.on_hand,
    lowStockAt: row.low_stock_at,
    track: bool(row.track),
    status: row.status as AdminStrap["status"],
    position: row.position,
    fittedTo: row.fitted,
  };
}

export async function listStraps(): Promise<AdminStrap[]> {
  const rows = await tryAll<StrapRow & { fitted: number }>(
    `SELECT s.*, (SELECT COUNT(*) FROM product_straps ps WHERE ps.strap_sku = s.sku) AS fitted
       FROM straps s ORDER BY s.position, s.name`,
  );
  return rows.map(rowToStrap);
}

export async function getStrap(sku: string): Promise<AdminStrap | null> {
  const rows = await tryAll<StrapRow>(`SELECT * FROM straps WHERE sku = ?`, [sku]);
  if (rows.length) return rowToStrap(rows[0]);
  return null;
}

interface PairRow {
  product_slug: string;
  sku: string;
  name: string;
  color: string;
  color_group: string;
  type: string;
  photo: string | null;
  chip: string | null;
  image: string;
  price: number;
  override: number | null;
  on_hand: number;
  track: number;
}

const toOption = (r: PairRow): StrapOption => ({
  id: r.sku,
  name: r.name,
  color: r.color,
  // `photo` is a shot of this strap fitted to this watch, where one was
  // taken; without it the strap's own photograph stands in. Both live in R2.
  image: r.photo || r.image,
  chip: r.chip || thumb(r.image),
  price: r.override ?? r.price,
  soldOut: bool(r.track) && r.on_hand <= 0,
  available: bool(r.track) ? Math.max(0, r.on_hand) : null,
  type: r.type as StrapOption["type"],
  colorGroup: r.color_group as ColorGroup,
});

/**
 * The straps fitted to each of several watches, in the order the studio
 * shows them. One query for the lot, kept for a minute per isolate.
 *
 * No watch, no straps — the pairings are rows. A watch with nothing fitted to
 * it hides the studio rather than showing someone else's straps.
 */
export function strapSetsFor(slugs: string[]): Promise<Record<string, StrapOption[]>> {
  const wanted = [...new Set(slugs)].filter(Boolean).sort();
  if (!wanted.length) return Promise.resolve({});
  return memo(`strap-sets:${wanted.join(",")}`, 60_000, async () => {
    const out: Record<string, StrapOption[]> = {};
    const rows = await tryAll<PairRow>(
      `SELECT ps.product_slug, s.sku, s.name, s.primary_color AS color, s.color_group, s.type,
              ps.photo, ps.chip, s.image, s.price, ps.price_override AS override,
              s.on_hand, s.track
         FROM product_straps ps
         JOIN straps s ON s.sku = ps.strap_sku
        WHERE ps.product_slug IN (${wanted.map(() => "?").join(",")}) AND s.status = 'active'
        ORDER BY ps.product_slug, ps.is_default DESC, ps.position, s.name`,
      wanted,
    );
    for (const r of rows) (out[r.product_slug] ??= []).push(toOption(r));
    return out;
  });
}

/** The straps offered on one watch. */
export async function strapsForProduct(slug: string): Promise<StrapOption[]> {
  return (await strapSetsFor([slug]))[slug] ?? [];
}

/**
 * Every strap in the shop, for the studio's "all straps" picker.
 *
 * Each carries the best photograph there is of it: on the watch it comes on
 * where there is one, then its default pairing, then any; its own packshot
 * when it has never been photographed fitted.
 *
 * One pass over the pairings, sorted out here. It used to pick the photo
 * with three correlated subqueries per strap, which read the whole pairings
 * table three times for every strap on every page view — enough, with the
 * Velcro try-ons added, to use up D1's free daily allowance in an afternoon.
 */
export function strapCatalogue(): Promise<StrapOption[]> {
  return memo("strap-catalogue", 60_000, async () => {
    const straps = await tryAll<PairRow & { position: number; paired_with: string | null }>(
      `SELECT '' AS product_slug, s.sku, s.name, s.primary_color AS color, s.color_group, s.type,
              NULL AS photo, NULL AS chip, s.image, s.price, NULL AS override, s.on_hand, s.track,
              s.position, s.paired_with
         FROM straps s
        WHERE s.status = 'active'
        ORDER BY s.position, s.name`,
    );
    if (!straps.length) return [];
    const pairs = await tryAll<{
      strap_sku: string;
      product_slug: string;
      photo: string | null;
      chip: string | null;
      is_default: number;
      position: number;
    }>(
      `SELECT strap_sku, product_slug, photo, chip, is_default, position
         FROM product_straps WHERE photo IS NOT NULL`,
    );
    const bySku = new Map<string, typeof pairs>();
    for (const p of pairs) (bySku.get(p.strap_sku) ?? bySku.set(p.strap_sku, []).get(p.strap_sku)!).push(p);

    return straps.map((s) => {
      const mine = (bySku.get(s.sku) ?? []).sort(
        (a, b) =>
          Number(b.product_slug === s.paired_with) - Number(a.product_slug === s.paired_with) ||
          b.is_default - a.is_default ||
          a.position - b.position,
      );
      const best = mine[0];
      return {
        ...toOption({ ...s, product_slug: best?.product_slug ?? "", photo: best?.photo ?? null, chip: best?.chip ?? null }),
        shownOn: best ? best.product_slug : undefined,
      };
    });
  });
}

/** Which watches have straps pictured on them — the homepage studio's watch rail. */
export function slugsWithStraps(): Promise<string[]> {
  return memo("strap-slugs", 60_000, async () => {
    const rows = await tryAll<{ product_slug: string }>(
      `SELECT DISTINCT ps.product_slug FROM product_straps ps
         JOIN straps s ON s.sku = ps.strap_sku
        WHERE ps.photo IS NOT NULL AND s.status = 'active'`,
    );
    return rows.map((r) => r.product_slug);
  });
}
