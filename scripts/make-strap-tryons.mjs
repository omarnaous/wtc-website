#!/usr/bin/env node
/**
 * Rubber-strap try-on photographs for the Strap Studio: every rubber strap,
 * on every watch, showing the watch you are looking at.
 *
 * Two kinds of rubber strap, two ways in:
 *
 *  1. Swatch's own straps (ACSO33001…019) were only ever photographed flat —
 *     the two halves side by side. Those halves are straight, so each is
 *     scaled to the strap's width and laid above and below the case in the
 *     packshot frame make-velcro-tryons.mjs uses, and the watch's case goes
 *     over them. They land in products/velcro-tryon/<watch>/ beside the
 *     Velcro try-ons, framed the same, so the re-strap plays between them.
 *
 *  2. The straps WTC photographed fitted (strap-photos-v3) exist on one or a
 *     few watches each. For every other watch, the photo of the strap on a
 *     watch it was shot on is kept and the case is swapped: that watch's
 *     Swatch packshot is matched onto the photo by its dial (the same
 *     registration recut-strap-photos.mjs uses), which places the reference
 *     frame inside the photo, and the case of the watch on show is laid in
 *     there with the same mask. Stored under
 *     products/rubber-tryon/<watch>/<photo set>/<strap>.webp — one folder
 *     per source set, because frames from one set share their framing and the
 *     re-strap only plays within a set.
 *
 *   node scripts/make-strap-tryons.mjs --packshots <dir>            # all of it
 *   node scripts/make-strap-tryons.mjs --packshots <dir> --dry ./o  # local only
 *   … --only flat|swap      one half
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  BAND, CASE_C, MASK, N, RIM, SITE,
  compose, d1, frame, loadWatches, put, unpremultiply, writePairings,
} from "./lib/tryon.mjs";

const arg = (k) => {
  const i = process.argv.indexOf(k);
  return i > 0 ? process.argv[i + 1] : null;
};
const DRY = arg("--dry");
const PACKSHOTS = arg("--packshots");
const ONLY = arg("--only");
const MIN_MATCH = 0.88;

if (DRY) mkdirSync(DRY, { recursive: true });

const products = d1(`SELECT slug, sku, photos FROM products WHERE collection_id = 'omega-swatch'`);
const rubber = d1(`SELECT sku, image FROM straps WHERE type = 'rubber' AND status = 'active'`);
const pairs = d1(
  `SELECT product_slug, strap_sku, photo, chip, is_default, position FROM product_straps WHERE photo IS NOT NULL`,
);

/*
 * The photographs the try-ons are made from. Once a watch's pairings point
 * at its try-ons, the original strap-photos-v3 paths are gone from D1, so the
 * first run writes them down here and every later run reads them back.
 */
const SOURCES_FILE = "scripts/data/strap-photo-sources.json";
let photoSources; // [{ sku, product_slug, photo, chip, is_default, position }]
if (existsSync(SOURCES_FILE)) {
  photoSources = JSON.parse(readFileSync(SOURCES_FILE, "utf8"));
} else {
  photoSources = pairs.filter((p) => p.photo.includes("/strap-photos"));
  mkdirSync("scripts/data", { recursive: true });
  writeFileSync(SOURCES_FILE, JSON.stringify(photoSources, null, 1) + "\n");
}
const photographedSkus = new Set(photoSources.map((p) => p.strap_sku));

const watches = await loadWatches(products, PACKSHOTS);
console.log(`${watches.size} watches in the frame`);

async function fetchRaw(src) {
  let res;
  for (let i = 0; i < 5; i++) {
    res = await fetch(SITE + src).catch(() => null);
    if (res?.ok) break;
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
  if (!res?.ok) throw new Error(`${src}: ${res?.status ?? "no response"}`);
  const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height };
}

