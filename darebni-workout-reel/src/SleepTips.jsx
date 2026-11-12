// Darebni AI "Tips & tricks": sleep and muscle. Kinetic type + motion graphics, 1080x1920, 30 fps, read by a voice-over
// (sound/build_sleep_vo.py -> src/sleep_vo.json gives every scene start and keyword frame). One idea carried through: a
// "recovery battery" that charges while you sleep. It drains under the hook (5 hours), the evidence shows what a short
// night costs, and it charges full at the end. The battery is a metaphor, not data. Every number is from the source
// shown on screen:
//   Lamon et al., Physiological Reports 2021 (13 healthy young adults, randomized crossover): one night of total sleep
//     deprivation -> muscle protein synthesis -18%, cortisol +21%, testosterone -24% the next morning
//   Nedeltcheva et al., Annals of Internal Medicine 2010 (10 overweight adults, 14 days of calorie restriction, 5.5 vs
//     8.5 h in bed): fat share of the weight lost -55% (0.6 vs 1.4 kg fat), fat-free mass loss +60% (2.4 vs 1.5 kg)
//   AASM / SRS consensus statement, Watson et al., SLEEP 2015: adults should sleep 7 or more hours a night, regularly
//   Gardiner et al., Sleep Medicine Reviews 2023: coffee (107 mg) at least 8.8 h before bed
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain, shake } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import V from "./sleep_vo.json";

const S = V.scenes, M = V.marks, LINE = Object.fromEntries(V.lines.map((l) => [l.id, l.start]));
export const SLT = { NIGHT: S.night.start, CUT: S.cut.start, TIPS: S.tips.start, BRIDGE: S.bridge.start, OUTRO: S.outro.start, DURATION: V.duration };
const { NIGHT, CUT, TIPS, BRIDGE, OUTRO } = SLT;
const TIPAT = [M.TIP0, M.TIP1, M.TIP2];
const MOON = "#A5B4FC", MOON2 = "#C7D2FE", GRN = "#3DDC97", RED = "#FF4D6A", GOLD = "#FFC94A", PAPER = B.cream;
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.6, o = "50% 50%") => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: o });
const fadeOut = (f, at, len = 8) => interpolate(f, [at - len, at], [1, 0], clamp);
const lerp = (a, b, p) => a + (b - a) * p;
const num = (v, d = 0) => v.toFixed(d);
const sh = (k) => `translate(${k[0]}px, ${k[1]}px)`;

