// Darebni AI "Tips & tricks": caffeine, training and health. Kinetic type + motion graphics, 1080x1920, 30 fps, read by
// a voice-over (sound/build_caf_vo.py -> src/caf_vo.json gives every scene start and keyword frame). One idea carried
// through: a coffee cup whose fill is your caffeine. It fills under the hook, measures out the dose, hits the daily
// ceiling, and steams quietly at the end. Every number is from the source shown on screen:
//   Grgic et al., J Int Soc Sports Nutr 2018 (meta-analysis): small but significant gains in strength (upper-body 1RM)
//     and power (vertical jump)
//   ISSN position stand, Guest et al., JISSN 2021: 3-6 mg/kg about 60 min before exercise; ~9 mg/kg brings side effects
//     without extra benefit
//   FDA / EFSA (2015): up to 400 mg/day for healthy adults; 200 mg/day in pregnancy
//   Gardiner et al., Sleep Medicine Reviews 2023 (24 studies): coffee (107 mg) >= 8.8 h before bed; a pre-workout serving
//     (217.5 mg) >= 13.2 h
//   Poole et al., BMJ 2017 (umbrella review, observational): 3-4 cups/day vs none -> lowest risk, all-cause mortality RR
//     0.83 (about 17% lower); association, not proof
// "80 kg -> 240 mg -> about 2 coffees" is arithmetic (3 mg/kg; a 250 mL coffee is about 107 mg in Gardiner et al.).
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain, shake } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import V from "./caf_vo.json";

const S = V.scenes, M = V.marks, LINE = Object.fromEntries(V.lines.map((l) => [l.id, l.start]));
export const CFT = { WORKS: S.works.start, DOSE: S.dose.start, LIMIT: S.limit.start, SLEEP: S.sleep.start, HEALTH: S.health.start,
  BRIDGE: S.bridge.start, OUTRO: S.outro.start, DURATION: V.duration };
const { WORKS, DOSE, LIMIT, SLEEP, HEALTH, BRIDGE, OUTRO } = CFT;
const COF = "#C98B5A", COF2 = "#E8B98C", CREAM = "#F3E3C8", GRN = "#3DDC97", RED = "#FF4D6A", GOLD = "#FFC94A", PAPER = B.cream;
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.6, o = "50% 50%") => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: o });
const fadeOut = (f, at, len = 8) => interpolate(f, [at - len, at], [1, 0], clamp);
const lerp = (a, b, p) => a + (b - a) * p;
const sh = (k) => `translate(${k[0]}px, ${k[1]}px)`;

