// Cartoon characters for the creatine myths story, drawn in SVG (700 x 1100 local box, head centre at 350, 300).
// Karim: big, purple tank top, red headband, stubble; believes every gym myth. Sami: leaner, teal hoodie, round
// glasses, trimmed beard; checks the science. Everything is a function of the props, which are pure functions of the
// frame (mouth from the voice envelope, blinks from the frame number), so they render frame-accurately.
import { interpolate } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
// expression table: brows [dy, rot] for left/right, eye scale, pupil scale, lid (0 open..1 shut), mouth corner lift,
// mouth width, O-mouth, head tilt, arm poses [shoulder, elbow] (degrees, outward-positive) for left and right
export const EXPR = {
  neutral:    { bl: [0, 0], br: [0, 0], eye: 1, pupil: 1, lid: 0, lift: 2, w: 1, o: 0, tilt: 0, arms: [[8, -6], [8, -6]] },
  listen:     { bl: [-6, -4], br: [-2, 4], eye: 1.05, pupil: 1, lid: 0, lift: 0, w: 0.9, o: 0, tilt: -3, arms: [[8, -6], [8, -6]] },
  panic:      { bl: [-26, 18], br: [-26, -18], eye: 1.32, pupil: 0.65, lid: 0, lift: -6, w: 1.1, o: 0.6, tilt: 0, arms: [[150, 70], [150, 70]] },
  shock:      { bl: [-34, 0], br: [-34, 0], eye: 1.45, pupil: 0.55, lid: 0, lift: 0, w: 0.8, o: 1, tilt: -4, arms: [[70, 25], [70, 25]] },
  confused:   { bl: [-22, -12], br: [4, -14], eye: 1.05, pupil: 1, lid: 0, lift: -3, w: 0.85, o: 0.2, tilt: 7, arms: [[8, -6], [150, 85]] },
  suspicious: { bl: [8, 16], br: [8, -16], eye: 0.95, pupil: 1, lid: 0.45, lift: -4, w: 0.85, o: 0, tilt: -3, arms: [[18, -105], [18, -105]] },
  worried:    { bl: [-16, 16], br: [-16, -16], eye: 1.12, pupil: 0.85, lid: 0, lift: -6, w: 0.85, o: 0.2, tilt: 3, arms: [[10, -95], [10, -95]] },
  happy:      { bl: [-12, 0], br: [-12, 0], eye: 1, pupil: 1, lid: 0.1, lift: 12, w: 1.15, o: 0, tilt: 4, arms: [[85, 95], [85, 95]] },
  smug:       { bl: [-16, -8], br: [2, 6], eye: 0.95, pupil: 1, lid: 0.5, lift: 8, w: 1, o: 0, tilt: 5, arms: [[18, -105], [18, -105]] },
  smirk:      { bl: [-14, -8], br: [0, 4], eye: 0.95, pupil: 1, lid: 0.35, lift: 6, w: 1, o: 0, tilt: -4, smirk: 1, arms: [[6, -4], [6, -4]] },
  laugh:      { bl: [-14, 6], br: [-14, -6], eye: 1, pupil: 1, lid: 1, lift: 14, w: 1.2, o: 0, tilt: -8, arms: [[12, -100], [12, -100]] },
  explain:    { bl: [-8, 0], br: [-4, 0], eye: 1, pupil: 1, lid: 0.1, lift: 5, w: 1, o: 0, tilt: -2, arms: [[8, -6], [22, 100]] },
  calm:       { bl: [-4, 0], br: [-4, 0], eye: 1, pupil: 1, lid: 0.25, lift: 6, w: 1, o: 0, tilt: -2, arms: [[8, -6], [8, -6]] },
  excited:    { bl: [-22, 0], br: [-22, 0], eye: 1.18, pupil: 0.9, lid: 0, lift: 12, w: 1.15, o: 0, tilt: 3, arms: [[8, -6], [165, 8]] },
};
const mixE = (a, b, k) => {   // blend two expressions (k: 0 = a, 1 = b)
  const L = (x, y) => x + (y - x) * k, out = {};
  for (const key of Object.keys(a)) {
    const x = a[key], y = b[key] ?? x;
    out[key] = Array.isArray(x) ? x.map((v, i) => Array.isArray(v) ? v.map((w, j) => L(w, y[i][j])) : L(v, y[i])) : typeof x === "number" ? L(x, y) : x;
  }
  out.smirk = L(a.smirk || 0, b.smirk || 0);
  return out;
};
export const blendExpr = (from, to, k) => mixE({ ...EXPR.neutral, ...EXPR[from] }, { ...EXPR.neutral, ...EXPR[to] }, Math.min(1, Math.max(0, k)));

