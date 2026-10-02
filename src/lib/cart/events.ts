/**
 * Two small page-wide signals between components that do not share a parent:
 *
 *  - `wtc:added`   — something went into the bag (fired by AddToCart).
 *  - `wtc:strap`   — the Strap Studio's selection changed.
 *
 * The product page uses them to run one flow: add the watch, and the page
 * moves to the Strap Studio with its first strap picked, while the bar along
 * the bottom turns into that strap's "Add to bag".
 */

export interface AddedDetail {
  kind: "watch" | "strap";
  ref: string;
}

export interface StrapDetail {
  id: string;
  name: string;
  price: number;
  chip: string;
  soldOut: boolean;
  /** The watch it is shown on. */
  watch: string;
}

export const emitAdded = (d: AddedDetail) =>
  window.dispatchEvent(new CustomEvent<AddedDetail>("wtc:added", { detail: d }));

export const emitStrap = (d: StrapDetail) =>
  window.dispatchEvent(new CustomEvent<StrapDetail>("wtc:strap", { detail: d }));

export function onAdded(fn: (d: AddedDetail) => void) {
  const h = (e: Event) => fn((e as CustomEvent<AddedDetail>).detail);
  window.addEventListener("wtc:added", h);
  return () => window.removeEventListener("wtc:added", h);
}

export function onStrap(fn: (d: StrapDetail) => void) {
  const h = (e: Event) => fn((e as CustomEvent<StrapDetail>).detail);
  window.addEventListener("wtc:strap", h);
  return () => window.removeEventListener("wtc:strap", h);
}
