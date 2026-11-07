// Darebni AI "Tips & tricks": how water affects your performance in the gym. Kinetic type + motion graphics, 1080x1920,
// 30 fps, 120 BPM (a beat = 15 frames). One idea carried through: the water level is your performance. A bottle fills under
// the hook, drains as the numbers land, and refills at the end. Every number is from the source shown on screen:
//   ACSM position stand "Exercise and fluid replacement", Sawka et al., Med Sci Sports Exerc 2007 (>2% body-weight loss
//     hurts performance; 5-7 mL/kg about 4 h before exercise; urine colour as a check)
//   Savoie et al., Sports Medicine 2015, meta-analysis of hypohydration: strength -5.5%, muscle endurance -8.3%,
//     anaerobic power -5.8%
//   Shirreffs & Maughan, Am J Physiol 1998 (drink about 1.5 L for each kg lost, to rehydrate fully)
// The 80 kg / 100 kg examples are plain arithmetic on those numbers.
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain, shake } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

export const WT = { HOOK: 0, BOTTLE: 40, DROP: 105, DRAIN: 180, STATS: 255, ROW0: 285, ROW_STEP: 45, BENCH: 450,
  TIPS: 555, TIP_LEN: 105, BRIDGE: 870, OUTRO: 945 };
WT.DURATION = WT.OUTRO + END_LEN;   // 1200 = 40 s
const { HOOK, BOTTLE, DROP, DRAIN, STATS, ROW0, ROW_STEP, BENCH, TIPS, TIP_LEN, BRIDGE, OUTRO } = WT;
const AQUA = "#38BDF8", AQUA2 = "#7DD3FC", RED = "#FF4D6A", GRN = "#3DDC97", GOLD = "#FFC94A", PAPER = B.cream;
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.6, o = "50% 50%") => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: o });
const fadeOut = (f, at, len = 8) => interpolate(f, [at - len, at], [1, 0], clamp);
const lerp = (a, b, p) => a + (b - a) * p;
const num = (v, d = 1) => v.toFixed(d);

// ---- the bottle: a glass outline, a wavy water surface, rising bubbles, a "WATER" label ----------------------------
const BODY = "M80,40 L120,40 L120,82 C120,104 170,112 170,152 L170,440 Q170,476 134,476 L66,476 Q30,476 30,440 L30,152 C30,112 80,104 80,82 Z";
function Bottle({ f, cx, top, h, level, tilt = 0, glow = 0, id = "b" }) {
  const w = h * (200 / 480), y = 476 - level * (476 - 70), amp = 5 + 3 * Math.sin(f / 9);
  let d = `M0,${y}`;
  for (let x = 0; x <= 200; x += 8) d += ` L${x},${y + amp * Math.sin(x / 22 + f / 5) + 2 * Math.sin(x / 9 - f / 3)}`;
  d += " L200,480 L0,480 Z";
  const bubbles = Array.from({ length: 14 }, (_, i) => {
    const sx = 45 + random(`${id}x${i}`) * 110, speed = 1.2 + random(`${id}s${i}`) * 1.8, r = 2 + random(`${id}r${i}`) * 4;
    const by = 470 - ((f * speed + random(`${id}o${i}`) * 400) % 400);
    return by > y + 8 ? <circle key={i} cx={sx + 4 * Math.sin(f / 7 + i)} cy={by} r={r} fill="rgba(255,255,255,.45)" /> : null;
  });
  return (
    <svg width={w} height={h} viewBox="0 0 200 480" style={{ position: "absolute", left: cx - w / 2, top, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 90%", overflow: "visible",
      filter: `drop-shadow(0 0 ${20 + 40 * glow}px rgba(56,189,248,${0.25 + 0.45 * glow}))` }}>
      <defs>
        <clipPath id={`clip-${id}`}><path d={BODY} /></clipPath>
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={AQUA2} /><stop offset="0.45" stopColor={AQUA} /><stop offset="1" stopColor={B.primary} /></linearGradient>
      </defs>
      <path d={BODY} fill="rgba(17,17,43,.55)" />
      <g clipPath={`url(#clip-${id})`}>
        <path d={d} fill={`url(#water-${id})`} />
        <path d={d} fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="3" transform="translate(0,1)" />
        {bubbles}
        <rect x="42" y="150" width="14" height="290" rx="7" fill="rgba(255,255,255,.22)" />
      </g>
      <rect x="30" y="250" width="140" height="70" fill="rgba(7,7,26,.82)" />
      <text x="100" y="298" textAnchor="middle" style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 40, letterSpacing: "0.06em" }} fill={PAPER}>WATER</text>
      <path d={BODY} fill="none" stroke="rgba(184,176,255,.85)" strokeWidth="4" />
      <rect x="70" y="0" width="60" height="38" rx="9" fill={B.primary} stroke={B.lo} strokeWidth="3" />
      <rect x="70" y="10" width="60" height="5" fill="rgba(255,255,255,.25)" /><rect x="70" y="22" width="60" height="5" fill="rgba(255,255,255,.25)" />
    </svg>
  );
}

