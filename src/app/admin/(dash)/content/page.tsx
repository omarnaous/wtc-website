import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { SECTIONS, SECTION_GROUPS } from "@/lib/content/schema";
import { tryAll } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sections" };

export default async function ContentPage() {
  const edited = await tryAll<{ key: string; updated_at: string; updated_by: string | null }>(
    `SELECT key, updated_at, updated_by FROM content_sections`,
  );
  const byKey = new Map(edited.map((r) => [r.key, r]));

  return (
    <>
      <PageHeader
        title="Website sections"
        subtitle="Every block on the site, and the words in it. Changes are live the moment you save."
      />

      <div className="space-y-6">
        {SECTION_GROUPS.map((group) => {
          const items = SECTIONS.filter((s) => s.group === group);
          if (!items.length) return null;
          return (
            <Card key={group} title={group} bodyClassName="p-2">
              <ul className="divide-y divide-[var(--admin-line-soft)]">
                {items.map((section) => {
                  const meta = byKey.get(section.key);
                  return (
                    <li key={section.key}>
                      <Link prefetch={false}
                        href={`/admin/content/${section.key}`}
                        className="flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--admin-line-soft)]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-medium">{section.label}</span>
                          <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--admin-mute)]">
                            {section.description}
                          </span>
                        </span>
                        <span className="hidden shrink-0 text-[11.5px] text-[var(--admin-mute-2)] sm:block">
                          {section.fields.length} fields
                          {meta?.updated_by && ` · last by ${meta.updated_by}`}
                        </span>
                        <span aria-hidden className="text-[var(--admin-mute-2)]">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}