// ---- the recovery battery -------------------------------------------------------------------------------------------
export function Battery({ f, cx, cy, w, level, label = "Recovery", glow = 0 }) {
  const h = w * 0.46, pad = w * 0.035, inner = (w - 2 * pad) * Math.max(0, Math.min(1, level));
  const col = level > 0.6 ? GRN : level > 0.3 ? GOLD : RED;
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w + w * 0.06, height: h }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: h * 0.22, border: `${w * 0.022}px solid rgba(199,210,254,.9)`, boxSizing: "border-box",
        background: "rgba(17,17,43,.75)", boxShadow: `0 0 ${30 + 50 * glow}px rgba(${level > 0.6 ? "61,220,151" : "255,77,106"},${0.15 + 0.45 * glow})` }}>
        <div style={{ position: "absolute", left: pad, top: pad, bottom: pad, width: inner, borderRadius: h * 0.14, background: `linear-gradient(90deg, ${col}cc, ${col})` }} />
        {[1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: pad + (w - 2 * pad) * i / 4 - 2, top: pad, bottom: pad, width: 4, background: "rgba(7,7,26,.35)" }} />)}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: h * 0.38, color: PAPER, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>{num(level * 100)}%</div>
      </div>
      <div style={{ position: "absolute", left: w, top: h * 0.3, width: w * 0.06, height: h * 0.4, borderRadius: "0 10px 10px 0", background: "rgba(199,210,254,.9)" }} />
      <div style={{ position: "absolute", left: 0, width: w, top: h + 16, textAlign: "center", ...D, fontSize: h * 0.2, color: MOON2, letterSpacing: "0.1em" }}>{label}</div>
    </div>
  );
}
function Moon({ x, y, r, o = 1 }) {
  return (
    <svg width={r * 2.4} height={r * 2.4} style={{ position: "absolute", left: x - r * 1.2, top: y - r * 1.2, opacity: o, overflow: "visible", filter: "drop-shadow(0 0 30px rgba(165,180,252,.6))" }}>
      <defs><mask id={`mm${r}`}><rect width="100%" height="100%" fill="white" /><circle cx={r * 1.6} cy={r * 0.85} r={r} fill="black" /></mask></defs>
      <circle cx={r * 1.2} cy={r * 1.2} r={r} fill={MOON2} mask={`url(#mm${r})`} />
    </svg>
  );
}
function Stars({ f, o = 1 }) {
  return Array.from({ length: 26 }, (_, i) => {
    const x = random(`sx${i}`) * 1080, y = 160 + random(`sy${i}`) * 900, s = 2 + random(`ss${i}`) * 3, tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (14 + i) + i));
    return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: MOON2, opacity: o * tw * 0.7 }} />;
  });
}
const Src = ({ f, at, children, top = 1530 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", ...rise(sp(f, at), 20) }}>
    <div style={{ padding: "10px 22px", borderRadius: 14, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.4)", ...UIR, fontSize: 30, color: B.xlo, textAlign: "center" }}>{children}</div>
  </div>
);

// ---- scenes ---------------------------------------------------------------------------------------------------------
function Hook({ f }) {
  if (f > NIGHT + 8) return null;
  const o = fadeOut(f, NIGHT + 6), drain = interpolate(f, [M.FIVE - 2, M.FIVE + 40], [0.92, 0.35], clamp), k = shake(f, M.FIVE + 4, 14, 4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Stars f={f} o={Math.min(1, f / 20)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 104, color: PAPER, ...pop(sp(f, M.T1, 10, 280), 1.3) }}>You trained hard today.</div>
        <div style={{ transform: sh(k) }}><div style={{ ...D, fontSize: 104, color: RED, marginTop: 10, ...pop(sp(f, M.FIVE - 10, 9, 300), 1.3) }}>Then you slept 5 hours.</div></div>
      </div>
      <Moon x={540} y={760} r={90} o={Math.min(1, sp(f, 4) * 2)} />
      <div style={{ ...rise(sp(f, 6, 13, 170), 120) }}><Battery f={f} cx={540} cy={1180} w={640} level={drain} /></div>
    </div>
  );
}

function Night({ f }) {
  if (f < NIGHT - 4 || f > CUT + 8) return null;
  const o = fadeOut(f, CUT + 6), cnt = interpolate(f, [M.P18 - 3, M.P18 + 14], [0, 18], clamp), k = shake(f, M.P18, 16, 4);
  const lvl = interpolate(f, [M.P18 - 3, M.P18 + 20], [0.82, 0.64], clamp);
  const Card = ({ label, v, up, at }) => (
    <div style={{ flex: 1, padding: "22px 20px", borderRadius: 24, background: "rgba(255,77,106,.12)", border: `3px solid ${RED}`, textAlign: "center", ...pop(sp(f, at - 3, 10, 260), 1.4) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <svg width="56" height="56" viewBox="0 0 24 24" style={{ transform: up ? "none" : "rotate(180deg)" }}><path d="M12 20 V5 M5 11 L12 4 L19 11" fill="none" stroke={RED} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{ ...D, fontSize: 96, color: RED, lineHeight: 0.9 }}>{v}</div>
      </div>
      <div style={{ ...D, fontSize: 44, color: PAPER, marginTop: 6 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...UI, fontSize: 48, color: MOON2, ...rise(sp(f, NIGHT + 4)) }}>One study, one night with no sleep:</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 10, transform: sh(k) }}>
          <div style={{ ...D, fontSize: 220, color: RED, lineHeight: 0.84, textShadow: "0 0 50px rgba(255,77,106,.35)", ...pop(sp(f, M.P18 - 3, 10, 260), 1.6, "0% 80%") }}>−{Math.round(cnt)}%</div>
          <div style={{ ...D, fontSize: 60, color: PAPER, marginBottom: 14, ...rise(sp(f, M.MPS - 3)) }}>muscle protein<br />synthesis</div>
        </div>
        <div style={{ ...UI, fontSize: 40, color: B.xlo, marginTop: 10, ...rise(sp(f, M.P18 + 10)) }}>the process that builds muscle, the next day</div>
      </div>
      <Battery f={f} cx={540} cy={960} w={560} level={lvl} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1200, display: "flex", gap: 24 }}>
        <Card label="Cortisol" v="+21%" up at={M.CORT} />
        <Card label="Testosterone" v="−24%" at={M.TEST} />
      </div>
      <Src f={f} at={M.TEST + 12}>Lamon et al. · Physiological Reports, 2021</Src>
    </div>
  );
}