// ---- the cup: a mug with a wavy coffee surface, crema line and rising steam -----------------------------------------
const MUG = "M30,40 L210,40 L196,300 Q194,330 164,330 L76,330 Q46,330 44,300 Z";
export function Cup({ f, cx, top, h, level, id = "c", steam = 1, glow = 0 }) {
  const w = h * (300 / 360), y = 330 - level * 270, amp = 3 + 2 * Math.sin(f / 9);
  let d = `M0,${y}`;
  for (let x = 0; x <= 240; x += 8) d += ` L${x},${y + amp * Math.sin(x / 18 + f / 6)}`;
  d += " L240,360 L0,360 Z";
  const wisps = [0, 1, 2].map((i) => {
    const t = (f / 40 + i / 3) % 1, x = 80 + i * 40;
    return <path key={i} d={`M${x},30 C${x - 18},${10 - 30 * t} ${x + 18},${-20 - 30 * t} ${x},${-50 - 40 * t}`} fill="none" stroke="rgba(242,240,234,.5)" strokeWidth="7" strokeLinecap="round" opacity={steam * Math.sin(Math.PI * t)} />;
  });
  return (
    <svg width={w} height={h} viewBox="0 -60 300 420" style={{ position: "absolute", left: cx - w / 2, top, overflow: "visible", filter: `drop-shadow(0 0 ${20 + 40 * glow}px rgba(201,139,90,${0.25 + 0.45 * glow}))` }}>
      <defs><clipPath id={`cl-${id}`}><path d={MUG} /></clipPath>
        <linearGradient id={`cf-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A86A3E" /><stop offset="1" stopColor="#4A2A16" /></linearGradient></defs>
      {wisps}
      <path d={MUG} fill="rgba(17,17,43,.6)" />
      <g clipPath={`url(#cl-${id})`}><path d={d} fill={`url(#cf-${id})`} /><path d={d} fill="none" stroke={COF2} strokeWidth="5" /></g>
      <path d="M206,95 C262,95 266,215 200,228" fill="none" stroke="rgba(184,176,255,.85)" strokeWidth="16" strokeLinecap="round" />
      <path d={MUG} fill="none" stroke="rgba(184,176,255,.85)" strokeWidth="6" />
    </svg>
  );
}

const Src = ({ f, at, children, top = 1530 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", ...rise(sp(f, at), 20) }}>
    <div style={{ padding: "10px 22px", borderRadius: 14, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.4)", ...UIR, fontSize: 30, color: B.xlo, textAlign: "center" }}>{children}</div>
  </div>
);
const Stamp = ({ f, at, text, color = RED, rot = -10, size = 110 }) => {
  const p = sp(f, at, 9, 300);
  return <div style={{ display: "inline-block", padding: "6px 26px", border: `8px solid ${color}`, borderRadius: 18, ...D, fontSize: size, color, transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`, opacity: Math.min(1, p * 3), boxShadow: `0 0 50px ${color}55`, background: "rgba(7,7,26,.6)" }}>{text}</div>;
};
const Chip = ({ children, color = COF, style }) => <div style={{ display: "inline-block", padding: "12px 22px", borderRadius: 16, background: `${color}22`, border: `2px solid ${color}`, ...D, fontSize: 48, color, ...style }}>{children}</div>;

// ---- scenes ---------------------------------------------------------------------------------------------------------
function Hook({ f }) {
  if (f > WORKS + 8) return null;
  const o = fadeOut(f, WORKS + 6), k = shake(f, M.CAF, 16, 4);
  const lvl = interpolate(f, [M.CAF - 6, M.CAF + 40], [0.05, 0.85], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 96, color: PAPER, ...pop(sp(f, M.T1, 10, 280), 1.6) }}>Your pre-workout is</div>
        <div style={{ ...D, fontSize: 96, color: B.xlo, ...pop(sp(f, M.ONE - 12, 10, 280), 1.6) }}>mostly one thing</div>
        <div style={{ ...D, fontSize: 190, color: COF2, marginTop: 20, textShadow: "0 0 60px rgba(201,139,90,.45)", transform: sh(k), ...pop(sp(f, M.CAF - 2, 9, 300), 2.2) }}>Caffeine</div>
      </div>
      <Cup id="hook" f={f} cx={540} top={lerp(1950, 900, sp(f, M.CAF - 12, 12, 170))} h={620} level={lvl} />
    </div>
  );
}

function Works({ f }) {
  if (f < WORKS - 4 || f > DOSE + 8) return null;
  const o = fadeOut(f, DOSE + 6);
  const Bar = ({ y, label, at }) => {
    const p = interpolate(f, [at - 4, at + 18], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: 110, right: 110, top: y, ...rise(sp(f, at - 4)) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ ...D, fontSize: 80, color: PAPER }}>{label}</div>
          <svg width="80" height="80" viewBox="0 0 24 24" style={{ opacity: p }}><path d="M12 20 V5 M5 11 L12 4 L19 11" fill="none" stroke={GRN} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ position: "relative", height: 50, marginTop: 14, borderRadius: 25, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.35)", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${lerp(70, 82, p)}%`, background: `linear-gradient(90deg, ${B.primary}, ${GRN})` }} />
          <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: 4, background: "rgba(242,240,234,.7)" }} />
        </div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, WORKS + 4, 10, 260), 1.5, "0% 50%") }}>Does it work?</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center" }}><Stamp f={f} at={M.YES - 2} text="Yes" color={GRN} size={150} rot={-6} /></div>
      <Bar y={790} label="Strength" at={M.STR} />
      <Bar y={1020} label="Power" at={M.POW} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1270, textAlign: "center", ...UI, fontSize: 46, color: B.xlo, ...rise(sp(f, M.STR - 20)) }}>a small but real boost</div>
      <Src f={f} at={M.POW + 10}>Grgic et al. · J Int Soc Sports Nutr, 2018 · meta-analysis</Src>
    </div>
  );
}

