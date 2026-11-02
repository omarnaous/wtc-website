// Creatine story with voice-over: Karim (takes creatine) vs Sami (doesn't), the same gym and plan, told by a narrator
// (sound/build_creatine_vo.py writes the lines and src/creatine-vo.json, so every scene starts with its line). Pros only,
// plus the 3D tub (Jar3D.jsx). Karim and Sami are made-up characters; the numbers are real (sources below).
// Facts (all cited on screen):
// - Rawson & Volek 2003, J Strength Cond Res 17(4): 22 studies; strength +20% with creatine vs +12% placebo; reps at a
//   given % of max +14% more; "the response is highly variable".
// - Water: early weight gain on creatine is commonly 1-2 kg, water held inside the muscle (widely reported; shown as typical).
// - Hair: the claim traces to one 2009 study of 20 rugby players that measured DHT, not hair, and has not been replicated.
// - Gordji-Nejad et al. 2024, Scientific Reports 14:4937: one high dose (0.35 g/kg) improved cognitive performance during
//   sleep deprivation (small study).
// - Creatine raises creatinine on blood tests, which can look like a kidney problem (Scripps Health; BMJ case report).
// - Kreider et al. 2017, ISSN position stand: up to 30 g/day for 5 years safe in healthy people; 3-5 g/day.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR } from "./Main.jsx";
import { Env, Jar } from "./Jar3D.jsx";
import V from "./creatine-vo.json";

