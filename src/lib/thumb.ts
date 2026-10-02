/**
 * The small copy of a photograph, for anywhere it is drawn at card or
 * thumbnail size.
 *
 * The originals are 1080px PNGs of around 200 KB; the copies are 640px WebP
 * (360px for strap packshots) of a tenth of that, written to R2 under
 * `thumbs/` by scripts/make-thumbs.mjs. The media route serves the original
 * when a copy has not been made yet, so this is always safe to call.
 */
export function thumb(src: string): string {
  if (!src || !src.startsWith("/api/media/") || src.startsWith("/api/media/thumbs/")) return src;
  return `/api/media/thumbs/${src.slice("/api/media/".length)}`;
}
