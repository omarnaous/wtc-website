// "Skull crushers: 3 mistakes to fix", a Darebni AI form-check reel. A mannequin on a bench does lying triceps
// extensions; for each mistake the working joints glow red with an ✕ while it does the rep wrong, shift through
// yellow, then glow green with a ✓ doing it right. Then the app's own demo of the exercise (id 0061, its two clean
// poses) with the sets, reps, rest and RPE from push_workout.json, and a comment-PLAN CTA.
// The three fixes are standard coaching cues; the third is the app's own instruction ("aim for a BIG stretch").
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import W from "./push_workout.json";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B } from "./Main.jsx";

export const FC = { FPS: 30, HOOK: 0, M0: 75, M_LEN: 150, WRONG: 66, MORPH: 14, DEMO: 525, CTA: 645, DURATION: 765, REP: 30 };
const { FPS, M0, M_LEN, WRONG, MORPH, DEMO, CTA, REP } = FC;
const RED = [255, 77, 94], YEL = [255, 210, 63], GRN = [61, 220, 151];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const D = { fontFamily: "Cond", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 0.92 };
const UI = { fontFamily: "Barlow", fontWeight: 600 };
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.3) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const dir = (a) => [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k];
const lerp = (a, b, t) => a + (b - a) * t;
// one rep per second: 0 = arms up (lockout), 1 = the bottom; eased so it lingers at both ends
const repR = (t) => 0.5 - 0.5 * Math.cos(((((t % REP) + REP) % REP) / REP) * Math.PI * 2);

const MISTAKES = [
  { view: "top", wrong: "Elbows flare out", right: "Elbows in, point up", why: "Flared elbows shift the load off your triceps" },
  { view: "side", kind: "drift", wrong: "Upper arms drift", right: "Upper arms stay still", why: "Moving the shoulders turns it into a pullover" },
  { view: "side", kind: "range", wrong: "Half reps", right: "Big stretch behind the head", why: "The stretch is where the triceps work hardest" },
];

