// Darebni AI brand commercial (9:16, 33 s). No app UI. The one idea: "Darebni" is Arabic for "train me" (the brand's
// own line: "دربني — train me"), so the spot is a wish answered. It knocks down the excuses, says "Stop guessing.",
// goes silent on the word دربني, and lands DAREBNI on the track's re-entry; the payoff is "Start training."
// Picture is cut to "Epical Drums 02" (Grigoriy Nuzhny, 120.02 BPM = 15 frames a beat) started at 43.0 s, so its
// near-silent gap falls at 13.3-15.0 s and its slam on frame 450. B-roll: twelve exercises from the supplied library
// (public/lib/, kept out of git), graded to monochrome violet, with their badges and chips pushed out of frame.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, random } from "remotion";
import { useFonts, clamp, Grain, shake } from "./fx.jsx";
import { B, D, UI } from "./Main.jsx";

const FPS = 30;
export const CM = { FPS, DURATION: 990, HOOK2: 66, EXC: [120, 180, 240], STOP: 300, BLACK: 390, WORD: 400, HIT: 450,
  LINES: [510, 540, 570, 600, 630], COACH: 660, AMB: 750, LOGO: 840 };
const T = CM;
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const win = (f, a, b, fi = 4, fo = 4) => interpolate(f, [a - Math.max(fi, 0.01), a, b - Math.max(fo, 0.01), b], [0, 1, 1, 0], clamp);
const rise = (p, d = 50) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const W = { ...D, color: B.cream, textShadow: "0 10px 50px rgba(0,0,0,.7)" };

// one graded shot: the clip as monochrome violet with a slow push-in. full = 9:16 full bleed (zoomed so the clip's
// badge in the top-right corner is off frame); band = a 1080x640 letterbox of one row of the bench clip.
function Shot({ f, at, dur, src, from, zoom = 1.4, origin = "30% 76%", band, row = 1, dim = 0.62, rate = 1 }) {
  if (f < at - 1 || f > at + dur + 1) return null;
  const k = (f - at) / dur, push = 1 + 0.06 * k;
  const grade = { filter: `grayscale(1) contrast(1.3) brightness(${dim})` };
  const video = (
    <Sequence from={at} durationInFrames={dur} layout="none">
      <OffthreadVideo src={staticFile(src)} startFrom={from} playbackRate={rate} muted
        style={band ? { position: "absolute", left: 0, top: -row * 640, width: 1080, height: 1920, ...grade } : { position: "absolute", inset: 0, width: 1080, height: 1920, ...grade }} />
    </Sequence>
  );
  if (band) {
    return (
      <div style={{ position: "absolute", left: 0, top: 660, width: 1080, height: 560, overflow: "hidden", transform: `scale(${push})` }}>
        {video}
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(91,78,229,.55), rgba(7,7,26,.15) 60%, rgba(91,78,229,.35))", mixBlendMode: "color" }} />
        {/* hide the row's badge on the right */}
        <div style={{ position: "absolute", right: 0, top: 0, width: 300, height: 640, background: "linear-gradient(90deg, transparent, #07071A 45%)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 220, height: 640, background: "linear-gradient(270deg, transparent, #07071A 70%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 90, background: "linear-gradient(180deg, #07071A, transparent)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: "linear-gradient(0deg, #07071A, transparent)" }} />
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom * push})`, transformOrigin: origin }}>
      {video}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(91,78,229,.6), rgba(67,56,202,.35))", mixBlendMode: "color" }} />
    </AbsoluteFill>
  );
}
const LIB = { zoom: 1.3, origin: "50% 95%" };
const SHOTS = [
  { at: 0, dur: 120, n: 295, s: 0, dim: 0.45, ...LIB },                   // hook: hands taking the bar
  { at: 120, dur: 60, n: 666, s: 8.2, dim: 0.38, ...LIB },                // excuse 1: squat, side close-up
  { at: 180, dur: 60, n: 293, s: 3.2, dim: 0.4, ...LIB },                 // excuse 2: dumbbell shoulder press, close
  { at: 240, dur: 60, n: 667, s: 0.3, dim: 0.4, ...LIB },                 // excuse 3: seated cable row
  { at: 300, dur: 80, n: 305, s: 5.5, dim: 0.36, rate: 0.5, ...LIB },     // stop guessing: chest press machine, half speed
  { at: T.LINES[0], dur: 30, n: 293, s: 13, ...LIB },                     // a plan built for you: incline dumbbell press
  { at: T.LINES[1], dur: 30, n: 389, s: 0.3, ...LIB },                    // weights, sets, reps: a hand takes the dumbbell
  { at: T.LINES[2], dur: 30, n: 305, s: 1.2, ...LIB },                    // every set, tracked: chest press machine
  { at: T.LINES[3], dur: 30, n: 470, s: 17, zoom: 2, origin: "50% 55%" },   // followed up weekly: pull-up (chips above, shorts below the crop)
  { at: T.LINES[4], dur: 30, n: 538, s: 21.6, ...LIB },                   // every PR, saved: deadlift lockout
  { at: T.COACH, dur: 90, n: 295, s: 24, dim: 0.5, rate: 0.6, ...LIB },   // your AI coach is here: incline barbell press, slow
  { at: T.AMB, dur: 90, n: 389, s: 45.2, dim: 0.55, rate: 0.7, zoom: 1.45, origin: "50% 95%" }, // built for the ones who show up: dumbbell press
];
const Vignette = ({ k = 0.85 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(7,7,26,${k}) 100%)` }} />;

function Hook({ f }) {
  if (f > T.EXC[0] + 4) return null;
  const o = win(f, 0, T.EXC[0], 0, 6), old = interpolate(f, [T.HOOK2 - 4, T.HOOK2 + 6], [1, 0.32], clamp);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 600, opacity: o }}>
      <div style={{ opacity: old }}>
        <div style={{ ...W, fontSize: 120, ...rise(sp(f, 2, 14, 200)) }}>You don’t need</div>
        <div style={{ ...W, fontSize: 120, ...rise(sp(f, 10, 14, 200)) }}>more motivation.</div>
      </div>
      <div style={{ ...W, fontSize: 128, whiteSpace: "nowrap", color: B.lo, marginTop: 30, ...rise(sp(f, T.HOOK2, 11, 260), 70) }}>You need a plan.</div>
    </div>
  );
}

