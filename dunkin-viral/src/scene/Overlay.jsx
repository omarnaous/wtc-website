// The 2D layers: backgrounds behind the 3D, and sticker type + hand-drawn doodles in front of it.
// Sticker style follows @dunkinleb: chunky rounded caps, white outline, hard coloured shadow, slight tilt.
import { interpolate, random, spring } from "remotion";
import { T, BEAT } from "../timing.js";
import { clamp, easeOut } from "../fx.jsx";

export const C = { orange: "#FF671F", pink: "#E8178A", pinkD: "#A80F62", blush: "#FFD3E6", cream: "#FFF3E2", brown: "#4A2511", sky: "#8ED1FC", lilac: "#C9B6FF", yellow: "#FFD23F" };
const sp = (f, at, damping = 9, stiffness = 260) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
export const DAY_BG = [C.orange, C.pink, C.cream, C.sky, C.lilac, C.yellow, "#FF9CC8"];
const DAY_EN = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_AR = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];

// ── backgrounds ──
export function Backdrop({ f, W, H, u }) {
  let bg;
  if (f < T.smash) bg = `radial-gradient(120% 80% at 50% 30%, #FFE1EE, #FF9CC8)`;
  else if (f < T.pour) bg = `radial-gradient(90% 70% at 50% 55%, #FFB37A, ${C.orange} 70%)`;
  else if (f < T.week) bg = `radial-gradient(90% 70% at 50% 60%, #FFF0F6, #FFB3D2 75%)`;
  else if (f < T.every) bg = DAY_BG[Math.min(6, Math.floor((f - T.week) / BEAT))];
  else if (f < T.drop) bg = [C.pink, C.orange, C.pink][Math.floor((f - T.every) / BEAT)];
  else if (f < T.finale) bg = `radial-gradient(circle at 50% 50%, #FFE6F0, #FFC2DB 70%)`;
  else bg = `radial-gradient(100% 70% at 50% 55%, #FFF0F6, #FF9CC8)`;
  const rays = f >= T.price && f < T.week ? 1 : f >= T.finale ? 1 : 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden" }}>
      {/* a tiled field of tiny smileys, drifting: the page's #SpreadingHappiness signature */}
      {(f < T.smash || f >= T.drop) && <Smileys f={f} W={W} H={H} u={u} op={f < T.smash ? 0.18 : 0.12} />}
      {rays > 0 && <div style={{ position: "absolute", left: W / 2 - H, top: H * 0.5 - H, width: H * 2, height: H * 2, background: `repeating-conic-gradient(from ${f * 0.4}deg, rgba(255,255,255,.28) 0deg 9deg, transparent 9deg 22deg)`, borderRadius: "50%", maskImage: "radial-gradient(circle, black 20%, transparent 62%)", WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 62%)" }} />}
      {f >= T.week && f < T.every && <WeekTexture f={f} W={W} H={H} u={u} />}
    </div>
  );
}
function Smileys({ f, W, H, u, op }) {
  const s = 90 * u, cols = Math.ceil(W / (s * 1.6)) + 2, rows = Math.ceil(H / (s * 1.6)) + 2, off = (f * 0.9 * u) % (s * 1.6);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: op }}>
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols, x = c * s * 1.6 - s + (r % 2) * s * 0.8 + off, y = r * s * 1.6 - s - off;
        return <g key={i} transform={`translate(${x} ${y}) rotate(${(r + c) * 17})`}><circle r={s * 0.36} fill="none" stroke="#fff" strokeWidth={5 * u} /><circle cx={-s * 0.12} cy={-s * 0.08} r={4 * u} fill="#fff" /><circle cx={s * 0.12} cy={-s * 0.08} r={4 * u} fill="#fff" /><path d={`M${-s * 0.18},${s * 0.06} Q0,${s * 0.24} ${s * 0.18},${s * 0.06}`} fill="none" stroke="#fff" strokeWidth={5 * u} strokeLinecap="round" /></g>;
      })}
    </svg>
  );
}
function WeekTexture({ f, W, H, u }) {
  const d = Math.min(6, Math.floor((f - T.week) / BEAT)), t = (f - T.week) % BEAT;
  return <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 55%, rgba(255,255,255,.35), transparent 60%)`, opacity: 1, transform: `scale(${1 + t * 0.004})` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.5 - 330 * u, textAlign: "center", fontFamily: "Display", fontWeight: 800, fontSize: 560 * u, lineHeight: 1, color: "rgba(255,255,255,.22)", letterSpacing: "-0.04em" }}>{DAY_EN[d]}</div>
  </div>;
}

// ── sticker text ──
export function Sticker({ children, f, at, x, y, size, fill = C.pink, stroke = "#fff", shadow = C.pinkD, rot = -4, u, font = "Display", align = "center", width, out, dir = "ltr" }) {
  if (f < at) return null;
  const p = sp(f, at);
  const o = out != null ? interpolate(f, [out, out + 6], [1, 0], clamp) : 1;
  const wig = Math.sin((f - at) / 9) * 1.2;
  return (
    <div dir={dir} style={{ position: "absolute", left: x, top: y, width, transform: `translate(-50%, -50%) rotate(${rot + wig}deg) scale(${interpolate(p, [0, 1], [0.2, 1]) * o})`, opacity: Math.min(1, p * 3) * o,
      fontFamily: font, fontWeight: 800, fontSize: size, lineHeight: 0.92, color: fill, textAlign: align, whiteSpace: "nowrap",
      WebkitTextStroke: `${size * 0.11}px ${stroke}`, paintOrder: "stroke fill", textShadow: `${size * 0.05}px ${size * 0.07}px 0 ${shadow}`, letterSpacing: font === "Display" ? "-0.01em" : 0 }}>
      {children}
    </div>
  );
}
export function Pill({ f, at, x, y, en, ar, u, out, color = C.brown }) {
  if (f < at) return null;
  const p = sp(f, at, 10, 280), o = out != null ? interpolate(f, [out, out + 6], [1, 0], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p * o}) rotate(-3deg)`, display: "flex", gap: 12 * u, alignItems: "center", padding: `${12 * u}px ${24 * u}px`, borderRadius: 99, background: "#fff", boxShadow: `0 ${6 * u}px 0 ${C.pinkD}`, border: `${4 * u}px solid ${C.pink}` }}>
      <span style={{ fontFamily: "Display", fontWeight: 800, fontSize: 40 * u, color }}>{en}</span>
      <span dir="rtl" style={{ fontFamily: "Arabic", fontWeight: 700, fontSize: 38 * u, color: C.pink }}>{ar}</span>
    </div>
  );
}

