import MediaLibrary, { type Uploaded } from "@/components/admin/MediaLibrary";
import { PageHeader } from "@/components/admin/ui";
import { mediaBucket } from "@/lib/db/binding";
import { tryAll } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export const metadata = { title: "Images" };

export default async function MediaPage() {
  const uploadsOn = Boolean(await mediaBucket());
  const uploaded = uploadsOn
    ? await tryAll<Uploaded>(
        `SELECT id, key, filename, size, created_at FROM media ORDER BY created_at DESC LIMIT 120`,
      )
    : [];

  return (
    <>
      <PageHeader title="Images" subtitle="Everything you can point an image field at." />
      <MediaLibrary uploadsOn={uploadsOn} uploaded={uploaded} />
    </>
  );
}
