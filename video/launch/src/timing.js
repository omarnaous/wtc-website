// Beat sheet in frames (30 fps, 120 BPM = 15 frames a beat). Picture and sound/cues.json both use these.
export const FPS = 30;
export const DURATION = 600; // 20 s

// Scene starts (global frames).
export const S = {
  open: 0,      // the hand sweeps a tick ring; the Moon slams in
  planets: 60,  // one mission per beat, full-frame colour fields
  orbit: 150,   // 32 watches in orbit around a counter (enters on a clock wipe)
  strap: 270,   // Strap Studio: straps swap, accelerating
  wall: 390,    // the whole collection as a wall, zoom-through
  logo: 480,    // silence, then the WTC mark
};

export const T = {
  sweepEnd: 22, // open: hand finishes its turn
  h1: 24,       // open: the Moon lands
  w1: 34,       // "Every watch,"
  w2: 44,       // "one insider."
  planetBeat: 15,
  wipe: 12,     // clock-wipe length
  count0: 10, count1: 45, // orbit: 0 -> 32 (local)
  line1: 58, line2: 74,   // orbit: tag lines (local)
  swaps: [0, 18, 32, 44, 54, 62, 69, 75, 80], // strap: swap frames (local), last one lands
  logoHit: 6,   // logo: after 6 frames of silence (local)
  tagline: 22, url0: 34, url1: 62, cta: 70, sheen: 88,
};

export const PLANETS = [
  { sku: "SO33J100", word: "SUN", name: "Mission to the Sun", bg: "#F2C230", fg: "#1A1300" },
  { sku: "SO33R100", word: "MARS", name: "Mission to Mars", bg: "#D42A22", fg: "#FFF6F2" },
  { sku: "SO33N100", word: "NEPTUNE", name: "Mission to Neptune", bg: "#132D69", fg: "#EAF0FF" },
  { sku: "SO33L100", word: "URANUS", name: "Mission to Uranus", bg: "#9ED5E1", fg: "#0B2530" },
  { sku: "SO33P100", word: "VENUS", name: "Mission to Venus", bg: "#E8B6BE", fg: "#3A1018" },
  { sku: "SO33P700", word: "PINK MOON", name: "Mission to the Pink Moonphase", bg: "#E23E86", fg: "#FFF0F6" },
];

export const STRAPS = [
  { file: "black", tint: "#1b1b1f", chip: "#141414" },
  { file: "vertech-white", tint: "#3a3a40", chip: "#F2F2F0" },
  { file: "vertech-grey", tint: "#2c2e33", chip: "#8B8E93" },
  { file: "vertech-capri-blue", tint: "#0f3550", chip: "#4FB3E8" },
  { file: "vertech-dark-grey", tint: "#232428", chip: "#4A4C50" },
  { file: "vertech-black-and-red-stitches", tint: "#3a1214", chip: "#1A1A1A", ring: "#D3262B" },
  { file: "vertech-white-and-black-stitches", tint: "#34343a", chip: "#F2F2F0", ring: "#111" },
  { file: "vertech-black-and-orange-stitches", tint: "#3a2008", chip: "#1A1A1A", ring: "#F26B1D" },
  { file: "vertech-orange", tint: "#5a2408", chip: "#F26B1D" },
];

export const ALL = ["SO33M100", "SO33R100", "SO33J100", "SO33N700", "SO33P700", "SO33L100", "SO33W700", "SO33C100", "SO33G100",
  "SO33A100", "SO33P100", "SO33T100", "SO33B700", "SO33M700", "SO33N100", "SO33M101", "SO33L103", "SO33O100", "SO33N701L",
  "SO33T103", "SO33W701L", "SO33M106", "SO33N702L", "SSX01B700", "SO33N703L", "SO33N704L"];
