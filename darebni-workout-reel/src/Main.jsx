// Darebni AI "Push day" reel, built from push_workout.json (the app's own plan format). The ambassador's real photo
// opens the reel; each of the 7 exercises plays the app's own demo
// (the GIFURLSOM repo the app resolves ids to; its two clean poses in public/gifs/<id>/a.png, b.png) as one rep per
// second with a rep counter, beside the real sets, reps, rest and RPE; a push-up finisher; and a 5 s end card asking
// "Want a customized weekly plan?" with the real app (public/app/home.jpg) in a phone and a download button.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import W from "./push_workout.json";
import { FPS, EX0, EX_LEN, N_EX, FIN, OUTRO } from "./timing.js";
import { useFonts, clamp, Grain } from "./fx.jsx";

export const B = { primary: "#5B4EE5", lo: "#8B80FF", xlo: "#B8B0FF", deep: "#4338CA", ink: "#07071A", surface: "#11112B", cream: "#F2F0EA", success: "#6EE7B7", danger: "#FB7185" };

export const D = { fontFamily: "Cond", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 0.92 };
export const UI = { fontFamily: "Barlow", fontWeight: 600 };
export const UIR = { fontFamily: "BarlowR", fontWeight: 500 };
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

export function Header({ f, right }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 236, display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
      <span style={{ ...D, fontSize: 40, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      <span style={{ marginLeft: "auto", ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.06em" }}>{right}</span>
    </div>
  );
}
export const Chip = ({ children, hot, style }) => (
  <div style={{ padding: "12px 22px", borderRadius: 16, background: hot ? B.primary : "rgba(139,128,255,.14)", border: `2px solid ${hot ? B.lo : "rgba(139,128,255,.35)"}`, ...D, fontSize: 40, color: B.cream, letterSpacing: "0.02em", ...style }}>{children}</div>
);
// the ambassador on stage: his real photo (public/ambassador.png, a cut-out kept out of git), rising in, breathing,
// with a purple rim light and a punch on the beat
export function Ambassador({ f, x = 540, w = 700, top = 640, at = 6, src = "ambassador.png", aspect = 1170 / 985, label }) {
  const enter = Math.min(1, sp(f, at, 14, 140)), t = Math.max(0, f - at);
  const beat = Math.max(0, 1 - ((t % 30) / 6)) * (t > 15 ? 1 : 0);
  const h = w * aspect;
  return (
    <>
      <div style={{ position: "absolute", left: x - w * 0.7, top: top + h * 0.15, width: w * 1.4, height: h * 0.8, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(91,78,229,.55), transparent 62%)" }} />
      <Img src={staticFile(src)} style={{ position: "absolute", left: x - w / 2, top, width: w, height: h,
        transform: `translateY(${(1 - enter) * 260}px) scale(${1 + 0.012 * Math.sin(t / 12) + 0.015 * beat})`, transformOrigin: "50% 100%", opacity: enter,
        filter: "drop-shadow(0 0 2px rgba(184,176,255,.9)) drop-shadow(0 0 26px rgba(91,78,229,.7)) contrast(1.06)" }} />
      {label && <div style={{ position: "absolute", left: x - 150, width: 300, top: top - 56, textAlign: "center", opacity: Math.min(1, sp(f, at + 14) * 2) }}>
        <span style={{ ...D, fontSize: 28, color: B.ink, background: B.cream, padding: "8px 18px", borderRadius: 12, letterSpacing: "0.05em" }}>{label}</span>
      </div>}
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
      <Ambassador f={f} top={640} w={640} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1410, ...UIR, fontSize: 32, color: "rgba(242,240,234,.8)", ...rise(sp(f, 40)) }}>
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
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 1920 - 604 }}>
        <div style={{ ...D, fontSize: 96, color: B.cream, ...rise(inP, 60) }}>{e.name}</div>
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
      <div style={{ position: "absolute", left: 70, bottom: 1920 - 604 }}>
        <div style={{ ...D, fontSize: 140, color: B.danger, ...pop(sp(t, 0, 10, 260), 1.4), transformOrigin: "0% 50%" }}>Push-ups</div>
        <div style={{ ...D, fontSize: 80, color: B.cream, marginTop: 6, ...rise(sp(t, 8)) }}>to failure · 1 set</div>
      </div>
      <GifCard id="0662" t={t} reps={false} />
    </div>
  );
}

