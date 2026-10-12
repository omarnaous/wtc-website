// "Your morning costs $1": the sun rises over Beirut, becomes the coffee in the cup, and a $1 bill wraps
// the cup as its sleeve. Then a week of $1 mornings, the hero shot, and the end card.
// Every move is driven by the frame; the beats live in timing.js (sound and voice read the same file).
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, BEAT } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Grain, Vignette } from "./fx.jsx";

export const C = {
  orange: "#FF671F", pink: "#DA1884", brown: "#4A2511", coffee: "#5A2F18", crema: "#D9A26B",
  cream: "#FFF4E6", white: "#FFFDF9", night: "#140E2E", dusk: "#3B1D4A", bill: "#DDE6D2", billInk: "#3F6B45",
};
const ROUND = { fontFamily: "Round", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 };
const MONO = { fontFamily: "Mono", letterSpacing: "0.18em", textTransform: "uppercase" };
const lerp = (a, b, t) => a + (b - a) * t;
const pop = (f, at, damping = 10, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });

// ── the cup, side view. viewBox x -10..110, y -60..140; body spans y 8..124 ──────────────────────────
const BODY = "M2,8 L98,8 L87,118 Q86,124 80,124 L20,124 Q14,124 13,118 Z";
function Cup({ w, sleeve = 0, steam = 1, f, swirl = 0, id = "c", hideTop = false, badge = 0 }) {
  const s = w / 120;
  const st = (k) => {
    const ph = f / 9 + k * 2.1, y0 = -4, x0 = 34 + k * 16;
    const d = `M${x0},${y0} C${x0 - 7},${y0 - 12} ${x0 + 7},${y0 - 22} ${x0},${y0 - 34} C${x0 - 7},${y0 - 44} ${x0 + 6},${y0 - 50} ${x0},${y0 - 56}`;
    return <path key={k} d={d} fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={steam * (0.35 + 0.25 * Math.sin(ph))}
      strokeDasharray="70 200" strokeDashoffset={-((f * 1.6 + k * 30) % 270)} />;
  };
  return (
    <svg width={w} height={200 * s} viewBox="-10 -60 120 200" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <clipPath id={`${id}-body`}><path d={BODY} /></clipPath>
        <linearGradient id={`${id}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".22" /><stop offset=".35" stopColor="#000" stopOpacity="0" />
          <stop offset=".62" stopColor="#fff" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity=".26" />
        </linearGradient>
        <radialGradient id={`${id}-cof`}><stop offset="0" stopColor="#3A1A0B" /><stop offset="1" stopColor={C.coffee} /></radialGradient>
      </defs>
      <ellipse cx="50" cy="128" rx="44" ry="6" fill="#000" opacity=".16" />
      <path d={BODY} fill={C.white} />
      <g clipPath={`url(#${id}-body)`}>
        <rect x="-10" y="16" width="120" height="13" fill={C.orange} />
        <rect x="-10" y="104" width="120" height="9" fill={C.pink} />
        {[22, 38, 54, 70].map((x, i) => <circle key={i} cx={x + 4} cy="36.5" r="2.2" fill={C.pink} opacity=".9" />)}
        {/* the $1 bill as the sleeve */}
        {sleeve > 0 && (
          <g transform={`translate(50 68) scale(${lerp(1.55, 1, Math.min(1, sleeve))} 1) translate(-50 -68)`} opacity={Math.min(1, sleeve * 3)}>
            <rect x="-10" y="44" width="120" height="48" fill={C.bill} />
            <rect x="-10" y="47" width="120" height="42" fill="none" stroke={C.billInk} strokeWidth="1.6" strokeDasharray="3 2" />
            <ellipse cx="50" cy="68" rx="17" ry="15" fill="none" stroke={C.billInk} strokeWidth="2" />
            <text x="50" y="76" textAnchor="middle" fontFamily="Round" fontWeight="700" fontSize="22" fill={C.billInk}>$1</text>
            <text x="12" y="62" textAnchor="middle" fontFamily="Round" fontWeight="700" fontSize="12" fill={C.billInk}>1</text>
            <text x="88" y="84" textAnchor="middle" fontFamily="Round" fontWeight="700" fontSize="12" fill={C.billInk}>1</text>
            <text x="50" y="89.5" textAnchor="middle" fontFamily="Mono" fontSize="4.6" letterSpacing="1.2" fill={C.billInk}>ONE DOLLAR</text>
          </g>
        )}
        <rect x="-10" y="0" width="120" height="130" fill={`url(#${id}-shade)`} />
      </g>
      {/* rim + coffee */}
      {!hideTop && (
        <>
          <ellipse cx="50" cy="8" rx="49" ry="7.5" fill={C.white} />
          <ellipse cx="50" cy="9" rx="45.5" ry="6" fill={`url(#${id}-cof)`} />
          <ellipse cx="50" cy="9" rx="30" ry="3.6" fill="none" stroke={C.crema} strokeWidth="1.4" opacity=".55" strokeDasharray="18 8" strokeDashoffset={-swirl} />
          <ellipse cx="50" cy="9" rx="16" ry="2" fill="none" stroke={C.crema} strokeWidth="1.2" opacity=".5" strokeDasharray="10 6" strokeDashoffset={swirl * 1.4} />
        </>
      )}
      {[0, 1, 2].map(st)}
      {badge > 0 && (
        <g transform={`translate(98 30) rotate(${lerp(-40, -12, Math.min(1, badge))}) scale(${lerp(2.2, 1, Math.min(1, badge))})`} opacity={Math.min(1, badge * 2)}>
          <circle r="21" fill={C.pink} /><circle r="18" fill="none" stroke="#fff" strokeWidth="1.2" strokeDasharray="2.4 2" />
          <text y="7.5" textAnchor="middle" fontFamily="Round" fontWeight="700" fontSize="21" fill="#fff">$1</text>
        </g>
      )}
    </svg>
  );
}
// screen geometry of a Cup rendered with its body centred at (cx, cy)
const cupGeo = (cx, cy, w) => { const s = w / 120; const y0 = cy - (66 + 60) * s; return { left: cx - w / 2, top: y0, rimX: cx, rimY: y0 + 69 * s, rx: 45.5 * s, ry: 6 * s, s }; };

// ── Beirut at dawn: the sun comes up over Mount Lebanon, behind the city (east) ─────────────────────
const sunPos = (f, W, H, u) => {
  const rise = interpolate(f, [0, T.dive], [0, 1], { ...clamp, easing: easeOut });
  return [W * 0.6, lerp(H * 0.7 - 150 * u, H * 0.43, rise), rise];
};
function Dawn({ f, W, H, u }) {
  const [sunX, sunY] = sunPos(f, W, H, u);
  const ground = H * (H > 1600 ? 0.78 : 0.70), sunR = 120 * u;
  const warm = interpolate(f, [0, T.dive], [0, 1], clamp);
  const bld = Array.from({ length: 22 }, (_, i) => {
    const bw = (34 + random(`w${i}`) * 46) * u, bh = (60 + random(`h${i}`) * 230) * u;
    return { x: (i / 22) * W * 1.05 - 20 * u, w: bw, h: bh };
  });
  // the mountain range behind the city
  const ridge = (k, amp, base) => {
    const pts = Array.from({ length: 13 }, (_, i) => `${(i / 12) * W},${ground - base * u - (Math.sin(i * 1.7 + k) * 0.5 + 0.5) * amp * u - random(`m${k}${i}`) * 40 * u}`);
    return `M0,${H} L${pts.join(" L")} L${W},${H} Z`;
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.night} 0%, ${C.dusk} ${lerp(55, 32, warm)}%, rgba(255,103,31,${0.25 + 0.55 * warm}) 66%, #FFB070 74%)` }} />
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`sx${i}`) * W, top: random(`sy${i}`) * H * 0.45, width: 3 * u, height: 3 * u, borderRadius: 9, background: "#fff", opacity: (1 - warm) * (0.3 + 0.6 * random(`so${i}`)) * (0.7 + 0.3 * Math.sin(f / 6 + i)) }} />
      ))}
      <div style={{ position: "absolute", left: sunX - sunR * 3, top: sunY - sunR * 3, width: sunR * 6, height: sunR * 6, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,140,60,${0.35 + 0.3 * warm}), transparent 60%)` }} />
      <div style={{ position: "absolute", left: sunX - sunR, top: sunY - sunR, width: sunR * 2, height: sunR * 2, borderRadius: "50%", background: `radial-gradient(circle at 40% 38%, #FFC27A, ${C.orange} 62%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={ridge(1, 150, 250)} fill="#3A2152" opacity=".9" />
        <path d={ridge(4, 110, 170)} fill="#2A1842" />
        {bld.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={ground - b.h} width={b.w} height={b.h} fill="#1A1030" />
            {Array.from({ length: Math.floor(b.h / (26 * u)) }, (_, r) => Array.from({ length: Math.max(1, Math.floor(b.w / (16 * u))) }, (_, c) => (
              random(`win${i}-${r}-${c}`) > 0.62 ? <rect key={`${r}-${c}`} x={b.x + 6 * u + c * 16 * u} y={ground - b.h + 10 * u + r * 26 * u} width={6 * u} height={9 * u} fill="#FFC27A" opacity={0.5 + 0.4 * warm} /> : null
            )))}
          </g>
        ))}
        <rect x="0" y={ground} width={W} height={H - ground} fill="#160D2A" />
        {/* morning traffic: tail lights along the corniche road */}
        {Array.from({ length: 6 }, (_, i) => { const x = ((f * (4 + i) * u + i * 230 * u) % (W + 200 * u)) - 100 * u; return <rect key={i} x={x} y={ground + 40 * u + (i % 2) * 26 * u} width={34 * u} height={6 * u} rx={3 * u} fill={i % 2 ? "#FF5A4E" : "#FFD9A0"} opacity=".8" />; })}
      </svg>
    </AbsoluteFill>
  );
}

