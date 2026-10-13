// 20 s at 30 fps on a 120 BPM grid (one beat = 15 frames, a bar = 60). sound/build_cues.py reads this file.
// The footage is a real recording of the Firnlight site: 600 evenly spaced scroll positions on a phone (rec/m)
// and 300 on desktop (rec/d). Scenes pick which recorded frame to show, so the scroll speed is edited, not faked.
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 15;
export const M_FRAMES = 600, D_FRAMES = 300;
export const DROP = 90;          // the beat drops as the hero dissolves to black
export const REVEAL = 390;       // pull back: the phone shrinks, the desktop browser slides in
export const END = 480;          // end card
// [video frame, recorded phone frame] keyframes for the scroll (eased between them)
export const SCROLL = [[0, 0], [90, 112], [150, 200], [240, 330], [330, 540], [390, 599]];
export const SWIPES = [12, 52, 96, 141, 186, 231, 276, 321];        // the thumb drags up on these frames
export const CHIPS = [   // [frame, text]: what the viewer is actually looking at (all true of the site)
  [100, "scroll = the film"],
  [160, "466 frames, scrubbed live"],
  [205, "specs animate in"],
  [250, "macro detail shots"],
  [340, "add to cart, built in"],
];
export const CUTS = [REVEAL, END];
