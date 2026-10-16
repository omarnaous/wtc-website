// 13 s at 30 fps on a 120 BPM grid (one beat = 15 frames). Picture and sound/build_cues.py both read this file.
export const FPS = 30;
export const DURATION = 390;
export const BEAT = 15;
const b = (n) => Math.round(n * BEAT);
export const Q1 = 2;            // question, line 1
export const Q2 = 10;           // question, line 2
export const HUSH = b(2.7);     // 40: the question steps back, the music drops out (quiet beat)
export const ROLL = b(3.4);     // 51: the price counter starts rolling
export const PRICE = b(4);      // 60: the price slams in
export const RISE = b(5.6);     // 84: the price moves up, the printer slot opens
export const PRINT = b(7);      // 105: the receipt starts printing
export const TOTAL = b(17);     // 255: the total line prints
// receipt lines share the time between the header and the total: 24 frames apart, closer for longer receipts
export const lineGap = (n) => Math.min(24, Math.floor((TOTAL - PRINT - 20) / n));
export const lineAt = (i, n) => PRINT + 6 + i * lineGap(n);
export const STAMP = b(18);     // 270: the stamp hits
export const END = b(20);       // 300: spark cut to the end card (held 3 s)
