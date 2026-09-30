"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { first, run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";

export interface State {
  error?: string;
  ok?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const num = (d: FormData, k: string, fallback = 0) => {
  const raw = text(d, k);
  if (raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

async function guard() {
  const me = await currentUser();
  if (!me) return { me: null, error: "Session expired." as const };
  if (me.role === "staff") return { me, error: "You do not have access to the catalogue." as const };
  return { me, error: null };
}

function fieldsFrom(d: FormData) {
  return {
    name: text(d, "name"),
    type: text(d, "type") || "rubber",
    colorway: text(d, "colorway"),
    color_group: text(d, "colorGroup") || "grey",
    price: Math.max(0, num(d, "price")),
    image: text(d, "image"),
    primary_color: text(d, "primary") || "#888888",
    secondary_color: text(d, "secondary") || "#888888",
    paired_with: text(d, "pairedWith") || null,
    on_hand: Math.max(0, num(d, "onHand")),
    low_stock_at: Math.max(0, num(d, "lowStockAt", 2)),
    track: text(d, "track") === "1" ? 1 : 0,
    status: text(d, "status") || "active",
    position: num(d, "position"),
  };
}

export async function saveStrap(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const sku = text(data, "__sku");
  const f = fieldsFrom(data);
  if (!f.name) return { error: "A strap needs a name." };

  await run(
    `UPDATE straps SET
       name = ?, type = ?, colorway = ?, color_group = ?, price = ?, image = ?,
       primary_color = ?, secondary_color = ?, paired_with = ?, on_hand = ?,
       low_stock_at = ?, track = ?, status = ?, position = ?, updated_at = datetime('now')
     WHERE sku = ?`,
    f.name, f.type, f.colorway, f.color_group, f.price, f.image, f.primary_color,
    f.secondary_color, f.paired_with, f.on_hand, f.low_stock_at, f.track, f.status,
    f.position, sku,
  );

  await logAudit(me, "update", "strap", sku, `Edited ${f.name}.`);
  revalidatePath("/", "layout");
  revalidatePath(`/admin/straps/${sku}`);
  return { ok: "Saved." };
}

export async function createStrap(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const sku = text(data, "sku").toUpperCase();
  if (!sku) return { error: "A strap needs a reference." };
  const f = fieldsFrom(data);
  if (!f.name) return { error: "A strap needs a name." };

  const clash = await first<{ sku: string }>(`SELECT sku FROM straps WHERE sku = ?`, sku);
  if (clash) return { error: `${sku} is already in the catalogue.` };

  await run(
    `INSERT INTO straps
       (sku, name, type, colorway, color_group, price, image, primary_color, secondary_color,
        paired_with, on_hand, low_stock_at, track, status, position)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    sku, f.name, f.type, f.colorway, f.color_group, f.price, f.image, f.primary_color,
    f.secondary_color, f.paired_with, f.on_hand, f.low_stock_at, f.track, f.status, f.position,
  );

  await logAudit(me, "create", "strap", sku, `Added ${f.name}.`);
  revalidatePath("/", "layout");
  redirect(`/admin/straps/${sku}`);
}

export async function deleteStrap(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };
  const sku = text(data, "__sku");

  const sold = await first<{ n: number }>(
    `SELECT COUNT(*) AS n FROM order_items WHERE kind = 'strap' AND ref = ?`,
    sku,
  );
  if ((sold?.n ?? 0) > 0) {
    return {
      error: `${sku} appears on ${sold!.n} order line(s). Archive it instead so those orders keep reading correctly.`,
    };
  }

  await run(`DELETE FROM straps WHERE sku = ?`, sku);
  await logAudit(me, "delete", "strap", sku, `Deleted ${sku}.`);
  revalidatePath("/", "layout");
  redirect("/admin/straps");
}
