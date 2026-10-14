// 20 s at 30 fps on a 120 BPM grid (a beat = 15 frames). sound/score.py reads this file.
// One idea: the ⚡ on every MAK BAR is the editor. Each chapter is struck in by a lightning bolt, the train/court
// montage cuts on the beat, the product chapter is "charged" with each bar's real numbers, and the last bolt strikes
// the MAK BAR wordmark: "MUNCH BETTER."
// Footage: MAK BAR's own Instagram reels (public/footage, 720x1280 30 fps): padel.mp4 (Dd_mSJ9OkEA), gym.mp4 (DdUNTqpB1IH).
export const FPS = 30;
export const DURATION = 600;
export const STRIKE = 8;          // the first bolt
export const CH = { train: 45, court: 165, quiet: 270, product: 300, munch: 465, end: 525 };
export const LOGO = 530;          // the wordmark slams in on the last bolt
// [start frame, frames, source, source second, playback rate]
export const CLIPS = [
  [0, 45, "padel", 6.0, 1],        // serve (under the hook)
  [45, 15, "gym", 5.0, 1],         // press
  [60, 15, "gym", 6.2, 1],         // low-angle press
  [75, 15, "gym", 7.6, 1],         // curl
  [90, 15, "gym", 9.6, 1],         // deadlift
  [105, 15, "gym", 11.6, 1],       // cable
  [120, 30, "gym", 13.2, 1],       // rope
  [150, 15, "gym", 15.6, 1],       // rack
  [165, 15, "padel", 2.5, 1],      // forehand
  [180, 15, "padel", 6.5, 1],      // forehand 2
  [195, 30, "padel", 12.0, 0.6],   // smash, slowed
  [225, 15, "padel", 16.6, 1],     // rally
  [270, 30, "gym", 17.6, 0.7],     // the bar comes out of the bag (quiet)
  [300, 55, "padel", 4.15, 0.45],  // PRO Cookies 'n' Cream in hand
  [355, 55, "padel", 7.6, 0.55],   // Almond Crunch on the court
  [410, 55, "padel", 13.5, 0.5],   // Chocolate Chip in hand
  [465, 15, "gym", 21.8, 1],       // unwrapping
  [480, 30, "gym", 23.6, 1],       // the bite
  [510, 15, "padel", 24.6, 1],     // eating on the bench
];
export const SMASH = [240, 30];   // their smash photo, frozen: "BELIEVE."
// the product chapter: the real numbers from MAK BAR's own product cards
export const BARS = [
  { at: 300, line: "PRO MAK BAR", name: ["COOKIES", "'N' CREAM"], big: 18, unit: "g", label: "PROTEIN", chips: ["NO ADDED SUGAR", "ALMONDS · PEA PROTEIN · DATES"], tint: "#3E8EF0" },
  { at: 355, line: "MAK BAR", name: ["ALMOND", "CRUNCH"], big: 11, unit: "g", label: "PROTEIN", chips: ["164 CALORIES", "WHITE CHOCOLATE COATED"], tint: "#9ADBC8" },
  { at: 410, line: "MAK BAR", name: ["CHOCOLATE", "CHIP"], big: 10, unit: "g", label: "PROTEIN", chips: ["164 CALORIES", "CHOCOLATE COATED"], tint: "#C99A62" },
];
export const BAR_LEN = 55;
