import palettes from "./palettes.json";
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
    price: 465,
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
    price: 445,
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
    price: 455,
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
    price: 475,
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
    price: 495,
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
    price: 470,
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
    price: 445,
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
    price: 445,
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
    price: 450,
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
    price: 465,
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
    price: 455,
    availability: "low-stock",
    colorway: "Frost Grey / Cream",
    colorGroup: "grey",
    strapType: "velcro",
    stockStrapSku: "ACSO33M101",
    tagline: "Not a planet. Still a favourite.",
    description:
      "A pale frost-grey Bioceramic case with a cream dial and a mid-grey strap. Pluto sold through faster than almost any other mission and rarely comes back onto the secondary market unworn.",
  },

  // ── Moonphase (2023–2024) ─────────────────────────────────────────────────
  {
    slug: "mission-to-the-moonphase-full-moon",
    sku: "SO33W700",
    name: "Mission to the Moonphase — Full Moon",
    shortName: "Moonphase Full Moon",
    family: "moonphase",
    year: 2023,
    price: 690,
    compareAt: 760,
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
    price: 690,
    compareAt: 760,
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
    price: 720,
    availability: "low-stock",
    colorway: "Super Blue / Ivory",
    colorGroup: "blue",
    strapType: "velcro",
    stockStrapSku: "ACSO33B700",
    bestsellerRank: 4,
    tagline: "Released for one blue moon.",
    description:
      "Launched on the super blue moon of August 2023 and never restocked — a blue Bioceramic case around an ivory dial, with a Moonshine Gold moon disc and a navy strap. Genuinely scarce, and priced accordingly everywhere it appears.",
  },
  {
    slug: "mission-to-the-pink-moonphase",
    sku: "SO33P700",
    name: "Mission to the Pink Moonphase",
    shortName: "Pink Moonphase",
    family: "moonphase",
    year: 2024,
    price: 705,
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
    price: 640,
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
    name: "Mission to Earthphase — Moonshine Gold (August)",
    shortName: "Earthphase Gold · Aug",
    family: "earthphase",
    year: 2025,
    price: 890,
    availability: "low-stock",
    colorway: "Night Blue / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33M700",
    tagline: "One month, one release.",
    description:
      "Part of the monthly Moonshine Gold Earthphase series — each reference was sold only during its namesake month, then retired. The August release carries an 18K Moonshine Gold Earth disc on a deep night-blue case.",
  },
  {
    slug: "mission-to-earthphase-moonshine-gold-september",
    sku: "SO33N702L",
    name: "Mission to Earthphase — Moonshine Gold (September)",
    shortName: "Earthphase Gold · Sep",
    family: "earthphase",
    year: 2025,
    price: 890,
    availability: "in-stock",
    colorway: "Night Blue / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33M700",
    tagline: "September's Earth disc.",
    description:
      "The September entry in the monthly Moonshine Gold Earthphase run. Same 18K Moonshine Gold Earth disc, month-specific caseback engraving, and a production window that closed the day the month did.",
  },
  {
    slug: "mission-to-earthphase-moonshine-gold-october",
    sku: "SO33N703L",
    name: "Mission to Earthphase — Moonshine Gold (October)",
    shortName: "Earthphase Gold · Oct",
    family: "earthphase",
    year: 2025,
    price: 890,
    availability: "in-stock",
    colorway: "Night Blue / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33M700",
    tagline: "October's Earth disc.",
    description:
      "October's Moonshine Gold Earthphase. The monthly series has become the most collected sub-line in the whole MoonSwatch catalogue — complete sets are already trading well above issue.",
  },
  {
    slug: "mission-to-earthphase-moonshine-gold-november",
    sku: "SO33N704L",
    name: "Mission to Earthphase — Moonshine Gold (November)",
    shortName: "Earthphase Gold · Nov",
    family: "earthphase",
    year: 2025,
    price: 910,
    availability: "pre-order",
    colorway: "Night Blue / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33M700",
    tagline: "November's Earth disc.",
    description:
      "November's release in the Moonshine Gold Earthphase series. Reserve now — these are allocated on arrival and the month-specific references do not come back.",
  },
  {
    slug: "mission-to-earthphase-moonshine-gold-december",
    sku: "SO33W701L",
    name: "Mission to Earthphase — Moonshine Gold (December)",
    shortName: "Earthphase Gold · Dec",
    family: "earthphase",
    year: 2025,
    price: 940,
    availability: "pre-order",
    colorway: "Snow White / Moonshine Gold",
    colorGroup: "gold",
    strapType: "velcro",
    stockStrapSku: "ACSO33W700",
    tagline: "The white one that closes the year.",
    description:
      "December breaks the pattern — a snow-white Bioceramic case instead of night blue, with the same 18K Moonshine Gold Earth disc. The most collectable entry of the twelve.",
  },

  // ── Mission on Earth (2025) ───────────────────────────────────────────────
  {
    slug: "mission-on-earth-lava",
    sku: "SO33O100",
    name: "Mission on Earth — Lava",
    shortName: "Lava",
    family: "mission-on-earth",
    year: 2025,
    price: 540,
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
    price: 545,
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
    price: 530,
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
    price: 620,
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
    price: 760,
    availability: "low-stock",
    colorway: "Apollo Black / Champagne",
    colorGroup: "black",
    strapType: "velcro",
    stockStrapSku: "ACSO33M100",
    tagline: "Black case, champagne dial.",
    description:
      "Marking the Apollo 11 landing, with a black Bioceramic case around a champagne-gold dial and a caseback treatment unique to the reference. The rarest piece WTC stocks — availability is genuinely one or two at a time.",
  },
];

const extracted = palettes.watches as Record<string, Partial<Palette>>;

const FALLBACK: Palette = {
  case: "#9a9a9a",
  bezel: "#9a9a9a",
  dial: "#8f8f8f",
  subdial: "#e8e8e8",
  strap: "#8f8f8f",
};

export const products: Product[] = seeds.map((s) => ({
  ...s,
  collection: s.collection ?? "omega-swatch",
  familyLabel: FAMILY_LABEL[s.family],
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
