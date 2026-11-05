// Darebni AI "Delts + arms" as ONE page: the whole workout builds on a single screen. The ambassador's arms-wide photo and
// the title open full size, shrink into the page header, then the 7 exercises and the finisher drop in one per beat
// (each row: its GIF demo looping, sets × reps, rest, RPE; gold brackets join the supersets), the finished page holds so
// people can screenshot or save it, then the shared end card. Plan: src/deltsarms_workout.json (same as DeltsArms.jsx).
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import W from "./deltsarms_workout.json";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Header, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

// 30 fps, 120 BPM (a beat = 15 frames)
export const DP = { BEAT: 15, SHRINK: 60, ROW0: 90, HOLD: 240 };
const ROWS = [...W.exercises.map((e) => ({ ...e })), { exerciseId: "0297", name: "Concentration Curl", superset: "", sets: 1, reps: "failure", rest: "each arm", rpe: "Finisher", fin: true }];
DP.BUILT = DP.ROW0 + ROWS.length * DP.BEAT;          // 210: the last row lands
DP.OUTRO = DP.BUILT + DP.HOLD;                       // 450: the page has held for 8 s
DP.DURATION = DP.OUTRO + END_LEN;                    // 705 = 23.5 s
const { BEAT, SHRINK, ROW0, OUTRO } = DP;
const GOLD = "#FFC94A";
const sp = (t, at = 0, d = 12, s = 220) => spring({ frame: t - at, fps: 30, config: { damping: d, stiffness: s } });
const lerp = (a, b, p) => a + (b - a) * p;

const TOP = 604, RH = 104, GAP = 8;      // the list: first row top, row height, gap (8 rows end at ~1500, inside the safe zone)
const rowY = (i) => TOP + i * (RH + GAP);

function Row({ f, i, e }) {
  const at = ROW0 + i * BEAT, t = f - at, p = sp(t, 0, 12, 260);
  if (t < 0) return null;
  const swap = Math.floor(Math.max(0, f - at) / 15) % 2;                 // the demo flips pose on every beat
  const glow = Math.max(0, 1 - t / 14);
  const left = e.superset ? 128 : 70;
  const chips = e.fin ? ["To failure", "each arm"] : [`${e.sets} × ${e.reps}`, e.rest.replace("No rest → ", "→ "), e.rpe];
  return (
    <div style={{ position: "absolute", left, right: 70, top: rowY(i), height: RH, borderRadius: 24, display: "flex", alignItems: "center", gap: 22, padding: "0 20px 0 8px",
      background: e.fin ? "rgba(251,113,133,.14)" : "rgba(17,17,43,.88)", border: `2px solid ${e.fin ? "rgba(251,113,133,.6)" : `rgba(139,128,255,${0.3 + 0.6 * glow})`}`,
      boxShadow: `0 16px 40px rgba(0,0,0,.35), 0 0 ${40 * glow}px rgba(139,128,255,.7)`,
      opacity: Math.min(1, p * 2), transform: `translateX(${(1 - Math.min(1, p)) * 380}px) scale(${0.9 + 0.1 * Math.min(1, p)})`, transformOrigin: "0% 50%" }}>
      <div style={{ position: "relative", width: 88, height: 88, borderRadius: 16, background: "#fff", overflow: "hidden", flex: "none" }}>
        <Img src={staticFile(`gifs/${e.exerciseId}/${swap ? "b" : "a"}.png`)} style={{ width: 88, height: 88 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...D, fontSize: 42, color: e.fin ? B.danger : B.cream, whiteSpace: "nowrap" }}>{e.fin ? "Finisher · " : ""}{e.name}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {chips.map((c, k) => (
            <div key={c} style={{ padding: "4px 12px", borderRadius: 10, background: k === 0 ? B.primary : "rgba(139,128,255,.14)", border: `1.5px solid ${k === 0 ? B.lo : "rgba(139,128,255,.35)"}`,
              ...D, fontSize: 25, color: B.cream, whiteSpace: "nowrap", opacity: Math.min(1, sp(t, 4 + k * 2) * 2) }}>{c}</div>
          ))}
        </div>
      </div>
      <div style={{ ...D, fontSize: 30, color: "rgba(242,240,234,.35)", flex: "none" }}>{String(i + 1).padStart(2, "0")}</div>
    </div>
  );
}
// a gold bracket and letter joining a superset's two rows, drawn once the second row lands
function Bracket({ f, i, letter }) {
  const at = ROW0 + (i + 1) * BEAT + 4, p = Math.min(1, sp(f, at, 14, 200));
  if (f < at) return null;
  const y0 = rowY(i) + 18, y1 = rowY(i + 1) + RH - 18, h = (y1 - y0) * p;
  return (
    <>
      <div style={{ position: "absolute", left: 92, top: y0, width: 22, height: h, borderLeft: `5px solid ${GOLD}`, borderTop: `5px solid ${GOLD}`, borderBottom: p > 0.95 ? `5px solid ${GOLD}` : "none", borderRadius: "10px 0 0 10px" }} />
      <div style={{ position: "absolute", left: 56, top: (y0 + y1) / 2 - 24, width: 48, height: 48, borderRadius: 24, background: GOLD, display: "grid", placeItems: "center", ...D, fontSize: 32, color: B.ink, paddingTop: 2, transform: `scale(${p})` }}>{letter}</div>
    </>
  );
}

function Page({ f }) {
  // the photo + title open big, then shrink into the header
  const k = interpolate(sp(f, SHRINK, 15, 120), [0, 1], [0, 1]);
  const pw = lerp(1000, 450, k), ph = pw * (1040 / 1600), px = lerp(40, 580, k), py = lerp(700, 300, k);
  const tSize = lerp(170, 112, k), tTop = lerp(330, 330, k);
  const intro = sp(f, 2, 14, 140), save = sp(f, DP.BUILT + 18, 9, 260);
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
      {ROWS.map((e, i) => <Row key={i} f={f} i={i} e={e} />)}
      <Bracket f={f} i={3} letter="A" />
      <Bracket f={f} i={5} letter="B" />
      {/* once the page is built: a sticker telling people to save it */}
      <div style={{ position: "absolute", right: 70, top: 535, transform: `rotate(-5deg) scale(${interpolate(save, [0, 1], [2.2, 1]) * (1 + 0.03 * Math.sin(Math.max(0, f - DP.BUILT - 30) / 5))})`, opacity: Math.min(1, save * 3),
        padding: "10px 22px", borderRadius: 14, background: GOLD, border: `4px solid ${B.ink}`, ...D, fontSize: 34, color: B.ink, boxShadow: "0 16px 40px rgba(0,0,0,.45)" }}>Save it for arm day</div>
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
