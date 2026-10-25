// No Planz logo. The idea: the "z" is a route, not a letter. Two dots (two people) are joined by one zig-zag line,
// the unplanned way people end up together. The same geometry is the app icon and the last letter of the wordmark.
import { WORD } from "./brand.js";

// the route of the z from (x0,y0) to (x1,y1): top bar, diagonal (straight, or one loose wave), bottom bar
export function route(x0, y0, x1, y1, wave = 0) {
  if (!wave) return `M${x0} ${y0} H${x1} L${x0} ${y1} H${x1}`;
  const dx = x1 - x0, dy = y1 - y0;
  return `M${x0} ${y0} H${x1} C${x1 - dx * 0.15 - wave * dx} ${y0 + dy * 0.45}, ${x0 + dx * 0.15 + wave * dx} ${y0 + dy * 0.55}, ${x0} ${y1} H${x1}`;
}
const routeLen = (x0, y0, x1, y1, wave) => (x1 - x0) * 2 + Math.hypot(x1 - x0, y1 - y0) * (1 + wave * 0.9);

export const WAVE = 0.35;                     // the chosen route: one loose wave in the diagonal
export const C = { night: "#15102A", paper: "#FFF6EA", coral: "#FF5C3D", lime: "#D7FF4B", violet: "#7B5CFF" };

// the mark in a 200x200 box; `draw` (0..1) draws the route, `a`/`b` scale the two dots, `wave` bends the diagonal
export function Mark({ size = 200, line = C.paper, dotA = C.coral, dotB = C.lime, draw = 1, a = 1, b = 1, sw = 26, wave = WAVE, style }) {
  const x0 = 52, x1 = 148, y0 = 58, y1 = 142;
  const d = route(x0, y0, x1, y1, wave);
  const len = routeLen(x0, y0, x1, y1, wave);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", ...style }}>
      <path d={d} fill="none" stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <circle cx={x0} cy={y0} r={23 * a} fill={dotA} />
      <circle cx={x1} cy={y1} r={23 * b} fill={dotB} />
    </svg>
  );
}

// the wordmark: "no plan" in Unbounded 800 outlines + the mark as the z. `letter(i)` (0..1) and `zDraw` animate it.
export function Wordmark({ height = 120, fill = C.paper, line, dotA = C.coral, dotB = C.lime, letter = () => 1, zDraw = 1, za = 1, zb = 1, wave = WAVE, style }) {
  const { z, xHeight, width, letters } = WORD;
  const pad = 60, top = -xHeight - pad, h = xHeight + pad * 2;
  const zlen = routeLen(z.x0, z.top, z.x1, z.bot, wave);
  const { sw, r } = z;
  return (
    <svg height={height} width={(height * (width + pad * 2)) / h} viewBox={`${-pad} ${top} ${width + pad * 2} ${h}`} style={{ overflow: "visible", ...style }}>
      {letters.map((l, i) => {
        const k = letter(i);
        return <path key={i} d={l.d} fill={fill} opacity={Math.min(1, k * 1.5)} transform={`translate(0 ${(1 - k) * 220}) translate(${l.x + l.w / 2} ${-xHeight / 2}) scale(${0.6 + 0.4 * k}) translate(${-l.x - l.w / 2} ${xHeight / 2})`} />;
      })}
      <path d={route(z.x0, z.top, z.x1, z.bot, wave)} fill="none" stroke={line || fill} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={zlen} strokeDashoffset={zlen * (1 - zDraw)} />
      <circle cx={z.x0} cy={z.top} r={r * za} fill={dotA} />
      <circle cx={z.x1} cy={z.bot} r={r * zb} fill={dotB} />
    </svg>
  );
}

// the app icon: the mark on a rounded square
export function AppIcon({ size = 240, bg = C.night, line = C.paper, dotA = C.coral, dotB = C.lime, wave = WAVE }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.225, background: bg, display: "grid", placeItems: "center", boxShadow: "0 30px 60px rgba(0,0,0,.25)" }}>
      <Mark size={size * 0.8} line={line} dotA={dotA} dotB={dotB} wave={wave} />
    </div>
  );
}
