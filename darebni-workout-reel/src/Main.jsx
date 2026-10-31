// Darebni AI "Push day" reel, built from push_workout.json (the app's own plan format). The Darebni coach (an
// original cartoon bodybuilder, Coach.jsx) flexes in the intro; each of the 7 exercises plays the app's own demo
// (the GIFURLSOM repo the app resolves ids to; its two clean poses in public/gifs/<id>/a.png, b.png) as one rep per
// second with a rep counter, beside the real sets, reps, rest and RPE; a push-up finisher; and the coach flexes
// again in the outro asking people to comment PLAN for a free 4-week plan.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import W from "./push_workout.json";
import { FPS, EX0, EX_LEN, N_EX, FIN, OUTRO } from "./timing.js";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { Coach } from "./Coach.jsx";

export const B = { primary: "#5B4EE5", lo: "#8B80FF", xlo: "#B8B0FF", deep: "#4338CA", ink: "#07071A", surface: "#11112B", cream: "#F2F0EA", success: "#6EE7B7", danger: "#FB7185" };

const D = { fontFamily: "Cond", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 0.92 };
const UI = { fontFamily: "Barlow", fontWeight: 600 };
const UIR = { fontFamily: "BarlowR", fontWeight: 500 };
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.3) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });

// short cues, condensed from each exercise's own instructions in the plan
const CUES = ["Lower to the chest, press up over your eyes", "Press up, lock out, squeeze the chest", "Back on the bench, press overhead",
  "Brace your core, lower to the top of the chest", "Raise to shoulder height, pause, lower slowly", "Upper arms still, only the forearms move",
  "Bend the elbows first, big stretch on the triceps"];
const TARGET = { pectorals: "Chest", delts: "Shoulders", triceps: "Triceps" };
// Each demo GIF is two clean poses (start, top) joined by crossfades. We keep only those two and play one crisp rep
// per second, landing the top on the beat: hold the start, snap up in 5 frames, hold the top, snap back.
// Rep k peaks at t = 15 + 30k (on the 120 BPM grid, since every card starts on a beat).
export const repTop = (t) => { const c = ((t % 30) + 30) % 30; return c < 10 ? 0 : c < 15 ? (c - 10) / 5 : c < 25 ? 1 : 1 - (c - 25) / 5; };
const ease = (x) => x * x * (3 - 2 * x);
function GifCard({ id, t, top = 640, reps = true }) {
  const p = Math.min(1, sp(t, 2, 13, 220)), k = ease(repTop(Math.max(0, t)));
  const hit = Math.max(0, 1 - Math.abs((((t % 30) + 30) % 30) - 15) / 4);   // a little punch as the top lands
  const n = t < 15 ? 0 : Math.min(4, Math.floor((t - 15) / 30) + 1);
  return (
    <div style={{ position: "absolute", left: 140, top, width: 800, height: 620, borderRadius: 40, background: "#fff", overflow: "hidden",
      boxShadow: `0 40px 100px rgba(0,0,0,.55), 0 0 0 4px rgba(139,128,255,${0.55 + 0.4 * hit}), 0 0 ${90 + 50 * hit}px rgba(91,78,229,.4)`, ...pop(p, 0.9) }}>
      <div style={{ position: "absolute", left: 100, top: 10, width: 600, height: 600, transform: `scale(${1 + 0.025 * hit})` }}>
        <Img src={staticFile(`gifs/${id}/a.png`)} style={{ position: "absolute", inset: 0, width: 600, height: 600 }} />
        <Img src={staticFile(`gifs/${id}/b.png`)} style={{ position: "absolute", inset: 0, width: 600, height: 600, opacity: k }} />
      </div>
      {reps && n > 0 && (
        <div style={{ position: "absolute", right: 22, top: 22, padding: "10px 18px", borderRadius: 14, background: B.ink, ...D, fontSize: 34, color: B.cream, letterSpacing: "0.04em", transform: `scale(${1 + 0.12 * hit})` }}>
          Rep <span style={{ color: B.lo }}>{n}</span>
        </div>
      )}
    </div>
  );
}
const secs = (s) => s.replace("s", " s");

