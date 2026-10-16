// 15 s at 30 fps on a 120 BPM grid (one beat = 15 frames). Picture and sound/build_cues.py both read this file.
export const FPS = 30;
export const DURATION = 450;
export const BEAT = 15;
export const TYPE1 = 6;          // "What if your brand" types in
export const COLLAPSE = 66;      // the line collapses into a dotted leader (quiet beat)
export const SLAM = 90;          // "stopped the scroll?" lands on the drop
export const BAR = 135;          // the Appify prompt bar appears
export const PROMPT = 150;       // first prompt starts typing; one prompt every PROMPT_LEN frames
export const PROMPT_LEN = 54;
export const CHAR = 1.2;         // frames per typed character in the prompt bar
export const LOGO = 384;         // everything clears, the wordmark builds
export const PRICE = 414;        // "Websites from $360" rolls in
// the four requests typed into the bar, and the card each one produces
export const PROMPTS = ["Build my online store", "Make a 15-second ad", "Launch my app on iOS & Android", "Track my clients and sales"];
export const promptAt = (i) => PROMPT + i * PROMPT_LEN;
export const enterAt = (i) => promptAt(i) + Math.ceil(PROMPTS[i].length * CHAR) + 4;   // "enter": the card pops
