"use server";

import { revalidatePath } from "next/cache";
import { run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";
import { sectionByKey } from "@/lib/content/schema";
import { parseFields } from "@/lib/content/parse";
import { writeBinding } from "@/lib/content/bindings";
import { getSection } from "@/lib/store/content";

export interface State {
  error?: string;
  ok?: string;
}

export async function saveSection(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };
  if (me.role === "staff") return { error: "You do not have access to the website content." };

  const key = String(data.get("__key") ?? "");
  const def = sectionByKey(key);
  if (!def) return { error: "Unknown section." };

  // Merge over what is already stored so a partial form cannot blank the rest.
  const existing = await getSection(key);
  const payload = { ...existing, ...parseFields(data, def.fields) };

  await run(
    `INSERT INTO content_sections (key, data, updated_by) VALUES (?,?,?)
     ON CONFLICT(key) DO UPDATE SET
       data = excluded.data, updated_at = datetime('now'), updated_by = excluded.updated_by`,
    key,
    JSON.stringify(payload),
    me.name,
  );
  // Fields that edit something outside this section — the bestsellers picker
  // writes the product ranking itself. Applied after the copy, so a failure
  // here cannot leave the section half-saved.
  for (const field of def.fields) {
    if (!field.binding) continue;
    const slugs = String(data.get(field.key) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, field.max ?? 50);
    await writeBinding(field.binding, slugs);
  }

  await logAudit(me, "update", "content", key, `Edited the ${def.label} section.`);

  revalidatePath("/", "layout");
  revalidatePath(`/admin/content/${key}`);
  return { ok: "Saved. The change is live on the site." };
}

/** Puts one section back to the copy the design shipped with. */
export async function resetSection(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };
  if (me.role === "staff") return { error: "You do not have access to the website content." };

  const key = String(data.get("__key") ?? "");
  const def = sectionByKey(key);
  if (!def) return { error: "Unknown section." };

  await run(
    `INSERT INTO content_sections (key, data, updated_by) VALUES (?,?,?)
     ON CONFLICT(key) DO UPDATE SET
       data = excluded.data, updated_at = datetime('now'), updated_by = excluded.updated_by`,
    key,
    JSON.stringify(def.defaults),
    me.name,
  );
  // Deliberately leaves bound fields alone: a reset is about the copy the
  // design shipped with, and wiping the shop's bestseller ranking is not that.
  await logAudit(me, "reset", "content", key, `Reset the ${def.label} section to its default copy.`);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/content/${key}`);
  return { ok: "Reset to the original copy." };
}
