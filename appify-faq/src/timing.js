// One 10 s Story per question at 30 fps. Every cue is a multiple of 30 frames, so it sits on the beat of both beds
// (120 BPM: beat 15 frames; 90 BPM: beat 20 frames). Picture and sound/build_cues.py read this.
export const FPS = 30;
export const DURATION = 300;
export const Q = 6;            // the question sticker is placed
export const A = 60;           // the answer appears (the question has had ~2 s to be read)
export const B = 90;           // second line / first extra sticker
export const C = 120;          // third element
export const D = 150;          // fourth element
export const E = 180;          // last element
export const TAP = 120;        // quiz Stories: the right answer is tapped