function Dose({ f }) {
  if (f < DOSE - 4 || f > LIMIT + 8) return null;
  const o = fadeOut(f, LIMIT + 6), more = f >= M.MORE - 4;
  const cupIn = (i) => sp(f, DOSE + 20 + i * 8, 11, 220), cupLvl = (i) => interpolate(f, [M.MGKG + i * 10, M.CUPS + 10], [0.06, 0.8], clamp);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...UI, fontSize: 48, color: B.xlo, ...rise(sp(f, DOSE + 4)) }}>The research dose</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 6 }}>
          <div style={{ ...D, fontSize: 210, color: COF2, lineHeight: 0.86, textShadow: "0 0 50px rgba(201,139,90,.4)", ...pop(sp(f, M.MGKG - 3, 10, 260), 1.6, "0% 80%") }}>3–6</div>
          <div style={{ ...D, fontSize: 70, color: PAPER, marginBottom: 18, ...rise(sp(f, M.MGKG + 8)) }}>mg per kg</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24, ...pop(sp(f, M.MIN - 3, 10, 260), 1.4, "0% 50%") }}>
          <svg width="74" height="74" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke={GOLD} strokeWidth="2.4" /><path d={`M12 12 L12 6`} stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${(f - M.MIN) * 6} 12 12)`} /><path d="M12 12 L16 14" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" /></svg>
          <div style={{ ...D, fontSize: 64, color: GOLD }}>~60 min before training</div>
        </div>
      </div>
      {!more && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 860 }}>
          <div style={{ textAlign: "center", ...D, fontSize: 64, color: PAPER, ...rise(sp(f, M.KG80 - 4)) }}>80 kg lifter → 240 mg</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 60, marginTop: 30 }}>
            {[0, 1].map((i) => <div key={i} style={{ position: "relative", width: 300, height: 360, ...pop(cupIn(i), 0.4) }}><Cup id={`d${i}`} f={f + i * 10} cx={150} top={0} h={360} level={cupLvl(i)} /></div>)}
          </div>
          <div style={{ textAlign: "center", ...D, fontSize: 70, color: COF2, marginTop: 20, ...rise(sp(f, M.CUPS + 10)) }}>≈ 2 coffees</div>
        </div>
      )}
      {more && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center" }}>
          <Stamp f={f} at={M.MORE - 4} text="More ≠ better" size={104} />
          <div style={{ ...D, fontSize: 70, color: PAPER, marginTop: 60, ...rise(sp(f, M.NINE - 3)) }}>~9 mg/kg</div>
          <div style={{ ...UI, fontSize: 48, color: "#FFC2C8", marginTop: 10, ...rise(sp(f, M.NINE + 6)) }}>side effects, no extra gains</div>
        </div>
      )}
      <Src f={f} at={M.MIN + 14}>ISSN position stand · Guest et al., JISSN, 2021</Src>
    </div>
  );
}

function Limit({ f }) {
  if (f < LIMIT - 4 || f > SLEEP + 8) return null;
  const o = fadeOut(f, SLEEP + 6), X0 = 110, W = 860, xp = (mg) => X0 + (mg / 500) * W;
  const fill = interpolate(f, [LIMIT + 6, M.L400 - 6], [0, 400], clamp);
  const Mark = ({ mg, label, color, at, up = true }) => (
    <div style={{ position: "absolute", left: xp(mg) - 150, width: 300, top: up ? 660 : 990, textAlign: "center", ...rise(sp(f, at), up ? -20 : 20) }}>
      {!up && <div style={{ width: 4, height: 60, background: color, margin: "0 auto 10px" }} />}
      <div style={{ ...D, fontSize: 44, color, lineHeight: 1 }}>{label}</div>
      {up && <div style={{ width: 4, height: 60, background: color, margin: "10px auto 0" }} />}
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, LIMIT + 4, 10, 260), 1.5, "0% 50%") }}>Daily ceiling</div>
        <div style={{ ...UI, fontSize: 46, color: B.xlo, marginTop: 6, ...rise(sp(f, LIMIT + 10)) }}>healthy adults, caffeine per day</div>
      </div>
      <div style={{ position: "absolute", left: X0, width: W, top: 880, height: 80, borderRadius: 40, background: "rgba(17,17,43,.9)", border: "2px solid rgba(139,128,255,.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (fill / 500) * W, background: `linear-gradient(90deg, ${COF2}, ${COF})` }} />
      </div>
      <Mark mg={107} label="1 coffee 107 mg" color={COF2} at={LIMIT + 14} />
      <Mark mg={217} label="pre-workout ~217 mg" color={B.xlo} at={LIMIT + 26} up={false} />
      <div style={{ position: "absolute", left: xp(400) - 4, top: 840, width: 8, height: 160, background: RED, borderRadius: 4, opacity: Math.min(1, sp(f, M.L400 - 8) * 2) }} />
      <div style={{ position: "absolute", left: xp(400) - 200, width: 400, top: 1050, textAlign: "center", ...D, fontSize: 96, color: RED, ...pop(sp(f, M.L400 - 8, 10, 260), 1.6) }}>400 mg</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1230, textAlign: "center", ...pop(sp(f, M.PREG - 3, 10, 260), 1.4) }}><Chip color={GOLD}>Pregnant: 200 mg</Chip></div>
      <Src f={f} at={M.PREG + 10}>FDA · EFSA scientific opinion, 2015</Src>
    </div>
  );
}

// a 12-hour clock: bedtime 11 pm, the coffee cutoff (8.8 h -> 2:12 pm) and the pre-workout cutoff (13.2 h -> 9:48 am)
function Sleep({ f }) {
  if (f < SLEEP - 4 || f > HEALTH + 8) return null;
  const o = fadeOut(f, HEALTH + 6), R = 260, cx = 540, cy = 1000;
  const ang = (h) => (h % 12) * 30 - 90, pt = (h, r) => [cx + r * Math.cos(ang(h) * Math.PI / 180), cy + r * Math.sin(ang(h) * Math.PI / 180)];
  const arc = (h0, h1, r) => { const [x0, y0] = pt(h0, r), [x1, y1] = pt(h1, r), large = ((h1 - h0 + 12) % 12) > 6 ? 1 : 0; return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`; };
  const pc = interpolate(f, [M.COFFEE9 - 4, M.COFFEE9 + 16], [0, 1], clamp), pp = interpolate(f, [M.PRE13 - 4, M.PRE13 + 16], [0, 1], clamp);
  const bed = 23, cof = bed - 8.8, pre = bed - 13.2;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, M.CATCH - 3, 10, 260), 1.5, "0% 50%") }}>The catch: <span style={{ color: B.lo }}>sleep</span></div>
        <div style={{ ...UI, fontSize: 46, color: B.xlo, marginTop: 6, ...rise(sp(f, M.CATCH + 8)) }}>last caffeine, if bedtime is 11 pm</div>
      </div>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="rgba(17,17,43,.85)" stroke="rgba(139,128,255,.4)" strokeWidth="4" />
        {Array.from({ length: 12 }, (_, i) => { const [x0, y0] = pt(i, R - 16), [x1, y1] = pt(i, R - 36); return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="rgba(242,240,234,.4)" strokeWidth="4" />; })}
        {pc > 0 && <path d={arc(cof, cof + (bed - cof) * pc, R + 40)} fill="none" stroke={COF2} strokeWidth="22" strokeLinecap="round" />}
        {pp > 0 && <path d={arc(pre, pre + (bed - pre) * pp, R + 80)} fill="none" stroke={B.lo} strokeWidth="22" strokeLinecap="round" />}
        <circle cx={pt(bed, R - 60)[0]} cy={pt(bed, R - 60)[1]} r="34" fill={GOLD} />
        <text x={pt(bed, R - 60)[0]} y={pt(bed, R - 60)[1] + 12} textAnchor="middle" style={{ fontFamily: "Cond", fontWeight: 800, fontSize: 30 }} fill={B.ink}>BED</text>
        <line x1={cx} y1={cy} x2={pt(bed, R - 110)[0]} y2={pt(bed, R - 110)[1]} stroke={PAPER} strokeWidth="10" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="14" fill={PAPER} />
      </svg>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1380, display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...rise(sp(f, M.COFFEE9 - 3)) }}><div style={{ ...D, fontSize: 90, color: COF2, lineHeight: 0.9 }}>8.8 h</div><div style={{ ...D, fontSize: 40, color: PAPER }}>coffee · by 2:12 pm</div></div>
        <div style={{ textAlign: "right", ...rise(sp(f, M.PRE13 - 3)) }}><div style={{ ...D, fontSize: 90, color: B.lo, lineHeight: 0.9 }}>13.2 h</div><div style={{ ...D, fontSize: 40, color: PAPER }}>pre-workout · by 9:48 am</div></div>
      </div>
      <Src f={f} at={M.PRE13 + 12} top={1560}>Gardiner et al. · Sleep Medicine Reviews, 2023 · 24 studies</Src>
    </div>
  );
}

