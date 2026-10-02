#!/usr/bin/env node
/**
 * Writes the small copies the storefront draws at card and thumbnail size.
 *
 * Every watch photograph is a 1080px PNG of around 200 KB, and the catalogue
 * draws thirty of them at a few hundred pixels — six-odd megabytes for one
 * page. This reads each one back from the live shop, scales it to 640px wide
 * as WebP (alpha kept) and stores it in R2 under `thumbs/<original key>`,
 * which is where src/lib/thumb.ts points. A photograph without a thumbnail
 * still works: the media route falls back to the original.
 *
 *   node scripts/make-thumbs.mjs            # only the missing ones
 *   node scripts/make-thumbs.mjs --force    # all of them again
 *
 * Needs a logged-in wrangler (it borrows its OAuth token for the R2 API).
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const SITE = process.env.SITE ?? "https://wtc-website.josephboutrosnassif.workers.dev";
const ACCOUNT = "4df5a97789f22e17ff5f50da97c2fefb";
const BUCKET = "wtc-media";
const FORCE = process.argv.includes("--force");
const WRANGLER = "./node_modules/.bin/wrangler";

function d1(sql) {
  const out = execFileSync(WRANGLER, ["d1", "execute", "wtc-store", "--remote", "--json", "--command", sql], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  return JSON.parse(out)[0].results;
}

function token() {
  const toml = readFileSync(join(homedir(), "Library/Preferences/.wrangler/config/default.toml"), "utf8");
  return toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function r2(method, key, body, type) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/objects/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, {
      method,
      headers: { authorization: `Bearer ${token()}`, ...(type ? { "content-type": type } : {}) },
      body,
    });
    if (res.status === 429 || res.status >= 500) {
      await sleep(1000 * 2 ** attempt);
      continue;
    }
    return res;
  }
  throw new Error(`${method} ${key}: gave up`);
}

// Every photograph a watch uses, plus each strap's own packshot.
const products = d1(`SELECT photos FROM products`);
const straps = d1(`SELECT image FROM straps`);
const paths = new Set();
for (const p of products) for (const src of JSON.parse(p.photos || "[]")) paths.add(src);
for (const s of straps) if (s.image) paths.add(s.image);
const keys = [...paths].filter((p) => p.startsWith("/api/media/")).map((p) => p.slice("/api/media/".length));

console.log(`${keys.length} photographs`);

let made = 0;
let skipped = 0;
let failed = 0;
const queue = [...keys];
async function worker() {
  for (let key; (key = queue.shift()); ) {
    const dest = `thumbs/${key}`;
    try {
      if (!FORCE) {
        const head = await fetch(`${SITE}/api/media/${dest}`, { method: "HEAD" });
        if (head.ok && head.headers.get("content-type") === "image/webp") {
          skipped++;
          continue;
        }
      }
      const src = await fetch(`${SITE}/api/media/${key}`);
      if (!src.ok) throw new Error(`source ${src.status}`);
      const input = Buffer.from(await src.arrayBuffer());
      const width = key.startsWith("products/straps/") ? 360 : 640;
      const out = await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80, alphaQuality: 90, effort: 5 })
        .toBuffer();
      const res = await r2("PUT", dest, out, "image/webp");
      if (!res.ok) throw new Error(`upload ${res.status} ${await res.text()}`);
      made++;
      console.log(`✓ ${key}  ${Math.round(input.length / 1024)} KB → ${Math.round(out.length / 1024)} KB`);
    } catch (e) {
      failed++;
      console.error(`✗ ${key}: ${e.message}`);
    }
  }
}
await Promise.all([worker(), worker(), worker()]);
console.log(`made ${made}, already there ${skipped}, failed ${failed}`);
process.exit(failed ? 1 : 0);
