/**
 * Catalogue limits and labels, with nothing behind them.
 *
 * Kept apart from src/lib/store/products.ts because the dashboard's product
 * form is a client component: importing a number from the store would pull the
 * D1 binding into the browser bundle, where `cloudflare:workers` does not
 * resolve and the build stops.
 *
 * The label maps below used to live in src/data/products.ts, alongside the
 * shipped catalogue. Reading one constant from there meant bundling all 26
 * placeholder watches with it — so they moved here when that file went and D1
 * became the only catalogue.
 */
import type { Availability, ColorGroup, Family } from "@/data/types";

/** How many photographs one watch may carry. */
export const MAX_PHOTOS = 5;

export const FAMILY_LABEL: Record<Family, string> = {
  classics: "Classics",
  moonphase: "Moonphase",
  earthphase: "Earthphase",
  "mission-on-earth": "Mission on Earth",
  special: "Special Edition",
};

export const FAMILIES = Object.keys(FAMILY_LABEL) as Family[];

export const COLOR_GROUPS: { id: ColorGroup; label: string; swatch: string }[] = [
  { id: "black", label: "Black", swatch: "#1a1a1a" },
  { id: "white", label: "White", swatch: "#ededea" },
  { id: "grey", label: "Grey", swatch: "#bdbdbd" },
  { id: "blue", label: "Blue", swatch: "#2b57a0" },
  { id: "green", label: "Green", swatch: "#1fa5a0" },
  { id: "red", label: "Red", swatch: "#b33a2b" },
  { id: "orange", label: "Orange", swatch: "#d1502a" },
  { id: "yellow", label: "Yellow", swatch: "#f2c200" },
  { id: "pink", label: "Pink", swatch: "#e0afa9" },
  { id: "brown", label: "Brown", swatch: "#7a5c42" },
  { id: "gold", label: "Moonshine Gold", swatch: "#c9a227" },
];

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "pre-order": "Pre-order",
  "sold-out": "Sold out",
};
