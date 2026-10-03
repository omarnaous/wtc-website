import { getSection, flag } from "@/lib/store/storefront";
import { siteOrigin } from "@/lib/email/origin";

/**
 * Search engines' instructions. Follows Sections → Search: while indexing is
 * off the whole site is closed to crawlers; once on, everything is open but
 * the dashboard, the API, checkout and order receipts.
 */
export async function GET() {
  const [seo, origin] = await Promise.all([getSection("seo"), siteOrigin()]);
  const open = flag(seo, "indexable", false);
  const body = open
    ? [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /api/",
        "Disallow: /checkout",
        "Disallow: /order/",
        "",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
      ].join("\n")
    : "User-agent: *\nDisallow: /\n";
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
