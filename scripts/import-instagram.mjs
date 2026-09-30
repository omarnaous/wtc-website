/**
 * Imports an Instagram grid captured from the rendered profile page.
 *
 * Instagram serves logged-out visitors a JS shell — `curl` gets no post data —
 * but the page does render the grid client-side, so the shortcodes and
 * thumbnail URLs are readable from the DOM. `scripts/ig-capture.js` is the
 * snippet that reads them; paste its output into scripts/ig-raw.json and run
 * this to download the media locally and write src/data/instagram.json.
 *
 * Local copies matter: Instagram's CDN URLs carry a signature that expires
 * within days, so hot-linking them would break the page quietly.
 *
 * `npm run instagram` (the Graph API path) is the durable alternative once
 * there is an access token — it needs no manual capture step.
 */
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const RAW = process.argv[2] ?? "scripts/ig-raw.json";
const COUNT = Number(process.env.INSTAGRAM_COUNT ?? 6);
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const raw = JSON.parse(await readFile(RAW, "utf8"));

const grab = async (url) => {
  const r = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://www.instagram.com/" } });
  if (!r.ok) throw new Error(`${r.status}`);
  return Buffer.from(await r.arrayBuffer());
};

await mkdir("public/instagram", { recursive: true });
const posts = [];

for (const p of (raw.posts ?? []).slice(0, COUNT)) {
  try {
    const buf = await grab(p.img);
    const file = `${p.code}.webp`;
    await sharp(buf)
      .resize(640, 640, { fit: "cover", position: "attention" })
      .webp({ quality: 78 })
      .toFile(path.join("public/instagram", file));
    posts.push({
      id: p.code,
      image: `/instagram/${file}`,
      permalink: p.href,
      caption: p.alt ?? "",
      isVideo: p.kind === "reel",
    });
    console.log(`  ${p.code}`);
  } catch (e) {
    console.warn(`  ! ${p.code}: ${e.message}`);
  }
}

if (raw.avatar?.src) {
  await mkdir("public/brand", { recursive: true });
  try {
    const buf = await grab(raw.avatar.src);
    await sharp(buf).resize(256, 256, { fit: "cover" }).png().toFile("public/brand/logo.png");
    console.log("  avatar -> public/brand/logo.png");
  } catch (e) {
    console.warn(`  ! avatar: ${e.message}`);
  }
}

await writeFile(
  "src/data/instagram.json",
  JSON.stringify({ fetchedAt: new Date().toISOString(), posts }, null, 2) + "\n"
);
console.log(`${posts.length} posts imported`);