function FlipClock({ f, x, y, u }) {
  const flipT = interpolate(f, [T.flip, T.flip + 8], [0, 1], clamp);
  const digits = (txt) => txt.split("").map((d, i) => (d === ":" ? <span key={i} style={{ width: 30 * u, textAlign: "center" }}>:</span> :
    <span key={i} style={{ display: "inline-block", width: 92 * u, height: 128 * u, lineHeight: `${128 * u}px`, textAlign: "center", borderRadius: 18 * u, background: "rgba(255,255,255,.1)", margin: `0 ${5 * u}px`, boxShadow: "inset 0 -3px 0 rgba(0,0,0,.25)" }}>{d}</span>));
  const old = flipT < 0.5, rot = old ? flipT * 2 * -90 : (1 - flipT) * 2 * 90;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "grid", justifyItems: "center", gap: 18 * u }}>
      <div style={{ ...ROUND, fontSize: 104 * u, color: "#fff", display: "flex", alignItems: "center", perspective: 600, transform: `rotateX(${f >= T.flip ? rot : 0}deg)` }}>
        {digits(f < T.flip + 4 ? "6:59" : "7:00")}
      </div>
      <div style={{ ...MONO, fontSize: 26 * u, color: "rgba(255,255,255,.8)" }}>Beirut · Monday</div>
    </div>
  );
}

