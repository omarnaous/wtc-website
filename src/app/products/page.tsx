import type { Metadata } from "next";
import { Suspense } from "react";
import Catalog from "@/components/catalog/Catalog";
import CatalogParams from "@/components/catalog/CatalogParams";

export const metadata: Metadata = {
  title: "Shop all MoonSwatch",
  description:
    "Every Bioceramic MoonSwatch reference stocked by WTC — filter by collection, colour, availability and budget.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-10">
      <p className="eyebrow">Catalogue</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em]">
        Bioceramic MoonSwatch
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mute">
        Boutique-sourced, checked in hand, shipped complete with box, papers and
        the original strap.
      </p>

      <div className="mt-12">
        <Suspense fallback={<Catalog />}>
          <CatalogParams />
        </Suspense>
      </div>
    </div>
  );
}
