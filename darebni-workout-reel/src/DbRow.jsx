// Darebni form reel for chest + back day, the lat-pulldown / leg-press correction format over the library's one-arm dumbbell
// row clip (public/lib/t329.mp4 = "Treinos (329).mp4", 0-21 s used, kept out of git). Four mistakes, timings read from the
// clip's own badge: curling the weight up (split screen, ✓ on top and ✕ below, 0-5.7 s), the row ending at the chest
// instead of the hip (✕ 6-7.8 s, ✓ to 9 s), twisting the torso (✕ 10.9-12.8 s, ✓ to 14 s) and the shoulder sagging at the
// bottom (✕ 15-16.9 s, ✓ to 18.2 s), then correct reps. Darebni's labels follow each phase; "Do it right" over the
// correct reps; the shared end card follows.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

export const DR = { FPS: 30, CLIP: 630, END_LEN,
  SPLIT: [6, 172],                                          // split-screen phase: labels in, out
  SEG: [[181, 234, 268], [330, 383, 418], [453, 506, 545]],   // [label in, turns green, out]
  DEMO: 552 };
DR.DURATION = DR.CLIP + DR.END_LEN;
const { FPS, CLIP, SEG, SPLIT, DEMO } = DR;
const RED = "#FF4D5E", GRN = "#3DDC97";
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.2) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: "0% 50%" });

const CARD = { x: 113, y: 420, w: 853, h: 1517 };
const HALF = CARD.h / 2;
const FIX = [
  { wrong: "Curling the weight up", right: "Drive your elbow back", why: ["your biceps take over", "forearm stays vertical"] },
  { wrong: "Rowing to your chest", right: "Row to your hip", why: ["elbow closes to 45°", "90° at the elbow at the top"] },
  { wrong: "Twisting your torso", right: "Shoulders stay square", why: ["momentum moves the weight", "chest faces the floor"] },
  { wrong: "Shoulder sagging down", right: "Shoulder set at the bottom", why: ["the joint takes the load", "the lat keeps the tension"] },
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

// mistake 1: the clip is split, ✓ on the top half and ✕ on the bottom half; the ✕ label lands first
function SplitLabel({ f }) {
  const [a, out] = SPLIT, L = FIX[0];
  if (f < a - 2 || f > out + 6) return null;
  const o = interpolate(f, [out - 6, out], [1, 0], clamp);
  const box = (top) => ({ position: "absolute", left: CARD.x + 24, top, opacity: o, display: "flex", flexDirection: "column", alignItems: "flex-start" });
  return (
    <>
      <div style={box(CARD.y + 24)}>
        <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.12em", marginBottom: 10, ...rise(sp(f, a)) }}>Mistake 1/4</div>
        <Tag f={f} at={a + 26} good text={L.right} why={L.why[1]} />
      </div>
      <div style={box(CARD.y + HALF + 24)}>
        <Tag f={f} at={a + 6} text={L.wrong} why={L.why[0]} />
      </div>
    </>
  );
}

function Label({ f, i }) {
  const [a, g, out] = SEG[i], L = FIX[i + 1];
  if (f < a - 2 || f > out + 6) return null;
  const good = f >= g, c = good ? GRN : RED, o = interpolate(f, [out - 6, out], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: CARD.x + 26, top: CARD.y + 26, opacity: o, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.12em", marginBottom: 10, ...rise(sp(f, a)) }}>Mistake {i + 2}/4</div>
      <div key={good ? "g" : "w"} style={{ ...pop(sp(f, good ? g : a + 4, 11, 260)), display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 14px", borderRadius: 18,
        background: "rgba(7,7,26,.85)", border: `3px solid ${c}`, boxShadow: `0 10px 30px rgba(0,0,0,.45), 0 0 26px ${c}66` }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: c, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 34, color: B.ink }}>{good ? "✓" : "✕"}</div>
        <div style={{ ...D, fontSize: 52, color: B.cream, whiteSpace: "nowrap" }}>{good ? L.right : L.wrong}</div>
      </div>
      <div key={good ? "gw" : "ww"} style={{ marginTop: 10, marginLeft: 6, padding: "7px 16px", borderRadius: 10, background: "rgba(7,7,26,.75)", ...UIR, fontSize: 32, color: good ? "#B9F5DA" : "#FFC2C8", ...rise(sp(f, (good ? g : a) + 14)) }}>
        {good ? L.why[1] : L.why[0]}
      </div>
    </div>
  );
}

function DoItRight({ f }) {
  if (f < DEMO - 2 || f > CLIP + 4) return null;
  const e = { sets: 3, reps: "10-12 / arm", rest: "60s", rpe: "RPE 8" };
  const o = interpolate(f, [CLIP - 6, CLIP], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: CARD.x + 26, top: CARD.y + 26, opacity: o, padding: "22px 26px", borderRadius: 24, background: "rgba(7,7,26,.8)", border: "2px solid rgba(139,128,255,.4)" }}>
      <div style={{ ...D, fontSize: 30, color: GRN, letterSpacing: "0.1em", ...rise(sp(f, DEMO)) }}>Do it right</div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {[`${e.sets} × ${e.reps}`, `Rest ${e.rest.replace("s", " s")}`, e.rpe].map((x, k) => (
          <div key={x} style={{ padding: "8px 16px", borderRadius: 12, background: k ? "rgba(7,7,26,.6)" : B.primary, border: `2px solid ${k ? "rgba(139,128,255,.45)" : B.lo}`, ...D, fontSize: 32, color: B.cream, ...rise(sp(f, DEMO + 6 + k * 4)) }}>{x}</div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {FIX.map((x, k) => <div key={x.right} style={{ ...UI, fontSize: 34, color: B.cream, ...rise(sp(f, DEMO + 18 + k * 12)) }}><span style={{ color: GRN }}>✓</span> {x.right}</div>)}
      </div>
    </div>
  );
}

function Title({ f }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 232, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ ...D, fontSize: 80, color: B.cream, whiteSpace: "nowrap", ...pop(sp(f, 0, 10, 260), 1.3) }}>Still making these</div>
        <div style={{ ...D, fontSize: 80, color: B.lo, whiteSpace: "nowrap", marginTop: 4, ...pop(sp(f, 6, 10, 260), 1.3) }}>dumbbell row mistakes?</div>
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

export const DbRow = ({ music = true }) => {
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
          <OffthreadVideo src={staticFile("lib/t329.mp4")} muted style={{ width: CARD.w, height: CARD.h }} />
        </div>
        <Title f={f} />
        <SplitLabel f={f} />
        {SEG.map((_, i) => <Label key={i} f={f} i={i} />)}
        <DoItRight f={f} />
      </Sequence>
      <EndCard f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [CLIP - 2, CLIP, CLIP + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.03} />
      <Audio src={staticFile(music ? "dbrow.wav" : "dbrow-sfx.wav")} />
    </AbsoluteFill>
  );
};
