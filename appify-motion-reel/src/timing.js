// The voice leads: vo/vo.py places every scene on the continuous voice-over and writes the anchors to vo.json.
import VO from "./vo.json";
export const FPS = 30;
export const DURATION = VO.duration;
const A = VO.anchors;
export const T = {
  hook: A.hook,       // a plain product photo in a feed post
  swipe: A.turn - 27, // it gets scrolled away
  turn: A.turn,       // record scratch: "Watch this."
  show: A.show,       // the WTC launch film starts
  conv: A.conv,       // conversion beat: plain photo vs motion ad
  cta: A.cta,         // want one? DM "Motion"
  end: A.end,
};
// what's on screen in the film (seconds on the film's own clock) -> label under the screen
export const TECH = [
  [1.5, 5.5, "Kinetic typography"],
  [5.5, 9.6, "Animated counters"],
  [9.6, 17.6, "Product try-on"],
  [17.6, 21.0, "Website launch"],
  [21.0, 25, "Logo reveal"],
];
// the data beat: real survey figures, shown with their source; each one animates as the voice says it
const wordAt = (w) => VO.words.find((x) => x.w.startsWith(w))?.start ?? A.conv;
export const DATA = {
  source: "Source: Wyzowl, State of Video Marketing 2026",
  people: { pct: 85, at: wordAt("85%"), text: "of people say a video has convinced them to buy" },
  marketers: { pct: 83, at: wordAt("83%"), text: "of marketers say video directly increased their sales" },
};
// the film plays at real speed with one cut (CUT segments on the film's clock, see vo/vo.py)
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
