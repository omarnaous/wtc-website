import palettes from "./palettes.json";
import manifest from "./images.json";
import { asset } from "@/lib/asset";
import type {
  Availability,
  CollectionId,
  ColorGroup,
  Family,
  Palette,
  Product,
} from "./types";

/**
 * Catalogue sourced from swatch.com/en-en/bioceramic-moonswatch-collection.html
 * (names, references and product photography).
 *
 * PRICES AND STOCK ARE PLACEHOLDERS — WTC sets its own resale pricing.
 * See src/data/README.md before going live.
 */

type Seed = Omit<Product, "images" | "palette" | "familyLabel" | "collection"> & {
  /** Defaults to the Omega × Swatch collection. */
  collection?: CollectionId;
};

export const FAMILY_LABEL: Record<Family, string> = {
  classics: "Classics",
  moonphase: "Moonphase",
  earthphase: "Earthphase",
  "mission-on-earth": "Mission on Earth",
  special: "Special Edition",
  "royal-pop": "Royal Pop",
};

/**
 * The specification rows each collection shows on its product pages, as WTC
 * supplied them. A seed with its own `specs` keeps those instead.
 */
export const COLLECTION_SPECS: Record<CollectionId, { label: string; value: string }[]> = {
  "omega-swatch": [
    { label: "Case", value: "42 mm" },
    { label: "Movement", value: "Quartz chronograph" },
    { label: "Material", value: "Plastic" },
    { label: "Velcro colour", value: "Matched to the watch" },
  ],
  "ap-swatch": [
    { label: "Case", value: "40 mm" },
    { label: "Movement", value: "Mechanical movement" },
    { label: "Material", value: "Bioceramic" },
  ],
};

