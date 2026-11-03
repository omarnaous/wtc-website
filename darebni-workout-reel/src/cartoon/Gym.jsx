// The cartoon gym set, in stage coordinates (1080 x 1920): night-blue walls with a violet glow, a window with light
// rays, a squat rack, a dumbbell rack behind the characters, a "DAREBNI" banner and a perspective floor.
import { random } from "remotion";
export function Gym({ f }) {
  const ray = 0.08 + 0.03 * Math.sin(f / 40);
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E0C26" /><stop offset="1" stopColor="#1E1950" /></linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stopColor="#5B4EE5" stopOpacity="0.5" /><stop offset="1" stopColor="#5B4EE5" stopOpacity="0" /></radialGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2363" /><stop offset="1" stopColor="#0C0A22" /></linearGradient>
        <linearGradient id="ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B8B0FF" stopOpacity="0.9" /><stop offset="1" stopColor="#B8B0FF" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x="-700" y="-700" width="2480" height="3320" fill="#0E0C26" />
      <rect x="-700" y="0" width="2480" height="1920" fill="url(#wall)" />
      <rect width="1080" height="1920" fill="url(#glow)" />
      {/* window */}
      <g opacity={0.9} transform="translate(0 260)">
        <rect x="620" y="360" width="360" height="460" rx="18" fill="#2D2770" />
        {[0, 1].map((c) => [0, 1].map((r) => <rect key={`${c}${r}`} x={636 + c * 172} y={376 + r * 218} width={156} height={204} rx={8} fill="#4A40B8" opacity={0.75} />))}
        <circle cx="900" cy="440" r="34" fill="#E9E5FF" opacity={0.85} />
      </g>
      <polygon points="620,620 980,620 760,1500 220,1500" fill="url(#ray)" opacity={ray} />
      {/* squat rack, left */}
      <g fill="#100E2C">
        <rect x="40" y="600" width="26" height="900" /><rect x="250" y="600" width="26" height="900" />
        <rect x="30" y="760" width="260" height="20" rx="8" />
        <rect x="-20" y="740" width="360" height="14" rx="7" fill="#3B3485" />
        <rect x="-10" y="700" width="40" height="96" rx="10" fill="#3B3485" /><rect x="310" y="700" width="40" height="96" rx="10" fill="#3B3485" />
      </g>
      {/* dumbbell rack */}
      <g>
        <rect x="80" y="1330" width="920" height="22" rx="10" fill="#100E2C" />
        <rect x="80" y="1440" width="920" height="22" rx="10" fill="#100E2C" />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} transform={`translate(${130 + i * 100} ${1300 + (i % 2) * 110})`} fill="#3B3485">
            <rect x="-34" y="0" width="68" height="14" rx="6" fill="#26215E" />
            <rect x="-44" y="-22" width="22" height="58" rx="8" /><rect x="22" y="-22" width="22" height="58" rx="8" />
          </g>
        ))}
      </g>
      {/* floor */}
      <rect x="-700" y="1520" width="2480" height="1100" fill="url(#floor)" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={540} y1={1520} x2={-600 + i * 285} y2={1920} stroke="#3B3485" strokeWidth={3} opacity={0.6} />)}
      {[1580, 1660, 1770].map((y) => <line key={y} x1="0" y1={y} x2="1080" y2={y} stroke="#3B3485" strokeWidth={3} opacity={0.4} />)}
      {/* dust in the light */}
      {Array.from({ length: 26 }, (_, i) => {
        const x = 300 + random(`dx${i}`) * 650, y = 420 + ((random(`dy${i}`) * 1000 + f * (0.4 + random(`ds${i}`) * 0.6)) % 1000);
        return <circle key={i} cx={x} cy={y} r={1.5 + random(`dr${i}`) * 2.5} fill="#E9E5FF" opacity={0.25} />;
      })}
    </svg>
  );
}
