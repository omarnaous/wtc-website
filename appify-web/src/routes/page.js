// Server-rendered pages for every route that isn't a static file in public/ (src/index.js routes them here).
// HTML is cached at the edge for a few minutes; content comes from D1.
import { loadSite } from "../lib/data.js";
import { homePage, workPage, servicePage, notFoundPage } from "../lib/pages.js";

const HTML = { "content-type": "text/html; charset=utf-8" };
const page = (html, status = 200, extra = {}) => new Response(html, { status, headers: { ...HTML, "cache-control": status === 200 ? "public, max-age=60, s-maxage=600, stale-while-revalidate=86400" : "no-store", ...extra } });

export async function renderPage(request, env, ctx) {
  const url = new URL(request.url);
  // one canonical form: no trailing slash (except "/")
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) return Response.redirect(url.origin + url.pathname.replace(/\/+$/, "") + url.search, 301);

  const cache = caches.default;
  const hit = await cache.match(request);
  if (hit) return hit;

  const site = await loadSite(env, url.origin);
  const noindex = env.NOINDEX_HOST && url.hostname.endsWith(env.NOINDEX_HOST) ? { "x-robots-tag": "noindex" } : {};
  const p = url.pathname;
  let res;
  if (p === "/") res = page(homePage(site), 200, noindex);
  else if (p === "/robots.txt") res = new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site.url}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
  else if (p === "/sitemap.xml") res = new Response(sitemap(site), { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
  else if (p.startsWith("/work/")) {
    const pr = site.projects.find((x) => x.kind === "website" && x.slug === p.slice(6));
    res = pr ? page(workPage(site, pr), 200, noindex) : page(notFoundPage(site), 404);
  } else if (p.startsWith("/services/")) {
    const s = site.services.find((x) => x.slug === p.slice(10));
    res = s ? page(servicePage(site, s), 200, noindex) : page(notFoundPage(site), 404);
  } else res = page(notFoundPage(site), 404);

  if (res.status === 200) ctx.waitUntil(cache.put(request, res.clone()));
  return res;
}

function sitemap(site) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ["/", "1.0", "weekly"],
    ...site.services.map((s) => [`/services/${s.slug}`, "0.9", "monthly"]),
    ...site.projects.filter((p) => p.kind === "website").map((p) => [`/work/${p.slug}`, "0.7", "monthly", p]),
  ];
  const vids = (path) => path !== "/" ? "" : site.motion.map((m) => `
    <video:video><video:thumbnail_loc>${site.url}${m.poster}</video:thumbnail_loc><video:title>${x(m.title)}</video:title><video:description>${x(m.summary)}</video:description><video:content_loc>${site.url}${m.video}</video:content_loc><video:duration>${m.duration || 1}</video:duration></video:video>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(([u, pr, cf, proj]) => `  <url><loc>${site.url}${u}</loc><lastmod>${(proj?.updated_at || today).slice(0, 10)}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority>${proj?.poster ? `<image:image><image:loc>${site.url}${proj.poster}</image:loc></image:image>` : ""}${vids(u)}</url>`).join("\n")}
</urlset>`;
}
const x = (s = "") => String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
