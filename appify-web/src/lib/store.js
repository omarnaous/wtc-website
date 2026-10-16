// Live App Store listings for app cards. Given an App Store link (https://apps.apple.com/<cc>/app/<name>/id<digits>),
// reads Apple's public lookup API for the icon, name, developer, rating, category, price and the store screenshots.
// Cached at Cloudflare's edge for 6 hours; any failure returns null and the card falls back to the placeholder phone.

const LOOKUP = "https://itunes.apple.com/lookup";
// mzstatic serves any size/format from the same path: ask for small WebP versions.
const sized = (u, spec) => (u || "").replace(/\/[^/]+\.(jpg|jpeg|png|webp)$/i, `/${spec}.webp`);

export function parseStoreUrl(url) {
  const id = String(url || "").match(/id(\d{6,})/)?.[1];
  if (!id) return null;
  const cc = String(url).match(/apps\.apple\.com\/([a-z]{2})\//i)?.[1]?.toLowerCase() || "us";
  return { id, cc };
}

export async function storeListing(env, url) {
  const ref = parseStoreUrl(url);
  if (!ref) return null;
  try {
    const base = env.STORE_LOOKUP || LOOKUP; // overridable for local tests only
    const res = await fetch(`${base}?id=${ref.id}&country=${ref.cc}&entity=software`, { cf: { cacheTtl: 21600, cacheEverything: true }, signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const r = (await res.json())?.results?.[0];
    if (!r) return null;
    const shots = (r.screenshotUrls?.length ? r.screenshotUrls : r.ipadScreenshotUrls || []).slice(0, 3);
    return {
      name: r.trackName, seller: r.sellerName || r.artistName || "", genre: r.primaryGenreName || "",
      price: r.formattedPrice || (r.price === 0 ? "Free" : ""), rating: r.averageUserRating || 0, ratings: r.userRatingCount || 0,
      icon: sized(r.artworkUrl512 || r.artworkUrl100, "160x160bb"), url: r.trackViewUrl || url,
      shots: shots.map((u) => sized(u, "300x0w")), age: r.trackContentRating || r.contentAdvisoryRating || "",
    };
  } catch {
    return null;
  }
}
