import { tryAll } from "@/lib/db/sql";
import type { Collection } from "@/data/types";

export interface AdminCollection extends Collection {
  position: number;
  status: "active" | "hidden";
  count?: number;
}

export async function listCollections(includeHidden = false): Promise<AdminCollection[]> {
  const rows = await tryAll<{
    id: string;
    name: string;
    blurb: string;
    hero_slug: string | null;
    accent: string;
    position: number;
    status: string;
    badge: string | null;
    monogram: string | null;
    state: string | null;
    count: number;
  }>(
    `SELECT c.*, (SELECT COUNT(*) FROM products p
                   WHERE p.collection_id = c.id AND p.status = 'active') AS count
       FROM collections c ORDER BY c.position, c.name`,
  );

  const mapped: AdminCollection[] = rows.map((r) => ({
    id: r.id as AdminCollection["id"],
    name: r.name,
    blurb: r.blurb,
    heroSlug: r.hero_slug ?? undefined,
    accent: r.accent,
    position: r.position,
    status: r.status as "active" | "hidden",
    badge: r.badge ?? "",
    monogram: r.monogram ?? "",
    state: (r.state as AdminCollection["state"]) ?? "auto",
    count: r.count,
  }));

  // No file fallback: no collections means no collections, which is what the
  // dashboard says and what the shop should show.
  return includeHidden ? mapped : mapped.filter((c) => c.status === "active");
}

export async function getCollection(id: string): Promise<AdminCollection | null> {
  return (await listCollections(true)).find((c) => c.id === id) ?? null;
}
