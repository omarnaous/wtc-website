import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import StrapPicker, { type FittedStrap, type StrapChoice } from "@/components/admin/StrapPicker";
import DangerZone from "@/components/admin/DangerZone";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { getProduct } from "@/lib/store/products";
import { listCollections } from "@/lib/store/collections";
import { listStraps } from "@/lib/store/straps";
import { listUploads } from "@/lib/store/media";
import { tryAll } from "@/lib/db/sql";
import { deleteProduct, saveProduct } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? "Watch" };
}

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, collections, straps, uploads] = await Promise.all([
    getProduct(slug),
    listCollections(true),
    listStraps(),
    listUploads(),
  ]);
  if (!product) notFound();

  const fittedRows = await tryAll<{
    strap_sku: string;
    photo: string | null;
    chip: string | null;
    price_override: number | null;
    is_default: number;
  }>(
    `SELECT strap_sku, photo, chip, price_override, is_default
       FROM product_straps WHERE product_slug = ? ORDER BY position`,
    [slug],
  );

  const bySku = new Map(straps.map((s) => [s.sku, s]));
  const fitted: FittedStrap[] = fittedRows
    .filter((r) => bySku.has(r.strap_sku))
    .map((r) => {
      const s = bySku.get(r.strap_sku)!;
      return {
        sku: s.sku,
        name: s.name,
        type: s.type,
        price: s.price,
        color: s.primary,
        image: s.image,
        photo: r.photo ?? undefined,
        chip: r.chip ?? undefined,
        priceOverride: r.price_override,
      };
    });

  const catalogue: StrapChoice[] = straps
    .filter((s) => s.status === "active")
    .map((s) => ({
      sku: s.sku,
      name: s.name,
      type: s.type,
      price: s.price,
      color: s.primary,
      image: s.image,
    }));

  const defaultSku = fittedRows.find((r) => r.is_default === 1)?.strap_sku;

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={`${product.sku || "no reference"} · /products/${product.slug} · stock is on the Watches list`}
        back={{ href: "/admin/products", label: "Watches" }}
        actions={
          <LinkButton href={`/products/${product.slug}`} target="_blank">
            View on site ↗
          </LinkButton>
        }
      />

      <div className="space-y-4">
        <ProductForm
          product={product}
          collections={collections}
          strapOptions={straps.map((s) => ({ value: s.sku, label: `${s.name} (${s.sku})` }))}
          action={saveProduct}
          uploads={uploads}
        />

        <StrapPicker
          slug={product.slug}
          fitted={fitted}
          catalogue={catalogue}
          defaultSku={defaultSku}
        />

        <DangerZone
          action={deleteProduct}
          hiddenName="__slug"
          hiddenValue={product.slug}
          confirmWord={product.slug}
          label="Delete this watch"
          description="Removes it and its strap fittings for good. If it has ever been ordered, archive it instead so those orders still read correctly."
        />
      </div>
    </>
  );
}
