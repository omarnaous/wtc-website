// 17 s at 30 fps. A UV balloon with the appify logo is pumped up toward a needle; it pops at exactly 7.0 s.
// sound/build.py reads this file so every pump, beep and the pop land on their frames.
export const FPS = 30;
export const DURATION = 510;
export const HOOK_OUT = 66;      // "Try not to look away." fades
export const PUMPS = [12, 40, 66, 90, 112, 132, 150, 166, 180, 191, 199, 205];   // each pump inflates it a step
export const POP = 210;          // 7.0 s: needle meets latex
export const LINE1 = 250;        // "You just watched a balloon for 7 seconds."
export const LINE2 = 326;        // "That's what motion does to attention."
export const END = 396;          // end card: wordmark, confetti drizzle
export const LAND = 440;         // a confetti spark lands as the i-dot
export const KNOT = 1420, CX = 540;            // balloon knot position (stage px)
export const S0 = 3.9, S1 = 7.9;              // balloon scale before / at the pop (width = 100 * s px)
export const NEEDLE0 = 200;                   // needle tip y at frame 0; it ends on the balloon top at POP
