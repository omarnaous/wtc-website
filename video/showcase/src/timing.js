// Appify website showcase, 15 s Reel (9:16). 30 fps, 120 BPM = 15 frames a beat.
export const FPS = 30;
export const DURATION = 450;

// The site is 1600 × 900 per screen. Scroll keyframes: [frame, y]. Holds between, eased moves.
export const SCROLL = [[0, 0], [66, 0], [86, 900], [160, 900], [178, 1800], [240, 1800], [258, 2700], [320, 2700], [338, 3600], [450, 3600]];
export const ARRIVE = { hero: 0, rail: 76, detail: 168, strap: 248, finale: 328 };

export const T = {
  rail0: 88, rail1: 158,          // the collection rail runs sideways while pinned
  swaps: [262, 278, 292, 306],    // strap studio
  ctaClick: 360,
  endCard: 372,
};

// Top captions. ^word^ = highlighted.
export const CAPTIONS = [
  { from: -12, to: 66, lines: ["Your business.", "But make it ^this.^"] },
  { from: 74, to: 158, lines: ["A store that", "^feels^ premium."] },
  { from: 166, to: 238, lines: ["Every detail,", "^in motion.^"] },
  { from: 246, to: 318, lines: ["Try-on,", "^built in.^"] },
  { from: 326, to: 368, lines: ["Built to", "^convert.^"] },
];
