/**
 * A collection is the brand partnership a piece belongs to — the top level of
 * the catalogue, and what the homepage tiles link into. `Family` sits one
 * level below it (the series within a collection).
 */
export type CollectionId = "omega-swatch" | "ap-swatch";

export type Family =
  | "classics"
  | "moonphase"
  | "earthphase"
  | "mission-on-earth"
  | "special";

export type Availability = "in-stock" | "low-stock" | "pre-order" | "sold-out";

export interface Palette {
  /** Bioceramic case flank */
  case: string;
  bezel: string;
  dial: string;
  subdial: string;
  strap: string;
}

export interface Product {
  /** URL slug, e.g. "mission-to-mercury" */
  slug: string;
  collection: CollectionId;
  /** Official Swatch reference, e.g. "SO33A100" */
  sku: string;
  name: string;
  /** Short label used in tight spaces (cards, filter chips) */
  shortName: string;
  family: Family;
  familyLabel: string;
  year: number;
  /** Reseller price in USD. Placeholder data — see data/README.md */
  price: number;
  /** Optional was-price for a strikethrough */
  compareAt?: number;
  availability: Availability;
  /** Marketing colour name, used by the colour filter */
  colorway: string;
  /** Filterable colour group */
  colorGroup: ColorGroup;
  strapType: "velcro" | "rubber";
  /** Reference of the Velcro strap this model ships with */
  stockStrapSku?: string;
  bestsellerRank?: number;
  tagline: string;
  description: string;
  /** A line under the buy buttons. Empty falls back to the shared sentence. */
  footerNote?: string;
  /** Its own specification rows. Empty falls back to the shared ones. */
  specs?: { label: string; value: string }[];
  /** Every photograph, in order. The first one leads everywhere. */
  photos?: string[];
  /** The first three photographs, named — what most of the site reads. */
  images: { front: string; angle: string; side: string };
  palette: Palette;
}

export type ColorGroup =
  | "black"
  | "white"
  | "grey"
  | "blue"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "pink"
  | "brown"
  | "gold";

export interface Strap {
  sku: string;
  name: string;
  type: "velcro" | "rubber";
  /** Marketing colour, e.g. "Navy Blue / Blue" */
  colorway: string;
  colorGroup: ColorGroup;
  price: number;
  image: string;
  primary: string;
  secondary: string;
  /** Slug of the watch this Velcro strap was made for, when applicable */
  pairedWith?: string;
}
