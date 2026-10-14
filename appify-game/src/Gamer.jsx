// Dev holding a gamepad: the rig's default pose (hands in front), with a controller drawn over the tablet in Dev's own coordinates.
import { Dev } from "./Dev.jsx";

const INK = "#0A0913", SKIN = "#E3AE86";
export function Gamepad() {
  return (
    <g>
      <path d="M 196 650 Q 210 628 250 630 L 350 630 Q 390 628 404 650 L 424 716 Q 432 748 404 752 Q 380 754 362 726 L 350 712 L 250 712 L 238 726 Q 220 754 196 752 Q 168 748 176 716 Z" fill="#26222E" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
      <path d="M 228 662 v 36 M 210 680 h 36" stroke="#C9C6D6" strokeWidth="11" strokeLinecap="round" />
      {[[372, 664, "#FFD23F"], [392, 682, "#F0384F"], [352, 682, "#74C6FF"], [372, 700, "#8F72FF"]].map(([x, y, c]) => <circle key={c} cx={x} cy={y} r="9" fill={c} stroke={INK} strokeWidth="3" />)}
      <circle cx="282" cy="694" r="11" fill="#3A3542" stroke={INK} strokeWidth="3" /><circle cx="318" cy="694" r="11" fill="#3A3542" stroke={INK} strokeWidth="3" />
      <circle cx="198" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" /><circle cx="402" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
    </g>
  );
}
export function DevGamer({ width = 400, tilt = 0, bob = 0, face = {} }) {
  const h = (width * 830) / 420;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}><Dev width={width} tilt={tilt} bob={bob} {...face} /></div>
      <svg viewBox="90 50 420 830" width={width} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(0 ${bob})`}><Gamepad /></g>
      </svg>
    </div>
  );
}
