"use server";

import { revalidatePath } from "next/cache";
import { batch, tryAll } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";

export interface State {
  error?: string;
  ok?: string;
}

interface SheetRow {
  kind: "watch" | "strap";
  ref: string;
  /** What the sheet shows: units still available to sell. */
  onHand: number;
  /** False when the box was left empty — that item is simply not counted. */
  track: boolean;
  /** Watches only — the collection the watch is filed under. */
  collectionId?: string;
}

/**
 * Saves a catalogue sheet in one go — stock, and for watches the collection
 * they sit in. Only rows that were actually touched are sent, so a stray Enter
 * on an untouched sheet is a no-op.
 */
export async function saveInventory(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };

  let rows: SheetRow[];
  try {
    rows = JSON.parse(String(data.get("rows") ?? "[]"));
  } catch {
    return { error: "Could not read the sheet." };
  }
  if (!rows.length) return { ok: "Nothing to save." };

  // A collection id arrives from a <select>, but it reaches the server as
  // plain text like anything else — checked against the table rather than
  // trusted, so a moved watch can only land somewhere that exists.
  const known = await tryAll<{ id: string }>(`SELECT id FROM collections`);
  const collections = new Set(known.map((c) => c.id));

  const statements: { sql: string; params: unknown[] }[] = [];
  let moved = 0;

  for (const r of rows) {
    if (r.kind === "watch") {
      // `? + reserved` rather than `?`: the sheet shows units free to sell, and
      // an order placed before stock started coming off the count at `pending`
      // may still be holding some. Without this, saving a sheet with such an
      // order open would deduct that order's units a second time.
      statements.push({
        sql: `UPDATE inventory SET on_hand = ? + reserved, track = ?, updated_at = datetime('now')
               WHERE product_slug = ?`,
        params: [Math.max(0, r.onHand), r.track ? 1 : 0, r.ref],
      });
      // An empty string is a real value here: it means the watch is not in a
      // collection. Anything else has to name one that exists.
      if (r.collectionId !== undefined && (r.collectionId === "" || collections.has(r.collectionId))) {
        statements.push({
          sql: `UPDATE products SET collection_id = ?, updated_at = datetime('now') WHERE slug = ?`,
          params: [r.collectionId, r.ref],
        });
        moved++;
      }
    } else {
      statements.push({
        sql: `UPDATE straps SET on_hand = ?, track = ?, updated_at = datetime('now')
               WHERE sku = ?`,
        params: [Math.max(0, r.onHand), r.track ? 1 : 0, r.ref],
      });
    }
  }

  for (let i = 0; i < statements.length; i += 40) await batch(statements.slice(i, i + 40));

  await logAudit(
    me,
    "update",
    "inventory",
    null,
    `Updated ${rows.length} catalogue row(s)${moved ? `, ${moved} collection change(s)` : ""}.`,
  );
  revalidatePath("/", "layout");
  revalidatePath("/admin/products");
  revalidatePath("/admin/straps");
  return { ok: `Saved ${rows.length} item${rows.length === 1 ? "" : "s"}.` };
}
