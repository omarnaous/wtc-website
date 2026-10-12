// Appify's second mascot: an animatable SVG rig in the same flat, ink-outlined style as Dev.
// Long dark waves, black scoop-neck long-sleeve top, gold necklace with a small Appify spark, winged liner,
// glossy nude-rose lips, red nails, high-waist jeans. Props are plain numbers so a scene can drive them per frame.
//   phone: 0..1 raises the right hand with a phone (selfie / "look at this")
//   point: 0..1 right hand presents to the side · wave: 0..1 left hand waves (waveAng swings it)
//   face: smile, open (talking), lid, look, brow, happy (eyes closed smiling), wink, shock
//   rim: CSS colour of a soft rim light so the black hair/top read on the dark brand background (null = off)
const INK = "#0A0913", IRIS = "#8F72FF";
const SKIN = "#E9B993", SKIN_D = "#CF9872", SKIN_L = "#F4CFAE";
const HAIR = "#120D0C", HAIR_L = "#2A1E1B", TOP = "#141218", TOP_L = "#2A2733", JEANS = "#3A3744", JEANS_L = "#4C4858";
const GOLD = "#E2B85C", NAIL = "#D2283E", LIP = "#C46A6E", LIP_L = "#DE8C8C";
const S = `stroke="${INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"`;
const lerp = (a, b, t) => a + (b - a) * t;
function spark(cx, cy, R, k = 0.22) {
  const q = R * k;
  return `M${cx},${cy - R} C${cx + q},${cy - q} ${cx + q},${cy - q} ${cx + R},${cy} C${cx + q},${cy + q} ${cx + q},${cy + q} ${cx},${cy + R} C${cx - q},${cy + q} ${cx - q},${cy + q} ${cx - R},${cy} C${cx - q},${cy - q} ${cx - q},${cy - q} ${cx},${cy - R} Z`;
}
const limb = (x1, y1, cx, cy, x2, y2, w, col) =>
  `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="${INK}" stroke-width="${w + 14}" stroke-linecap="round"/><path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
function hand(x, y, r = 19, nails = true, rot = 0) {
  let g = `<circle cx="${x}" cy="${y}" r="${r}" fill="${SKIN}" ${S}/>`;
  if (nails) for (let k = 0; k < 3; k++) {
    const a = ((rot - 50 + k * 50) * Math.PI) / 180;
    g += `<ellipse cx="${x + Math.cos(a) * (r - 5)}" cy="${y + Math.sin(a) * (r - 5)}" rx="4.5" ry="6.5" fill="${NAIL}" transform="rotate(${rot - 140 + k * 50} ${x + Math.cos(a) * (r - 5)} ${y + Math.sin(a) * (r - 5)})"/>`;
  }
  return g;
}

// hair that sits behind the body (drawn first), in head space
function hairBack() {
  return `<path d="M300,106 C404,102 474,186 466,296 C462,368 492,430 480,512 C474,566 494,610 470,652 C446,690 404,684 388,660 L212,660 C196,684 154,690 130,652 C106,610 126,566 120,512 C108,430 138,368 134,296 C126,186 196,110 300,106 Z" fill="${HAIR}" ${S}/>` +
    `<path d="M150,420 Q132,500 160,560 M450,420 Q468,500 440,560 M172,330 Q150,400 176,460 M428,330 Q450,400 424,460" fill="none" stroke="${HAIR_L}" stroke-width="10" stroke-linecap="round"/>`;
}
function body({ phone = 0, point = 0, wave = 0, waveAng = 0 }) {
  let g = `<ellipse cx="300" cy="858" rx="160" ry="16" fill="rgba(10,9,19,.18)"/>`;
  // high-waist jeans + ankle boots
  g += `<path d="M232,646 L244,834 L294,834 L299,656 Z" fill="${JEANS}" ${S}/><path d="M368,646 L356,834 L306,834 L301,656 Z" fill="${JEANS}" ${S}/>`;
  g += `<path d="M262,690 Q266,760 270,820 M338,690 Q334,760 330,820" fill="none" stroke="${JEANS_L}" stroke-width="5" stroke-linecap="round"/>`;
  g += `<path d="M240,824 h58 v20 q0,12 -12,12 h-50 q-8,0 -8,-8 Z M302,824 h58 v24 q0,8 -8,8 h-50 q-12,0 -12,-12 Z" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  g += `<path d="M226,642 Q300,662 374,642 L376,660 Q300,680 224,660 Z" fill="${JEANS}" ${S}/>`;
  // neck base, scoop-neck long-sleeve top
  g += `<path d="M262,448 Q300,436 338,448 L360,470 L240,470 Z" fill="${SKIN_D}" ${S}/>`;
  g += `<path d="M232,648 Q220,600 214,550 Q206,500 222,478 Q252,462 274,458 Q300,500 326,458 Q348,462 378,478 Q394,500 386,550 Q380,600 368,648 Z" fill="${TOP}" ${S}/>`;
  g += `<path d="M266,458 Q300,520 334,458 Q318,452 300,452 Q282,452 266,458 Z" fill="${SKIN}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
  g += `<path d="M300,494 Q296,500 300,506" fill="none" stroke="${SKIN_D}" stroke-width="3"/>`;
  g += `<path d="M236,540 Q300,560 364,540" fill="none" stroke="${TOP_L}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  // gold necklace with a small Appify spark
  g += `<path d="M270,462 Q300,506 330,462" fill="none" stroke="${GOLD}" stroke-width="3.5"/><path d="${spark(300, 496, 9)}" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`;
  // left arm: rests on the hip, or waves
  const a = ((8 + waveAng) * Math.PI) / 180;
  const LS = [220, 492], LE = [196, 590];
  const lhx = lerp(232, LE[0] + 6 + Math.sin(a) * 130, wave), lhy = lerp(652, LE[1] - 24 - Math.cos(a) * 130, wave);
  g += limb(LS[0], LS[1], LS[0] - 18, (LS[1] + LE[1]) / 2, LE[0], LE[1], 36, TOP);
  g += limb(LE[0], LE[1], lerp(196, 170, wave), lerp(640, 540, wave), lhx, lhy, 32, TOP);
  g += hand(lhx, lhy, 18, true, wave > 0.5 ? -90 : 60);
  // right arm: rest / phone up / present to the side
  const w0 = Math.max(0, 1 - phone - point);
  const RS = [380, 492], RE = [lerp(404, 430, phone), lerp(590, 600, phone)];
  const rhx = 372 * w0 + 352 * phone + 520 * point, rhy = 652 * w0 + 470 * phone + 470 * point;
  const rcx = 410 * w0 + 450 * phone + 500 * point, rcy = 640 * w0 + 560 * phone + 560 * point;
  g += limb(RS[0], RS[1], RS[0] + 18, (RS[1] + RE[1]) / 2, RE[0], RE[1], 36, TOP);
  if (phone > 0.5) {   // the phone, held up; hand and red nails over it
    g += `<g transform="rotate(-8 ${rhx - 6} ${rhy - 40})"><rect x="${rhx - 42}" y="${rhy - 112}" width="72" height="132" rx="14" fill="#6F6B82" ${S}/><rect x="${rhx - 34}" y="${rhy - 104}" width="30" height="34" rx="9" fill="#4A4659" stroke="${INK}" stroke-width="4"/><circle cx="${rhx - 26}" cy="${rhy - 95}" r="5" fill="${INK}"/><circle cx="${rhx - 13}" cy="${rhy - 82}" r="5" fill="${INK}"/></g>`;
  }
  g += limb(RE[0], RE[1], rcx, rcy, rhx, rhy, 32, TOP);
  g += `<path d="M${rhx - 14},${rhy + 18} Q${rhx},${rhy + 26} ${rhx + 14},${rhy + 18}" fill="none" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>`;
  if (point > 0.5) g += `<rect x="${rhx - 7}" y="${rhy - 50}" width="16" height="42" rx="8" fill="${SKIN}" stroke="${INK}" stroke-width="6" transform="rotate(30 ${rhx} ${rhy})"/><ellipse cx="${rhx + 14}" cy="${rhy - 40}" rx="4" ry="6" fill="${NAIL}" transform="rotate(30 ${rhx + 14} ${rhy - 40})"/>`;
  g += hand(rhx, rhy, 19, true, phone > 0.5 ? -120 : point > 0.5 ? -60 : 80);
  // shoulders
  g += `<path d="M184,500 Q200,470 236,466 L246,520 Q214,530 188,524 Z M416,500 Q400,470 364,466 L354,520 Q386,530 412,524 Z" fill="${TOP}" ${S}/>`;
  return g;
}
function head({ brow = 6, lid = 0.08, smile = 0.8, look = 0, open = 0, shock = 0, happy = 0, wink = 0 }) {
  let g = `<path d="M272,416 L272,456 Q300,468 328,456 L328,416 Z" fill="${SKIN_D}" ${S}/>`;
  // face
  g += `<path d="M300,146 C378,146 426,212 422,300 C418,382 362,442 300,446 C238,442 182,382 178,300 C174,212 222,146 300,146 Z" fill="${SKIN}" ${S}/>`;
  g += `<ellipse cx="226" cy="356" rx="26" ry="14" fill="rgba(235,110,120,.28)"/><ellipse cx="374" cy="356" rx="26" ry="14" fill="rgba(235,110,120,.28)"/>`;
  // eyes: almond, brown iris, winged liner and lashes on the outer corner
  [[244, -1], [356, 1]].forEach(([x, side], i) => {
    const closed = happy > 0.5 || (wink > 0.5 && i === 1);
    const out = x + side * 32, inn = x - side * 30;
    if (closed) {
      g += `<path d="M${inn},306 Q${x},${290} ${out},304" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${out},304 l${side * 12},-10" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
      return;
    }
    const top = 284 - 4 * shock, bot = 322 + 3 * shock;
    g += `<path d="M${inn},306 Q${x},${top} ${out},302 Q${x},${bot} ${inn},306 Z" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
    const lx = x + look * (1 - shock);
    g += `<circle cx="${lx}" cy="305" r="${13 - 3 * shock}" fill="#5A3624" stroke="${INK}" stroke-width="3"/><circle cx="${lx}" cy="305" r="${6 - 2 * shock}" fill="${INK}"/><circle cx="${lx + 4}" cy="300" r="3.2" fill="#fff"/>`;
    const lidY = lerp(top + 8, 316, Math.min(1, lid * (1 - shock)));
    if (lid > 0.12) g += `<path d="M${inn - 2},306 Q${x},${top - 4} ${out + 2},302 L${out + 2},${lidY - 6} Q${x},${lidY} ${inn - 2},${lidY} Z" fill="${SKIN}"/>`;
    g += `<path d="M${inn},306 Q${x},${Math.max(top, lidY - 22)} ${out},302 L${out + side * 16},292" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<path d="M${out - side * 4},298 l${side * 10},-12 M${out - side * 14},293 l${side * 6},-13" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  });
  // arched brows
  brow += shock * 12 + happy * 4;
  g += `<path d="M212,${262 - brow * 0.3} Q238,${240 - brow * 0.4} 274,${256 - brow * 0.2}" fill="none" stroke="#1A1210" stroke-width="12" stroke-linecap="round"/>`;
  g += `<path d="M326,${256 - brow * 0.2} Q362,${240 - brow * 0.4} 388,${262 - brow * 0.3}" fill="none" stroke="#1A1210" stroke-width="12" stroke-linecap="round"/>`;
  // nose
  g += `<path d="M300,318 Q308,346 294,356 Q300,360 308,356" fill="none" stroke="${SKIN_D}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  // lips: glossy nude-rose; talk opens them, smile lifts the corners
  const c = 6 * smile;
  if (shock > 0.4 || open > 0.06) {
    const d = shock > 0.4 ? 18 + 10 * shock : 6 + 22 * open;
    g += `<path d="M268,${394 - c} Q300,386 332,${394 - c} Q324,${402 + d} 300,${404 + d} Q276,${402 + d} 268,${394 - c} Z" fill="#4A1418" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
    g += `<path d="M274,${395 - c * 0.6} Q300,392 326,${395 - c * 0.6} L324,${400} Q300,397 276,400 Z" fill="#fff"/>`;
    g += `<path d="M266,${394 - c} Q282,378 300,386 Q318,378 334,${394 - c} Q300,392 266,${394 - c} Z" fill="${LIP}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  } else {
    // closed: full upper lip with a cupid's bow, shallow glossy lower lip; smile lifts only the corners
    const m = 394 - c * 0.15;
    g += `<path d="M268,${m - c * 0.6} C278,378 290,374 300,382 C310,374 322,378 332,${m - c * 0.6} Q300,${m + 2} 268,${m - c * 0.6} Z" fill="${LIP}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`;
    g += `<path d="M268,${m - c * 0.6} Q300,${m + 2} 332,${m - c * 0.6} Q318,${m + 13} 300,${m + 14} Q282,${m + 13} 268,${m - c * 0.6} Z" fill="${LIP_L}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`;
    g += `<path d="M291,${m + 7} Q298,${m + 9} 306,${m + 7}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/>`;
  }
  return g;
}
function hairCap() {   // top of the hair (drawn over the front locks so they grow out from under it)
  let g = "";
  // hair on top: centre part, waves framing the face
  g += `<path d="M180,262 C168,168 228,118 300,116 C372,118 432,168 420,262 C404,206 360,176 306,174 L300,196 L294,174 C240,176 196,206 180,262 Z" fill="${HAIR}" ${S}/>`;
  g += `<path d="M300,124 Q262,128 230,150 M300,124 Q340,128 372,150 M218,182 Q240,156 274,146 M382,182 Q360,156 326,146" fill="none" stroke="${HAIR_L}" stroke-width="7" stroke-linecap="round"/>`;
  g += `<path d="M300,120 L300,180" stroke="${SKIN_D}" stroke-width="3" opacity=".6"/>`;
  return g;
}
// long wavy locks that fall in front of the shoulders (drawn last), in head space
function hairFront() {
  const lock = (pts, w) => `<path d="${pts}" fill="none" stroke="${INK}" stroke-width="${w + 12}" stroke-linecap="round" stroke-linejoin="round"/><path d="${pts}" fill="none" stroke="${HAIR}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let g = lock("M206,190 C168,270 204,350 182,420 C164,478 210,530 186,600 C176,632 196,664 216,676", 46);
  g += lock("M394,190 C432,270 396,350 418,420 C436,478 390,530 414,600 C424,632 404,664 384,676", 46);
  g += `<path d="M184,300 C176,340 200,370 190,410 M188,470 C182,510 206,540 196,590 M416,300 C424,340 400,370 410,410 M412,470 C418,510 394,540 404,590" fill="none" stroke="${HAIR_L}" stroke-width="7" stroke-linecap="round"/>`;
  return g;
}

export function Girl({ width = 300, phone = 0, point = 0, wave = 0, waveAng = 0, tilt = 0, bob = 0, rim = "rgba(143,114,255,.85)", ...face }) {
  const h = (width * 830) / 420;
  const headT = `rotate(${tilt} 300 446) translate(300 452) scale(0.86) translate(-300 -452)`;
  return (
    <svg viewBox="90 50 420 830" width={width} height={h} style={{ overflow: "visible", filter: rim ? `drop-shadow(0 0 ${Math.max(1.5, width / 140)}px ${rim}) drop-shadow(0 0 ${Math.max(1, width / 260)}px ${rim})` : "none" }}>
      <g transform={`translate(0 ${bob})`}>
        <g transform={headT} dangerouslySetInnerHTML={{ __html: hairBack() }} />
        <g dangerouslySetInnerHTML={{ __html: body({ phone, point, wave, waveAng }) }} />
        <g transform={headT} dangerouslySetInnerHTML={{ __html: head(face) + hairFront() + hairCap() }} />
      </g>
    </svg>
  );
}
