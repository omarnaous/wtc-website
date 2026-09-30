import { tryAll } from "@/lib/db/sql";
import type { Review } from "@/lib/reviews/constants";

export type { Review };
export { SOURCES } from "@/lib/reviews/constants";

/**
 * What customers have said.
 *
 * Unlike the catalogue there is no fallback to a file here, and that is
 * deliberate: a review is a statement attributed to a named person, so an
 * empty table has to mean an empty section rather than something invented to
 * fill it.
 */

export async function listReviews(includeHidden = false): Promise<Review[]> {
  const rows = await tryAll<Review>(
    includeHidden
      ? `SELECT * FROM reviews ORDER BY position, COALESCE(reviewed_on, created_at) DESC`
      : `SELECT * FROM reviews WHERE status = 'published'
          ORDER BY position, COALESCE(reviewed_on, created_at) DESC`,
  );
  return rows;
}

export async function getReview(id: string): Promise<Review | null> {
  const rows = await tryAll<Review>(`SELECT * FROM reviews WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export interface ReviewSummary {
  count: number;
  average: number;
}

/** The figure shown beside the heading. Published reviews only. */
export async function reviewSummary(): Promise<ReviewSummary> {
  const rows = await tryAll<{ n: number; avg: number }>(
    `SELECT COUNT(*) AS n, COALESCE(AVG(rating), 0) AS avg
       FROM reviews WHERE status = 'published'`,
  );
  const row = rows[0];
  return { count: row?.n ?? 0, average: row?.avg ?? 0 };
}