// ── doodles: hand-drawn, drawn on with a stroke, and "boiling" (re-jittered every 3 frames) ──
const boil = (f, s) => (random(`${s}${Math.floor(f / 3)}`) - 0.5) * 3;
export function Doodle({ kind, f, at, x, y, size, color = "#fff", rot = 0, seed = "d" }) {
  if (f < at) return null;
  const draw = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: easeOut });
  const pth = {
    heart: "M50,82 C20,62 6,44 14,28 C22,12 42,14 50,30 C58,14 78,12 86,28 C94,44 80,62 50,82 Z",
    spark: "M50,8 C54,38 62,46 92,50 C62,54 54,62 50,92 C46,62 38,54 8,50 C38,46 46,38 50,8 Z",
    arrow: "M12,20 C40,10 72,22 80,58 M66,46 L80,60 L90,42",
    swirl: "M20,70 C10,40 40,15 62,30 C80,42 66,66 50,58 C38,52 46,38 56,42",
    smile: "M50,10 A40,40 0 1,1 49.9,10 M36,40 L36,44 M64,40 L64,44 M30,58 Q50,78 70,58",
    burst: "M50,4 L50,22 M50,78 L50,96 M4,50 L22,50 M78,50 L96,50 M17,17 L30,30 M70,70 L83,83 M83,17 L70,30 M30,70 L17,83",
  }[kind];
  const fillable = kind === "heart" || kind === "spark";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible", transform: `rotate(${rot + boil(f, seed) * 1.5}deg) translate(${boil(f, seed + "x")}px, ${boil(f, seed + "y")}px)` }}>
      <path d={pth} fill={fillable ? color : "none"} fillOpacity={fillable ? Math.max(0, draw * 1.4 - 0.4) : 0} stroke={fillable ? "#fff" : color} strokeWidth={fillable ? 6 : 7} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
    </svg>
  );
}

