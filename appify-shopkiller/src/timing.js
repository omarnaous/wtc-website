// The voice leads: vo/vo.py reads the script, places every scene on the voice and writes the
// anchors to vo.json. Scene lengths, the paper rip/wipe/cut and Dev's gestures all follow it.
import VO from "./vo.json";

export const FPS = 30;
export const DURATION = VO.duration;
const A = Object.fromEntries(VO.anchors.map(([k, , n]) => [k, n]));
const span = (a, b) => [A[a], A[b] - A[a]];
export const SCENES = {
  receipt: span("receipt", "cost"),    // hook: an endless subscription receipt
  cost: span("cost", "turn"),          // 3D bars: what the monthly fee adds up to
  turn: span("turn", "reveal"),        // paper rips: "What if you paid once?"
  reveal: span("reveal", "feat0"),     // SUBSCRIPTION KILLER slam + exploded 3D store
  features: span("feat0", "compare"),  // four selling points, one per line
  compare: span("compare", "guarantee"), // two lines over 10 years: the savings
  guarantee: span("guarantee", "offer"), // money-back guarantee
  offer: span("offer", "end"),         // one receipt, stamped PAID ONCE + CTA
};
export const FEATS = [0, 1, 2, 3].map((i) => A[`feat${i}`] - A.feat0); // feature k starts, within the scene
const wordAt = (line, w) => VO.words.find((x) => x.line === line && x.w === w)?.start;
export const COST_CUES = { ten: wordAt(1, "years!") - A.cost, own: wordAt(1, "And") - A.cost };
export const RIP = A.turn;      // paper tears open on the turn
export const WIPE = A.compare;  // paper slides back in for the comparison
export const CUT = A.guarantee; // hard cut to ink for the guarantee

// warp(f): move a frame designed on the original 33 s cut onto the voice-led cut. A frame keeps its
// offset from its scene's start; one in the last 30 frames before a scene change keeps its offset
// to that change instead (risers, anticipation). sound/retime.py does the same for the sound cues.
const OLD = VO.anchors.map(([, o]) => o), NEW = VO.anchors.map(([, , n]) => n);
export function warp(f) {
  if (f >= OLD[OLD.length - 1]) return NEW[NEW.length - 1];
  let i = 0;
  while (i < OLD.length - 2 && f >= OLD[i + 1]) i++;
  const toNext = OLD[i + 1] - f;
  const g = toNext <= 30 && i < OLD.length - 2 ? NEW[i + 1] - toNext : NEW[i] + (f - OLD[i]);
  return Math.max(NEW[i], Math.min(NEW[i + 1] - 1, g));
}
