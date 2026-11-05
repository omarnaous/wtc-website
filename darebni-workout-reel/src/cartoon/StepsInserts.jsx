// Comic insert cards for the 10,000-steps cartoon (StepsToon.jsx; screen box 940 x 500 at x 70, y 350). Each takes t (frames
// since the insert appeared), f, m (absolute frames of the keyword marks) and L (the current line). Facts only from:
//   the manpo-kei pedometer (Japan, 1965; the name means "10,000-step meter"; the kanji 万 looks like a man walking)
//   Ding et al., Lancet Public Health 2025 (57 studies): 7,000 vs 2,000 steps/day linked to 47% lower all-cause mortality;
//   10,000 a little better; most of the drop by ~7,000 (observational: associations).
import { interpolate, random, spring } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const sp = (t, at = 0, d = 12, s = 220) => spring({ frame: t - at, fps: 30, config: { damping: d, stiffness: s } });
const INK = "#07071A", PAPER = "#F2F0EA", V = "#5B4EE5", VL = "#8B80FF", RED = "#FF4D6A", GRN = "#2FCB86", GOLD = "#FFC94A", SEPIA = "#E9D7B4", BROWN = "#5A3B1E";
const D = { fontFamily: "Cond", fontWeight: 800, textTransform: "uppercase", lineHeight: 0.92, letterSpacing: "-0.01em" };
const UI = { fontFamily: "Barlow", fontWeight: 600 };
const card = (rot = 0) => ({ position: "absolute", background: PAPER, border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `12px 12px 0 ${INK}`, transform: `rotate(${rot}deg)` });
const Stamp = ({ p, children, color = RED, rot = -12, style }) => (
  <div style={{ position: "absolute", padding: "10px 24px", border: `7px solid ${color}`, borderRadius: 16, ...D, fontSize: 56, color, background: "rgba(242,240,234,.94)", whiteSpace: "nowrap",
    transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`, opacity: Math.min(1, p * 3), ...style }}>{children}</div>
);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

// ── 1 · midnight: a glowing step watch ticking toward 10,000, the clock, footprints pacing in circles ───────────────────
function Foot({ x, y, a, k, flip }) {
  return <g transform={`translate(${x} ${y}) rotate(${a}) scale(${flip ? -1 : 1} 1)`} opacity={k}><ellipse cx="0" cy="0" rx="13" ry="22" fill={VL} /><circle cx="-5" cy="-28" r="5" fill={VL} /><circle cx="5" cy="-30" r="5" fill={VL} /></g>;
}
function Midnight({ t, f, m, L }) {
  const steps = Math.min(9999, 9800 + Math.max(0, t) * 0.9), ring = steps / 10000, goal = sp(f, m.goal ?? 99999, 9, 300);
  const watch = sp(t, 0, 12, 200), colon = Math.floor(f / 15) % 2;
  const who = L?.spk === "S" ? sp(f, L.at + 4, 9, 300) : 0;
  // a loop of footprints around the watch: 14 prints on an ellipse, lit one after another
  const prints = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2, x = 470 + Math.cos(a) * 400, y = 250 + Math.sin(a) * 210;
    const age = ((t * 0.5 - i) % 14 + 14) % 14, k = age < 1 ? age : Math.max(0, 1 - (age - 1) / 8);
    return <Foot key={i} x={x} y={y} a={(a * 180) / Math.PI + 180} k={k * 0.9} flip={i % 2} />;
  });
  return (
    <>
      <svg width="940" height="500" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{prints}</svg>
      {/* moon + clock */}
      <div style={{ ...card(-6), left: -10, top: -10, width: 230, height: 120, background: "#1B1745", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transform: `rotate(-6deg) scale(${0.6 + 0.4 * Math.min(1, sp(t, 4))})` }}>
        <svg width="44" height="44" viewBox="0 0 40 40"><path d="M28 4 A16 16 0 1 0 36 26 A13 13 0 1 1 28 4 Z" fill={GOLD} /></svg>
        <span style={{ ...D, fontSize: 64, color: PAPER, letterSpacing: "0.02em" }}>11<span style={{ opacity: colon ? 1 : 0.2 }}>:</span>58</span><span style={{ ...D, fontSize: 30, color: GOLD, marginTop: 18 }}>PM</span>
      </div>
      {/* the watch */}
      <div style={{ position: "absolute", left: 470 - 200, top: 40, width: 400, height: 420, transform: `scale(${0.4 + 0.6 * Math.min(1.04, watch)}) rotate(${Math.sin(t / 6) * 2}deg)` }}>
        <div style={{ position: "absolute", left: 120, top: -40, width: 160, height: 500, borderRadius: 40, background: "#2A2363", border: `6px solid ${INK}` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 110, background: INK, border: `8px solid ${INK}`, boxShadow: `14px 14px 0 rgba(7,7,26,.6), 0 0 60px rgba(139,128,255,.5)` }} />
        <svg width="400" height="420" viewBox="0 0 400 420" style={{ position: "absolute", inset: 0 }}>
          <circle cx="200" cy="210" r="150" fill="none" stroke="rgba(139,128,255,.2)" strokeWidth="24" />
          <circle cx="200" cy="210" r="150" fill="none" stroke={goal > 0.1 ? GOLD : VL} strokeWidth="24" strokeLinecap="round" strokeDasharray={2 * Math.PI * 150} strokeDashoffset={2 * Math.PI * 150 * (1 - ring)} transform="rotate(-90 200 210)" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", ...D, fontSize: 30, color: VL, letterSpacing: "0.12em" }}>Steps</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 168, textAlign: "center", ...D, fontSize: 96, color: PAPER, textTransform: "none" }}>{fmt(steps)}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 268, textAlign: "center", ...D, fontSize: 34, color: goal > 0.1 ? GOLD : "rgba(242,240,234,.55)", transform: `scale(${1 + 0.4 * Math.max(0, 1 - Math.abs(f - (m.goal ?? -99) - 4) / 8)})` }}>Goal 10,000</div>
      </div>
      <Stamp p={who} color={RED} rot={8} style={{ right: -20, top: 20, fontSize: 64 }}>Says who?</Stamp>
    </>
  );
}

// ── 2 · flashback: sepia film, the 1965 pedometer box, the kanji 万 that turns into a walking man ─────────────────────
// 万 drawn as three strokes on a 100 x 100 grid (top bar, the left sweep, the hooked right stroke)
const KANJI = ["M12,26 H88", "M46,26 C46,58 36,82 12,94", "M44,50 H78 C78,74 76,90 62,94"];
function Origin({ t, f, m }) {
  const flick = 0.92 + 0.08 * random(`fl${f}`), box = sp(f, m.box ?? 99999, 11, 220), yr = sp(f, m.year ?? 99999, 9, 300), mean = sp(f, m.meaning ?? 99999, 12, 240);
  const kan = m.kanji != null ? interpolate(f, [m.kanji, m.kanji + 22], [0, 1], clamp) : 0;
  const walk = m.walker != null ? Math.max(0, f - m.walker) : -1, wk = walk >= 0 ? Math.min(1, walk / 10) : 0;
  const second = m.kanji != null && f >= m.kanji - 4;
  const needle = Math.sin(f / 3) * 40;
  const scratches = Array.from({ length: 3 }, (_, i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${random(`sc${f}${i}`) * 100}%`, width: 2, background: "rgba(90,59,30,.35)" }} />);
  // the walking man: the kanji's strokes swing like legs/arms, a head pops on, and he strides across the card
  const swing = Math.sin(walk / 3) * 14 * wk, stride = walk >= 0 ? Math.min(520, walk * 9) : 0;
  return (
    <div style={{ ...card(-2), inset: 0, background: SEPIA, overflow: "hidden", opacity: flick, borderColor: BROWN, boxShadow: `12px 12px 0 ${BROWN}` }}>
      {/* film sprockets */}
      {[0, 1].map((r) => <div key={r} style={{ position: "absolute", left: 0, right: 0, [r ? "bottom" : "top"]: 0, height: 34, background: BROWN, display: "flex", gap: 22, padding: "8px 16px" }}>
        {Array.from({ length: 22 }, (_, i) => <div key={i} style={{ width: 20, height: 18, borderRadius: 4, background: SEPIA, transform: `translateX(${-((f * 4) % 42)}px)` }} />)}
      </div>)}
      {scratches}
      {!second && (
        <>
          {/* the pedometer box */}
          <div style={{ position: "absolute", left: 60, top: 70, width: 340, height: 350, borderRadius: 34, background: "#C8A574", border: `6px solid ${BROWN}`, boxShadow: `8px 8px 0 ${BROWN}`, transform: `rotate(-5deg) scale(${0.3 + 0.7 * Math.min(1.05, box)})`, opacity: Math.min(1, box * 3) }}>
            <svg width="200" height="200" viewBox="0 0 100 100" style={{ position: "absolute", left: 70, top: 26 }}>
              <circle cx="50" cy="50" r="44" fill={SEPIA} stroke={BROWN} strokeWidth="5" />
              {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <line key={i} x1={50 + Math.cos(a) * 34} y1={50 + Math.sin(a) * 34} x2={50 + Math.cos(a) * 40} y2={50 + Math.sin(a) * 40} stroke={BROWN} strokeWidth="3" />; })}
              <line x1="50" y1="50" x2="50" y2="16" stroke={RED} strokeWidth="4" strokeLinecap="round" transform={`rotate(${needle} 50 50)`} />
              <circle cx="50" cy="50" r="5" fill={BROWN} />
            </svg>
            <svg width="120" height="120" viewBox="0 0 100 100" style={{ position: "absolute", left: 110, top: 220 }}>
              {KANJI.map((d, i) => <path key={i} d={d} fill="none" stroke={BROWN} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />)}
            </svg>
          </div>
          <div style={{ position: "absolute", left: 440, top: 80, ...D, fontSize: 150, color: BROWN, transform: `scale(${interpolate(yr, [0, 1], [2, 1])}) rotate(-4deg)`, opacity: Math.min(1, yr * 3) }}>1965</div>
          <div style={{ position: "absolute", left: 445, top: 240, ...D, fontSize: 72, color: INK, opacity: Math.min(1, box * 2) }}>“Manpo-kei”</div>
          <div style={{ position: "absolute", left: 445, top: 320, ...UI, fontSize: 40, color: BROWN, opacity: Math.min(1, mean * 2), transform: `translateY(${(1 - Math.min(1, mean)) * 20}px)` }}>= “10,000-step meter”</div>
          <div style={{ position: "absolute", left: 445, top: 372, ...UI, fontSize: 28, color: "rgba(90,59,30,.75)", opacity: Math.min(1, mean * 2) }}>a pedometer sold in Japan</div>
        </>
      )}
      {second && (
        <>
          <svg width="940" height="500" viewBox="0 0 940 500" style={{ position: "absolute", inset: 0 }}>
            <g transform={`translate(${250 + stride} 40) scale(3.6)`}>
              {/* head pops on once he starts walking */}
              <circle cx="30" cy="8" r={9 * Math.min(1, sp(walk, 0, 9, 300))} fill={BROWN} />
              <path d={KANJI[0]} fill="none" stroke={BROWN} strokeWidth="9" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 * (1 - Math.min(1, kan * 3))} transform={`rotate(${-swing * 0.3} 46 26)`} />
              <path d={KANJI[1]} fill="none" stroke={BROWN} strokeWidth="9" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 * (1 - Math.min(1, Math.max(0, kan * 3 - 1)))} transform={`rotate(${swing} 46 30)`} />
              <path d={KANJI[2]} fill="none" stroke={BROWN} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset={100 * (1 - Math.min(1, Math.max(0, kan * 3 - 2)))} transform={`rotate(${-swing} 46 50)`} />
            </g>
            {/* dust puffs behind his steps */}
            {walk > 0 && Array.from({ length: 6 }, (_, i) => { const a = walk - i * 6; if (a < 0) return null; const k = Math.min(1, a / 20); return <circle key={i} cx={250 + Math.max(0, stride - i * 54) + 60} cy={390} r={10 + k * 16} fill="rgba(90,59,30,.25)" opacity={1 - k} />; })}
          </svg>
          <div style={{ position: "absolute", left: 40, top: 60, ...D, fontSize: 54, color: BROWN, opacity: interpolate(kan, [0.2, 0.5], [0, 1], clamp) }}>万 = 10,000</div>
          {walk >= 0 && <Stamp p={sp(walk, 18, 9, 300)} color={RED} rot={-10} style={{ right: 30, top: 50 }}>Marketing, not science</Stamp>}
        </>
      )}
    </div>
  );
}

