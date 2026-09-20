import type { Availability, ColorGroup, Family, Product } from "@/data/types";

export type Sort = "featured" | "price-asc" | "price-desc" | "newest" | "name";

export interface FilterState {
  families: Family[];
  colors: ColorGroup[];
  availability: Availability[];
  maxPrice: number;
  query: string;
  sort: Sort;
}

export const EMPTY: FilterState = {
  families: [],
  colors: [],
  availability: [],
  maxPrice: Infinity,
  query: "",
  sort: "featured",
};

export const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "newest", label: "Newest first" },
  { id: "name", label: "A–Z" },
];

export function apply(products: Product[], f: FilterState): Product[] {
  const q = f.query.trim().toLowerCase();

  const out = products.filter((p) => {
    if (f.families.length && !f.families.includes(p.family)) return false;
    if (f.colors.length && !f.colors.includes(p.colorGroup)) return false;
    if (f.availability.length && !f.availability.includes(p.availability)) return false;
    if (p.price > f.maxPrice) return false;
    if (
      q &&
      ![p.name, p.sku, p.colorway, p.familyLabel, p.tagline].some((v) =>
        v.toLowerCase().includes(q)
      )
    )
      return false;
    return true;
  });

  const ranked = [...out];
  switch (f.sort) {
    case "price-asc":
      return ranked.sort((a, b) => a.price - b.price);
    case "price-desc":
      return ranked.sort((a, b) => b.price - a.price);
    case "newest":
      return ranked.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));
    case "name":
      return ranked.sort((a, b) => a.name.localeCompare(b.name));
    default:
      // Featured: bestsellers first in rank order, then everything else.
      return ranked.sort(
        (a, b) => (a.bestsellerRank ?? 99) - (b.bestsellerRank ?? 99) || a.name.localeCompare(b.name)
      );
  }
}

export const activeCount = (f: FilterState) =>
  f.families.length +
  f.colors.length +
  f.availability.length +
  (Number.isFinite(f.maxPrice) ? 1 : 0) +
  (f.query ? 1 : 0);