const Src = ({ f, at, children, top = 1520 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", ...rise(sp(f, at), 20) }}>
    <div style={{ padding: "10px 22px", borderRadius: 14, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.4)", ...UIR, fontSize: 30, color: B.xlo, textAlign: "center" }}>{children}</div>
  </div>
);

// ---- scenes ---------------------------------------------------------------------------------------------------------
function Hook({ f }) {
  if (f > DROP + 10) return null;
  const out = interpolate(f, [DROP - 4, DROP + 8], [0, 1], clamp);
  const k = shake(f, BOTTLE + 14, 14, 4);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${-out * 260}px)`, opacity: 1 - out }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", transform: `translate(${k[0]}px, ${k[1]}px)` }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, 2, 10, 280), 1.8) }}>The cheapest</div>
        <div style={{ ...D, fontSize: 168, color: B.lo, marginTop: 6, ...pop(sp(f, 15, 10, 280), 1.8) }}>pre-workout?</div>
      </div>
    </div>
  );
}

function BottleTrack({ f }) {
  // hook: falls in and fills; drop scene: moves left and drains; then it leaves; bridge: back in the middle, refills
  if (f < BOTTLE - 2 || (f > STATS + 10 && f < BRIDGE - 4) || f > OUTRO + 4) return null;
  if (f >= BRIDGE - 4) {
    const p = sp(f, BRIDGE - 4, 13, 170), lvl = interpolate(f, [BRIDGE + 6, BRIDGE + 50], [0.15, 0.96], clamp);
    return <Bottle id="end" f={f} cx={540} top={lerp(1950, 760, p)} h={760} level={lvl} glow={interpolate(f, [BRIDGE + 40, BRIDGE + 56], [0, 1], clamp)} />;
  }
  const fall = sp(f, BOTTLE, 11, 200), move = sp(f, DROP, 14, 150), leave = interpolate(f, [STATS - 6, STATS + 8], [0, 1], clamp);
  const fill = interpolate(f, [BOTTLE + 10, BOTTLE + 55], [0.05, 0.94], clamp);
  const drain = interpolate(f, [DRAIN, DRAIN + 24], [0, 0.22], clamp);
  const tilt = (1 - Math.min(1, fall)) * -14 + Math.sin(f / 18) * 1.2;
  return <Bottle id="main" f={f} cx={lerp(540, 255, move) - leave * 600} top={lerp(lerp(-900, 700, fall), 600, move)} h={lerp(860, 760, move)} level={fill - drain} tilt={tilt} />;
}

function Drops({ f }) {
  // drips falling off the bottle as it drains
  if (f < DRAIN || f > STATS) return null;
  return Array.from({ length: 6 }, (_, i) => {
    const t = f - DRAIN - i * 5; if (t < 0) return null;
    const y = 1350 + t * t * 0.6, o = interpolate(t, [0, 3, 24, 32], [0, 1, 1, 0], clamp);
    return <svg key={i} width="26" height="36" viewBox="0 0 26 36" style={{ position: "absolute", left: 210 + (i % 3) * 30, top: y, opacity: o }}><path d="M13 0 C13 0 0 16 0 23 a13 13 0 0 0 26 0 C26 16 13 0 13 0Z" fill={AQUA} /></svg>;
  });
}

function DropScene({ f }) {
  if (f < DROP || f > STATS + 6) return null;
  const o = fadeOut(f, STATS + 2), pct = interpolate(f, [DROP + 30, DROP + 48], [0, 2], clamp);
  const hit = shake(f, DRAIN + 12, 16, 4);
  return (
    <div style={{ position: "absolute", left: 470, right: 60, top: 560, opacity: o }}>
      <div style={{ ...UI, fontSize: 52, color: PAPER, ...rise(sp(f, DROP + 18)) }}>Sweat off just</div>
      <div style={{ ...D, fontSize: 300, color: AQUA, lineHeight: 0.86, textShadow: "0 0 60px rgba(56,189,248,.4)", ...pop(sp(f, DROP + 30, 10, 260), 1.5, "0% 60%") }}>{num(pct, 0)}%</div>
      <div style={{ ...D, fontSize: 70, color: PAPER, ...rise(sp(f, DROP + 44)) }}>of your<br />body weight</div>
      <div style={{ ...D, fontSize: 76, color: RED, marginTop: 36, transform: `translate(${hit[0]}px, ${hit[1]}px)`, ...pop(sp(f, DRAIN + 12, 10, 280), 1.5, "0% 50%") }}>and your<br />lifts drop.</div>
      <div style={{ display: "inline-block", marginTop: 30, padding: "10px 18px", borderRadius: 14, background: "rgba(56,189,248,.14)", border: `2px solid ${AQUA}`, ...D, fontSize: 40, color: AQUA2, ...rise(sp(f, DRAIN + 34)) }}>80 kg lifter = 1.6 kg of sweat</div>
      <div style={{ position: "absolute", left: -400, right: 0, top: 960, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "10px 22px", borderRadius: 14, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.4)", ...UIR, fontSize: 30, color: B.xlo, ...rise(sp(f, DRAIN + 44), 20) }}>ACSM position stand · Med Sci Sports Exerc, 2007</div>
      </div>
    </div>
  );
}

const ROWS = [["Strength", 5.5], ["Reps (muscle endurance)", 8.3], ["Power", 5.8]];
function Stats({ f }) {
  if (f < STATS || f > BENCH + 6) return null;
  const o = fadeOut(f, BENCH + 2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...UI, fontSize: 46, color: B.xlo, ...rise(sp(f, STATS + 2)) }}>A meta-analysis found dehydrated lifters lose:</div>
      </div>
      {ROWS.map(([label, v], i) => {
        const at = ROW0 + i * ROW_STEP, p = sp(f, at, 10, 260), cnt = interpolate(f, [at, at + 14], [0, v], clamp);
        const bar = interpolate(f, [at + 6, at + 22], [1, 1 - v / 100], clamp), y = 470 + i * 350, W = 940;
        const k = shake(f, at + 2, 12, 4), lost = interpolate(f, [at + 6, at + 22], [0, 1], clamp);
        if (f < at - 2) return null;
        return (
          <div key={label} style={{ position: "absolute", left: 70, top: y, width: W }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", transform: `translate(${k[0]}px, ${k[1]}px)` }}>
              <div style={{ ...D, fontSize: 62, color: PAPER, ...rise(p) }}>{label}</div>
              <div style={{ ...D, fontSize: 170, color: RED, lineHeight: 0.82, textShadow: "0 0 50px rgba(255,77,106,.35)", ...pop(p, 1.7, "100% 80%") }}>−{num(cnt)}%</div>
            </div>
            <div style={{ position: "relative", marginTop: 22, height: 58, borderRadius: 29, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.35)", overflow: "hidden", opacity: Math.min(1, p * 2) }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${bar * 100}%`, background: `linear-gradient(90deg, ${B.primary}, ${AQUA})` }} />
              <div style={{ position: "absolute", left: `${bar * 100}%`, top: 0, bottom: 0, right: 0, background: RED, opacity: lost * (0.65 + 0.35 * Math.sin(f / 4)) }} />
            </div>
          </div>
        );
      })}
      <Src f={f} at={ROW0 + 2 * ROW_STEP + 20} top={1500}>Savoie et al. · Sports Medicine, 2015 · meta-analysis</Src>
    </div>
  );
}