const FPS = 30;
export const CV = { FPS, HOOK: V.HOOK, W1: V.W1, STR: V.STR, HAIR: V.HAIR, BRAIN: V.BRAIN, FIN: V.FIN, END: V.END, DURATION: V.DURATION };
const T = CV;
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 50) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const H = { ...D, color: B.cream };
const RED = "#FF4D6A", GRN = "#3DDC97";
const Tag = ({ children, color = B.xlo, style }) => <div style={{ ...D, fontSize: 32, letterSpacing: "0.14em", color, ...style }}>{children}</div>;
const Cite = ({ f, at, children }) => <div style={{ position: "absolute", left: 70, right: 70, top: 1440, ...UIR, fontSize: 27, color: "rgba(242,240,234,.6)", ...rise(sp(f, at)) }}>{children}</div>;
const Check = ({ c = GRN, x }) => (
  <svg width="34" height="34" viewBox="0 0 24 24">{x ? <path d="M6 6l12 12M18 6L6 18" stroke={B.ink} strokeWidth="3.6" strokeLinecap="round" /> : <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={B.ink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />}</svg>
);
function Scene({ f, a, b, children }) {
  if (f < a - 2 || f > b + 2) return null;
  const o = interpolate(f, [a, a + 4, b - 8, b], [0, 1, 1, 0], clamp), x = interpolate(f, [b - 8, b], [0, -70], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateX(${x}px)` }}>{children}</AbsoluteFill>;
}
function Title({ f, at, tag, a, b, tagColor, top = 300, size = 100 }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top }}>
      {tag && <Tag color={tagColor} style={rise(sp(f, at + 2))}>{tag}</Tag>}
      <div style={{ ...H, fontSize: size, marginTop: 14, ...rise(sp(f, at + 6, 12, 240), 50) }}>{a}</div>
      {b && <div style={{ ...H, fontSize: size, color: B.lo, ...rise(sp(f, at + 12, 12, 240), 50) }}>{b}</div>}
    </div>
  );
}
// the two characters, as chips: A takes creatine, B doesn't
const Who = ({ a, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 20px 10px 12px", borderRadius: 999, background: a ? B.primary : "rgba(242,240,234,.12)", border: `2px solid ${a ? B.lo : "rgba(242,240,234,.25)"}`, ...style }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: a ? B.cream : "rgba(242,240,234,.35)", display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 26, color: B.ink }}>{a ? "K" : "S"}</div>
    <span style={{ ...D, fontSize: 30, color: B.cream, letterSpacing: "0.04em" }}>{a ? "Karim · creatine" : "Sami · no creatine"}</span>
  </div>
);

function Hook({ f }) {
  return (
    <Scene f={f} a={T.HOOK} b={T.W1}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ display: "inline-block", padding: "12px 22px", borderRadius: 14, background: B.primary, ...rise(sp(f, 2)) }}><Tag color={B.cream}>Story time</Tag></div>
        <div style={{ ...H, fontSize: 104, marginTop: 28, ...rise(sp(f, 6, 12, 240), 60) }}>Karim & Sami.</div>
        <div style={{ ...H, fontSize: 104, whiteSpace: "nowrap", ...rise(sp(f, 34, 12, 240), 60) }}>Same gym, same plan.</div>
        <div style={{ ...H, fontSize: 104, whiteSpace: "nowrap", color: B.lo, ...rise(sp(f, 80, 12, 240), 60) }}>Only Karim takes this.</div>
      </div>
    </Scene>
  );
}

// a bathroom scale with a counting display
function Scale({ x, v, hot, f, at, label }) {
  const p = sp(f, at, 13, 200);
  return (
    <div style={{ position: "absolute", left: x, top: 820, width: 420, ...rise(p, 60) }}>
      <div style={{ height: 300, borderRadius: 60, background: "linear-gradient(180deg, #24214A, #15132E)", border: `3px solid ${hot ? B.lo : "rgba(242,240,234,.2)"}`,
        boxShadow: hot ? "0 0 70px rgba(139,128,255,.45)" : "0 30px 60px rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: "18px 26px", borderRadius: 18, background: "#0A0920", border: "2px solid rgba(139,128,255,.35)", ...D, fontSize: 92, color: hot ? B.lo : "rgba(242,240,234,.6)", fontVariantNumeric: "tabular-nums" }}>
          +{v.toFixed(1)}<span style={{ fontSize: 46 }}> kg</span>
        </div>
      </div>
      <div style={{ marginTop: 26, textAlign: "center" }}>{label}</div>
    </div>
  );
}
function Week1({ f }) {
  const a = T.W1, v = 1.5 * interpolate(f, [a + 26, a + 70], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const panic = sp(f, a + 40, 11, 240), fact = sp(f, a + 76, 12, 220);
  return (
    <Scene f={f} a={a} b={T.STR}>
      <Title f={f} at={a} tag="Week 1" a="Karim hits the scale." />
      <Scale x={70} v={v} hot f={f} at={a + 10} label={<Who a />} />
      <Scale x={590} v={0} f={f} at={a + 16} label={<Who />} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 540 }}>
        <div style={{ ...H, fontSize: 72, color: RED, opacity: 1 - Math.min(1, fact * 1.5), ...pop(panic, 1.3), transformOrigin: "0% 50%" }}>“Am I getting fat?”</div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1260, ...rise(fact, 40) }}>
        <div style={{ ...H, fontSize: 74 }}>No. It’s water,</div>
        <div style={{ ...H, fontSize: 74, color: B.lo }}>pulled inside the muscle.</div>
      </div>
      <Cite f={f} at={a + 84}>Typical early gain on creatine: about 1–2 kg, mostly water stored in muscle, not fat.</Cite>
    </Scene>
  );
}

function Bars({ f, at }) {
  const bar = (x, v, hot, delay, label) => {
    const q = interpolate(f, [at + 22 + delay, at + 60 + delay], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 }), h = (v / 23) * 500 * q;
    return (
      <div style={{ position: "absolute", left: x, bottom: 0, width: 380, textAlign: "center" }}>
        <div style={{ ...H, fontSize: 116, color: hot ? B.lo : "rgba(242,240,234,.65)", marginBottom: 12 }}>+{Math.round(v * q)}%</div>
        <div style={{ height: h, borderRadius: "24px 24px 0 0", background: hot ? `linear-gradient(180deg, ${B.lo}, ${B.primary})` : "rgba(242,240,234,.2)", boxShadow: hot ? "0 0 60px rgba(139,128,255,.5)" : "none" }} />
        <div style={{ marginTop: 18 }}>{label}</div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: 600, height: 640 }}>
      {bar(0, 20, true, 0, <Who a />)}
      {bar(480, 12, false, 6, <Who />)}
    </div>
  );
}
function Strength({ f }) {
  const a = T.STR, reps = sp(f, a + 110, 11, 240);
  return (
    <Scene f={f} a={a} b={T.HAIR}>
      <Title f={f} at={a} tag="Weeks later · strength" a="Same training." b="Different results." />
      <Bars f={f} at={a} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1300, display: "flex", alignItems: "baseline", gap: 18, ...rise(reps, 40) }}>
        <span style={{ ...H, fontSize: 96, color: B.lo }}>+14%</span>
        <span style={{ ...UI, fontSize: 38, color: B.cream }}>more reps at the same weight, too</span>
      </div>
      <Cite f={f} at={a + 40}>Average across 22 studies · Rawson & Volek, Journal of Strength & Conditioning Research, 2003</Cite>
    </Scene>
  );
}

function Hair({ f }) {
  const a = T.HAIR, strike = interpolate(f, [a + 50, a + 60], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 }), stamp = sp(f, a + 112, 9, 300);
  const rows = ["2009", "20 rugby players", "Measured a hormone (DHT)", "Never measured hair"];
  return (
    <Scene f={f} a={a} b={T.BRAIN}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <Tag color={RED} style={rise(sp(f, a + 2))}>Sami’s excuse</Tag>
        <div style={{ position: "relative", display: "inline-block", marginTop: 16, ...rise(sp(f, a + 6, 12, 240), 50) }}>
          <div style={{ ...H, fontSize: 100, opacity: 1 - 0.45 * strike }}>“It makes you bald.”</div>
          <div style={{ position: "absolute", left: -10, top: "46%", height: 14, width: `calc(${strike * 100}% + 20px)`, background: RED, borderRadius: 7, boxShadow: "0 0 30px rgba(255,77,106,.8)", transform: "rotate(-2deg)" }} />
        </div>
        <div style={{ ...UI, fontSize: 42, color: "rgba(242,240,234,.85)", marginTop: 20, ...rise(sp(f, a + 42)) }}>The whole fear comes from one study.</div>
      </div>
      <div style={{ position: "absolute", left: 110, right: 110, top: 720, padding: "40px 44px", borderRadius: 28, background: "#F2F0EA", transform: `rotate(-2deg) translateY(${(1 - Math.min(1, sp(f, a + 50))) * 120}px)`, opacity: Math.min(1, sp(f, a + 50) * 2), boxShadow: "0 40px 90px rgba(0,0,0,.5)" }}>
        {rows.map((r, i) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: i < rows.length - 1 ? "2px solid rgba(7,7,26,.1)" : "none", ...rise(sp(f, a + 56 + i * 8), 20) }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: i === 3 ? RED : B.primary }} />
            <span style={{ ...D, fontSize: 54, color: i === 3 ? RED : B.ink }}>{r}</span>
          </div>
        ))}
        <div style={{ position: "absolute", right: -20, bottom: -50, padding: "14px 26px", border: `6px solid ${RED}`, borderRadius: 16, ...D, fontSize: 56, color: RED, background: "rgba(242,240,234,.9)",
          transform: `rotate(-12deg) scale(${interpolate(stamp, [0, 1], [2, 1])})`, opacity: Math.min(1, stamp * 3) }}>Never replicated</div>
      </div>
    </Scene>
  );
}

function Brain({ f }) {
  const a = T.BRAIN, hrs = Math.round(21 * interpolate(f, [a + 10, a + 60], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 2 }));
  return (
    <Scene f={f} a={a} b={T.FIN}>
      <Title f={f} at={a} tag="Exam night" tagColor={GRN} a="No sleep?" b="It helps your brain too." />
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center" }}>
        <div style={{ ...H, fontSize: 300, color: B.lo, lineHeight: 0.9, textShadow: "0 0 80px rgba(139,128,255,.5)", fontVariantNumeric: "tabular-nums" }}>{hrs}h</div>
        <Tag style={{ marginTop: 10 }}>awake, no sleep</Tag>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1140, ...rise(sp(f, a + 64), 40) }}>
        <div style={{ ...H, fontSize: 66 }}>One high dose helped</div>
        <div style={{ ...H, fontSize: 66, color: B.lo }}>memory & thinking.</div>
      </div>
      <Cite f={f} at={a + 70}>Small study (15 adults), Gordji-Nejad et al., Scientific Reports, 2024</Cite>
    </Scene>
  );
}

function Finale({ f }) {
  if (f < T.FIN - 2) return null;
  const a = T.FIN, out = interpolate(f, [T.END - 8, T.END], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(out, interpolate(f, [a - 2, a + 6], [0, 1], clamp)) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <Tag style={rise(sp(f, a + 2))}>So how much?</Tag>
        <div style={{ ...H, fontSize: 210, textTransform: "none", color: B.lo, lineHeight: 0.9, marginTop: 10, textShadow: "0 0 80px rgba(139,128,255,.5)", ...pop(sp(f, a + 8, 10, 240)) }}>3–5 g</div>
        <div style={{ ...H, fontSize: 84, ...rise(sp(f, a + 30)) }}>a day. Every day.</div>
      </div>
    </AbsoluteFill>
  );
}

function End({ f }) {
  if (f < T.END - 2) return null;
  const a = T.END, cta = sp(f, a + 26, 9, 260), t = f - a;
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [a - 2, a + 6], [0, 1], clamp) }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...H, fontSize: 110, ...rise(sp(f, a + 2, 12, 240), 60) }}>Creatine helps.</div>
        <div style={{ ...H, fontSize: 110, color: B.lo, ...rise(sp(f, a + 8, 12, 240), 60) }}>Your plan does</div>
        <div style={{ ...H, fontSize: 110, color: B.lo, ...rise(sp(f, a + 12, 12, 240), 60) }}>the work.</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1330, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 34px 14px 16px", borderRadius: 26, background: B.cream, boxShadow: "0 24px 60px rgba(91,78,229,.45)",
          transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, t - 50) / 5)))})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 88, height: 88, borderRadius: 20 }} />
          <div>
            <div style={{ ...D, fontSize: 30, color: B.primary, letterSpacing: "0.06em" }}>Your plan, built for you</div>
            <div style={{ ...D, fontSize: 68, color: B.ink }}>Darebni AI</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

const SPIN0 = 0;   // label front faces the camera
// the jar's path through the film (stage px, scale, spin, lid, burst)
function jarState(f) {
  if (f < T.W1 + 4) {
    const d = sp(f, 20, 11, 120);
    return { pos: [540, interpolate(d, [0, 1], [-500, 1240])], s: 0.58, spin: SPIN0 + (1 - Math.min(1, d)) * 9 + 0.35 * Math.sin(f / 26), tilt: 0.12 + (1 - Math.min(1, d)) * 0.5, lid: 0, burst: -1,
      o: interpolate(f, [T.W1 - 6, T.W1 + 2], [1, 0], clamp) };
  }
  if (f >= T.FIN - 4) {
    const r = sp(f, T.FIN, 13, 140), popAt = T.FIN + 44, lid = sp(f, popAt, 10, 160), toEnd = sp(f, T.END, 14, 140);
    const y = interpolate(r, [0, 1], [2300, 1150]) - 60 * Math.min(1, toEnd), x = 540 + 230 * Math.min(1, toEnd);
    return { pos: [x, y], s: 0.72 - 0.2 * Math.min(1, toEnd), spin: SPIN0 + (1 - Math.min(1, r)) * 6.28 + 0.3 * Math.sin((f - T.FIN) / 24), tilt: 0.2, lid: f < popAt ? 0 : Math.min(1.2, lid * 1.2), burst: f < popAt ? -1 : (f - popAt) / 30, o: 1 };
  }
  return null;
}

export const CreatineVO = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const cuts = [T.W1, T.STR, T.HAIR, T.BRAIN, T.FIN, T.END];
  const flash = cuts.map((c) => interpolate(f, [c - 1, c, c + 6], [0, 0.22, 0], clamp)).reduce((a, b) => a + b, 0)
    + interpolate(f, [T.FIN + 43, T.FIN + 44, T.FIN + 54], [0, 0.5, 0], clamp);
  const js = jarState(f), drift = Math.sin(f / 60) * 60;
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + drift / 20}% ${60 + drift / 30}%, rgba(91,78,229,.38), transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${f * 0.4}px` }} />
      {js && (
        <AbsoluteFill style={{ opacity: js.o }}>
          <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, position: [0, 0, 9], near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
            <Env />
            <ambientLight intensity={0.25} />
            <directionalLight position={[3, 4, 6]} intensity={2.2} />
            <pointLight position={[-4, 1, 3]} intensity={30} color="#8B80FF" />
            <pointLight position={[4, -2, 2]} intensity={12} color="#B8B0FF" />
            <Jar {...js} />
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      <div style={{ position: "absolute", left: 70, top: 228, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <span style={{ ...D, fontSize: 34, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      </div>
      <Hook f={f} /><Week1 f={f} /><Strength f={f} /><Hair f={f} /><Brain f={f} /><Finale f={f} /><End f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: flash, mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.04} />
      <Audio src={staticFile(music ? "creatinevo.wav" : "creatinevo-sfx.wav")} />
    </AbsoluteFill>
  );
};
