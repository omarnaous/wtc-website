// 17 s at 30 fps. "The Press": a hydraulic press slowly crushes a jelly Appify spark; it pops at exactly 7.0 s.
// sound/build.py reads this file (and src/drops.json) so every sound lands on its frame.
export const FPS = 30;
export const DURATION = 510;
export const HOOK_OUT = 66;      // "Try not to look away." fades
export const CONTACT = 192;      // the press touches the spark
export const IMPACT = 210;       // 7.0 s: it pops
export const LINE1 = 240;        // "You just watched a jelly star get crushed for 7 seconds."
export const LINE2 = 318;        // "Imagine that was your brand."
export const END = 378;          // the drops pull back together into the spark
export const LAND = 436;         // the spark lands as the i-dot of the wordmark
// press head bottom edge (stage px) over time: slow, a stall, creeping, a last stop, contact, crush, slam
export const PRESS = [[0, 420], [90, 560], [96, 564], [120, 564], [176, 700], [184, 702], [CONTACT, 724], [IMPACT, 1042], [IMPACT + 4, 1180]];
export const STOPS = [96, 176];  // servo clunks where the press stalls
export const FLOOR = 1180, R = 230, CX = 540;   // plate top, spark radius, centre x
