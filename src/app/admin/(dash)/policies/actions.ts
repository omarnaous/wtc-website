"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { first, run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";
import { parseParagraphs } from "@/lib/content/parse";
import { slugify } from "@/lib/slug";

export interface State {
  error?: string;
  ok?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

async function guard() {
  const me = await currentUser();
  if (!me) return { me: null, error: "Session expired." as const };
  if (me.role === "staff") return { me, error: "You do not have access to the policies." as const };
  return { me, error: null };
}

export async function savePolicy(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const slug = text(data, "__slug");
  const title = text(data, "title");
  if (!title) return { error: "A policy needs a title." };
  const body = parseParagraphs(String(data.get("body") ?? ""));
  if (!body.length) return { error: "A policy with no text will read as empty on the site." };

  await run(
    `INSERT INTO policies (slug, title, summary, body, position, status)
     VALUES (?,?,?,?,?,?)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title, summary = excluded.summary, body = excluded.body,
       position = excluded.position, status = excluded.status, updated_at = datetime('now')`,
    slug,
    title,
    text(data, "summary"),
    JSON.stringify(body),
    Number(text(data, "position")) || 0,
    text(data, "status") || "active",
  );

  await logAudit(me, "update", "policy", slug, `Edited ${title}.`);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/policies/${slug}`);
  return { ok: "Saved. It is live on the site." };
}

export async function createPolicy(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const title = text(data, "title");
  if (!title) return { error: "A policy needs a title." };
  const slug = slugify(text(data, "slug") || title);
  if (!slug) return { error: "That title does not make a usable web address." };

  const clash = await first<{ slug: string }>(`SELECT slug FROM policies WHERE slug = ?`, slug);
  if (clash) return { error: `A policy already lives at /policies/${slug}.` };

  const max = await first<{ n: number }>(`SELECT COALESCE(MAX(position), -1) AS n FROM policies`);
  await run(
    `INSERT INTO policies (slug, title, summary, body, position) VALUES (?,?,?,?,?)`,
    slug,
    title,
    text(data, "summary"),
    JSON.stringify(parseParagraphs(String(data.get("body") ?? ""))),
    (max?.n ?? -1) + 1,
  );

  await logAudit(me, "create", "policy", slug, `Added ${title}.`);
  revalidatePath("/", "layout");
  redirect(`/admin/policies/${slug}`);
}

export async function deletePolicy(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };
  const slug = text(data, "__slug");
  await run(`DELETE FROM policies WHERE slug = ?`, slug);
  await logAudit(me, "delete", "policy", slug, `Deleted ${slug}.`);
  revalidatePath("/", "layout");
  redirect("/admin/policies");
}