function Health({ f }) {
  if (f < HEALTH - 4 || f > BRIDGE + 8) return null;
  const o = fadeOut(f, BRIDGE + 6), cnt = interpolate(f, [M.RISK - 3, M.RISK + 14], [0, 17], clamp), k = shake(f, M.RISK, 12, 4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 300 }}>
        <div style={{ ...D, fontSize: 120, color: PAPER, ...pop(sp(f, HEALTH + 4, 10, 260), 1.5, "0% 50%") }}>The good news</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", gap: 10 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "relative", width: 220, height: 264, ...pop(sp(f, M.CUPS34 - 4 + i * 5, 11, 240), 0.3) }}><Cup id={`h${i}`} f={f + i * 7} cx={110} top={0} h={264} level={0.8} steam={0.6} /></div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", ...D, fontSize: 64, color: COF2, ...rise(sp(f, M.CUPS34 + 10)) }}>3–4 cups a day</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", transform: sh(k) }}>
        <div style={{ ...D, fontSize: 210, color: GRN, lineHeight: 0.85, textShadow: "0 0 50px rgba(61,220,151,.35)", ...pop(sp(f, M.RISK - 3, 10, 260), 1.6) }}>−{Math.round(cnt)}%</div>
        <div style={{ ...D, fontSize: 56, color: PAPER, marginTop: 6, ...rise(sp(f, M.RISK + 6)) }}>risk of early death vs no coffee</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1260, textAlign: "center" }}><Stamp f={f} at={M.LINKED - 3} text="Linked, not proven" color={GOLD} size={72} rot={-5} /></div>
      <Src f={f} at={M.LINKED + 10}>Poole et al. · BMJ, 2017 · umbrella review</Src>
    </div>
  );
}

