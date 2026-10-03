import { getSection, flag } from "@/lib/store/storefront";
import { SITE_URL, onPrimaryHost } from "@/lib/seo";

/**
 * Search engines' instructions. Follows Sections → Search: while indexing is
 * off the whole site is closed to crawlers; once on, the official address is
 * open but for the dashboard, the API, checkout and order receipts. Every
 * other address the shop answers on (www, workers.dev) stays closed, so it
 * is never indexed as a second copy.
 */
export async function GET() {
  const [seo, primary] = await Promise.all([getSection("seo"), onPrimaryHost()]);
  const open = flag(seo, "indexable", false) && primary;
  const body = open
    ? [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /api/",
        "Allow: /api/media/",
        "Disallow: /checkout",
        "Disallow: /order/",
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        "",
      ].join("\n")
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
