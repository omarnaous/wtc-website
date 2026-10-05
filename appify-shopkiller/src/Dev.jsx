// Dev: Appify's founder mascot as an animatable SVG rig.
// Props are plain numbers so a scene can drive them from the frame.
const INK = "#0A0913", IRIS = "#8F72FF", UV = "#5B2BFF", UV_D = "#3A1BB0";
const SKIN = "#E3AE86", SKIN_D = "#C98F68", HAIR = "#0B0A0C", HAIR_L = "#26222B", BEARD = "#141011";
const S = 'stroke="#0A0913" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"';
const lerp = (a, b, t) => a + (b - a) * t;

function spark(cx, cy, R, k = 0.22) {
  const q = R * k;
  return `M${cx},${cy - R} C${cx + q},${cy - q} ${cx + q},${cy - q} ${cx + R},${cy} C${cx + q},${cy + q} ${cx + q},${cy + q} ${cx},${cy + R} C${cx - q},${cy + q} ${cx - q},${cy + q} ${cx - R},${cy} C${cx - q},${cy - q} ${cx - q},${cy - q} ${cx},${cy - R} Z`;
}
function octagon(cx, cy, w, h, c) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  return `M${x0 + c},${y0} H${x1 - c} L${x1},${y0 + c} V${y1 - c} L${x1 - c},${y1} H${x0 + c} L${x0},${y1 - c} V${y0 + c} Z`;
}

function body(point) {
  let g = `<ellipse cx="300" cy="752" rx="170" ry="18" fill="rgba(10,9,19,.18)"/>`;
  g += `<rect x="236" y="640" width="56" height="96" rx="14" fill="#1E1B26" ${S}/><rect x="308" y="640" width="56" height="96" rx="14" fill="#1E1B26" ${S}/>`;
  g += `<path d="M212,728 h84 a14,14 0 0 1 0,22 h-88 a12,12 0 0 1 4,-22 Z" fill="#fff" ${S}/><path d="M304,728 h84 a12,12 0 0 1 4,22 h-88 a14,14 0 0 1 0,-22 Z" fill="#fff" ${S}/>`;
  // crew-neck tee
  g += `<path d="M150,660 Q140,500 210,450 L390,450 Q460,500 450,660 Z" fill="${UV}" ${S}/>`;
  g += `<path d="M258,452 Q300,494 342,452" fill="none" stroke="${UV_D}" stroke-width="14" stroke-linecap="round"/><path d="M258,452 Q300,494 342,452" fill="none" stroke="${INK}" stroke-width="5"/>`;
  g += `<path d="${spark(300, 568, 30)}" fill="#fff"/>`;
  g += `<path d="M160,500 Q120,540 132,600 L186,600 Q190,556 214,520 Z" fill="${UV}" ${S}/><path d="M440,500 Q480,540 468,600 L414,600 Q410,556 386,520 Z" fill="${UV}" ${S}/>`;
  // left arm + tablet
  const tx = lerp(0, -40, point), tr = lerp(-4, -14, point);
  g += `<path d="M142,598 Q150,650 210,660" fill="none" stroke="${INK}" stroke-width="40" stroke-linecap="round"/><path d="M142,598 Q150,650 210,660" fill="none" stroke="${SKIN}" stroke-width="26" stroke-linecap="round"/>`;
  g += `<g transform="translate(${tx} 0) rotate(${tr} 300 660)"><rect x="200" y="606" width="200" height="110" rx="14" fill="#25212E" ${S}/><path d="${spark(300, 660, 20)}" fill="${IRIS}"/></g>`;
  g += `<circle cx="${208 + tx * 0.3}" cy="664" r="18" fill="${SKIN}" ${S}/>`;
  // right arm: holds the tablet (0) or points up at the content (1)
  const ex = 458, ey = 598;
  const hx = lerp(392, 520, point), hy = lerp(660, 452, point), cx = lerp(450, 520, point), cy = lerp(650, 560, point);
  g += `<path d="M${ex},${ey} Q${cx},${cy} ${hx},${hy}" fill="none" stroke="${INK}" stroke-width="40" stroke-linecap="round"/><path d="M${ex},${ey} Q${cx},${cy} ${hx},${hy}" fill="none" stroke="${SKIN}" stroke-width="26" stroke-linecap="round"/>`;
  if (point > 0.5) g += `<rect x="${hx - 7}" y="${hy - 52}" width="16" height="44" rx="8" fill="${SKIN}" stroke="${INK}" stroke-width="6" transform="rotate(14 ${hx} ${hy})"/>`;
  g += `<circle cx="${hx}" cy="${hy}" r="19" fill="${SKIN}" ${S}/>`;
  return g;
}

