// Darebni form reel for glute day, the leg-press correction format (LegPress.jsx) over the library's dumbbell lunge clip
// (public/lib/t339.mp4 = "Treinos (339).mp4", all 15.6 s, the other app's print on the shorts painted out frame by frame,
// kept out of git). The clip is split-screen, ✕ on the top half and ✓ on the bottom at the same time, two mistakes: back
// heel flat on the floor (side, 0-6.8 s) and the front knee caving in (front, after the camera orbits at 6.8-7.7 s).
// Its opening voice-over ("Lunges are powerful if you're doing them right. Watch this.") stays audible, then the clip's
// audio fades out before its own "save this" line; "Do it right" covers the top half for the last 3 s; end card follows.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

export const LF = { FPS: 30, CLIP: 467, END_LEN,
  SEG: [[8, 198], [238, 372]],   // [labels in, labels out]; the camera orbits side -> front at 204-232
  ORBIT: 204, DEMO: 378 };
LF.DURATION = LF.CLIP + LF.END_LEN;
const { FPS, CLIP, SEG, DEMO } = LF;
const VO_END = 122;              // the clip's voice-over ends at 4.0 s
const RED = "#FF4D5E", GRN = "#3DDC97";
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.2) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: "0% 50%" });

const CARD = { x: 113, y: 420, w: 853, h: 1517 };
const HALF = CARD.h / 2;   // the clip's split: wrong on top, right below
const FIX = [
  { wrong: "Back heel flat on the floor", right: "Back heel up", why: ["you can't sink deep enough", "sink deep, drive through the front heel"] },
  { wrong: "Knee caving in", right: "Knee over your toes", why: ["your glutes switch off", "push it out, the glutes take over"] },
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
      <div style={{ ...D, fontSize: 100, color: B.cream, marginTop: 4, ...rise(sp(f, DEMO + 3)) }}>Dumbbell lunge</div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {["3 × 10 each leg", "Rest 90 s", "RPE 8"].map((x, k) => (
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
        <div style={{ ...D, fontSize: 80, color: B.cream, whiteSpace: "nowrap", ...pop(sp(f, 0, 10, 260), 1.3) }}>Lunges not hitting</div>
        <div style={{ ...D, fontSize: 80, color: B.lo, whiteSpace: "nowrap", marginTop: 4, ...pop(sp(f, 6, 10, 260), 1.3) }}>your glutes?</div>
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

export const LungeFix = ({ music = true }) => {
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
          <OffthreadVideo src={staticFile("lib/t339.mp4")} volume={(t) => interpolate(t, [VO_END, VO_END + 12], [1, 0], clamp)} style={{ width: CARD.w, height: CARD.h }} />
        </div>
        <Title f={f} />
        {SEG.map((_, i) => <Label key={i} f={f} i={i} />)}
        <DoItRight f={f} />
      </Sequence>
      <EndCard f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [CLIP - 2, CLIP, CLIP + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.03} />
      <Audio src={staticFile(music ? "lungefix.wav" : "lungefix-sfx.wav")} />
    </AbsoluteFill>
  );
};