const seeds: Seed[] = [
  // ── Classics · the eleven original missions (2022) ────────────────────────
  {
    slug: "mission-to-the-sun",
    sku: "SO33J100",
    name: "Mission to the Sun",
    shortName: "The Sun",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Solar Yellow / Cream",
    colorGroup: "yellow",
    strapType: "velcro",
    stockStrapSku: "ACSO33J100",
    bestsellerRank: 7,
    tagline: "The loudest one in the room.",
    description:
      "The brightest of the eleven original missions — a solar-yellow Bioceramic case and bezel over a cream dial, on a white strap. It is the piece that started most collections, and the one people notice from across a table.",
  },
  {
    slug: "mission-to-mercury",
    sku: "SO33A100",
    name: "Mission to Mercury",
    shortName: "Mercury",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Graphite Grey",
    colorGroup: "grey",
    strapType: "velcro",
    stockStrapSku: "ACSO33A100",
    bestsellerRank: 9,
    tagline: "Quiet, warm, endlessly wearable.",
    description:
      "A graphite Bioceramic case with a black bezel and a dark grey dial. Mercury is the sleeper of the collection — understated enough for a suit, and the one most owners end up wearing daily.",
  },
  {
    slug: "mission-to-venus",
    sku: "SO33P100",
    name: "Mission to Venus",
    shortName: "Venus",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Dusty Rose / Cream",
    colorGroup: "pink",
    strapType: "velcro",
    stockStrapSku: "ACSO33P100",
    tagline: "Rose gold's louder cousin.",
    description:
      "A dusty rose Bioceramic case against a warm cream dial and bezel. One of the two models that made the collection genuinely unisex, and still one of the hardest to find in good condition.",
  },
  {
    slug: "mission-on-earth",
    sku: "SO33G100",
    name: "Mission on Earth",
    shortName: "On Earth",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "low-stock",
    colorway: "Sage Green / Navy",
    colorGroup: "green",
    strapType: "velcro",
    stockStrapSku: "ACSO33G100",
    bestsellerRank: 5,
    tagline: "Green case, navy dial, home planet.",
    description:
      "A soft sage-green Bioceramic case wrapped around a deep navy dial, finished with a rust-orange chronograph hand and a navy strap. The most quietly sophisticated of the original eleven, and consistently the most requested classic at WTC.",
  },
  {
    slug: "mission-to-the-moon",
    sku: "SO33M100",
    name: "Mission to the Moon",
    shortName: "The Moon",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Moon Black",
    colorGroup: "black",
    strapType: "velcro",
    stockStrapSku: "ACSO33M100",
    bestsellerRank: 2,
    tagline: "The Speedmaster tribute.",
    description:
      "The one that caused the queues. Black Bioceramic, black dial, white hands — the closest the collection gets to the Speedmaster Professional it is built in homage to. If you buy one MoonSwatch, most collectors say buy this one.",
  },
  {
    slug: "mission-to-mars",
    sku: "SO33R100",
    name: "Mission to Mars",
    shortName: "Mars",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Rocket Red / White",
    colorGroup: "red",
    strapType: "velcro",
    stockStrapSku: "ACSO33R100",
    bestsellerRank: 6,
    tagline: "Red case, white dial.",
    description:
      "A bright rocket-red Bioceramic case and pushers set against a silver-white dial, white tachymetre ring and white Velcro strap. Mars photographs better than almost anything else in the collection and has been its fastest mover since launch.",
  },
  {
    slug: "mission-to-jupiter",
    sku: "SO33C100",
    name: "Mission to Jupiter",
    shortName: "Jupiter",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Cream Beige / Black",
    colorGroup: "brown",
    strapType: "velcro",
    stockStrapSku: "ACSO33C100",
    tagline: "The vintage-looking one.",
    description:
      "A warm tan Bioceramic case with a cream-beige dial and gold-toned printing, run on a black strap. Jupiter ages like a vintage chronograph on the wrist.",
  },
  {
    slug: "mission-to-saturn",
    sku: "SO33T100",
    name: "Mission to Saturn",
    shortName: "Saturn",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Taupe / Brown",
    colorGroup: "brown",
    strapType: "velcro",
    stockStrapSku: "ACSO33T100",
    tagline: "Beige dial, brown strap.",
    description:
      "A pale taupe Bioceramic case and a soft beige dial with gold-toned indices, on a rich brown strap. The warmest piece in the collection and a genuine autumn-to-winter watch.",
  },
  {
    slug: "mission-to-uranus",
    sku: "SO33L100",
    name: "Mission to Uranus",
    shortName: "Uranus",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Ice Blue",
    colorGroup: "blue",
    strapType: "velcro",
    stockStrapSku: "ACSO33L100",
    tagline: "Pale blue, quiet confidence.",
    description:
      "A pale ice-blue Bioceramic case over an even lighter blue dial, on a white strap. Uranus is the softest colourway of the eleven and the one that looks most expensive in daylight.",
  },
  {
    slug: "mission-to-neptune",
    sku: "SO33N100",
    name: "Mission to Neptune",
    shortName: "Neptune",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "in-stock",
    colorway: "Sky Blue / Deep Navy",
    colorGroup: "blue",
    strapType: "velcro",
    stockStrapSku: "ACSO33N100",
    bestsellerRank: 8,
    tagline: "Two blues and a black strap.",
    description:
      "A sky-blue Bioceramic case against a deep navy dial and bezel, finished on a black strap. The most formal-looking mission of the eleven and an easy first MoonSwatch.",
  },
  {
    slug: "mission-to-pluto",
    sku: "SO33M101",
    name: "Mission to Pluto",
    shortName: "Pluto",
    family: "classics",
    year: 2022,
    price: 60,
    availability: "low-stock",
    colorway: "Frost Grey / Cream",
    colorGroup: "grey",
    strapType: "velcro",
    stockStrapSku: "ACSO33M101",
    tagline: "Not a planet. Still a favourite.",
    description:
      "A pale frost-grey Bioceramic case with a cream dial and a mid-grey strap. Pluto sold through faster than almost any other mission and rarely comes back onto the secondary market unworn.",
  },
  {
    slug: "mission-to-the-moon-moonshine-gold",
    sku: "SO33M102",
    name: "Mission to the Moon — Moonshine Gold",
    shortName: "Moon Moonshine Gold",
    family: "classics",
    year: 2023,
    price: 60,
    availability: "in-stock",
    colorway: "Moon Black / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33M100",
    tagline: "The Moon, with a gold seconds hand.",
    description:
      "Mission to the Moon with its chronograph seconds hand coated in OMEGA's Moonshine Gold. Black case, black dial, and one flash of gold that sweeps when the chronograph runs — sold only on full-moon nights.",
  },
  {
    slug: "mission-to-neptune-moonshine-gold",
    sku: "SO33N101",
    name: "Mission to Neptune — Moonshine Gold",
    shortName: "Neptune Moonshine Gold",
    family: "classics",
    year: 2023,
    price: 60,
    availability: "in-stock",
    colorway: "Sky Blue / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33N100",
    tagline: "Neptune's blues, a gold seconds hand.",
    description:
      "Mission to Neptune with a Moonshine Gold chronograph seconds hand against the deep navy dial. Released for a single full moon, and the Moonshine Gold edition that suits the gold best.",
  },

  // ── Moonphase (2023–2024) ─────────────────────────────────────────────────
  {
    slug: "mission-to-the-moonphase-full-moon",
    sku: "SO33W700",
    name: "Mission to the Moonphase — Full Moon",
    shortName: "Moonphase Full Moon",
    family: "moonphase",
    year: 2023,
    price: 70,
    availability: "in-stock",
    colorway: "Snow White / Moonshine Gold",
    colorGroup: "white",
    strapType: "velcro",
    stockStrapSku: "ACSO33W700",
    bestsellerRank: 1,
    tagline: "Moonshine Gold moon, white case.",
    description:
      "The first MoonSwatch with a real moonphase complication, and the first to carry OMEGA's Moonshine Gold — the moon disc is 18K Moonshine Gold, set into a snow-white Bioceramic case. Released to queues worldwide and still the single most requested reference at WTC.",
  },
  {
    slug: "mission-to-the-moonphase-new-moon",
    sku: "SO33B700",
    name: "Mission to the Moonphase — New Moon",
    shortName: "Moonphase New Moon",
    family: "moonphase",
    year: 2023,
    price: 70,
    availability: "in-stock",
    colorway: "Eclipse Black / Moonshine Gold",
    colorGroup: "black",
    strapType: "velcro",
    stockStrapSku: "ACSO33B700",
    bestsellerRank: 3,
    tagline: "The black one with the gold moon.",
    description:
      "The darker half of the Moonphase pair — black Bioceramic, black dial, and an 18K Moonshine Gold moon that only fully reveals itself under light. The more wearable of the two, and the one most buyers choose second.",
  },
  {
    slug: "mission-to-the-super-blue-moonphase",
    sku: "SO33N700",
    name: "Mission to the Super Blue Moonphase",
    shortName: "Super Blue Moonphase",
    family: "moonphase",
    year: 2023,
    price: 70,
    availability: "low-stock",
    colorway: "Super Blue / Ivory",
    colorGroup: "blue",
    strapType: "velcro",
    stockStrapSku: "ACSO33B700",
    bestsellerRank: 4,
    tagline: "Released for one blue moon.",
    description:
      "Launched on the super blue moon of August 2023 and never restocked — a blue Bioceramic case around an ivory dial, with a Moonshine Gold moon disc and a navy strap. Genuinely scarce.",
  },
  {
    slug: "mission-to-the-pink-moonphase",
    sku: "SO33P700",
    name: "Mission to the Pink Moonphase",
    shortName: "Pink Moonphase",
    family: "moonphase",
    year: 2024,
    price: 75,
    availability: "pre-order",
    colorway: "Vivid Pink",
    colorGroup: "pink",
    strapType: "velcro",
    stockStrapSku: "ACSO33W700",
    tagline: "April's moon, in Bioceramic.",
    description:
      "Named for the April pink moon: a vivid pink Bioceramic case and strap against a black bezel and a pale grey dial, with a Moonshine Gold moon disc. A limited drop that moved fast in the Gulf and Levant markets.",
  },

  // ── Earthphase (2025) ─────────────────────────────────────────────────────
  {
    slug: "mission-to-earthphase",
    sku: "SO33M700",
    name: "Mission to Earthphase",
    shortName: "Earthphase",
    family: "earthphase",
    year: 2025,
    price: 75,
    availability: "in-stock",
    colorway: "Graphite / Black",
    colorGroup: "black",
    strapType: "velcro",
    stockStrapSku: "ACSO33M700",
    bestsellerRank: 10,
    tagline: "The moonphase, flipped.",
    description:
      "Instead of showing the moon from Earth, Earthphase shows the Earth as it is seen from the moon. A graphite Bioceramic case around a black dial built on a rotating Earth disc — the cleverest complication Swatch has put in the collection.",
  },
  {
    slug: "mission-to-earthphase-moonshine-gold-august",
    sku: "SO33N701L",
    name: "Mission to Earthphase — Moonshine Gold",
    shortName: "Earthphase Gold",
    family: "earthphase",
    year: 2025,
    price: 75,
    availability: "low-stock",
    colorway: "Night Blue / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33M700",
    tagline: "The Earth disc, in gold.",
    description:
      "Earthphase with a Moonshine Gold Earth disc on a deep night-blue Bioceramic case. The monthly Moonshine Gold series was sold one full moon at a time, then retired.",
  },
  {
    slug: "mission-to-earthphase-moonshine-gold-december",
    sku: "SO33W701L",
    name: "Mission to Earthphase — Moonshine Gold, Cold Moon",
    shortName: "Earthphase Cold Moon",
    family: "earthphase",
    year: 2025,
    price: 75,
    availability: "pre-order",
    colorway: "Snow White / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33W700",
    tagline: "The white one that closes the year.",
    description:
      "December's Cold Moon breaks the pattern — a snow-white Bioceramic case instead of night blue, with the same Moonshine Gold Earth disc. The most collectable entry of the series.",
  },

  // ── Mission on Earth (2025) ───────────────────────────────────────────────
  {
    slug: "mission-on-earth-lava",
    sku: "SO33O100",
    name: "Mission on Earth — Lava",
    shortName: "Lava",
    family: "mission-on-earth",
    year: 2025,
    price: 70,
    availability: "in-stock",
    colorway: "Volcanic Red / Black",
    colorGroup: "red",
    strapType: "velcro",
    stockStrapSku: "ACSO33O100",
    tagline: "Molten case, black dial.",
    description:
      "From the trio that turned the collection's gaze back down at our own planet. Lava sets a molten volcanic-red Bioceramic case against a pure black bezel and dial, on a black strap.",
  },
  {
    slug: "mission-on-earth-polar-lights",
    sku: "SO33L103",
    name: "Mission on Earth — Polar Lights",
    shortName: "Polar Lights",
    family: "mission-on-earth",
    year: 2025,
    price: 70,
    availability: "in-stock",
    colorway: "Aurora Teal / Black",
    colorGroup: "green",
    strapType: "velcro",
    stockStrapSku: "ACSO33L103",
    tagline: "Aurora case, glows in the dark.",
    description:
      "The standout of the Mission on Earth trio — an aurora-teal Bioceramic case around a jet-black dial, with a heavy dose of Super-LumiNova that genuinely performs at night. The best-photographing MoonSwatch since the Moonphase pair.",
  },
  {
    slug: "mission-on-earth-desert",
    sku: "SO33T103",
    name: "Mission on Earth — Desert",
    shortName: "Desert",
    family: "mission-on-earth",
    year: 2025,
    price: 70,
    availability: "in-stock",
    colorway: "Ivory / Dune Brown",
    colorGroup: "brown",
    strapType: "velcro",
    stockStrapSku: "ACSO33T103",
    tagline: "Built for the region.",
    description:
      "An ivory Bioceramic case over a warm dune-brown dial and bezel, on a taupe strap. Desert has been the quiet best-seller across the Middle East since launch — it wears like it belongs here.",
  },

  // ── Specials ──────────────────────────────────────────────────────────────
  {
    slug: "moonswatch-1965",
    sku: "SO33M106",
    name: "MoonSwatch 1965",
    shortName: "1965",
    family: "special",
    year: 2024,
    price: 75,
    availability: "low-stock",
    colorway: "Steel Grey / White",
    colorGroup: "grey",
    strapType: "velcro",
    stockStrapSku: "ACSO33M106",
    tagline: "The year NASA qualified it.",
    description:
      "A tribute to 1965, the year the Speedmaster was flight-qualified by NASA. A steel-grey Bioceramic case around a bright white dial with period-correct typography — the most reference-heavy piece in the collection.",
  },
  {
    slug: "mission-to-the-moon-1969",
    sku: "SSX01B700",
    name: "Mission to the Moon 1969",
    shortName: "1969",
    family: "special",
    year: 2024,
    price: 75,
    availability: "low-stock",
    colorway: "Apollo Black / Champagne",
    colorGroup: "black",
    strapType: "velcro",
    stockStrapSku: "ACSO33M100",
    tagline: "Black case, champagne dial.",
    description:
      "Marking the Apollo 11 landing, with a black Bioceramic case around a champagne-gold dial and a caseback treatment unique to the reference. The rarest piece WTC stocks — availability is genuinely one or two at a time.",
  },

  // ── AP × Swatch · Royal Pop (2026) ────────────────────────────────────────
  // Each name is "eight" in a different language — the eight sides of the
  // Royal Oak bezel. strapType is nominal: these are pocket watches on a
  // calfskin lanyard, and the field is not shown on the storefront.
  ...royalPop([
    ["otto-rosso", "SSX03R100N", "Otto Rosso", "Red", "red", "Italian for eight, in red."],
    ["huit-blanc", "SSX03W100N", "Huit Blanc", "White", "white", "French for eight, in white."],
    ["green-eight", "SSX03G100N", "Green Eight", "Green", "green", "The English one, in green."],
    ["blaue-acht", "SSX03L101N", "Blaue Acht", "Blue", "blue", "German for eight, in blue."],
    [
      "orenji-hachi",
      "SSX03L103N",
      "Orenji Hachi",
      "Orange",
      "orange",
      "Japanese for eight, in orange.",
    ],
    ["lan-ba", "SSX03L100N", "Lan Ba", "Blue", "blue", "Chinese for eight, in blue."],
    ["ocho-negro", "SSX03W101N", "Ocho Negro", "Black", "black", "Spanish for eight, in black."],
    ["otg-roz", "SSX03J100N", "OTG Roz", "Rose", "pink", "Romansh for eight, in rose."],
  ]),
];

