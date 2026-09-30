import CollectionCard from "@/components/admin/CollectionCard";
import NewCollection from "@/components/admin/NewCollection";
import { PageHeader } from "@/components/admin/ui";
import { listCollections } from "@/lib/store/collections";
import { listAllProducts } from "@/lib/store/products";

export const dynamic = "force-dynamic";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([listCollections(true), listAllProducts()]);
  const options = products.map((p) => ({ value: p.slug, label: p.name }));

  // listAllProducts already comes back in position order, so each collection's
  // list is in the order the shop shows it without sorting again here.
  const itemsFor = (id: string) =>
    products
      .filter((p) => p.collection === id)
      .map((p) => ({ slug: p.slug, name: p.name, sku: p.sku, image: p.images.front }));

  return (
    <>
      <PageHeader
        title="Collections"
        subtitle="The houses on the homepage. A collection with nothing in it shows as coming soon."
      />

      <div className="space-y-6">
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} products={options} items={itemsFor(c.id)} />
        ))}
        <NewCollection />
      </div>
    </>
  );
}
