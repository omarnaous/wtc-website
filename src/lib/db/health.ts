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

export async function dbState(): Promise<DbState> {
  const handle = await db();
  if (!handle) return "no-binding";
  try {
    const row = await handle
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'admin_users'`)
      .first<{ name: string }>();
    return row ? "ok" : "no-schema";
  } catch {
    return "no-schema";
  }
}
