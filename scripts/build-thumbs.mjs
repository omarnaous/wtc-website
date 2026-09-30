/**
 * Builds the small watch thumbnails.
 *
 * The Strap Studio's watch picker draws every watch in the catalogue at 44px.
 * The source photography is 1080px PNG — around 200 KB each, 4.8 MB for the
 * set — and images are served unoptimised (Cloudflare Images is a paid add-on,
 * and a static export has no optimiser at all), so without this the picker
 * would pull the full-size shots down a phone connection to draw thumbnails.
 *
 * Run with: npm run thumbs
 * Writes   : media/products/watches/thumbs/<name>.webp
 *            src/data/watch-thumbs.json
 *
 * The manifest is what makes the swap safe: the helper in src/lib/thumb.ts
 * only substitutes a thumbnail that this script actually wrote, so a product
 * pointing at some other image keeps pointing at it.
 */
import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = "media/products/watches";
const OUT = path.join(DIR, "thumbs");
const MANIFEST = "src/data/watch-thumbs.json";
const SIZE = 128; // 44px at 2.5x, with room for a denser screen

await mkdir(OUT, { recursive: true });

const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const map = {};
let before = 0;
let after = 0;

for (const file of files) {
  const name = file.replace(/\.[^.]+$/, "") + ".webp";
  const out = await sharp(path.join(DIR, file))
    .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, alphaQuality: 80 })
    .toBuffer();
  await writeFile(path.join(OUT, name), out);
  map[`/products/watches/${file}`] = `/products/watches/thumbs/${name}`;
  after += out.length;
}

for (const file of files) {
  const { size } = await (await import("node:fs/promises")).stat(path.join(DIR, file));
  before += size;
}

await writeFile(MANIFEST, JSON.stringify(map, null, 2) + "\n");
console.log(
  `${files.length} thumbnails · ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(2)} MB`,
);
