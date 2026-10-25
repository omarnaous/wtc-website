// Mark explorations for "more social": a third person on the route, people glyphs, a chat bubble.
import { AbsoluteFill } from "remotion";
import { C, WAVE, route } from "./Logo.jsx";

const x0 = 52, x1 = 148, y0 = 58, y1 = 142;
const Person = ({ x, y, r, fill, bg }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={fill} stroke={bg} strokeWidth={r * 0.28} />
  </g>
);
function Three({ line = C.paper, bg = C.night, size = 300 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <path d={route(x0, y0, x1, y1, WAVE)} fill="none" stroke={line} strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
      <Person x={x0} y={y0} r={22} fill={C.coral} bg={bg} /><Person x={100} y={100} r={20} fill={C.violet} bg={bg} /><Person x={x1} y={y1} r={22} fill={C.lime} bg={bg} />
    </svg>
  );
}
// people as head + shoulders, standing on the bars of the z
function People({ line = C.paper, bg = C.night, size = 300 }) {
  const P = ({ x, y, c, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}><circle cx="0" cy="-30" r="14" fill={c} /><path d="M-24 0 a24 22 0 0 1 48 0 Z" fill={c} /></g>;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <path d={route(x0, y0 + 14, x1, y1 + 14, WAVE)} fill="none" stroke={line} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <P x={66} y={y0 + 2} c={C.coral} /><P x={134} y={y1 + 2} c={C.lime} />
    </svg>
  );
}
// the z inside a chat bubble
function Bubble({ size = 300 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      <path d="M40 30 H160 Q182 30 182 52 V132 Q182 154 160 154 H96 L62 182 V154 H40 Q18 154 18 132 V52 Q18 30 40 30 Z" fill={C.coral} />
      <g transform="translate(100 92) scale(.62) translate(-100 -100)">
        <path d={route(x0, y0, x1, y1, WAVE)} fill="none" stroke={C.night} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x0} cy={y0} r="23" fill={C.paper} /><circle cx={100} cy={100} r="20" fill={C.violet} stroke={C.coral} strokeWidth="7" /><circle cx={x1} cy={y1} r="23" fill={C.lime} />
      </g>
    </svg>
  );
}
const Tile = ({ bg, label, children }) => (
  <div style={{ borderRadius: 40, background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
    {children}<div style={{ fontFamily: "monospace", fontSize: 26, color: bg === C.paper ? C.night : C.paper }}>{label}</div>
  </div>
);
export const Options = () => (
  <AbsoluteFill style={{ background: "#E9E4DC", padding: 50, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
    <Tile bg={C.night} label="A · three people on the route"><Three /></Tile>
    <Tile bg={C.night} label="B · people on the z"><People /></Tile>
    <Tile bg={C.paper} label="C · the z in a chat bubble"><Bubble /></Tile>
  </AbsoluteFill>
);
