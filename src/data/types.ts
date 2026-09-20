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
