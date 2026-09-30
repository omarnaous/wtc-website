"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";
import { newId } from "@/lib/auth/password";

export interface State {
  error?: string;
  ok?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const num = (d: FormData, k: string, fallback: number) => {
  const raw = text(d, k);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

async function guard() {
  const me = await currentUser();
  if (!me) return { me: null, error: "Session expired." as const };
  if (me.role === "staff") return { me, error: "You do not have access to the reviews." as const };
  return { me, error: null };
}

function fieldsFrom(d: FormData) {
  return {
    author: text(d, "author"),
    location: text(d, "location"),
    rating: Math.min(5, Math.max(1, Math.round(num(d, "rating", 5)))),
    body: text(d, "body"),
    product_slug: text(d, "productSlug") || null,
    source: text(d, "source") || "instagram",
    status: text(d, "status") || "published",
    position: num(d, "position", 0),
    reviewed_on: text(d, "reviewedOn") || null,
  };
}

export async function createReview(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const f = fieldsFrom(data);
  if (!f.author) return { error: "Whose words are these? Add a name." };
  if (f.body.length < 10) return { error: "The review itself is missing." };

  const id = newId();
  await run(
    `INSERT INTO reviews
       (id, author, location, rating, body, product_slug, source, status, position, reviewed_on)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    id, f.author, f.location, f.rating, f.body, f.product_slug, f.source, f.status,
    f.position, f.reviewed_on,
  );

  await logAudit(me, "create", "review", id, `Added a review from ${f.author}.`);
  revalidatePath("/", "layout");
  redirect(`/admin/reviews/${id}`);
}

export async function saveReview(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const id = text(data, "__id");
  const f = fieldsFrom(data);
  if (!f.author) return { error: "Whose words are these? Add a name." };
  if (f.body.length < 10) return { error: "The review itself is missing." };

  await run(
    `UPDATE reviews SET
       author = ?, location = ?, rating = ?, body = ?, product_slug = ?, source = ?,
       status = ?, position = ?, reviewed_on = ?, updated_at = datetime('now')
     WHERE id = ?`,
    f.author, f.location, f.rating, f.body, f.product_slug, f.source, f.status,
    f.position, f.reviewed_on, id,
  );

  await logAudit(me, "update", "review", id, `Edited the review from ${f.author}.`);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/reviews/${id}`);
  return { ok: "Saved." };
}

export async function deleteReview(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const id = text(data, "__id");
  await run(`DELETE FROM reviews WHERE id = ?`, id);
  await logAudit(me, "delete", "review", id, "Deleted a review.");
  revalidatePath("/", "layout");
  redirect("/admin/reviews");
}
