/**
 * Builds the Strap Studio's photo sets.
 *
 * Wristbuddys (wristbuddys.com) photograph every strap colour fitted to the
 * actual MoonSwatch model it is made for, in a consistent studio setup — same
 * angle, same framing, same flat #f4f4f4 background. That makes them usable as
 * a real "try this strap on this watch" sequence: only the strap changes
 * between frames, so cross-fading them reads as one watch being re-strapped.
 *
 * Run with: npm run strap-photos
 * Writes   : media/products/strap-photos/<set>/<variant>.webp
 *            src/data/strap-photos.json
 *
 * ⚠️ The photography belongs to Wristbuddys. Fine for a design preview;
 * licence it or reshoot before this is a live storefront. See README.
 */
import sharp from "sharp";
import { analyse, cutout } from "./lib/cutout.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const ORIGIN = "https://wristbuddys.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const OUT_IMG = "media/products/strap-photos";
const OUT_JSON = "src/data/strap-photos.json";

/**
 * Every shot is the same product on the same background, so one fixed crop
 * keeps the watch pinned in place across the whole set — which is the entire
 * trick behind the swap looking like a re-strap rather than a slideshow.
 * Measured from the content bounding box: x 0.22–0.81, y 0.11–0.89.
 */
const CROP = { x0: 0.195, x1: 0.835, y0: 0.075, y1: 0.925 };
const WIDTH = 700;
const QUALITY = 72;

/**
 * The picker swatch: a square cut out of the strap below the case, spanning
 * its full width so both lines of stitching are in frame. Below rather than
 * above because there is more clear strap there — above the lugs the run is
 * too short for a square at full strap width, and the crop catches bezel.
 * Fractions are of the cropped frame, not the source.
 */
const CHIP = { x0: 0.315, x1: 0.635 };
const CHIP_PX = 180;

/** Wristbuddys product handle → the WTC product slugs it covers. */
const SETS = {
  "mission-to-the-sun": ["mission-to-the-sun"],
  "mission-to-mercury": ["mission-to-mercury"],
  "mission-to-venus": ["mission-to-venus"],
  "mission-on-earth": ["mission-on-earth"],
  "mission-to-the-moon": ["mission-to-the-moon"],
  "mission-to-mars": ["mission-to-mars"],
  "mission-to-jupiter": ["mission-to-jupiter"],
  "mission-to-saturn": ["mission-to-saturn"],
  "mission-to-uranus": ["mission-to-uranus"],
  "mission-to-neptune": ["mission-to-neptune"],
  "mission-to-pluto": ["mission-to-pluto"],
  "mission-to-the-moonphase": ["mission-to-the-moonphase-full-moon"],
  "mission-to-the-moonphase-new-moon": ["mission-to-the-moonphase-new-moon"],
  "mission-to-the-super-blue-moonphase": ["mission-to-the-super-blue-moonphase"],
  "mission-to-the-pink-moonphase": ["mission-to-the-pink-moonphase"],
  "mission-to-earthphase": ["mission-to-earthphase"],
  // The monthly Moonshine Gold references are the same watch from the front —
  // only the caseback engraving differs — so they share one photo set.
  "mission-to-earthphase-moonshine-gold": [
    "mission-to-earthphase-moonshine-gold-august",
    "mission-to-earthphase-moonshine-gold-september",
    "mission-to-earthphase-moonshine-gold-october",
    "mission-to-earthphase-moonshine-gold-november",
  ],
  "mission-to-earthphase-moonshine-gold-cold-moon": [
    "mission-to-earthphase-moonshine-gold-december",
  ],
  "mission-on-earth-lava": ["mission-on-earth-lava"],
  "mission-on-earth-polar-lights": ["mission-on-earth-polar-lights"],
  "mission-on-earth-desert": ["mission-on-earth-desert"],
  "1965": ["moonswatch-1965"],
  "mission-to-the-moon-1969": ["mission-to-the-moon-1969"],
};

const handleFor = (set) =>
  set === "1965"
    ? "rubber-strap-for-omega-x-swatch-moonswatch-1965"
    : `rubber-strap-for-omega-x-swatch-moonswatch-${set}`;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const hex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

async function getJSON(url) {
  return JSON.parse((await getBuffer(url)).toString("utf8"));
}

/**
 * The untouched source frame, kept on disk.
 *
 * The cut-out is the part of this script worth iterating on, and re-running it
 * used to mean pulling 200-odd photographs off someone else's CDN again for
 * bytes that never change. The cache makes a re-process local and instant, and
 * a rate-limited run no longer costs a whole batch. It is build input, not
 * output, so it stays out of git.
 */
const CACHE = ".cache/wristbuddys";

async function getBuffer(url) {
  const key = createHash("sha1").update(url).digest("hex").slice(0, 16);
  const file = path.join(CACHE, `${key}.bin`);
  try {
    return await readFile(file);
  } catch {
    // Not cached yet.
  }
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, buf);
  return buf;
}

/** Modal colour of a region, quantised to 5 bits per channel then averaged. */
function dominant(data, w, h, x0, x1, y0, y1) {
  const buckets = new Map();
  for (let y = Math.round(y0 * h); y < Math.round(y1 * h); y++) {
    for (let x = Math.round(x0 * w); x < Math.round(x1 * w); x++) {
      const i = (y * w + x) * 3;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      // Skip the studio background so it cannot win the vote.
      if (r > 232 && g > 232 && b > 232) continue;
      const key = (r >> 3) * 1024 + (g >> 3) * 32 + (b >> 3);
      let e = buckets.get(key);
      if (!e) buckets.set(key, (e = { n: 0, r: 0, g: 0, b: 0 }));
      e.n++; e.r += r; e.g += g; e.b += b;
    }
  }
  if (!buckets.size) return "#8a8a8a";
  const top = [...buckets.values()].sort((a, b) => b.n - a.n)[0];
  return hex([top.r / top.n, top.g / top.n, top.b / top.n]);
}

