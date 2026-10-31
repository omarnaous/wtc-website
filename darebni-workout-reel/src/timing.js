// Beat sheet (30 fps, 120 BPM: beat = 15 frames). Each exercise holds 8 beats (4 s): its GIF loops 1.3 times.
export const FPS = 30;
export const INTRO = 0, EX0 = 105, EX_LEN = 120, N_EX = 7;
export const FIN = EX0 + EX_LEN * N_EX;   // 945: the finisher
export const OUTRO = FIN + 75;            // 1020: comment PLAN
export const DURATION = OUTRO + 120;      // 1140 = 38 s

