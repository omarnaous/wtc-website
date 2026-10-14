// 15 s at 30 fps on a 120 BPM grid (a beat = 15 frames, a bar = 60). sound/cues.py reads these.
// "Choose your mix": a cap pops, the logo lands, then every flavour floods the screen in its own label colour with its
// husband & wife bottles clinking together (four heroes on two beats, nine more on one beat each), a white quiet beat
// counts to 13, and the drop slams all 26 bottles into one line-up: "Better together."
export const FPS = 30;
export const DURATION = 450;
export const POP = 6;            // the cap pops, fizz rises
export const LOGO = 10;          // the logo lands
export const WORDS = [30, 38, 46];   // "Choose" "your" "mix."
export const PARADE = 60;        // first flavour flood (the drop)
export const GAP = 315;          // white quiet beat, the count to 13
export const COUNT_END = 336;
export const DROP = 345;         // all 26 bottles slam into the line-up
export const TOGETHER = 360;     // "Better together."
export const END_LOGO = 375;     // logo + "Choose your mix, choose your flavor!"
export const CREDIT = 400;
