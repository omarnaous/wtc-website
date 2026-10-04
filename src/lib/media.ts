/**
 * Where the shop's photographs are fetched from.
 *
 * Every image lives in the R2 bucket and is stored in D1 as `/api/media/<key>`,
 * a path the Worker answers by reading R2. That makes each photograph a Worker
 * request, and the free plan allows 100,000 of those a day — about a hundred
 * per visitor to the homepage alone, so images, not pages, set how many
 * visitors the shop could take.
 *
 * With MEDIA_ORIGIN set (a Worker var, e.g. https://media.watchtradechronicles.com)
 * the storefront points those paths at the bucket's own public domain instead,
 * where Cloudflare's CDN serves them without running the Worker at all. The
 * stored paths do not change, and /api/media keeps answering, so old links,
 * emails and the dashboard carry on working; unset, nothing changes.
 */

const PREFIX = "/api/media/";

/** `/api/media/<key>` on the media domain, when there is one. */
export function mediaUrl(src: string, origin: string | null | undefined): string {
  if (!origin || !src.startsWith(PREFIX)) return src;
  return `${origin.replace(/\/$/, "")}/${src.slice(PREFIX.length)}`;
}

/**
 * The same, through a whole answer — products, straps, page copy — so the
 * pages that draw them need not know where images come from.
 */
export function withMediaOrigin<T>(value: T, origin: string | null | undefined): T {
  if (!origin) return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return v.startsWith(PREFIX) ? mediaUrl(v, origin) : v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v)) out[k] = walk(x);
      return out;
    }
    return v;
  };
  return walk(value) as T;
}