function head({ brow = 6, lid = 0.1, smile = 0.8, look = 0, open = 0 }) {
  let g = `<path d="M262,420 L262,456 Q300,470 338,456 L338,420 Z" fill="${SKIN_D}" ${S}/>`;
  g += `<ellipse cx="154" cy="300" rx="22" ry="34" fill="${SKIN}" ${S}/><ellipse cx="446" cy="300" rx="22" ry="34" fill="${SKIN}" ${S}/>`;
  g += `<path d="M300,140 C390,140 452,204 448,300 C444,388 384,446 300,448 C216,446 156,388 152,300 C148,204 210,140 300,140 Z" fill="${SKIN}" ${S}/>`;
  g += `<path d="M156,282 Q150,228 176,200 L186,250 Q166,262 156,282 Z" fill="${HAIR_L}" ${S}/><path d="M444,282 Q450,228 424,200 L414,250 Q434,262 444,282 Z" fill="${HAIR_L}" ${S}/>`;
  g += `<path d="M164,246 Q146,156 206,116 Q252,62 330,58 Q412,60 440,124 Q462,174 440,246 Q428,206 402,194 Q356,176 300,182 Q248,178 212,196 Q182,210 164,246 Z" fill="${HAIR}" ${S}/>`;
  g += `<path d="M192,194 Q198,104 296,84 Q396,74 436,140 Q400,108 340,108 Q264,114 222,172 Z" fill="${HAIR_L}"/>`;
  g += `<path d="M214,164 Q256,100 336,86 M232,182 Q282,126 362,116 M258,188 Q312,148 392,146 M388,72 Q428,98 440,140" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="6" stroke-linecap="round"/>`;
  g += `<path d="M154,290 Q150,382 198,424 Q244,474 300,478 Q356,474 402,424 Q450,382 446,290 Q438,340 418,364 Q390,388 362,382 Q332,372 300,374 Q268,372 238,382 Q210,388 182,364 Q162,340 154,290 Z" fill="${BEARD}" ${S}/>`;
  // mouth under the moustache: smile when closed, opens with the voice
  const mh = 10 + 14 * smile;
  if (open > 0.06) {
    const d = 8 + 34 * open;
    g += `<path d="M264,400 Q300,${404 + smile * 6} 336,400 Q332,${404 + d} 300,${408 + d} Q268,${404 + d} 264,400 Z" fill="#3A0F14" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
    g += `<path d="M270,401 Q300,${406 + smile * 4} 330,401 L328,${407 + smile * 3} Q300,${411 + smile * 4} 272,${407 + smile * 3} Z" fill="#fff"/>`;
  } else {
    g += `<path d="M266,402 Q300,${402 + mh * 1.5} 334,402 Q300,${406 + mh * 0.25} 266,402 Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  }
  g += `<path d="M248,390 Q274,370 300,380 Q326,370 352,390 Q328,398 300,393 Q272,398 248,390 Z" fill="${BEARD}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  g += `<path d="M292,330 Q300,350 290,356" fill="none" stroke="${SKIN_D}" stroke-width="6" stroke-linecap="round"/>`;
  for (const x of [240, 360]) {
    g += `<ellipse cx="${x}" cy="302" rx="24" ry="20" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
    g += `<circle cx="${x + look}" cy="305" r="10" fill="${INK}"/><circle cx="${x + look + 3}" cy="301" r="3" fill="#fff"/>`;
    const t = 282 + 38 * Math.min(1, lid);
    g += `<path d="M${x - 27},280 H${x + 27} V${t} Q${x},${t + 5} ${x - 27},${t} Z" fill="${SKIN}"/>`;
    g += `<path d="M${x - 25},${t} Q${x},${t + 5} ${x + 25},${t}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  g += `<path d="M208,${252 - brow * 0.2} Q240,${240 - brow * 0.2} 272,${250 - brow * 0.1}" fill="none" stroke="${HAIR}" stroke-width="16" stroke-linecap="round"/>`;
  g += `<path d="M328,${250 - brow} Q360,${236 - brow} 392,${248 - brow * 0.4}" fill="none" stroke="${HAIR}" stroke-width="16" stroke-linecap="round"/>`;
  for (const x of [240, 360]) {
    const o = octagon(x, 302, 96, 74, 20);
    g += `<path d="${o}" fill="rgba(140,200,255,.16)" stroke="${INK}" stroke-width="11"/><path d="${o}" fill="none" stroke="#E4ECF2" stroke-width="7"/>`;
    g += `<path d="M${x - 30},280 L${x - 12},272" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  }
  g += `<path d="M288,296 Q300,286 312,296" fill="none" stroke="${INK}" stroke-width="10"/><path d="M288,296 Q300,286 312,296" fill="none" stroke="#E4ECF2" stroke-width="5"/>`;
  g += `<path d="M276,268 H324" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M276,268 H324" stroke="#E4ECF2" stroke-width="4" stroke-linecap="round"/>`;
  return g;
}

export function Dev({ width = 300, point = 0, tilt = 0, bob = 0, ...face }) {
  const h = (width * 720) / 420;
  return (
    <svg viewBox="90 50 420 720" width={width} height={h} style={{ overflow: "visible" }}>
      <g transform={`translate(0 ${bob})`}>
        <g dangerouslySetInnerHTML={{ __html: body(point) }} />
        <g transform={`rotate(${tilt} 300 440)`} dangerouslySetInnerHTML={{ __html: head(face) }} />
      </g>
    </svg>
  );
}
