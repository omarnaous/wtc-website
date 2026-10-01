/**
 * Re-cuts the Strap Studio's try-on frames so they sit cleanly on a dark page.
 *
 * The original cut-out ran on each frame by itself: a flood fill from the frame
 * edges, held back by texture. On a dark strap that is exact. On a white strap
 * or a white case it is a guess — both are within a few RGB units of the studio
 * paper — and it guessed wrong in four ways:
 *
 *  1. Slabs of backdrop left standing beside pale straps.
 *  2. Bites taken out of white cases: the crown and pushers half gone, leaving
 *     only their dark grooves floating on the page.
 *  3. A bright bar where the frame cuts the strap off, top and bottom.
 *  4. Grey shadows beside the lugs, which only read as shadow on white paper.
 *
 * The fixes:
 *
 *  1. One outline per set, from the dark straps. Every frame in a set is the
 *     same watch on the same strap mould, so the outline is taken where the
 *     cut-out is reliable — the dark-strap frames, per-pixel median — and used
 *     for every frame, pale straps included.
 *
 *     "Same" needs checking, not assuming. Most sets are pixel-aligned, but some
 *     mix shoots (the 1969 set is two, at different resolutions) and some frames
 *     sit a few pixels off. Averaging misaligned outlines is what leaves
 *     half-opaque paper beside a lug. So every frame is first registered onto
 *     the set's anchor frame — scale and offset, by normalised
 *     cross-correlation on the dial — and the outline is built and applied in
 *     the anchor's coordinates.
 *
 *  2. The case outline comes from Swatch. Wristbuddys build these frames on
 *     Swatch's own front packshot — same render, hands frozen at the same time —
 *     and Swatch publish it with a clean alpha channel. Registered the same way,
 *     its alpha restores the case, crown, pushers and lugs. Only on pale cases
 *     (a dark case was never damaged) and never inside the strap columns, where
 *     Swatch's strap is a different shape from the one being sold.
 *
 *  3. The strap ends fade out instead of stopping on a hard edge.
 *
 *  4. Shadows go. Whatever holds still across every frame (so is not strap),
 *     is neutral grey, and is not in Swatch's outline (so is not watch) is
 *     shadow or leftover paper. Without a Swatch outline to lean on, it is
 *     peeled from the outside in, through shadow-like pixels only.
 *
 * Edge pixels are part subject, part backdrop. The backdrop is one known flat
 * colour per frame, so its share is subtracted back out rather than left as a
 * pale rim.
 *
 * Reads the cached Wristbuddys originals in .cache/wristbuddys (the product
 * feeds are cached there too, so this runs offline) and Swatch's sa200
 * packshots from --packshots, named <SKU>_sa200.png. Writes
 * <out-dir>/products/strap-photos/<set>/<id>.webp.
 *
 * Run with: node scripts/recut-strap-photos.mjs <out-dir> --packshots <dir> [set …]
 *
 * ⚠️ The photography belongs to Wristbuddys — see README, "Image rights".
 */
import sharp from "sharp";
import { analyse, cutout } from "./lib/cutout.mjs";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://wristbuddys.com";
const CACHE = ".cache/wristbuddys";

/** The original pipeline's crop and width — frames must stay aligned with the
 * swatch crops already published, so these are not to be tuned here. */
const CROP = { x0: 0.195, x1: 0.835, y0: 0.075, y1: 0.925 };
const WIDTH = 700;
const QUALITY = 72;

/** Strap luminance below which a frame's own cut-out is trusted as a donor. */
const DONOR_LUMA = 150;
/** Alpha below this is dropped: a sliver that faint only leaves a speck. */
const FLOOR = 0.04;
/** How far, in px, the strap fades out at each end of the frame. Long on
 * purpose: a white strap is still a bright bar on a dark page unless it
 * dissolves over most of its visible run. */
const FADE = 170;
/** A frame that registers onto the anchor below this is processed alone. */
const MIN_FRAME_MATCH = 0.8;
/** Swatch's packshot below this is not the frame's render; no case repair. */
const MIN_SWATCH_MATCH = 0.9;
/** Mean luminance of the case edge above which it counts as pale. */
const PALE_CASE = 170;

