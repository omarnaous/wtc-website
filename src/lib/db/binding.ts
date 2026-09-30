/**
 * Cloudflare bindings, resolved at runtime rather than imported.
 *
 * Server side only — `cloudflare:workers` has no browser equivalent, so a
 * client component that pulls this in (usually by importing a value, rather
 * than a type, from src/lib/store) fails the build. Shared constants live in
 * src/lib/orders/constants.ts and src/lib/content/schema.ts for that reason.
 *
 * `cloudflare:workers` only exists inside workerd. The storefront also builds
 * as a static export for GitHub Pages and runs under plain `next dev`, where
 * that module cannot resolve at all — so the import is dynamic and failure is
 * an expected outcome, not an error. Every caller has to handle `null`, which
 * is what keeps the site rendering from src/data when there is no database.
 */

export type Db = D1Database;

type Bindings = { DB?: D1Database; MEDIA?: R2Bucket; SETUP_TOKEN?: string };

let resolved: Bindings | null | undefined;

async function bindings(): Promise<Bindings | null> {
  if (resolved !== undefined) return resolved;
  try {
    // webpackIgnore keeps `next dev` from trying to bundle a workerd builtin;
    // Vite resolves it normally for the Worker build.
    const mod = await import(/* webpackIgnore: true */ "cloudflare:workers");
    resolved = ((mod as { env?: Bindings }).env ?? null) as Bindings | null;
  } catch {
    resolved = null;
  }
  return resolved;
}

/** The D1 handle, or null when running without bindings. */
export async function db(): Promise<Db | null> {
  const b = await bindings();
  return b?.DB ?? null;
}

/**
 * Same, but throws. For the admin dashboard and the write paths, where there
 * is no sensible way to carry on without a database.
 */
export async function requireDb(): Promise<Db> {
  const handle = await db();
  if (!handle) {
    throw new Error(
      "No D1 binding. The dashboard needs the Workers runtime — run `npm run dev` (vinext) rather than `npm run dev:next`.",
    );
  }
  return handle;
}

/** R2 for uploaded images. Null until R2 is enabled on the account. */
export async function mediaBucket(): Promise<R2Bucket | null> {
  const b = await bindings();
  return b?.MEDIA ?? null;
}

export async function hasDb(): Promise<boolean> {
  return (await db()) !== null;
}

/**
 * The secret that unlocks first-run setup, when one is configured.
 *
 * `/admin/setup` hands ownership of the shop to whoever opens it first, which
 * is fine on a laptop and not fine on a public URL. Set this on the live
 * environment — `wrangler secret put SETUP_TOKEN` — and the page only opens
 * for `?token=…`. Left unset (the local default) setup stays open, because
 * there is nobody else on localhost to race.
 */
export async function setupToken(): Promise<string | null> {
  const b = await bindings();
  const token = b?.SETUP_TOKEN;
  return typeof token === "string" && token.length > 0 ? token : null;
}
