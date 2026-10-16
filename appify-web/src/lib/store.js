// Live App Store listings for app cards. Given an App Store link (https://apps.apple.com/<cc>/app/<name>/id<digits>),
// reads Apple's public lookup API for the icon, name, developer, rating, category, price and the store screenshots.
// Only a real listing is cached (6 hours, at the edge); a failed or empty lookup is retried on the next render and
// its reason is kept in settings.store_debug. Any failure returns null and the card falls back to the placeholder phone.

const LOOKUP = "https://itunes.apple.com/lookup";
const TTL = 21600;
// mzstatic serves any size/format from the same path: ask for small WebP versions.
const sized = (u, spec) => (u || "").replace(/\/[^/]+\.(jpg|jpeg|png|webp)$/i, `/${spec}.webp`);

export function parseStoreUrl(url) {
  const id = String(url || "").match(/id(\d{6,})/)?.[1];
  if (!id) return null;
  const cc = String(url).match(/apps\.apple\.com\/([a-z]{2})\//i)?.[1]?.toLowerCase() || "us";
  return { id, cc };
}

async function lookup(base, id, cc) {
  const url = `${base}?id=${id}${cc ? `&country=${cc}` : ""}&entity=software`;
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const key = new Request(url);
  const hit = await cache?.match(key);
  if (hit) return { r: (await hit.json())?.results?.[0], status: "cache" };
  const res = await fetch(url, { headers: { accept: "application/json", "user-agent": "Mozilla/5.0 (compatible; Appify/1.0; +https://www.appify-lb.com)" }, signal: AbortSignal.timeout(3000) });
  if (!res.ok) return { r: null, status: res.status };
  const body = await res.text();
  const r = JSON.parse(body)?.results?.[0];
  if (r && cache) await cache.put(key, new Response(body, { headers: { "content-type": "application/json", "cache-control": `public, max-age=${TTL}` } }));
  return { r, status: r ? 200 : "empty" };
}

export async function storeListing(env, url) {
  const ref = parseStoreUrl(url);
  if (!ref) return null;
  const base = env.STORE_LOOKUP || LOOKUP; // overridable for local tests only
  const tried = [];
  // the link's own storefront first, then Lebanon, then Apple's default storefront
  for (const cc of [...new Set([ref.cc, "lb", ""])]) {
    try {
      const { r, status } = await lookup(base, ref.id, cc);
      tried.push(`${cc || "default"}:${status}`);
      if (!r) continue;
      const shots = (r.screenshotUrls?.length ? r.screenshotUrls : r.ipadScreenshotUrls || []).slice(0, 3);
      return {
        name: r.trackName, seller: r.sellerName || r.artistName || "", genre: r.primaryGenreName || "",
        price: r.formattedPrice || (r.price === 0 ? "Free" : ""), rating: r.averageUserRating || 0, ratings: r.userRatingCount || 0,
        icon: sized(r.artworkUrl512 || r.artworkUrl100, "160x160bb"), url: r.trackViewUrl || url,
        shots: shots.map((u) => sized(u, "300x0w")), age: r.trackContentRating || r.contentAdvisoryRating || "",
      };
    } catch (e) {
      tried.push(`${cc || "default"}:${e.name || "error"}`);
    }
  }
  // keep the reason for the last failure where it can be read back (wrangler d1 execute ... "SELECT value FROM settings WHERE key='store_debug'")
  try {
    await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('store_debug', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .bind(JSON.stringify({ at: new Date().toISOString(), id: ref.id, tried })).run();
  } catch {}
  return null;
}
