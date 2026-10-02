import { mediaBucket } from "@/lib/db/binding";

/** Serves an uploaded image straight out of R2. Public, like anything in public/. */
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
  const path = key.join("/");
  let object = await bucket.get(path);
  // A photograph uploaded since the thumbnails were last made has none yet:
  // serve the original rather than a hole, and only briefly, so the small
  // copy is picked up once scripts/make-thumbs.mjs has written it.
  let fallback = false;
  if (!object && path.startsWith("thumbs/")) {
    object = await bucket.get(path.slice("thumbs/".length));
    fallback = Boolean(object);
  }
  if (!object) {
    return new Response("No such image.", {
      status: 404,
      headers: { "cache-control": "no-store" },
    });
  }

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": fallback ? "public, max-age=3600" : "public, max-age=31536000, immutable",
      etag: object.httpEtag,
    },
  });
}
