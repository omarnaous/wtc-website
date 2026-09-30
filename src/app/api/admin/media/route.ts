import { NextResponse } from "next/server";
import { currentUser, logAudit } from "@/lib/auth/session";
import { mediaBucket } from "@/lib/db/binding";
import { newId } from "@/lib/auth/password";
import { run } from "@/lib/db/sql";

/**
 * Image uploads, stored in R2 and served back through /api/media.
 *
 * Only live once R2 is enabled on the account and a bucket is bound as MEDIA;
 * until then the dashboard says so and the picker browses public/ instead.
 */

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"]);

export async function POST(request: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (me.role === "staff") {
    return NextResponse.json({ error: "You cannot upload images." }, { status: 403 });
  }

  const bucket = await mediaBucket();
  if (!bucket) {
    return NextResponse.json(
      { error: "Uploads are off — R2 is not enabled on this Cloudflare account." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images have to be 8 MB or smaller." }, { status: 413 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP, AVIF and SVG images can be uploaded." },
      { status: 415 },
    );
  }

  const id = newId();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const key = `${id}/${safe}`;

  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
  });
  await run(
    `INSERT INTO media (id, key, filename, content_type, size, alt, uploaded_by)
     VALUES (?,?,?,?,?,?,?)`,
    id,
    key,
    file.name,
    file.type,
    file.size,
    String(form.get("alt") ?? ""),
    me.name,
  );
  await logAudit(me, "create", "media", id, `Uploaded ${file.name}.`);

  return NextResponse.json({ id, url: `/api/media/${key}`, filename: file.name });
}

export async function DELETE(request: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (me.role === "staff") {
    return NextResponse.json({ error: "You cannot delete images." }, { status: 403 });
  }

  const bucket = await mediaBucket();
  if (!bucket) return NextResponse.json({ error: "Uploads are off." }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Which image?" }, { status: 400 });

  await bucket.delete(key);
  await run(`DELETE FROM media WHERE key = ?`, key);
  await logAudit(me, "delete", "media", key, `Deleted ${key}.`);

  return NextResponse.json({ ok: true });
}
