// 20 s at 30 fps on a 120 BPM grid (one beat = 15 frames, one bar = 60). Picture and sound/build_cues.py read this.
// Story: the app -> seven real screens, one feature per bar -> live on the App Store, built by Appify.
export const FPS = 30;
export const DURATION = 600;
export const ICON = 6;          // the app icon pops in
export const NAME = 16;         // "Darebni AI"
export const TAG = 30;          // "An AI workout coach for iPhone."
export const PHONE = 54;        // the phone rises
export const FEAT = 90;         // first feature (one bar each)
export const FEAT_LEN = 60;
export const FEATS = [0, 1, 2, 3, 4, 5, 6].map((k) => FEAT + k * FEAT_LEN);   // 90 150 ... 450
export const END = 510;         // three phones, "Now on the App Store", built by Appify
