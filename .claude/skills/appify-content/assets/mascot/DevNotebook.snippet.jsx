function DevNotebook({ width = 380, face }) {
  const h = (width * 830) / 420;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}><Dev width={width} {...face} /></div>
      <svg viewBox="90 50 420 830" width={width} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform="rotate(-6 300 680)">
          <path d="M150 600 L298 616 L298 760 L156 740 Z" fill="#FFF8E7" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
          <path d="M302 616 L450 600 L444 740 L302 760 Z" fill="#FFF3D6" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M172 ${640 + k * 22} L282 ${652 + k * 22}`} stroke="#9AB8E8" strokeWidth="3" />)}
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M318 ${652 + k * 22} L428 ${640 + k * 22}`} stroke="#9AB8E8" strokeWidth="3" />)}
          <path d="M180 646 q12 -10 24 0 t24 0 t24 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M180 690 q10 -8 20 0 t20 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M330 650 l60 -6 M330 676 q14 -10 28 0 t28 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M336 700 l80 -10 M340 690 l70 18" stroke={C.pink} strokeWidth="5" strokeLinecap="round" />
          <text x="372" y="728" fontFamily="Display" fontWeight="600" fontSize="30" fill={C.pink} textAnchor="middle">??</text>
          {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx="300" cy={628 + k * 22} r="6" fill="none" stroke={INK} strokeWidth="4" />)}
        </g>
        <circle cx="204" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
        <circle cx="396" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
      </svg>
    </div>
  );
}
