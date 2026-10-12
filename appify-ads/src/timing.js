// 20 s at 30 fps on a 120 BPM grid (one beat = 15 frames, a bar = 60). sound/build_cues.py reads this file.
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 15;
export const TAP = 30;          // a finger about to press "Boost post"
export const WAIT = 34;         // she stops it: "wait—"
export const SMART = 62;        // "there's a smarter button."
export const VS = 90;           // the drop: Boost post vs Meta Ads Manager, one row every 3 beats
export const ROW_LEN = 45;
export const ROWS = [
  // [what, boost post, ads manager]  (kept to what Meta's own tools offer; no made-up numbers)
  ["Goal", "A few simple goals", "Sales, leads & messages"],
  ["Audience", "Simple audience picker", "Custom & lookalike audiences"],
  ["Retargeting", "Limited", "Site visitors & engagers"],
  ["Placements", "Limited control", "Choose every placement"],
  ["Testing", "No A/B tests", "A/B test ads & audiences"],
  ["Optimised for", "Often likes", "Sales & leads"],
];
export const rowAt = (i) => VS + 10 + i * ROW_LEN;
export const SERVICE = VS + 10 + ROWS.length * ROW_LEN + 25;   // 395: we run your Meta ads
export const SERVICES = ["Strategy & targeting", "Scroll-stopping ad creatives", "Pixel & conversion tracking", "A/B testing", "Weekly reports"];
export const END = 480;         // stop boosting, start advertising: DM "ADS"
export const CUTS = [VS, SERVICE, END];
