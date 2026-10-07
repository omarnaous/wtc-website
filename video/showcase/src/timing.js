// Appify website showcase, 15 s Reel (9:16). 30 fps. Lo-fi bed at 90 BPM (20 frames a beat).
export const FPS = 30;
export const DURATION = 450;

// The site is 1600 × 900 per screen. Scroll keyframes: [frame, y]. Holds between, eased moves.
export const SCROLL = [[0, 0], [66, 0], [84, 900], [160, 900], [178, 1800], [240, 1800], [258, 2700], [320, 2700], [338, 3600], [450, 3600]];
export const ARRIVE = { hero: 0, missions: 74, orbit: 170, strap: 250, wall: 330 };

export const T = {
  hovers: [92, 104, 116, 128, 140, 150], // missions: one name per hover, the room takes its colour
  swaps: [266, 280, 294, 306],           // strap studio clicks
  ctaClick: 362,
  endCard: 374,
};

// Top captions. ^word^ = highlighted.
export const CAPTIONS = [
  { from: -12, to: 66, lines: ["Your business.", "But make it ^this.^"] },
  { from: 74, to: 158, lines: ["Not a website.", "An ^experience.^"] },
  { from: 168, to: 238, lines: ["Every scroll,", "^in motion.^"] },
  { from: 248, to: 318, lines: ["Try-on,", "^built in.^"] },
  { from: 328, to: 370, lines: ["Built to", "^convert.^"] },
];
