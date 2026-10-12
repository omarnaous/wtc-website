// Beat sheet: 20 s at 30 fps on a 112.5 BPM grid (one beat = 16 frames, one bar = 64).
// Picture (Main.jsx), sound (sound/build_cues.py) and voice (vo/vo.py) all read these frames.
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 16;
export const T = {
  dawn: 0,        // navy sky over a Beirut skyline, the sun starts rising
  flip: 48,       // the clock flips 6:59 -> 7:00 (alarm)
  dive: 72,       // camera dives into the sun...
  coffee: 100,    // ...which becomes the coffee in the cup, seen from above
  cup: 128,       // pull back: the cup lands (beat 8)
  hush: 176,      // everything holds its breath
  bill: 192,      // a $1 bill flies in and wraps the cup as its sleeve (beat 12)
  price: 208,     // "$1" price stamp (beat 13)
  week: 240,      // the cup shrinks into a week
  day0: 256,      // MON..SUN cups pop, one per beat (beats 16-22)
  words: 368,     // "Every." "Single." "Day." on beats 23-25
  quiet: 416,     // drop-out before the hero
  hero: 432,      // hero slam: big cup, "$1 / day", donuts orbit (beat 27)
  end: 496,       // end card (beat 31), held to the last frame
};