function Cut({ f }) {
  if (f < CUT - 4 || f > TIPS + 8) return null;
  const o = fadeOut(f, TIPS + 6);
  const Col = ({ x, hrs, fat, lean, good, at }) => {
    const p = interpolate(f, [at, at + 24], [0, 1], clamp), sc = 150;
    const Bar = ({ v, color, label, d }) => (
      <div style={{ textAlign: "center", width: 150 }}>
        <div style={{ ...D, fontSize: 46, color, opacity: Math.min(1, p * 2) }}>{num(v * p, 1)} kg</div>
        <div style={{ height: 380, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ width: 110, height: v * sc * p, borderRadius: 18, background: color, boxShadow: `0 0 30px ${color}66` }} />
        </div>
        <div style={{ ...D, fontSize: 34, color: PAPER, marginTop: 10 }}>{label}</div>
      </div>
    );
    return (
      <div style={{ position: "absolute", left: x, top: 640, width: 400, ...rise(sp(f, at - 6)) }}>
        <div style={{ textAlign: "center", padding: "10px 0", borderRadius: 16, background: good ? "rgba(61,220,151,.14)" : "rgba(255,77,106,.14)", border: `3px solid ${good ? GRN : RED}`, ...D, fontSize: 52, color: good ? GRN : RED }}>{hrs} sleep</div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 26 }}>
          <Bar v={fat} color={GOLD} label="fat lost" />
          <Bar v={lean} color={MOON} label="muscle lost" />
        </div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, M.CUT - 3, 10, 260), 1.5, "0% 50%") }}>On a diet?</div>
        <div style={{ ...UI, fontSize: 44, color: B.xlo, marginTop: 6, ...rise(sp(f, M.CUT + 10)) }}>same diet, 14 days, different sleep</div>
      </div>
      <Col x={80} hrs="8.5 h" fat={1.4} lean={1.5} good at={M.H55 - 20} />
      <Col x={600} hrs="5.5 h" fat={0.6} lean={2.4} at={M.H55} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1250, display: "flex", gap: 20 }}>
        <div style={{ flex: 1, padding: "16px 18px", borderRadius: 20, background: "rgba(255,201,74,.12)", border: `2px solid ${GOLD}`, textAlign: "center", ...pop(sp(f, M.FAT - 3, 10, 260), 1.4) }}>
          <div style={{ ...D, fontSize: 80, color: GOLD, lineHeight: 0.9 }}>−55%</div><div style={{ ...D, fontSize: 34, color: PAPER, marginTop: 4 }}>share of weight lost as fat</div>
        </div>
        <div style={{ flex: 1, padding: "16px 18px", borderRadius: 20, background: "rgba(165,180,252,.12)", border: `2px solid ${MOON}`, textAlign: "center", ...pop(sp(f, M.MUS - 3, 10, 260), 1.4) }}>
          <div style={{ ...D, fontSize: 80, color: MOON2, lineHeight: 0.9 }}>+60%</div><div style={{ ...D, fontSize: 34, color: PAPER, marginTop: 4 }}>more muscle lost</div>
        </div>
      </div>
      <Src f={f} at={M.MUS + 12}>Nedeltcheva et al. · Annals of Internal Medicine, 2010</Src>
    </div>
  );
}

