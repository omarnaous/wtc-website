import { headers } from "next/headers";

/**
 * The shop's own address, as the request reached it — so links in an email
 * point at whichever domain the customer bought on, workers.dev today and a
 * custom domain later, with nothing to update.
 */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "";
}
