// Darebni AI "How it works": a 25 s kinetic-type explainer (1080x1920), text and code-drawn UI only, no workout footage.
// One idea: the same week, every week, changes nothing; Darebni turns training into a loop that keeps progressing.
// Beats (30 fps, cut on the 120 BPM grid of the bed in sound/build_howitworks_cues.py; scene starts in HW.CUTS):
//   hook "Most people train the same every week / and wonder why nothing changes" -> logo -> 01 it learns you ->
//   02 it builds your week (sets, reps, kg, rest, RPE) -> 03 log every set live (rest timer) -> 04 every week a little
//   more (progressive overload, W1-W4 bars, new PR) -> 05 your week reviewed (weekly follow-up) -> download end card.
// The kg/reps on screen are an example lifter, not user data.
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Header } from "./Main.jsx";

export const HW = { FPS: 30, CUTS: [0, 90, 135, 225, 345, 435, 555, 630], DURATION: 750 };
const [H0, LOGO, S1, S2, S3, S4, S5, END] = HW.CUTS;
const GRN = "#3DDC97", RED = "#FF4D6A", GOLD = "#FFC94A";
const sp = (t, at = 0, d = 12, s = 220) => spring({ frame: t - at, fps: 30, config: { damping: d, stiffness: s } });
const pop = (p, k = 1.6) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 50) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const slide = (p, dx = 300) => ({ opacity: Math.min(1, p * 2), transform: `translateX(${(1 - Math.min(1, p)) * dx}px)` });

