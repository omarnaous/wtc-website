"use server";

import { revalidatePath } from "next/cache";
import { all, batch, first, run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";
import { slugify } from "@/lib/slug";

export interface State {
  error?: string;
  ok?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

async function guard() {
  const me = await currentUser();
  if (!me) return { me: null, error: "Session expired." as const };
  if (me.role === "staff") return { me, error: "You do not have access to the catalogue." as const };
  return { me, error: null };
}

export async function saveCollection(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const id = text(data, "__id");
  const name = text(data, "name");
  if (!name) return { error: "A collection needs a name." };

  await run(
    `UPDATE collections SET name = ?, blurb = ?, hero_slug = ?, accent = ?, position = ?,
            status = ?, badge = ?, monogram = ?, state = ?, updated_at = datetime('now')
      WHERE id = ?`,
    name,
    text(data, "blurb"),
    text(data, "heroSlug") || null,
    text(data, "accent") || "#c9a227",
    Number(text(data, "position")) || 0,
    text(data, "status") || "active",
    text(data, "badge"),
    text(data, "monogram").slice(0, 4),
    // Anything unrecognised falls back to the old behaviour rather than
    // failing the column's CHECK and losing the whole save.
    ["auto", "upcoming", "open"].includes(text(data, "state")) ? text(data, "state") : "auto",
    id,
  );

  await applyOrder(id, data);

  await logAudit(me, "update", "collection", id, `Edited ${name}.`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/collections");
  return { ok: "Saved." };
}

export async function createCollection(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const name = text(data, "name");
  if (!name) return { error: "A collection needs a name." };
  const id = slugify(text(data, "id") || name);
  if (!id) return { error: "That name does not make a usable id." };

  const clash = await first<{ id: string }>(`SELECT id FROM collections WHERE id = ?`, id);
  if (clash) return { error: `A collection with the id ${id} already exists.` };

  await run(
    `INSERT INTO collections (id, name, blurb, accent, position) VALUES (?,?,?,?,?)`,
    id,
    name,
    text(data, "blurb"),
    text(data, "accent") || "#c9a227",
    Number(text(data, "position")) || 0,
  );

  await logAudit(me, "create", "collection", id, `Added ${name}.`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/collections");
  return { ok: `${name} added.` };
}

export async function deleteCollection(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const id = text(data, "__id");
  const used = await first<{ n: number }>(
    `SELECT COUNT(*) AS n FROM products WHERE collection_id = ?`,
    id,
  );
  if ((used?.n ?? 0) > 0) {
    return {
      error: `${used!.n} watch(es) still sit in this collection. Move them first, or hide the collection instead.`,
    };
  }

  await run(`DELETE FROM collections WHERE id = ?`, id);
  await logAudit(me, "delete", "collection", id, `Deleted ${id}.`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/collections");
  return { ok: "Collection deleted." };
}


/**
 * Writes the collection's running order, and unfiles anything taken out of it.
 *
 * Positions are offset by the collection's own place in the list — collection
 * 0 gets 0…, collection 1 gets 1000… — so two collections cannot claim the
 * same number, and the unfiltered catalogue reads collection by collection in
 * the order the tiles do rather than interleaved.
 *
 * A watch dropped from the list keeps its row and its orders; it is simply not
 * in a collection any more, which the Watches list shows as "Unfiled" and can
 * put right in one click. Deleting a watch stays on the watch's own page.
 */
async function applyOrder(id: string, data: FormData) {
  const raw = data.get("items");
  // Absent means the form did not carry the list — leave the order alone
  // rather than read "no watches" into it.
  if (typeof raw !== "string") return;

  const wanted = raw.split(",").map((s) => s.trim()).filter(Boolean);

  const current = await all<{ slug: string }>(
    `SELECT slug FROM products WHERE collection_id = ?`,
    id,
  );
  const inCollection = new Set(current.map((r) => r.slug));
  const keep = wanted.filter((slug) => inCollection.has(slug));

  const row = await first<{ position: number }>(
    `SELECT position FROM collections WHERE id = ?`,
    id,
  );
  const base = (row?.position ?? 0) * 1000;

  const statements: { sql: string; params: unknown[] }[] = keep.map((slug, i) => ({
    sql: `UPDATE products SET position = ?, updated_at = datetime('now') WHERE slug = ?`,
    params: [base + i, slug],
  }));

  for (const slug of inCollection) {
    if (keep.includes(slug)) continue;
    statements.push({
      sql: `UPDATE products SET collection_id = '', updated_at = datetime('now') WHERE slug = ?`,
      params: [slug],
    });
  }

  for (let i = 0; i < statements.length; i += 40) await batch(statements.slice(i, i + 40));
}