const Tick = ({ size = 50, color = GRN }) => (
  <div style={{ flex: "none", width: size, height: size, borderRadius: size / 2, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={B.ink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);
function Tip({ f, i }) {
  const at = TIPAT[i] - 6, end = (i < 2 ? TIPAT[i + 1] - 6 : BRIDGE) - 12;
  if (f < at - 4 || f > end + 14) return null;
  const inn = sp(f, at, 14, 170), out = interpolate(f, [end, end + 12], [0, 1], clamp);
  const x = (1 - Math.min(1, inn)) * 700 - out * 900;
  const data = [
    ["01 · Duration", "7+ hours", "every night, not just weekends", "AASM / SRS consensus · SLEEP, 2015", MOON],
    ["02 · Rhythm", "Same bedtime", "even on weekends", "", GOLD],
    ["03 · Caffeine", "≥ 8.8 h", "from last coffee to bed", "Gardiner et al. · Sleep Med Rev, 2023", "#E8B98C"],
  ][i];
  return (
    <div style={{ position: "absolute", left: 70 + x, top: 600, width: 940, height: 720, borderRadius: 40, background: "linear-gradient(180deg, rgba(23,22,58,.96), rgba(13,12,40,.96))",
      border: `3px solid ${data[4]}`, boxShadow: "0 40px 100px rgba(0,0,0,.5)", padding: "54px 60px", boxSizing: "border-box", opacity: 1 - out }}>
      <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: 12, background: data[4], ...D, fontSize: 40, color: B.ink, letterSpacing: "0.06em" }}>{data[0]}</div>
      <div style={{ ...D, fontSize: 170, color: PAPER, marginTop: 50, lineHeight: 0.9, ...rise(sp(f, at + 8)) }}>{data[1]}</div>
      <div style={{ ...D, fontSize: 64, color: data[4], marginTop: 20, ...rise(sp(f, at + 14)) }}>{data[2]}</div>
      {i === 1 && <div style={{ display: "flex", gap: 14, marginTop: 50 }}>{["M", "T", "W", "T", "F", "S", "S"].map((d, k) => (
        <div key={k} style={{ flex: 1, textAlign: "center", padding: "14px 0", borderRadius: 16, background: k > 4 ? "rgba(255,201,74,.18)" : "rgba(165,180,252,.12)", border: `2px solid ${k > 4 ? GOLD : "rgba(165,180,252,.4)"}`, ...pop(sp(f, at + 20 + k * 3, 11, 260), 0.5) }}>
          <div style={{ ...D, fontSize: 34, color: PAPER }}>{d}</div><div style={{ ...D, fontSize: 30, color: k > 4 ? GOLD : MOON2, marginTop: 4 }}>11pm</div>
        </div>))}</div>}
      {data[3] && <div style={{ position: "absolute", left: 60, bottom: 50, ...UIR, fontSize: 30, color: B.xlo }}>{data[3]}</div>}
    </div>
  );
}
function Tips({ f }) {
  if (f < TIPS - 2 || f > BRIDGE + 4) return null;
  const o = fadeOut(f, BRIDGE + 2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, top: 300, display: "flex", alignItems: "flex-end", gap: 22 }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, M.FIX - 3, 10, 260), 1.6, "0% 80%") }}>Protect</div>
        <div style={{ ...D, fontSize: 120, color: MOON, ...pop(sp(f, M.FIX + 8, 10, 260), 1.6, "0% 80%") }}>your gains</div>
      </div>
      {[0, 1, 2].map((i) => <Tip key={i} f={f} i={i} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1370, display: "flex", justifyContent: "center", gap: 14 }}>
        {[0, 1, 2].map((i) => { const on = f >= TIPAT[i] - 6; return <div key={i} style={{ width: on ? 60 : 18, height: 18, borderRadius: 9, background: on ? MOON : "rgba(242,240,234,.25)" }} />; })}
      </div>
    </div>
  );
}

function Bridge({ f }) {
  if (f < BRIDGE - 2 || f > OUTRO + 4) return null;
  const o = fadeOut(f, OUTRO + 2), lvl = interpolate(f, [BRIDGE + 10, BRIDGE + 70], [0.3, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Stars f={f} o={Math.min(1, (f - BRIDGE) / 15)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 96, color: PAPER, ...pop(sp(f, M.BR1 - 4, 10, 260), 1.6) }}>You train it in the gym.</div>
        <div style={{ ...D, fontSize: 96, color: MOON, marginTop: 6, ...pop(sp(f, M.BR2 - 4, 10, 260), 1.6) }}>You build it in bed.</div>
        <div style={{ ...D, fontSize: 70, color: B.lo, marginTop: 30, ...pop(sp(f, LINE.e2 - 2, 10, 260), 1.6) }}>Darebni AI plans the training.</div>
      </div>
      <Moon x={540} y={880} r={80} o={Math.min(1, sp(f, BRIDGE + 4) * 2)} />
      <Battery f={f} cx={540} cy={1250} w={620} level={lvl} label="Recovery" glow={lvl > 0.95 ? 1 : 0.3} />
    </div>
  );
}

export const SleepTips = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const glow = 0.3 + 0.07 * Math.sin(f / 14);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, rgba(79,70,229,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {f < OUTRO + 4 && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 200, display: "flex", alignItems: "center", gap: 14, opacity: fadeOut(f, OUTRO + 2) }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 52, height: 52, borderRadius: 13 }} />
          <span style={{ ...D, fontSize: 34, color: PAPER, letterSpacing: "0.04em" }}>Darebni AI</span>
          <span style={{ marginLeft: "auto", ...D, fontSize: 30, color: MOON2, letterSpacing: "0.08em" }}>Tips & tricks</span>
        </div>
      )}
      <Hook f={f} />
      <Night f={f} />
      <Cut f={f} />
      <Tips f={f} />
      <Bridge f={f} />
      {f >= OUTRO - 2 && <Outro f={f} start={OUTRO} />}
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [OUTRO - 2, OUTRO, OUTRO + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.035} />
      <Audio src={staticFile(music ? "sleeptips.wav" : "sleeptips-sfx.wav")} />
    </AbsoluteFill>
  );
};
