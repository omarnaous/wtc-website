/**
 * Pulls the latest posts from the client's Instagram into the site.
 *
 * This is a static export, so there is no server to call Instagram at request
 * time — the feed is fetched at build time and baked in, the same way the
 * strap photography is.
 *
 * Instagram has no public, unauthenticated way to read a profile's posts any
 * more: the Basic Display API was retired in December 2024, and a logged-out
 * profile page returns only an empty JS shell. So this needs a token.
 *
 *   1. The account must be a Business or Creator account linked to a
 *      Facebook Page.
 *   2. Create a Meta app and get a long-lived Instagram Graph API token with
 *      `instagram_basic`.
 *   3. Run:  INSTAGRAM_TOKEN=... INSTAGRAM_USER_ID=... npm run instagram
 *
 * Writes src/data/instagram.json and downloads the thumbnails into
 * media/instagram/ so the site never hot-links Instagram's CDN (those URLs
 * expire within days).
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.INSTAGRAM_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID ?? "me";
const COUNT = Number(process.env.INSTAGRAM_COUNT ?? 6);

const OUT_DIR = "media/instagram";
const OUT_JSON = "src/data/instagram.json";

if (!TOKEN) {
  console.error(
    "INSTAGRAM_TOKEN is not set — see the header of this file for how to get one.\n" +
      "Nothing was written; the site keeps its current Instagram section."
  );
  process.exit(1);
}

const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
const url =
  `https://graph.instagram.com/${USER_ID}/media` +
  `?fields=${fields}&limit=${COUNT}&access_token=${TOKEN}`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`Instagram returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  process.exit(1);
}

const { data = [] } = await res.json();
await mkdir(OUT_DIR, { recursive: true });

const posts = [];
for (const m of data.slice(0, COUNT)) {
  // Videos and reels expose a still in thumbnail_url; images use media_url.
  const source = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
  if (!source) continue;

  const file = `${m.id}.webp`;
  try {
    const buf = Buffer.from(await (await fetch(source)).arrayBuffer());
    await sharp(buf)
      .resize(640, 640, { fit: "cover", position: "attention" })
      .webp({ quality: 78 })
      .toFile(path.join(OUT_DIR, file));
  } catch (e) {
    console.warn(`  ! ${m.id}: ${e.message}`);
    continue;
  }

  posts.push({
    id: m.id,
    image: `/instagram/${file}`,
    permalink: m.permalink,
    caption: (m.caption ?? "").split("\n")[0].slice(0, 120),
    isVideo: m.media_type === "VIDEO",
    timestamp: m.timestamp,
  });
}

await writeFile(OUT_JSON, JSON.stringify({ fetchedAt: new Date().toISOString(), posts }, null, 2) + "\n");
console.log(`${posts.length} posts written to ${OUT_JSON}`);