function Bill({ w }) {
  return (
    <svg width={w} height={w / 2.35} viewBox="0 0 235 100" style={{ display: "block", filter: "drop-shadow(0 18px 24px rgba(0,0,0,.25))" }}>
      <rect width="235" height="100" rx="6" fill={C.bill} />
      <rect x="7" y="7" width="221" height="86" rx="4" fill="none" stroke={C.billInk} strokeWidth="2.5" />
      <rect x="13" y="13" width="209" height="74" rx="3" fill="none" stroke={C.billInk} strokeWidth="1" strokeDasharray="4 3" />
      <ellipse cx="117" cy="50" rx="30" ry="32" fill="#EEF3E6" stroke={C.billInk} strokeWidth="2.5" />
      <text x="117" y="63" textAnchor="middle" fontFamily="Round" fontWeight="700" fontSize="38" fill={C.billInk}>$1</text>
      {[[30, 34], [205, 34], [30, 84], [205, 84]].map(([x, y], i) => <text key={i} x={x} y={y} textAnchor="middle" fontFamily="Round" fontWeight="700" fontSize="24" fill={C.billInk}>1</text>)}
      <text x="117" y="96" textAnchor="middle" fontFamily="Mono" fontSize="7" letterSpacing="3" fill={C.billInk}>ONE DOLLAR</text>
    </svg>
  );
}