const LOOK = {
  karim: { skin: "#C98B5E", shade: "#A86E46", dark: "#7A4A2C", hair: "#16121F", top: "#5B4EE5", top2: "#4338CA", band: "#FB4E5E", torso: [140, 560], shoulder: [168, 612], up: 210, fore: 185, armW: 100, foreW: 84, hand: 50 },
  sami:  { skin: "#E7B98F", shade: "#C99469", dark: "#8E5F3E", hair: "#2B1D16", top: "#0F5C5A", top2: "#0B4644", band: null, torso: [205, 560], shoulder: [222, 600], up: 200, fore: 180, armW: 70, foreW: 60, hand: 38 },
};

function Arm({ c, pose, sleeve }) {
  const [sA, eA] = pose, [sx, sy] = c.shoulder;
  return (
    <g transform={`translate(${sx},${sy}) rotate(${sA})`}>
      <rect x={-c.armW / 2} y={-20} width={c.armW} height={c.up + 30} rx={c.armW / 2} fill={sleeve || c.skin} />
      {!sleeve && <ellipse cx={-c.armW * 0.12} cy={c.up * 0.45} rx={c.armW * 0.42} ry={c.up * 0.32} fill={c.shade} opacity={0.35} />}
      <g transform={`translate(0,${c.up}) rotate(${eA})`}>
        <rect x={-c.foreW / 2} y={-c.foreW / 2} width={c.foreW} height={c.fore + c.foreW / 2} rx={c.foreW / 2} fill={sleeve ? c.top : c.skin} />
        {sleeve && <rect x={-c.foreW / 2} y={c.fore - 50} width={c.foreW} height={50} rx={c.foreW / 2} fill={c.skin} />}
        <circle cx={0} cy={c.fore + c.hand * 0.5} r={c.hand} fill={c.skin} stroke={c.shade} strokeWidth={4} />
      </g>
    </g>
  );
}