/** Wristbuddys set → the Swatch reference whose packshot it is built on. */
const SETS = {
  "mission-to-the-sun": "SO33J100",
  "mission-to-mercury": "SO33A100",
  "mission-to-venus": "SO33P100",
  "mission-on-earth": "SO33G100",
  "mission-to-the-moon": "SO33M100",
  "mission-to-mars": "SO33R100",
  "mission-to-jupiter": "SO33C100",
  "mission-to-saturn": "SO33T100",
  "mission-to-uranus": "SO33L100",
  "mission-to-neptune": "SO33N100",
  "mission-to-pluto": "SO33M101",
  "mission-to-the-moonphase": "SO33W700",
  "mission-to-the-moonphase-new-moon": "SO33B700",
  "mission-to-the-super-blue-moonphase": "SO33N700",
  "mission-to-the-pink-moonphase": "SO33P700",
  "mission-to-earthphase": "SO33M700",
  "mission-to-earthphase-moonshine-gold": "SO33N701L",
  "mission-to-earthphase-moonshine-gold-cold-moon": "SO33W701L",
  "mission-on-earth-lava": "SO33O100",
  "mission-on-earth-polar-lights": "SO33L103",
  "mission-on-earth-desert": "SO33T103",
  "1965": "SO33M106",
  "mission-to-the-moon-1969": "SSX01B700",
};

const handleFor = (set) =>
  set === "1965"
    ? "rubber-strap-for-omega-x-swatch-moonswatch-1965"
    : `rubber-strap-for-omega-x-swatch-moonswatch-${set}`;

const slugify = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Cache only — this script never goes back to their CDN. */
async function cached(url) {
  const key = createHash("sha1").update(url).digest("hex").slice(0, 16);
  return readFile(path.join(CACHE, `${key}.bin`));
}

