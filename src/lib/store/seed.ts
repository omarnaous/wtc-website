import "server-only";
import { batch, first } from "@/lib/db/sql";
import { products as fileProducts } from "@/data/products";
import { straps as fileStraps } from "@/data/straps";
import { collections as fileCollections } from "@/data/collections";
import { site } from "@/data/site";
import { SECTIONS } from "@/lib/content/schema";
import photoData from "@/data/strap-photos.json";
import { SETTINGS_DEFAULTS } from "./settings";

/**
 * Loads the catalogue that ships in src/data into D1.
 *
 * Written as upserts throughout, so it can be re-run after new watches are
 * added to the design files without touching prices, stock or copy that
 * someone has since edited in the dashboard: the ON CONFLICT clauses only
 * refresh the things that come from the source photography and references.
 */

type Stmt = { sql: string; params: unknown[] };

/** D1 caps how much one batch can carry; 40 statements is comfortably under. */
async function runChunked(statements: Stmt[]) {
  for (let i = 0; i < statements.length; i += 40) {
    await batch(statements.slice(i, i + 40));
  }
}

const STRAP_PREFIX = "WB-";

interface PhotoStrap {
  id: string;
  name: string;
  color: string;
  image: string;
  chip: string;
}

export interface SeedReport {
  collections: number;
  products: number;
  straps: number;
  pairings: number;
  policies: number;
  sections: number;
}

