/**
 * The small version of a watch photograph, where one exists.
 *
 * It used to substitute 128px copies that `npm run thumbs` wrote beside the
 * bundled packshots. Those files are gone: every photograph now lives in R2 and
 * is served through /api/media, so there is nothing local left to swap in.
 *
 * The seam is kept because the three components that draw watches at thumbnail
 * size still call it, and because this is where a Cloudflare Images transform
 * belongs once the shop has a custom domain — `/cdn-cgi/image/` 404s on
 * *.workers.dev, so it cannot go in yet.
 */
export function thumb(src: string): string {
  return src;
}
