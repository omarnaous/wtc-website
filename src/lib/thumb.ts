/**
 * The small copy of a photograph, for anywhere it is drawn at card or
 * thumbnail size.
 *
 * The originals are 1080px PNGs of around 200 KB; the copies are 640px WebP
 * (360px for strap packshots) of a tenth of that, written to R2 under
 * `thumbs/` by scripts/make-thumbs.mjs. The media route serves the original
 * when a copy has not been made yet; the bucket's own domain cannot, so
 * every copy has to exist before MEDIA_ORIGIN is switched on.
 */
export function thumb(src: string): string {
  if (!src) return src;
  // Through the Worker (/api/media/…) or straight from the bucket's own
  // domain (https://media.…/…, see src/lib/media.ts) — same keys either way.
  const m = /^(\/api\/media\/|https:\/\/media\.[^/]+\/)(.*)$/.exec(src);
  if (!m || m[2].startsWith("thumbs/")) return src;
  return `${m[1]}thumbs/${m[2]}`;
}
