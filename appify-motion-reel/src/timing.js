// The voice leads: vo/vo.py places every scene on the continuous voice-over and writes the anchors to vo.json.
import VO from "./vo.json";
export const FPS = 30;
export const DURATION = VO.duration;
const A = VO.anchors;
export const T = {
  hook: A.hook,       // POV: a plain product photo
  swipe: A.swipe,     // "Yeah... good luck with that." it gets scrolled away
  turn: A.turn,       // "But what if we made your product do... this?"
  show: A.show,       // hard cut into the WTC film
  talk: A.talk,       // "Okay... that got my attention." (film sound stops)
  reveal: A.reveal,   // "This is the launch film we made for WTC." header comes in
  twist: A.twist,     // "And before you say..." the plain sneaker
  morph: A.morph,     // "Exactly." it turns into a motion ad
  conv: A.conv,       // the 85% proof
  cta: A.cta,         // still posting product photos? / or making people stop scrolling?
  q2: A.q2,
  fun: A.fun,
  end: A.end,
};
// what's on screen in the film (seconds on the film's own clock) -> label under the screen
export const TECH = [
  [1.5, 5.5, "Kinetic typography"],
  [5.5, 9.6, "Animated counters"],
  [9.6, 21.3, "Product try-on"],
  [21.3, 25, "Logo reveal"],
];
// the proof: a real survey figure, shown with its source; it lands as the voice says it
const wordAt = (w) => VO.words.find((x) => x.w.startsWith(w))?.start ?? A.conv;
export const DATA = {
  source: "Source: Wyzowl, State of Video Marketing 2026",
  people: { pct: 85, at: wordAt("85%"), text: "of people say a video convinced them to buy" },
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
