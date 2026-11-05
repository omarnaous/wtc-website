// Darebni AI "Delts + arms" as ONE page: the whole workout builds on a single screen. The ambassador's arms-wide photo and
// the title open full size, shrink into the page header, then a 3 x 3 grid of square tiles pops in one per beat: the 7
// exercises and the finisher (each tile: a big GIF demo flipping pose on the beat, the name, sets × reps · rest · RPE;
// gold A1/A2/B1/B2 tags mark the supersets) and a "Save it" tile; the finished page holds so people can screenshot or
// save it, then the shared end card. Plan: src/deltsarms_workout.json (same as DeltsArms.jsx).
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import W from "./deltsarms_workout.json";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Header, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

// 30 fps, 120 BPM (a beat = 15 frames)
export const DP = { BEAT: 15, SHRINK: 60, ROW0: 90, HOLD: 240 };
const SHORT = { "Dumbbell Lateral Raise": "Lateral Raise", "Incline Dumbbell Curl": "Incline Curl" };
const ROWS = [...W.exercises.map((e) => ({ ...e, name: SHORT[e.name] || e.name })), { exerciseId: "0297", name: "Concentration Curl", superset: "", sets: 1, reps: "failure", rest: "each arm", rpe: "", fin: true }, { save: true }];
DP.BUILT = DP.ROW0 + ROWS.length * DP.BEAT;          // 225: the ninth tile lands
DP.OUTRO = DP.BUILT + DP.HOLD;                       // 450: the page has held for 8 s
DP.DURATION = DP.OUTRO + END_LEN;                    // 720 = 24 s
const { BEAT, SHRINK, ROW0, OUTRO } = DP;
const GOLD = "#FFC94A";
const sp = (t, at = 0, d = 12, s = 220) => spring({ frame: t - at, fps: 30, config: { damping: d, stiffness: s } });
const lerp = (a, b, p) => a + (b - a) * p;

