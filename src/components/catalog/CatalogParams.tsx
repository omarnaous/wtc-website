"use client";

import { useSearchParams } from "next/navigation";
import Catalog from "./Catalog";
import { FAMILIES } from "@/data/products";
import type { Family } from "@/data/types";

/**
 * Reads ?family= on the client. The catalogue page is prerendered to static
 * HTML, so the query string is only known once the page is running — hence
 * the client component and the Suspense boundary around it.
 */
export default function CatalogParams() {
  const family = useSearchParams().get("family");
  const initialFamily = FAMILIES.includes(family as Family) ? (family as Family) : undefined;

  // Catalog seeds its filter state once, so remount when the link changes.
  return <Catalog key={initialFamily ?? "all"} initialFamily={initialFamily} />;
}
