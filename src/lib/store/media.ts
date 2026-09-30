import { tryAll } from "@/lib/db/sql";

/** One uploaded image, as the dashboard's pickers need it. */
export interface Upload {
  key: string;
  filename: string;
}

/**
 * Images uploaded from the dashboard, newest first.
 *
 * The picker used to browse only `src/data/images.json`, a manifest of
 * `public/` built at deploy time — so an image uploaded on the Images page
 * could not be chosen on a watch without copying its path by hand. These are
 * the same rows that page lists.
 *
 * Returns nothing when there is no R2 bucket or no `media` table, which is the
 * right answer for a local database that has neither.
 */
export async function listUploads(limit = 120): Promise<Upload[]> {
  return tryAll<Upload>(
    `SELECT key, filename FROM media ORDER BY created_at DESC LIMIT ?`,
    [limit],
  );
}
