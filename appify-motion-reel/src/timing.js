// Fixed timeline, 30 fps, 33 s: the WTC film plays in full from SHOW, so everything is placed on its clock.
// vo/vo.py and sound/cues.json use the same frames.
export const FPS = 30;
export const DURATION = 990;
export const T = {
  hook: 0,        // a plain product photo in a feed post
  swipe: 78,      // a thumb scrolls it away
  turn: 105,      // record scratch: "Watch this."
  show: 120,      // the WTC launch film starts (25 s)
  cta: 870,       // film ends: want one? DM "Motion"
};
// what's on screen in the film (seconds on the film's own clock) -> label under the screen
export const TECH = [
  [1.5, 5.5, "Kinetic typography"],
  [5.5, 9.5, "Animated counters"],
  [9.5, 14, "Product try-on"],
  [17.5, 21.5, "Website launch"],
  [21.5, 25, "Logo reveal"],
];
export const warp = (f) => f; // Presenter's gestures are written on this timeline directly
