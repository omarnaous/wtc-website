import { tryAll } from "@/lib/db/sql";
import type { ColorGroup } from "@/data/types";
import { bool } from "./json";

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

/**
 * The straps offered on one watch, in the order the studio shows them.
 *
 * No watch, no straps — the pairings are rows, and there is no shipped photo
 * set standing behind them any more. A watch with nothing fitted to it hides
 * the studio rather than showing someone else's straps.
 */
export async function strapsForProduct(slug: string): Promise<StrapOption[]> {
  const rows = await tryAll<{
    sku: string;
    name: string;
    color: string;
    photo: string | null;
    chip: string | null;
    image: string;
    price: number;
    override: number | null;
    on_hand: number;
    track: number;
    status: string;
  }>(
    `SELECT s.sku, s.name, s.primary_color AS color, ps.photo, ps.chip,
            s.image, s.price, ps.price_override AS override, s.on_hand, s.track, s.status
       FROM product_straps ps
       JOIN straps s ON s.sku = ps.strap_sku
      WHERE ps.product_slug = ? AND s.status = 'active'
      ORDER BY ps.is_default DESC, ps.position, s.name`,
    [slug],
  );

  // `photo` is a shot of this strap fitted to this watch, where one was taken;
  // without it the strap's own photograph stands in. Both live in R2.
  return rows.map((r) => ({
    id: r.sku,
    name: r.name,
    color: r.color,
    image: r.photo || r.image,
    chip: r.chip || r.image,
    price: r.override ?? r.price,
    soldOut: bool(r.track) && r.on_hand <= 0,
  }));
}

/** Strap options for several watches at once — the studio can swap heads. */
export async function strapSetsFor(slugs: string[]): Promise<Record<string, StrapOption[]>> {
  const out: Record<string, StrapOption[]> = {};
  for (const slug of slugs) {
    const options = await strapsForProduct(slug);
    if (options.length) out[slug] = options;
  }
  return out;
}
