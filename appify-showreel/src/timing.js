// 20 s at 30 fps on an 80 BPM lo-fi grid (one beat = 22.5 frames). Hook (2 beats), 9 styles (2 beats each), end card (~6.7 beats).
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 22.5;   // 80 BPM lo-fi: every style is exactly 2 beats, every 2 styles a bar
export const HOOK = 0;
export const STYLE0 = 45;            // first style starts here
export const STYLE_LEN = 45;         // 2 beats per style
export const N = 9;
export const END = STYLE0 + N * STYLE_LEN;   // 450: end card, held to frame 599
// what we can make for a brand, one per style
export const STYLES = ["Kinetic type ads", "Liquid brand loops", "App & UI animation", "Animated infographics", "3D titles", "Mascot animation", "Launch FX", "Glitch edits", "Logo reveals"];
export const styleStart = (i) => STYLE0 + i * STYLE_LEN;
