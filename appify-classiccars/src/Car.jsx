// Dev driving a cartoon classic spider in Valmora wine: wire wheels, chrome, no hands on the wheel.
// Car-local units: 1000 wide, wheels on y = 300. `width` scales it; Dev sits behind the door line and waves.
import { Dev } from "./Dev.jsx";

const INK = "#0A0913", CHROME = "#D9DDE3";
const BODY = "M 60 300 C 20 296, 18 230, 40 190 Q 62 150, 150 142 L 330 150 Q 336 168, 350 170 L 560 170 Q 575 168, 585 158 Q 760 140, 900 168 Q 975 182, 985 230 Q 990 280, 960 300 L 882 300 A 92 92 0 0 0 698 300 L 307 300 A 92 92 0 0 0 123 300 L 60 300 Z";

function Wheel({ cx, rot }) {
  return (
    <g transform={`translate(${cx} 300)`}>
      <circle r="78" fill="#141218" stroke={INK} strokeWidth="8" />
      <circle r="54" fill="#3A3D44" />
      <g transform={`rotate(${rot})`} stroke={CHROME} strokeWidth="3">
        {Array.from({ length: 18 }, (_, k) => { const a = (k / 18) * Math.PI * 2; return <line key={k} x1={Math.cos(a) * 12} y1={Math.sin(a) * 12} x2={Math.cos(a + 0.35) * 52} y2={Math.sin(a + 0.35) * 52} />; })}
      </g>
      <circle r="54" fill="none" stroke={CHROME} strokeWidth="6" />
      <g transform={`rotate(${rot})`}><path d="M -26 -5 H 26 V 5 H -26 Z" fill={CHROME} stroke={INK} strokeWidth="3" /><circle r="13" fill={CHROME} stroke={INK} strokeWidth="3" /></g>
    </g>
  );
}

export function DevCar({ width = 900, rot = 0, pitch = 0, bounce = 0, wave = 1, waveAng = 0, thumbs = 1, tilt = 0, face = {} }) {
  const k = width / 1000;
  return (
    <div style={{ position: "relative", width, height: 380 * k }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1000, height: 380, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <svg width="1000" height="380" viewBox="0 0 1000 380" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <ellipse cx="500" cy="378" rx="470" ry="22" fill="rgba(0,0,0,.45)" />
        </svg>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1000, height: 380, transform: `translateY(${bounce}px) rotate(${pitch}deg)`, transformOrigin: "790px 300px" }}>
          {/* windscreen behind Dev */}
          <svg width="1000" height="380" viewBox="0 0 1000 380" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d="M 578 166 L 606 80 L 642 84 L 614 166 Z" fill="rgba(180,220,255,.28)" stroke={CHROME} strokeWidth="6" strokeLinejoin="round" />
          </svg>
          {/* Dev, cut off at the door line */}
          <div style={{ position: "absolute", left: 0, top: -600, width: 1000, height: 600 + 174, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 265, top: 600 - 335 }}>
              <Dev width={360} wave={wave} waveAng={waveAng} thumbs={thumbs} tilt={tilt} {...face} />
            </div>
          </div>
          <svg width="1000" height="380" viewBox="0 0 1000 380" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <defs>
              <linearGradient id="carBody" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#A62A3F" /><stop offset=".45" stopColor="#7A1426" /><stop offset="1" stopColor="#4A0A15" /></linearGradient>
              <radialGradient id="lamp"><stop offset="0" stopColor="#FFF6D0" /><stop offset="1" stopColor="#FFE08A" stopOpacity="0" /></radialGradient>
            </defs>
            <rect x="34" y="290" width="44" height="12" rx="6" fill="#8A8E96" stroke={INK} strokeWidth="4" />
            <path d={BODY} fill="url(#carBody)" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
            <path d="M 160 156 L 318 160 M 600 164 Q 760 150 890 176" fill="none" stroke="#D0556A" strokeWidth="9" strokeLinecap="round" opacity=".7" />
            <path d="M 46 202 L 978 202" stroke={CHROME} strokeWidth="7" strokeLinecap="round" />
            <path d="M 352 178 L 352 292 M 578 176 L 592 292" stroke="#3E0812" strokeWidth="5" strokeLinecap="round" />
            <rect x="500" y="214" width="40" height="9" rx="4" fill={CHROME} stroke={INK} strokeWidth="3" />
            <path d="M 612 226 l 22 -14 M 612 246 l 22 -14 M 612 266 l 22 -14" stroke="#2A050C" strokeWidth="7" strokeLinecap="round" />
            <circle cx="958" cy="208" r="44" fill="url(#lamp)" opacity=".8" />
            <circle cx="958" cy="208" r="17" fill="#FFF4C8" stroke={INK} strokeWidth="5" />
            <ellipse cx="34" cy="218" rx="8" ry="16" fill="#E0233C" stroke={INK} strokeWidth="4" />
            <path d="M 945 286 Q 990 284 996 262 M 72 290 Q 26 292 18 268" fill="none" stroke={CHROME} strokeWidth="10" strokeLinecap="round" />
            <Wheel cx={215} rot={rot} />
            <Wheel cx={790} rot={rot} />
          </svg>
        </div>
      </div>
    </div>
  );
}
