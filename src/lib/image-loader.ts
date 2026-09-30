/**
 * Serves images through Cloudflare's image transformations when they are
 * available, and untouched when they are not.
 *
 * The photography is shipped as Workers Assets — already on Cloudflare's edge,
 * but at full size: the watch shots are 1080px PNGs of around 200 KB, and a
 * phone showing one at 160px downloads all of it.
 *
 * `/cdn-cgi/image/` resizes and re-encodes at the edge, from the same origin,
 * with no upload step and no second copy of anything. Two conditions, and both
 * are switches in the Cloudflare dashboard rather than anything in this
 * repository:
 *
 *   1. Image Transformations enabled for the zone.
 *   2. A custom domain. The path does not exist on *.workers.dev, so leaving
 *      this off is correct until the shop has its own domain.
 *
 * Until NEXT_PUBLIC_IMAGE_CDN is set this returns the path it was given, which
 * is exactly what `unoptimized: true` used to do — so the site behaves the same
 * whether or not the service is on.
 */
export default function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const base = process.env.NEXT_PUBLIC_IMAGE_CDN;

  // Off, or an absolute URL we do not control (Instagram's CDN, an R2 public
  // bucket) — hand it back untouched.
  if (!base || /^https?:\/\//.test(src) || src.startsWith("data:")) return src;

  const options = [`width=${width}`, `quality=${quality ?? 78}`, "format=auto", "fit=scale-down"];
  return `${base.replace(/\/$/, "")}/${options.join(",")}${src.startsWith("/") ? src : `/${src}`}`;
}