function Bench({ f }) {
  if (f < BENCH || f > TIPS + 6) return null;
  const o = fadeOut(f, TIPS + 2), kg = interpolate(f, [BENCH + 40, BENCH + 58], [100, 94.5], clamp), red = interpolate(f, [BENCH + 40, BENCH + 50], [0, 1], clamp);
  const strike = interpolate(f, [BENCH + 30, BENCH + 40], [0, 1], clamp), k = shake(f, BENCH + 40, 18, 4);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 440, textAlign: "center", opacity: o }}>
      <Barbell f={f} />
      <div style={{ ...D, fontSize: 96, color: PAPER, ...pop(sp(f, BENCH + 2, 10, 260), 1.5) }}>Your bench</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 20, transform: `translate(${k[0]}px, ${k[1]}px)` }}>
        <div style={{ ...D, fontSize: 330, lineHeight: 0.85, color: red > 0.5 ? RED : AQUA, textShadow: `0 0 70px ${red > 0.5 ? "rgba(255,77,106,.4)" : "rgba(56,189,248,.4)"}`, ...pop(sp(f, BENCH + 12, 10, 260), 1.6) }}>{num(kg, kg % 1 ? 1 : 0)}<span style={{ fontSize: 140 }}> kg</span></div>
      </div>
      <div style={{ ...D, fontSize: 64, color: PAPER, marginTop: 30, opacity: strike, transform: `translateY(${(1 - strike) * 20}px)` }}>−5.5% strength</div>
      <div style={{ ...UI, fontSize: 48, color: B.xlo, marginTop: 18, ...rise(sp(f, BENCH + 62)) }}>Same effort. Just less water.</div>
    </div>
  );
}