function Header({ f, right }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 236, display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
      <span style={{ ...D, fontSize: 40, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      <span style={{ marginLeft: "auto", ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.06em" }}>{right}</span>
    </div>
  );
}
const Chip = ({ children, hot, style }) => (
  <div style={{ padding: "12px 22px", borderRadius: 16, background: hot ? B.primary : "rgba(139,128,255,.14)", border: `2px solid ${hot ? B.lo : "rgba(139,128,255,.35)"}`, ...D, fontSize: 40, color: B.cream, letterSpacing: "0.02em", ...style }}>{children}</div>
);
// the coach on stage: half-body, cut at the bottom by his own fade, with a floor glow
function CoachStage({ f, x = 540, w = 520, top = 760, flexAt = 10 }) {
  const flex = f < flexAt ? 0 : Math.max(0, Math.sin(((f - flexAt) / 30) * Math.PI)) ** 2;
  const enter = sp(f, flexAt - 8, 13, 160);
  return (
    <>
      <div style={{ position: "absolute", left: x - w * 0.75, top: top + w * 0.55, width: w * 1.5, height: w * 0.9, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,78,229,.45), transparent 65%)" }} />
      <div style={{ position: "absolute", left: x - w / 2, top, transform: `translateY(${(1 - Math.min(1, enter)) * 300}px)`, opacity: Math.min(1, enter * 2) }}>
        <Coach width={w} flex={flex} t={f} />
      </div>
    </>
  );
}

function Intro({ f }) {
  const out = interpolate(f, [EX0 - 6, EX0 + 2], [1, 0], clamp);
  const stats = [`${W.estimatedMinutes} min`, `${W.totalSets} sets`, W.level, W.environment];
  return (
    <div style={{ opacity: out }}>
      <Header f={f} right="Today's workout" />
      <div style={{ position: "absolute", left: 70, top: 310 }}>
        <div style={{ ...D, fontSize: 200, color: B.cream, ...pop(sp(f, 4, 10, 260), 1.4), transformOrigin: "0% 50%" }}>Push <span style={{ color: B.lo }}>day</span></div>
        <div style={{ ...UI, fontSize: 40, color: "rgba(242,240,234,.8)", marginTop: 14, ...rise(sp(f, 14)) }}>{W.focus}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap", width: 940 }}>
          {stats.map((s, i) => <div key={s} style={rise(sp(f, 22 + i * 4))}><Chip hot={i === 0}>{s}</Chip></div>)}
        </div>
      </div>
      <CoachStage f={f} top={700} w={540} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1500, ...UIR, fontSize: 32, color: "rgba(242,240,234,.8)", ...rise(sp(f, 40)) }}>
        <span style={{ ...D, fontSize: 32, color: B.success, letterSpacing: "0.06em" }}>Warm-up · </span>{W.warmup}
      </div>
    </div>
  );
}

function Exercise({ f, i }) {
  const start = EX0 + i * EX_LEN, t = f - start;
  if (t < -4 || t > EX_LEN + 4) return null;
  const e = W.exercises[i];
  const inP = sp(t, 0, 13, 240), out = interpolate(t, [EX_LEN - 5, EX_LEN + 2], [1, 0], clamp);
  return (
    <div style={{ opacity: out }}>
      <Header f={f} right={`Push day · ${i + 1}/${N_EX}`} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 330 }}>
        <div style={{ ...D, fontSize: e.name.length > 22 ? 96 : 116, color: B.cream, ...rise(inP, 60) }}>{e.name}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          {[`${e.sets} × ${e.reps}`, `Rest ${secs(e.rest)}`, e.rpe].map((c, k) => <div key={c} style={rise(sp(t, 6 + k * 4))}><Chip hot={k === 0}>{c}</Chip></div>)}
        </div>
      </div>
      <GifCard id={e.exerciseId} t={t} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1300, ...rise(sp(t, 14)) }}>
        <div style={{ ...D, fontSize: 30, color: B.success, letterSpacing: "0.08em" }}>Target · {TARGET[e.target] || e.target}</div>
        <div style={{ ...UIR, fontSize: 38, color: B.cream, marginTop: 8, lineHeight: 1.2 }}>{CUES[i]}</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1470, display: "flex", gap: 8 }}>
        {Array.from({ length: N_EX }, (_, k) => <div key={k} style={{ flex: 1, height: 8, borderRadius: 9, background: k < i ? B.lo : k === i ? B.cream : "rgba(242,240,234,.15)" }} />)}
      </div>
    </div>
  );
}

function Finisher({ f }) {
  const t = f - FIN;
  if (t < -4 || f > OUTRO + 4) return null;
  const out = interpolate(f, [OUTRO - 5, OUTRO + 2], [1, 0], clamp);
  return (
    <div style={{ opacity: out }}>
      <Header f={f} right="Finisher" />
      <div style={{ position: "absolute", left: 70, top: 330 }}>
        <div style={{ ...D, fontSize: 140, color: B.danger, ...pop(sp(t, 0, 10, 260), 1.4), transformOrigin: "0% 50%" }}>Push-ups</div>
        <div style={{ ...D, fontSize: 80, color: B.cream, marginTop: 6, ...rise(sp(t, 8)) }}>to failure · 1 set</div>
      </div>
      <GifCard id="0662" t={t} reps={false} />
    </div>
  );
}

function Outro({ f }) {
  const t = f - OUTRO;
  if (t < -2) return null;
  const cta = sp(t, 26, 9, 260);
  return (
    <>
      <Header f={f} right="" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 330 }}>
        <div style={{ ...D, fontSize: 120, color: B.cream, ...rise(sp(t, 0, 12, 240), 60) }}>Want a plan</div>
        <div style={{ ...D, fontSize: 120, color: B.lo, ...rise(sp(t, 6, 12, 240), 60) }}>built for you?</div>
        <div style={{ marginTop: 34, display: "inline-block", padding: "20px 34px", borderRadius: 22, background: B.cream, transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, t - 50) / 5)))})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
          <div style={{ ...D, fontSize: 30, color: B.primary, letterSpacing: "0.06em" }}>Comment 👇</div>
          <div style={{ ...D, fontSize: 104, color: B.ink }}>“PLAN”</div>
        </div>
      </div>
      <CoachStage f={t} x={760} w={460} top={820} flexAt={34} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1480, ...UI, fontSize: 38, color: "rgba(242,240,234,.85)", ...rise(sp(t, 40)) }}>Free 4-week plan · Darebni AI on the App Store</div>
    </>
  );
}

export const Main = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const cut = [EX0, ...Array.from({ length: N_EX }, (_, i) => EX0 + (i + 1) * EX_LEN), OUTRO].map((c) => interpolate(f, [c - 2, c, c + 6], [0, 0.35, 0], clamp)).reduce((a, b) => a + b, 0);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 62%, rgba(91,78,229,.35), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {f < EX0 + 4 && <Intro f={f} />}
      {W.exercises.map((_, i) => <Exercise key={i} f={f} i={i} />)}
      <Finisher f={f} />
      <Outro f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: cut, mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.04} />
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
    </AbsoluteFill>
  );
};
