import { mediaBucket } from "@/lib/db/binding";

/**
 * Serves an image straight out of R2 — dashboard uploads, and the catalogue
 * photography that used to ship in public/ (reached here through the
 * rewrite in src/middleware.ts).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  // Two different failures, and they were both a bare 404: no bucket bound is
  // the shop misconfigured, no object is an image that is not there. Only the
  // second is the visitor's problem.
  const bucket = await mediaBucket();
  if (!bucket) {
    return new Response("Media storage is not configured.", {
      status: 503,
      headers: { "cache-control": "no-store" },
    });
  }

  const { key } = await params;
  const object = await bucket.get(key.join("/"));
  if (!object) {
    return new Response("No such image.", {
      status: 404,
      headers: { "cache-control": "no-store" },
    });
  }

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": cacheFor(key[0]),
      // The vinext CDN adapter takes the edge's policy from this header and
      // makes the browser revalidate against the edge; without it every image
      // request would reach the Worker and R2.
      "cloudflare-cdn-cache-control": cacheFor(key[0]),
      etag: object.httpEtag,
    },
  });
}

/**
 * Uploads are keyed by a fresh id, so a URL is one picture forever. The
 * catalogue photography is keyed by reference and can be replaced in place, so
 * it gets a day in the browser with a week of background revalidation — the
 * policy public/_headers used to set — and the Instagram grid, which turns
 * over, an hour.
 */
function cacheFor(top: string): string {
  if (top === "instagram") return "public, max-age=3600, stale-while-revalidate=86400";
  if (top === "products" || top === "brand") {
    return "public, max-age=86400, stale-while-revalidate=604800";
  }
  return "public, max-age=31536000, immutable";
}