// a scene: mounted from `from` to `to`, with a fast scale-out exit; children get local time t
function Scene({ f, from, to, children }) {
  if (f < from - 1 || f > to + 1) return null;
  const t = f - from, out = interpolate(f, [to - 6, to], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - 0.06 * out})` }}>{children(t)}</AbsoluteFill>;
}
// the step title: a huge outlined step number and the line under it
function Step({ t, n, title, accent = B.lo }) {
  return (
    <>
      <Header f={t} right="How it works" />
      <div style={{ position: "absolute", left: 70, top: 330, ...D, fontSize: 230, color: "transparent", WebkitTextStroke: `4px ${accent}`, ...pop(sp(t, 0, 11, 260), 1.4), transformOrigin: "0% 50%" }}>{n}</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 560, ...D, fontSize: 112, color: B.cream, ...rise(sp(t, 5, 12, 240), 70) }}>{title}</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1560, display: "flex", gap: 10 }}>
        {[1, 2, 3, 4, 5].map((k) => <div key={k} style={{ flex: 1, height: 8, borderRadius: 4, background: k < +n ? B.lo : k === +n ? B.cream : "rgba(242,240,234,.15)" }} />)}
      </div>
    </>
  );
}
const Tick = ({ p = 1, size = 56, color = GRN }) => (
  <div style={{ flex: "none", width: size, height: size, borderRadius: size / 2, background: color, display: "flex", alignItems: "center", justifyContent: "center", ...pop(p, 0.2) }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={B.ink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);
const Card = ({ style, children }) => (
  <div style={{ position: "absolute", borderRadius: 32, background: "rgba(17,17,43,.92)", border: "2px solid rgba(139,128,255,.35)", boxShadow: "0 40px 90px rgba(0,0,0,.5), 0 0 70px rgba(91,78,229,.25)", ...style }}>{children}</div>
);
const Pill = ({ hot, children, style }) => (
  <div style={{ padding: "12px 22px", borderRadius: 16, background: hot ? B.primary : "rgba(139,128,255,.14)", border: `2px solid ${hot ? B.lo : "rgba(139,128,255,.35)"}`, ...D, fontSize: 42, color: B.cream, whiteSpace: "nowrap", ...style }}>{children}</div>
);

function Hook({ t }) {
  const dim = interpolate(t, [44, 52], [1, 0.3], clamp), lift = interpolate(sp(t, 44, 14, 160), [0, 1], [0, -120]);
  const shake = t > 58 && t < 70 ? (random(`s${t}`) - 0.5) * 18 * (1 - (t - 58) / 12) : 0;
  const L = (txt, at, top, size, color = B.cream) => <div style={{ position: "absolute", left: 70, top, ...D, fontSize: size, color, whiteSpace: "nowrap", ...pop(sp(t, at, 10, 300), 1.8), transformOrigin: "0% 60%" }}>{txt}</div>;
  return (
    <>
      <div style={{ opacity: dim, transform: `translateY(${lift}px)` }}>
        {L("Most people", 3, 560, 150)}
        {L(<>train the <span style={{ color: B.lo }}>same</span></>, 11, 720, 140)}
        {L("every week.", 21, 870, 150)}
      </div>
      {t > 44 && L("And wonder why", 48, 1000, 104, "rgba(242,240,234,.85)")}
      {t > 54 && <div style={{ transform: `translateX(${shake}px)` }}>{L("nothing changes.", 58, 1120, 124, RED)}</div>}
    </>
  );
}

function Logo({ t }) {
  const ic = sp(t, 0, 10, 200), word = "Darebni AI".split("");
  return (
    <>
      <div style={{ position: "absolute", left: 540 - 130, top: 600, width: 260, height: 260, borderRadius: 64, overflow: "hidden", boxShadow: `0 0 ${120 * Math.min(1, ic)}px rgba(139,128,255,.8)`, ...pop(ic, 0.3) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 260, height: 260 }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", ...D, fontSize: 150, color: B.cream, whiteSpace: "pre" }}>
        {word.map((c, i) => <span key={i} style={{ display: "inline-block", color: i > 7 ? B.lo : B.cream, ...rise(sp(t, 6 + i * 1.5, 12, 300), 60) }}>{c}</span>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center", ...rise(sp(t, 22)) }}>
        <div style={{ padding: "12px 30px", borderRadius: 999, background: B.cream, ...D, fontSize: 44, color: B.ink, letterSpacing: "0.06em" }}>How it works</div>
      </div>
    </>
  );
}

function Learns({ t }) {
  const chips = [["Goal", "Build muscle"], ["Level", "Intermediate"], ["Days", "4 a week"], ["Where", "Gym or home"]];
  const join = sp(t, 58, 12, 200);
  return (
    <>
      <Step t={t} n="01" title="It learns you" />
      {chips.map(([a, b], i) => (
        <div key={a} style={{ position: "absolute", left: 70, top: 760 + i * 128, display: "flex", alignItems: "center", gap: 18, ...slide(sp(t, 14 + i * 7, 12, 240), i % 2 ? -420 : 420) }}>
          <span style={{ ...D, fontSize: 40, color: B.xlo, letterSpacing: "0.08em", width: 160 }}>{a}</span>
          <Pill hot={i === 0}>{b}</Pill>
        </div>
      ))}
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M 640 ${800 + i * 128} C 820 ${800 + i * 128}, 820 1340, 900 1340`} fill="none" stroke={B.lo} strokeWidth="4" strokeDasharray="600" strokeDashoffset={600 * (1 - Math.min(1, join))} opacity={0.7 * Math.min(1, join * 3)} />)}
      </svg>
      <div style={{ position: "absolute", right: 70, top: 1300, ...pop(sp(t, 66, 10, 260), 0.5), transformOrigin: "100% 50%" }}>
        <Pill hot style={{ background: GRN, border: `2px solid ${GRN}`, color: B.ink }}>Your plan</Pill>
      </div>
    </>
  );
}

