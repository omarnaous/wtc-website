// Dev holding two of the house's orange shopping bags (as in the FDM elevator shot), drawn in Dev's own coordinates
// over the rig's default hands-in-front pose, like RingBox.jsx in the jewelry concept.
import { Dev } from "./Dev.jsx";
const INK = "#0A0913", SKIN = "#E3AE86", ORANGE = "#F05A2A", ORANGE_D = "#C7431B";
function Bag({ x, y, w, h, t, k }) {
  const sway = Math.sin(t / 9 + k) * 2;
  return (
    <g transform={`rotate(${sway} ${x + w / 2} ${y - 40})`}>
      <path d={`M ${x + w * 0.28} ${y} Q ${x + w * 0.28} ${y - 46} ${x + w / 2} ${y - 46} Q ${x + w * 0.72} ${y - 46} ${x + w * 0.72} ${y}`} fill="none" stroke={ORANGE_D} strokeWidth="7" />
      <path d={`M ${x} ${y} H ${x + w} L ${x + w + 8} ${y + h} H ${x - 8} Z`} fill={ORANGE} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      <path d={`M ${x + w} ${y} L ${x + w + 8} ${y + h} H ${x + w - 18} L ${x + w - 14} ${y} Z`} fill={ORANGE_D} />
      <text x={x + w / 2} y={y + h * 0.56} textAnchor="middle" fontFamily="Giaza" fontSize={w * 0.32} fill="#FCE3D6">FDM</text>
    </g>
  );
}
export function DevBags({ width = 400, tilt = 0, bob = 0, t = 0, face = {} }) {
  const h = (width * 830) / 420;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}><Dev width={width} tilt={tilt} bob={bob} {...face} /></div>
      <svg viewBox="90 50 420 830" width={width} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(0 ${bob})`}>
          <Bag x={150} y={742} w={104} h={124} t={t} k={0} />
          <Bag x={352} y={736} w={110} h={132} t={t} k={1.4} />
          <circle cx="204" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
          <circle cx="396" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
        </g>
      </svg>
    </div>
  );
}
