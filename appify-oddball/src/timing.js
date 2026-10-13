// 21 s at 30 fps on a 120 BPM grid (one beat = 15 frames, a bar = 60). sound/build_cues.py reads this file.
// Footage: the user's screen recording of the Oddball site (669 frames at 30 fps, 1280x758) in public/rec/.
export const FPS = 30;
export const DURATION = 630;
export const BEAT = 15;
export const SRC_FRAMES = 669;
export const DROP = 120;         // the dunk at the buzzer = the beat drop
export const STATEMENT = 420;    // the window pulls back: "This is an Appify animated website."
export const END = 510;          // Dev catches the ball: DM "ANIMATED WEBSITE"
// [reel frame, source frame] keyframes: real time through the hook, then each section gets one bar
export const MAP = [[0, 0], [DROP, 116], [180, 207], [240, 324], [300, 420], [360, 537], [STATEMENT, 668]];
export const SECTIONS = [DROP, 180, 240, 300, 360];          // a punch-in + swipe on each
export const CHIPS = [   // [frame, text]: what's on screen in that bar
  [126, "a 3D mascot that actually plays"],
  [152, "no two cards alike"],
  [186, "light that follows your scroll"],
  [246, "a roster that flips in 3D"],
  [306, "an animated playbook"],
  [366, "even the form is on brand"],
];
export const TICKS = [60, 75, 90, 105];   // shot-clock ticks into the dunk
export const CUTS = [STATEMENT, END];
