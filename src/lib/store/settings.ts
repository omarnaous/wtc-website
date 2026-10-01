import { tryAll } from "@/lib/db/sql";
import { site } from "@/data/site";
import { safeJson } from "./json";

/**
 * Brand, contact and socials. One JSON value per key, with src/data/site.ts
 * as the floor — so the placeholder phone number stays visible as a
 * placeholder until someone replaces it in the dashboard.
 */

export interface Brand {
  name: string;
  longName: string;
  tagline: string;
  intro: string;
  blurb: string;
  location: string;
  logo: string;
}

export interface Contact {
  phone: string;
  whatsapp: string;
}

export interface Social {
  instagram: string;
  instagramHandle: string;
  tiktok: string;
}

export interface SiteSettings {
  brand: Brand;
  contact: Contact;
  social: Social;
}

export const SETTINGS_DEFAULTS: SiteSettings = {
  brand: {
    name: site.name,
    longName: site.longName,
    tagline: site.tagline,
    intro: site.intro,
    blurb: site.blurb,
    location: site.location,
    logo: site.logo ?? "",
  },
  contact: { phone: site.contact.phone, whatsapp: site.contact.whatsapp },
  social: {
    instagram: site.social.instagram,
    instagramHandle: site.social.instagramHandle,
    tiktok: site.social.tiktok,
  },
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await tryAll<{ key: string; value: string }>(`SELECT key, value FROM settings`);
  const out: SiteSettings = {
    brand: { ...SETTINGS_DEFAULTS.brand },
    contact: { ...SETTINGS_DEFAULTS.contact },
    social: { ...SETTINGS_DEFAULTS.social },
  };
  for (const row of rows) {
    if (row.key === "brand") out.brand = { ...out.brand, ...safeJson(row.value, {}) };
    if (row.key === "contact") out.contact = { ...out.contact, ...safeJson(row.value, {}) };
    if (row.key === "social") out.social = { ...out.social, ...safeJson(row.value, {}) };
  }
  return out;
}

/** Free-form values the dashboard stores but the storefront does not shape. */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const rows = await tryAll<{ value: string }>(`SELECT value FROM settings WHERE key = ?`, [key]);
  return rows.length ? safeJson<T>(rows[0].value, fallback) : fallback;
}

/**
 * Who order emails come from and who hears about new orders. Kept in D1 with
 * the rest of the settings and edited under Settings → Order emails.
 *
 * `fromEmail` has to be a sender verified in the Brevo account — Brevo refuses
 * anything else. `notify` is a comma-separated list, because "the shop" is
 * often more than one inbox.
 */
export interface OrderEmails {
  fromName: string;
  fromEmail: string;
  /** Send the customer a confirmation, when they gave an email at checkout. */
  customer: boolean;
  /** Send a new-order alert to `notify`. */
  admin: boolean;
  notify: string;
}

export const ORDER_EMAILS_DEFAULTS: OrderEmails = {
  fromName: "",
  fromEmail: "",
  customer: true,
  admin: true,
  notify: "",
};

export async function getOrderEmails(): Promise<OrderEmails> {
  return { ...ORDER_EMAILS_DEFAULTS, ...(await getSetting<Partial<OrderEmails>>("order_emails", {})) };
}

/** The `notify` list, split and checked. */
export const notifyList = (s: OrderEmails) =>
  s.notify
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
