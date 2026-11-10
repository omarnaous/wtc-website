// Darebni form reel for shoulder day, the leg-press / lunge correction format (LegPress.jsx, LungeFix.jsx) over the library's
// dumbbell lateral raise clip (public/lib/t334.mp4 = "Treinos (334).mp4", all 16.9 s, the other app's print on the shorts'
// waistband painted out frame by frame, kept out of git). Split-screen: ✕ on the top half, ✓ on the bottom at the same
// time, four mistakes read from the clip: lifting above shoulder height (front), standing bolt upright (side), shrugging
// (back, traps lit), arms drifting back (side); then correct reps with the delts lit under "Do it right". Its opening
// voice-over ("Feeling traps, not shoulders? You're doing it wrong. Watch this.") stays audible; the clip's audio fades out
// before its own "save this" line; the shared end card follows.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

export const LRF = { FPS: 30, CLIP: 506, END_LEN,
  SEG: [[8, 98], [112, 186], [202, 314], [326, 372]],   // [labels in, labels out]; the camera moves at ~102, ~192, ~320, ~372
  MOVES: [102, 192, 320, 372], DEMO: 378 };
LRF.DURATION = LRF.CLIP + LRF.END_LEN;
const { FPS, CLIP, SEG, DEMO } = LRF;
const VO_END = 112;              // the clip's voice-over ends at 3.6 s
const RED = "#FF4D5E", GRN = "#3DDC97";
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.2) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: "0% 50%" });

const CARD = { x: 113, y: 420, w: 853, h: 1517 };
const HALF = CARD.h / 2;   // the clip's split: wrong on top, right below
const FIX = [
  { wrong: "Lifting too high", right: "Stop at shoulder height", why: ["above the shoulder, traps take over", "tension stays on the side delts"] },
  { wrong: "Standing bolt upright", right: "Lean slightly forward", why: ["your front delts steal the lift", "side delts line up with the weight"] },
  { wrong: "Shrugging your shoulders", right: "Shoulders down", why: ["your traps do the work", "delts lift, traps relax"] },
  { wrong: "Arms drifting back", right: "Arms slightly forward", why: ["it pinches the shoulder joint", "a safer, stronger path"] },
];

function Tag({ f, at, good, text, why }) {
  const c = good ? GRN : RED;
  return (
    <>
      <div style={{ ...pop(sp(f, at, 11, 260)), display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 14px", borderRadius: 18,
        background: "rgba(7,7,26,.85)", border: `3px solid ${c}`, boxShadow: `0 10px 30px rgba(0,0,0,.45), 0 0 26px ${c}66` }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: c, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 34, color: B.ink }}>{good ? "✓" : "✕"}</div>
        <div style={{ ...D, fontSize: 50, color: B.cream, whiteSpace: "nowrap" }}>{text}</div>
      </div>
      <div style={{ marginTop: 10, marginLeft: 6, padding: "7px 16px", borderRadius: 10, background: "rgba(7,7,26,.75)", ...UIR, fontSize: 31, color: good ? "#B9F5DA" : "#FFC2C8", ...rise(sp(f, at + 12)) }}>{why}</div>
    </>
  );
}

function Label({ f, i }) {
  const [a, out] = SEG[i], L = FIX[i];
  if (f < a - 2 || f > out + 6) return null;
  const o = interpolate(f, [out - 6, out], [1, 0], clamp);
  const box = (top) => ({ position: "absolute", left: CARD.x + 24, top, opacity: o, display: "flex", flexDirection: "column", alignItems: "flex-start" });
  return (
    <>
      <div style={box(CARD.y + 24)}>
        <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.12em", marginBottom: 10, ...rise(sp(f, a)) }}>Mistake {i + 1}/{FIX.length}</div>
        <Tag f={f} at={a + 4} text={L.wrong} why={L.why[0]} />
      </div>
      <div style={box(CARD.y + HALF + 24)}>
        <Tag f={f} at={a + 22} good text={L.right} why={L.why[1]} />
      </div>
    </>
  );
}

function DoItRight({ f }) {
  if (f < DEMO - 2 || f > CLIP + 4) return null;
  const o = interpolate(f, [CLIP - 6, CLIP], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: HALF, borderRadius: "36px 36px 0 0", opacity: o * Math.min(1, sp(f, DEMO, 14, 200) * 1.5), padding: "0 60px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center",
      background: "linear-gradient(180deg, #07071A, #0D0C28)", borderBottom: `3px solid ${GRN}` }}>
      <div style={{ ...D, fontSize: 40, color: GRN, letterSpacing: "0.1em", ...rise(sp(f, DEMO)) }}>Do it right</div>
      <div style={{ ...D, fontSize: 100, color: B.cream, marginTop: 4, ...rise(sp(f, DEMO + 3)) }}>Lateral raise</div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {["3 × 12-15", "Rest 60 s", "RPE 9"].map((x, k) => (
          <div key={x} style={{ padding: "8px 16px", borderRadius: 12, background: k ? "rgba(7,7,26,.6)" : B.primary, border: `2px solid ${k ? "rgba(139,128,255,.45)" : B.lo}`, ...D, fontSize: 40, color: B.cream, whiteSpace: "nowrap", ...rise(sp(f, DEMO + 6 + k * 4)) }}>{x}</div>
        ))}
      </div>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
        {FIX.map((x, k) => <div key={x.right} style={{ ...UI, fontSize: 50, color: B.cream, ...rise(sp(f, DEMO + 18 + k * 12)) }}><span style={{ color: GRN }}>✓</span> {x.right}</div>)}
      </div>
    </div>
  );
}

function Title({ f }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 232, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ ...D, fontSize: 80, color: B.cream, whiteSpace: "nowrap", ...pop(sp(f, 0, 10, 260), 1.3) }}>Feeling traps,</div>
        <div style={{ ...D, fontSize: 80, color: B.lo, whiteSpace: "nowrap", marginTop: 4, ...pop(sp(f, 6, 10, 260), 1.3) }}>not shoulders?</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, ...rise(sp(f, 4)) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 50, height: 50, borderRadius: 13 }} />
        <span style={{ ...D, fontSize: 30, color: B.cream, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Darebni AI</span>
      </div>
    </div>
  );
}

function EndCard({ f }) {
  if (f < CLIP) return null;
  return (
    <AbsoluteFill style={{ background: B.ink }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 62%, rgba(91,78,229,.35), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <Outro f={f} start={CLIP} />
    </AbsoluteFill>
  );
}

export const LatRaiseFix = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const card = sp(f, 0, 14, 160);
  return (
    <AbsoluteFill style={{ background: B.ink }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(91,78,229,.35), transparent 65%)" }} />
      <Sequence durationInFrames={CLIP + 4} layout="none">
        <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 36, overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,.55), 0 0 0 3px rgba(139,128,255,.55), 0 0 80px rgba(91,78,229,.35)",
          opacity: Math.min(1, card * 2), transform: `translateY(${(1 - Math.min(1, card)) * 80}px)` }}>
          <OffthreadVideo src={staticFile("lib/t334.mp4")} volume={(t) => interpolate(t, [VO_END, VO_END + 12], [1, 0], clamp)} style={{ width: CARD.w, height: CARD.h }} />
        </div>
        <Title f={f} />
        {SEG.map((_, i) => <Label key={i} f={f} i={i} />)}
        <DoItRight f={f} />
      </Sequence>
      <EndCard f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [CLIP - 2, CLIP, CLIP + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.03} />
      <Audio src={staticFile(music ? "latraisefix.wav" : "latraisefix-sfx.wav")} />
    </AbsoluteFill>
  );
};
