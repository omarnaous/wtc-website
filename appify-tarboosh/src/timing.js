// 13 s at 30 fps. "Every Lebanese kid knows this sound." A red-foil Tarboosh unwraps petal by petal, the chocolate
// shell cracks, a beat of silence, then it bursts in slow motion and the marshmallow squishes. Everything rewinds
// to the wrapper you remember: "Some things never change." / "Your ads should."
// sound/build.py reads the integer constants here so every crinkle, the crack and the burst land on their frames.
export const FPS = 30;
export const DURATION = 390;
export const HOOK_OUT = 74;      // hook text leaves
export const PEEL0 = 34;         // first foil petal starts to peel
export const PEEL_GAP = 9;       // next petal every 9 frames
export const PEEL_LEN = 26;      // each petal takes 26 frames to fold open
export const PETALS = 7;
export const GLINT = 122;        // a light sweeps across the bare chocolate
export const CRACK = 168;        // the shell cracks (snap), then silence
export const BURST = 188;        // the shell bursts in slow motion, the marshmallow squishes
export const REWIND = 268;       // everything rewinds to the wrapped Tarboosh
export const REW_END = 298;
export const NEVER = 270;        // "Some things never change."
export const SHOULD = 318;       // "Your ads should." (world flips to Appify UV)
export const CREDIT = 336;       // "Spec ad by appify"
export const SLOW = 0.3;         // slow-motion rate after the burst

// product time: what the 3D scene shows. Real time until the burst, slow motion after it, then a fast rewind to 0.
const PT_REW = BURST + (REWIND - BURST) * SLOW;
export function pt(f) {
  if (f <= BURST) return f;
  if (f <= REWIND) return BURST + (f - BURST) * SLOW;
  if (f >= REW_END) return 0;
  const x = (f - REWIND) / (REW_END - REWIND);
  const e = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  return PT_REW * (1 - e);
}