export async function seedFromFiles(strapPrice = 49): Promise<SeedReport> {
  const sets = photoData.sets as Record<string, { source: string; straps: PhotoStrap[] }>;
  const bySlug = photoData.bySlug as Record<string, string>;

  const statements: Stmt[] = [];

  // ── Collections ──────────────────────────────────────────────────────────
  fileCollections.forEach((c, i) => {
    statements.push({
      sql: `INSERT INTO collections (id, name, blurb, hero_slug, accent, position)
            VALUES (?,?,?,?,?,?)
            ON CONFLICT(id) DO NOTHING`,
      params: [c.id, c.name, c.blurb, c.heroSlug ?? null, c.accent, i],
    });
  });

  // ── Watches ──────────────────────────────────────────────────────────────
  fileProducts.forEach((p, i) => {
    statements.push({
      sql: `INSERT INTO products
              (slug, sku, name, short_name, collection_id, family, family_label, year,
               price, compare_at, availability, colorway, color_group, strap_type,
               stock_strap_sku, bestseller_rank, tagline, description,
               image_front, image_angle, image_side, palette, position)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(slug) DO UPDATE SET
              sku = excluded.sku,
              image_front = excluded.image_front,
              image_angle = excluded.image_angle,
              image_side = excluded.image_side,
              palette = excluded.palette,
              updated_at = datetime('now')`,
      params: [
        p.slug,
        p.sku,
        p.name,
        p.shortName,
        p.collection,
        p.family,
        p.familyLabel,
        p.year,
        p.price,
        p.compareAt ?? null,
        p.availability,
        p.colorway,
        p.colorGroup,
        p.strapType,
        p.stockStrapSku ?? null,
        p.bestsellerRank ?? null,
        p.tagline,
        p.description,
        p.images.front,
        p.images.angle,
        p.images.side,
        JSON.stringify(p.palette),
        i,
      ],
    });
    statements.push({
      sql: `INSERT INTO inventory (product_slug, on_hand, low_stock_at, track)
            VALUES (?, 0, 2, 0)
            ON CONFLICT(product_slug) DO NOTHING`,
      params: [p.slug],
    });
  });

  // ── Official Swatch strap references ─────────────────────────────────────
  fileStraps.forEach((s, i) => {
    statements.push({
      sql: `INSERT INTO straps
              (sku, name, type, colorway, color_group, price, image,
               primary_color, secondary_color, paired_with, position, track)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,0)
            ON CONFLICT(sku) DO UPDATE SET
              image = excluded.image,
              primary_color = excluded.primary_color,
              secondary_color = excluded.secondary_color,
              updated_at = datetime('now')`,
      params: [
        s.sku,
        s.name,
        s.type,
        s.colorway,
        s.colorGroup,
        s.price,
        s.image,
        s.primary,
        s.secondary,
        s.pairedWith ?? null,
        i,
      ],
    });
  });

  // ── Photographed straps, and which watch each was shot on ────────────────
  // The same strap appears across many sets; it becomes one sellable row,
  // and each set contributes the photograph of it fitted to that watch.
  const seen = new Map<string, PhotoStrap>();
  const pairings: { slug: string; sku: string; photo: string; chip: string; pos: number }[] = [];

  for (const [slug, setKey] of Object.entries(bySlug)) {
    const set = sets[setKey];
    if (!set) continue;
    set.straps.forEach((s, i) => {
      const sku = STRAP_PREFIX + s.id.toUpperCase();
      if (!seen.has(sku)) seen.set(sku, s);
      pairings.push({ slug, sku, photo: s.image, chip: s.chip, pos: i });
    });
  }

  let position = fileStraps.length;
  for (const [sku, s] of seen) {
    statements.push({
      sql: `INSERT INTO straps
              (sku, name, type, colorway, color_group, price, image,
               primary_color, secondary_color, position, track, on_hand)
            VALUES (?,?,'rubber',?,?,?,?,?,?,?,0,0)
            ON CONFLICT(sku) DO UPDATE SET
              image = excluded.image,
              primary_color = excluded.primary_color,
              updated_at = datetime('now')`,
      params: [
        sku,
        s.name,
        s.name,
        colorGroupOf(s.color),
        strapPrice,
        s.chip,
        s.color,
        s.color,
        position++,
      ],
    });
  }

  for (const p of pairings) {
    statements.push({
      sql: `INSERT INTO product_straps (product_slug, strap_sku, position, is_default, photo, chip)
            VALUES (?,?,?,?,?,?)
            ON CONFLICT(product_slug, strap_sku) DO UPDATE SET
              photo = excluded.photo, chip = excluded.chip`,
      params: [p.slug, p.sku, p.pos, p.pos === 0 ? 1 : 0, p.photo, p.chip],
    });
  }

  // ── Policies ─────────────────────────────────────────────────────────────
  site.policies.forEach((p, i) => {
    statements.push({
      sql: `INSERT INTO policies (slug, title, summary, body, position)
            VALUES (?,?,?,?,?)
            ON CONFLICT(slug) DO NOTHING`,
      params: [p.slug, p.title, p.summary, JSON.stringify(p.body), i],
    });
  });

  // ── Settings and section copy ────────────────────────────────────────────
  for (const [key, value] of Object.entries(SETTINGS_DEFAULTS)) {
    statements.push({
      sql: `INSERT INTO settings (key, value) VALUES (?,?)
            ON CONFLICT(key) DO NOTHING`,
      params: [key, JSON.stringify(value)],
    });
  }
  for (const section of SECTIONS) {
    statements.push({
      sql: `INSERT INTO content_sections (key, data) VALUES (?,?)
            ON CONFLICT(key) DO NOTHING`,
      params: [section.key, JSON.stringify(section.defaults)],
    });
  }

  await runChunked(statements);

  return {
    collections: fileCollections.length,
    products: fileProducts.length,
    straps: fileStraps.length + seen.size,
    pairings: pairings.length,
    policies: site.policies.length,
    sections: SECTIONS.length,
  };
}

/** Rough bucket from the sampled hex, so colour filters work on straps too. */
function colorGroupOf(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "grey";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2 / 255;
  const sat = max === min ? 0 : (max - min) / (light > 0.5 ? 510 - max - min : max + min);

  if (light > 0.82 && sat < 0.2) return "white";
  if (light < 0.16) return "black";
  if (sat < 0.14) return "grey";

  let hue = 0;
  if (max === r) hue = ((g - b) / (max - min)) % 6;
  else if (max === g) hue = (b - r) / (max - min) + 2;
  else hue = (r - g) / (max - min) + 4;
  hue = (hue * 60 + 360) % 360;

  if (hue < 15 || hue >= 345) return "red";
  if (hue < 40) return light < 0.4 ? "brown" : "orange";
  if (hue < 65) return "yellow";
  if (hue < 170) return "green";
  if (hue < 255) return "blue";
  if (hue < 290) return "blue";
  return "pink";
}

export async function isSeeded(): Promise<boolean> {
  const row = await first<{ n: number }>(`SELECT COUNT(*) AS n FROM products`);
  return (row?.n ?? 0) > 0;
}
