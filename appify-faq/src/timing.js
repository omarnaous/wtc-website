// One 10 s Story per question at 30 fps (beat = 15 frames at 120 BPM, 20 frames at 90 BPM: every cue below sits on
// both grids). Picture and sound/build_cues.py read this.
export const FPS = 30;
export const DURATION = 300;
export const STICKER = 8;       // the question sticker pops in
export const TYPE = 20;         // the question types itself
export const CPF = 0.75;        // characters typed per frame
export const LIFT = 100;        // the sticker lifts to the top, Dev comes in thinking
export const ANSWER = 120;      // the answer lands (the hit)
export const LINES = [150, 180, 210];   // supporting lines / chips
export const OUTRO = 240;       // "Next question" / the closing line
