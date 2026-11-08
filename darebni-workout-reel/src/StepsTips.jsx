// Darebni AI "Tips & tricks": is 10,000 steps a day worth the hype, and does it fit your life? Kinetic type + motion
// graphics, 1080x1920, 30 fps, read by a voice-over (sound/build_steps_vo.py -> src/steps_vo.json gives every scene start
// and keyword frame, so the type lands on the spoken word). One idea carried through: a step-counter ring. It races to
// 10,000 under the hook, gets stamped "HYPE?", hands over to the evidence (where the benefit really sits), and comes back
// at the end set to the goal that fits your life: 7,000+.
// Every number is from the source shown on screen:
//   origin: the 1965 Japanese "manpo-kei" pedometer (literally "10,000-step meter"), a marketing number
//   Ding et al., Lancet Public Health 2025, 57 studies: 7,000 vs 2,000 steps/day -> all-cause mortality -47%, dementia
//     -38%, depressive symptoms -22%; for most outcomes the benefit levels off past ~7,000
//   Paluch et al., Lancet Public Health 2022, 15 cohorts: the mortality benefit levels off at 8,000-10,000 steps/day
//     under 60 and 6,000-8,000 at 60+
//   Buffey et al., Sports Medicine 2022: 2-5 min light walks every 20-30 min lower post-meal blood sugar vs sitting
// The risk curve is drawn through the two published points (2,000 = reference, 7,000 = -47%) and flattens after, as
// the review describes; it is a picture of the shape, not extra data. "+1,000 a week" is practical advice, not a study.
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain, shake } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import V from "./steps_vo.json";

const S = V.scenes, M = V.marks, LINE = Object.fromEntries(V.lines.map((l) => [l.id, l.start]));
export const SPT = { ORIGIN: S.origin.start, SCIENCE: S.science.start, AGE: S.age.start, TIPS: S.tips.start,
  VERDICT: S.verdict.start, BRIDGE: S.bridge.start, OUTRO: S.outro.start, DURATION: V.duration };
const { ORIGIN, SCIENCE, AGE, TIPS, VERDICT, BRIDGE, OUTRO } = SPT;
const TIPAT = [M.TIP0, M.TIP1, M.TIP2];
const GRN = "#3DDC97", GRN2 = "#86EFC1", RED = "#FF4D6A", GOLD = "#FFC94A", SEPIA = "#E8C98F", PAPER = B.cream;
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.6, o = "50% 50%") => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: o });
const fadeOut = (f, at, len = 8) => interpolate(f, [at - len, at], [1, 0], clamp);
const lerp = (a, b, p) => a + (b - a) * p;
const fmt = (n) => Math.round(n).toLocaleString("en-US");
const sh = (k) => `translate(${k[0]}px, ${k[1]}px)`;

// ---- the step ring ---------------------------------------------------------------------------------------------------
export function Ring({ f, cx, cy, r, value, max = 10000, label = "steps", color = GRN, glow = 0, scale = 1, opacity = 1, goal }) {
  const C = 2 * Math.PI * r, p = Math.min(1, value / max), sw = r * 0.15;
  const tickA = goal ? (goal / max) * 360 - 90 : 0;
  return (
    <div style={{ position: "absolute", left: cx - r - sw, top: cy - r - sw, width: 2 * (r + sw), height: 2 * (r + sw), opacity, transform: `scale(${scale})` }}>
      <svg width={2 * (r + sw)} height={2 * (r + sw)} style={{ position: "absolute", inset: 0, overflow: "visible", filter: `drop-shadow(0 0 ${18 + 40 * glow}px rgba(61,220,151,${0.25 + 0.5 * glow}))` }}>
        <defs><linearGradient id={`rg-${r}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={B.lo} /><stop offset="1" stopColor={color} /></linearGradient></defs>
        <circle cx={r + sw} cy={r + sw} r={r} fill="rgba(17,17,43,.7)" stroke="rgba(139,128,255,.18)" strokeWidth={sw} />
        <circle cx={r + sw} cy={r + sw} r={r} fill="none" stroke={`url(#rg-${r})`} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${C * p} ${C}`} transform={`rotate(-90 ${r + sw} ${r + sw})`} />
        {goal && <g transform={`rotate(${tickA + 90} ${r + sw} ${r + sw})`}><rect x={r + sw - 5} y={sw * 0.1} width="10" height={sw * 1.8} rx="5" fill={GOLD} /></g>}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...D, fontSize: r * 0.5, color: PAPER, lineHeight: 0.9 }}>{fmt(value)}</div>
        <div style={{ ...D, fontSize: r * 0.15, color: GRN2, letterSpacing: "0.12em", marginTop: 8 }}>{label}</div>
      </div>
    </div>
  );
}