const EXCUSES = ["“I’ll start Monday.”", "“I don’t know what to do.”", "“I’m not seeing results.”"];
function Excuse({ f, i }) {
  const a = T.EXC[i], b = a + 60;
  if (f < a - 4 || f > b + 2) return null;
  const strike = interpolate(f, [a + 28, a + 36], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 760, opacity: win(f, a, b, 2, 6) }}>
      <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.14em", ...rise(sp(f, a)) }}>Excuse {i + 1}</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 14 }}>
        <div style={{ ...W, fontSize: 76, whiteSpace: "nowrap", opacity: 1 - 0.45 * strike, ...rise(sp(f, a + 2, 13, 240), 40) }}>{EXCUSES[i]}</div>
        <div style={{ position: "absolute", left: -10, top: "48%", height: 14, width: `calc(${strike * 100}% + 20px)`, background: B.danger, borderRadius: 7, boxShadow: "0 0 30px rgba(251,113,133,.8)", transform: "rotate(-2deg)" }} />
      </div>
    </div>
  );
}

function Stop({ f }) {
  if (f < T.STOP - 2 || f > T.BLACK + 2) return null;
  const o = win(f, T.STOP, T.BLACK, 2, 14);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 740, opacity: o, transform: `scale(${1 + 0.05 * (f - T.STOP) / 90})`, transformOrigin: "0% 50%" }}>
      <div style={{ ...W, fontSize: 200, ...rise(sp(f, T.STOP, 12, 240), 60) }}>Stop</div>
      <div style={{ ...W, fontSize: 200, color: B.lo, ...rise(sp(f, T.STOP + 8, 12, 240), 60) }}>guessing.</div>
    </div>
  );
}