// the grid: 3 x 3 tiles spread over the rest of the page, from under the header to y 1678 (the profile-grid crop's edge)
const TS = 300, TH = 336, TG = 24, GX = (1080 - (3 * TS + 2 * TG)) / 2, GY = 610, GIF = 236;
function Tile({ f, i, e }) {
  const at = ROW0 + i * BEAT, t = f - at, p = sp(t, 0, 11, 260);
  if (t < 0) return null;
  const x = GX + (i % 3) * (TS + TG), y = GY + Math.floor(i / 3) * (TH + TG);
  const glow = Math.max(0, 1 - t / 14), pose = Math.floor(Math.max(0, t) / 15) % 2;   // the demo flips pose on every beat
  const box = { position: "absolute", left: x, top: y, width: TS, height: TH, borderRadius: 26, overflow: "hidden",
    opacity: Math.min(1, p * 2.5), transform: `scale(${0.55 + 0.45 * Math.min(1.05, p)}) rotate(${(1 - Math.min(1, p)) * (i % 2 ? 6 : -6)}deg)`,
    boxShadow: `0 18px 44px rgba(0,0,0,.45), 0 0 ${46 * glow}px rgba(139,128,255,.8)` };
  if (e.save) return (
    <div style={{ ...box, background: GOLD, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px", border: `4px solid ${B.ink}` }}>
      <svg width="54" height="64" viewBox="0 0 24 28"><path d="M3 2h18v24l-9-6-9 6z" fill={B.ink} /></svg>
      <div style={{ ...D, fontSize: 64, color: B.ink, marginTop: 16 }}>Save it</div>
      <div style={{ ...D, fontSize: 40, color: B.ink, opacity: 0.75 }}>for arm day</div>
    </div>
  );
  const meta = e.fin ? "To failure · each arm" : `${e.sets} × ${e.reps} · ${e.rest.startsWith("No rest") ? "no rest" : e.rest.replace("Rest ", "")} · ${e.rpe}`;
  return (
    <div style={{ ...box, background: "rgba(17,17,43,.95)", border: `2px solid ${e.fin ? "rgba(251,113,133,.7)" : `rgba(139,128,255,${0.35 + 0.6 * glow})`}` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: TS, height: GIF, background: "#fff" }}>
        <Img src={staticFile(`gifs/${e.exerciseId}/${pose ? "b" : "a"}.png`)} style={{ position: "absolute", left: (TS - GIF) / 2, top: 0, width: GIF, height: GIF }} />
      </div>
      <div style={{ position: "absolute", left: 12, top: 12, padding: "3px 10px", borderRadius: 9, background: e.superset ? GOLD : e.fin ? B.danger : B.ink, ...D, fontSize: 24, color: e.superset || e.fin ? B.ink : B.cream }}>
        {e.superset ? `${e.superset} · superset` : e.fin ? "Finisher" : String(i + 1).padStart(2, "0")}
      </div>
      <div style={{ position: "absolute", left: 16, right: 12, top: GIF + 14 }}>
        <div style={{ ...D, fontSize: e.name.length > 14 ? 31 : 38, color: e.fin ? B.danger : B.cream, whiteSpace: "nowrap", lineHeight: e.name.length > 14 ? 1.2 : 0.92 }}>{e.name}</div>
        <div style={{ ...D, fontSize: 25, color: B.xlo, marginTop: 8, whiteSpace: "nowrap", letterSpacing: "0.02em", opacity: Math.min(1, sp(t, 6) * 2) }}>{meta}</div>
      </div>
    </div>
  );
}

function Page({ f }) {
  // the photo + title open big, then shrink into the header
  const k = interpolate(sp(f, SHRINK, 15, 120), [0, 1], [0, 1]);
  const pw = lerp(1000, 450, k), ph = pw * (1040 / 1600), px = lerp(40, 580, k), py = lerp(700, 300, k);
  const tSize = lerp(170, 112, k), tTop = lerp(330, 330, k);
  const intro = sp(f, 2, 14, 140);
  const stats = [`${W.estimatedMinutes} min`, `${W.totalSets + 1} sets`, "Arnold style"];
  return (
    <>
      <Header f={f} right="Today's workout" />
      <div style={{ position: "absolute", left: px + pw * 0.1, top: py + ph * 0.25, width: pw * 0.8, height: ph * 0.7, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,78,229,.55), transparent 62%)" }} />
      <Img src={staticFile("ambassador-arnold2.png")} style={{ position: "absolute", left: px, top: py, width: pw, height: ph, opacity: Math.min(1, intro * 1.5), transform: `translateY(${(1 - Math.min(1, intro)) * 200}px)`,
        filter: "drop-shadow(0 0 2px rgba(184,176,255,.9)) drop-shadow(0 0 26px rgba(91,78,229,.7)) contrast(1.06)" }} />
      <div style={{ position: "absolute", left: 70, top: tTop }}>
        <div style={{ ...D, fontSize: tSize, color: B.cream, lineHeight: 0.88, opacity: Math.min(1, sp(f, 4, 10, 260) * 3) }}>Delts<br /><span style={{ color: B.lo }}>+ arms</span></div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, opacity: Math.min(1, sp(f, 14) * 2) }}>
          {stats.map((s, i) => <div key={s} style={{ padding: "6px 14px", borderRadius: 12, background: i === 0 ? B.primary : "rgba(139,128,255,.14)", border: `2px solid ${i === 0 ? B.lo : "rgba(139,128,255,.35)"}`, ...D, fontSize: 30, color: B.cream }}>{s}</div>)}
        </div>
      </div>
      {ROWS.map((e, i) => <Tile key={i} f={f} i={i} e={e} />)}
    </>
  );
}

export const DeltsArmsPage = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const out = interpolate(f, [OUTRO - 6, OUTRO], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 62%, rgba(91,78,229,.35), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {f < OUTRO + 2 && <div style={{ position: "absolute", inset: 0, opacity: out }}><Page f={f} /></div>}
      {f >= OUTRO - 2 && <Outro f={f} start={OUTRO} />}
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [OUTRO - 2, OUTRO, OUTRO + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.04} />
      <Audio src={staticFile(music ? "deltsarmspage.wav" : "deltsarmspage-sfx.wav")} />
    </AbsoluteFill>
  );
};