async function processImage(buf, dest, chipDest) {
  const meta = await sharp(buf).metadata();
  const left = Math.round(CROP.x0 * meta.width);
  const top = Math.round(CROP.y0 * meta.height);
  const width = Math.round((CROP.x1 - CROP.x0) * meta.width);
  const height = Math.round((CROP.y1 - CROP.y0) * meta.height);

  const pipeline = sharp(buf)
    .extract({ left, top, width, height })
    .resize({ width: WIDTH, withoutEnlargement: true });

  // Colour is sampled before the background goes, while the strap is still
  // sitting on a known neutral.
  const flat = await pipeline.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const color = dominant(flat.data, flat.info.width, flat.info.height, 0.4, 0.6, 0.02, 0.12);

  // The watch is lifted off the studio background so it sits on the page.
  const raw = await pipeline.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const geom = analyse(raw.data, raw.info.width, raw.info.height);
  cutout(raw.data, raw.info.width, raw.info.height, { geometry: geom });
  const out = await sharp(raw.data, {
    raw: { width: raw.info.width, height: raw.info.height, channels: 4 },
  })
    .webp({ quality: QUALITY, alphaQuality: 90 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(dest, out.data);

  // Swatch: a square of the strap below the case, stitching included. Placed
  // from the measured geometry rather than a fixed offset — the run of strap
  // below the lugs is a different length in every shot, and a fixed crop
  // lands on bezel in some and on bare background in others.
  const fw = flat.info.width;
  const fh = flat.info.height;
  let side = Math.round((CHIP.x1 - CHIP.x0) * fw);
  const floor = geom.caseBottom + 8;
  let chipTop = geom.subjectBottom - side - 10;
  if (chipTop < floor) {
    chipTop = floor;
    side = Math.min(side, geom.subjectBottom - 6 - chipTop);
  }
  if (side < 60 || chipTop < 0 || chipTop + side > fh) {
    side = Math.round((CHIP.x1 - CHIP.x0) * fw);
    chipTop = Math.min(fh - side, Math.round(fh * 0.74));
  }

  const chip = await sharp(flat.data, {
    raw: { width: fw, height: fh, channels: 3 },
  })
    .extract({
      left: Math.round(CHIP.x0 * fw) + Math.round(((CHIP.x1 - CHIP.x0) * fw - side) / 2),
      top: chipTop,
      width: side,
      height: side,
    })
    .resize({ width: CHIP_PX, height: CHIP_PX })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(chipDest, chip);

  return {
    color,
    width: out.info.width,
    height: out.info.height,
    bytes: out.data.length + chip.length,
  };
}

const only = process.argv.slice(2);
const sets = {};
const bySlug = {};
let downloaded = 0;
let bytes = 0;

for (const [set, slugs] of Object.entries(SETS)) {
  if (only.length && !only.includes(set)) continue;

  let product;
  try {
    product = await getJSON(`${ORIGIN}/products/${handleFor(set)}.js`);
  } catch (e) {
    console.warn(`! ${set}: ${e.message}`);
    continue;
  }

  const dir = path.join(OUT_IMG, set);
  const chipDir = path.join(dir, "chips");
  await mkdir(chipDir, { recursive: true });

  const straps = [];
  for (const v of product.variants) {
    if (!v.featured_image) continue;
    const id = slugify(v.title);
    const file = `${id}.webp`;
    const dest = path.join(dir, file);
    const chipDest = path.join(chipDir, file);

    try {
      const meta = await processImage(
        await getBuffer(`${v.featured_image.src}?width=1200`),
        dest,
        chipDest
      );
      downloaded++;
      bytes += meta.bytes;
      straps.push({
        id,
        name: v.title,
        color: meta.color,
        image: `/products/strap-photos/${set}/${file}`,
        chip: `/products/strap-photos/${set}/chips/${file}`,
        width: meta.width,
        height: meta.height,
      });
    } catch (e) {
      console.warn(`  ! ${set}/${id}: ${e.message}`);
    }
  }

  if (!straps.length) continue;
  sets[set] = { source: `${ORIGIN}/products/${handleFor(set)}`, straps };
  for (const slug of slugs) bySlug[slug] = set;
  console.log(`${set.padEnd(46)} ${String(straps.length).padStart(2)} straps`);
}

// A run limited to named sets merges into what is already there. Overwriting
// would leave the other 20-odd sets out of the manifest while their images sat
// on disk — and that is a data-loss shape, not a partial update.
let merged = { sets, bySlug };
if (only.length) {
  try {
    const existing = JSON.parse(await readFile(OUT_JSON, "utf8"));
    merged = {
      sets: { ...existing.sets, ...sets },
      bySlug: { ...existing.bySlug, ...bySlug },
    };
  } catch {
    // No manifest yet — the fresh one stands on its own.
  }
}

await writeFile(OUT_JSON, JSON.stringify(merged, null, 2) + "\n");
console.log(
  `\n${Object.keys(sets).length} sets · ${Object.values(sets).reduce((n, s) => n + s.straps.length, 0)} photos ` +
    `(${downloaded} downloaded, ${(bytes / 1e6).toFixed(1)} MB total)`
);