function Week({ t }) {
  const days = [["M", "Push"], ["T", "Pull"], ["W", "Legs"], ["T", "Rest"], ["F", "Upper"], ["S", "Lower"], ["S", "Rest"]];
  const open = sp(t, 46, 13, 200), hl = Math.min(1, sp(t, 40, 14, 260));
  const chips = ["4 × 8–10", "80 kg", "Rest 150 s", "RPE 8"];
  return (
    <>
      <Step t={t} n="02" title="It builds your week" />
      {days.map(([d, w], i) => {
        const p = sp(t, 12 + i * 3, 11, 260), on = i === 0 ? hl : 0, rest = w === "Rest";
        return (
          <div key={i} style={{ position: "absolute", left: 70 + i * 136, top: 760, width: 124, height: 150, borderRadius: 20, textAlign: "center",
            background: on ? B.primary : rest ? "rgba(242,240,234,.05)" : "rgba(139,128,255,.16)", border: `2px solid ${on ? B.xlo : "rgba(139,128,255,.3)"}`,
            opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * -140}px) scale(${1 + 0.06 * on})` }}>
            <div style={{ ...D, fontSize: 34, color: B.xlo, marginTop: 22 }}>{d}</div>
            <div style={{ ...D, fontSize: 34, color: rest ? "rgba(242,240,234,.4)" : B.cream, marginTop: 18 }}>{w}</div>
          </div>
        );
      })}
      <Card style={{ left: 70, right: 70, top: 950, height: 520, padding: "40px 44px", opacity: Math.min(1, open * 2), transform: `scaleY(${0.3 + 0.7 * Math.min(1, open)})`, transformOrigin: "10% 0%" }}>
        <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.1em" }}>Monday · Push</div>
        <div style={{ ...D, fontSize: 84, color: B.cream, marginTop: 10 }}>Bench press</div>
        <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
          {chips.map((c, k) => <div key={c} style={pop(sp(t, 56 + k * 5, 10, 300), 1.5)}><Pill hot={k === 0} style={{ fontSize: 40 }}>{c}</Pill></div>)}
        </div>
        {[["Incline dumbbell press", "3 × 10"], ["Cable fly", "3 × 12"]].map(([a, b], k) => (
          <div key={a} style={{ display: "flex", justifyContent: "space-between", marginTop: k ? 14 : 34, paddingTop: 16, borderTop: "2px solid rgba(242,240,234,.12)", ...rise(sp(t, 80 + k * 6)) }}>
            <span style={{ ...UI, fontSize: 38, color: "rgba(242,240,234,.8)" }}>{a}</span><span style={{ ...D, fontSize: 38, color: B.xlo }}>{b}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function Track({ t }) {
  const sets = [["Set 1", "80 kg × 10"], ["Set 2", "80 kg × 9"], ["Set 3", "80 kg × 8"]];
  const ring = interpolate(t, [52, 84], [1, 0], clamp), secs = Math.ceil(90 * ring);
  return (
    <>
      <Step t={t} n="03" title="Log every set, live" />
      {sets.map(([a, b], i) => {
        const at = 14 + i * 12, done = sp(t, at + 6, 10, 300);
        return (
          <div key={a} style={{ position: "absolute", left: 70, right: 70, top: 760 + i * 128, height: 108, borderRadius: 24, display: "flex", alignItems: "center", gap: 26, padding: "0 30px",
            background: done > 0.5 ? "rgba(61,220,151,.12)" : "rgba(139,128,255,.12)", border: `2px solid ${done > 0.5 ? "rgba(61,220,151,.6)" : "rgba(139,128,255,.3)"}`, ...slide(sp(t, at - 4, 12, 260), 200) }}>
            <span style={{ ...D, fontSize: 40, color: B.xlo, width: 130 }}>{a}</span>
            <span style={{ ...D, fontSize: 56, color: B.cream, flex: 1, textTransform: "none" }}>{b}</span>
            <Tick p={done} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 540 - 130, top: 1150, width: 260, height: 260, ...pop(sp(t, 48, 12, 220), 0.4) }}>
        <svg width="260" height="260" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="112" fill="rgba(7,7,26,.6)" stroke="rgba(139,128,255,.2)" strokeWidth="16" />
          <circle cx="130" cy="130" r="112" fill="none" stroke={GOLD} strokeWidth="16" strokeLinecap="round" strokeDasharray={2 * Math.PI * 112} strokeDashoffset={2 * Math.PI * 112 * (1 - ring)} transform="rotate(-90 130 130)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...D, fontSize: 28, color: B.xlo, letterSpacing: "0.1em" }}>{secs > 0 ? "Rest" : "Go"}</div>
          <div style={{ ...D, fontSize: 70, color: secs > 0 ? B.cream : GRN, textTransform: "none" }}>{secs > 0 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}` : "Next set"}</div>
        </div>
      </div>
    </>
  );
}

function Overload({ t }) {
  const kg = [80, 82.5, 85, 87.5], base = 1400, x0 = 95, bw = 170, gap = 52;
  const stamp = sp(t, 74, 9, 320);
  return (
    <>
      <Step t={t} n="04" title={<>Every week, <span style={{ color: GRN }}>a little more</span></>} accent={GRN} />
      {kg.map((v, i) => {
        const p = Math.min(1.04, sp(t, 16 + i * 12, 13, 170)), h = (v - 68) * 22 * p, x = x0 + i * (bw + gap), last = i === 3;
        const shown = Math.min(v, Math.round((70 + (v - 70) * Math.min(1, p)) * 2) / 2);   // counts up in 0.5 kg steps
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: x, top: base - h, width: bw, height: h, borderRadius: "22px 22px 6px 6px", background: last ? `linear-gradient(180deg, ${GRN}, #1E9E6A)` : "linear-gradient(180deg, #8B80FF, #3A2FB8)", opacity: Math.min(1, p * 3) }} />
            <div style={{ position: "absolute", left: x - 20, width: bw + 40, top: base - h - 70, textAlign: "center", ...D, fontSize: 52, color: last ? GRN : B.cream, textTransform: "none", opacity: Math.min(1, p * 3) }}>{shown.toFixed(1).replace(".0", "")} kg</div>
            <div style={{ position: "absolute", left: x, width: bw, top: base + 18, textAlign: "center", ...D, fontSize: 36, color: "rgba(242,240,234,.6)" }}>Week {i + 1}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 470, top: 800, transform: `rotate(-8deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`, opacity: Math.min(1, stamp * 3),
        padding: "12px 26px", borderRadius: 16, background: GOLD, border: `5px solid ${B.ink}`, ...D, fontSize: 64, color: B.ink, boxShadow: "0 20px 50px rgba(0,0,0,.45)" }}>New PR</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1480, ...UI, fontSize: 40, color: "rgba(242,240,234,.85)", ...rise(sp(t, 84)) }}>Progressive overload, built into your plan.</div>
    </>
  );
}