// the silence: the Arabic word alone, then the slam
function Word({ f }) {
  if (f < T.WORD - 2 || f > T.LINES[0] + 4) return null;
  const inn = interpolate(f, [T.WORD, T.WORD + 30], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 2 });
  const hit = f >= T.HIT, h = sp(f, T.HIT, 9, 300);
  const [sx, sy] = shake(f, T.HIT, 26, 5);
  const out = interpolate(f, [T.LINES[0] - 6, T.LINES[0]], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: hit ? 560 : 700, textAlign: "center", direction: "rtl",
        fontFamily: "Tajawal", fontWeight: 800, fontSize: hit ? 150 : 280, color: hit ? B.lo : B.cream, lineHeight: 1.2,
        opacity: inn, filter: `blur(${(1 - inn) * 18}px)`, textShadow: "0 0 60px rgba(139,128,255,.6)" }}>دربني</div>
      {!hit && <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", ...UI, fontSize: 44, color: B.xlo, ...rise(sp(f, T.WORD + 18)) }}>“train me”</div>}
      {hit && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center" }}>
          <div style={{ ...W, fontSize: 250, letterSpacing: "0.02em", transform: `scale(${interpolate(h, [0, 1], [1.8, 1])})`, opacity: Math.min(1, h * 3) }}>Darebni</div>
          <div style={{ ...UI, fontSize: 44, color: B.xlo, marginTop: 18, ...rise(sp(f, T.HIT + 10)) }}>Arabic for “train me”.</div>
        </div>
      )}
    </AbsoluteFill>
  );
}

const LINES = ["A plan built for you.", "Weights. Sets. Reps.", "Every set, tracked.", "Followed up weekly.", "Every PR, saved."];
function Line({ f, i }) {
  const a = T.LINES[i], b = a + 30;
  if (f < a - 1 || f > b + 1) return null;
  const p = sp(f, a, 11, 320);
  const top = i % 2 ? 1250 : 400;   // letterbox shots (odd) keep the type under the band, full shots above
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, opacity: win(f, a, b, 0, 3) }}>
      <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.14em" }}>{String(i + 1).padStart(2, "0")} / 05</div>
      <div style={{ ...W, fontSize: 96, whiteSpace: "nowrap", marginTop: 10, transform: `translateX(${(1 - Math.min(1, p)) * -90}px)`, opacity: Math.min(1, p * 2.5) }}>{LINES[i]}</div>
    </div>
  );
}

function Coach({ f }) {
  if (f < T.COACH - 2 || f > T.AMB + 2) return null;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1080, opacity: win(f, T.COACH, T.AMB, 2, 6) }}>
      <div style={{ ...W, fontSize: 140, ...rise(sp(f, T.COACH + 4, 12, 220), 60) }}>Your AI coach</div>
      <div style={{ ...W, fontSize: 140, color: B.lo, ...rise(sp(f, T.COACH + 12, 12, 220), 60) }}>is here.</div>
    </div>
  );
}

// the ambassador slot. PERSON = a cut-out PNG in public/ (the new face, once supplied) rises out of the dark; while it is
// null the push-up shot under it carries the line.
const PERSON = null;
function Ambassador({ f }) {
  if (f < T.AMB - 2 || f > T.LOGO + 2) return null;
  const t = f - T.AMB, up = sp(f, T.AMB, 16, 120), o = win(f, T.AMB, T.LOGO, 4, 8);
  const w = 900, h = w * 1170 / 985;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {PERSON && <div style={{ position: "absolute", left: 90, top: 700, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,78,229,.6), transparent 65%)" }} />}
      {PERSON && <Img src={staticFile(PERSON)} style={{ position: "absolute", left: 540 - w / 2, top: 560, width: w, height: h, transform: `translateY(${(1 - Math.min(1, up)) * 300}px) scale(${1.02 + 0.03 * t / 90})`, transformOrigin: "50% 100%",
        filter: "drop-shadow(0 0 3px rgba(184,176,255,.9)) drop-shadow(0 0 40px rgba(91,78,229,.8)) contrast(1.1) brightness(.95)" }} />}
      {PERSON && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,7,26,0) 60%, rgba(7,7,26,.95) 92%)" }} />}
      <div style={{ position: "absolute", left: 70, right: 70, top: PERSON ? 300 : 1120 }}>
        <div style={{ ...W, fontSize: 120, ...rise(sp(f, T.AMB + 8, 12, 220), 60) }}>Built for the ones</div>
        <div style={{ ...W, fontSize: 120, color: B.lo, ...rise(sp(f, T.AMB + 16, 12, 220), 60) }}>who show up.</div>
      </div>
    </AbsoluteFill>
  );
}

