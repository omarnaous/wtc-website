import { tryAll } from "@/lib/db/sql";
import { sectionDefaults } from "@/lib/content/schema";
import { safeJson } from "./json";

/**
 * Section copy, with the declared defaults underneath.
 *
 * A saved row only holds the fields that were actually edited, so spreading it
 * over the defaults means a field added to the schema later appears with its
 * default rather than as undefined.
 */

export type Section = Record<string, unknown>;

export async function getSection(key: string): Promise<Section> {
  const rows = await tryAll<{ key: string; data: string }>(
    `SELECT key, data FROM content_sections WHERE key = ?`,
    [key],
  );
  return { ...sectionDefaults(key), ...safeJson<Section>(rows[0]?.data, {}) };
}

/** One query for a page that needs several sections. */
export async function getSections(keys: string[]): Promise<Record<string, Section>> {
  const out: Record<string, Section> = {};
  for (const k of keys) out[k] = sectionDefaults(k);

  const placeholders = keys.map(() => "?").join(",");
  const rows = await tryAll<{ key: string; data: string }>(
    `SELECT key, data FROM content_sections WHERE key IN (${placeholders})`,
    keys,
  );
  for (const row of rows) {
    out[row.key] = { ...out[row.key], ...safeJson<Section>(row.data, {}) };
  }
  return out;
}

/** Reads one field with a typed fallback — keeps `as string` out of the JSX. */
export function str(section: Section, key: string, fallback = ""): string {
  const v = section[key];
  return typeof v === "string" ? v : fallback;
}

export function num(section: Section, key: string, fallback: number): number {
  const v = section[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function flag(section: Section, key: string, fallback = true): boolean {
  const v = section[key];
  return typeof v === "boolean" ? v : fallback;
}

export function list<T = Record<string, string>>(section: Section, key: string): T[] {
  const v = section[key];
  return Array.isArray(v) ? (v as T[]) : [];
}
