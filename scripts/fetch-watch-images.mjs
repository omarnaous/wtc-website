/**
 * Downloads the three packshots each watch in src/data/products.ts needs.
 *
 * Swatch serves every reference from one CDN pattern, so the reference is all
 * it takes. Files already on disk are left alone; only missing ones are
 * fetched, which makes this safe to re-run after adding a seed.
 *
 * Run with: npm run watches          (fetch, palette, thumbs, manifest, push to R2)
 *           node scripts/fetch-watch-images.mjs SSX03R100N   (just one)
 * Writes   : media/products/watches/<SKU>_sa{200,300,000}.png
 *
 * A reference only appears on the site once its sa200 is on disk and
 * `npm run images` has listed it — see the filter in products.ts.
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = "media/products/watches";
const VIEWS = ["sa200", "sa300", "sa000"];
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const url = (sku, view) =>
  `https://static.swatch.com/images/product/${sku}/${view}/${sku}_${view}_er003m.png`;

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );

async function skus() {
  const argv = process.argv.slice(2);
  if (argv.length) return argv;
  // Every quoted Swatch reference in the seeds — the object literals and the
  // Royal Pop tuples alike. Strap references (ACSO…) do not match.
  const src = await readFile("src/data/products.ts", "utf8");
  return [...new Set([...src.matchAll(/"((?:SO33|SSX)[0-9A-Z]+)"/g)].map((m) => m[1]))];
}

await mkdir(OUT, { recursive: true });
const missing = [];
let fetched = 0;

for (const sku of await skus()) {
  for (const view of VIEWS) {
    const file = path.join(OUT, `${sku}_${view}.png`);
    if (await exists(file)) continue;
    const res = await fetch(url(sku, view), { headers: { "user-agent": UA } }).catch((e) => e);
    if (!(res instanceof Response) || !res.ok) {
      missing.push(`${sku} ${view} — ${res instanceof Response ? res.status : res.message}`);
      continue;
    }
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    fetched++;
    console.log(`✓ ${sku}_${view}.png`);
  }
}

console.log(`\n${fetched} downloaded.`);
if (missing.length) {
  console.log(`${missing.length} not available:\n  ${missing.join("\n  ")}`);
  console.log(
    "\nA reference without its sa200 stays off the site. Drop the three files in by hand " +
      `(${OUT}/<SKU>_sa200.png, _sa300.png, _sa000.png), then \`npm run images && npm run media:push\`.`,
  );
}
