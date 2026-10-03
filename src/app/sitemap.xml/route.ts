import { listStorefrontProducts } from "@/lib/store/products";
import { listPolicies } from "@/lib/store/storefront";
import { SITE_URL } from "@/lib/seo";

/** Every public page, for search engines: home, the catalogue, each watch, the policies. */
export async function GET() {
  const origin = SITE_URL;
  const [products, policies] = await Promise.all([listStorefrontProducts(), listPolicies()]);
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const url = (path: string, priority: string, images: string[] = []) =>
    `  <url><loc>${esc(origin + path)}</loc>${images
      .map((i) => `<image:image><image:loc>${esc(i.startsWith("http") ? i : origin + i)}</image:loc></image:image>`)
      .join("")}<priority>${priority}</priority></url>`;
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    url("/", "1.0"),
    url("/products", "0.9"),
    ...products.map((p) => url(`/products/${p.slug}`, "0.8", (p.photos ?? []).slice(0, 3))),
    ...policies.map((p) => url(`/policies/${p.slug}`, "0.3")),
    "</urlset>",
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
