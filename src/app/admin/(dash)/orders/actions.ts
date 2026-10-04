"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser, logAudit } from "@/lib/auth/session";
import {
  addOrderNote,
  createOrder,
  deleteOrder,
  setOrderStatus,
  setPaymentStatus,
} from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/orders/constants";
import { sendDeliveredEmail } from "@/lib/email/order-emails";
import { SITE_URL } from "@/lib/seo";

export interface State {
  error?: string;
  ok?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const num = (d: FormData, k: string) => {
  const n = Number(text(d, k));
  return Number.isFinite(n) ? n : 0;
};

export async function changeStatus(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };

  const id = text(data, "id");
  const status = text(data, "status") as OrderStatus;
  try {
    await setOrderStatus(id, status, me.name);
    await logAudit(me, "update", "order", id, `Set order to ${status}.`);

    // Delivered, and the owner said yes to telling the customer: the
    // delivery email with its review link goes now, and the result is shown.
    let mailed = "";
    if (status === "delivered" && text(data, "notify") === "1") {
      const r = await sendDeliveredEmail(id, SITE_URL);
      if (!r.ok) {
        revalidatePath(`/admin/orders/${id}`);
        return { error: `Order marked delivered, but the email did not go: ${r.error}` };
      }
      mailed = ` Delivery email with a review link sent to ${r.to}.`;
    }

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: `Order marked ${status}.${mailed}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not change the status." };
  }
}

export async function changePayment(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };

  const id = text(data, "id");
  const payment = text(data, "payment") as "unpaid" | "paid" | "refunded";
  await setPaymentStatus(id, payment, me.name);
  await logAudit(me, "update", "order", id, `Marked payment ${payment}.`);
  revalidatePath(`/admin/orders/${id}`);
  return { ok: `Payment marked ${payment}.` };
}

export async function addNote(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };

  const id = text(data, "id");
  const message = text(data, "message");
  if (!message) return { error: "Write something first." };
  await addOrderNote(id, message, me.name);
  revalidatePath(`/admin/orders/${id}`);
  return { ok: "Note added." };
}

export async function recordOrder(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };

  const name = text(data, "customer_name");
  const phone = text(data, "phone");
  if (!name) return { error: "Who is it for?" };
  if (!phone) return { error: "A phone number is how you reach them — add one." };

  let items: { kind: "watch" | "strap"; ref: string; name: string; image?: string; unit_price: number; qty: number }[];
  try {
    items = JSON.parse(String(data.get("items") ?? "[]"));
  } catch {
    return { error: "Could not read the order lines." };
  }
  if (!items.length) return { error: "Add at least one item." };

  const order = await createOrder(
    {
      customer_name: name,
      phone,
      email: text(data, "email") || undefined,
      address_line: text(data, "address_line"),
      city: text(data, "city"),
      area: text(data, "area"),
      country: text(data, "country") || "Lebanon",
      channel: text(data, "channel") || "website",
      payment_method: text(data, "payment_method") || "cash-on-delivery",
      payment_status: (text(data, "payment_status") || "unpaid") as "unpaid" | "paid" | "refunded",
      status: (text(data, "status") || "pending") as OrderStatus,
      shipping: num(data, "shipping"),
      discount: num(data, "discount"),
      note: text(data, "note"),
      items,
    },
    me.name,
  );

  await logAudit(me, "create", "order", order.id, `Recorded order #${order.number} for ${name}.`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  redirect(`/admin/orders/${order.id}`);
}

export async function removeOrder(_prev: State, data: FormData): Promise<State> {
  const me = await currentUser();
  if (!me) return { error: "Session expired." };
  if (me.role === "staff") return { error: "Only an owner or admin can delete an order." };

  const id = text(data, "__id");
  await deleteOrder(id, me.name);
  await logAudit(me, "delete", "order", id, `Deleted order ${id}.`);
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}
