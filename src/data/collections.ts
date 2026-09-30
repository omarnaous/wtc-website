import { products } from "./products";
import type { CollectionId, Product } from "./types";

/**
 * The top level of the catalogue: the brand partnerships WTC deals in.
 * The homepage shows one tile per collection, and each tile opens the
 * catalogue filtered to it — /products?collection=<id>.
 *
 * To add a collection later: add an entry here, then set `collection` on the
 * products that belong to it in products.ts. Nothing else needs to change.
 */
export interface Collection {
  id: CollectionId;
  name: string;
  /** Sits under the name on the tile. */
  blurb: string;
  /** Product whose photography fronts the tile. */
  heroSlug?: string;
  /** Tints the tile. */
  accent: string;
  /** Overrides the shared "Coming soon" wording on this tile. */
  badge?: string;
  /** Two or three letters, drawn large when the tile has no photograph. */
  monogram?: string;
  /**
   * "auto" — empty reads as upcoming, which is the old behaviour.
   * "upcoming" / "open" — say so regardless of how many watches are in it.
   */
  state?: "auto" | "upcoming" | "open";
}

export const collections: Collection[] = [
  {
    id: "omega-swatch",
    name: "Omega × Swatch",
    blurb: "The Bioceramic MoonSwatch — every mission, Moonphase and Earthphase.",
    heroSlug: "mission-to-the-moonphase-full-moon",
    accent: "#c9a227",
  },
  {
    id: "ap-swatch",
    name: "AP × Swatch",
    blurb: "Arriving soon. Message us to be told first.",
    accent: "#5b8bc5",
  },
];

export const collectionById = (id: string) =>
  collections.find((c) => c.id === id);

export const productsIn = (id: CollectionId): Product[] =>
  products.filter((p) => p.collection === id);

export const countIn = (id: CollectionId) => productsIn(id).length;

/** A collection with nothing in it yet is shown as upcoming, not as empty. */
export const isUpcoming = (id: CollectionId) => countIn(id) === 0;
