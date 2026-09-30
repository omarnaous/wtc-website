"use client";

import { useSearchParams } from "next/navigation";
import Catalog, { type CatalogCopy } from "./Catalog";
import { FAMILIES } from "@/data/products";
import type { CollectionId, Family, Product } from "@/data/types";

/**
 * Reads ?family= and ?collection= on the client, so the collection tiles and
 * the footer can link straight into a filtered catalogue.
 */
export default function CatalogParams({
  products,
  collections,
  copy,
}: {
  products: Product[];
  collections: { id: string; name: string }[];
  copy?: Partial<CatalogCopy>;
}) {
  const params = useSearchParams();
  const family = params.get("family");
  const collection = params.get("collection");

  const initialFamily = FAMILIES.includes(family as Family) ? (family as Family) : undefined;
  const initialCollection = collections.some((c) => c.id === collection)
    ? (collection as CollectionId)
    : undefined;

  // Catalog seeds its filter state once, so remount when the link changes.
  return (
    <Catalog
      key={`${initialCollection ?? "all"}-${initialFamily ?? "all"}`}
      products={products}
      collections={collections}
      copy={copy}
      initialCollection={initialCollection}
      initialFamily={initialFamily}
    />
  );
}
