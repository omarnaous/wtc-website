import { mediaBucket } from "@/lib/db/binding";

/** Browsers still ask for /favicon.ico on their own; answer with the mark. */
export async function GET() {
  const bucket = await mediaBucket();
  const object = await bucket?.get("brand/favicon-48.png");
  if (!object) return new Response(null, { status: 404 });
  return new Response(object.body, {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" },
  });
}
