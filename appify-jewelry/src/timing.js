// 20 s at 30 fps. Silent: the user adds trending audio in-app (same as the other website reels).
// Footage: the user's screen recording of the NAÏADE concept site (1280x764, 30 fps), first 17.2 s in public/rec/.
export const FPS = 30;
export const DURATION = 600;
export const SRC_FRAMES = 516;
export const END = 480;          // a spark cut to the end card: from $500, DM, Dev with a ring box
export const MAP = [[0, 0], [END, 515]];   // [reel frame, source frame]: real time, 7% faster
const r = (s) => Math.round(s * 30 * END / 515);   // source second -> reel frame
// the HUD chip walks through the pieces so people stay for the set: [frame, count, name, price]
export const PIECES = [[0, 0, "The Deep End", ""], [r(4.3), 1, "Undertow Drops", "$12,100"], [r(7.0), 2, "Deep End Pendant", "$9,600"], [r(9.8), 3, "Night Swim Ring", "$16,200"], [r(14.5), 4, "The whole set", "$38,200"]];
export const SECTIONS = PIECES.slice(1).map((p) => p[0]);   // a punch-in + flash on each new piece
export const CUTS = [END];
