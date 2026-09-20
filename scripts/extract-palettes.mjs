/**
 * Samples dominant colours out of the Swatch product photography so the
 * vector watch in the Strap Studio matches each real colourway.
 *
 * Run with: npm run palette
 * Reads   : public/products/**.png
 * Writes  : src/data/palettes.json
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SIZE = 512;
const WATCH_DIR = "public/products/watches";
const STRAP_DIR = "public/products/straps";

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

async function raw(file) {
  const { data } = await sharp(file)
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}

const at = (data, x, y) => {
  const i = (y * SIZE + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};

/** Modal colour of a pixel list, quantised to 5 bits/channel then averaged. */
function dominant(pixels, { ignoreExtremes = false } = {}) {
  const buckets = new Map();
  for (const p of pixels) {
    if (p[3] < 200) continue;
    const lum = 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
    if (ignoreExtremes && (lum < 18 || lum > 240)) continue;
    const key = (p[0] >> 3) * 1024 + (p[1] >> 3) * 32 + (p[2] >> 3);
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = { n: 0, r: 0, g: 0, b: 0 }));
    b.n++; b.r += p[0]; b.g += p[1]; b.b += p[2];
  }
  if (!buckets.size) return null;
  const ranked = [...buckets.values()].sort((a, b) => b.n - a.n);
  const top = ranked[0];
  return { color: [top.r / top.n, top.g / top.n, top.b / top.n], ranked };
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * The Swatch packshots are 1080x1080 front-on shots of the whole watch with
 * its strap, centred in frame. Four regions matter, and on most MoonSwatches
 * they are four different colours (Mission to Mars: red case, white bezel,
 * white dial, white strap). All radii are fractions of the frame width.
 */
const FLANK_MAX = 0.05;             // furthest inboard the flank walk may run
const BEZEL_RING = [0.150, 0.172];  // the tachymetre ring, inboard of the numerals
const DIAL       = [0.030, 0.135];  // everything inside the chapter ring
const SUBDIAL    = [0.055, 0.100];  // the three counters
const STRAP_BAND = [0.06, 0.18];    // upper strap, above the lugs

/** Pixels on an annulus, as a fraction of frame width, centred on the image. */
function annulus(data, r0, r1) {
  const c = SIZE / 2, out = [];
  for (let a = 0; a < 1440; a++) {
    const rad = (a * Math.PI) / 720;
    for (let r = r0 * SIZE; r <= r1 * SIZE; r += 1) {
      const x = Math.round(c + Math.cos(rad) * r);
      const y = Math.round(c + Math.sin(rad) * r);
      if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) out.push(at(data, x, y));
    }
  }
  return out;
}

/** A rectangle given as fractions of the frame. */
function box(data, x0, x1, y0, y1) {
  const out = [];
  for (let y = Math.round(y0 * SIZE); y < Math.round(y1 * SIZE); y++)
    for (let x = Math.round(x0 * SIZE); x < Math.round(x1 * SIZE); x++) out.push(at(data, x, y));
  return out;
}

/**
 * Pixels of the Bioceramic flank. On some references the flank is only six
 * pixels wide at this resolution, so rather than sampling a fixed window we
 * find the case edge on each row and walk inward for as long as the colour
 * holds — which is exactly where the flank ends and the bezel begins.
 */
function flankPixels(data) {
  const out = [];
  const limit = Math.round(FLANK_MAX * SIZE);
  for (let f = 0.44; f <= 0.56; f += 0.004) {
    const y = Math.round(f * SIZE);
    for (const dir of [1, -1]) {
      let edge = dir === 1 ? 0 : SIZE - 1;
      while (edge >= 0 && edge < SIZE && at(data, edge, y)[3] <= 200) edge += dir;
      if (edge < 0 || edge >= SIZE) continue;
      const seed = at(data, edge + dir * 2, y);
      if (!seed || seed[3] <= 200) continue;
      for (let i = 1; i < limit; i++) {
        const x = edge + dir * i;
        if (x < 0 || x >= SIZE) break;
        const px = at(data, x, y);
        if (px[3] <= 200) break;
        if (dist(px, seed) > 42) break;
        out.push(px);
      }
    }
  }
  return out;
}

async function watchPalette(file) {
  const data = await raw(file);
  // The Bioceramic flank is only ~2% of the frame wide, so find the actual
  // case edge on the centre row rather than assuming a fixed radius. Both
  // sides are sampled so a crown or pusher cannot skew the result.
  const caseCol = dominant(flankPixels(data));
  const bezel = dominant(annulus(data, ...BEZEL_RING));
  const dial = dominant(annulus(data, ...DIAL));
  const sub = dominant(annulus(data, ...SUBDIAL));
  const strap = dominant(box(data, 0.42, 0.58, ...STRAP_BAND));
  const out = {
    case: caseCol && hex(caseCol.color),
    bezel: bezel && hex(bezel.color),
    dial: dial && hex(dial.color),
    subdial: sub && hex(sub.color),
    strap: strap && hex(strap.color),
  };
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v));
}

async function strapPalette(file) {
  const data = await raw(file);
  const all = [];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) all.push(at(data, x, y));
  const d = dominant(all);
  if (!d) return { primary: "#8a8a8a", secondary: "#8a8a8a" };
  const primary = d.color;
  // Secondary = most frequent bucket that is visually distinct from the primary.
  const second = d.ranked.find((b) => dist([b.r / b.n, b.g / b.n, b.b / b.n], primary) > 60);
  return {
    primary: hex(primary),
    secondary: second ? hex([second.r / second.n, second.g / second.n, second.b / second.n]) : hex(primary),
  };
}

async function safeList(dir) {
  try { return await readdir(dir); } catch { return []; }
}

const out = { watches: {}, straps: {} };

for (const f of await safeList(WATCH_DIR)) {
  if (!f.endsWith("_sa200.png")) continue;
  const sku = f.replace("_sa200.png", "");
  try { out.watches[sku] = await watchPalette(path.join(WATCH_DIR, f)); }
  catch (e) { console.warn("watch", sku, e.message); }
}

for (const f of await safeList(STRAP_DIR)) {
  if (!f.endsWith(".png")) continue;
  const sku = f.replace(".png", "");
  try { out.straps[sku] = await strapPalette(path.join(STRAP_DIR, f)); }
  catch (e) { console.warn("strap", sku, e.message); }
}

await writeFile("src/data/palettes.json", JSON.stringify(out, null, 2) + "\n");
console.log(
  `palettes written — ${Object.keys(out.watches).length} watches, ${Object.keys(out.straps).length} straps`
);
