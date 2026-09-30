import { tryAll, run } from "@/lib/db/sql";

/**
 * Fields that edit something other than their own section.
 *
 * Most of a section's fields are copy, and copy lives in the section's JSON.
 * The bestsellers rail is not copy: which watches are in it, and in what
 * order, is `products.bestseller_rank` — and that same ranking orders the
 * strap studio's watch rail and stands in for the Instagram grid when no feed
 * is connected.
 *
 * So the picker on that section reads and writes the ranking directly rather
 * than storing a second list beside it. One list, one place it is kept; there
 * is no state in which the rail and the ranking disagree.
 */
export type Binding = "bestsellerRank";

/** The current value of a bound field, in the shape a `products` field takes. */
export async function readBinding(binding: Binding): Promise<{ slug: string }[]> {
  if (binding === "bestsellerRank") {
    const rows = await tryAll<{ slug: string }>(
      `SELECT slug FROM products WHERE bestseller_rank IS NOT NULL ORDER BY bestseller_rank`,
    );
    return rows.map((r) => ({ slug: r.slug }));
  }
  return [];
}

/**
 * Writes a bound field back.
 *
 * The ranks are rewritten as a clean 1..n rather than patched, so the numbers
 * always match the order on screen — reordering in the picker cannot leave two
 * watches sharing a rank or a gap where one was removed.
 */
export async function writeBinding(binding: Binding, slugs: string[]): Promise<void> {
  if (binding !== "bestsellerRank") return;

  const known = await tryAll<{ slug: string }>(`SELECT slug FROM products`);
  const valid = new Set(known.map((r) => r.slug));
  const picked = slugs.filter((s) => valid.has(s));

  await run(`UPDATE products SET bestseller_rank = NULL WHERE bestseller_rank IS NOT NULL`);
  for (let i = 0; i < picked.length; i++) {
    await run(`UPDATE products SET bestseller_rank = ? WHERE slug = ?`, i + 1, picked[i]);
  }
}
