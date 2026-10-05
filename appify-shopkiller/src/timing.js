// 120 BPM at 30 fps: 15 frames per beat. 33 s = 990 frames.
// Scene starts sit on downbeats. sound/cues.json uses these frames.
export const FPS = 30;
export const DURATION = 990;
export const SCENES = {
  receipt: [0, 90],    // hook: an endless subscription receipt
  cost: [90, 180],     // 3D bars: what $30/month adds up to
  turn: [270, 60],     // paper rips: "What if you paid once?"
  reveal: [330, 150],  // SHOPIFY KILLER slam + exploded 3D store
  features: [480, 180],// four selling points, one per bar
  compare: [660, 120], // two lines over 10 years: the savings
  guarantee: [780, 90], // money-back guarantee (+ real reviews when added)
  offer: [870, 120],   // one receipt, stamped PAID ONCE + CTA
};
export const RIP = 270;      // paper tears open on the turn
export const WIPE = 660;     // paper slides back in for the comparison
export const CUT = 780;      // hard cut to ink for the offer