const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const median = (vals) => {
  const v = [...vals].sort((a, b) => a - b);
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

// ── Frames ──────────────────────────────────────────────────────────────────

/** The uncut frame, cropped exactly as the original pipeline cropped it. */
async function frame(buf) {
  const meta = await sharp(buf).metadata();
  const { data, info } = await sharp(buf)
    .extract({
      left: Math.round(CROP.x0 * meta.width),
      top: Math.round(CROP.y0 * meta.height),
      width: Math.round((CROP.x1 - CROP.x0) * meta.width),
      height: Math.round((CROP.y1 - CROP.y0) * meta.height),
    })
    .resize({ width: WIDTH, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { rgba: data, W: info.width, H: info.height, source: `${meta.width}x${meta.height}` };
}

/** The strap's brightness, read where the original sampled its colour. */
function strapLuma({ rgba, W, H }) {
  let s = 0, n = 0;
  for (let y = Math.round(0.02 * H); y < Math.round(0.12 * H); y++) {
    for (let x = Math.round(0.4 * W); x < Math.round(0.6 * W); x++) {
      s += lum(rgba, (y * W + x) * 4);
      n++;
    }
  }
  return s / n;
}

/** The studio paper's colour, from the four corners. */
function backdrop({ rgba, W, H }) {
  const px = [];
  for (const [cx, cy] of [[0, 0], [W - 8, 0], [0, H - 8], [W - 8, H - 8]]) {
    for (let y = cy; y < cy + 8; y++) for (let x = cx; x < cx + 8; x++) px.push((y * W + x) * 4);
  }
  return [0, 1, 2].map((c) => {
    const v = px.map((i) => rgba[i + c]).sort((a, b) => a - b);
    return v[v.length >> 1];
  });
}

/** One channel of a frame (or alpha), as floats. */
function channel(f, pick) {
  const out = new Float32Array(f.W * f.H);
  for (let p = 0; p < f.W * f.H; p++) out[p] = pick(f.rgba, p * 4);
  return out;
}

/**
 * Resamples `src` (W×H) onto an outW×outH grid, where output (x, y) reads
 * src((x - tx) / s, (y - ty) / s). Bilinear; `fill` outside the source.
 */
function warp(src, W, H, outW, outH, { s, tx, ty }, fill = 0) {
  const out = new Float32Array(outW * outH);
  for (let y = 0; y < outH; y++) {
    const Y = (y - ty) / s;
    const y0 = Math.floor(Y), fy = Y - y0;
    for (let x = 0; x < outW; x++) {
      const X = (x - tx) / s;
      const x0 = Math.floor(X), fx = X - x0;
      if (x0 < 0 || y0 < 0 || x0 + 1 >= W || y0 + 1 >= H) {
        out[y * outW + x] = fill;
        continue;
      }
      const i = y0 * W + x0;
      out[y * outW + x] =
        (src[i] * (1 - fx) + src[i + 1] * fx) * (1 - fy) +
        (src[i + W] * (1 - fx) + src[i + W + 1] * fx) * fy;
    }
  }
  return out;
}

const IDENTITY = { s: 1, tx: 0, ty: 0 };
const inverse = ({ s, tx, ty }) => ({ s: 1 / s, tx: -tx / s, ty: -ty / s });

// ── Registration ────────────────────────────────────────────────────────────

/** Greyscale of a frame or a packshot file, resized, flattened on paper. */
async function grey(src, w, h) {
  const p = src.file
    ? sharp(src.file)
    : sharp(src.rgba, { raw: { width: src.W, height: src.H, channels: 4 } });
  const { data, info } = await p
    .flatten({ background: { r: 245, g: 245, b: 245 } })
    .resize({ width: w, height: h, fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { d: Float32Array.from(data), W: info.width, H: info.height };
}

/**
 * Where `other` sits in `anchor`'s coordinates: anchor(x, y) ≈
 * other((x - tx) / s, (y - ty) / s). Matched on the dial — the one region that
 * is the same in every frame and in Swatch's packshot — coarse to fine.
 */
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
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) mean += t[y * tw + x] = a.d[(box.y0 + y) * a.W + box.x0 + x];
    }
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
            for (let x = 0; x < tw; x++) {
              const v = b.d[row + x];
              sum += v; sum2 += v * v; dot += v * t[y * tw + x];
            }
          }
          const score = dot / (Math.sqrt(Math.max(1e-6, sum2 - (sum * sum) / n)) * norm);
          found.push({ score, s, ox, oy, box });
        }
      }
    }
    // The best few that are not the same peak seen twice.
    found.sort((a, b) => b.score - a.score);
    const peaks = [];
    for (const c of found) {
      if (peaks.some((p) => Math.abs(p.ox - c.ox) <= 2 && Math.abs(p.oy - c.oy) <= 2)) continue;
      peaks.push(c);
      if (peaks.length === keep) break;
    }
    return peaks;
  }

  const range = (a, b, step) => {
    const out = [];
    for (let v = a; v <= b + 1e-9; v += step) out.push(+v.toFixed(4));
    return out;
  };
  // A small template at 1/8 scale can prefer a wrong peak by a hair, so the
  // best few coarse peaks are all refined and the finest score decides.
  let best = null;
  for (const c of await search(8, range(lo, hi, 0.01), null, 4)) {
    const [m] = await search(2, range(c.s - 0.012, c.s + 0.012, 0.002), { ox: c.ox * 4, oy: c.oy * 4 });
    const [b] = await search(1, range(m.s - 0.003, m.s + 0.003, 0.0005), { ox: m.ox * 2, oy: m.oy * 2 });
    if (!best || b.score > best.score) best = b;
  }
  return { s: best.s, tx: best.box.x0 - best.ox, ty: best.box.y0 - best.oy, score: best.score };
}

// ── Case repair ─────────────────────────────────────────────────────────────

/**
 * The parts of Swatch's alpha that are the case — not their strap — and how
 * pale that case is in the anchor frame.
 */