// a phone showing a real Darebni screen (public/app/home.jpg, a 780x1694 App Store screenshot); `hl` outlines a
// region of the screen, given as fractions of the screenshot [top, bottom, left, right]
export function Phone({ src, w, x, y, rot = 0, hl, hlOn = 0, style }) {
  const h = w * 2.17, r = w * 0.15, b = w * 0.035;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: "#16142A", padding: b, transform: `rotate(${rot}deg)`,
      border: "2px solid rgba(255,255,255,.14)", boxShadow: "0 50px 110px rgba(0,0,0,.6), 0 0 90px rgba(91,78,229,.55)", ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - b, overflow: "hidden", background: "#fff" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        {hl && <div style={{ position: "absolute", top: `${hl[0] * 100}%`, height: `${(hl[1] - hl[0]) * 100}%`, left: `${hl[2] * 100}%`, width: `${(hl[3] - hl[2]) * 100}%`,
          borderRadius: 14, border: `4px solid ${B.primary}`, boxShadow: `0 0 0 9999px rgba(7,7,26,${0.38 * hlOn}), 0 0 30px rgba(91,78,229,.8)`, opacity: hlOn }} />}
      </div>
    </div>
  );
}

// The end card, two pages with the download button held under both.
// Page 1 (the plan): three things the plan does, each lit up on the real home screen.
// Page 2 (the tracker): the real workout-tracker screen (public/app/tracker.jpg, sets lit up) with the Live Activity
// sliding in under it (drawn from the app's own ios/WorkoutActivity widget: working state with Prev · Log set · Next),
// the weekly AI follow-up lit up on the real Analytics screen, and a pinned-lift 1RM card
// cropped from the real home screen for the PR tracker.
const PLAN = [
  { at: 24, big: "Weights, sets & reps", small: "for every exercise", hl: [0.148, 0.372, 0.04, 0.96] },
  { at: 44, big: "A weekly planner", small: "your whole week, day by day", hl: [0.588, 0.697, 0.035, 0.965] },
  { at: 64, big: "Tailored to you", small: "by your AI coach", hl: [0.065, 0.14, 0.004, 0.72] },
];
export const OUTRO_SWAP = 110;
const TRACK = [
  { at: OUTRO_SWAP + 16, big: "Smart workout tracker", small: "log every set, kg & rep live", hl: [0.375, 0.697, 0.06, 0.94] },
  { at: OUTRO_SWAP + 62, big: "Weekly follow-up", small: "your AI coach reviews your week", hl: [0.345, 0.556, 0.05, 0.95] },
  { at: OUTRO_SWAP + 86, big: "PR tracker", small: "your best lifts, saved" },
];
export const OUTRO_CTA = 84;

