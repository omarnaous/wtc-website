import { db } from "./binding";

/**
 * Whether the shop can actually be served.
 *
 * A bound-but-unmigrated database is a real state, not a bug: it happens on a
 * fresh environment, and on a preview build pointed at a different local
 * persistence directory. Telling the difference here means the dashboard can
 * say what to run, instead of throwing a 500 with nothing in it.
 */
export type DbState = "ok" | "no-binding" | "no-schema";

/**
 * Once the schema is there it stays there, so "ok" is remembered for the
 * isolate's life. The check ran on every dashboard request — 7,500 times in
 * a week, each reading the whole schema table.
 */
let migrated = false;

export async function dbState(): Promise<DbState> {
  const handle = await db();
  if (!handle) return "no-binding";
  if (migrated) return "ok";
  try {
    const row = await handle
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'admin_users'`)
      .first<{ name: string }>();
    migrated = Boolean(row);
    return row ? "ok" : "no-schema";
  } catch {
    return "no-schema";
  }
}
