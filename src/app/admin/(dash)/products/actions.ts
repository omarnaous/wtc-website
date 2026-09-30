"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { batch, first, run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";
import { slugify } from "@/lib/slug";
import { MAX_PHOTOS } from "@/lib/products/constants";

export interface State {
  error?: string;
  ok?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const numOr = (d: FormData, k: string, fallback: number) => {
  const raw = text(d, k);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};
const optNum = (d: FormData, k: string) => {
  const raw = text(d, k);
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};
const on = (d: FormData, k: string) => (String(d.get(k) ?? "") === "1" ? 1 : 0);

async function guard() {
  const me = await currentUser();
  if (!me) return { me: null, error: "Session expired." as const };
  if (me.role === "staff") return { me, error: "You do not have access to the catalogue." as const };
  return { me, error: null };
}

/**
 * The photographs, in order, as the form submitted them.
 *
 * Blank slots are dropped rather than stored, so a list edited down to two
 * does not keep a third empty string that would render as a broken image.
 */
function photosFrom(data: FormData): string[] {
  const out: string[] = [];
  for (let i = 0; i < MAX_PHOTOS; i++) {
    const v = text(data, `photo${i}`);
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

/** The specification rows, as the ListField submitted them. */
function specsFrom(data: FormData): { label: string; value: string }[] {
  const count = Math.min(40, Number(data.get("specs__count") ?? 0) || 0);
  const rows: { label: string; value: string }[] = [];
  for (let i = 0; i < count; i++) {
    const label = text(data, `specs.${i}.label`);
    const value = text(data, `specs.${i}.value`);
    if (label || value) rows.push({ label, value });
  }
  return rows;
}

function fieldsFrom(data: FormData) {
  const photos = photosFrom(data);
  return {
    photos: JSON.stringify(photos),
    specs: JSON.stringify(specsFrom(data)),
    // Still written: the cart reads image_front straight off the table, and
    // anything querying by hand keeps working.
    image_front: photos[0] ?? "",
    image_angle: photos[1] ?? photos[0] ?? "",
    image_side: photos[2] ?? photos[0] ?? "",
    sku: text(data, "sku"),
    name: text(data, "name"),
    short_name: text(data, "shortName") || text(data, "name"),
    // Empty is "unfiled" and a real choice, so it is kept rather than defaulted
    // back into a collection the moment the watch is saved.
    collection_id: text(data, "collection"),
    family: text(data, "family") || "classics",
    family_label: text(data, "familyLabel"),
    year: numOr(data, "year", new Date().getFullYear()),
    price: Math.max(0, numOr(data, "price", 0)),
    compare_at: optNum(data, "compareAt"),
    availability: text(data, "availability") || "in-stock",
    colorway: text(data, "colorway"),
    color_group: text(data, "colorGroup") || "grey",
    strap_type: text(data, "strapType") || "velcro",
    stock_strap_sku: text(data, "stockStrapSku") || null,
    bestseller_rank: optNum(data, "bestsellerRank"),
    tagline: text(data, "tagline"),
    description: text(data, "description"),
    footer_note: text(data, "footerNote"),
    palette: JSON.stringify({
      case: text(data, "paletteCase") || "#8a8a8f",
      bezel: text(data, "paletteBezel") || "#1b1b1f",
      dial: text(data, "paletteDial") || "#101014",
      subdial: text(data, "paletteSubdial") || "#2a2a30",
      strap: text(data, "paletteStrap") || "#3a3a42",
    }),
    status: text(data, "status") || "active",
    position: numOr(data, "position", 0),
  };
}

export async function saveProduct(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const slug = text(data, "__slug");
  if (!slug) return { error: "Missing product." };
  const f = fieldsFrom(data);
  if (!f.name) return { error: "A watch needs a name." };

  await run(
    `UPDATE products SET
       sku = ?, name = ?, short_name = ?, collection_id = ?, family = ?, family_label = ?,
       year = ?, price = ?, compare_at = ?, availability = ?, colorway = ?, color_group = ?,
       strap_type = ?, stock_strap_sku = ?, bestseller_rank = ?, tagline = ?, description = ?,
       footer_note = ?, specs = ?, photos = ?, image_front = ?, image_angle = ?,
       image_side = ?, palette = ?, status = ?, position = ?, updated_at = datetime('now')
     WHERE slug = ?`,
    f.sku, f.name, f.short_name, f.collection_id, f.family, f.family_label, f.year, f.price,
    f.compare_at, f.availability, f.colorway, f.color_group, f.strap_type, f.stock_strap_sku,
    f.bestseller_rank, f.tagline, f.description, f.footer_note, f.specs, f.photos,
    f.image_front, f.image_angle, f.image_side, f.palette, f.status, f.position, slug,
  );

  // Stock is not on this form any more — it is a column on the Watches list,
  // where it sits beside every other watch and orders move it. Touching the
  // inventory row from here would mean a form that does not ask about stock
  // could still overwrite it with a zero.

  await logAudit(me, "update", "product", slug, `Edited ${f.name}.`);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/products/${slug}`);
  return { ok: "Saved." };
}

export async function createProduct(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const f = fieldsFrom(data);
  if (!f.name) return { error: "A watch needs a name." };
  const slug = slugify(text(data, "slug") || f.name);
  if (!slug) return { error: "That name does not make a usable web address." };

  const clash = await first<{ slug: string }>(`SELECT slug FROM products WHERE slug = ?`, slug);
  if (clash) return { error: `A watch already lives at /products/${slug}.` };

  await run(
    `INSERT INTO products
       (slug, sku, name, short_name, collection_id, family, family_label, year, price, compare_at,
        availability, colorway, color_group, strap_type, stock_strap_sku, bestseller_rank,
        tagline, description, footer_note, specs, photos, image_front, image_angle,
        image_side, palette, status, position)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    slug, f.sku, f.name, f.short_name, f.collection_id, f.family, f.family_label, f.year, f.price,
    f.compare_at, f.availability, f.colorway, f.color_group, f.strap_type, f.stock_strap_sku,
    f.bestseller_rank, f.tagline, f.description, f.footer_note, f.specs, f.photos,
    f.image_front, f.image_angle, f.image_side, f.palette, f.status, f.position,
  );
  // Starts uncounted with nothing on the shelf; the number is filled in on the
  // Watches list, which is where stock is kept.
  await run(
    `INSERT INTO inventory (product_slug, on_hand, low_stock_at, track) VALUES (?, 0, 2, 0)`,
    slug,
  );

  await logAudit(me, "create", "product", slug, `Added ${f.name}.`);
  revalidatePath("/", "layout");
  redirect(`/admin/products/${slug}`);
}

export async function deleteProduct(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };
  const slug = text(data, "__slug");

  const sold = await first<{ n: number }>(
    `SELECT COUNT(*) AS n FROM order_items WHERE kind = 'watch' AND ref = ?`,
    slug,
  );
  if ((sold?.n ?? 0) > 0) {
    // Deleting would rewrite history on orders that reference it.
    return {
      error: `${slug} appears on ${sold!.n} order line(s). Archive it instead — it stays out of the shop but the orders keep reading correctly.`,
    };
  }

  await run(`DELETE FROM products WHERE slug = ?`, slug);
  await logAudit(me, "delete", "product", slug, `Deleted ${slug}.`);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

/** Bulk status change from the list — archive or restore several at once. */
export async function bulkStatus(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const status = text(data, "status");
  const slugs = data.getAll("slug").map(String).filter(Boolean);
  if (!slugs.length) return { error: "Nothing selected." };
  if (!["active", "draft", "archived"].includes(status)) return { error: "Unknown status." };

  await batch(
    slugs.map((slug) => ({
      sql: `UPDATE products SET status = ?, updated_at = datetime('now') WHERE slug = ?`,
      params: [status, slug],
    })),
  );
  await logAudit(me, "update", "product", null, `Set ${slugs.length} watch(es) to ${status}.`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  return { ok: `${slugs.length} watch(es) set to ${status}.` };
}

/** Replaces the strap list offered on one watch. */
export async function saveProductStraps(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const slug = text(data, "__slug");
  if (!slug) return { error: "Missing product." };

  let rows: { sku: string; photo?: string; chip?: string; price?: number | null }[];
  try {
    rows = JSON.parse(String(data.get("straps") ?? "[]"));
  } catch {
    return { error: "Could not read the strap list." };
  }

  const defaultSku = text(data, "defaultStrap");

  const statements = [
    { sql: `DELETE FROM product_straps WHERE product_slug = ?`, params: [slug] },
    ...rows.map((row, i) => ({
      sql: `INSERT INTO product_straps
              (product_slug, strap_sku, position, is_default, price_override, photo, chip)
            VALUES (?,?,?,?,?,?,?)`,
      params: [
        slug,
        row.sku,
        i,
        row.sku === defaultSku ? 1 : 0,
        row.price ?? null,
        row.photo || null,
        row.chip || null,
      ],
    })),
  ];

  await batch(statements);
  await logAudit(me, "update", "product_straps", slug, `Set ${rows.length} strap(s) on ${slug}.`);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/products/${slug}`);
  return { ok: `${rows.length} strap(s) saved.` };
}
