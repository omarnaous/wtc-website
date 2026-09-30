import CatalogueSheet, { type SheetRow } from "@/components/admin/CatalogueSheet";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { listStraps } from "@/lib/store/straps";

export const dynamic = "force-dynamic";

export const metadata = { title: "Straps" };

export default async function StrapsPage() {
  const all = await listStraps();

  const rows: SheetRow[] = all.map((s) => ({
    kind: "strap" as const,
    ref: s.sku,
    name: s.name,
    detail: `${s.sku} · ${s.type} · fitted to ${s.fittedTo ?? 0} watch${(s.fittedTo ?? 0) === 1 ? "" : "es"}`,
    image: s.image,
    href: `/admin/straps/${s.sku}`,
    price: s.price,
    status: s.status,
    stock: s.track ? s.onHand : null,
  }));

  return (
    <>
      <PageHeader
        title="Straps"
        subtitle={`${all.length} references. Stock is editable here — which straps appear on a watch is set on that watch.`}
        actions={
          <LinkButton href="/admin/straps/new" tone="primary">
            Add a strap
          </LinkButton>
        }
      />
      <CatalogueSheet rows={rows} emptyLabel="No strap matches those filters." />
    </>
  );
}
