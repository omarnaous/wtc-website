// Product illustrations for the storefront demo. Shaded vector "renders", recolourable.
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
};

export function Sneaker({ size = 300, color = "#5B2BFF", accent = "#FFFFFF", id = "snk" }) {
  return (
    <svg viewBox="0 0 400 240" width={size} height={size * 0.6} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}u`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={shade(color, 0.12)} /><stop offset="1" stopColor={shade(color, -0.12)} /></linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D9D6E2" /></linearGradient>
      </defs>
      <ellipse cx="205" cy="222" rx="170" ry="12" fill="rgba(10,9,19,.18)" />
      {/* sole */}
      <path d="M30,178 Q34,206 70,210 L340,210 Q378,208 380,184 L378,170 L30,166 Z" fill={`url(#${id}s)`} stroke="#B9B5C6" strokeWidth="2" />
      <path d="M40,192 L370,192" stroke="#C9C5D4" strokeWidth="3" />
      <path d="M60,206 L80,198 M100,206 L120,198 M140,206 L160,198 M180,206 L200,198 M220,206 L240,198 M260,206 L280,198 M300,206 L320,198" stroke="#C9C5D4" strokeWidth="3" />
      {/* upper */}
      <path d="M36,170 Q30,120 70,104 Q120,92 150,60 Q170,40 205,46 L262,58 Q290,64 300,96 Q318,130 360,138 Q384,146 378,170 Z" fill={`url(#${id}u)`} />
      <path d="M205,46 L262,58 Q286,64 296,92 L240,96 Q214,80 205,46 Z" fill={shade(color, -0.2)} />
      {/* side stripes */}
      <path d="M110,160 Q170,110 260,104 Q236,124 222,160 Z" fill={accent} opacity=".95" />
      <path d="M150,160 Q190,128 246,124" stroke={shade(color, -0.15)} strokeWidth="5" fill="none" />
      {/* toe cap + heel tab */}
      <path d="M300,96 Q318,130 360,138 Q384,146 378,170 L330,170 Q324,130 300,96 Z" fill={shade(color, 0.18)} opacity=".6" />
      <path d="M36,170 Q30,120 70,104 L78,170 Z" fill={shade(color, -0.25)} />
      {/* collar opening + tongue */}
      <path d="M78,112 Q96,86 140,80 Q150,96 136,110 Q108,120 78,112 Z" fill={shade(color, -0.45)} />
      <path d="M140,80 Q150,44 182,40 Q196,44 192,62 L150,92 Z" fill={shade(color, 0.08)} stroke={shade(color, -0.25)} strokeWidth="3" />
      {/* laces */}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${170 + i * 22},${66 + i * 8} l26,8`} stroke={accent} strokeWidth="6" strokeLinecap="round" />)}
      <path d="M150,60 Q170,40 205,46" stroke={shade(color, -0.3)} strokeWidth="4" fill="none" />
      <path d="M60,118 Q100,104 130,84" stroke="rgba(255,255,255,.35)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Hoodie({ size = 200, color = "#2B2733" }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <ellipse cx="100" cy="190" rx="70" ry="7" fill="rgba(10,9,19,.15)" />
      <path d="M60,40 Q100,20 140,40 L178,70 L166,110 L148,100 L150,180 L50,180 L52,100 L34,110 L22,70 Z" fill={color} />
      <path d="M72,40 Q100,70 128,40 Q118,26 100,26 Q82,26 72,40 Z" fill={shade(color, -0.12)} />
      <path d="M92,58 L90,88 M108,58 L110,88" stroke={shade(color, 0.35)} strokeWidth="3" strokeLinecap="round" />
      <path d="M70,130 H130 V160 H70 Z" fill={shade(color, -0.08)} />
      <path d="M52,100 L50,180 M148,100 L150,180" stroke={shade(color, -0.15)} strokeWidth="3" />
      <path d="M60,48 Q50,80 56,100" stroke="rgba(255,255,255,.18)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Backpack({ size = 200, color = "#F0384F" }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <ellipse cx="100" cy="190" rx="60" ry="7" fill="rgba(10,9,19,.15)" />
      <path d="M78,30 Q100,10 122,30" stroke={shade(color, -0.25)} strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="44" y="34" width="112" height="146" rx="34" fill={color} />
      <rect x="60" y="100" width="80" height="62" rx="16" fill={shade(color, -0.1)} />
      <path d="M64,108 H136" stroke={shade(color, 0.25)} strokeWidth="4" />
      <rect x="92" y="96" width="16" height="10" rx="3" fill="#E9E6F2" />
      <path d="M58,52 Q56,80 60,92" stroke="rgba(255,255,255,.3)" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Cap({ size = 200, color = "#74C6FF" }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <ellipse cx="100" cy="160" rx="76" ry="8" fill="rgba(10,9,19,.15)" />
      <path d="M40,120 Q40,52 100,48 Q160,52 160,120 Z" fill={color} />
      <path d="M100,48 Q90,80 92,120 M100,48 Q120,82 124,120" stroke={shade(color, -0.15)} strokeWidth="3" fill="none" />
      <path d="M100,48 m-8,0 a8,6 0 1,0 16,0 a8,6 0 1,0 -16,0" fill={shade(color, -0.2)} />
      <path d="M36,118 Q100,104 184,128 Q170,146 120,142 Q70,138 36,124 Z" fill={shade(color, -0.18)} />
      <path d="M54,84 Q62,62 84,56" stroke="rgba(255,255,255,.35)" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Watch({ size = 200, color = "#0A0913" }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <ellipse cx="100" cy="188" rx="40" ry="6" fill="rgba(10,9,19,.15)" />
      <rect x="74" y="14" width="52" height="60" rx="14" fill={shade(color, 0.15)} />
      <rect x="74" y="126" width="52" height="60" rx="14" fill={shade(color, 0.15)} />
      <rect x="50" y="56" width="100" height="88" rx="28" fill={color} />
      <rect x="60" y="66" width="80" height="68" rx="20" fill="#14121F" />
      <path d="M100,80 V100 L114,110" stroke="#8F72FF" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M152,90 h6" stroke={shade(color, 0.3)} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
