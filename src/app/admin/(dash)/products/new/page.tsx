import ProductForm from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { listCollections } from "@/lib/store/collections";
import { listStraps } from "@/lib/store/straps";
import { listUploads } from "@/lib/store/media";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Add a watch" };

export default async function NewProductPage() {
  const [collections, straps, uploads] = await Promise.all([
    listCollections(true),
    listStraps(),
    listUploads(),
  ]);

  return (
    <>
      <PageHeader
        title="Add a watch"
        subtitle="Name, photograph, price — that is enough. Straps and stock come next, once it exists."
        back={{ href: "/admin/products", label: "Watches" }}
      />
      <ProductForm
        collections={collections}
        strapOptions={straps.map((s) => ({ value: s.sku, label: `${s.name} (${s.sku})` }))}
        action={createProduct}
        uploads={uploads}
        isNew
      />
    </>
  );
}
