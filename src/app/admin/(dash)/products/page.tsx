import CatalogueSheet, { type SheetRow } from "@/components/admin/CatalogueSheet";
import ImportCatalogue from "@/components/admin/ImportCatalogue";
import { Card, LinkButton, Notice, PageHeader } from "@/components/admin/ui";
import { listAllProducts } from "@/lib/store/products";
import { listCollections } from "@/lib/store/collections";

export const dynamic = "force-dynamic";

export const metadata = { title: "Watches" };

export default async function ProductsPage() {
  const [all, collections] = await Promise.all([listAllProducts(), listCollections(true)]);

  const rows: SheetRow[] = all.map((p) => ({
    kind: "watch" as const,
    ref: p.slug,
    name: p.name,
    detail: `${p.sku} · ${p.familyLabel}${p.bestsellerRank ? ` · bestseller #${p.bestsellerRank}` : ""}`,
    image: p.images.front,
    href: `/admin/products/${p.slug}`,
    price: p.price,
    status: p.status,
    collectionId: p.collection ?? "",
    // One number: what is left to sell. Untracked shows as an empty box.
    stock: p.stock.track ? p.stock.onHand - p.stock.reserved : null,
  }));

  const homeless = collections.length === 0;

  return (
    <>
      <PageHeader
        title="Watches"
        subtitle={`${all.length} in the catalogue. Collection and stock are editable here — orders move the stock on their own.`}
        actions={
          <LinkButton href="/admin/products/new" tone="primary">
            Add a watch
          </LinkButton>
        }
      />

      {all.length === 0 ? (
        <Card title="Nothing here yet">
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--admin-mute)]">
              Import the catalogue that ships with the design, or add a watch by hand.
            </p>
            <ImportCatalogue />
          </div>
        </Card>
      ) : (
        <>
          {homeless && (
            <div className="mb-4">
              <Notice tone="info">
                No collections yet. Add one under Collections and every watch can be filed into it.
              </Notice>
            </div>
          )}
          <CatalogueSheet
            rows={rows}
            collections={collections.map((c) => ({ id: c.id, name: c.name }))}
            emptyLabel="No watch matches those filters."
          />
        </>
      )}
    </>
  );
}
