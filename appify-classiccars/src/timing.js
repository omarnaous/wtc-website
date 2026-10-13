// 21 s at 30 fps on a 120 BPM grid (one beat = 15 frames, a bar = 60). Silent: the user adds trending audio in-app.
// Footage: the user's screen recording of the Valmora site (1280x756, 30 fps), first 24 s in public/rec/.
export const FPS = 30;
export const DURATION = 630;
export const BEAT = 15;
export const SRC_FRAMES = 726;
export const DROP = 120;         // the cover comes off the car
export const STATEMENT = 420;    // the window pulls back: "websites that look like they cost $10,000", Dev drives in
export const END = 510;          // the punchline: "costs from $500", DM "ANIMATED WEBSITE"
// [reel frame, source frame] keyframes: real time through the hook, then one bar per section (jump cuts between)
export const MAP = [[0, 0], [DROP, 117], [179, 215], [180, 272], [239, 346], [240, 360], [299, 440], [300, 512], [359, 590], [360, 600], [STATEMENT, 712]];
export const SECTIONS = [DROP, 180, 240, 300, 360];          // a punch-in + flash on each
export const CHIPS = [   // [frame, text]: what's on screen in that bar
  [128, "the cover comes off as you scroll"],
  [186, "a hero staged like a launch event"],
  [246, "every detail gets its own close-up"],
  [306, "a gauge that reads out the specs"],
  [366, "even the invite form is on brand"],
];
export const CUTS = [STATEMENT];