// ── everything in front of the 3D, per section ──
export function Front({ f, W, H, u, tall, brand, handle, logo, finePrint, Img, staticFile }) {
  const cx = W / 2, top = tall ? 330 * u : 150 * u;
  const big = tall ? 1 : 0.86;
  const els = [];
  if (f < T.smash + 8) {
    const out = T.smash - 2;
    els.push(
      <Sticker key="h1" f={f} at={T.hook + 2} x={cx} y={top} size={118 * u * big} u={u} out={out} rot={-5}>WHAT CAN</Sticker>,
      <Sticker key="h2" f={f} at={T.hook + 15} x={cx} y={top + 190 * u * big} size={260 * u * big} u={u} out={out} fill={C.orange} shadow={C.pinkD} rot={3}>$1</Sticker>,
      <Sticker key="h3" f={f} at={T.hook + 30} x={cx} y={top + 380 * u * big} size={118 * u * big} u={u} out={out} rot={-3}>GET YOU?</Sticker>,
      <Sticker key="h4" f={f} at={T.hook + 40} x={cx} y={top + 520 * u * big} size={66 * u * big} u={u} out={out} font="Arabic" fill="#fff" stroke={C.pink} shadow={C.pinkD} rot={2} dir="rtl">شو فيك تجيب بدولار؟</Sticker>,
      <Doodle key="d1" kind="swirl" f={f} at={T.hook + 20} x={cx - 330 * u} y={top + 160 * u} size={140 * u} seed="s1" rot={-20} />,
      <Doodle key="d2" kind="spark" f={f} at={T.hook + 32} x={cx + 340 * u} y={top + 330 * u} size={110 * u} color={C.yellow} seed="s2" />,
    );
  }
  if (f >= T.smash && f < T.pour) {
    els.push(<Sticker key="this" f={f} at={T.smash + 1} x={cx} y={top + 40 * u} size={190 * u * big} u={u} out={T.ice1 - 2} fill="#fff" stroke={C.pink} shadow={C.pinkD} rot={-6}>THIS.</Sticker>,
      <Doodle key="b" kind="burst" f={f} at={T.smash} x={cx} y={top + 40 * u} size={520 * u} seed="b1" />);
  }
  // recipe labels, pointing at what just happened
  const lab = tall ? H * 0.72 : H * 0.8;
  els.push(
    <Pill key="p1" f={f} at={T.ice1} x={cx - 230 * u} y={lab} en={`ICE ×${f < T.ice2 ? 1 : f < T.ice3 ? 2 : 3}`} ar="ثلج" u={u} out={T.straw} />,
    <Pill key="p2" f={f} at={T.pour} x={cx + 230 * u} y={lab - 110 * u} en="COFFEE" ar="قهوة" u={u} out={T.straw} />,
    <Pill key="p3" f={f} at={T.full + 2} x={cx - 180 * u} y={lab + 110 * u} en="MILK" ar="حليب" u={u} out={T.straw} />,
  );
  if (f >= T.price && f < T.week) {
    const o = T.week - 4;
    els.push(
      <Sticker key="pr" f={f} at={T.price} x={cx} y={top + 60 * u} size={330 * u * big} u={u} out={o} fill={C.orange} rot={-7}>$1</Sticker>,
      <Sticker key="pr2" f={f} at={T.price + 5} x={cx} y={tall ? H * 0.77 : H * 0.84} size={92 * u * big} u={u} out={o} rot={3}>ONE DOLLAR</Sticker>,
      <Sticker key="pr3" f={f} at={T.price + 9} x={cx} y={(tall ? H * 0.77 : H * 0.84) + 112 * u} size={64 * u * big} u={u} out={o} font="Arabic" fill="#fff" stroke={C.pink} rot={-2} dir="rtl">بدولار واحد</Sticker>,
      <Doodle key="h1" kind="heart" f={f} at={T.price + 4} x={cx - 360 * u} y={top + 20 * u} size={120 * u} color={C.pink} seed="ph1" rot={-15} />,
      <Doodle key="h2" kind="heart" f={f} at={T.price + 8} x={cx + 380 * u} y={top + 180 * u} size={90 * u} color={C.orange} seed="ph2" rot={12} />,
      <Doodle key="s1" kind="spark" f={f} at={T.price + 6} x={cx + 300 * u} y={top - 80 * u} size={90 * u} color={C.yellow} seed="ps1" />,
    );
  }
  if (f >= T.week && f < T.every) {
    const d = Math.min(6, Math.floor((f - T.week) / BEAT)), at = T.week + d * BEAT;
    const dark = d === 2 || d === 5;
    els.push(
      <Sticker key={`d${d}`} f={f} at={at} x={cx} y={top} size={150 * u * big} u={u} fill={dark ? C.pink : "#fff"} stroke={dark ? "#fff" : C.pink} shadow={dark ? C.pinkD : "rgba(0,0,0,.2)"} rot={[-4, 3, -2, 4, -3, 2, -5][d]}>{DAY_EN[d]}</Sticker>,
      <Sticker key={`da${d}`} f={f} at={at + 2} x={cx} y={top + 140 * u} size={64 * u * big} u={u} font="Arabic" fill={C.brown} stroke="#fff" shadow="rgba(0,0,0,.12)" rot={2} dir="rtl">{DAY_AR[d]}</Sticker>,
      <Sticker key={`dp${d}`} f={f} at={at + 3} x={cx + 300 * u} y={tall ? H * 0.74 : H * 0.8} size={130 * u * big} u={u} fill={C.orange} rot={10}>$1</Sticker>,
    );
  }
  if (f >= T.every && f < T.drop) {
    ["EVERY.", "SINGLE.", "DAY."].forEach((w, i) => els.push(
      <Sticker key={w} f={f} at={T.every + i * BEAT} x={cx} y={top + i * 170 * u * big} size={175 * u * big} u={u} fill={i === 2 ? C.orange : "#fff"} stroke={i === 2 ? "#fff" : C.pink} shadow={C.pinkD} rot={[-5, 4, -3][i]} out={T.drop - 2}>{w}</Sticker>));
    els.push(<Sticker key="ar" f={f} at={T.day + 4} x={cx} y={top + 3 * 170 * u * big + 10 * u} size={80 * u * big} u={u} font="Arabic" fill="#fff" stroke={C.pink} rot={2} out={T.drop - 2} dir="rtl">كل يوم</Sticker>);
  }
  if (f >= T.mouth && f < T.finale + 6) {
    const o = T.finale;
    els.push(
      <Sticker key="sm" f={f} at={T.mouth + 6} x={cx} y={tall ? H * 0.17 : H * 0.12} size={118 * u * big} u={u} font="Script" fill="#fff" stroke={C.pink} shadow={C.pinkD} rot={-6} out={o}>a smile a day</Sticker>,
      <Sticker key="sm2" f={f} at={T.mouth + 14} x={cx} y={tall ? H * 0.84 : H * 0.9} size={70 * u * big} u={u} font="Arabic" fill={C.pink} stroke="#fff" rot={3} out={o} dir="rtl">ابتسامة كل يوم</Sticker>,
      <Doodle key="dh" kind="heart" f={f} at={T.mouth + 10} x={cx + 360 * u} y={tall ? H * 0.24 : H * 0.2} size={110 * u} color={C.pink} seed="mh" rot={14} />,
      <Doodle key="ds" kind="spark" f={f} at={T.mouth + 16} x={cx - 360 * u} y={tall ? H * 0.78 : H * 0.82} size={100 * u} color={C.yellow} seed="ms" />,
    );
  }
  if (f >= T.finale) {
    const fin = tall ? H * 0.16 : H * 0.1;
    els.push(
      <Sticker key="f1" f={f} at={T.finale + 8} x={cx - 90 * u} y={fin} size={250 * u * big} u={u} fill={C.orange} rot={-6}>$1</Sticker>,
      <Sticker key="f2" f={f} at={T.finale + 13} x={cx + 170 * u} y={fin + 30 * u} size={110 * u * big} u={u} rot={5}>A DAY</Sticker>,
      <Sticker key="f3" f={f} at={T.finale + 18} x={cx} y={fin + 150 * u} size={60 * u * big} u={u} font="Arabic" fill="#fff" stroke={C.pink} rot={-2} dir="rtl">قهوتك اليومية بدولار</Sticker>,
      <Doodle key="fd1" kind="heart" f={f} at={T.finale + 20} x={cx - 380 * u} y={fin - 40 * u} size={100 * u} color={C.pink} seed="fh1" rot={-12} />,
      <Doodle key="fd2" kind="spark" f={f} at={T.finale + 24} x={cx + 390 * u} y={fin + 160 * u} size={90 * u} color={C.yellow} seed="fs1" />,
    );
  }
  if (f >= T.end) {
    const p = sp(f, T.end, 12, 180), y0 = tall ? H * 0.76 : H * 0.72, k = tall ? 1 : 0.82;
    els.push(
      <div key="end" style={{ position: "absolute", left: 0, right: 0, top: y0, display: "grid", justifyItems: "center", gap: 10 * u * k, transform: `translateY(${(1 - Math.min(1, p)) * 80}px)`, opacity: Math.min(1, p * 2) }}>
        {logo ? <Img src={staticFile(logo)} style={{ height: 110 * u }} /> :
          <div style={{ fontFamily: "Display", fontWeight: 800, fontSize: 84 * u * k, color: "#fff", WebkitTextStroke: `${9 * u}px ${C.pink}`, paintOrder: "stroke fill", textShadow: `0 ${6 * u}px 0 ${C.pinkD}` }}>{brand}</div>}
        <div style={{ fontFamily: "Script", fontSize: 50 * u * k, color: C.pink, WebkitTextStroke: `${6 * u}px #fff`, paintOrder: "stroke fill" }}>#SpreadingHappiness</div>
        <div style={{ fontFamily: "Mono", fontSize: 26 * u, letterSpacing: "0.2em", color: C.brown }}>{handle.toUpperCase()}</div>
        <div style={{ fontFamily: "Display", fontWeight: 600, fontSize: 21 * u, color: "rgba(74,37,17,.7)", marginTop: 6 * u }}>{finePrint}</div>
      </div>,
    );
  }
  return <>{els}</>;
}
