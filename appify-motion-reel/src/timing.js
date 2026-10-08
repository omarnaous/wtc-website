// The voice leads: vo/vo.py places every scene on the continuous voice-over and writes the anchors to vo.json.
import VO from "./vo.json";
export const FPS = 30;
export const DURATION = VO.duration;
const A = VO.anchors;
export const T = {
  hook: A.hook,       // POV: a plain product photo, one like (mom)
  brutal: A.brutal,   // "Brutal."
  swipe: A.swipe,     // "Even the algorithm scrolled past." it gets flung away
  damage: A.damage,   // crash-zoom on Dev: EMOTIONAL DAMAGE
  turn: A.turn,       // "Okay, now watch what happens when it moves."
  show: A.show,       // hard cut into the film
  talk: A.talk,       // "Wait... did you just stop scrolling?" (film sound stops)
  why: A.why,         // "That's what we do." + the services
  svc: A.svc,
  reveal: A.reveal,   // "This one's a website launch ad we did for Watch Trade Chronicles."
  twist: A.twist,     // "And no, you don't need to sell watches." the plain sneaker
  dm: A.dm,          // "Whatever your product is... zero to a thousand"
  morph: A.morph,     // "real quick." it turns into a motion ad
  conv: A.conv,       // don't take my word for it: the Wyzowl report
  study: A.study,
  cta: A.cta,         // photos get scrolled / motion gets watched
  q2: A.q2,
  refund: A.refund,   // full refund, zero risk
  zero: A.zero,
  fun: A.fun,         // comment MOTION
  end: A.end,
};
export const DAMAGE = 36;
// what's on screen in the film (seconds on the film's own clock) -> label under the screen
export const TECH = [
  [1.5, 5.5, "Kinetic typography"],
  [5.5, 9.6, "Animated counters"],
  [9.6, 21.3, "Product try-on"],
  [21.3, 25, "Logo reveal"],
];
// the proof: a real survey figure, shown with its source; it lands as the voice says it
// first caption word starting with `w` at or after frame `from`
export const wordAt = (w, from = 0) => VO.words.find((x) => x.start >= from - 1 && x.w.replace(/^[“"]/, "").toLowerCase().startsWith(w.toLowerCase()))?.start ?? from;
export const DATA = {
  source: "Source: Wyzowl, State of Video Marketing 2026",
  people: { pct: 85, at: wordAt("85%", A.study), text: "of people say a video convinced them to buy" },
};
export const CUT = A.cut || [[0, 25]];
export const filmFrame = (sec) => { // film-clock seconds -> reel frame
  let t = 0;
  for (const [a, b] of CUT) { if (sec <= b) return A.show + Math.round((t + Math.max(0, sec - a)) * 30); t += b - a; }
  return A.show + Math.round(t * 30);
};
export const filmClock = (f) => { // reel frame -> film-clock seconds
  let t = (f - A.show) / 30;
  for (const [a, b] of CUT) { if (t <= b - a) return a + t; t -= b - a; }
  return CUT[CUT.length - 1][1];
};
export const warp = (f) => f;
