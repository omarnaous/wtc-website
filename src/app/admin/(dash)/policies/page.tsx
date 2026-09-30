import Link from "next/link";
import { Card, LinkButton, PageHeader, Pill } from "@/components/admin/ui";
import { listPolicies } from "@/lib/store/policies";

export const dynamic = "force-dynamic";

export const metadata = { title: "Policies" };

export default async function PoliciesPage() {
  const policies = await listPolicies(true);

  return (
    <>
      <PageHeader
        title="Policies"
        subtitle="Shipping, returns, warranty, privacy — and anything else you want a page for."
        actions={<LinkButton href="/admin/policies/new" tone="primary">Add a policy</LinkButton>}
      />

      <Card bodyClassName="p-2">
        <ul className="divide-y divide-[var(--admin-line-soft)]">
          {policies.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/admin/policies/${p.slug}`}
                className="flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-[var(--admin-line-soft)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium">{p.title}</span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-[var(--admin-mute)]">
                    {p.summary || `${p.body.length} paragraph(s)`}
                  </span>
                </span>
                {p.status === "hidden" && <Pill tone="grey">Hidden</Pill>}
                <span className="hidden text-[11.5px] text-[var(--admin-mute-2)] sm:block">
                  /policies/{p.slug}
                </span>
                <span aria-hidden className="text-[var(--admin-mute-2)]">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
