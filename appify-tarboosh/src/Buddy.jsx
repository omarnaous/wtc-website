// A chocolate-dome buddy in the spirit of Tarboosh's Instagram mascot (red round glasses, white gloves, red sneakers),
// drawn flat in Dev's sticker style so the two can share the end card. Props are plain numbers driven by the frame.
const INK = "#0A0913", RED = "#E0283A";
const S = `stroke="${INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"`;
export function Buddy({ width = 260, wave = 0, waveAng = 0, look = 0, lid = 0, happy = 0, bob = 0, squash = 0 }) {
  const h = (width * 470) / 300;
  const sx = 1 + squash * 0.5, sy = 1 - squash;
  const arm = (side, up) => {
    const x0 = side < 0 ? 72 : 228, y0 = 262, r = (waveAng * Math.PI) / 180;
    const x1 = up ? x0 + side * (34 + 30 * Math.sin(r)) : x0 + side * 26, y1 = up ? y0 - 92 + 10 * Math.abs(Math.sin(r)) : y0 + 74;
    return `<path d="M${x0},${y0} Q${(x0 + x1) / 2 + side * 14},${(y0 + y1) / 2} ${x1},${y1}" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
      <path d="M${x0},${y0} Q${(x0 + x1) / 2 + side * 14},${(y0 + y1) / 2} ${x1},${y1}" fill="none" stroke="#4A2410" stroke-width="10" stroke-linecap="round"/>
      <circle cx="${x1}" cy="${y1}" r="26" fill="#fff" ${S}/><path d="M${x1 - 10},${y1 - 8} q6,-10 14,-4" fill="none" stroke="#D8D4E2" stroke-width="5" stroke-linecap="round"/>`;
  };
  const eye = (cx) => `
    <ellipse cx="${cx}" cy="178" rx="27" ry="31" fill="#fff" ${S}/>
    ${happy ? `<path d="M${cx - 15},${182} Q${cx},${164} ${cx + 15},${182}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`
      : `<circle cx="${cx + look}" cy="184" r="15" fill="${INK}"/><circle cx="${cx + look + 5}" cy="178" r="5" fill="#fff"/>`}
    ${lid > 0.05 ? `<rect x="${cx - 30}" y="${145}" width="60" height="${64 * lid}" fill="#5A2C14"/>` : ""}
    <circle cx="${cx}" cy="178" r="40" fill="rgba(255,255,255,.1)" stroke="${RED}" stroke-width="11"/>`;
  const g = `
    <ellipse cx="150" cy="452" rx="110" ry="12" fill="rgba(10,9,19,.2)"/>
    <path d="M118,352 V412 M182,352 V412" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M118,352 V412 M182,352 V412" stroke="#4A2410" stroke-width="12" stroke-linecap="round"/>
    <path d="M78,414 q0,-18 26,-18 h30 q14,0 14,18 v14 h-70 Z" fill="${RED}" ${S}/><path d="M152,414 q0,-18 14,-18 h30 q26,0 26,18 v14 h-70 Z" fill="${RED}" ${S}/>
    <path d="M74,428 h78 M148,428 h78" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
    ${arm(-1, false)}${arm(1, wave > 0.5)}
    <defs><radialGradient id="bud" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="#8A4A26"/><stop offset=".55" stop-color="#5A2C14"/><stop offset="1" stop-color="#341707"/></radialGradient></defs>
    <path d="M62,330 C58,150 92,36 150,36 C208,36 242,150 238,330 Q236,356 210,356 H90 Q64,356 62,330 Z" fill="url(#bud)" ${S}/>
    <path d="M96,110 Q112,62 150,56" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="12" stroke-linecap="round"/>
    ${eye(116)}${eye(184)}
    <path d="M156,178 h-12" stroke="${RED}" stroke-width="9" stroke-linecap="round"/>
    <path d="M124,${happy ? 238 : 242} Q150,${happy ? 270 : 260} 176,${happy ? 238 : 242}" fill="${happy ? INK : "none"}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  return (
    <svg viewBox="0 0 300 470" width={width} height={h} style={{ overflow: "visible" }}>
      <g transform={`translate(0 ${bob}) translate(150 452) scale(${sx} ${sy}) translate(-150 -452)`} dangerouslySetInnerHTML={{ __html: g }} />
    </svg>
  );
}