function royalPop(
  rows: [
    slug: string,
    sku: string,
    name: string,
    colorway: string,
    group: ColorGroup,
    tagline: string,
  ][],
): Seed[] {
  return rows.map(([slug, sku, name, colorway, colorGroup, tagline]) => ({
    slug: `royal-pop-${slug}`,
    collection: "ap-swatch",
    sku,
    name: `Royal Pop — ${name}`,
    shortName: name,
    family: "royal-pop",
    year: 2026,
    price: 95,
    availability: "in-stock",
    colorway,
    colorGroup,
    strapType: "rubber",
    tagline,
    description: `Audemars Piguet's Royal Oak, reworked by Swatch as a Bioceramic pocket watch — the octagonal bezel and its eight screws, a hand-wound mechanical movement, and a calfskin lanyard to wear it around the neck, clipped to a bag or in a pocket. ${name} is one of eight.`,
  }));
}

const extracted = palettes.watches as Record<string, Partial<Palette>>;

const FALLBACK: Palette = {
  case: "#9a9a9a",
  bezel: "#9a9a9a",
  dial: "#8f8f8f",
  subdial: "#e8e8e8",
  strap: "#8f8f8f",
};

/**
 * Everything in public/, as `npm run images` last saw it. A reference is only
 * listed once its front photograph is on disk, so a watch added here before
 * its photography has been fetched stays off the site instead of rendering a
 * broken image — and appears on its own once the files land.
 */
