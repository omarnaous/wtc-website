"use server";

import { revalidatePath } from "next/cache";
import { run } from "@/lib/db/sql";
import { currentUser, logAudit } from "@/lib/auth/session";

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
