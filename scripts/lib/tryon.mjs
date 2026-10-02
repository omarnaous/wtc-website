/**
 * Shared by the try-on generators (make-velcro-tryons.mjs and
 * make-strap-tryons.mjs): the reference frame every Swatch packshot is
 * brought into, the case mask, and the R2 / D1 plumbing.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

export const SITE = "https://wtc-website.josephboutrosnassif.workers.dev";
export const ACCOUNT = "4df5a97789f22e17ff5f50da97c2fefb";
export const BUCKET = "wtc-media";
export const WRANGLER = "./node_modules/.bin/wrangler";

// The reference frame: Mission to the Moon's packshot, 1080×1080.
export const N = 1080;
export const REF = { cx: 538.5, cy: 531, half: 269.5 }; // band centre, case centre row, centre → bezel's left edge
// The strap's columns, between the lugs — a pixel in from the lugs' inner
// faces, so no lug of the strap's own watch shows down the strap's edge.
export const BAND = [408.5, 669.5];
export const CASE_R = 262; // case outline, centred on (539, 530.6)
export const CASE_C = [539, 530.6];
// The case runs from the top of the lugs to the bottom of them. Beyond that,
// even outside the band, everything belongs to the strap (its keeper loops).
export const LUGS = [236, 856];
// Studio frame: 700×1195, i.e. a 609×1040 window of the reference frame.
export const CROP = { x: 235, y: 20, w: 609, h: 1040 };
export const OUT = { w: 700, h: 1195 };

export function d1(sql) {
  // The D1 API drops the odd request ("fetch failed"); a few tries ride it out.
  let last;
  for (let i = 0; i < 4; i++) {
    try {
      const out = execFileSync(WRANGLER, ["d1", "execute", "wtc-store", "--remote", "--json", "--command", sql], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        maxBuffer: 64 * 1024 * 1024,
      });
      const parsed = JSON.parse(out);
      if (!Array.isArray(parsed)) throw new Error(JSON.stringify(parsed));
      return parsed.flatMap((r) => r.results ?? []);
    } catch (e) {
      last = e;
      execFileSync("sleep", [String(2 * (i + 1))]);
    }
  }
  throw last;
}
export const token = () =>
  readFileSync(join(homedir(), "Library/Preferences/.wrangler/config/default.toml"), "utf8").match(
    /oauth_token\s*=\s*"([^"]+)"/,
  )[1];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function put(key, body, type) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/objects/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  for (let i = 0; i < 7; i++) {
    const res = await fetch(url, {
      method: "PUT",
      headers: { authorization: `Bearer ${token()}`, "content-type": type },
      body,
    });
    if (res.ok) return;
    if (res.status === 401 || res.status === 403) {
      // The OAuth token lasts an hour; any wrangler call refreshes it.
      execFileSync(WRANGLER, ["whoami"], { stdio: "ignore" });
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      await sleep(800 * 2 ** i);
      continue;
    }
    throw new Error(`PUT ${key}: ${res.status} ${await res.text()}`);
  }
  throw new Error(`PUT ${key}: gave up`);
}

/** RGBA raw of a packshot, 1080 square. */
export async function load(src) {
  let buf;
  if (src.startsWith("file:")) buf = readFileSync(src.slice(5));
  else {
    const res = await fetch(SITE + src);
    if (!res.ok) throw new Error(`${src}: ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  }
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .resize(N, N, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/**
 * Where this packshot's watch sits: the strap's centre line, the row where
 * the bezel reaches furthest left (the case's centre), and that left edge.
 * Null when there is no strap to measure — a packshot that is not a watch
 * straight on.
 */
export function measure({ data, w, h }) {
  const a = (x, y) => data[(y * w + x) * 4 + 3];
  let top = -1;
  for (let y = 0; y < h && top < 0; y++) for (let x = 0; x < w; x++) if (a(x, y) > 128) { top = y; break; }
  if (top < 0) return null;
  // Strap band, a little below the top of the strap.
  const span = (y) => {
    let l = -1, r = -1;
    for (let x = 0; x < w; x++) if (a(x, y) > 128) { if (l < 0) l = x; r = x; }
    return [l, r];
  };
  const [sl, sr] = span(top + 40);
  let minL = 1e9, rows = [];
  for (let y = Math.round(h * 0.3); y < Math.round(h * 0.7); y++) {
    const [l] = span(y);
    if (l < 0) continue;
    if (l < minL) { minL = l; rows = [y]; } else if (l === minL) rows.push(y);
  }
  const cx = (sl + sr) / 2;
  const cy = rows.length ? (rows[0] + rows[rows.length - 1]) / 2 : h / 2;
  const half = cx - minL;
  const strapWidth = sr - sl;
  // A straight-on MoonSwatch: the strap is about half the bezel's diameter.
  const ratio = strapWidth / (2 * half);
  if (!(half > 150 && ratio > 0.38 && ratio < 0.56)) return null;
  // And the strap has to run well clear of the case, above and below.
  if (top > cy - 1.2 * half) return null;
  return { cx, cy, half };
}

/**
 * Nudges a measurement until the watch's outline — lugs, case flanks and
 * pushers, everything beside the strap — sits on the reference outline.
 * The first measurement is good to a pixel or two; this takes out the rest,
 * which is the difference between a clean join and a sliver of the wrong
 * case showing at the edge of the strap.
 */
export function refine(img, m, ref) {
  const a = (x, y) => (x < 0 || y < 0 || x >= img.w || y >= img.h ? 0 : img.data[(y * img.w + x) * 4 + 3]);
  const pts = [];
  for (let y = LUGS[0]; y < LUGS[1]; y += 2)
    for (let x = 250; x < 860; x += 2) if (x < BAND[0] - 2 || x > BAND[1] + 2) pts.push([x, y, ref(x, y)]);
  const cost = (s, ox, oy) => {
    let bad = 0;
    for (const [X, Y, want] of pts) {
      const sx = Math.round((X - REF.cx - ox) / s + m.cx), sy = Math.round((Y - REF.cy - oy) / s + m.cy);
      if (a(sx, sy) > 128 !== want) bad++;
    }
    return bad;
  };
  const s0 = REF.half / m.half;
  let best = { s: s0, ox: 0, oy: 0, c: cost(s0, 0, 0) };
  for (let k = -6; k <= 6; k++) {
    const s = s0 * (1 + k * 0.002);
    for (let ox = -3; ox <= 3; ox++) for (let oy = -4; oy <= 4; oy++) {
      const c = cost(s, ox, oy);
      if (c < best.c) best = { s, ox, oy, c };
    }
  }
  // Sub-pixel: the same search at quarter pixels around the winner.
  const coarse = best;
  for (let ox = -0.75; ox <= 0.75; ox += 0.25) for (let oy = -0.75; oy <= 0.75; oy += 0.25) {
    const c = cost(coarse.s, coarse.ox + ox, coarse.oy + oy);
    if (c < best.c) best = { s: coarse.s, ox: coarse.ox + ox, oy: coarse.oy + oy, c };
  }
  return { ...m, s: best.s, ox: best.ox, oy: best.oy };
}

/** Resamples a packshot into the reference frame (premultiplied bilinear). */
export function normalise(img, m) {
  const s = m.s ?? REF.half / m.half;
  const ox = m.ox ?? 0, oy = m.oy ?? 0;
  const out = new Float32Array(N * N * 4);
  const src = img.data;
  const W = img.w, H = img.h;
  for (let Y = 0; Y < N; Y++) {
    const sy = (Y - REF.cy - oy) / s + m.cy;
    const y0 = Math.floor(sy), fy = sy - y0;
    for (let X = 0; X < N; X++) {
      const sx = (X - REF.cx - ox) / s + m.cx;
      const x0 = Math.floor(sx), fx = sx - x0;
      let r = 0, g = 0, b = 0, al = 0;
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const x = x0 + i, y = y0 + j;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const wgt = (i ? fx : 1 - fx) * (j ? fy : 1 - fy);
        const k = (y * W + x) * 4;
        const aa = (src[k + 3] / 255) * wgt;
        r += src[k] * aa; g += src[k + 1] * aa; b += src[k + 2] * aa; al += aa;
      }
      const o = (Y * N + X) * 4;
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = al; // premultiplied
    }
  }
  return out;
}

/**
 * Where the case meets the strap across the band: the case's outer rim is a
 * circle there (measured on Sun, yellow against a white strap), and the
 * outline sits just outside it so the rim of the strap's own watch is always
 * covered by the rim of the watch on show.
 */
export const RIM = CASE_R + 2.5;
export function outline() {
  const top = new Float32Array(N);
  const bot = new Float32Array(N);
  for (let x = 0; x < N; x++) {
    const dx = x - CASE_C[0];
    const h = Math.sqrt(Math.max(0, RIM * RIM - dx * dx));
    top[x] = CASE_C[1] - h;
    bot[x] = CASE_C[1] + h;
  }
  return { top, bot };
}

/** How much of the watch on show replaces the strap's own watch, per pixel. */
export function buildMask(edge) {
  const m = new Float32Array(N * N);
  const feather = (d) => Math.min(1, Math.max(0, d)); // 1px ramp
  // One pixel of overlap: a hair of the case's own strap at the join is far
  // less visible than a hair of another watch's case.
  const GROW = 0;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const inBand = Math.min(x - BAND[0], BAND[1] - x);
    const inLugs = feather(Math.min(y - LUGS[0], LUGS[1] - y) + 0.5);
    const outBand = feather(-inBand + 0.5) * inLugs;
    const inCase = feather(Math.min(y - (edge.top[x] - GROW), edge.bot[x] + GROW - y) + 0.5);
    m[y * N + x] = Math.max(outBand, inBand > -0.5 ? inCase : 0);
  }
  return m;
}

export function compose(strapWatch, caseWatch) {
  const out = Buffer.alloc(N * N * 4);
  for (let p = 0; p < N * N; p++) {
    const k = p * 4, t = MASK[p];
    const a = strapWatch[k + 3] * (1 - t) + caseWatch[k + 3] * t;
    for (let c = 0; c < 3; c++) {
      const v = strapWatch[k + c] * (1 - t) + caseWatch[k + c] * t;
      out[k + c] = a > 0.001 ? Math.min(255, Math.round(v / a)) : 0;
    }
    out[k + 3] = Math.round(a * 255);
  }
  return out;
}

export const frame = (raw) =>
  sharp(raw, { raw: { width: N, height: N, channels: 4 } })
    .extract({ left: CROP.x, top: CROP.y, width: CROP.w, height: CROP.h })
    .resize(OUT.w, OUT.h, { kernel: "lanczos3" })
    .webp({ quality: 82, alphaQuality: 90, effort: 5 })
    .toBuffer();

export const chipOf = (raw) =>
  sharp(raw, { raw: { width: N, height: N, channels: 4 } })
    .extract({ left: 421, top: 810, width: 236, height: 236 })
    .resize(160, 160)
    .flatten({ background: "#16161a" })
    .webp({ quality: 82 })
    .toBuffer();

/** Straight RGBA bytes from a premultiplied float frame. */
export function unpremultiply(f) {
  const out = Buffer.alloc(N * N * 4);
  for (let p = 0; p < N * N; p++) {
    const k = p * 4, a = f[k + 3];
    for (let c = 0; c < 3; c++) out[k + c] = a > 0.001 ? Math.min(255, Math.round(f[k + c] / a)) : 0;
    out[k + 3] = Math.round(a * 255);
  }
  return out;
}


export const MASK = buildMask(outline());

/**
 * Every Omega × Swatch watch with a usable packshot, brought into the
 * reference frame: slug → premultiplied RGBA floats, N×N.
 */
export async function loadWatches(products, packshots) {
  const watches = new Map();
  const refRow = products.find((p) => p.slug === "mission-to-the-moon");
  const refImg = await load(JSON.parse(refRow.photos).find((s) => s.includes("_sa200")));
  const refFrame = normalise(refImg, measure(refImg));
  const refAlpha = (x, y) => refFrame[(y * N + x) * 4 + 3] > 0.5;
  for (const p of products) {
    let src = JSON.parse(p.photos || "[]").find((s) => s.includes("/products/watches/") && s.includes("_sa200"));
    const local = packshots && join(packshots, `${p.sku}_sa200.png`);
    if (!src && local && existsSync(local)) src = `file:${local}`;
    if (!src) { console.log(`– ${p.slug}: no Swatch packshot, skipped`); continue; }
    const img = await load(src);
    const m0 = measure(img);
    if (!m0) { console.log(`– ${p.slug}: packshot is not a watch straight on, skipped`); continue; }
    const m = refine(img, m0, refAlpha);
    watches.set(p.slug, normalise(img, m));
  }
  return watches;
}

/**
 * Writes product_straps rows. An existing pairing keeps its order and price;
 * its photograph is kept too, unless `replace` — used when every frame of a
 * watch is being redrawn into the shared framing.
 */
export function writePairings(rows, { replace = false } = {}) {
  const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
  for (let i = 0; i < rows.length; i += 60) {
    const sql = rows
      .slice(i, i + 60)
      .map(
        (r) =>
          `INSERT INTO product_straps (product_slug, strap_sku, position, is_default, photo, chip)
           VALUES (${q(r.slug)}, ${q(r.sku)}, ${r.position}, 0, ${q(r.photo)}, ${q(r.chip)})
           ON CONFLICT(product_slug, strap_sku) DO UPDATE SET
             photo = ${replace ? "excluded.photo" : "COALESCE(product_straps.photo, excluded.photo)"},
             chip  = COALESCE(product_straps.chip, excluded.chip);`,
      )
      .join("\n");
    d1(sql);
  }
}
