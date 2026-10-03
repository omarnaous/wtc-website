import { tryAll } from "@/lib/db/sql";
import { FAMILY_LABEL, MAX_PHOTOS } from "@/lib/products/constants";
import type { Availability, ColorGroup, CollectionId, Family, Palette, Product } from "@/data/types";
import { safeJson, bool } from "./json";
import { memo } from "./memo";

export { MAX_PHOTOS };

/**
 * The catalogue. D1 is the whole of it — there is no file behind this.
 *
 * Rows are mapped back to the same `Product` shape the components already
 * take, so nothing downstream knows or cares where a watch came from. That is
 * also what keeps the GitHub Pages export — which has no binding — rendering.
 */

export interface ProductRow {
  slug: string;
  sku: string;
  name: string;
  short_name: string;
  collection_id: string;
  family: string;
  family_label: string;
  year: number;
  price: number;
  compare_at: number | null;
  availability: string;
  colorway: string;
  color_group: string;
  strap_type: string;
  stock_strap_sku: string | null;
  bestseller_rank: number | null;
  tagline: string;
  description: string;
  footer_note: string;
  image_front: string;
  image_angle: string;
  image_side: string;
  photos: string | null;
  specs: string | null;
  palette: string;
  status: string;
  position: number;
}

export interface StockRow {
  on_hand: number;
  reserved: number;
  low_stock_at: number;
  track: number;
}

export type AdminProduct = Product & {
  status: "active" | "draft" | "archived";
  position: number;
  stock: { onHand: number; reserved: number; lowStockAt: number; track: boolean };
};

const FALLBACK_PALETTE: Palette = {
  case: "#8a8a8f",
  bezel: "#1b1b1f",
  dial: "#101014",
  subdial: "#2a2a30",
  strap: "#3a3a42",
};

export function rowToProduct(row: ProductRow & Partial<StockRow>): AdminProduct {
  // `photos` is the list; the three columns are what it was before there was
  // one. A row saved since the migration has the array, an older row has not,
  // and both have to answer the same question.
  const stored = safeJson<string[]>(row.photos ?? "[]", []);
  const photos = [
    ...new Set(
      (Array.isArray(stored) && stored.length
        ? stored
        : [row.image_front, row.image_angle, row.image_side]
      )
        .map((s) => String(s ?? "").trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_PHOTOS);

  const family = row.family as Family;
  return {
    slug: row.slug,
    collection: row.collection_id as CollectionId,
    sku: row.sku,
    name: row.name,
    shortName: row.short_name || row.name,
    family,
    familyLabel: row.family_label || FAMILY_LABEL[family] || "",
    year: row.year,
    price: row.price,
    compareAt: row.compare_at ?? undefined,
    availability: row.availability as Availability,
    colorway: row.colorway,
    colorGroup: row.color_group as ColorGroup,
    strapType: row.strap_type as "velcro" | "rubber",
    stockStrapSku: row.stock_strap_sku ?? undefined,
    bestsellerRank: row.bestseller_rank ?? undefined,
    tagline: row.tagline,
    description: row.description,
    footerNote: row.footer_note ?? "",
    specs: safeJson<{ label: string; value: string }[]>(row.specs ?? "[]", []).filter(
      (r) => r && typeof r.label === "string" && r.label.trim(),
    ),
    photos,
    // Kept so the rest of the site can go on asking for a front or an angle.
    // A watch with one photograph answers all three with it rather than with
    // an empty string, which would render as a broken image.
    images: {
      front: photos[0] ?? "",
      angle: photos[1] ?? photos[0] ?? "",
      side: photos[2] ?? photos[0] ?? "",
    },
    palette: { ...FALLBACK_PALETTE, ...safeJson<Partial<Palette>>(row.palette, {}) },
    status: row.status as AdminProduct["status"],
    position: row.position,
    stock: {
      onHand: row.on_hand ?? 0,
      reserved: row.reserved ?? 0,
      lowStockAt: row.low_stock_at ?? 2,
      track: bool(row.track ?? 0),
    },
  };
}

const SELECT = `
  SELECT p.*, i.on_hand, i.reserved, i.low_stock_at, i.track
    FROM products p
    LEFT JOIN inventory i ON i.product_slug = p.slug`;

/** Everything the shop sells — drafts and archived pieces excluded. */
export function listProducts(): Promise<AdminProduct[]> {
  // Every storefront page reads this; kept for half a minute per isolate.
  return memo("products", 30_000, async () => {
    const rows = await tryAll<ProductRow & StockRow>(
      `${SELECT} WHERE p.status = 'active' ORDER BY p.position, p.name`,
    );
    return rows.map(rowToProduct);
  });
}

/** Whether there is a catalogue at all — the dashboard's empty state turns on it. */
export async function hasProducts(): Promise<boolean> {
  const rows = await tryAll<{ n: number }>(`SELECT COUNT(*) AS n FROM products`);
  return (rows[0]?.n ?? 0) > 0;
}

/** Everything, whatever its status — the dashboard list. */
export async function listAllProducts(): Promise<AdminProduct[]> {
  const rows = await tryAll<ProductRow & StockRow>(`${SELECT} ORDER BY p.position, p.name`);
  return rows.map(rowToProduct);
}

export async function getProduct(slug: string): Promise<AdminProduct | null> {
  const rows = await tryAll<ProductRow & StockRow>(`${SELECT} WHERE p.slug = ?`, [slug]);
  return rows.length ? rowToProduct(rows[0]) : null;
}

export async function listBestsellers(limit = 10): Promise<AdminProduct[]> {
  const all = await listProducts();
  return all
    .filter((p) => p.bestsellerRank)
    .sort((a, b) => a.bestsellerRank! - b.bestsellerRank!)
    .slice(0, limit);
}

/**
 * Availability shown on the storefront. When stock is tracked the number on
 * the shelf wins, so nobody has to remember to flip the badge by hand.
 */
export function effectiveAvailability(p: AdminProduct): Availability {
  if (!p.stock.track) return p.availability;
  if (p.availability === "pre-order") return "pre-order";
  const free = p.stock.onHand - p.stock.reserved;
  if (free <= 0) return "sold-out";
  if (free <= p.stock.lowStockAt) return "low-stock";
  return "in-stock";
}

/** Same list, with the badge resolved — what the storefront renders. */
export async function listStorefrontProducts(): Promise<AdminProduct[]> {
  const all = await listProducts();
  return all.map((p) => ({ ...p, availability: effectiveAvailability(p) }));
}

/**
 * One watch on sale, from the same cached list every page reads — no query
 * of its own. Drafts and archived pieces are not in the list, so they are
 * not found, exactly as the page wants.
 */
export async function findStorefrontProduct(slug: string): Promise<AdminProduct | null> {
  return (await listStorefrontProducts()).find((p) => p.slug === slug) ?? null;
}

/**
 * One watch as the storefront should see it.
 *
 * `getProduct` returns the row as stored, badge included — which is right for
 * the dashboard, where that field is the thing being edited. The shop must not
 * use it directly: the stored badge is a fallback, and a watch whose last unit
 * has just sold would still read "In stock" on its own page while the
 * catalogue, which does resolve it, had already moved on.
 */
export async function getStorefrontProduct(slug: string): Promise<AdminProduct | null> {
  const p = await getProduct(slug);
  return p ? { ...p, availability: effectiveAvailability(p) } : null;
}
