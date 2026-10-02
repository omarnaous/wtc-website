"use server";

import { run } from "@/lib/db/sql";
import { newId } from "@/lib/auth/password";

export interface ReviewState {
  ok?: boolean;
  error?: string;
}

const text = (d: FormData, k: string, max: number) =>
  String(d.get(k) ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/**
 * A review written on the site.
 *
 * It goes into the same table as the ones typed into the dashboard, marked
 * as from the website and hidden: anyone can fill in a form, so nothing a
 * stranger types is put on the homepage until someone at WTC has read it and
 * published it from Dashboard → Reviews.
 */
export async function submitReview(_prev: ReviewState, data: FormData): Promise<ReviewState> {
  // Two quiet spam checks: a field people never see, and a form sent faster
  // than anyone could have read it.
  if (String(data.get("website") ?? "")) return { ok: true };
  const opened = Number(data.get("opened") ?? 0);
  if (opened && Date.now() - opened < 2500) return { ok: true };

  const author = text(data, "author", 60);
  const location = text(data, "location", 60);
  const body = String(data.get("body") ?? "").trim().slice(0, 1200);
  const rating = Math.min(5, Math.max(1, Math.round(Number(data.get("rating") ?? 0)) || 0));
  const slug = text(data, "productSlug", 120) || null;

  if (!author) return { error: "Add your name so we know who it is from." };
  if (!rating) return { error: "Pick a star rating." };
  if (body.length < 10) return { error: "Tell us a little more — a sentence or two." };

  try {
    await run(
      `INSERT INTO reviews
         (id, author, location, rating, body, product_slug, source, status, position, reviewed_on)
       VALUES (?,?,?,?,?,?,'website','hidden',0,date('now'))`,
      newId(),
      author,
      location,
      rating,
      body,
      slug,
    );
  } catch {
    return { error: "That did not go through. Please try again in a moment." };
  }
  return { ok: true };
}