// ── 3 · the science: a risk curve drawing itself, a sneaker sliding down it, 7,000 pinned, −47% stamped ────────────────
const X0 = 90, X1 = 880, Y0 = 70, Y1 = 400;
const sx = (steps) => X0 + ((steps - 2000) / 10000) * (X1 - X0);
const risk = (s) => 0.47 + 0.53 * Math.exp(-(s - 2000) / 1900);          // illustrative shape: steep, then flat (1.0 at 2,000 → ~0.53 by 7,000)
const sy = (r) => Y1 - ((r - 0.4) / 0.65) * (Y1 - Y0);
function Curve({ t, f, m, L }) {
  const draw = interpolate(t, [6, 50], [0, 1], clamp);
  const pts = Array.from({ length: 81 }, (_, i) => { const s = 2000 + (i / 80) * 10000; return [sx(s), sy(risk(s))]; });
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const pos = Math.min(80, Math.floor(draw * 80)), [wx, wy] = pts[pos];
  const studies = sp(f, m.studies ?? 99999, 9, 300), seven = sp(f, m.seven ?? 99999, 10, 260), drop = sp(f, m.drop ?? 99999, 8, 320), flat = sp(f, m.flat ?? 99999, 12, 220);
  const ten = sp(f, m.ten ?? 99999, 10, 260);
  return (
    <div style={{ ...card(1), inset: 0 }}>
      <svg width="940" height="500" viewBox="0 0 940 500" style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke={INK} strokeWidth="5" /><line x1={X0} y1={Y0 - 20} x2={X0} y2={Y1} stroke={INK} strokeWidth="5" />
        {[2000, 4000, 7000, 10000, 12000].map((s) => <text key={s} x={sx(s)} y={Y1 + 42} textAnchor="middle" fontFamily="Cond" fontWeight="800" fontSize="30" fill={s === 7000 ? GRN : INK}>{s / 1000}K</text>)}
        <text x={X0 - 14} y={Y0 - 30} fontFamily="Cond" fontWeight="800" fontSize="26" fill="rgba(7,7,26,.6)">RISK OF DEATH</text>
        {/* "most of the benefit" zone */}
        <rect x={sx(2000)} y={Y0 - 10} width={(sx(7000) - sx(2000)) * flat} height={Y1 - Y0 + 10} fill="rgba(47,203,134,.16)" />
        <rect x={sx(7000)} y={Y0 - 10} width={(sx(12000) - sx(7000)) * flat} height={Y1 - Y0 + 10} fill="rgba(139,128,255,.08)" />
        {flat > 0.05 && <text x={(sx(2000) + sx(7000)) / 2} y={Y1 - 20} textAnchor="middle" fontFamily="Cond" fontWeight="800" fontSize="34" fill={GRN} opacity={flat}>MOST OF THE BENEFIT</text>}
        {flat > 0.05 && <text x={(sx(7000) + sx(12000)) / 2} y={Y1 - 20} textAnchor="middle" fontFamily="Cond" fontWeight="800" fontSize="30" fill={V} opacity={flat}>A LITTLE EXTRA</text>}
        <path d={path} fill="none" stroke={RED} strokeWidth="9" strokeLinecap="round" strokeDasharray="2000" strokeDashoffset={2000 * (1 - draw)} />
        {/* 7,000 pin */}
        <line x1={sx(7000)} y1={Y1} x2={sx(7000)} y2={Y1 - (Y1 - sy(risk(7000))) * seven} stroke={GRN} strokeWidth="6" strokeDasharray="10 8" />
        <circle cx={sx(7000)} cy={sy(risk(7000))} r={16 * seven} fill={GRN} stroke={INK} strokeWidth="5" />
        {/* 10,000 marker */}
        <circle cx={sx(10000)} cy={sy(risk(10000))} r={13 * ten} fill={VL} stroke={INK} strokeWidth="5" />
        {/* the sneaker sliding down the curve */}
        <g transform={`translate(${wx} ${wy - 26}) rotate(${pos < 30 ? 28 : 6})`}>
          <path d="M-30,10 C-30,-10 -12,-16 0,-16 L8,-4 L30,0 C38,2 38,14 30,14 L-26,14 Z" fill={V} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M-28,14 H32" stroke={PAPER} strokeWidth="5" />
        </g>
      </svg>
      <div style={{ position: "absolute", right: 24, top: 18, padding: "8px 18px", borderRadius: 14, background: GOLD, border: `5px solid ${INK}`, ...D, fontSize: 38, color: INK, transform: `rotate(4deg) scale(${interpolate(studies, [0, 1], [2, 1])})`, opacity: Math.min(1, studies * 3) }}>57 studies · 2025</div>
      <Stamp p={drop} color={GRN} rot={-8} style={{ left: sx(7000) - 60, top: sy(risk(7000)) - 150, fontSize: 70 }}>−47%</Stamp>
      {ten > 0.05 && <div style={{ position: "absolute", left: sx(10000) - 30, top: sy(risk(10000)) - 90, ...D, fontSize: 64, color: V, transform: `scale(${ten})` }}>10K?</div>}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 6, textAlign: "center", ...UI, fontSize: 22, color: "rgba(7,7,26,.55)", opacity: interpolate(t, [30, 40], [0, 1], clamp) }}>Ding et al., Lancet Public Health 2025 · vs 2,000 steps · a link, not proof · curve shape illustrative</div>
    </div>
  );
}

