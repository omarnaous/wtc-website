// Appify website showcase, 15 s Reel (9:16). 30 fps, 120 BPM = 15 frames a beat.
export const FPS = 30;
export const DURATION = 450;

// Page scroll keyframes: [frame, scrollY in page px]. Holds between them, eased moves.
export const SCROLL = [[0, 0], [66, 0], [86, 760], [148, 760], [166, 1560], [244, 1560], [262, 2360], [326, 2360], [344, 3000], [450, 3000]];

// When each section arrives (its reveals start a little before, while it scrolls in).
export const ARRIVE = { hero: 0, best: 74, strap: 154, grid: 250, end: 332 };

export const T = {
  cardHover: 112, cardClick: 128,          // add to bag
  swaps: [176, 194, 210, 226],            // strap studio
  chipClick: 296,                         // grid filter -> Moonphase
  endCard: 372,                           // Appify end card
};

// Top captions. ^word^ = highlighted.
export const CAPTIONS = [
  { from: -12, to: 66, lines: ["Your business.", "But make it ^this.^"] },
  { from: 74, to: 148, lines: ["Products that", "^sell^ themselves."] },
  { from: 156, to: 244, lines: ["Try-on,", "^built in.^"] },
  { from: 252, to: 326, lines: ["Every product.", "^One^ place."] },
  { from: 334, to: 368, lines: ["Built to", "^convert.^"] },
];
