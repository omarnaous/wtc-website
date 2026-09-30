import data from "./strap-photos.json";
import { asset } from "@/lib/asset";

/**
 * Real photographs of each strap fitted to the watch it belongs to, shot by
 * Wristbuddys in a fixed studio setup. Within a set the watch is pixel-aligned
 * frame to frame, so cross-fading reads as the strap being changed rather than
 * as a slideshow.
 *
 * Regenerate with `npm run strap-photos`.
 */
export interface StrapPhoto {
  id: string;
  name: string;
  /** Sampled from the strap in the photo — used for the picker swatches. */
  color: string;
  image: string;
  /** Square crop of the strap itself, stitching included — the picker swatch. */
  chip: string;
  width: number;
  height: number;
}

export interface StrapSet {
  /** The Wristbuddys product these frames came from. */
  source: string;
  straps: StrapPhoto[];
}

/** Placeholder — WTC sets its own strap pricing. See src/data/README.md. */
export const STRAP_PRICE = 49;

const sets = data.sets as Record<string, StrapSet>;
const bySlug = data.bySlug as Record<string, string>;

export function strapSetFor(slug: string): StrapSet | undefined {
  const set = sets[bySlug[slug]];
  if (!set) return undefined;
  return {
    ...set,
    straps: set.straps.map((s) => ({ ...s, image: asset(s.image), chip: asset(s.chip) })),
  };
}

export const hasStrapPhotos = (slug: string) => Boolean(bySlug[slug]);

export const photoSetCount = Object.keys(sets).length;
export const photoCount = Object.values(sets).reduce((n, s) => n + s.straps.length, 0);
