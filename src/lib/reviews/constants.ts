/**
 * The review shape and its vocabulary, with nothing behind them.
 *
 * Kept apart from src/lib/store/reviews.ts because the dashboard's review form
 * is a client component and needs both. Importing them from the store would
 * pull the D1 binding into the browser bundle — which is not a runtime bug but
 * a build failure, since `cloudflare:workers` does not resolve there.
 */

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  body: string;
  product_slug: string | null;
  source: string;
  status: "published" | "hidden";
  position: number;
  reviewed_on: string | null;
  created_at: string;
}

/** Where a review reached WTC. Mirrors the CHECK on reviews.source. */
export const SOURCES = ["instagram", "whatsapp", "google", "in-person", "website"] as const;
