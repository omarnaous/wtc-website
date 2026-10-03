import type { Metadata } from "next";
import { Suspense } from "react";
import Catalog from "@/components/catalog/Catalog";
import CatalogParams from "@/components/catalog/CatalogParams";
import { getSection, str, listCollections } from "@/lib/store/storefront";
import { listStorefrontProducts } from "@/lib/store/products";
export { dynamic } from "@/lib/runtime";

export async function generateMetadata(): Promise<Metadata> {
  const catalog = await getSection("catalog");
  return {
    title: "Shop all",
    description:
      str(catalog, "copy") ||
      "Everything WTC has in hand — filter by collection, series, colour, availability and budget.",
  };
}

export default async function ProductsPage() {
  const [catalog, products, collections] = await Promise.all([
    getSection("catalog"),
    listStorefrontProducts(),
    listCollections(),
  ]);

  const chips = collections.map((c) => ({ id: c.id as string, name: c.name }));
  const accent = str(catalog, "accent");
  const copy = {
    searchPlaceholder: str(catalog, "searchPlaceholder"),
    emptyMessage: str(catalog, "emptyMessage"),
    emptyCopy: str(catalog, "emptyCopy"),
    clearLabel: str(catalog, "clearLabel"),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-10">
      <p className="eyebrow">{str(catalog, "eyebrow")}</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em]">
        {str(catalog, "title")}
        {accent && <span className="font-serif font-normal italic text-gold-soft"> {accent}</span>}
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute">{str(catalog, "copy")}</p>

      <div className="mt-12">
        <Suspense fallback={<Catalog products={products} collections={chips} copy={copy} />}>
          <CatalogParams products={products} collections={chips} copy={copy} />
        </Suspense>
      </div>
    </div>
  );
}
