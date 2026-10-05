// Beat sheet at 30 fps. sound.py places its cues on these same frames.
export const FPS = 30;
export const DURATION = 240; // 8 s
export const T = {
  ignite: 10,   // spark seed lights up (tick)
  traceA: 22,   // spark draws the wordmark outline (riser starts)
  traceB: 70,
  suckA: 70,    // everything collapses to a point
  silence: 80,  // 4 dead frames before the hit
  hit: 84,      // wordmark slams in
  dropA: 100,   // spark falls back in
  land: 112,    // spark lands as the i-dot (chime)
  urlA: 126,    // URL line + type reveal
  sheen: 170,   // light sweep across the wordmark
};