const GREY = "#8E93A8", GREY_D = "#5D6176", BENCH = "#20202E";
function Glow({ d, c, w }) {
  return (
    <g>
      <path d={d} fill="none" stroke={rgb(c, 0.55)} strokeWidth={w * 3} strokeLinecap="round" strokeLinejoin="round" filter="url(#fcglow)" />
      <path d={d} fill="none" stroke={rgb(c)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
const Plate = ({ p, r = 44 }) => <g><circle cx={p[0]} cy={p[1]} r={r} fill="#15151F" stroke="#3A3A4E" strokeWidth="6" /><circle cx={p[0]} cy={p[1]} r={9} fill="#C8CBD8" /></g>;

// side view: lying on a flat bench, head to the left
function SideFigure({ r, kind, good, c }) {
  const sh = [470, 1052], hip = [700, 1060], head = [402, 1040];
  const ua = good ? 196 : kind === "drift" ? lerp(196, 150, r) : 196;
  const fa = good ? lerp(196, 302, r) : kind === "drift" ? lerp(196, 250, r) : lerp(196, 238, r);
  const el = add(sh, dir(ua), 150), hand = add(el, dir(fa), 140);
  const limb = `M${sh[0]} ${sh[1]} L${el[0]} ${el[1]} L${hand[0]} ${hand[1]}`;
  return (
    <g>
      <rect x="330" y="1088" width="470" height="30" rx="12" fill={BENCH} stroke="#34344A" strokeWidth="4" />
      <rect x="380" y="1118" width="22" height="140" fill={BENCH} /><rect x="730" y="1118" width="22" height="140" fill={BENCH} />
      {/* legs: knees up, feet on the floor */}
      <path d={`M${hip[0]} ${hip[1]} L820 980 L850 1250`} fill="none" stroke={GREY_D} strokeWidth="58" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${sh[0] - 10} ${sh[1]} L${hip[0]} ${hip[1]}`} stroke={GREY} strokeWidth="96" strokeLinecap="round" />
      <path d={`M520 1012 C580 996 640 1000 690 1018`} fill="none" stroke="#A9AEC2" strokeWidth="10" strokeLinecap="round" opacity=".6" />
      <circle cx={head[0]} cy={head[1]} r="46" fill={GREY} />
      {/* far arm, dimmer */}
      <path d={limb} transform="translate(14 -8)" fill="none" stroke={GREY_D} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
      <Plate p={[hand[0] + 16, hand[1] - 10]} r={40} />
      <path d={limb} fill="none" stroke={GREY} strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
      <Glow d={limb} c={c} w={10} />
      <circle cx={el[0]} cy={el[1]} r="14" fill={rgb(c)} filter="url(#fcglow)" /><circle cx={el[0]} cy={el[1]} r="9" fill="#fff" />
      <Plate p={hand} r={46} />
      {/* ghost of the upper arm's start line: shows the drift */}
      {kind === "drift" && <path d={`M${sh[0]} ${sh[1]} L${add(sh, dir(196), 190)[0]} ${add(sh, dir(196), 190)[1]}`} stroke="rgba(255,255,255,.35)" strokeWidth="4" strokeDasharray="10 12" />}
    </g>
  );
}

// top view: looking down at the lifter, head at the top; the bar is held above the face
function TopFigure({ r, good, c }) {
  const cx = 540, shY = 1000;
  const e = good ? lerp(78, 88, r) : lerp(84, 178, r);
  const handY = lerp(880, 790, r), elY = lerp(900, 880, r);
  const arm = (s) => `M${cx + s * 96} ${shY} L${cx + s * e} ${elY} L${cx + s * 74} ${handY}`;
  return (
    <g>
      <rect x="430" y="930" width="220" height="330" rx="40" fill={BENCH} stroke="#34344A" strokeWidth="4" />
      <rect x={cx - 92} y={shY - 20} width="184" height="250" rx="70" fill={GREY} />
      <circle cx={cx} cy={shY - 46} r="50" fill={GREY} />
      <path d={`M${cx - 66} 1160 L${cx - 120} 1260 M${cx + 66} 1160 L${cx + 120} 1260`} stroke={GREY_D} strokeWidth="56" strokeLinecap="round" />
      {[-1, 1].map((s) => <path key={s} d={arm(s)} fill="none" stroke={GREY} strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />)}
      {[-1, 1].map((s) => <Glow key={`g${s}`} d={arm(s)} c={c} w={10} />)}
      {[-1, 1].map((s) => <g key={`e${s}`}><circle cx={cx + s * e} cy={elY} r="14" fill={rgb(c)} filter="url(#fcglow)" /><circle cx={cx + s * e} cy={elY} r="9" fill="#fff" /></g>)}
      <line x1={cx - 230} y1={handY} x2={cx + 230} y2={handY} stroke="#C8CBD8" strokeWidth="12" strokeLinecap="round" />
      <rect x={cx - 270} y={handY - 56} width="34" height="112" rx="10" fill="#15151F" stroke="#3A3A4E" strokeWidth="5" />
      <rect x={cx + 236} y={handY - 56} width="34" height="112" rx="10" fill="#15151F" stroke="#3A3A4E" strokeWidth="5" />
      {/* guides: where the elbows should stay */}
      {[-1, 1].map((s) => <line key={`l${s}`} x1={cx + s * 96} y1={1040} x2={cx + s * 96} y2={800} stroke="rgba(255,255,255,.22)" strokeWidth="4" strokeDasharray="10 12" />)}
    </g>
  );
}

function Badge({ good, p, c }) {
  return (
    <div style={{ position: "absolute", right: 90, top: 640, width: 120, height: 120, borderRadius: 99, display: "grid", placeItems: "center", background: rgb(c, 0.18), border: `5px solid ${rgb(c)}`, boxShadow: `0 0 50px ${rgb(c, 0.7)}`, ...pop(p, 1.6) }}>
      <svg width="58" height="58" viewBox="0 0 24 24">{good
        ? <path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={rgb(c)} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke={rgb(c)} strokeWidth="3.4" strokeLinecap="round" />}</svg>
    </div>
  );
}

function Header({ right }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 236, display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
      <span style={{ ...D, fontSize: 40, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      <span style={{ marginLeft: "auto", ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.06em" }}>{right}</span>
    </div>
  );
}

function Stage({ children, dy = 0, k = 1.12 }) {
  return (
    <>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1220 + dy, height: 70, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,78,229,.45), transparent 70%)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs><filter id="fcglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter></defs>
        <line x1="110" y1={1258 + dy} x2="970" y2={1258 + dy} stroke="rgba(184,176,255,.2)" strokeWidth="4" strokeLinecap="round" />
        <g transform={`translate(0 ${dy}) translate(540 1258) scale(${k}) translate(-540 -1258)`}>{children}</g>
      </svg>
    </>
  );
}

function Hook({ f }) {
  const out = interpolate(f, [M0 - 6, M0 + 2], [1, 0], clamp);
  return (
    <div style={{ opacity: out }}>
      <Header right="Form check" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 330 }}>
        <div style={{ ...D, fontSize: 150, color: B.cream, ...pop(sp(f, 2, 10, 260), 1.4), transformOrigin: "0% 50%" }}>Skull crushers</div>
        <div style={{ ...D, fontSize: 92, color: rgb(RED), marginTop: 14, ...rise(sp(f, 12)) }}>3 mistakes to fix</div>
      </div>
      <Stage><SideFigure r={repR(f)} kind="range" good c={[184, 176, 255]} /></Stage>
    </div>
  );
}

function Mistake({ f, i }) {
  const m = MISTAKES[i], start = M0 + i * M_LEN, t = f - start;
  if (t < -4 || t > M_LEN + 4) return null;
  const k = interpolate(t, [WRONG, WRONG + MORPH], [0, 1], clamp);
  const c = k < 0.5 ? mix(RED, YEL, k * 2) : mix(YEL, GRN, (k - 0.5) * 2);
  const good = t >= WRONG + MORPH / 2;
  const out = interpolate(t, [M_LEN - 5, M_LEN + 2], [1, 0], clamp);
  const r = repR(t - 8);
  const label = good ? m.right : m.wrong, lp = good ? sp(t, WRONG + MORPH / 2, 11, 260) : sp(t, 6, 11, 260);
  return (
    <div style={{ opacity: out }}>
      <Header right={`Mistake ${i + 1}/3`} />
      <div style={{ position: "absolute", left: 70, right: 230, top: 330 }}>
        <div style={{ ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.08em", ...rise(sp(t, 0)) }}>Mistake {i + 1}</div>
        <div key={good ? "g" : "w"} style={{ ...D, fontSize: 104, color: rgb(good ? GRN : RED), marginTop: 12, ...pop(lp, 1.25), transformOrigin: "0% 50%" }}>{label}</div>
        <div style={{ ...UI, fontSize: 34, color: "rgba(242,240,234,.75)", marginTop: 18, ...rise(sp(t, 18)) }}>{m.why}</div>
      </div>
      <Badge good={good} p={good ? sp(t, WRONG + MORPH / 2, 9, 280) : sp(t, 10, 9, 280)} c={c} />
      <Stage>{m.view === "top" ? <TopFigure r={r} good={good} c={c} /> : <SideFigure r={r} kind={m.kind} good={good} c={c} />}</Stage>
    </div>
  );
}

function Demo({ f }) {
  const t = f - DEMO;
  if (t < -4 || f > CTA + 4) return null;
  const e = W.exercises.find((x) => x.exerciseId === "0061");
  const out = interpolate(f, [CTA - 5, CTA + 2], [1, 0], clamp);
  const ph = ((t % 30) + 30) % 30, kb = ph < 10 ? 0 : ph < 15 ? (ph - 10) / 5 : ph < 25 ? 1 : 1 - (ph - 25) / 5;
  return (
    <div style={{ opacity: out }}>
      <Header right="Do it right" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 330 }}>
        <div style={{ ...D, fontSize: 104, color: B.cream, ...rise(sp(t, 0), 60) }}>{e.name}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          {[`${e.sets} × ${e.reps}`, `Rest ${e.rest.replace("s", " s")}`, e.rpe].map((x, k) => (
            <div key={x} style={{ padding: "12px 22px", borderRadius: 16, background: k ? "rgba(139,128,255,.14)" : B.primary, border: `2px solid ${k ? "rgba(139,128,255,.35)" : B.lo}`, ...D, fontSize: 40, color: B.cream, ...rise(sp(t, 6 + k * 4)) }}>{x}</div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 140, top: 640, width: 800, height: 620, borderRadius: 40, background: "#fff", overflow: "hidden", boxShadow: `0 40px 100px rgba(0,0,0,.55), 0 0 0 4px ${rgb(GRN, 0.8)}, 0 0 90px ${rgb(GRN, 0.35)}`, ...pop(sp(t, 2, 13, 220), 0.9) }}>
        <Img src={staticFile("gifs/0061/a.png")} style={{ position: "absolute", left: 100, top: 10, width: 600, height: 600 }} />
        <Img src={staticFile("gifs/0061/b.png")} style={{ position: "absolute", left: 100, top: 10, width: 600, height: 600, opacity: kb * kb * (3 - 2 * kb) }} />
        <div style={{ position: "absolute", right: 22, top: 22, width: 64, height: 64, borderRadius: 99, background: rgb(GRN), display: "grid", placeItems: "center" }}>
          <svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke="#063" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1310, ...UI, fontSize: 36, color: B.cream, ...rise(sp(t, 14)) }}>
        <span style={{ color: rgb(GRN) }}>✓</span> Elbows in &nbsp; <span style={{ color: rgb(GRN) }}>✓</span> Upper arms still &nbsp; <span style={{ color: rgb(GRN) }}>✓</span> Big stretch
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1380, ...UI, fontSize: 28, color: "rgba(242,240,234,.6)", ...rise(sp(t, 22)) }}>From the push day in Darebni AI</div>
    </div>
  );
}

function Cta({ f }) {
  const t = f - CTA;
  if (t < -2) return null;
  const cta = sp(t, 20, 9, 260);
  return (
    <>
      <Header right="" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 380 }}>
        <div style={{ ...D, fontSize: 116, color: B.cream, ...rise(sp(t, 0, 12, 240), 60) }}>Train with a</div>
        <div style={{ ...D, fontSize: 116, color: B.lo, ...rise(sp(t, 6, 12, 240), 60) }}>plan that<br />coaches you</div>
        <div style={{ marginTop: 40, display: "inline-block", padding: "22px 36px", borderRadius: 22, background: B.cream, transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, t - 40) / 5)))})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
          <div style={{ ...D, fontSize: 32, color: B.primary, letterSpacing: "0.06em" }}>Comment 👇</div>
          <div style={{ ...D, fontSize: 112, color: B.ink }}>“PLAN”</div>
        </div>
        <div style={{ ...UI, fontSize: 38, color: "rgba(242,240,234,.85)", marginTop: 26, ...rise(sp(t, 34)) }}>Free 4-week plan · Darebni AI on the App Store</div>
      </div>
      <Stage dy={300} k={0.9}><SideFigure r={repR(t)} kind="range" good c={GRN} /></Stage>
    </>
  );
}

export const FormCheck = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }]]);
  const cuts = [M0, M0 + M_LEN, M0 + 2 * M_LEN, DEMO, CTA].map((x) => interpolate(f, [x - 2, x, x + 6], [0, 0.3, 0], clamp)).reduce((a, b) => a + b, 0);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 62%, rgba(91,78,229,.3), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {f < M0 + 4 && <Hook f={f} />}
      {MISTAKES.map((_, i) => <Mistake key={i} f={f} i={i} />)}
      <Demo f={f} />
      <Cta f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: cuts, mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.04} />
      <Audio src={staticFile(music ? "form.wav" : "form-sfx.wav")} />
    </AbsoluteFill>
  );
};
