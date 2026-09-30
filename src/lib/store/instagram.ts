import { db } from "@/lib/db/binding";
import { tryAll } from "@/lib/db/sql";
import feed from "@/data/instagram.json";
import type { Post } from "@/components/sections/InstagramStrip";

interface Row {
  id: string;
  image: string;
  permalink: string;
  caption: string;
  is_video: number;
}

/**
 * The homepage Instagram grid, newest first.
 *
 * From D1 on the Worker. The static export has no database, so it keeps
 * reading the file the import is built from.
 */
export async function listInstagramPosts(limit: number): Promise<Post[]> {
  if (!(await db())) return (feed.posts as Post[]).slice(0, limit);
  const rows = await tryAll<Row>(
    `SELECT id, image, permalink, caption, is_video FROM instagram_posts
      ORDER BY position LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    image: r.image,
    permalink: r.permalink,
    caption: r.caption,
    isVideo: Boolean(r.is_video),
  }));
}
