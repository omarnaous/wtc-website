// 15 s at 30 fps on a 128.6 BPM grid (one beat = 14 frames). Hook (2 beats), 8 styles (3 beats each), end card.
export const FPS = 30;
export const DURATION = 450;
export const BEAT = 14;
export const HOOK = 0;
export const STYLE0 = 28;            // first style starts here
export const STYLE_LEN = 42;         // 3 beats per style
export const END = STYLE0 + 8 * STYLE_LEN;   // 364: end card, held to frame 449
export const STYLES = ["Kinetic type", "Liquid morph", "UI animation", "Data viz", "3D type", "Particles", "Glitch", "Logo reveal"];
export const styleStart = (i) => STYLE0 + i * STYLE_LEN;
