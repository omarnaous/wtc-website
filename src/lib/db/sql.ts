import { requireDb, db } from "./binding";

/**
 * Thin wrappers over D1's prepared statements. Everything the app does is a
 * handful of queries, so there is no ORM here — just enough to keep `.bind()`
 * and `.results` out of the page code.
 */

export async function all<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): Promise<T[]> {
  const handle = await requireDb();
  const res = await handle
    .prepare(sql)
    .bind(...params)
    .all<T>();
  return res.results ?? [];
}

export async function first<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): Promise<T | null> {
  const handle = await requireDb();
  return (
    (await handle
      .prepare(sql)
      .bind(...params)
      .first<T>()) ?? null
  );
}

export async function run(sql: string, ...params: unknown[]) {
  const handle = await requireDb();
  return handle
    .prepare(sql)
    .bind(...params)
    .run();
}

/** D1 batches are atomic, which is what order writes need. */
export async function batch(
  statements: { sql: string; params?: unknown[] }[],
): Promise<void> {
  const handle = await requireDb();
  await handle.batch(
    statements.map((s) => handle.prepare(s.sql).bind(...(s.params ?? []))),
  );
}

/**
 * Read that tolerates a missing database: returns `fallback` when there is no
 * binding (static export) and when the table has nothing in it yet.
 */
export async function tryAll<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
  fallback: T[] = [],
): Promise<T[]> {
  const handle = await db();
  if (!handle) return fallback;
  try {
    const res = await handle
      .prepare(sql)
      .bind(...params)
      .all<T>();
    const rows = res.results ?? [];
    return rows.length ? rows : fallback;
  } catch {
    // An un-migrated database should degrade to the design, not a 500.
    return fallback;
  }
}

export async function tryFirst<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const handle = await db();
  if (!handle) return null;
  try {
    return (
      (await handle
        .prepare(sql)
        .bind(...params)
        .first<T>()) ?? null
    );
  } catch {
    return null;
  }
}

export const nowIso = () => new Date().toISOString().replace("T", " ").slice(0, 19);