const rows = [];
const store = async (key, buf) => {
  if (DRY) writeFileSync(join(DRY, key.replace(/\//g, "--")), buf);
  else await put(key, buf, "image/webp");
};

async function pool(jobs, n, fn) {
  let done = 0;
  const run = async () => {
    for (let j; (j = jobs.shift()); ) {
      await fn(j);
      if (++done % 25 === 0) console.log(`  ${done}`);
    }
  };
  await Promise.all(Array.from({ length: n }, run));
  return done;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. Swatch's flat rubber straps
// ════════════════════════════════════════════════════════════════════════════

/**
 * The two halves of a flat strap shot, as alpha-bounded boxes. The half with
 * the keeper loop is the long, buckle side; it goes above the case (its pins
 * are at its foot) and the other goes below (pins at its head).
 */
function halves({ data, W, H }) {
  const col = new Float64Array(W);
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) col[x] += data[(y * W + x) * 4 + 3];
  // Split at the widest empty run of columns in the middle third.
  let best = { len: 0, at: W / 2 };
  let run = 0;
  for (let x = Math.round(W * 0.25); x < Math.round(W * 0.75); x++) {
    if (col[x] < 255 * 2) { run++; if (run > best.len) best = { len: run, at: x - run / 2 }; } else run = 0;
  }
  const box = (x0, x1) => {
    let top = H, bot = 0;
    for (let x = x0; x < x1; x++) for (let y = 0; y < H; y++) if (data[(y * W + x) * 4 + 3] > 128) { top = Math.min(top, y); bot = Math.max(bot, y); }
    // The body's width, measured mid-length (the spring-bar tips stick out at the ends).
    const mid = Math.round((top + bot) / 2);
    let l = -1, r = -1;
    for (let x = x0; x < x1; x++) if (data[(mid * W + x) * 4 + 3] > 128) { if (l < 0) l = x; r = x; }
    return { x0, x1, top, bot, l, r };
  };
  const split = Math.round(best.at);
  return { left: box(0, split), right: box(split, W) };
}

/** The strap alone in the reference frame, premultiplied. */
function strapLayer(img) {
  const { left, right } = halves(img);
  const out = new Float32Array(N * N * 4);
  const bandW = BAND[1] - BAND[0] + 2;
  const cx = (BAND[0] + BAND[1]) / 2;
  // Each half is placed so its case end runs well under the case.
  const place = (h, anchorY, endIsBottom) => {
    const s = bandW / (h.r - h.l + 1);
    const bodyCx = (h.l + h.r) / 2;
    const ty = endIsBottom ? anchorY - h.bot * s : anchorY - h.top * s;
    const x0 = Math.floor(cx - ((bodyCx - h.x0) * s)) - 2;
    const x1 = Math.ceil(cx + ((h.x1 - bodyCx) * s)) + 2;
    for (let Y = 0; Y < N; Y++) {
      const sy = (Y - ty) / s;
      if (sy < h.top - 1 || sy > h.bot + 1) continue;
      const y0 = Math.floor(sy), fy = sy - y0;
      for (let X = Math.max(0, x0); X < Math.min(N, x1); X++) {
        const sx = (X - cx) / s + bodyCx;
        const xx0 = Math.floor(sx), fx = sx - xx0;
        let r = 0, g = 0, b = 0, al = 0;
        for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
          const x = xx0 + i, y = y0 + j;
          if (x < h.x0 || x >= h.x1 || y < 0 || y >= img.H) continue;
          const w = (i ? fx : 1 - fx) * (j ? fy : 1 - fy);
          const k = (y * img.W + x) * 4;
          const a = (img.data[k + 3] / 255) * w;
          r += img.data[k] * a; g += img.data[k + 1] * a; b += img.data[k + 2] * a; al += a;
        }
        const o = (Y * N + X) * 4;
        // Over whatever is there already (the halves never overlap).
        out[o] += r; out[o + 1] += g; out[o + 2] += b; out[o + 3] += al;
      }
    }
  };
  place(left, 380, true); // foot of the buckle half tucked under the top of the case
  place(right, 690, false); // head of the other half under the bottom of the case

  // A little shade where the strap meets the case, as in Swatch's own shots.
  for (let y = 0; y < N; y++) for (let x = Math.floor(BAND[0]); x <= Math.ceil(BAND[1]); x++) {
    const d = Math.hypot(x - CASE_C[0], y - CASE_C[1]) - RIM;
    if (d < 0 || d > 26) continue;
    const k = 1 - 0.28 * (1 - d / 26);
    const o = (y * N + x) * 4;
    out[o] *= k; out[o + 1] *= k; out[o + 2] *= k;
  }
  return out;
}

if (ONLY !== "swap") {
  const flat = rubber.filter((s) => !photographedSkus.has(s.sku));
  console.log(`\n${flat.length} flat-shot straps`);
  const layers = new Map();
  for (const s of flat) {
    try {
      const img = await fetchRaw(s.image);
      layers.set(s.sku, strapLayer(img));
    } catch (e) {
      console.log(`– ${s.sku}: ${e.message}`);
    }
  }
  const chipKey = (sku) => `products/velcro-tryon/chips/${sku}.webp`;
  for (const [sku, layer] of layers) {
    const buf = await sharp(unpremultiply(layer), { raw: { width: N, height: N, channels: 4 } })
      .extract({ left: 421, top: 820, width: 236, height: 236 })
      .resize(160, 160)
      .flatten({ background: "#16161a" })
      .webp({ quality: 82 })
      .toBuffer();
    await store(chipKey(sku), buf);
  }
  const jobs = [];
  let i = 0;
  for (const [sku, layer] of layers) {
    i++;
    for (const [slug, caseWatch] of watches) jobs.push({ sku, layer, slug, caseWatch, pos: 400 + i });
  }
  const n = await pool(jobs, 4, async ({ sku, layer, slug, caseWatch, pos }) => {
    const key = `products/tryon/${slug}/${sku}.webp`;
    await store(key, await frame(compose(layer, caseWatch)));
    rows.push({ slug, sku, photo: `/api/media/${key}`, chip: `/api/media/${chipKey(sku)}`, position: pos });
  });
  console.log(`${n} flat-strap frames`);
}

// ════════════════════════════════════════════════════════════════════════════
// 2. Photographed straps, case swapped
// ════════════════════════════════════════════════════════════════════════════

function warp(src, W, H, outW, outH, { s, tx, ty }, ch = 1) {
  const out = new Float32Array(outW * outH * ch);
  for (let y = 0; y < outH; y++) {
    const Y = (y - ty) / s;
    const y0 = Math.floor(Y), fy = Y - y0;
    for (let x = 0; x < outW; x++) {
      const X = (x - tx) / s;
      const x0 = Math.floor(X), fx = X - x0;
      if (x0 < 0 || y0 < 0 || x0 + 1 >= W || y0 + 1 >= H) continue;
      const i = (y0 * W + x0) * ch, o = (y * outW + x) * ch;
      for (let c = 0; c < ch; c++) {
        out[o + c] =
          (src[i + c] * (1 - fx) + src[i + ch + c] * fx) * (1 - fy) +
          (src[i + W * ch + c] * (1 - fx) + src[i + W * ch + ch + c] * fx) * fy;
      }
    }
  }
  return out;
}

async function grey(src, w, h) {
  const { data, info } = await sharp(src.rgba, { raw: { width: src.W, height: src.H, channels: 4 } })
    .flatten({ background: { r: 245, g: 245, b: 245 } })
    .resize({ width: w, height: h, fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { d: Float32Array.from(data), W: info.width, H: info.height };
}

/** From recut-strap-photos.mjs: anchor(x, y) ≈ other((x - tx) / s, (y - ty) / s), matched on the dial. */
async function register(anchor, other, lo, hi) {
  async function search(k, scales, near, keep = 1) {
    const a = await grey(anchor, Math.round(anchor.W / k), Math.round(anchor.H / k));
    const box = {
      x0: Math.round(0.2 * a.W), x1: Math.round(0.72 * a.W),
      y0: Math.round(0.4 * a.H), y1: Math.round(0.6 * a.H),
    };
    const tw = box.x1 - box.x0, th = box.y1 - box.y0, n = tw * th;
    const t = new Float32Array(n);
    let mean = 0;
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) mean += t[y * tw + x] = a.d[(box.y0 + y) * a.W + box.x0 + x];
    mean /= n;
    let norm = 0;
    for (let i = 0; i < n; i++) { t[i] -= mean; norm += t[i] * t[i]; }
    norm = Math.sqrt(norm);
    const found = [];
    for (const s of scales) {
      const b = await grey(other, Math.round((other.W * s) / k), Math.round((other.H * s) / k));
      const r = near
        ? { x0: near.ox - 4, x1: near.ox + 4, y0: near.oy - 4, y1: near.oy + 4 }
        : { x0: 0, x1: b.W - tw, y0: 0, y1: b.H - th };
      for (let oy = Math.max(0, r.y0); oy <= Math.min(b.H - th, r.y1); oy++) {
        for (let ox = Math.max(0, r.x0); ox <= Math.min(b.W - tw, r.x1); ox++) {
          let sum = 0, sum2 = 0, dot = 0;
          for (let y = 0; y < th; y++) {
            const row = (oy + y) * b.W + ox;
            for (let x = 0; x < tw; x++) { const v = b.d[row + x]; sum += v; sum2 += v * v; dot += v * t[y * tw + x]; }
          }
          const score = dot / (Math.sqrt(Math.max(1e-6, sum2 - (sum * sum) / n)) * norm);
          found.push({ score, s, ox, oy, box });
        }
      }
    }
    found.sort((p, q) => q.score - p.score);
    const peaks = [];
    for (const c of found) {
      if (peaks.some((p) => Math.abs(p.ox - c.ox) <= 2 && Math.abs(p.oy - c.oy) <= 2)) continue;
      peaks.push(c);
      if (peaks.length === keep) break;
    }
    return peaks;
  }
  const range = (a, b, step) => { const o = []; for (let v = a; v <= b + 1e-9; v += step) o.push(+v.toFixed(4)); return o; };
  let best = null;
  for (const c of await search(8, range(lo, hi, 0.01), null, 4)) {
    const [m] = await search(2, range(c.s - 0.012, c.s + 0.012, 0.002), { ox: c.ox * 4, oy: c.oy * 4 });
    const [b] = await search(1, range(m.s - 0.003, m.s + 0.003, 0.0005), { ox: m.ox * 2, oy: m.oy * 2 });
    if (!best || b.score > best.score) best = b;
  }
  return { s: best.s, tx: best.box.x0 - best.ox, ty: best.box.y0 - best.oy, score: best.score };
}

/** The photo's case width, to start the scale search near the answer. */
function caseWidth({ data, W, H }) {
  let widest = 0;
  for (let y = Math.round(H * 0.4); y < Math.round(H * 0.6); y++) {
    let l = -1, r = -1;
    for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 128) { if (l < 0) l = x; r = x; }
    widest = Math.max(widest, r - l);
  }
  return widest;
}

if (ONLY !== "flat") {
  const photographed = rubber.filter((s) => photographedSkus.has(s.sku));
  console.log(`\n${photographed.length} photographed straps`);
  // The reference frame's case width, packshot to packshot (r530, pushers included).
  const REF_W = 571;

  // Each photo's registration is slow (seconds) and never changes, so it is
  // kept between runs.
  const REG_FILE = "scripts/data/strap-photo-registrations.json";
  const regCache = existsSync(REG_FILE) ? JSON.parse(readFileSync(REG_FILE, "utf8")) : {};
  const sources = new Map(); // sku → { frame, reg, set, chip }
  for (const s of photographed) {
    const cands = photoSources
      .filter((p) => p.strap_sku === s.sku && watches.has(p.product_slug))
      .sort((a, b) => b.is_default - a.is_default || a.position - b.position);
    for (const c of cands) {
      const img = await fetchRaw(c.photo);
      let reg = regCache[c.photo];
      if (!reg) {
        const canon = { rgba: unpremultiply(watches.get(c.product_slug)), W: N, H: N };
        const s0 = caseWidth(img) / REF_W;
        reg = await register({ rgba: img.data, W: img.W, H: img.H }, canon, s0 * 0.9, s0 * 1.1);
        regCache[c.photo] = reg;
        writeFileSync(REG_FILE, JSON.stringify(regCache, null, 1) + "\n");
      }
      console.log(`  ${s.sku} on ${c.product_slug}: match ${reg.score.toFixed(3)}`);
      if (reg.score >= MIN_MATCH) {
        const set = c.photo.split("/").slice(-2, -1)[0];
        sources.set(s.sku, { img, reg, set, chip: c.chip, from: c.product_slug });
        break;
      }
    }
    if (!sources.has(s.sku)) console.log(`– ${s.sku}: no photo matched its watch's packshot, skipped`);
  }

  /*
   * Every watch's frames in one framing. The photo is pulled into the
   * reference frame (the inverse of its registration), so its strap sits
   * exactly where a packshot's strap does; then, for every watch — the one it
   * was shot on included — that watch's own case goes over it. All of a
   * watch's try-ons then share one framing and one case, and the re-strap
   * can play between any two of them.
   */
  const jobs = [];
  let i = 0;
  for (const [sku, src] of sources) {
    i++;
    const { img, reg } = src;
    const pm = new Float32Array(img.W * img.H * 4);
    for (let p = 0; p < img.W * img.H; p++) {
      const a = img.data[p * 4 + 3] / 255;
      pm[p * 4] = img.data[p * 4] * a;
      pm[p * 4 + 1] = img.data[p * 4 + 1] * a;
      pm[p * 4 + 2] = img.data[p * 4 + 2] * a;
      pm[p * 4 + 3] = a;
    }
    const inv = { s: 1 / reg.s, tx: -reg.tx / reg.s, ty: -reg.ty / reg.s };
    const layer = warp(pm, img.W, img.H, N, N, inv, 4);
    for (const [slug, caseWatch] of watches) jobs.push({ sku, layer, chip: src.chip, slug, caseWatch, pos: 300 + i });
  }
  const n = await pool(jobs, 4, async ({ sku, layer, chip, slug, caseWatch, pos }) => {
    const key = `products/tryon/${slug}/${sku}.webp`;
    await store(key, await frame(compose(layer, caseWatch)));
    rows.push({ slug, sku, photo: `/api/media/${key}`, chip, position: pos });
  });
  console.log(`${n} case-swapped frames`);
}

if (!DRY) {
  writePairings(rows, { replace: true });
  console.log(`${rows.length} pairings written`);
}
