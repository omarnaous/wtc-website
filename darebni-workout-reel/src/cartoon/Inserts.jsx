// Comic-style insert cards for the creatine myths story (screen space, box 940 x 500 at x 70, y 300). Each takes
// t (frames since the insert appeared), f, and m (absolute frames of the line's keyword marks) and animates itself.
// Facts only from the cited sources; every number is shown with its citation.
import { Img, interpolate, spring, staticFile } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const sp = (t, at = 0, d = 12, s = 220) => spring({ frame: t - at, fps: 30, config: { damping: d, stiffness: s } });
const pop = (p, k = 0.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${k + (1 - k) * p})` });
const INK = "#07071A", PAPER = "#F2F0EA", V = "#5B4EE5", VL = "#8B80FF", RED = "#FF4D6A", GRN = "#2FCB86", BLUE = "#4AA8FF", GOLD = "#FFC94A";
const D = { fontFamily: "Cond", fontWeight: 800, textTransform: "uppercase", lineHeight: 0.92, letterSpacing: "-0.01em" };
const UI = { fontFamily: "Barlow", fontWeight: 600 };
const card = (rot = 0) => ({ position: "absolute", background: PAPER, border: `6px solid ${INK}`, borderRadius: 30, boxShadow: `12px 12px 0 ${INK}`, transform: `rotate(${rot}deg)` });
const Cite = ({ children, t, at = 20, style }) => <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, ...UI, fontSize: 24, color: "rgba(7,7,26,.6)", textAlign: "center", opacity: interpolate(t, [at, at + 10], [0, 1], clamp), ...style }}>{children}</div>;
const Stamp = ({ p, children, color = RED, rot = -12, style }) => (
  <div style={{ position: "absolute", padding: "12px 26px", border: `7px solid ${color}`, borderRadius: 16, ...D, fontSize: 54, color, background: "rgba(242,240,234,.92)",
    transform: `rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`, opacity: Math.min(1, p * 3), ...style }}>{children}</div>
);
const Check = ({ size = 60, color = GRN, x }) => (
  <div style={{ width: size, height: size, borderRadius: size / 3.2, background: color, border: `5px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">{x ? <path d="M6 6l12 12M18 6L6 18" stroke={INK} strokeWidth="3.8" strokeLinecap="round" /> : <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={INK} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />}</svg>
  </div>
);
const Kidney = ({ x, y, s = 1, flip, shades }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M40,-70 C-20,-80 -60,-30 -55,20 C-50,75 0,95 40,70 C60,58 55,35 35,25 C15,15 15,-15 35,-25 C60,-37 70,-62 40,-70 Z" fill="#E2566A" stroke={INK} strokeWidth="6" />
    <path d="M-30,-20 C-35,10 -20,40 5,52" stroke="#F78B9A" strokeWidth="8" fill="none" strokeLinecap="round" />
    {shades && <g><rect x="-48" y="-30" width="40" height="22" rx="8" fill={INK} /><rect x="0" y="-30" width="40" height="22" rx="8" fill={INK} /><rect x="-10" y="-24" width="12" height="5" fill={INK} /></g>}
  </g>
);
const Jar = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-90" y="-40" width="180" height="190" rx="34" fill="#1B1745" stroke={INK} strokeWidth="6" />
    <rect x="-96" y="-78" width="192" height="50" rx="16" fill={VL} stroke={INK} strokeWidth="6" />
    <rect x="-90" y="10" width="180" height="90" fill={V} />
    <text x="0" y="66" textAnchor="middle" fontFamily="Cond" fontWeight="800" fontSize="44" fill={PAPER}>CREATINE</text>
    {children}
  </g>
);

