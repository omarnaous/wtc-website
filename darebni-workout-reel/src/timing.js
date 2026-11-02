// Beat sheet (30 fps, 120 BPM: beat = 15 frames). Each exercise holds 4 beats (2 s): two reps of its demo.
export const FPS = 30;
export const INTRO = 0, EX0 = 105, EX_LEN = 60, N_EX = 7;
export const FIN = EX0 + EX_LEN * N_EX;   // 525: the finisher
export const OUTRO = FIN + 75;            // 600: the plan question, the tracker page, download
export const END_LEN = 255;               // the end card: plan page (3.7 s), then tracker page, download held throughout
export const DURATION = OUTRO + END_LEN;  // 855 = 28.5 s