function Points({ t, items, cur, size = 50 }) {
  return (
    <div style={{ position: "absolute", left: 70, width: 500, top: 650, display: "flex", flexDirection: "column", gap: 70 }}>
      {items.map((p, i) => {
        const q = sp(t, p.at, 12, 240), on = i === cur;
        return (
          <div key={p.big} style={{ display: "flex", gap: 18, alignItems: "flex-start", ...rise(q, 30) }}>
            <div style={{ flex: "none", width: 52, height: 52, borderRadius: 16, marginTop: 2, background: B.success, display: "flex", alignItems: "center", justifyContent: "center", ...pop(q, 1.6) }}>
              <svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={B.ink} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ ...D, fontSize: size, color: on ? B.cream : "rgba(242,240,234,.82)", whiteSpace: "nowrap" }}>{p.big}</div>
              <div style={{ ...UIR, fontSize: 32, color: on ? B.xlo : "rgba(184,176,255,.7)", marginTop: 6 }}>{p.small}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
const current = (t, items) => items.reduce((k, p, i) => (t >= p.at ? i : k), -1);

// the app's lock-screen Live Activity, working state, showing the same set as the tracker screenshot (set 1 of 4)
function LiveActivity({ style }) {
  const acc = "#A78BFA";
  const btn = (label, hot) => (
    <div style={{ flex: 1, height: 46, borderRadius: 13, background: hot ? "rgba(167,139,250,.9)" : "rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Barlow", fontWeight: 600, fontSize: 19, color: "#fff" }}>{label}</div>
  );
  return (
    <div style={{ position: "absolute", width: 460, padding: "20px 22px", borderRadius: 30, background: "#1C1C1E", border: "1.5px solid rgba(255,255,255,.12)",
      boxShadow: "0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(91,78,229,.45)", ...style }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 62, height: 62, borderRadius: 15, background: "rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 52, height: 52, borderRadius: 11 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Barlow", fontWeight: 600, fontSize: 15, letterSpacing: "0.08em", color: "rgba(255,255,255,.55)" }}>PUSH A</div>
          <div style={{ fontFamily: "Barlow", fontWeight: 600, fontSize: 23, color: "#fff", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Barbell Flat Bench Press</div>
          <div style={{ fontFamily: "BarlowR", fontWeight: 500, fontSize: 20, color: "rgba(255,255,255,.75)", marginTop: 2 }}>112.5 kg × 6 reps</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "Barlow", fontWeight: 600, fontSize: 14, letterSpacing: "0.1em", color: "rgba(255,255,255,.55)" }}>SET</div>
          <div style={{ fontFamily: "Barlow", fontWeight: 600, fontSize: 40, color: acc, lineHeight: 1 }}>1<span style={{ fontSize: 28, color: "rgba(255,255,255,.55)" }}>/4</span></div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>{btn("‹  Prev")}{btn("✓  Log set", true)}{btn("Next  ›")}</div>
    </div>
  );
}
// a crop of the real home screen: the pinned Barbell Incline Bench Press card with its 1RM
function PRCard({ style }) {
  const w = 330, iw = 780, box = [0.045, 0.493, 0.423, 0.542];   // left, right, top, bottom as fractions of the screenshot
  const sc = w / ((box[1] - box[0]) * iw), h = (box[3] - box[2]) * 1694 * sc;
  return (
    <div style={{ position: "absolute", width: w, height: h, borderRadius: 26, overflow: "hidden", border: `3px solid ${B.lo}`,
      boxShadow: "0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(91,78,229,.55)", background: "#EEEBFB", ...style }}>
      <Img src={staticFile("app/home.jpg")} style={{ position: "absolute", width: iw * sc, height: 1694 * sc, left: -box[0] * iw * sc, top: -box[2] * 1694 * sc, maxWidth: "none" }} />
    </div>
  );
}

function Outro({ f }) {
  const t = f - OUTRO;
  if (t < -2) return null;
  const cta = sp(t, OUTRO_CTA, 9, 260);
  const out1 = interpolate(t, [OUTRO_SWAP - 4, OUTRO_SWAP + 4], [1, 0], clamp);
  const t2 = t - OUTRO_SWAP;
  // page 1
  const phone1 = sp(t, 6, 14, 150), c1 = current(t, PLAN);
  const hl1 = c1 < 0 ? 0 : Math.min(1, sp(t, PLAN[c1].at, 14, 220) * 1.5);
  // page 2
  const phone2 = sp(t2, 4, 14, 150), c2 = current(t, TRACK);
  const hl2 = c2 >= 0 && c2 < 2 ? Math.min(1, sp(t, TRACK[c2].at, 14, 220) * 1.5) : 0;
  const toAnalytics = interpolate(t, [TRACK[1].at - 10, TRACK[1].at - 2], [0, 1], clamp);   // the tracker screen, then Analytics
  // the floating cards share one spot over the phone's lower half: the Live Activity for point 1, the PR card for 3
  const la = sp(t, TRACK[0].at + 20, 14, 200), laOut = sp(t, TRACK[1].at - 10, 14, 200), pr = sp(t, TRACK[2].at - 4, 12, 200);
  return (
    <>
      <Header f={f} right="Your plan" />
      {out1 > 0 && (
        <div style={{ opacity: out1, transform: `translateX(${(1 - out1) * -80}px)` }}>
          <div style={{ position: "absolute", left: 70, right: 70, top: 330 }}>
            <div style={{ ...D, fontSize: 104, color: B.cream, ...rise(sp(t, 0, 12, 240), 60) }}>Want a customized</div>
            <div style={{ ...D, fontSize: 104, color: B.lo, ...rise(sp(t, 5, 12, 240), 60) }}>weekly plan?</div>
          </div>
          <Phone src="app/home.jpg" w={340} x={585} y={560 + (1 - phone1) * 320 + Math.sin(t / 16) * 6} rot={4} hl={c1 >= 0 ? PLAN[c1].hl : null} hlOn={hl1}
            style={{ opacity: Math.min(1, phone1 * 2) }} />
          <Points t={t} items={PLAN} cur={c1} />
        </div>
      )}
      {t2 > -2 && (
        <div style={{ opacity: interpolate(t2, [-2, 6], [0, 1], clamp), transform: `translateX(${interpolate(t2, [-2, 10], [80, 0], clamp)}px)` }}>
          <div style={{ position: "absolute", left: 70, right: 70, top: 330 }}>
            <div style={{ ...D, fontSize: 104, color: B.cream, ...rise(sp(t2, 0, 12, 240), 60) }}>Then it tracks</div>
            <div style={{ ...D, fontSize: 104, color: B.lo, ...rise(sp(t2, 5, 12, 240), 60) }}>every rep.</div>
          </div>
          <Phone src="app/tracker.jpg" w={340} x={585} y={560 + (1 - phone2) * 320 + Math.sin(t / 16) * 6} rot={4} hl={TRACK[0].hl} hlOn={c2 === 0 ? hl2 : 0}
            style={{ opacity: Math.min(1, phone2 * 2) * (1 - toAnalytics) }} />
          {toAnalytics > 0 && <Phone src="app/analytics.jpg" w={340} x={585} y={560 + Math.sin(t / 16) * 6} rot={4} hl={TRACK[1].hl} hlOn={c2 === 1 ? hl2 : 0}
            style={{ opacity: toAnalytics }} />}
          <Points t={t} items={TRACK} cur={c2} size={42} />
          <LiveActivity style={{ left: 480, top: 1080, opacity: Math.min(1, la * 2) * (1 - Math.min(1, laOut)), transform: `translateY(${(1 - Math.min(1, la)) * 140 + Math.min(1, laOut) * 60}px) scale(${0.9 + 0.1 * Math.min(1, la)})` }} />
          <PRCard style={{ left: 590, top: 1070, opacity: Math.min(1, pr * 2), transform: `translateY(${(1 - Math.min(1, pr)) * 120}px) rotate(-3deg)` }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 70, top: 1340, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 34px 14px 16px", borderRadius: 26, background: B.cream, boxShadow: "0 24px 60px rgba(91,78,229,.45)",
          transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, t - OUTRO_CTA - 20) / 5)))})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 88, height: 88, borderRadius: 20 }} />
          <div>
            <div style={{ ...D, fontSize: 30, color: B.primary, letterSpacing: "0.06em" }}>Download now</div>
            <div style={{ ...D, fontSize: 68, color: B.ink }}>Darebni AI</div>
          </div>
        </div>
        <div style={{ ...UI, fontSize: 32, lineHeight: 1.25, color: "rgba(242,240,234,.85)", ...rise(sp(t, OUTRO_CTA + 12)) }}>On the<br />App Store</div>
      </div>
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