function Claims({ t, f, m }) {
  const items = [["bald", "Bald?"], ["kidney", "Kidneys?"], ["weight", "Fat?"]];
  return items.map(([k, label], i) => {
    const p = sp(f, m[k] ?? 99999, 10, 260), rot = [-6, 4, -3][i];
    const icon = i === 0 ? (
      <svg width="150" height="130" viewBox="0 0 150 130"><ellipse cx="75" cy="72" rx="58" ry="54" fill="#C98B5E" stroke={INK} strokeWidth="6" /><ellipse cx="55" cy="40" rx="18" ry="9" fill="#fff" opacity=".7" />
        {[0, 1, 2].map((j) => <path key={j} d={`M${60 + j * 14},18 q-6,${-14 - j * 4} 4,-${22 + j * 3}`} stroke={INK} strokeWidth="4" fill="none" transform={`translate(0 ${((f + j * 9) % 40) * 1.2})`} opacity={0.8} />)}</svg>
    ) : i === 1 ? (
      <svg width="170" height="130" viewBox="-85 -80 170 170"><Kidney x={-28} y={0} s={0.8} /><Kidney x={28} y={0} s={0.8} flip /></svg>
    ) : (
      <svg width="150" height="130" viewBox="0 0 150 130"><rect x="10" y="20" width="130" height="100" rx="20" fill="#E9E5FF" stroke={INK} strokeWidth="6" /><path d="M40,60 A35,35 0 0 1 110,60" fill="none" stroke={INK} strokeWidth="5" />
        <line x1="75" y1="62" x2={75 + 30 * Math.cos(-Math.PI / 2 + 0.6 * Math.sin(f / 4))} y2={62 + 30 * Math.sin(-Math.PI / 2 + 0.6 * Math.sin(f / 4))} stroke={RED} strokeWidth="6" strokeLinecap="round" /></svg>
    );
    return (
      <div key={k} style={{ ...card(rot), left: 20 + i * 310, top: 60 + (i % 2) * 40, width: 270, height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, ...pop(p), transform: `rotate(${rot}deg) scale(${0.4 + 0.6 * p})` }}>
        {icon}
        <div style={{ ...D, fontSize: 64, color: INK }}>{label}</div>
        <div style={{ position: "absolute", top: -26, right: -20, width: 64, height: 64, borderRadius: 32, background: GOLD, border: `5px solid ${INK}`, ...D, fontSize: 48, color: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>?</div>
      </div>
    );
  });
}

function Degree({ t, f, m }) {
  const p = sp(f, m.degree ?? 0, 11, 200);
  return (
    <div style={{ ...card(-4), left: 120, top: 40, width: 700, height: 380, padding: 36, ...pop(p, 0.6), transform: `rotate(${-4 + (1 - p) * 20}deg) scale(${0.6 + 0.4 * p})`, textAlign: "center",
      backgroundImage: "repeating-linear-gradient(0deg, rgba(91,78,229,.06) 0 2px, transparent 2px 22px)" }}>
      <div style={{ ...D, fontSize: 30, letterSpacing: "0.14em", color: V }}>Official-ish certificate</div>
      <div style={{ ...D, fontSize: 82, color: INK, marginTop: 14 }}>Bachelor of</div>
      <div style={{ ...D, fontSize: 100, color: RED }}>Scrolling</div>
      <div style={{ ...UI, fontSize: 32, color: INK, marginTop: 14 }}>University of the For You Page</div>
      <div style={{ position: "absolute", right: 34, bottom: 28, width: 110, height: 110, borderRadius: 55, background: GOLD, border: `5px solid ${INK}`, ...D, fontSize: 30, color: INK, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${f * 2}deg)` }}>FYP</div>
    </div>
  );
}

function Strength({ t, f, m }) {
  const st = sp(f, m.studies ?? 0, 12, 200), q = interpolate(f, [(m.bars ?? 0), (m.bars ?? 0) + 34], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const n = Math.min(22, Math.floor(interpolate(f, [m.studies ?? 0, (m.studies ?? 0) + 30], [0, 22], clamp)));
  const bar = (x, v, label, hot, delay) => {
    const h = 250 * (v / 22) * interpolate(f, [(m.bars ?? 0) + delay, (m.bars ?? 0) + 34 + delay], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
    return (
      <div style={{ position: "absolute", left: x, bottom: 112, width: 170, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 76, color: hot ? V : "rgba(7,7,26,.55)" }}>+{Math.round(v * q)}%</div>
        <div style={{ height: h, marginTop: 8, borderRadius: "18px 18px 0 0", border: `5px solid ${INK}`, borderBottom: "none", background: hot ? `linear-gradient(180deg, ${VL}, ${V})` : "#C9C4E8" }} />
        <div style={{ position: "absolute", bottom: -54, left: -20, right: -20, ...D, fontSize: 34, color: INK }}>{label}</div>
      </div>
    );
  };
  return (
    <div style={{ ...card(-2), left: 30, top: 10, width: 880, height: 470, ...pop(sp(t, 0, 12, 220), 0.7) }}>
      <div style={{ position: "absolute", left: 40, top: 40, width: 320, ...pop(st, 0.5) }}>
        <div style={{ position: "relative", height: 230 }}>
          {Array.from({ length: n }, (_, i) => <div key={i} style={{ position: "absolute", left: 20 + (i % 11) * 22, top: 130 - Math.floor(i / 11) * 90 - (i % 11) * 4, width: 64, height: 86, borderRadius: 8, background: "#fff", border: `4px solid ${INK}`, transform: `rotate(${(i % 3 - 1) * 6}deg)` }} />)}
        </div>
        <div style={{ ...D, fontSize: 96, color: INK, marginTop: 10 }}>{n}</div>
        <div style={{ ...D, fontSize: 40, color: V }}>studies reviewed</div>
      </div>
      {bar(420, 20, "Creatine", true, 0)}
      {bar(640, 12, "Placebo", false, 6)}
      <div style={{ position: "absolute", left: 400, right: 40, bottom: 108, height: 5, background: INK }} />
      <Cite t={t} at={12}>Average strength gain, 22 studies · Rawson & Volek, J Strength Cond Res, 2003</Cite>
    </div>
  );
}

function Reps({ t, f, m }) {
  const p = sp(f, m.reps ?? 0, 9, 260), v = Math.round(14 * interpolate(f, [(m.reps ?? 0), (m.reps ?? 0) + 24], [0, 1], clamp));
  return (
    <div style={{ ...card(2), left: 140, top: 30, width: 660, height: 420, textAlign: "center", ...pop(sp(t, 0), 0.6) }}>
      <div style={{ ...D, fontSize: 40, color: V, marginTop: 40, letterSpacing: "0.1em" }}>Reps at the same weight</div>
      <div style={{ ...D, fontSize: 230, color: INK, ...pop(p, 0.5) }}>+{v}%</div>
      <div style={{ ...D, fontSize: 48, color: RED }}>more than placebo</div>
      <Cite t={t} at={10}>Rawson & Volek, 2003</Cite>
    </div>
  );
}

function Shaker({ t, f, m }) {
  const slosh = Math.sin(f / 5) * 10, p = sp(t, 0, 11, 220), w = sp(f, m.water ?? 99999, 10, 240);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 500, ...pop(p, 0.6) }}>
      <svg width="940" height="500" viewBox="0 0 940 500">
        <g transform={`translate(330 40) rotate(${slosh * 0.6} 140 230)`}>
          <rect x="40" y="60" width="200" height="380" rx="40" fill="rgba(233,229,255,.25)" stroke={INK} strokeWidth="8" />
          <clipPath id="shk"><rect x="44" y="64" width="192" height="372" rx="36" /></clipPath>
          <g clipPath="url(#shk)"><path d={`M40,${220 + slosh} Q140,${200 - slosh} 240,${220 + slosh} L240,440 L40,440 Z`} fill={BLUE} opacity="0.85" /></g>
          <rect x="30" y="10" width="220" height="70" rx="22" fill={V} stroke={INK} strokeWidth="8" />
          <rect x="190" y="-30" width="40" height="50" rx="12" fill={VL} stroke={INK} strokeWidth="6" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 40, top: 120, ...D, fontSize: 70, color: GOLD, transform: "rotate(-8deg)", textShadow: `5px 5px 0 ${INK}` }}>$$$</div>
      <div style={{ position: "absolute", right: 30, top: 110, width: 280, ...D, fontSize: 58, color: PAPER, textShadow: `5px 5px 0 ${INK}`, ...pop(w, 0.4) }}>Flavored water?</div>
      <Stamp p={sp(t, 70, 9, 300)} color={GRN} style={{ right: 60, top: 330 }}>Nope. It works.</Stamp>
    </div>
  );
}

function Kidneys({ t, f, m }) {
  const p = sp(t, 0, 12, 220), sh = sp(f, m.issn ?? 0, 10, 220);
  return (
    <div style={{ ...card(-2), left: 60, top: 10, width: 820, height: 460, ...pop(p, 0.7) }}>
      <svg width="360" height="380" viewBox="-180 -170 360 380" style={{ position: "absolute", left: 20, top: 40 }}>
        <Kidney x={-70} y={0} s={1.2} /><Kidney x={70} y={0} s={1.2} flip />
        <g transform={`translate(0 30) scale(${sh})`} opacity={Math.min(1, sh * 2)}>
          <path d="M0,-110 L95,-75 C95,10 60,70 0,110 C-60,70 -95,10 -95,-75 Z" fill={GRN} stroke={INK} strokeWidth="7" opacity="0.95" />
          <path d="M-38,0 L-8,30 L44,-30" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 390, top: 70, right: 30 }}>
        <div style={{ ...D, fontSize: 84, color: INK, opacity: sh }}>Safe & well</div>
        <div style={{ ...D, fontSize: 84, color: GRN, opacity: sh, WebkitTextStroke: `2px ${INK}` }}>tolerated</div>
        <div style={{ ...UI, fontSize: 36, color: INK, marginTop: 20, opacity: interpolate(f, [(m.issn ?? 0) + 30, (m.issn ?? 0) + 40], [0, 1], clamp) }}>in healthy people, even in long-term studies</div>
      </div>
      <Cite t={f - (m.issn ?? 0)} at={10}>International Society of Sports Nutrition position stand · Kreider et al., 2017</Cite>
    </div>
  );
}

function Beach({ t, f }) {
  const p = sp(t, 0, 11, 200);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 500, ...pop(p, 0.6) }}>
      <svg width="940" height="500" viewBox="0 0 940 500">
        <circle cx="770" cy="110" r={70 + 4 * Math.sin(f / 8)} fill={GOLD} stroke={INK} strokeWidth="6" />
        {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 + f / 60; return <line key={i} x1={770 + Math.cos(a) * 92} y1={110 + Math.sin(a) * 92} x2={770 + Math.cos(a) * 120} y2={110 + Math.sin(a) * 120} stroke={GOLD} strokeWidth="8" strokeLinecap="round" />; })}
        <path d="M140,420 L560,420 L520,300 L200,300 Z" fill="#FF8FA0" stroke={INK} strokeWidth="7" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={230 + i * 85} y1={300} x2={200 + i * 100} y2={420} stroke={INK} strokeWidth="4" />)}
        <line x1="160" y1="420" x2="140" y2="490" stroke={INK} strokeWidth="9" /><line x1="540" y1="420" x2="560" y2="490" stroke={INK} strokeWidth="9" />
        <g transform={`translate(0 ${Math.sin(f / 10) * 3})`}><Kidney x={300} y={250} s={1.1} shades /><Kidney x={420} y={250} s={1.1} flip shades /></g>
        <text x="610" y="330" fontFamily="Cond" fontWeight="800" fontSize="70" fill={PAPER} stroke={INK} strokeWidth="3">CHILL</text>
        <text x="610" y="400" fontFamily="Cond" fontWeight="800" fontSize="70" fill={GOLD} stroke={INK} strokeWidth="3">MODE</text>
      </svg>
    </div>
  );
}

function Doctor({ t }) {
  const p = sp(t, 0, 12, 220);
  return (
    <div style={{ ...card(2), left: 150, top: 60, width: 640, height: 330, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", ...pop(p, 0.6), background: "#FFF4D1" }}>
      <svg width="170" height="200" viewBox="0 0 170 200"><path d="M40,20 L40,90 C40,140 130,140 130,90 L130,20" fill="none" stroke={INK} strokeWidth="12" strokeLinecap="round" />
        <path d="M85,128 L85,160" stroke={INK} strokeWidth="12" /><circle cx="85" cy="172" r="22" fill={V} stroke={INK} strokeWidth="8" /><circle cx="40" cy="20" r="10" fill={INK} /><circle cx="130" cy="20" r="10" fill={INK} /></svg>
      <div>
        <div style={{ ...D, fontSize: 64, color: INK }}>Medical condition?</div>
        <div style={{ ...D, fontSize: 64, color: V }}>Ask your doctor.</div>
      </div>
    </div>
  );
}

function Paper({ t, f, m }) {
  const rows = ["Study · 2009", "20 rugby players", "Measured: DHT (a hormone)", "Measured hair loss?"];
  const stamp = sp(f, m.stamp ?? 99999, 9, 300);
  return (
    <div style={{ ...card(-3), left: 110, top: 0, width: 720, height: 470, padding: "34px 44px", ...pop(sp(t, 0, 12, 220), 0.7),
      backgroundImage: "repeating-linear-gradient(0deg, rgba(7,7,26,.07) 0 2px, transparent 2px 60px)" }}>
      {rows.map((r, i) => (
        <div key={r} style={{ display: "flex", alignItems: "center", gap: 18, height: 92, opacity: interpolate(t, [8 + i * 10, 14 + i * 10], [0, 1], clamp) }}>
          {i === 3 ? <Check size={56} color={RED} x /> : <div style={{ width: 20, height: 20, borderRadius: 10, background: V, margin: "0 18px" }} />}
          <span style={{ ...D, fontSize: i === 0 ? 64 : 54, color: i === 3 ? RED : INK }}>{r}</span>
        </div>
      ))}
      <Stamp p={stamp} style={{ right: -40, bottom: -50 }}>Never measured hair</Stamp>
    </div>
  );
}

function Barber({ t, f }) {
  const p = sp(t, 0, 11, 220), snip = Math.abs(Math.sin(f / 3)) * 18, no = sp(t, 50, 9, 300);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 500, ...pop(p, 0.5) }}>
      <svg width="940" height="500" viewBox="0 0 940 500">
        {/* barber pole */}
        <g transform="translate(130 60)"><rect x="0" y="0" width="90" height="360" rx="40" fill="#fff" stroke={INK} strokeWidth="7" />
          <clipPath id="pole"><rect x="4" y="4" width="82" height="352" rx="36" /></clipPath>
          <g clipPath="url(#pole)">{Array.from({ length: 12 }, (_, i) => <rect key={i} x="-60" y={-60 + i * 50 + (f * 2) % 50} width="220" height="22" fill={i % 2 ? RED : BLUE} transform="rotate(-30 45 180)" />)}</g></g>
        <Jar x={470} y={230} s={1.1}>
          {/* mustache */}
          <path d="M-60,-10 C-40,-30 -10,-20 0,-8 C10,-20 40,-30 60,-10 C40,0 15,-4 0,4 C-15,-4 -40,0 -60,-10 Z" fill={INK} transform="translate(0 -6)" />
        </Jar>
        {/* scissors */}
        <g transform="translate(700 170)">
          <g transform={`rotate(${-snip})`}><rect x="0" y="-8" width="150" height="16" rx="8" fill="#C9C4E8" stroke={INK} strokeWidth="5" /><circle cx="-26" cy="-14" r="24" fill="none" stroke={RED} strokeWidth="10" /></g>
          <g transform={`rotate(${snip})`}><rect x="0" y="-8" width="150" height="16" rx="8" fill="#C9C4E8" stroke={INK} strokeWidth="5" /><circle cx="-26" cy="14" r="24" fill="none" stroke={RED} strokeWidth="10" /></g>
        </g>
      </svg>
      <Stamp p={no} style={{ right: 40, top: 360 }}>Not a barber</Stamp>
    </div>
  );
}

function Brain({ t, f, m }) {
  const p = sp(t, 0, 11, 200), glow = 0.6 + 0.4 * Math.sin(f / 5), st = sp(f, m.study ?? 99999, 12, 220), flex = sp(f, m.flex ?? 99999, 10, 260);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 500 }}>
      <svg width="440" height="420" viewBox="-220 -200 440 420" style={{ position: "absolute", left: 0, top: 20, ...pop(p, 0.5) }}>
        <circle r={190} fill={VL} opacity={0.25 * glow} />
        <path d="M-150,10 C-170,-80 -100,-150 -20,-140 C30,-175 120,-150 140,-80 C190,-50 180,40 130,70 C120,130 40,150 -10,120 C-60,150 -140,120 -140,60 C-170,50 -170,25 -150,10 Z" fill="#FF9BB3" stroke={INK} strokeWidth="8" />
        <path d="M-90,-80 C-60,-100 -30,-70 -50,-40 M10,-120 C0,-80 40,-70 30,-40 M80,-90 C110,-70 90,-30 110,0 M-110,20 C-80,10 -60,40 -80,70 M-20,30 C10,0 40,30 20,70 M60,40 C90,30 110,60 90,90" stroke="#D9607F" strokeWidth="9" fill="none" strokeLinecap="round" />
        {[0, 1, 2].map((i) => { const a = -1.2 + i * 1.1 + Math.sin(f / 6 + i) * 0.1; return <path key={i} d={`M${Math.cos(a) * 170},${Math.sin(a) * 170 - 10} l20,-30 l-14,4 l18,-34`} stroke={GOLD} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={(Math.sin(f / 3 + i * 2) > 0) ? 1 : 0.2} />; })}
      </svg>
      {/* moon, no sleep */}
      <div style={{ position: "absolute", left: 440, top: 20, width: 470, ...pop(st, 0.6) }}>
        <div style={{ ...card(3), position: "relative", padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="90" height="90" viewBox="0 0 90 90"><path d="M60,10 A40,40 0 1 0 80,62 A32,32 0 1 1 60,10 Z" fill={GOLD} stroke={INK} strokeWidth="5" /><line x1="8" y1="8" x2="82" y2="82" stroke={RED} strokeWidth="9" strokeLinecap="round" /></svg>
            <div style={{ ...D, fontSize: 52, color: INK }}>No sleep</div>
          </div>
          <div style={{ ...D, fontSize: 44, color: V, marginTop: 14 }}>One high dose</div>
          <div style={{ ...UI, fontSize: 32, color: INK, marginTop: 8 }}>partly improved thinking</div>
        </div>
      </div>
      {/* the flexed arm when Karim says "and my muscles" */}
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", left: 640, top: 300, ...pop(flex, 0.3) }}>
        <path d="M30,170 L80,170 C90,120 110,110 120,80 C150,90 170,70 160,40 C150,15 115,20 105,45 C90,70 60,80 40,120 Z" fill="#C98B5E" stroke={INK} strokeWidth="7" />
      </svg>
      <Cite t={f - (m.study ?? 0)} at={10} style={{ left: 440, bottom: 70, textAlign: "left", color: "rgba(242,240,234,.85)" }}>Gordji-Nejad et al., Scientific Reports, 2024 · small study</Cite>
    </div>
  );
}

function BrainWarn({ t, f }) {
  const p = sp(t, 0, 12, 220);
  return (
    <div style={{ ...card(-2), left: 80, top: 40, width: 780, height: 400, ...pop(p, 0.6), background: "#FFF4D1" }}>
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: "absolute", left: 30, top: 50 }}>
        <path d="M20,280 C40,140 110,60 150,60 C190,60 260,140 280,280 Z" fill="#fff" stroke={INK} strokeWidth="7" />
        <text x="150" y="220" textAnchor="middle" fontFamily="Cond" fontWeight="800" fontSize="64" fill={RED}>HIGH</text>
      </svg>
      <div style={{ position: "absolute", left: 330, top: 120, ...D, fontSize: 120, color: INK }}>≠</div>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", left: 440, top: 110 }}>
        <path d="M20,90 L140,90 C140,150 20,150 20,90 Z" fill={VL} stroke={INK} strokeWidth="7" /><rect x="135" y="80" width="60" height="18" rx="9" fill={VL} stroke={INK} strokeWidth="6" />
        <ellipse cx="80" cy="88" rx="56" ry="16" fill="#fff" stroke={INK} strokeWidth="5" />
      </svg>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 26, display: "flex", justifyContent: "space-between", ...D, fontSize: 40, color: INK }}>
        <span>Experimental dose</span><span style={{ color: V }}>Your daily scoop</span>
      </div>
    </div>
  );
}

function Scale({ t, f }) {
  const p = sp(t, 0, 11, 220), needle = interpolate(sp(t, 12, 7, 160), [0, 1], [-1.2, 0.7]);
  return (
    <div style={{ position: "absolute", left: 220, top: 30, width: 500, height: 440, ...pop(p, 0.5) }}>
      <svg width="500" height="440" viewBox="0 0 500 440">
        <rect x="20" y="60" width="460" height="360" rx="70" fill="#E9E5FF" stroke={INK} strokeWidth="9" />
        <path d="M120,220 A130,130 0 0 1 380,220" fill="none" stroke={INK} strokeWidth="8" />
        {Array.from({ length: 9 }, (_, i) => { const a = Math.PI + (i / 8) * Math.PI; return <line key={i} x1={250 + Math.cos(a) * 130} y1={230 + Math.sin(a) * 130} x2={250 + Math.cos(a) * 110} y2={230 + Math.sin(a) * 110} stroke={INK} strokeWidth="6" />; })}
        <line x1="250" y1="230" x2={250 + Math.sin(needle) * 120} y2={230 - Math.cos(needle) * 120} stroke={RED} strokeWidth="10" strokeLinecap="round" />
        <circle cx="250" cy="230" r="18" fill={INK} />
        <rect x="150" y="300" width="200" height="70" rx="18" fill={INK} />
        <text x="250" y="352" textAnchor="middle" fontFamily="Cond" fontWeight="800" fontSize="54" fill={GOLD}>UP ?!</text>
      </svg>
    </div>
  );
}

function Cell({ t, f, m, L }) {
  const p = sp(t, 0, 12, 220), water = sp(f, m.water ?? 0, 14, 120), fat = sp(f, m.fat ?? 99999, 10, 260), yes = sp(t, L.text === "Exactly." ? 0 : 99999, 9, 300);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 500, ...pop(p, 0.6) }}>
      <svg width="560" height="440" viewBox="0 0 560 440" style={{ position: "absolute", left: 10, top: 20 }}>
        <g transform={`translate(280 220) scale(${1 + 0.16 * water})`}>
          <rect x="-230" y="-110" width="460" height="220" rx="110" fill="#E2566A" stroke={INK} strokeWidth="8" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-180 + i * 45} y1={-90} x2={-180 + i * 45} y2={90} stroke="#B83A4F" strokeWidth="8" />)}
          {Array.from({ length: 12 }, (_, i) => {
            const k = Math.min(1, Math.max(0, water * 1.3 - i * 0.06)), x = -170 + (i % 6) * 68, y0 = -260 + Math.floor(i / 6) * 40, y1 = -40 + Math.floor(i / 6) * 70;
            return <path key={i} d="M0,-18 C10,-4 14,4 14,10 A14,14 0 0 1 -14,10 C-14,4 -10,-4 0,-18 Z" fill={BLUE} stroke={INK} strokeWidth="4" transform={`translate(${x} ${y0 + (y1 - y0) * k})`} opacity={k > 0 ? 1 : 0} />;
          })}
        </g>
      </svg>
      <div style={{ position: "absolute", left: 40, bottom: 0, display: "flex", alignItems: "center", gap: 14, opacity: water }}><Check size={60} color={BLUE} /><span style={{ ...D, fontSize: 56, color: PAPER, textShadow: `4px 4px 0 ${INK}` }}>Water in muscle</span></div>
      <div style={{ position: "absolute", right: 30, top: 90, textAlign: "center", ...pop(fat, 0.4) }}>
        <svg width="220" height="200" viewBox="0 0 220 200"><path d="M40,110 C20,60 70,20 110,40 C150,10 210,50 185,100 C215,140 160,190 110,170 C60,195 10,160 40,110 Z" fill={GOLD} stroke={INK} strokeWidth="7" />
          <line x1="20" y1="20" x2="200" y2="180" stroke={RED} strokeWidth="16" strokeLinecap="round" /></svg>
        <div style={{ ...D, fontSize: 56, color: PAPER, textShadow: `4px 4px 0 ${INK}` }}>Not body fat</div>
      </div>
      <Stamp p={yes} color={GRN} style={{ left: 300, top: 160 }}>Exactly.</Stamp>
    </div>
  );
}

function Scoop({ t, f, m }) {
  const p = sp(t, 0, 11, 220), dose = sp(f, m.scoop ?? 0, 10, 240), no = sp(f, m.nomagic ?? 99999, 10, 260);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 500, ...pop(p, 0.6) }}>
      <svg width="420" height="380" viewBox="0 0 420 380" style={{ position: "absolute", left: 10, top: 40, transform: `rotate(${-8 + Math.sin(f / 12) * 3}deg)` }}>
        <path d="M30,170 L270,170 C270,300 30,300 30,170 Z" fill={VL} stroke={INK} strokeWidth="9" />
        <rect x="262" y="150" width="150" height="34" rx="17" fill={VL} stroke={INK} strokeWidth="8" />
        <path d="M40,172 C70,100 120,80 150,80 C185,80 235,110 262,172 Z" fill="#fff" stroke={INK} strokeWidth="7" />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={70 + (i * 37) % 190} cy={130 + ((i * 53) % 40)} r={4} fill="#DAD6F2" />)}
      </svg>
      <div style={{ position: "absolute", left: 450, top: 20, ...pop(dose, 0.4) }}>
        <div style={{ ...D, fontSize: 170, color: PAPER, textTransform: "none", textShadow: `8px 8px 0 ${INK}` }}>3–5 g</div>
        <div style={{ ...D, fontSize: 52, color: GOLD, textShadow: `5px 5px 0 ${INK}` }}>a day</div>
        <div style={{ ...D, fontSize: 40, color: PAPER, textShadow: `4px 4px 0 ${INK}`, marginTop: 6 }}>creatine monohydrate</div>
      </div>
      <div style={{ position: "absolute", left: 440, top: 370, display: "flex", gap: 16 }}>
        {["No magic", "No cycling"].map((x, i) => (
          <div key={x} style={{ padding: "12px 22px", borderRadius: 18, background: PAPER, border: `5px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}`, ...D, fontSize: 42, color: INK, ...pop(sp(f, (m.nomagic ?? 99999) + i * 10, 10, 260), 0.3) }}>{x}</div>
        ))}
      </div>
    </div>
  );
}

export const INSERTS = { claims: Claims, degree: Degree, strength: Strength, reps: Reps, shaker: Shaker, kidneys: Kidneys, beach: Beach, doctor: Doctor,
  paper: Paper, barber: Barber, brain: Brain, brainwarn: BrainWarn, scale: Scale, cell: Cell, scoop: Scoop };
