// 23 s at 30 fps on an 80 BPM lo-fi grid (one beat = 22.5 frames). Brand intro (1 bar), pick-a-number hook (2 beats),
// 9 styles (2 beats each), end card (~6.7 beats).
export const FPS = 30;
export const DURATION = 690;
export const BEAT = 22.5;   // 80 BPM lo-fi: every style is exactly 2 beats, every 2 styles a bar
export const HOOK = 0;               // brand intro: the spark becomes the i-dot, "we make motion graphics."
export const PICK = 90;              // "PICK A NUMBER." + the 9 chips
export const STYLE0 = 135;           // first style starts here
export const STYLE_LEN = 45;         // 2 beats per style
export const N = 9;
export const END = STYLE0 + N * STYLE_LEN;   // 540: end card, held to frame 689
// what we can make for a brand, one per style
export const STYLES = ["Kinetic type ads", "Liquid brand loops", "App & UI animation", "Animated infographics", "3D titles", "Mascot animation", "Launch FX", "Glitch edits", "Logo reveals"];
export const styleStart = (i) => STYLE0 + i * STYLE_LEN;