function Review({ t }) {
  const rows = ["4 of 4 workouts done", "Bench press PR · 87.5 kg", "Next week's plan is ready"];
  return (
    <>
      <Step t={t} n="05" title="Your week, reviewed" />
      <Card style={{ left: 70, right: 70, top: 790, padding: "40px 44px", ...rise(sp(t, 8, 13, 220), 120) }}>
        <div style={{ ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.1em" }}>Weekly follow-up</div>
        {rows.map((r, i) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30, ...slide(sp(t, 18 + i * 8, 12, 260), 120) }}>
            <Tick p={sp(t, 22 + i * 8, 10, 300)} /><span style={{ ...UI, fontSize: 44, color: B.cream }}>{r}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function EndCard({ t }) {
  const push = 1 + 0.03 * interpolate(t, [0, 120], [0, 1], clamp), store = sp(t, 26, 11, 220);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${push})` }}>
      <div style={{ position: "absolute", left: 70, top: 520, ...D, fontSize: 150, color: B.cream, ...pop(sp(t, 2, 10, 300), 1.7), transformOrigin: "0% 60%" }}>Stop guessing.</div>
      <div style={{ position: "absolute", left: 70, top: 680, ...D, fontSize: 124, color: GRN, whiteSpace: "nowrap", ...pop(sp(t, 12, 10, 300), 1.7), transformOrigin: "0% 60%" }}>Start progressing.</div>
      <div style={{ position: "absolute", left: 70, top: 900, ...UI, fontSize: 42, color: "rgba(242,240,234,.85)", ...rise(sp(t, 20)) }}>Your plan, sets, reps & weights.<br />Built for you. Tracked every set.</div>
      <div style={{ position: "absolute", left: 70, top: 1120, display: "inline-flex", alignItems: "center", gap: 24, padding: "20px 40px 20px 20px", borderRadius: 34, background: B.primary, border: `3px solid ${B.lo}`,
        boxShadow: "0 30px 80px rgba(0,0,0,.5), 0 0 80px rgba(91,78,229,.6)", ...pop(store, 0.6), transformOrigin: "0% 50%" }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 120, height: 120, borderRadius: 28 }} />
        <div><div style={{ ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.04em" }}>Download on the App Store</div><div style={{ ...D, fontSize: 84, color: B.cream }}>Darebni AI</div></div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1340, ...D, fontSize: 40, color: B.xlo, letterSpacing: "0.06em", ...rise(sp(t, 40)) }}>Start your free week</div>
    </div>
  );
}

export const HowItWorks = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  // a violet sweep across every cut
  const sweep = HW.CUTS.slice(1).map((c) => interpolate(f, [c - 6, c + 6], [-1, 1], clamp)).find((v) => v > -1 && v < 1);
  const glow = 0.35 + 0.08 * Math.sin(f / 9);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, rgba(91,78,229,${glow}), transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${-f * 0.6}px` }} />
      <Scene f={f} from={H0} to={LOGO}>{(t) => <Hook t={t} />}</Scene>
      <Scene f={f} from={LOGO} to={S1}>{(t) => <Logo t={t} />}</Scene>
      <Scene f={f} from={S1} to={S2}>{(t) => <Learns t={t} />}</Scene>
      <Scene f={f} from={S2} to={S3}>{(t) => <Week t={t} />}</Scene>
      <Scene f={f} from={S3} to={S4}>{(t) => <Track t={t} />}</Scene>
      <Scene f={f} from={S4} to={S5}>{(t) => <Overload t={t} />}</Scene>
      <Scene f={f} from={S5} to={END}>{(t) => <Review t={t} />}</Scene>
      <Scene f={f} from={END} to={HW.DURATION + 10}>{(t) => <EndCard t={t} />}</Scene>
      {sweep !== undefined && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -400, bottom: -400, width: 420, left: 540 - 210 + sweep * 1100, transform: "skewX(-18deg)",
            background: "linear-gradient(90deg, transparent, rgba(139,128,255,.55), rgba(242,240,234,.35), rgba(139,128,255,.55), transparent)", mixBlendMode: "screen" }} />
        </AbsoluteFill>
      )}
      <Grain f={f} opacity={0.035} />
      <Audio src={staticFile(music ? "howitworks.wav" : "howitworks-sfx.wav")} />
    </AbsoluteFill>
  );
};

// cover for the reel (1080x1920, content inside the 3:4 grid crop): the title and the five steps as a numbered list
export const HowItWorksThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const steps = ["It learns you", "It builds your week", "Log every set, live", "Every week, a little more", "Your week, reviewed"];
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 62%, rgba(91,78,229,.45), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <Header f={0} right="How it works" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 340 }}>
        <div style={{ ...D, fontSize: 150, color: B.cream }}>How</div>
        <div style={{ ...D, fontSize: 150, color: B.lo }}>Darebni AI</div>
        <div style={{ ...D, fontSize: 150, color: B.cream }}>works</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 880, display: "flex", flexDirection: "column", gap: 18 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 26, padding: "18px 28px", borderRadius: 24, background: i === 3 ? "rgba(61,220,151,.14)" : "rgba(139,128,255,.12)", border: `2px solid ${i === 3 ? "rgba(61,220,151,.6)" : "rgba(139,128,255,.35)"}` }}>
            <span style={{ ...D, fontSize: 64, color: "transparent", WebkitTextStroke: `2.5px ${i === 3 ? GRN : B.lo}`, width: 90 }}>0{i + 1}</span>
            <span style={{ ...D, fontSize: 56, color: B.cream }}>{s}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