function Donut({ size, kind, spin }) {
  const icing = kind === 0 ? C.pink : kind === 1 ? "#6B3A1E" : "#FFB347";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${spin}deg)`, filter: "drop-shadow(0 10px 14px rgba(74,37,17,.25))" }}>
      <circle cx="50" cy="50" r="46" fill="#E8A866" /><circle cx="50" cy="50" r="15" fill="none" />
      <path d="M50,8 C70,6 92,22 92,48 C94,70 76,92 52,92 C28,94 8,76 9,52 C8,28 28,10 50,8 Z" fill={icing} />
      <circle cx="50" cy="50" r="16" fill={C.cream} /><circle cx="50" cy="50" r="16" fill="none" stroke="#D99A5B" strokeWidth="4" />
      {Array.from({ length: 16 }, (_, i) => { const a = i * 2.3, r = 24 + (i % 3) * 7; return <rect key={i} x={50 + Math.cos(a) * r - 4} y={50 + Math.sin(a) * r - 1.5} width="8" height="3" rx="1.5" fill={["#fff", C.orange, "#7FD3F7", "#FFE066"][i % 4]} transform={`rotate(${i * 47} ${50 + Math.cos(a) * r} ${50 + Math.sin(a) * r})`} />; })}
    </svg>
  );
}

function Words({ text, y, size, color, at, u, stagger = 4, accent = {} }) {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 50 * u, right: 50 * u, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.24}px`, ...ROUND, fontSize: size }}>
      {text.split(" ").map((w, i) => {
        const p = pop(f, at + i * stagger, 13, 200);
        return <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12 }}><span style={{ display: "inline-block", color: accent[i] ?? color, transform: `translateY(${(1 - Math.min(1, p)) * 110}%)` }}>{w}</span></span>;
      })}
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Main = ({ brand, handle, logo, finePrint }) => {
  useFonts([["Round", "Fredoka.ttf", { weight: "300 700" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const u = W / 1080, tall = H > 1600;
  const cx = W / 2, cy = H * (tall ? 0.56 : 0.58);
  const CW = (tall ? 470 : 380) * u;
  const g = cupGeo(cx, cy, CW);

  // ── act 1: dawn, dive into the sun ──
  const [sunX, sunY] = sunPos(Math.min(f, T.dive), W, H, u);
  const dive = interpolate(f, [T.dive, T.coffee], [1, 16], { ...clamp, easing: easeIn });
  // ── act 2: top-down coffee pulls back into the cup ──
  const pull = interpolate(f, [T.coffee, T.cup], [0, 1], { ...clamp, easing: easeOut });
  const land = pop(f, T.cup, 9, 240);
  const swirl = f * 1.4;
  // the cup's life: big hero -> sleeve -> shrinks into Monday -> returns for the hero
  const hushSq = interpolate(f, [T.hush, T.bill - 2, T.bill + 6], [1, 0.95, 1.04], clamp) * (f > T.bill + 6 ? interpolate(pop(f, T.bill + 6, 8, 200), [0, 1], [1.04, 1]) : 1);
  const sleeve = f >= T.bill ? pop(f, T.bill, 8, 260) : 0;
  const badge = f >= T.price ? pop(f, T.price, 9, 280) : 0;
  const toWeek = interpolate(f, [T.week, T.day0], [0, 1], { ...clamp, easing: easeOut });
  // week row
  const rowY = H * (tall ? 0.44 : 0.47), mini = (tall ? 112 : 104) * u, gapX = (W - 100 * u - mini * 7) / 6;
  const dayX = (i) => 50 * u + mini / 2 + i * (mini + gapX);
  const heroIn = f >= T.hero ? pop(f, T.hero, 10, 200) : 0;
  const quietK = interpolate(f, [T.quiet, T.hero - 2, T.hero], [0, 1, 0], clamp);
  const endIn = interpolate(f, [T.end, T.end + 14], [0, 1], { ...clamp, easing: easeOut });

  let cupX = cx, cupY = cy, cupW = CW, cupOp = 1;
  if (f < T.cup) { cupOp = interpolate(pull, [0.55, 0.9], [0, 1], clamp); cupY = cy + (1 - pull) * 260 * u; }
  else if (f < T.hero) { cupX = lerp(cx, dayX(0), toWeek); cupY = lerp(cy, rowY, toWeek); cupW = lerp(CW, mini, toWeek); cupOp = f >= T.day0 ? 0 : 1; }
  else { cupW = CW * interpolate(heroIn, [0, 1], [0.6, 1]); cupY = cy + 20 * u; }
  const cg = cupGeo(cupX, cupY, cupW);
  const landSq = f >= T.cup && f < T.cup + 20 ? 1 - 0.06 * Math.sin(Math.min(1, (f - T.cup) / 12) * Math.PI) : 1;

  const [sx, sy] = shake(f, T.bill, 12, 4);
  const [hx, hy] = shake(f, T.hero, 18, 5);
  const bg = f < T.hero ? C.cream : C.cream;

  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {/* act 1 */}
      {f < T.coffee + 4 && (
        <AbsoluteFill style={{ transform: `scale(${dive})`, transformOrigin: `${sunX}px ${sunY}px` }}>
          <Dawn f={f} W={W} H={H} u={u} />
          <div style={{ opacity: interpolate(f, [T.dive, T.dive + 8], [1, 0], clamp) }}><FlipClock f={f} x={cx} y={H * (tall ? 0.17 : 0.12)} u={u} /></div>
        </AbsoluteFill>
      )}
      {/* act 2: the sun becomes coffee, seen from above, then pulls back into the cup */}
      {f >= T.coffee - 6 && f < T.cup + 2 && (() => {
        const p = pull, rx = lerp(Math.hypot(W, H) * 0.62, g.rx, p), ry = lerp(Math.hypot(W, H) * 0.62, g.ry, Math.pow(p, 0.7));
        const ox = lerp(cx, g.rimX, p), oy = lerp(H / 2, g.rimY + (1 - pull) * 260 * u, p);
        const sunToCoffee = interpolate(f, [T.coffee - 6, T.coffee + 4], [0, 1], clamp);
        return (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, zIndex: 3 }}>
            <defs><radialGradient id="top"><stop offset="0" stopColor="#3A1A0B" /><stop offset="1" stopColor={C.coffee} /></radialGradient></defs>
            <ellipse cx={ox} cy={oy} rx={rx * 1.09} ry={ry * 1.09} fill={C.white} opacity={sunToCoffee} />
            <ellipse cx={ox} cy={oy} rx={rx} ry={ry} fill={C.orange} />
            <ellipse cx={ox} cy={oy} rx={rx} ry={ry} fill="url(#top)" opacity={sunToCoffee} />
            {[0.62, 0.36].map((k, i) => (
              <ellipse key={i} cx={ox} cy={oy} rx={rx * k} ry={ry * k} fill="none" stroke={C.crema} strokeWidth={Math.max(2, rx * 0.03)} opacity={0.55 * sunToCoffee}
                strokeDasharray={`${rx * 0.9} ${rx * 0.35}`} strokeDashoffset={(i ? 1 : -1) * swirl * rx * 0.02} />
            ))}
          </svg>
        );
      })()}

      <AbsoluteFill style={{ transform: `translate(${sx + hx}px, ${sy + hy}px)`, opacity: 1 - endIn }}>
        {/* headline over the cup */}
        {f >= T.cup && f < T.week + 12 && (
          <div style={{ opacity: interpolate(f, [T.week, T.week + 10], [1, 0], clamp), transform: `translateY(${interpolate(f, [T.week, T.week + 10], [0, -60], clamp)}px)` }}>
            <Words text="Your morning coffee" y={H * (tall ? 0.15 : 0.07)} size={84 * u} color={C.brown} at={T.cup + 4} u={u} />
            <Words text="for $1." y={H * (tall ? 0.15 : 0.07) + 104 * u} size={168 * u} color={C.brown} at={T.bill + 2} u={u} stagger={6} accent={{ 1: C.orange }} />
          </div>
        )}
        {/* the flying bill */}
        {f >= T.hush - 30 && f < T.bill && (() => {
          // the bill flutters in on an arc, hangs for a beat (the hush), then snaps onto the cup
          const p = interpolate(f, [T.hush - 30, T.hush + 4, T.bill], [0, 0.82, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
          const bx = lerp(-W * 0.5, cx - 160 * u, p), by = lerp(H * 0.32, cy - 60 * u, p) - Math.sin(p * Math.PI) * 160 * u;
          return <div style={{ position: "absolute", left: bx, top: by, transform: `rotate(${lerp(-300, -6, p) + Math.sin(f / 3) * 6 * (1 - p)}deg) scale(${lerp(1.25, 0.9, p)})`, zIndex: 5 }}><Bill w={320 * u} /></div>;
        })()}
        {/* the cup */}
        {cupOp > 0 && f < T.end + 10 && (
          <div style={{ position: "absolute", left: cg.left, top: cg.top, opacity: cupOp, zIndex: 4, transform: `scale(${(f < T.hero ? hushSq * landSq : 1) * (1 - 0.06 * quietK)})`, transformOrigin: `50% 70%` }}>
            <Cup w={cupW} f={f} swirl={swirl} sleeve={f >= T.bill ? sleeve : 0} badge={f < T.week ? badge : f >= T.hero ? heroIn : 0} steam={f < T.week ? 1 : f >= T.hero ? 1 : 0} id="hero" hideTop={f < T.cup} />
          </div>
        )}
        {f >= T.bill && f < T.bill + 30 && <><Flash f={f} start={T.bill} peak={0.5} color="#FFF4E6" /><Shockwave f={f} cx={cx} cy={cy} start={T.bill} max={700 * u} width={8 * u} rgb="255,103,31" dur={24} /></>}
        {/* the week */}
        {f >= T.week && f < T.hero && (
          <AbsoluteFill style={{ opacity: 1 - quietK * 0.6 }}>
            <Words text="7 mornings. $1 each." y={H * (tall ? 0.16 : 0.09)} size={80 * u} color={C.brown} at={T.week + 6} u={u} accent={{ 2: C.orange }} />
            <div style={{ position: "absolute", left: 30 * u, right: 30 * u, top: rowY - mini * 1.25, height: mini * 2.55, borderRadius: 34 * u, background: C.white, boxShadow: "0 24px 50px rgba(74,37,17,.12)", opacity: toWeek }} />
            {DAYS.map((d, i) => {
              const at = T.day0 + i * BEAT, p = f >= at ? pop(f, at, 8, 260) : 0;
              const bump = [T.words, T.words + 16, T.words + 32].reduce((v, w) => v + (f >= w ? Math.exp(-(f - w) / 5) * 0.18 : 0), 0);
              const mg = cupGeo(dayX(i), rowY, mini);
              return (
                <div key={d}>
                  <div style={{ position: "absolute", left: dayX(i) - mini / 2, width: mini, top: rowY - mini * 1.08, textAlign: "center", ...MONO, fontSize: 21 * u, color: f >= at ? C.pink : "rgba(74,37,17,.3)" }}>{d}</div>
                  {p > 0 && <div style={{ position: "absolute", left: mg.left, top: mg.top, transform: `scale(${Math.min(1.1, p) + bump}) translateY(${-bump * 30}px)`, transformOrigin: "50% 75%" }}><Cup w={mini} f={f + i * 7} swirl={swirl} sleeve={1} steam={0.8} id={`d${i}`} /></div>}
                  {p > 0 && <div style={{ position: "absolute", left: dayX(i) - mini / 2, width: mini, top: rowY + mini * 0.92, textAlign: "center", ...ROUND, fontSize: 34 * u, color: C.orange, opacity: Math.min(1, p * 2) }}>$1</div>}
                </div>
              );
            })}
            {[["Every.", 0], ["Single.", 1], ["Day.", 2]].map(([w, i]) => {
              const at = T.words + i * BEAT; if (f < at) return null;
              const p = pop(f, at, 9, 300);
              return <div key={w} style={{ position: "absolute", left: 0, right: 0, top: rowY + mini * (tall ? 1.9 : 1.75) + i * 150 * u, textAlign: "center", ...ROUND, fontSize: 150 * u, color: i === 2 ? C.pink : C.brown, transform: `scale(${interpolate(p, [0, 1], [1.8, 1])}) rotate(${(i - 1) * -2}deg)`, opacity: Math.min(1, p * 2) }}>{w}</div>;
            })}
          </AbsoluteFill>
        )}
        {/* hero */}
        {f >= T.hero && (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(255,103,31,${0.35 * heroIn}), transparent 55%)` }} />
            {[0, 1, 2, 3].map((i) => {
              const a = (f - T.hero) / 40 + i * (Math.PI / 2), r = (tall ? 390 : 330) * u;
              const dx = Math.cos(a) * r, dy = Math.sin(a) * r * 0.55;
              return <div key={i} style={{ position: "absolute", left: cx + dx - 95 * u, top: cy + dy - 95 * u + 20 * u, zIndex: dy > 0 ? 6 : 3, transform: `scale(${heroIn * (0.85 + 0.15 * (dy / r + 1))})` }}><Donut size={190 * u} kind={i % 3} spin={(f - T.hero) * (i % 2 ? 2 : -2)} /></div>;
            })}
            <Words text="Your daily coffee" y={H * (tall ? 0.15 : 0.06)} size={86 * u} color={C.brown} at={T.hero + 2} u={u} />
            <div style={{ position: "absolute", left: 0, right: 0, top: H * (tall ? 0.73 : 0.80), display: "flex", justifyContent: "center", alignItems: "center", gap: 18 * u, zIndex: 8 }}>
              {(() => { const p = f >= T.hero + 6 ? pop(f, T.hero + 6, 8, 300) : 0; return (
                <>
                  <span style={{ ...ROUND, fontSize: 210 * u, color: C.orange, transform: `scale(${interpolate(p, [0, 1], [2, 1])})`, opacity: Math.min(1, p * 2), textShadow: `0 ${8 * u}px 0 ${C.brown}` }}>$1</span>
                  <span style={{ ...ROUND, fontSize: 56 * u, color: "#fff", background: C.pink, padding: `${10 * u}px ${24 * u}px`, borderRadius: 99, transform: `translateY(${(1 - Math.min(1, p)) * 40}px) rotate(-6deg)`, opacity: Math.min(1, p * 2) }}>/ day</span>
                </>
              ); })()}
            </div>
            <Burst f={f} cx={cx} cy={cy} start={T.hero} count={80} speed={34 * u} colors={[C.orange, C.pink, "#FFE066", "#fff"]} seed="hero" scale={u} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* end card */}
      {f >= T.end && (
        <AbsoluteFill style={{ clipPath: `circle(${endIn * Math.hypot(W, H)}px at ${cx}px ${cy}px)`, background: C.pink }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: H * (tall ? 0.2 : 0.12), display: "grid", justifyItems: "center", gap: 26 * u, transform: `scale(${1 + (f - T.end) * 0.0006})` }}>
            {logo ? <Img src={staticFile(logo)} style={{ height: 160 * u }} /> :
              <div style={{ ...ROUND, fontSize: 118 * u, color: "#fff" }}>{brand}</div>}
            <div style={{ ...ROUND, fontWeight: 600, fontSize: 52 * u, color: "#FFE3EF", textAlign: "center", lineHeight: 1.15, opacity: interpolate(f, [T.end + 10, T.end + 22], [0, 1], clamp) }}>One dollar. One coffee.<br />Every day.</div>
          </div>
          {(() => { const eg = cupGeo(cx, H * (tall ? 0.6 : 0.62), (tall ? 300 : 240) * u); const p = pop(f, T.end + 8, 10, 200); return (
            <div style={{ position: "absolute", left: eg.left, top: eg.top, transform: `translateY(${(1 - Math.min(1, p)) * 300 + Math.sin(f / 14) * 6}px)` }}><Cup w={(tall ? 300 : 240) * u} f={f} swirl={swirl} sleeve={1} badge={1} id="end" /></div>
          ); })()}
          <div style={{ position: "absolute", left: 0, right: 0, top: H * (tall ? 0.76 : 0.85), textAlign: "center", ...MONO, fontSize: 30 * u, color: "#fff", opacity: interpolate(f, [T.end + 24, T.end + 36], [0, 1], clamp) }}>{handle}</div>
          <div style={{ position: "absolute", left: 60 * u, right: 60 * u, top: H * (tall ? 0.795 : 0.905), textAlign: "center", fontFamily: "Round", fontWeight: 500, fontSize: 24 * u, color: "rgba(255,255,255,.82)", opacity: interpolate(f, [T.end + 24, T.end + 36], [0, 1], clamp) }}>{finePrint}</div>
        </AbsoluteFill>
      )}
      <Vignette strength={0.18} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};