// ── 4 · bedtime: the bed, the moon, the watch on the nightstand saying "enough", Zzz rising ───────────────────────────
function Bed({ t, f, m }) {
  const zzz = m.zzz != null ? Math.max(0, f - m.zzz) : -1, chip = sp(f, (m.zzz ?? 99999) + 10, 9, 300);
  return (
    <div style={{ ...card(-1), inset: 0, background: "#1B1745", overflow: "hidden" }}>
      <svg width="940" height="500" viewBox="0 0 940 500" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={random(`sx${i}`) * 940} cy={random(`sy${i}`) * 220} r={2 + random(`sr${i}`) * 3} fill={PAPER} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 10 + i))} />)}
        {/* window + moon */}
        <rect x="600" y="40" width="260" height="190" rx="14" fill="#2A2363" stroke={INK} strokeWidth="6" />
        <path d="M760 70 A50 50 0 1 0 800 160 A40 40 0 1 1 760 70 Z" fill={GOLD} />
        <line x1="730" y1="40" x2="730" y2="230" stroke={INK} strokeWidth="6" /><line x1="600" y1="135" x2="860" y2="135" stroke={INK} strokeWidth="6" />
        {/* bed */}
        <rect x="80" y="300" width="560" height="110" rx="20" fill={V} stroke={INK} strokeWidth="6" />
        <rect x="60" y="230" width="40" height="220" rx="12" fill="#3A2F8F" stroke={INK} strokeWidth="6" />
        <rect x="110" y="262" width="150" height="56" rx="26" fill={PAPER} stroke={INK} strokeWidth="6" />
        <path d={`M240,300 C330,${282 + Math.sin(f / 12) * 4} 520,${282 + Math.sin(f / 12) * 4} 640,300 L640,350 L240,350 Z`} fill={VL} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        {/* nightstand + watch */}
        <rect x="680" y="330" width="170" height="120" rx="12" fill="#3A2F8F" stroke={INK} strokeWidth="6" />
        <rect x="715" y="270" width="100" height="64" rx="18" fill={INK} stroke={INK} strokeWidth="4" />
        <text x="765" y="311" textAnchor="middle" fontFamily="Cond" fontWeight="800" fontSize="30" fill={GRN}>9,800 ✓</text>
        {/* Zzz */}
        {zzz >= 0 && [0, 1, 2].map((i) => { const a = (zzz - i * 12 + 60) % 60, k = a / 60; return <text key={i} x={220 + k * 120 + i * 20} y={250 - k * 180} fontFamily="Cond" fontWeight="800" fontSize={40 + i * 16} fill={PAPER} opacity={zzz > i * 12 ? Math.sin(k * Math.PI) : 0}>Z</text>; })}
      </svg>
      <div style={{ position: "absolute", left: 40, top: 40, padding: "10px 22px", borderRadius: 16, background: GRN, border: `5px solid ${INK}`, ...D, fontSize: 52, color: INK, transform: `rotate(-5deg) scale(${interpolate(chip, [0, 1], [2, 1])})`, opacity: Math.min(1, chip * 3) }}>Sleep = gains</div>
    </div>
  );
}

export const STEPS_INSERTS = { midnight: Midnight, origin: Origin, curve: Curve, bed: Bed };
