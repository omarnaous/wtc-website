// 22 s at 30 fps on a 120 BPM grid that starts on the cap pop (frame 30): every scene starts on a beat (15 frames).
// One idea: everything is POURED in. A liquid surface rises up the screen to bring in each flavour, the orbit, the
// studio, the wall, and finally fills the screen behind the logo. sound/score.py reads these numbers.
export const FPS = 30;
export const DURATION = 660;
export const S = { open: 0, flavors: 90, orbit: 300, studio: 390, wall: 480, logo: 564 };   // the logo slams 6 frames into its pour: 570, a downbeat
export const T = {
  cap: 30,          // the crown cap pops (groove starts, filtered)
  pour0: 32, pour1: 72,   // Lemon & Mint pours up the screen, the hero bottle rises with it
  w1: 46, w2: 54,   // "Choose your mix," / "choose your flavor."
  beat: 15,         // flavour beats: 2 heroes x 2 beats, then 10 pairs x 1 beat (relative to S.flavors)
  wipe: 8,          // pour-wipe length
  count0: 14, count1: 52,  // orbit counter (relative to S.orbit)
  clink: 10,        // studio: the husband & wife bottles meet (relative to S.studio)
  swaps: [0, 22, 38, 50, 60, 67, 73, 78],   // studio flavour swaps, accelerating (relative to S.studio + 14)
  brk: 555,         // music drops to the fizz alone; the logo lands on the next downbeat (570)
  hit: 570,
};
// flavour beat starts (relative to S.flavors): the first two (hero shots) get two beats each
export const FLAVOR_AT = [0, 30, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195];   // flavours 2..13 (1 is the open)
