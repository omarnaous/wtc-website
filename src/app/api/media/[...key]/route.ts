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
      "cache-control": "public, max-age=31536000, immutable",
      etag: object.httpEtag,
    },
  });
}
