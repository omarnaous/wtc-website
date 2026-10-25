// Writes the logo files as plain SVG (no fonts needed: the letters are outlines). Same geometry as src/Logo.jsx.
//   node tools/export_svg.mjs <out dir>
import fs from "node:fs";
import { WORD } from "../src/brand.js";
const C = { night: "#15102A", paper: "#FFF6EA", coral: "#FF5C3D", lime: "#D7FF4B", violet: "#7B5CFF" }, WAVE = 0.35;
const route = (x0, y0, x1, y1, w = WAVE) => { const dx = x1 - x0, dy = y1 - y0; return `M${x0} ${y0} H${x1} C${x1 - dx * 0.15 - w * dx} ${y0 + dy * 0.45}, ${x0 + dx * 0.15 + w * dx} ${y0 + dy * 0.55}, ${x0} ${y1} H${x1}`; };
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
function wordmark(fill, dotA, dotB, dotM, ring, bg) {
  const { z, xHeight, width, letters } = WORD, pad = 80, desc = 260;          // room for the p's descender
  const vb = `${-pad} ${-xHeight - pad - 140} ${width + pad * 2} ${xHeight + desc + pad * 2 + 140}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${bg ? `<rect x="${-pad}" y="${-xHeight - pad - 140}" width="${width + pad * 2}" height="${xHeight + desc + pad * 2 + 140}" fill="${bg}"/>` : ""}` +
    letters.map((l) => `<path d="${l.d}" fill="${fill}"/>`).join("") +
    `<path d="${route(z.x0, z.top, z.x1, z.bot)}" fill="none" stroke="${fill}" stroke-width="${z.sw}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<circle cx="${z.x0}" cy="${z.top}" r="${z.r}" fill="${dotA}"/>` +
    `<circle cx="${(z.x0 + z.x1) / 2}" cy="${(z.top + z.bot) / 2}" r="${z.r * 0.86}" fill="${dotM}" stroke="${ring}" stroke-width="${z.r * 0.26}"/>` +
    `<circle cx="${z.x1}" cy="${z.bot}" r="${z.r}" fill="${dotB}"/></svg>\n`;
}
const BUBBLE = "M40 30 H160 Q182 30 182 52 V132 Q182 154 160 154 H96 L62 182 V154 H40 Q18 154 18 132 V52 Q18 30 40 30 Z";
// the symbol: the three-person route in a chat bubble; on a square (app icon) when `bg` is given
const symbol = (bubble, line, dotA, dotM, dotB, bg, rounded) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${bg ? `<rect width="200" height="200" rx="${rounded ? 45 : 0}" fill="${bg}"/>` : ""}` +
  `<g transform="translate(100 ${bg ? 104 : 100}) scale(${bg ? 0.8 : 1}) translate(-100 -100)"><path d="${BUBBLE}" fill="${bubble}"/>` +
  `<g transform="translate(100 92) scale(.74) translate(-100 -100)"><path d="${route(52, 58, 148, 142)}" fill="none" stroke="${line}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="52" cy="58" r="23" fill="${dotA}"/><circle cx="100" cy="100" r="20" fill="${dotM}" stroke="${bubble}" stroke-width="7"/><circle cx="148" cy="142" r="23" fill="${dotB}"/></g></g></svg>\n`;
const files = {
  "noplanz-logo-light.svg": wordmark(C.paper, C.coral, C.lime, C.violet, C.night),        // for dark backgrounds
  "noplanz-logo-dark.svg": wordmark(C.night, C.coral, C.violet, C.lime, C.paper),         // for light backgrounds
  "noplanz-logo-on-night.svg": wordmark(C.paper, C.coral, C.lime, C.violet, C.night, C.night),
  "noplanz-symbol.svg": symbol(C.coral, C.night, C.paper, C.violet, C.lime),
  "noplanz-symbol-light.svg": symbol(C.paper, C.night, C.coral, C.lime, C.violet),
  "noplanz-app-icon.svg": symbol(C.coral, C.night, C.paper, C.violet, C.lime, C.night, true),
  "noplanz-app-icon-coral.svg": symbol(C.paper, C.night, C.coral, C.lime, C.violet, C.coral, true),
  "noplanz-app-icon-lime.svg": symbol(C.night, C.paper, C.coral, C.violet, C.lime, C.lime, true),
  "noplanz-app-icon-store.svg": symbol(C.coral, C.night, C.paper, C.violet, C.lime, C.night, false),   // square: the stores mask the corners
};
for (const [n, s] of Object.entries(files)) fs.writeFileSync(`${out}/${n}`, s);
console.log(Object.keys(files).join("\n"));
