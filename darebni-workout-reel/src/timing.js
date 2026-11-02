// Beat sheet (30 fps, 120 BPM: beat = 15 frames). Each exercise holds 4 beats (2 s): two reps of its demo.
export const FPS = 30;
export const INTRO = 0, EX0 = 105, EX_LEN = 60, N_EX = 7;
export const FIN = EX0 + EX_LEN * N_EX;   // 525: the finisher
export const OUTRO = FIN + 75;            // 600: the plan question + download card
export const END_LEN = 150;               // the last card holds 5 s so it can be read
export const DURATION = OUTRO + END_LEN;  // 750 = 25 s