function caseZone(sw, ref, rgba, W, H) {
  const xl = new Int32Array(H).fill(-1), xr = new Int32Array(H).fill(-1);
  let top = -1, bottom = -1, maxW = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (sw[y * W + x] > 0.5) {
        if (xl[y] < 0) xl[y] = x;
        xr[y] = x;
      }
    }
    if (xl[y] >= 0) {
      if (top < 0) top = y;
      bottom = y;
      maxW = Math.max(maxW, xr[y] - xl[y]);
    }
  }
  if (top < 0) return null;

  // Strap columns: wherever either strap runs, in the outer quarter at each
  // end. Generous on purpose — erring wide only costs a little lug repair.
  const span = bottom - top;
  const outer = (y) => y <= top + 0.25 * span || y >= bottom - 0.25 * span;
  let sL = W, sR = 0;
  for (let y = 0; y < H; y++) {
    if (!outer(y)) continue;
    if (xl[y] >= 0) { sL = Math.min(sL, xl[y]); sR = Math.max(sR, xr[y]); }
    for (let x = 0; x < W; x++) {
      if (ref[y * W + x] > 0.5) { sL = Math.min(sL, x); sR = Math.max(sR, x); }
    }
  }
  sL -= 4; sR += 4;

  const zone = new Uint8Array(W * H);
  let caseLum = 0, caseN = 0;
  for (let y = 0; y < H; y++) {
    const band = xl[y] >= 0 && xr[y] - xl[y] >= 0.8 * maxW; // the bezel rows
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      if (sw[p] <= 0.5) continue;
      if (band || x < sL || x > sR) zone[p] = 1;
      if (band && ref[p] > 0.9 && (x - xl[y] < 14 || xr[y] - x < 14)) {
        caseLum += lum(rgba, p * 4);
        caseN++;
      }
    }
  }
  return { zone, pale: caseN ? caseLum / caseN : 0 };
}

/** Mean luminance at the left and right edges of the case's widest rows. */
function caseLuma(ref, rgba, W, H) {
  const xl = new Int32Array(H).fill(-1), xr = new Int32Array(H).fill(-1);
  let maxW = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) if (ref[y * W + x] > 0.5) { if (xl[y] < 0) xl[y] = x; xr[y] = x; }
    if (xl[y] >= 0) maxW = Math.max(maxW, xr[y] - xl[y]);
  }
  let s = 0, n = 0;
  for (let y = 0; y < H; y++) {
    if (xl[y] < 0 || xr[y] - xl[y] < 0.85 * maxW) continue;
    // The left edge only: the right carries the crown and pushers.
    for (let x = xl[y] + 3; x < xl[y] + 14; x++) { s += lum(rgba, (y * W + x) * 4); n++; }
  }
  return n ? s / n : 255;
}

// ── Shadows ─────────────────────────────────────────────────────────────────

/**
 * Drops opaque pixels that hold still across every aligned frame, are neutral
 * grey, and are not watch. `lums` are the frames' luminances in anchor
 * coordinates, already normalised to the anchor's paper.
 */
function dropShadows(ref, lums, anchor, sw, W, H) {
  const bg = backdrop(anchor);
  const paper = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2];
  const d = anchor.rgba;

  const still = (p) => {
    let lo = 255, hi = 0;
    for (const L of lums) {
      if (L[p] < lo) lo = L[p];
      if (L[p] > hi) hi = L[p];
    }
    const i = p * 4;
    const grey = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) <= 18;
    return { ok: hi - lo <= 16 && grey, lo, hi };
  };

  let dropped = 0;
  if (sw) {
    for (let p = 0; p < W * H; p++) {
      if (ref[p] <= 0 || sw[p] >= 0.3 || !still(p).ok) continue;
      ref[p] = 0;
      dropped++;
    }
    return dropped;
  }

  // Peel: breadth-first from every transparent pixel, through shadow-like
  // pixels only — it stops at a dark case, and at the strap, which moves.
  const shadowy = (p) => {
    const s = still(p);
    return s.ok && s.lo >= 50 && s.hi <= paper + 2;
  };
  const seen = new Uint8Array(W * H);
  const queue = new Int32Array(W * H);
  let head = 0, tail = 0;
  for (let p = 0; p < W * H; p++) if (ref[p] < 0.5) { seen[p] = 1; queue[tail++] = p; }
  while (head < tail) {
    const p = queue[head++];
    const x = p % W;
    for (const q of [p - W, p + W, x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1]) {
      if (q < 0 || q >= W * H || seen[q]) continue;
      seen[q] = 1;
      if (!shadowy(q)) continue;
      if (ref[q] > 0) { ref[q] = 0; dropped++; }
      queue[tail++] = q;
    }
  }
  return dropped;
}

// ── Output ──────────────────────────────────────────────────────────────────

