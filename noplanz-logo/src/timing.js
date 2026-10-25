// Beat sheet in frames (30 fps). Picture (Reveal.jsx) and sound (sound/build_cues.py) both read these.
export const FPS = 30;
export const DURATION = 165;  // 5.5 s
export const T = {
  popA: 4,      // the coral dot appears
  popB: 10,     // the lime dot appears
  wander: 12,   // both wander, no plan (12 -> 44)
  spot: 44,     // they notice each other: freeze, quiet beat
  dash: 54,     // they dash to the ends of the route
  draw: 58,     // the route draws between them (58 -> 70)
  hit: 70,      // the Z lands: the mark
  morph: 84,    // the mark slides into place as the z of the word
  word: 88,     // "no plan" pops in, one letter every 3 frames
  tag: 116,     // the tagline
  end: 164,
};