function Logo({ f }) {
  if (f < T.LOGO) return null;
  const t = f - T.LOGO, ic = sp(f, T.LOGO + 4, 11, 200), word = sp(f, T.LOGO + 16, 13, 200);
  const glow = 0.5 + 0.2 * Math.sin(t / 10);
  return (
    <AbsoluteFill style={{ background: B.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(91,78,229,${glow}), transparent 55%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${1 + 0.03 * t / 150})` }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 260, height: 260, borderRadius: 60, boxShadow: "0 0 120px rgba(91,78,229,.8)",
          transform: `scale(${interpolate(ic, [0, 1], [0.4, 1])})`, opacity: Math.min(1, ic * 2) }} />
        <div style={{ ...W, fontSize: 150, letterSpacing: "0.04em", marginTop: 50, ...rise(word, 40) }}>Darebni <span style={{ color: B.lo }}>AI</span></div>
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div style={{ ...W, fontSize: 84, color: "rgba(242,240,234,.55)", ...rise(sp(f, T.LOGO + 34)) }}>Stop guessing.</div>
          <div style={{ ...W, fontSize: 84, color: B.lo, ...rise(sp(f, T.LOGO + 44)) }}>Start training.</div>
        </div>
        <div style={{ marginTop: 56, padding: "18px 40px", borderRadius: 999, border: "2px solid rgba(242,240,234,.45)", ...UI, fontSize: 42, color: B.cream, ...rise(sp(f, T.LOGO + 60)) }}>Download on the App Store</div>
      </div>
    </AbsoluteFill>
  );
}

export const Commercial = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["Tajawal", "Tajawal-ExtraBold.ttf", { weight: "800" }]]);
  const flash = interpolate(f, [T.HIT - 1, T.HIT, T.HIT + 10], [0, 0.9, 0], clamp) + interpolate(f, [T.LOGO - 1, T.LOGO, T.LOGO + 8], [0, 0.4, 0], clamp);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      {/* b-roll from the exercise library (public/lib/t<n>.mp4 = "Treinos (n).mp4", kept out of git). Each shot is
          zoomed from the bottom (origin 50% 95%) so the clip's top 22 %, where its ✓/✕ badges and muscle chips sit,
          is off frame; segments stop before the clips' closing cards, and avoid the shorts/mats that carry the source's
          branding. */}
      {SHOTS.map((x, k) => <Shot key={k} f={f} {...x} src={`lib/t${x.n}.mp4`} from={Math.round(x.s * 30)} />)}
      <Vignette />
      <Hook f={f} />
      {EXCUSES.map((_, i) => <Excuse key={i} f={f} i={i} />)}
      <Stop f={f} />
      <AbsoluteFill style={{ background: B.ink, opacity: interpolate(f, [T.BLACK - 10, T.BLACK], [0, 1], clamp) * (f < T.LINES[0] ? 1 : 0) }} />
      <Word f={f} />
      {LINES.map((_, i) => <Line key={i} f={f} i={i} />)}
      <Coach f={f} />
      <Ambassador f={f} />
      <Logo f={f} />
      <AbsoluteFill style={{ background: B.xlo, opacity: flash, mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.05} />
      <Audio src={staticFile(music ? "commercial.wav" : "commercial-sfx.wav")} />
    </AbsoluteFill>
  );
};