function Bridge({ f }) {
  if (f < BRIDGE - 2 || f > OUTRO + 4) return null;
  const o = fadeOut(f, OUTRO + 2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 92, color: PAPER, ...pop(sp(f, M.BR1 - 6, 10, 260), 1.6) }}>Caffeine fuels the session.</div>
        <div style={{ ...D, fontSize: 92, color: B.lo, marginTop: 8, ...pop(sp(f, LINE.e2 - 2, 10, 260), 1.6) }}>Darebni AI plans it.</div>
      </div>
      <Cup id="end" f={f} cx={540} top={lerp(1950, 820, sp(f, BRIDGE, 13, 170))} h={620} level={0.8} glow={interpolate(f, [BRIDGE + 20, BRIDGE + 40], [0, 0.8], clamp)} />
    </div>
  );
}

export const CaffeineTips = ({ music = true }) => {
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
          <span style={{ marginLeft: "auto", ...D, fontSize: 30, color: COF2, letterSpacing: "0.08em" }}>Tips & tricks</span>
        </div>
      )}
      <Hook f={f} />
      <Works f={f} />
      <Dose f={f} />
      <Limit f={f} />
      <Sleep f={f} />
      <Health f={f} />
      <Bridge f={f} />
      {f >= OUTRO - 2 && <Outro f={f} start={OUTRO} />}
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [OUTRO - 2, OUTRO, OUTRO + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.035} />
      <Audio src={staticFile(music ? "caffeinetips.wav" : "caffeinetips-sfx.wav")} />
    </AbsoluteFill>
  );
};
