import { headers } from "next/headers";

/**
 * The shop's one official address. Every canonical link, share card,
 * sitemap entry and structured-data URL points here, whichever address a
 * page was actually opened on — www, workers.dev or a preview — so search
 * engines see one site rather than three copies of it.
 */
export const SITE_URL = "https://watchtradechronicles.com";
export const PRIMARY_HOST = "watchtradechronicles.com";

/** True when this request came in on the official address. */
export async function onPrimaryHost(): Promise<boolean> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase().split(":")[0];
  return host === PRIMARY_HOST;
}

export const abs = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/** Trims to a search-result-sized description on a word boundary. */
export function snippet(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max - 1)).replace(/[,;:—–-]+$/, "") + "…";
}