// a little footprint pair walking along the bottom (hook + bridge)
function Feet({ f, y, start, color = "rgba(61,220,151,.55)" }) {
  return Array.from({ length: 8 }, (_, i) => {
    const t = f - start - i * 5; if (t < 0) return null;
    const o = interpolate(t, [0, 4, 30, 44], [0, 1, 1, 0], clamp), left = i % 2;
    return (
      <svg key={i} width="40" height="64" viewBox="0 0 40 64" style={{ position: "absolute", left: 120 + i * 110, top: y + (left ? 0 : 36), opacity: o, transform: `rotate(${left ? -8 : 8}deg)` }}>
        <ellipse cx="20" cy="40" rx="14" ry="22" fill={color} /><circle cx="10" cy="10" r="5" fill={color} /><circle cx="20" cy="6" r="5" fill={color} /><circle cx="30" cy="10" r="5" fill={color} />
      </svg>
    );
  });
}

const Src = ({ f, at, children, top = 1530 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", ...rise(sp(f, at), 20) }}>
    <div style={{ padding: "10px 22px", borderRadius: 14, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.4)", ...UIR, fontSize: 30, color: B.xlo, textAlign: "center" }}>{children}</div>
  </div>
);
const Stamp = ({ f, at, text, color = RED, rot = -12, size = 120 }) => {
  const p = sp(f, at, 9, 300);
  return <div style={{ display: "inline-block", padding: "6px 26px", border: `8px solid ${color}`, borderRadius: 18, ...D, fontSize: size, color, transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`, opacity: Math.min(1, p * 3), boxShadow: `0 0 50px ${color}55`, background: "rgba(7,7,26,.55)" }}>{text}</div>;
};

// ---- scenes ---------------------------------------------------------------------------------------------------------
function Hook({ f }) {
  if (f > ORIGIN + 8) return null;
  const o = fadeOut(f, ORIGIN + 6), steps = interpolate(f, [4, 62], [0, 10000], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const k = shake(f, M.HYPE, 18, 4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 150, color: PAPER, ...pop(sp(f, M.T1 - 2, 10, 280), 1.8) }}>10,000 steps</div>
        <div style={{ ...UI, fontSize: 50, color: B.xlo, marginTop: 10, ...rise(sp(f, M.CHASE - 2)) }}>Everyone's chasing it.</div>
      </div>
      <div style={{ transform: sh(k) }}>
        <Ring f={f} cx={540} cy={1050} r={300} value={steps} glow={steps >= 10000 ? 0.8 : 0.2} scale={0.6 + 0.4 * Math.min(1, sp(f, 0, 13, 160))} />
      </div>
      <Feet f={f} y={1460} start={6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center" }}><Stamp f={f} at={M.HYPE - 2} text="Hype?" size={150} /></div>
    </div>
  );
}

function Origin({ f }) {
  if (f < ORIGIN - 4 || f > SCIENCE + 8) return null;
  const o = fadeOut(f, SCIENCE + 6), inn = sp(f, ORIGIN, 13, 170), year = interpolate(f, [M.YEAR - 4, M.YEAR + 16], [2025, 1965], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o * Math.min(1, inn * 2) }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(232,201,143,.16), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ ...UI, fontSize: 48, color: SEPIA, ...rise(sp(f, ORIGIN + 4)) }}>Where the number came from</div>
        <div style={{ ...D, fontSize: 220, color: SEPIA, lineHeight: 0.9, marginTop: 10, textShadow: "0 0 60px rgba(232,201,143,.3)", ...pop(sp(f, M.YEAR - 4, 10, 260), 1.5) }}>{Math.round(year)}</div>
      </div>
      {/* a retro pedometer: cream body, a dial with 万 (10,000) and a step count */}
      <div style={{ position: "absolute", left: 340, top: 720, width: 400, height: 520, borderRadius: 70, background: "linear-gradient(160deg, #F3E3C3, #CDB385)", boxShadow: "0 40px 90px rgba(0,0,0,.5), inset 0 -10px 30px rgba(120,90,40,.35)",
        transform: `translateY(${(1 - Math.min(1, inn)) * 300}px) rotate(${-4 + 2 * Math.sin(f / 16)}deg)` }}>
        <div style={{ position: "absolute", left: 60, top: 60, width: 280, height: 280, borderRadius: "50%", background: "#FBF4E4", border: "10px solid #8C6B3E", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ fontFamily: "serif", fontSize: 120, fontWeight: 700, color: "#7A3B2E", lineHeight: 1 }}>万</div>
          <div style={{ ...D, fontSize: 40, color: "#5C4426", marginTop: 4 }}>{fmt(interpolate(f, [ORIGIN + 10, ORIGIN + 70], [0, 10000], clamp))}</div>
          <div style={{ position: "absolute", left: 132, top: 30, width: 6, height: 100, background: "#7A3B2E", borderRadius: 3, transformOrigin: "50% 100%", transform: `rotate(${interpolate(f, [ORIGIN + 10, ORIGIN + 70], [-120, 240], clamp)}deg)` }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", ...D, fontSize: 46, color: "#5C4426", letterSpacing: "0.06em" }}>manpo-kei</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 436, textAlign: "center", ...UIR, fontSize: 28, color: "#6E5532" }}>"10,000-step meter"</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...D, fontSize: 64, color: PAPER, ...rise(sp(f, M.AD - 4)) }}>A Japanese pedometer ad</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center" }}><Stamp f={f} at={M.MKT - 2} text="Marketing, not science" size={78} rot={-6} /></div>
    </div>
  );
}

// risk of early death vs steps/day, drawn through the two published points and flattening after 7,000
const CH = { x: 110, y: 620, w: 860, h: 560 }, X0 = 2000, X1 = 12000;
const xp = (s) => CH.x + ((s - X0) / (X1 - X0)) * CH.w;
const riskAt = (s) => (s <= 7000 ? 1 - 0.47 * (1 - Math.pow(1 - (s - 2000) / 5000, 1.6)) : 0.53 - 0.06 * (1 - Math.exp(-(s - 7000) / 2500)));
const yp = (r) => CH.y + (1 - (r - 0.4) / 0.65) * CH.h;
function Science({ f }) {
  if (f < SCIENCE - 4 || f > AGE + 8) return null;
  const o = fadeOut(f, AGE + 6), draw = interpolate(f, [SCIENCE + 6, M.SEVEN + 10], [0, 1], clamp);
  const pts = []; for (let s = X0; s <= X1; s += 100) pts.push([xp(s), yp(riskAt(s))]);
  const n = Math.max(2, Math.round(pts.length * draw)), d = "M" + pts.slice(0, n).map((p) => p.join(",")).join(" L");
  const dm = sp(f, M.DEATH - 3, 10, 260), cnt = interpolate(f, [M.DEATH - 3, M.DEATH + 14], [0, 47], clamp), k = shake(f, M.DEATH, 14, 4);
  const lvl = interpolate(f, [M.LEVEL - 4, M.LEVEL + 12], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...UI, fontSize: 46, color: B.xlo, ...rise(sp(f, SCIENCE + 2)) }}>Risk of early death vs steps a day</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 10, transform: sh(k) }}>
          <div style={{ ...D, fontSize: 190, color: GRN, lineHeight: 0.84, textShadow: "0 0 50px rgba(61,220,151,.35)", ...pop(dm, 1.6, "0% 80%") }}>−{Math.round(cnt)}%</div>
          <div style={{ ...D, fontSize: 52, color: PAPER, marginBottom: 12, ...rise(sp(f, M.DEATH + 6)) }}>at 7,000<br /><span style={{ color: B.xlo, fontSize: 40 }}>vs 2,000</span></div>
        </div>
      </div>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <line x1={CH.x} y1={CH.y + CH.h} x2={CH.x + CH.w} y2={CH.y + CH.h} stroke="rgba(242,240,234,.35)" strokeWidth="3" />
        {[2000, 4000, 6000, 8000, 10000, 12000].map((s) => <text key={s} x={xp(s)} y={CH.y + CH.h + 50} textAnchor="middle" style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 34 }} fill="rgba(242,240,234,.6)">{s / 1000}k</text>)}
        <rect x={xp(7000)} y={CH.y - 20} width={xp(X1) - xp(7000)} height={CH.h + 20} fill="rgba(255,201,74,.10)" opacity={lvl} />
        <path d={d} fill="none" stroke={GRN} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 14px rgba(61,220,151,.6))" }} />
        {f >= M.TWO - 3 && <g opacity={Math.min(1, sp(f, M.TWO - 3) * 2)}><circle cx={xp(2000)} cy={yp(1)} r="16" fill={B.lo} /><text x={xp(2000) + 26} y={yp(1) + 12} style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 36 }} fill={B.xlo}>2,000</text></g>}
        {f >= M.SEVEN && <g opacity={Math.min(1, sp(f, M.SEVEN) * 2)}>
          <line x1={xp(7000)} y1={yp(riskAt(7000))} x2={xp(7000)} y2={CH.y + CH.h} stroke={GOLD} strokeWidth="4" strokeDasharray="10 10" />
          <circle cx={xp(7000)} cy={yp(riskAt(7000))} r={18 + 4 * Math.sin(f / 5)} fill={GOLD} /><text x={xp(7000) - 20} y={yp(riskAt(7000)) - 34} textAnchor="end" style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 44 }} fill={GOLD}>7,000</text></g>}
        <text x={(xp(7000) + xp(X1)) / 2} y={yp(0.5) - 60} textAnchor="middle" style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 46 }} fill={GOLD} opacity={lvl}>levels off</text>
      </svg>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1300, display: "flex", gap: 20, justifyContent: "center" }}>
        {[["Dementia risk", "−38%", M.DEM], ["Depression symptoms", "−22%", M.DEP]].map(([l, v, at]) => (
          <div key={l} style={{ padding: "16px 24px", borderRadius: 20, background: "rgba(61,220,151,.12)", border: `2px solid ${GRN}`, textAlign: "center", ...pop(sp(f, at - 3, 10, 260), 1.4) }}>
            <div style={{ ...D, fontSize: 84, color: GRN, lineHeight: 0.9 }}>{v}</div><div style={{ ...D, fontSize: 36, color: PAPER, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <Src f={f} at={M.DEATH + 20}>Ding et al. · Lancet Public Health, 2025 · 57 studies</Src>
    </div>
  );
}

function Age({ f }) {
  if (f < AGE - 4 || f > TIPS + 8) return null;
  const o = fadeOut(f, TIPS + 6), ax = (s) => 110 + (s / 12000) * 860;
  const Bar = ({ y, a, b, at, label, color }) => {
    const p = interpolate(f, [at - 2, at + 16], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y, opacity: Math.min(1, p * 3) }}>
        <div style={{ position: "absolute", left: 110, ...D, fontSize: 64, color: PAPER }}>{label}</div>
        <div style={{ position: "absolute", left: 110, top: 90, width: 860, height: 60, borderRadius: 30, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.3)" }} />
        <div style={{ position: "absolute", left: ax(a), top: 90, width: (ax(b) - ax(a)) * p, height: 60, borderRadius: 30, background: `linear-gradient(90deg, ${B.lo}, ${color})`, boxShadow: `0 0 30px ${color}77` }} />
        <div style={{ position: "absolute", left: ax(a), top: 170, ...D, fontSize: 70, color, ...rise(sp(f, at + 8)) }}>{fmt(a)}–{fmt(b)}</div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, AGE + 2, 10, 260), 1.5, "0% 50%") }}>Your sweet spot</div>
        <div style={{ ...UI, fontSize: 44, color: B.xlo, marginTop: 8, ...rise(sp(f, AGE + 8)) }}>where the benefit levels off, by age</div>
      </div>
      <Bar y={640} a={8000} b={10000} at={M.UNDER} label="Under 60" color={GRN} />
      <Bar y={1000} a={6000} b={8000} at={M.OVER} label="60 and over" color={GOLD} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {[0, 4000, 8000, 12000].map((s) => <text key={s} x={ax(s)} y={1360} textAnchor="middle" style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 34 }} fill="rgba(242,240,234,.5)">{s / 1000}k</text>)}
      </svg>
      <Src f={f} at={M.OVER + 14}>Paluch et al. · Lancet Public Health, 2022 · 15 cohorts</Src>
    </div>
  );
}

const Tick = ({ size = 50, color = GRN }) => (
  <div style={{ flex: "none", width: size, height: size, borderRadius: size / 2, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={B.ink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);
function Tip({ f, i }) {
  const at = TIPAT[i] - 6, end = (i < 2 ? TIPAT[i + 1] - 6 : VERDICT) - 12;
  if (f < at - 4 || f > end + 14) return null;
  const inn = sp(f, at, 14, 170), out = interpolate(f, [end, end + 12], [0, 1], clamp);
  const x = (1 - Math.min(1, inn)) * 700 - out * 900, tags = ["01 · Start small", "02 · Desk job", "03 · Stack it"];
  return (
    <div style={{ position: "absolute", left: 70 + x, top: 600, width: 940, height: 760, borderRadius: 40, background: "linear-gradient(180deg, rgba(23,22,58,.96), rgba(13,12,40,.96))",
      border: `3px solid ${i === 1 ? GOLD : GRN}`, boxShadow: "0 40px 100px rgba(0,0,0,.5)", padding: "54px 60px", boxSizing: "border-box", opacity: 1 - out }}>
      <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: 12, background: i === 1 ? GOLD : GRN, ...D, fontSize: 40, color: B.ink, letterSpacing: "0.06em" }}>{tags[i]}</div>
      {i === 0 && (<>
        <div style={{ ...D, fontSize: 150, color: PAPER, marginTop: 36, ...rise(sp(f, at + 8)) }}>+1,000</div>
        <div style={{ ...D, fontSize: 70, color: GRN2, ...rise(sp(f, at + 12)) }}>steps a day, each week</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, height: 230, marginTop: 40 }}>
          {[4000, 5000, 6000, 7000].map((s, k) => {
            const p = sp(f, at + 20 + k * 8, 12, 220);
            return (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ ...D, fontSize: 32, color: k === 3 ? GOLD : PAPER, opacity: Math.min(1, p * 2) }}>{s / 1000}k</div>
                <div style={{ height: (s / 7000) * 170 * Math.min(1, p), borderRadius: 14, marginTop: 8, background: k === 3 ? GOLD : `linear-gradient(180deg, ${GRN}, ${B.primary})` }} />
                <div style={{ ...UIR, fontSize: 26, color: B.xlo, marginTop: 8 }}>wk {k + 1}</div>
              </div>
            );
          })}
        </div>
      </>)}
      {i === 1 && (<>
        <div style={{ ...D, fontSize: 140, color: PAPER, marginTop: 36, ...rise(sp(f, at + 8)) }}>2–5 min walk</div>
        <div style={{ ...D, fontSize: 70, color: GOLD, ...rise(sp(f, at + 12)) }}>every half hour</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 50, ...pop(sp(f, M.SUGAR - 3, 10, 260), 1.3, "0% 50%") }}>
          <svg width="70" height="70" viewBox="0 0 24 24"><path d="M12 3 V19 M5 12 L12 19 L19 12" fill="none" stroke={GRN} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div style={{ ...D, fontSize: 64, color: GRN }}>blood sugar after meals</div>
        </div>
        <div style={{ position: "absolute", left: 60, bottom: 50, ...UIR, fontSize: 30, color: B.xlo }}>Buffey et al. · Sports Medicine, 2022</div>
      </>)}
      {i === 2 && (<>
        <div style={{ ...D, fontSize: 120, color: PAPER, marginTop: 36, ...rise(sp(f, at + 8)) }}>Steps hide everywhere</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 50 }}>
          {["Take calls on your feet", "Use the stairs", "Park further away"].map((t, k) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, ...rise(sp(f, at + 18 + k * 10)) }}><Tick size={58} /><span style={{ ...D, fontSize: 64, color: PAPER }}>{t}</span></div>
          ))}
        </div>
      </>)}
    </div>
  );
}
function Tips({ f }) {
  if (f < TIPS - 2 || f > VERDICT + 4) return null;
  const o = fadeOut(f, VERDICT + 2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, top: 300, display: "flex", alignItems: "flex-end", gap: 22 }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, M.FIX - 3, 10, 260), 1.6, "0% 80%") }}>Make it</div>
        <div style={{ ...D, fontSize: 120, color: GRN, ...pop(sp(f, M.FIX + 6, 10, 260), 1.6, "0% 80%") }}>fit your life</div>
      </div>
      {[0, 1, 2].map((i) => <Tip key={i} f={f} i={i} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1410, display: "flex", justifyContent: "center", gap: 14 }}>
        {[0, 1, 2].map((i) => { const on = f >= TIPAT[i] - 6; return <div key={i} style={{ width: on ? 60 : 18, height: 18, borderRadius: 9, background: on ? GRN : "rgba(242,240,234,.25)" }} />; })}
      </div>
    </div>
  );
}

function Verdict({ f }) {
  if (f < VERDICT - 2 || f > OUTRO + 4) return null;
  const o = fadeOut(f, OUTRO + 2), inBridge = f >= BRIDGE;
  // the ring comes back at the hook's 10,000, then winds down to the goal that fits: 7,000+
  const steps = interpolate(f, [M.HIT - 4, M.HIT + 26], [10000, 7000], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const settled = f >= M.HIT + 20;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300, opacity: inBridge ? fadeOut(f, BRIDGE + 4) : 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ ...D, fontSize: 84, color: PAPER, ...rise(sp(f, VERDICT + 2)) }}>Worth the hype?</div>
          <div style={{ ...D, fontSize: 120, color: GRN, ...pop(sp(f, M.YES - 2, 9, 300), 2) }}>Yes</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <div style={{ ...D, fontSize: 84, color: PAPER, ...rise(sp(f, M.MAGIC - 4)) }}>Magic number?</div>
          <div style={{ ...D, fontSize: 120, color: RED, ...pop(sp(f, M.MAGIC + 18, 9, 300), 2) }}>No</div>
        </div>
      </div>
      {inBridge && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 104, color: PAPER, ...pop(sp(f, M.BR1 - 4, 10, 260), 1.6) }}>You bring the steps.</div>
          <div style={{ ...D, fontSize: 104, color: B.lo, marginTop: 8, ...pop(sp(f, LINE.e2 - 2, 10, 260), 1.6) }}>Darebni AI plans the training.</div>
        </div>
      )}
      <Ring f={f} cx={540} cy={1080} r={300} value={steps} max={10000} goal={7000} label={settled ? "your goal: 7,000+" : "steps"} glow={settled ? 0.9 : 0.3}
        scale={0.6 + 0.4 * Math.min(1, sp(f, VERDICT + 4, 13, 170))} opacity={Math.min(1, sp(f, VERDICT + 4) * 2)} />
      {inBridge && <Feet f={f} y={1490} start={BRIDGE + 4} />}
    </div>
  );
}

export const StepsTips = ({ music = true }) => {
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
          <span style={{ marginLeft: "auto", ...D, fontSize: 30, color: GRN2, letterSpacing: "0.08em" }}>Tips & tricks</span>
        </div>
      )}
      <Hook f={f} />
      <Origin f={f} />
      <Science f={f} />
      <Age f={f} />
      <Tips f={f} />
      <Verdict f={f} />
      {f >= OUTRO - 2 && <Outro f={f} start={OUTRO} />}
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [OUTRO - 2, OUTRO, OUTRO + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.035} />
      <Audio src={staticFile(music ? "stepstips.wav" : "stepstips-sfx.wav")} />
    </AbsoluteFill>
  );
};
