import { tryFirst } from "@/lib/db/sql";
import { mediaOrigin, versionId } from "@/lib/db/binding";
import { withMediaOrigin } from "@/lib/media";

/**
 * The storefront's catalogue reads, kept so D1 is asked as rarely as possible.
 *
 * Cloudflare's free D1 plan allows five million row reads a day. The shop
 * asks for the same catalogue — watches, straps, pairings, page copy — on
 * every view of every page, so the answers are kept at two levels:
 *
 *  1. In this isolate's memory, for the requests it serves next.
 *  2. In Cloudflare's shared cache (the Cache API), for every other isolate
 *     in the same data centre. Memory alone was not enough: Cloudflare runs
 *     many isolates and starts new ones all day, and each used to read the
 *     whole catalogue again before its memory had anything in it.
 *
 * Both are filed under the cache generation, one number in D1 that triggers
 * bump on every write to a table the shop shows (migration 0009). Reading it
 * is one row, checked at most every GEN_EVERY_MS per isolate; when it moves,
 * everything filed under the old number is simply never asked for again. So
 * answers can be kept for a long time and an edit still shows within seconds.
 *
 * Only finished answers are shared, never a read still in flight. A Worker
 * must not wait on I/O started by a different request — if that request ends
 * first, the waiting one fails ("Worker threw exception"). So two requests
 * that arrive together each read once; everyone after them gets the copy.
 *
 * Empty answers are not kept: tryAll turns a refused read into [], and
 * holding on to that would keep a page blank after the database recovers.
 *
 * Shared entries are also filed under the deploy, so a new build never picks
 * up answers shaped by the old one, and image paths in each answer are
 * pointed at the media domain on the way in (src/lib/media.ts).
 */

const GEN_EVERY_MS = 10_000;
const CACHE_ORIGIN = "https://cache.wtc.internal";

const store = new Map<string, { at: number; gen: string; value: unknown }>();
let known: { gen: string; at: number } | null = null;

const isEmpty = (v: unknown) =>
  v == null ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0);

/**
 * The current generation. When it cannot be read — the migration not yet
 * applied, or D1 refusing reads for the day — the last one seen stands, so
 * the cache keeps serving the shop instead of every page going to D1.
 */
async function generation(): Promise<string> {
  if (known && Date.now() - known.at < GEN_EVERY_MS) return known.gen;
  const row = await tryFirst<{ gen: number }>(`SELECT gen FROM cache_gen WHERE id = 1`);
  known = { gen: row ? String(row.gen) : (known?.gen ?? "0"), at: Date.now() };
  return known.gen;
}

interface SharedCache {
  match(key: string): Promise<Response | undefined>;
  put(key: string, res: Response): Promise<void>;
}

/** Cloudflare's per-data-centre cache; absent in dev and on workers.dev it does nothing. */
const shared = (): SharedCache | null =>
  (globalThis as { caches?: { default?: SharedCache } }).caches?.default ?? null;

const sharedKey = (gen: string, key: string) => `${CACHE_ORIGIN}/${gen}/${encodeURIComponent(key)}`;

/** What a cached answer depends on besides the data: the deploy and the media domain. */
async function stamp(): Promise<string> {
  const [gen, version, origin] = await Promise.all([generation(), versionId(), mediaOrigin()]);
  return `${version}/${origin ? "m" : "w"}/${gen}`;
}

async function readShared<T>(gen: string, key: string): Promise<T | undefined> {
  const cache = shared();
  if (!cache) return undefined;
  try {
    const hit = await cache.match(sharedKey(gen, key));
    return hit ? ((await hit.json()) as T) : undefined;
  } catch {
    return undefined;
  }
}

async function writeShared(gen: string, key: string, value: unknown, ttlMs: number) {
  const cache = shared();
  if (!cache) return;
  try {
    await cache.put(
      sharedKey(gen, key),
      new Response(JSON.stringify(value), {
        headers: {
          "content-type": "application/json",
          "cache-control": `public, max-age=${Math.round(ttlMs / 1000)}`,
        },
      }),
    );
  } catch {
    // A cache that will not take it costs a read next time, nothing more.
  }
}

export async function memo<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const gen = await stamp();

  const hit = store.get(key);
  if (hit && hit.gen === gen && Date.now() - hit.at < ttlMs) return hit.value as T;

  const kept = await readShared<T>(gen, key);
  if (kept !== undefined && !isEmpty(kept)) {
    store.set(key, { at: Date.now(), gen, value: kept });
    return kept;
  }

  const value = withMediaOrigin(await load(), await mediaOrigin());
  if (isEmpty(value)) {
    store.delete(key);
  } else {
    store.set(key, { at: Date.now(), gen, value });
    await writeShared(gen, key, value, ttlMs);
  }
  return value;
}