// a loaded barbell under the number; when the strength drops, a small plate flies off each side
function Barbell({ f }) {
  const p = sp(f, BENCH + 6, 12, 200), t = f - (BENCH + 42);
  const Plate = ({ x, h, w, c, flyDir = 0 }) => {
    const fly = flyDir && t > 0 ? { transform: `translate(${flyDir * t * 9}px, ${t * t * 1.1 - t * 10}px) rotate(${flyDir * t * 14}deg)`, opacity: interpolate(t, [0, 26, 34], [1, 1, 0], clamp) } : {};
    return <div style={{ position: "absolute", left: x - w / 2, top: 120 - h / 2, width: w, height: h, borderRadius: 10, background: c, border: "3px solid rgba(7,7,26,.6)", ...fly }} />;
  };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 240, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * 60}px)` }}>
      <div style={{ position: "absolute", left: 20, right: 20, top: 110, height: 20, borderRadius: 10, background: "linear-gradient(180deg, #D7D5E8, #8E8BA8)" }} />
      <div style={{ position: "absolute", left: 220, width: 18, top: 92, height: 56, borderRadius: 6, background: "#B9B6CF" }} />
      <div style={{ position: "absolute", right: 220, width: 18, top: 92, height: 56, borderRadius: 6, background: "#B9B6CF" }} />
      {[[-1, 150], [1, 790]].map(([dir, cx]) => (
        <div key={dir}>
          <Plate x={cx + dir * -40} h={220} w={44} c={B.primary} />
          <Plate x={cx + dir * 8} h={180} w={36} c={AQUA} />
          <Plate x={cx + dir * 46} h={110} w={26} c={RED} flyDir={dir} />
        </div>
      ))}
    </div>
  );
}

const SWATCH = ["#F8F4C4", "#F3E58A", "#E8CB55", "#D6A23A", "#B07824"];
function Tip({ f, i }) {
  const at = TIPS + 20 + i * TIP_LEN, end = at + TIP_LEN - 12;
  if (f < at - 4 || f > end + 14) return null;
  const inn = sp(f, at, 14, 170), out = interpolate(f, [end, end + 12], [0, 1], clamp);
  const x = (1 - Math.min(1, inn)) * 700 - out * 900;
  const tags = ["01 · Before", "02 · Check", "03 · After"];
  return (
    <div style={{ position: "absolute", left: 70 + x, top: 620, width: 940, height: 740, borderRadius: 40, background: "linear-gradient(180deg, rgba(23,22,58,.96), rgba(13,12,40,.96))",
      border: `3px solid ${i === 1 ? GOLD : AQUA}`, boxShadow: "0 40px 100px rgba(0,0,0,.5)", padding: "54px 60px", boxSizing: "border-box", opacity: 1 - out }}>
      <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: 12, background: i === 1 ? GOLD : AQUA, ...D, fontSize: 40, color: B.ink, letterSpacing: "0.06em" }}>{tags[i]}</div>
      {i === 0 && (<>
        <div style={{ ...D, fontSize: 150, color: PAPER, marginTop: 40, ...rise(sp(f, at + 8)) }}>5–7 mL</div>
        <div style={{ ...D, fontSize: 78, color: AQUA2, ...rise(sp(f, at + 12)) }}>per kg of body weight</div>
        <div style={{ ...UI, fontSize: 50, color: PAPER, marginTop: 26, ...rise(sp(f, at + 18)) }}>about 4 hours before you train</div>
        <div style={{ display: "inline-block", marginTop: 50, padding: "14px 24px", borderRadius: 16, background: "rgba(56,189,248,.14)", border: `2px solid ${AQUA}`, ...D, fontSize: 52, color: AQUA2, ...pop(sp(f, at + 30, 10, 260), 1.4, "0% 50%") }}>80 kg → 400–560 mL</div>
        <div style={{ position: "absolute", left: 60, bottom: 50, ...UIR, fontSize: 30, color: B.xlo }}>ACSM position stand, 2007</div>
      </>)}
      {i === 1 && (<>
        <div style={{ ...D, fontSize: 110, color: PAPER, marginTop: 40, ...rise(sp(f, at + 8)) }}>Check your pee</div>
        <div style={{ display: "flex", gap: 18, marginTop: 50 }}>
          {SWATCH.map((c, k) => {
            const p = sp(f, at + 14 + k * 4, 11, 260);
            return <div key={c} style={{ width: 150, height: 150, borderRadius: 28, background: c, border: `4px solid ${k === 0 ? GRN : k >= 3 ? RED : "transparent"}`, ...pop(p, 0.4) }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
          <div style={{ ...D, fontSize: 52, color: GRN, ...rise(sp(f, at + 40)) }}>✓ Pale yellow<br /><span style={{ fontSize: 40, color: PAPER }}>ready to train</span></div>
          <div style={{ ...D, fontSize: 52, color: RED, textAlign: "right", ...rise(sp(f, at + 50)) }}>✕ Dark<br /><span style={{ fontSize: 40, color: PAPER }}>drink more first</span></div>
        </div>
        <div style={{ position: "absolute", left: 60, bottom: 50, ...UIR, fontSize: 30, color: B.xlo }}>ACSM position stand, 2007</div>
      </>)}
      {i === 2 && (<>
        <div style={{ ...UI, fontSize: 52, color: PAPER, marginTop: 40, ...rise(sp(f, at + 8)) }}>Weigh in before & after</div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 24, ...rise(sp(f, at + 14)) }}>
          <div style={{ ...D, fontSize: 100, color: PAPER }}>80.0</div>
          <svg width="70" height="40" viewBox="0 0 70 40"><path d="M2 20 H60 M44 4 L64 20 L44 36" fill="none" stroke={B.lo} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div style={{ ...D, fontSize: 100, color: RED }}>{num(interpolate(f, [at + 18, at + 34], [80, 79], clamp))}<span style={{ fontSize: 50 }}> kg</span></div>
        </div>
        <div style={{ ...D, fontSize: 130, color: AQUA, marginTop: 40, lineHeight: 0.9, ...pop(sp(f, at + 40, 10, 260), 1.4, "0% 50%") }}>Drink 1.5 L</div>
        <div style={{ ...D, fontSize: 78, color: PAPER, ...rise(sp(f, at + 46)) }}>for every kg lost</div>
        <div style={{ position: "absolute", left: 60, bottom: 50, ...UIR, fontSize: 30, color: B.xlo }}>Shirreffs & Maughan, Am J Physiol, 1998</div>
      </>)}
    </div>
  );
}

function Tips({ f }) {
  if (f < TIPS - 2 || f > BRIDGE + 4) return null;
  const o = fadeOut(f, BRIDGE + 2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, top: 300, display: "flex", alignItems: "flex-end", gap: 22 }}>
        <div style={{ ...D, fontSize: 130, color: PAPER, ...pop(sp(f, TIPS, 10, 260), 1.6, "0% 80%") }}>Fix it</div>
        <div style={{ ...D, fontSize: 130, color: AQUA, ...pop(sp(f, TIPS + 6, 10, 260), 1.6, "0% 80%") }}>in 3 steps</div>
      </div>
      {[0, 1, 2].map((i) => <Tip key={i} f={f} i={i} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, display: "flex", justifyContent: "center", gap: 14 }}>
        {[0, 1, 2].map((i) => { const on = f >= TIPS + 20 + i * TIP_LEN; return <div key={i} style={{ width: on ? 60 : 18, height: 18, borderRadius: 9, background: on ? AQUA : "rgba(242,240,234,.25)" }} />; })}
      </div>
    </div>
  );
}

function Bridge({ f }) {
  if (f < BRIDGE || f > OUTRO + 4) return null;
  const o = fadeOut(f, OUTRO + 2);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: o }}>
      <div style={{ ...D, fontSize: 116, color: PAPER, ...pop(sp(f, BRIDGE + 4, 10, 260), 1.6) }}>Water fuels the set.</div>
      <div style={{ ...D, fontSize: 116, color: B.lo, marginTop: 8, ...pop(sp(f, BRIDGE + 34, 10, 260), 1.6) }}>Darebni AI plans it.</div>
    </div>
  );
}

export const WaterTips = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const glow = 0.33 + 0.07 * Math.sin(f / 14);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, rgba(91,78,229,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {f < OUTRO + 4 && (
        <div style={{ position: "absolute", left: 70, right: 70, top: 200, display: "flex", alignItems: "center", gap: 14, opacity: fadeOut(f, OUTRO + 2) }}>
          <Img src={staticFile("darebni-icon.png")} style={{ width: 52, height: 52, borderRadius: 13 }} />
          <span style={{ ...D, fontSize: 34, color: PAPER, letterSpacing: "0.04em" }}>Darebni AI</span>
          <span style={{ marginLeft: "auto", ...D, fontSize: 30, color: AQUA2, letterSpacing: "0.08em" }}>Tips & tricks</span>
        </div>
      )}
      <Hook f={f} />
      <BottleTrack f={f} />
      <Drops f={f} />
      <DropScene f={f} />
      <Stats f={f} />
      <Bench f={f} />
      <Tips f={f} />
      <Bridge f={f} />
      {f >= OUTRO - 2 && <Outro f={f} start={OUTRO} />}
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [OUTRO - 2, OUTRO, OUTRO + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.035} />
      <Audio src={staticFile(music ? "watertips.wav" : "watertips-sfx.wav")} />
    </AbsoluteFill>
  );
};
