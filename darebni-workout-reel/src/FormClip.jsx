// Darebni form-check reel over the supplied skull-crusher footage (public/form-clip.mp4, 26.3 s, kept out of git).
// Darebni's labels are locked to the clip's own ✕/✓ moments: wrists (0–1.9 s red, then green), elbows (4.5–7.6 s
// red, then green), upper arms (10.8–13.9 s red, then green), then clean reps with the plan's numbers and a 3-point
// checklist; a 4 s comment-PLAN end card follows the clip.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import W from "./push_workout.json";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B } from "./Main.jsx";

const s = (sec) => Math.round(sec * 30);
export const FL = { FPS: 30, CLIP: s(26.3), END: s(26.3), DURATION: s(26.3) + 120,
  SEG: [[0, s(1.9), s(4.3)], [s(4.5), s(7.6), s(10.6)], [s(10.8), s(13.9), s(16.5)]] };
const { FPS, END, SEG } = FL;
const RED = "#FF4D5E", GRN = "#3DDC97";
const D = { fontFamily: "Cond", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 0.92 };
const UI = { fontFamily: "Barlow", fontWeight: 600 };
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.3) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: "0% 50%" });
const shadow = { textShadow: "0 4px 24px rgba(0,0,0,.6)" };
// a dark panel behind text that sits over the footage
const panel = { padding: "22px 28px", borderRadius: 28, background: "rgba(7,7,26,.72)", border: "1.5px solid rgba(139,128,255,.3)" };

const LABELS = [
  { wrong: "Wrists bent back", right: "Wrists straight", why: "Bent wrists strain the joint, not the triceps" },
  { wrong: "Elbows flare out", right: "Elbows in", why: "Flared elbows shift the load off your triceps" },
  { wrong: "Upper arms straight up", right: "Upper arms angled back", why: "A slight angle keeps tension on the triceps" },
];

function Header({ right }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 236, display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
      <span style={{ ...D, fontSize: 40, color: B.cream, letterSpacing: "0.04em", ...shadow }}>Darebni AI</span>
      {right && <span style={{ marginLeft: "auto", marginRight: 150, ...D, fontSize: 32, color: B.xlo, letterSpacing: "0.06em" }}>{right}</span>}
    </div>
  );
}

function Segment({ f, i }) {
  const [a, g, out] = SEG[i], L = LABELS[i];
  if (f < a - 2 || f > out + 6) return null;
  const good = f >= g, o = interpolate(f, [out - 6, out], [1, 0], clamp);
  const top = i === 0 ? 560 : 340;
  return (
    <div style={{ position: "absolute", left: 50, right: 190, top: top - 20, opacity: o, ...(i ? panel : {}) }}>
      <div style={{ ...D, fontSize: 32, color: B.xlo, letterSpacing: "0.08em", ...shadow, ...rise(sp(f, a)) }}>Mistake {i + 1}/3</div>
      <div key={good ? "g" : "w"} style={{ ...D, fontSize: i === 0 ? 92 : 104, color: good ? GRN : RED, marginTop: 10, ...shadow, ...pop(sp(f, good ? g : a + 2, 11, 260), 1.25) }}>
        {good ? "✓ " : "✕ "}{good ? L.right : L.wrong}
      </div>
      <div style={{ ...UI, fontSize: 32, color: "rgba(242,240,234,.85)", marginTop: 14, ...shadow, ...rise(sp(f, a + 14)) }}>{L.why}</div>
    </div>
  );
}

function Hook({ f }) {
  if (f > SEG[0][2] + 6) return null;
  const o = interpolate(f, [SEG[0][2] - 6, SEG[0][2]], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 70, right: 200, top: 330, opacity: o }}>
      <div style={{ ...D, fontSize: 130, color: B.cream, ...shadow, ...pop(sp(f, 0, 10, 260), 1.4) }}>Skull crushers</div>
      <div style={{ ...D, fontSize: 70, color: RED, marginTop: 8, ...shadow, ...rise(sp(f, 6)) }}>3 mistakes to fix</div>
    </div>
  );
}

function DoItRight({ f }) {
  const a = SEG[2][2];
  if (f < a - 2 || f > END + 4) return null;
  const e = W.exercises.find((x) => x.exerciseId === "0061");
  const o = interpolate(f, [END - 6, END], [1, 0], clamp);
  const checks = ["Wrists straight", "Elbows in", "Upper arms angled back"];
  return (
    <div style={{ position: "absolute", left: 50, right: 190, top: 320, opacity: o, ...panel }}>
      <div style={{ ...D, fontSize: 32, color: GRN, letterSpacing: "0.08em", ...shadow, ...rise(sp(f, a)) }}>Do it right</div>
      <div style={{ ...D, fontSize: 92, color: B.cream, marginTop: 10, ...shadow, ...rise(sp(f, a + 4), 50) }}>{e.name}</div>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {[`${e.sets} × ${e.reps}`, `Rest ${e.rest.replace("s", " s")}`, e.rpe].map((x, k) => (
          <div key={x} style={{ padding: "10px 20px", borderRadius: 14, background: k ? "rgba(7,7,26,.6)" : B.primary, border: `2px solid ${k ? "rgba(139,128,255,.45)" : B.lo}`, ...D, fontSize: 36, color: B.cream, ...rise(sp(f, a + 12 + k * 4)) }}>{x}</div>
        ))}
      </div>
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
        {checks.map((c, k) => <div key={c} style={{ ...UI, fontSize: 34, color: B.cream, ...shadow, ...rise(sp(f, a + 60 + k * 45)) }}><span style={{ color: GRN }}>✓</span> {c}</div>)}
      </div>
    </div>
  );
}

function EndCard({ f }) {
  const t = f - END;
  if (t < -2) return null;
  const cta = sp(t, 16, 9, 260);
  return (
    <AbsoluteFill style={{ background: B.ink }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(91,78,229,.4), transparent 60%)" }} />
      <Header right="" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 380 }}>
        <div style={{ ...D, fontSize: 116, color: B.cream, ...rise(sp(t, 0, 12, 240), 60) }}>Train with a</div>
        <div style={{ ...D, fontSize: 116, color: B.lo, ...rise(sp(t, 6, 12, 240), 60) }}>plan that<br />coaches you</div>
        <div style={{ marginTop: 40, display: "inline-block", padding: "22px 36px", borderRadius: 22, background: B.cream, transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, t - 40) / 5)))})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
          <div style={{ ...D, fontSize: 32, color: B.primary, letterSpacing: "0.06em" }}>Comment 👇</div>
          <div style={{ ...D, fontSize: 112, color: B.ink }}>“PLAN”</div>
        </div>
        <div style={{ ...UI, fontSize: 38, color: "rgba(242,240,234,.85)", marginTop: 26, ...rise(sp(t, 30)) }}>Free 4-week plan · Darebni AI on the App Store</div>
      </div>
    </AbsoluteFill>
  );
}

export const FormClip = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: "#2A3038" }}>
      <Sequence durationInFrames={END} layout="none">
        <OffthreadVideo src={staticFile("form-clip.mp4")} muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,7,26,.55) 0%, rgba(7,7,26,0) 34%)" }} />
        <Header right="" />
        <Hook f={f} />
        {SEG.map((_, i) => <Segment key={i} f={f} i={i} />)}
        <DoItRight f={f} />
      </Sequence>
      <EndCard f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [END - 2, END, END + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen" }} />
      <Grain f={f} opacity={0.03} />
      <Audio src={staticFile(music ? "formclip.wav" : "formclip-sfx.wav")} />
    </AbsoluteFill>
  );
};