/** Writes one frame with the given alpha (frame coordinates, 0–1). */
async function write(f, alpha, dest) {
  const out = Buffer.from(f.rgba);
  const bg = backdrop(f);
  for (let p = 0; p < f.W * f.H; p++) {
    const i = p * 4;
    let a = alpha[p];
    if (a < FLOOR) a = 0;
    if (a > 0 && a < 0.98) {
      // Take the backdrop's share back out of the edge pixel.
      for (let c = 0; c < 3; c++) {
        out[i + c] = Math.max(0, Math.min(255, Math.round((f.rgba[i + c] - (1 - a) * bg[c]) / a)));
      }
    }
    out[i + 3] = Math.round(a * f.fade[(p / f.W) | 0] * 255);
  }
  await writeFile(
    dest,
    await sharp(out, { raw: { width: f.W, height: f.H, channels: 4 } })
      .webp({ quality: QUALITY, alphaQuality: 90 })
      .toBuffer(),
  );
}

/** Per-row fade factor for an alpha, ramping in from the subject's ends. */
function fadeFor(alpha, W, H) {
  const fade = new Float32Array(H).fill(1);
  let first = -1, last = -1;
  for (let y = 0; y < H; y++) {
    for (let x = Math.round(0.3 * W); x < Math.round(0.7 * W); x++) {
      if (alpha[y * W + x] > 0.5) { if (first < 0) first = y; last = y; break; }
    }
  }
  if (first >= 0) {
    for (let y = 0; y < H; y++) fade[y] = Math.min(smooth((y - first) / FADE), smooth((last - y) / FADE));
  }
  return fade;
}

/**
 * Picks an anchor from `pool` — the darkest strap from the most common source
 * size — and splits the pool into the frames that register onto it and the
 * rest. The anchor is always in its own group, so this always makes progress.
 */
async function gather(pool) {
  const bySource = {};
  for (const f of pool) (bySource[f.source] ??= []).push(f);
  const main = Object.values(bySource).sort((a, b) => b.length - a.length)[0];
  const anchor = [...main].sort((a, b) => a.luma - b.luma)[0];

  for (const f of pool) {
    // Same source size usually means the same shoot and zoom, so that is tried
    // first and narrowly; a weak match retries across every plausible zoom.
    if (f === anchor) {
      f.reg = { ...IDENTITY, score: 1 };
      continue;
    }
    f.reg = f.source === anchor.source ? await register(anchor, f, 0.97, 1.03) : { score: -1 };
    if (f.reg.score < MIN_FRAME_MATCH) {
      const wide = await register(anchor, f, 0.75, 1.3);
      if (wide.score > f.reg.score) f.reg = wide;
    }
  }
  return {
    anchor,
    group: pool.filter((f) => f.reg.score >= MIN_FRAME_MATCH),
    rest: pool.filter((f) => f.reg.score < MIN_FRAME_MATCH),
  };
}

