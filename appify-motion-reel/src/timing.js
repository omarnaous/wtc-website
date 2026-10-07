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
  [5.5, 9.5, "Animated counters"],
  [9.5, 14, "Product try-on"],
  [17.5, 21.5, "Website launch"],
  [21.5, 25, "Logo reveal"],
];
// illustrative conversion example for the conv beat (not client data; labelled on screen)
export const CONV = { from: 1.2, to: 3.6 };
export const warp = (f) => f;
