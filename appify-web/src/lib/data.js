// Reads all site content from D1 in one round trip and keeps it in memory for a short while per isolate.
// The stage-2 admin panel writes to the same tables and bumps settings.content_version.
import { json } from "./html.js";
import { storeListing } from "./store.js";

let memo = null;
const TTL = 30_000;

export async function loadSite(env, origin) {
  if (memo && Date.now() - memo.at < TTL) return { ...memo.data, url: siteUrl(env, origin) };
  const [settings, projects, motion, faqs, services] = await env.DB.batch([
    env.DB.prepare("SELECT key, value FROM settings"),
    env.DB.prepare("SELECT * FROM projects WHERE published = 1 ORDER BY sort, id"),
    env.DB.prepare("SELECT * FROM motion WHERE published = 1 ORDER BY sort, id"),
    env.DB.prepare("SELECT * FROM faqs WHERE published = 1 ORDER BY sort, id"),
    env.DB.prepare("SELECT * FROM services WHERE published = 1 ORDER BY sort, slug"),
  ]);
  const s = Object.fromEntries(settings.results.map((r) => [r.key, r.value]));
  const data = {
    settings: s,
    projects: await Promise.all(projects.results.map(async (p) => ({ ...p, features: json(p.features), stack: json(p.stack), store: p.kind === "app" && p.store_url ? await storeListing(env, p.store_url) : null }))),
    motion: motion.results,
    faqs: faqs.results,
    services: services.results.map((x) => ({ ...x, points: json(x.points) })),
  };
  memo = { at: Date.now(), data };
  return { ...data, url: siteUrl(env, origin) };
}

// Canonical origin: SITE_URL (set it to https://www.appify-lb.com once the domain is connected), else the request's own.
export const siteUrl = (env, origin) => (env.SITE_URL || origin).replace(/\/$/, "");