/** Builds one group's outline in its anchor's coordinates and writes its frames. */
async function processGroup(group, anchor, sku, dir) {
  const { W, H } = anchor;

  let donors = group.filter((f) => f.luma < DONOR_LUMA);
  if (donors.length < 2) donors = [...group].sort((a, b) => a.luma - b.luma).slice(0, 2);

  // 1. The outline.
  const warped = donors.map((d) => warp(d.own, d.W, d.H, W, H, d.reg));
  const ref = new Float32Array(W * H);
  for (let p = 0; p < W * H; p++) ref[p] = median(warped.map((a) => a[p]));

  // 2. The case, from Swatch.
  let swAlpha = null;
  let note = "no packshot";
  const file = packshots && path.join(packshots, `${sku}_sa200.png`);
  if (file && existsSync(file)) {
    const meta = await sharp(file).metadata();
    const reg = await register(anchor, { file, W: meta.width, H: meta.height }, 0.85, 1.35);
    if (reg.score >= MIN_SWATCH_MATCH) {
      const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const raw = new Float32Array(meta.width * meta.height);
      for (let p = 0; p < raw.length; p++) raw[p] = data[p * 4 + 3] / 255;
      swAlpha = warp(raw, meta.width, meta.height, W, H, reg);
      const z = caseZone(swAlpha, ref, anchor.rgba, W, H);
      if (z && z.pale >= PALE_CASE) {
        let restored = 0;
        for (let p = 0; p < W * H; p++) {
          if (z.zone[p] && swAlpha[p] > ref[p]) {
            if (swAlpha[p] - ref[p] > 0.5) restored++;
            ref[p] = swAlpha[p];
          }
        }
        note = `pale case from Swatch (${reg.score.toFixed(3)}, ${restored}px)`;
      } else {
        note = `dark case kept (Swatch ${reg.score.toFixed(3)})`;
      }
    } else {
      note = `Swatch weak (${reg.score.toFixed(3)})`;
    }
  }

  // 4. Shadows. "Holds still across frames" only means "not strap" when the
  // straps in the group actually differ, so a group of one, or of near-identical
  // straps, keeps its shadows rather than risking the strap.
  const lumas = group.map((f) => f.luma);
  const varied = group.length >= 2 && Math.max(...lumas) - Math.min(...lumas) > 60;
  let shadow = 0;
  if (varied) {
    const paperOf = (f) => { const b = backdrop(f); return 0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]; };
    const anchorPaper = paperOf(anchor);
    const lums = group.map((f) => {
      const k = anchorPaper / paperOf(f);
      const L = channel(f, (d, i) => lum(d, i) * k);
      return f === anchor ? L : warp(L, f.W, f.H, W, H, f.reg, anchorPaper);
    });
    // Without Swatch's outline the peel is the only guard, and it cannot tell a
    // pale case from paper — so it runs on dark cases only.
    if (swAlpha || caseLuma(ref, anchor.rgba, W, H) < 120) {
      shadow = dropShadows(ref, lums, anchor, swAlpha, W, H);
    } else {
      note += ", pale case so no peel";
    }
  } else {
    note += ", straps too alike to find shadows";
  }

  // 3. The fade, from the finished outline.
  const fadeA = fadeFor(ref, W, H);

  for (const f of group) {
    // The anchor's outline, carried back into this frame's coordinates.
    const alpha = f === anchor ? ref : warp(ref, W, H, f.W, f.H, inverse(f.reg));
    f.fade = new Float32Array(f.H);
    for (let y = 0; y < f.H; y++) {
      f.fade[y] = fadeA[Math.max(0, Math.min(H - 1, Math.round(f.reg.s * y + f.reg.ty)))];
    }
    await write(f, alpha, path.join(dir, `${f.id}.webp`));
  }

  const offs = group.filter((f) => f !== anchor).map((f) => Math.hypot(f.reg.tx, f.reg.ty));
  return (
    `${group.length} aligned on ${anchor.id} (max shift ${offs.length ? Math.max(...offs).toFixed(1) : 0}px), ` +
    `outline from ${donors.length}, ${note}, ${shadow}px shadow`
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const outDir = args[0];
const pi = args.indexOf("--packshots");
const packshots = pi > 0 ? args[pi + 1] : null;
const only = args.slice(1).filter((a, i, all) => a !== "--packshots" && all[i - 1] !== "--packshots");
if (!outDir || outDir.startsWith("--")) {
  console.error("usage: node scripts/recut-strap-photos.mjs <out-dir> --packshots <dir> [set …]");
  process.exit(1);
}

for (const [set, sku] of Object.entries(SETS)) {
  if (only.length && !only.includes(set)) continue;
  const product = JSON.parse((await cached(`${ORIGIN}/products/${handleFor(set)}.js`)).toString("utf8"));

  const frames = [];
  for (const v of product.variants) {
    if (!v.featured_image) continue;
    const f = await frame(await cached(`${v.featured_image.src}?width=1200`));
    // Each frame's own cut-out: a donor candidate, and the fallback.
    const own = Buffer.from(f.rgba);
    cutout(own, f.W, f.H, { geometry: analyse(own, f.W, f.H) });
    frames.push({ id: slugify(v.title), ...f, own: channel({ ...f, rgba: own }, (d, i) => d[i + 3] / 255), luma: strapLuma(f) });
  }

  const dir = path.join(outDir, "products", "strap-photos", set);
  await mkdir(dir, { recursive: true });

  // A set can hold more than one photograph of the watch — Mission to the Moon
  // has two, from slightly different angles, that no scale and offset can
  // reconcile. Frames are grouped by what registers onto what, and each group
  // gets its own anchor and outline.
  const notes = [];
  let pool = frames;
  while (pool.length) {
    const { group, rest, anchor } = await gather(pool);
    notes.push(await processGroup(group, anchor, sku, dir));
    pool = rest;
  }
  console.log(`${set.padEnd(46)} ${String(frames.length).padStart(2)} frames · ${notes.join(" ‖ ")}`);
}
