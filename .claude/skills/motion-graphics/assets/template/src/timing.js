// Beat sheet in frames. Picture and sound/cues.json both use these numbers.
export const FPS = 30;
export const DURATION = 180; // 6 s
export const T = {
  intro: 8,     // first element appears (tick)
  build: 14,    // tension builds (riser 14 -> 56)
  silence: 56,  // dead air before the hit
  hit: 60,      // main impact
  sub: 80,      // secondary line (whoosh)
  sheen: 120,   // light sweep during the hold
};
