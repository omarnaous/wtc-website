/**
 * A short-lived, per-isolate memory of the catalogue reads every page makes.
 *
 * Cloudflare's free D1 plan allows five million row reads a day, and the
 * storefront asks for the same catalogue — watches, straps, pairings — on
 * every view of every page. A Worker isolate lives for many requests, so
 * keeping each answer for a few seconds turns a busy minute into one read
 * per isolate instead of hundreds.
 *
 * Only finished answers are shared, never a read still in flight. A Worker
 * must not wait on I/O started by a different request — if that request ends
 * first, the waiting one fails ("Worker threw exception"), which is what the
 * first version of this did now and then. So two requests that arrive
 * together each read once; everyone after them gets the stored copy.
 *
 * Empty answers are not kept: tryAll turns a refused read into [], and
 * holding on to that would keep a page blank after the database recovers.
 * A dashboard edit can take up to the TTL to show on an isolate that already
 * holds the old answer.
 */
const store = new Map<string, { at: number; value: unknown }>();

const isEmpty = (v: unknown) =>
  v == null ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0);

export async function memo<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await load();
  if (isEmpty(value)) store.delete(key);
  else store.set(key, { at: Date.now(), value });
  return value;
}