const onDisk = new Set(manifest.groups.flatMap((g) => g.files.map((f) => f.path)));

export const products: Product[] = seeds
  .filter((s) => onDisk.has(`/products/watches/${s.sku}_sa200.png`))
  .map((s) => ({
    ...s,
    collection: s.collection ?? "omega-swatch",
    familyLabel: FAMILY_LABEL[s.family],
    specs: s.specs ?? COLLECTION_SPECS[s.collection ?? "omega-swatch"],
    // asset(): next/image leaves unoptimized sources untouched, so the
    // GitHub Pages basePath has to be baked in here.
    images: {
      front: asset(`/products/watches/${s.sku}_sa200.png`),
      angle: asset(`/products/watches/${s.sku}_sa300.png`),
      side: asset(`/products/watches/${s.sku}_sa000.png`),
    },
    // Colour comes from the real product photography — see
    // scripts/extract-palettes.mjs, re-run with `npm run palette`.
    palette: { ...FALLBACK, ...(extracted[s.sku] ?? {}) },
  }));

export const bestsellers: Product[] = products
  .filter((p) => p.bestsellerRank)
  .sort((a, b) => a.bestsellerRank! - b.bestsellerRank!);

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

/** Only the series something is actually listed in — no dead filter chips. */
export const FAMILIES = (Object.keys(FAMILY_LABEL) as Family[]).filter((f) =>
  products.some((p) => p.family === f),
);

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
