"use server";

import { revalidatePath } from "next/cache";
import { run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";
import { getOrderEmails, getSettings, notifyList } from "@/lib/store/settings";
import { listStorefrontProducts } from "@/lib/store/products";
import { previewOrderEmails } from "@/lib/email/order-emails";
import { sendMail } from "@/lib/email/brevo";
import { siteOrigin } from "@/lib/email/origin";

export interface State {
  error?: string;
  ok?: string;
}

const text = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

async function guard() {
  const me = await currentUser();
  if (!me) return { me: null, error: "Session expired." as const };
  if (me.role === "staff") return { me, error: "You do not have access to the settings." as const };
  return { me, error: null };
}

async function put(key: string, value: unknown) {
  await run(
    `INSERT INTO settings (key, value) VALUES (?,?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
    key,
    JSON.stringify(value),
  );
}

export async function saveBrand(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  await put("brand", {
    name: text(data, "name"),
    longName: text(data, "longName"),
    tagline: text(data, "tagline"),
    intro: text(data, "intro"),
    blurb: text(data, "blurb"),
    location: text(data, "location"),
    logo: text(data, "logo"),
  });

  await logAudit(me, "update", "settings", "brand", "Edited the brand details.");
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

export async function saveContact(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const phone = text(data, "phone");
  // The number that ships with the design is a placeholder, and shipping it
  // live would send customers nowhere.
  if (/^\+?961\s*0{2}\s*0{3}\s*0{3}$/.test(phone.replace(/\s+/g, " "))) {
    return { error: "That is still the placeholder number. Put the real one in." };
  }

  await put("contact", {
    phone,
    whatsapp: text(data, "whatsapp").replace(/[^0-9]/g, ""),
  });

  await logAudit(me, "update", "settings", "contact", "Edited the contact details.");
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

export async function saveDelivery(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const fee = Math.max(0, Number(text(data, "fee")) || 0);
  const freeOver = Math.max(0, Number(text(data, "freeOver")) || 0);
  if (freeOver > 0 && freeOver < fee) {
    return { error: "Free delivery should kick in above the delivery charge, not below it." };
  }

  await put("delivery", { fee, freeOver });
  await logAudit(me, "update", "settings", "delivery", `Delivery set to $${fee}.`);
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

export async function saveSocial(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  await put("social", {
    instagram: text(data, "instagram"),
    instagramHandle: text(data, "instagramHandle"),
    tiktok: text(data, "tiktok"),
  });

  await logAudit(me, "update", "settings", "social", "Edited the social links.");
  revalidatePath("/", "layout");
  return { ok: "Saved." };
}

const looksLikeEmail = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export async function saveOrderEmails(_prev: State, data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const fromEmail = text(data, "fromEmail");
  if (fromEmail && !looksLikeEmail(fromEmail)) return { error: "The sender address does not look right." };
  const notify = text(data, "notify");
  const bad = notify.split(/[,;\s]+/).filter((e) => e && !looksLikeEmail(e));
  if (bad.length) return { error: `Not an email address: ${bad[0]}` };

  await put("order_emails", {
    fromName: text(data, "fromName"),
    fromEmail,
    customer: text(data, "customer") === "1",
    admin: text(data, "admin") === "1",
    notify,
  });
  await logAudit(me, "update", "settings", "order_emails", "Edited the order email settings.");
  revalidatePath("/admin/settings");
  return { ok: "Saved." };
}

/**
 * Sends both order emails, built from a made-up order, to the shop's own
 * inbox — never to a customer. Lets the owner see exactly what goes out
 * without placing a fake order.
 */
export async function sendTestOrderEmails(_prev: State, _data: FormData): Promise<State> {
  const { me, error } = await guard();
  if (error) return { error };

  const [cfg, { brand, contact }, products] = await Promise.all([getOrderEmails(), getSettings(), listStorefrontProducts()]);
  const to = notifyList(cfg);
  if (!cfg.fromEmail) return { error: "Set the sender address first, and save." };
  if (!to.length) return { error: "Add at least one address under 'New-order alerts go to', and save." };

  const watch = products[0];
  const lines = watch
    ? [{ name: watch.name, qty: 1, unit_price: watch.price, image: watch.images.front, kind: "watch" as const }]
    : [{ name: "Sample watch", qty: 1, unit_price: 60, image: "", kind: "watch" as const }];
  const subtotal = lines.reduce((n, l) => n + l.unit_price * l.qty, 0);
  const now = new Date().toISOString();
  const sample = {
    id: "test", number: 0, status: "pending" as const, payment_status: "unpaid" as const,
    payment_method: "cash-on-delivery", customer_name: "Test Customer", phone: "+961 3123456",
    email: to[0], address_line: "Hamra Street", city: "Beirut", area: "Hamra", country: "Lebanon",
    subtotal, shipping: 0, discount: 0, total: subtotal, currency: "USD", channel: "website",
    note: "This is a test — no order was placed.", stock_applied: 0, created_at: now, updated_at: now,
  };

  const origin = await siteOrigin();
  const m = previewOrderEmails(sample, lines, origin, brand, contact);
  const from = { name: cfg.fromName || brand.longName || brand.name, email: cfg.fromEmail };
  const results = await Promise.all([
    sendMail({ from, to: to.map((email) => ({ email })), subject: `[Test] ${m.customer.subject}`, html: m.customer.html, text: m.customer.text, tags: ["test"] }),
    sendMail({ from, to: to.map((email) => ({ email })), subject: `[Test] ${m.admin.subject}`, html: m.admin.html, text: m.admin.text, tags: ["test"] }),
  ]);
  const failed = results.find((r) => !r.ok);
  if (failed && !failed.ok) return { error: `Brevo refused it: ${failed.error}` };

  await logAudit(me, "update", "settings", "order_emails", `Sent test order emails to ${to.join(", ")}.`);
  return { ok: `Sent both to ${to.join(", ")}. Check the inbox (and spam, the first time).` };
}
