import { tryAll } from "@/lib/db/sql";
import { site } from "@/data/site";
import { safeJson } from "./json";

export interface PolicyDoc {
  slug: string;
  title: string;
  summary: string;
  body: string[];
  position: number;
  status: "active" | "hidden";
}

const fromFiles = (): PolicyDoc[] =>
  site.policies.map((p, i) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    body: [...p.body],
    position: i,
    status: "active" as const,
  }));

export async function listPolicies(includeHidden = false): Promise<PolicyDoc[]> {
  const rows = await tryAll<{
    slug: string;
    title: string;
    summary: string;
    body: string;
    position: number;
    status: string;
  }>(`SELECT * FROM policies ORDER BY position, title`);

  const list = rows.length
    ? rows.map((r) => ({
        slug: r.slug,
        title: r.title,
        summary: r.summary,
        body: safeJson<string[]>(r.body, []),
        position: r.position,
        status: r.status as "active" | "hidden",
      }))
    : fromFiles();

  return includeHidden ? list : list.filter((p) => p.status === "active");
}

export async function getPolicy(slug: string): Promise<PolicyDoc | null> {
  return (await listPolicies(true)).find((p) => p.slug === slug) ?? null;
}
