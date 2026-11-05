// Darebni AI "Delts + arms" reel, the chest + back format (ChestBack.jsx) with src/deltsarms_workout.json (the app's plan
// format: sets, reps, rest, RPE). Golden Era style: shoulders first with his signature Arnold press, then arms in
// biceps/triceps supersets (A1/A2, B1/B2), finishing on concentration curls. Hook: the ambassador's arms-wide stage shot
// (public/ambassador-arnold2.png, a B&W cut-out kept out of git, faded out at the cropped trunks); each exercise plays its
// demo from the app's GIF repo (GIFURLSOM, frames 0 and 6 in public/gifs/<id>/) for two reps beside the real numbers.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import W from "./deltsarms_workout.json";
import { FPS, EX0, EX_LEN, N_EX, FIN, OUTRO } from "./timing.js";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Header, Chip, Ambassador, Outro } from "./Main.jsx";

const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.3) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const CUES = ["His signature move: palms in, rotate out as you press", "Lead with your elbows, stop at shoulder height", "Chest down, sweep the weights out wide",
  "Elbows pinned to your sides, no swinging", "Elbows point up, lower to your forehead", "Arms hang back for a full stretch",
  "Split the rope at the bottom and squeeze"];
const TARGET = { delts: "Shoulders", biceps: "Biceps", triceps: "Triceps" };
// Each demo GIF is two clean poses (start, top) joined by crossfades. We keep only those two and play one crisp rep
// per second, landing the top on the beat: hold the start, snap up in 5 frames, hold the top, snap back.
// Rep k peaks at t = 15 + 30k (on the 120 BPM grid, since every card starts on a beat).
const repTop = (t) => { const c = ((t % 30) + 30) % 30; return c < 10 ? 0 : c < 15 ? (c - 10) / 5 : c < 25 ? 1 : 1 - (c - 25) / 5; };
const ease = (x) => x * x * (3 - 2 * x);
function GifCard({ id, t, top = 640, reps = true }) {
  const p = Math.min(1, sp(t, 2, 13, 220)), k = ease(repTop(Math.max(0, t)));
  const hit = Math.max(0, 1 - Math.abs((((t % 30) + 30) % 30) - 15) / 4);   // a little punch as the top lands
  const n = t < 15 ? 0 : Math.min(2, Math.floor((t - 15) / 30) + 1);
  return (
    <div style={{ position: "absolute", left: 70, top, width: 870, height: 620, borderRadius: 40, background: "#fff", overflow: "hidden",
      boxShadow: `0 40px 100px rgba(0,0,0,.55), 0 0 0 4px rgba(139,128,255,${0.55 + 0.4 * hit}), 0 0 ${90 + 50 * hit}px rgba(91,78,229,.4)`, ...pop(p, 0.9) }}>
      <div style={{ position: "absolute", left: 135, top: 10, width: 600, height: 600, transform: `scale(${1 + 0.025 * hit})` }}>
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

function Intro({ f }) {
  const out = interpolate(f, [EX0 - 6, EX0 + 2], [1, 0], clamp);
  const stats = [`${W.estimatedMinutes} min`, `${W.totalSets} sets`, W.level, W.environment];
  return (
    <div style={{ opacity: out }}>
      <Header f={f} right="Today's workout" />
      <div style={{ position: "absolute", left: 70, top: 310 }}>
        <div style={{ ...D, fontSize: 170, color: B.cream, whiteSpace: "nowrap", ...pop(sp(f, 4, 10, 260), 1.4), transformOrigin: "0% 50%" }}>Delts <span style={{ color: B.lo }}>+ arms</span></div>
        <div style={{ ...UI, fontSize: 40, color: "rgba(242,240,234,.8)", marginTop: 14, ...rise(sp(f, 14)) }}>{W.focus}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap", width: 940 }}>
          {stats.map((s, i) => <div key={s} style={rise(sp(f, 22 + i * 4))}><Chip hot={i === 0}>{s}</Chip></div>)}
        </div>
      </div>
      <Ambassador f={f} x={540} top={650} w={1000} src="ambassador-arnold2.png" aspect={1040 / 1600} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1340, ...UIR, fontSize: 32, color: "rgba(242,240,234,.8)", ...rise(sp(f, 40)) }}>
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
      <Header f={f} right={`Delts + arms · ${i + 1}/${N_EX}`} />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 1920 - 604 }}>
        {e.superset && <div style={{ ...D, fontSize: 34, color: "#FFC94A", letterSpacing: "0.08em", marginBottom: 6, ...rise(inP, 30) }}>Superset {e.superset[0]} · {e.superset[1]}/2</div>}
        <div style={{ ...D, fontSize: 96, color: B.cream, ...rise(inP, 60) }}>{e.name}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          {[`${e.sets} × ${e.reps}`, e.rest, e.rpe].map((c, k) => <div key={c} style={rise(sp(t, 6 + k * 4))}><Chip hot={k === 0}>{c}</Chip></div>)}
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
      <div style={{ position: "absolute", left: 70, bottom: 1920 - 604 }}>
        <div style={{ ...D, fontSize: 110, color: B.danger, whiteSpace: "nowrap", ...pop(sp(t, 0, 10, 260), 1.4), transformOrigin: "0% 50%" }}>Concentration curls</div>
        <div style={{ ...D, fontSize: 80, color: B.cream, marginTop: 6, ...rise(sp(t, 8)) }}>to failure · each arm</div>
      </div>
      <GifCard id="0297" t={t} reps={false} />
    </div>
  );
}

export const DeltsArms = ({ music = true }) => {
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
      <Audio src={staticFile(music ? "deltsarms.wav" : "deltsarms-sfx.wav")} />
    </AbsoluteFill>
  );
};