// who: "karim" | "sami"; e: blended expression; mouth 0..1; blink 0..1; gaze -1..1; bob px; f frame (idle motion)
export function Toon({ who, e, mouth = 0, blink = 0, gaze = 0, f = 0 }) {
  const c = LOOK[who], K = who === "karim";
  const lid = Math.min(1, e.lid + blink), breathe = Math.sin(f / 22) * 0.012;
  const ex = 60, ey = 300, eyeRX = K ? 34 : 30, eyeRY = (K ? 38 : 34) * e.eye;
  const mOpen = Math.max(0, mouth), mH = 6 + 52 * mOpen + e.o * 34, mW = (K ? 54 : 46) * e.w * (1 - 0.35 * e.o), lift = e.lift;
  const sm = e.smirk || 0;
  const open = mOpen > 0.06 || e.o > 0.3;
  const mouthPath = open
    ? `M${350 - mW},${400 - lift + sm * 6} Q350,${392 - lift * 0.3} ${350 + mW},${400 - lift - sm * 8} Q350,${400 + mH} ${350 - mW},${400 - lift + sm * 6} Z`
    : `M${350 - mW},${398 - lift + sm * 8} Q350,${404 + lift * 0.9} ${350 + mW},${398 - lift - sm * 10}`;
  const brow = (side, [dy, rot]) => {
    const x = side < 0 ? 350 - ex : 350 + ex;
    return <rect x={x - (K ? 44 : 38)} y={ey - (K ? 62 : 58) + dy} width={K ? 88 : 76} height={K ? 20 : 14} rx={8} fill={c.hair}
      transform={`rotate(${side < 0 ? rot : rot} ${x} ${ey - 52 + dy})`} />;
  };
  const eye = (side) => {
    const x = side < 0 ? 350 - ex : 350 + ex, ry = eyeRY * (1 - lid);
    if (e.lid >= 0.99) return <path d={`M${x - 26},${ey + 4} Q${x},${ey - 18} ${x + 26},${ey + 4}`} stroke={c.hair} strokeWidth={9} fill="none" strokeLinecap="round" />;
    return (
      <g>
        <ellipse cx={x} cy={ey} rx={eyeRX} ry={Math.max(2, ry)} fill="#fff" />
        {ry > 6 && <>
          <circle cx={x + gaze * 10} cy={ey + 2} r={(K ? 15 : 13) * e.pupil} fill="#1A1430" />
          <circle cx={x + gaze * 10 + 5} cy={ey - 4} r={4.5 * e.pupil} fill="#fff" />
        </>}
        {/* upper lid */}
        {lid > 0.05 && <rect x={x - eyeRX - 2} y={ey - eyeRY - 2} width={eyeRX * 2 + 4} height={eyeRY * 2 * lid} fill={c.skin} />}
      </g>
    );
  };
  return (
    <svg viewBox="0 0 700 1100" width={700} height={1100} style={{ overflow: "visible" }}>
      <g transform={`translate(350 1100) scale(${1 + breathe} ${1 - breathe}) translate(-350 -1100)`}>
        {/* torso */}
        {K ? (
          <>
            <path d="M140,640 C140,566 230,540 350,540 C470,540 560,566 560,640 L520,1100 L180,1100 Z" fill={c.skin} />
            <path d="M222,572 Q350,640 478,572 L520,1100 L180,1100 Z" fill={c.top} />
            <path d="M262,700 Q350,740 438,700" stroke={c.top2} strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d="M350,720 L350,860" stroke={c.top2} strokeWidth={6} opacity={0.6} />
            <path d="M300,600 Q350,640 400,600" stroke={c.shade} strokeWidth={6} fill="none" opacity={0.5} />
            {/* gold chain */}
            <path d="M285,585 Q350,655 415,585" stroke="#FFC94A" strokeWidth={7} fill="none" />
          </>
        ) : (
          <>
            <path d="M200,640 C200,580 260,548 350,548 C440,548 500,580 500,640 L530,1100 L170,1100 Z" fill={c.top} />
            <path d="M262,560 Q350,640 438,560 Q420,600 350,612 Q280,600 262,560 Z" fill={c.top2} />
            <line x1={322} y1={610} x2={316} y2={720} stroke="#E8E2D0" strokeWidth={6} strokeLinecap="round" />
            <line x1={378} y1={610} x2={384} y2={720} stroke="#E8E2D0" strokeWidth={6} strokeLinecap="round" />
            <rect x={268} y={820} width={164} height={90} rx={20} fill={c.top2} />
          </>
        )}
        {/* neck */}
        <path d={K ? "M282,430 L418,430 L436,580 L264,580 Z" : "M300,440 L400,440 L410,570 L290,570 Z"} fill={c.skin} />
        <path d={K ? "M282,470 Q350,520 418,470 L420,500 Q350,545 280,500 Z" : "M300,470 Q350,505 400,470 L402,495 Q350,530 298,495 Z"} fill={c.shade} opacity={0.55} />
      </g>
      {/* head */}
      <g transform={`translate(350 470) scale(1.14) rotate(${e.tilt}) translate(-350 -470)`}>
        <ellipse cx={K ? 203 : 210} cy={310} rx={22} ry={40} fill={c.skin} />
        <ellipse cx={K ? 497 : 490} cy={310} rx={22} ry={40} fill={c.skin} />
        <path d={K ? "M205,260 C205,140 268,106 350,106 C432,106 495,140 495,260 L495,330 C495,436 432,486 350,486 C268,486 205,436 205,330 Z"
                    : "M215,262 C215,150 272,116 350,116 C428,116 485,150 485,262 L485,330 C485,430 428,476 350,476 C272,476 215,430 215,330 Z"} fill={c.skin} />
        {/* jaw: stubble (Karim) / trimmed beard (Sami) */}
        {K ? <path d="M212,330 C214,430 268,486 350,486 C432,486 486,430 488,330 C470,400 430,430 350,432 C270,430 230,400 212,330 Z" fill={c.hair} opacity={0.22} />
           : <path d="M220,320 C222,432 272,478 350,478 C428,478 478,432 480,320 C468,378 440,410 400,418 Q350,440 300,418 C260,410 232,378 220,320 Z" fill={c.hair} opacity={0.82} />}
        {/* hair */}
        {K ? (
          <>
            <path d="M205,262 C198,128 268,84 350,84 C432,84 502,128 495,262 C476,206 432,182 350,182 C268,182 224,206 205,262 Z" fill={c.hair} />
            <path d="M214,206 Q350,160 486,206 L490,236 Q350,190 210,236 Z" fill={c.band} />
          </>
        ) : (
          <path d="M215,262 C204,140 262,96 352,96 C452,96 498,150 486,252 C470,190 432,176 400,172 C360,168 300,196 268,190 C244,200 226,226 215,262 Z" fill={c.hair} />
        )}
        {eye(-1)}{eye(1)}
        {brow(-1, e.bl)}{brow(1, e.br)}
        {/* nose */}
        <path d={K ? "M338,322 Q350,360 368,352 Q358,330 356,318" : "M340,322 Q350,356 366,350 Q356,330 354,320"} fill={c.shade} />
        {/* mouth */}
        {open ? (
          <g>
            <path d={mouthPath} fill="#3A0E1A" />
            <clipPath id={`m-${who}`}><path d={mouthPath} /></clipPath>
            <g clipPath={`url(#m-${who})`}>
              <rect x={350 - mW} y={388 - lift} width={mW * 2} height={12} fill="#fff" />
              <ellipse cx={350} cy={400 + mH} rx={mW * 0.6} ry={Math.max(4, mH * 0.45)} fill="#E46A7E" />
            </g>
          </g>
        ) : <path d={mouthPath} stroke="#5A1A24" strokeWidth={8} fill="none" strokeLinecap="round" />}
        {/* glasses (Sami) */}
        {!K && <g fill="none" stroke="#151022" strokeWidth={8}>
          <circle cx={290} cy={300} r={46} /><circle cx={410} cy={300} r={46} /><path d="M336,296 Q350,286 364,296" />
          <path d="M244,292 L218,284" /><path d="M456,292 L482,284" />
          <circle cx={290} cy={300} r={46} stroke="rgba(255,255,255,.18)" strokeWidth={4} strokeDasharray="20 270" />
        </g>}
      </g>
      {/* arms (in front) */}
      <Arm c={c} pose={e.arms[0]} sleeve={K ? null : c.top} />
      <g transform="translate(700 0) scale(-1 1)"><Arm c={c} pose={e.arms[1]} sleeve={K ? null : c.top} /></g>
    </svg>
  );
}

// blink: a 5-frame blink every ~3.4 s, offset per character
export const blinkAt = (f, seed) => { const p = (f + seed) % 103; return p < 5 ? interpolate(p, [0, 2, 5], [0, 1, 0], clamp) : 0; };
