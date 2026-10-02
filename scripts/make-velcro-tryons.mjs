#!/usr/bin/env node
/**
 * Velcro try-on photographs for the Strap Studio.
 *
 * Nobody photographed the Velcro straps fitted to other watches, but Swatch's
 * own packshots (products/watches/<SKU>_sa200.png) already show every Velcro
 * strap on the watch it ships with — and every MoonSwatch packshot is the
 * same case, straight on, with the strap running straight up and down between
 * the lugs. So a Velcro strap on any watch is: the packshot of the watch that
 * strap comes on, with the case of the watch you are looking at laid over it.
 *
 *  1. Each packshot is brought into one frame. The newer releases are shot
 *     smaller, so each is scaled and shifted until its bezel and its strap
 *     line up with Mission to the Moon's.
 *  2. The case — everything outside the strap's band, and inside the case
 *     circle within it — comes from the watch on show; the strap above and
 *     below the case comes from the strap's own watch.
 *  3. The result is cropped to the studio's 700×1195 frame, case centred, and
 *     stored in R2 under products/velcro-tryon/<watch>/<strap>.webp, with a
 *     product_straps row pointing at it.
 *
 *   node scripts/make-velcro-tryons.mjs              # build, upload, write rows
 *   node scripts/make-velcro-tryons.mjs --dry ./out  # write files locally only
 *   … --packshots <dir>   Swatch packshots (<SKU>_sa200.png) for watches whose
 *                         shop photos are not Swatch's own (Mission to Mars)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chipOf, compose, d1, frame, loadWatches, put, unpremultiply, writePairings } from "./lib/tryon.mjs";

const dryAt = process.argv.indexOf("--dry");
const DRY = dryAt > 0 ? process.argv[dryAt + 1] || "./velcro-out" : null;
const packAt = process.argv.indexOf("--packshots");
const PACKSHOTS = packAt > 0 ? process.argv[packAt + 1] : null;

// ── Inputs ─────────────────────────────────────────────────────────────────
const products = d1(`SELECT slug, sku, photos FROM products WHERE collection_id = 'omega-swatch'`);
const straps = d1(`SELECT sku, paired_with FROM straps WHERE type = 'velcro' AND status = 'active'`);

const watches = await loadWatches(products, PACKSHOTS);

const sources = straps.filter((s) => watches.has(s.paired_with));
for (const s of straps) if (!watches.has(s.paired_with)) console.log(`– ${s.sku}: its watch (${s.paired_with}) has no usable packshot, skipped`);

if (DRY) mkdirSync(DRY, { recursive: true });

// ── Chips: one per strap, from its own watch ───────────────────────────────
const chipKey = (sku) => `products/velcro-tryon/chips/${sku}.webp`;
for (const s of sources) {
  const buf = await chipOf(unpremultiply(watches.get(s.paired_with)));
  if (DRY) writeFileSync(join(DRY, `chip-${s.sku}.webp`), buf);
  else await put(chipKey(s.sku), buf, "image/webp");
}

// ── Frames ─────────────────────────────────────────────────────────────────
const rows = [];
const jobs = [];
for (const [slug, caseWatch] of watches) {
  sources.forEach((s, i) => jobs.push({ slug, caseWatch, s, i }));
}
let done = 0;
async function worker() {
  for (let job; (job = jobs.shift()); ) {
    const { slug, caseWatch, s, i } = job;
    const raw = compose(watches.get(s.paired_with), caseWatch);
    const buf = await frame(raw);
    // One folder per watch for every try-on, all in the same framing, so the
    // re-strap plays between any two of them.
    const key = `products/tryon/${slug}/${s.sku}.webp`;
    if (DRY) writeFileSync(join(DRY, `${slug}--${s.sku}.webp`), buf);
    else await put(key, buf, "image/webp");
    rows.push({ slug, sku: s.sku, photo: `/api/media/${key}`, chip: `/api/media/${chipKey(s.sku)}`, position: 500 + i });
    if (++done % 25 === 0) console.log(`  ${done} frames`);
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
console.log(`${done} frames`);

if (DRY) process.exit(0);

// ── Pairings ───────────────────────────────────────────────────────────────
writePairings(rows, { replace: true });
console.log(`${rows.length} pairings written`);
