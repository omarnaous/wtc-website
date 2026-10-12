// 20 s at 30 fps on an 80 BPM grid (one beat = 22.5 frames). Picture and sound/build_cues.py both read this file.
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 22.5;
const b = (n) => Math.round(n * BEAT);
export const HOOK = 0;          // "Still renting your website?" + the builder meter ticking month by month
export const TURN = b(3);       // 68: "Or own it." $360 slams in
export const ROWS = b(5);       // 113: builder vs Appify, one feature every 2 beats; every row costs the builder 2 more months
export const ROW_LEN = b(2);    // 45
export const MATH = b(19);      // 428: 3 years: $1,404 vs $360
export const END = b(22);       // 495: live in under 7 days, $360 once, DM LAUNCH
export const CUTS = [TURN, ROWS, MATH, END];

export const MONTHLY = 39;      // typical builder plan used for the comparison (same figure as the earlier comparison graphic)
export const PRICE = 360;       // Appify lifetime plan, one-time
export const MONTHS_PER_ROW = 2;
export const FEATURES = [
  // [subscription builder, Appify lifetime]
  ["Same template as everyone", "Custom UI/UX design"],
  ["Their dashboard", "Your own admin panel"],
  ["Basic stats", "Custom analytics"],
  ["Their rules, their limits", "Full control"],
  ["Static pages", "Motion graphics"],
  ["Upgrade to unlock", "Paywall built in"],
  ["Hosting while you pay", "Free hosting"],
];
export const rowAt = (i) => ROWS + 4 + i * ROW_LEN;
// the first row whose running builder total passes the Appify price
export const CROSS = FEATURES.findIndex((_, i) => (i + 1) * MONTHS_PER_ROW * MONTHLY > PRICE);
