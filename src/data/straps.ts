import palettes from "./palettes.json";
import { asset } from "@/lib/asset";
import type { ColorGroup, Strap } from "./types";

/**
 * MoonSwatch strap catalogue — 37 references scraped from
 * swatch.com/en-en/accessories/watch-straps/moonswatch-straps/
 * Prices are WTC placeholders. See src/data/README.md.
 */

type Seed = [
  sku: string,
  name: string,
  colorway: string,
  group: ColorGroup,
  primary: string,
  secondary: string,
  pairedWith?: string,
];

const rubber: Seed[] = [
  ["ACSO33001", "Dark Grey / Black Rubber", "Dark Grey / Black", "grey", "#4a4a4d", "#161616"],
  ["ACSO33002", "Orange / Sand Rubber", "Orange / Sand", "orange", "#e0642c", "#d8c9a8"],
  ["ACSO33003", "Dark Blue / Green Rubber", "Dark Blue / Green", "blue", "#1f3358", "#2f7d5c"],
  ["ACSO33004", "White / Yellow Rubber", "White / Yellow", "white", "#efefe9", "#f3c718"],
  ["ACSO33005", "Light Blue / White Rubber", "Light Blue / White", "blue", "#8fbcd8", "#efefe9"],
  ["ACSO33006", "Black / Grey Rubber", "Black / Grey", "black", "#181818", "#8c8c8c"],
  ["ACSO33007", "Bordeaux / Light Grey Rubber", "Bordeaux / Light Grey", "red", "#6d2130", "#c4c4c0"],
  ["ACSO33008", "Navy Blue / Blue Rubber", "Navy Blue / Blue", "blue", "#1d2f5c", "#3f73bd"],
  ["ACSO33009", "Pink / White Rubber", "Pink / White", "pink", "#e6a8b8", "#efefe9"],
  ["ACSO33010", "Red / White Rubber", "Red / White", "red", "#bf2f2b", "#efefe9"],
  ["ACSO33011", "Brown / Beige Rubber", "Brown / Beige", "brown", "#6f4f36", "#ddcbae"],
  ["ACSO33012", "White / White Rubber", "White", "white", "#f1f1eb", "#e2e2db"],
  ["ACSO33013", "Black / Black Rubber", "Black", "black", "#141414", "#232323"],
  ["ACSO33014", "Black / Orange Rubber", "Black / Orange", "black", "#151515", "#e4661f"],
  ["ACSO33015", "Dark Blue / Turquoise Rubber", "Dark Blue / Turquoise", "blue", "#1d3050", "#25a8ab"],
  ["ACSO33016", "Dark Brown / Sand Rubber", "Dark Brown / Sand", "brown", "#4b3323", "#d6bf99"],
  ["ACSO33017", "Grey / Grey Rubber", "Grey", "grey", "#9b9b9b", "#7d7d7d"],
  ["ACSO33018", "Pink / Pink Rubber", "Pink", "pink", "#e8aab6", "#d78e9d"],
  ["ACSO33019", "Dark Blue / White Rubber", "Dark Blue / White", "blue", "#1f3563", "#efefe9"],
];

const velcro: Seed[] = [
  ["ACSO33J100", "Mission to the Sun / VELCRO®", "White / Solar Yellow", "white", "#f2c200", "#fdf6df", "mission-to-the-sun"],
  ["ACSO33A100", "Mission to Mercury / VELCRO®", "Mercury Grey", "grey", "#d2cabb", "#f0ebe1", "mission-to-mercury"],
  ["ACSO33P100", "Mission to Venus / VELCRO®", "Ivory / Rose", "white", "#d79e9b", "#f6ece9", "mission-to-venus"],
  ["ACSO33G100", "Mission on Earth / VELCRO®", "Navy", "blue", "#1f4b8f", "#eef1f7", "mission-on-earth"],
  ["ACSO33M100", "Mission to the Moon / VELCRO®", "Moon Black", "black", "#1a1a1a", "#7a7a7a", "mission-to-the-moon"],
  ["ACSO33R100", "Mission to Mars / VELCRO®", "White / Rocket Red", "white", "#ac3527", "#f2e0dc", "mission-to-mars"],
  ["ACSO33C100", "Mission to Jupiter / VELCRO®", "Black", "black", "#e3dac6", "#b79a6d", "mission-to-jupiter"],
  ["ACSO33T100", "Mission to Saturn / VELCRO®", "Ring Brown", "brown", "#74563e", "#d8c7ae", "mission-to-saturn"],
  ["ACSO33L100", "Mission to Uranus / VELCRO®", "White / Ice Blue", "white", "#a4c5cb", "#eaf3f4", "mission-to-uranus"],
  ["ACSO33N100", "Mission to Neptune / VELCRO®", "Black", "black", "#213a72", "#e6eaf4", "mission-to-neptune"],
  ["ACSO33M101", "Mission to Pluto / VELCRO®", "Frost Grey", "grey", "#c3bfc7", "#efedf1", "mission-to-pluto"],
  ["ACSO33W700", "Mission to the Moonphase / VELCRO® — White", "Snow White", "white", "#e7e5de", "#c9a227", "mission-to-the-moonphase-full-moon"],
  ["ACSO33B700", "Mission to the Moonphase / VELCRO® — Black", "Eclipse Black", "black", "#171717", "#c9a227", "mission-to-the-moonphase-new-moon"],
  ["ACSO33M700", "Mission to Earthphase / VELCRO®", "Graphite Black", "black", "#31548d", "#eef1f8", "mission-to-earthphase"],
  ["ACSO33O100", "Mission on Earth — Lava / VELCRO®", "Black / Lava Red", "black", "#c74b27", "#3a2a24", "mission-on-earth-lava"],
  ["ACSO33L103", "Mission on Earth — Polar / VELCRO®", "Black / Aurora Teal", "black", "#1b8f8b", "#dff5f3", "mission-on-earth-polar-lights"],
  ["ACSO33T103", "Mission on Earth — Desert / VELCRO®", "Dune Taupe", "brown", "#bc9e76", "#f2e7d5", "mission-on-earth-desert"],
  ["ACSO33M106", "MoonSwatch 1965 / VELCRO®", "Steel Grey", "grey", "#c9c9c9", "#efefef", "moonswatch-1965"],
];

const extracted = palettes.straps as Record<string, { primary?: string; secondary?: string }>;

const build = (rows: Seed[], type: Strap["type"], price: number): Strap[] =>
  rows.map(([sku, name, colorway, colorGroup, primary, secondary, pairedWith]) => ({
    sku,
    name,
    type,
    colorway,
    colorGroup,
    price,
    image: asset(`/products/straps/${sku}.png`),
    primary: extracted[sku]?.primary ?? primary,
    secondary: extracted[sku]?.secondary ?? secondary,
    pairedWith,
  }));

export const straps: Strap[] = [
  ...build(velcro, "velcro", 58),
  ...build(rubber, "rubber", 45),
];

export const strapBySku = (sku: string) => straps.find((s) => s.sku === sku);

/** Straps offered in the Strap Studio for a given watch, stock strap first. */
export function strapsFor(stockStrapSku?: string): Strap[] {
  if (!stockStrapSku) return straps;
  const stock = straps.find((s) => s.sku === stockStrapSku);
  return stock ? [stock, ...straps.filter((s) => s.sku !== stockStrapSku)] : straps;
}
