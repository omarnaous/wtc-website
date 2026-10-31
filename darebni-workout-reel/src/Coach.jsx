// The Darebni coach: an original cartoon classic-physique bodybuilder (beard, short swept hair, black Darebni shorts)
// hitting a one-arm front biceps pose, drawn as flat SVG with ink outlines. `flex` 0..1 pumps the biceps and chest,
// `t` drives breathing and blinks. Half-body framing (cut at mid-thigh), viewBox 0 0 420 640.
const INK = "#0E0B12", SKIN = "#D9A07A", SHADE = "#B97E58", LIGHT = "#EDBE9A", HAIR = "#2B1F19", SHORTS = "#121218", PURPLE = "#8B80FF";

export function Coach({ width = 420, flex = 0, t = 0, smirk = 1 }) {
  const h = (width * 640) / 420;
  const breath = Math.sin(t / 14) * 1.6, blink = t % 90 > 86;
  const pump = 1 + 0.07 * flex;
  const o = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round", strokeLinecap: "round" };
  return (
    <svg viewBox="0 0 420 640" width={width} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="cfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.82" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id="cmask"><rect x="-200" y="-200" width="820" height="840" fill="url(#cfade)" /></mask>
      </defs>
      <g mask="url(#cmask)" transform={`translate(0 ${breath * 0.4})`}>
        {/* legs (quads) under the shorts */}
        <path d="M150 520 C140 580 150 640 160 660 L205 660 C208 610 210 570 208 530 Z" fill={SKIN} {...o} />
        <path d="M270 520 C280 580 270 640 260 660 L215 660 C212 610 210 570 212 530 Z" fill={SKIN} {...o} />
        <path d="M168 560 C178 590 182 620 180 650" fill="none" stroke={SHADE} strokeWidth="5" strokeLinecap="round" />
        <path d="M252 560 C242 590 238 620 240 650" fill="none" stroke={SHADE} strokeWidth="5" strokeLinecap="round" />

        {/* neck + traps */}
        <path d="M184 140 L236 140 L246 182 C268 190 284 196 296 204 L124 204 C136 196 152 190 174 182 Z" fill={SKIN} {...o} />
        <path d="M188 178 C196 186 224 186 232 178" fill="none" stroke={SHADE} strokeWidth="4" strokeLinecap="round" />

        {/* torso: a hard V-taper */}
        <g transform={`translate(210 300) scale(${1 + breath * 0.004}) translate(-210 -300)`}>
          <path d="M112 205 C135 182 285 182 308 205 C318 250 300 300 288 330 C278 370 270 400 264 432 L156 432 C150 400 142 370 132 330 C120 300 102 250 112 205 Z" fill={SKIN} {...o} />
          {/* lats shadow */}
          <path d="M126 250 C130 300 144 340 152 380" fill="none" stroke={SHADE} strokeWidth="6" strokeLinecap="round" />
          <path d="M294 250 C290 300 276 340 268 380" fill="none" stroke={SHADE} strokeWidth="6" strokeLinecap="round" />
          {/* pecs */}
          <g transform={`translate(210 245) scale(${pump}) translate(-210 -245)`}>
            <path d="M146 214 C170 200 204 204 209 220 L208 268 C190 288 156 284 140 258 C134 240 136 224 146 214 Z" fill={LIGHT} {...o} strokeWidth="5" />
            <path d="M274 214 C250 200 216 204 211 220 L212 268 C230 288 264 284 280 258 C286 240 284 224 274 214 Z" fill={LIGHT} {...o} strokeWidth="5" />
          </g>
          {/* abs: 3 rows */}
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x="181" y={292 + r * 40} width="26" height="32" rx="11" fill={LIGHT} stroke={SHADE} strokeWidth="4" />
              <rect x="213" y={292 + r * 40} width="26" height="32" rx="11" fill={LIGHT} stroke={SHADE} strokeWidth="4" />
            </g>
          ))}
          <path d="M196 418 L210 432 L224 418" fill="none" stroke={SHADE} strokeWidth="4" strokeLinecap="round" />
          {/* obliques / serratus */}
          {[0, 1, 2].map((k) => <path key={k} d={`M${150 + k * 3} ${282 + k * 22} l14 8`} stroke={SHADE} strokeWidth="4" strokeLinecap="round" />)}
          {[0, 1, 2].map((k) => <path key={k} d={`M${270 - k * 3} ${282 + k * 22} l-14 8`} stroke={SHADE} strokeWidth="4" strokeLinecap="round" />)}
        </g>

        {/* shorts with the Darebni waveform */}
        <path d="M150 424 L270 424 L292 548 L216 556 L210 488 L204 556 L128 548 Z" fill={SHORTS} {...o} />
        <path d="M150 436 L270 436" stroke="#2A2A36" strokeWidth="6" />
        <g transform="translate(244 468)">{[8, 14, 10, 18, 9].map((hh, i) => <rect key={i} x={i * 6} y={-hh / 2} width="3.6" height={hh} rx="1.8" fill={i % 2 ? "#F2F0EA" : PURPLE} />)}</g>

        {/* arm on the hip (viewer's right) */}
        <path d="M300 214 C336 236 356 280 348 322 C340 346 312 370 286 404" fill="none" stroke={INK} strokeWidth="62" strokeLinecap="round" />
        <path d="M300 214 C336 236 356 280 348 322 C340 346 312 370 286 404" fill="none" stroke={SKIN} strokeWidth="50" strokeLinecap="round" />
        <path d="M328 248 C344 270 348 292 342 314" fill="none" stroke={SHADE} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="276" cy="414" rx="26" ry="20" fill={SKIN} {...o} transform="rotate(-30 276 414)" />
        <circle cx="304" cy="216" r="42" fill={SKIN} {...o} />
        <path d="M290 196 C306 190 324 200 330 214" fill="none" stroke={LIGHT} strokeWidth="6" strokeLinecap="round" />

        {/* the flexing arm (viewer's left): upper arm out wide, forearm up, fist above the shoulder */}
        <path d="M112 214 L26 196" stroke={INK} strokeWidth="68" strokeLinecap="round" />
        <path d="M112 214 L26 196" stroke={SKIN} strokeWidth="56" strokeLinecap="round" />
        <path d="M24 198 L40 92" stroke={INK} strokeWidth="58" strokeLinecap="round" />
        <path d="M24 198 L40 92" stroke={SKIN} strokeWidth="46" strokeLinecap="round" />
        <path d="M16 176 C20 150 26 126 32 108" fill="none" stroke={SHADE} strokeWidth="5" strokeLinecap="round" />
        {/* the biceps peak, sitting between the elbow and the shoulder */}
        <g transform={`translate(52 186) scale(${pump}) translate(-52 -186)`}>
          <path d="M8 200 C8 154 42 132 72 148 C92 158 96 182 88 202 Z" fill={SKIN} {...o} />
          <path d="M28 156 C42 146 60 146 72 154" fill="none" stroke={LIGHT} strokeWidth="7" strokeLinecap="round" />
          <path d="M34 182 C44 188 60 190 74 186" fill="none" stroke={SHADE} strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="116" cy="214" r="42" fill={SKIN} {...o} />
        <path d="M96 192 C108 182 128 184 138 198" fill="none" stroke={LIGHT} strokeWidth="6" strokeLinecap="round" />
        {/* fist */}
        <g transform="rotate(-10 42 80)">
          <rect x="14" y="52" width="58" height="54" rx="19" fill={SKIN} {...o} />
          {[0, 1, 2].map((k) => <path key={k} d={`M${28 + k * 13} 56 v15`} stroke={SHADE} strokeWidth="4" strokeLinecap="round" />)}
        </g>

        {/* head */}
        <g transform={`rotate(${-3 + flex * 2} 210 110)`}>
          <ellipse cx="166" cy="112" rx="10" ry="16" fill={SKIN} {...o} />
          <ellipse cx="254" cy="112" rx="10" ry="16" fill={SKIN} {...o} />
          <path d="M170 70 C170 40 250 40 250 70 L252 128 C250 160 228 176 210 176 C192 176 170 160 168 128 Z" fill={SKIN} {...o} />
          {/* beard */}
          <path d="M168 112 C170 150 190 178 210 178 C230 178 250 150 252 112 C246 128 238 136 228 138 C222 132 198 132 192 138 C182 136 174 128 168 112 Z" fill={HAIR} {...o} strokeWidth="5" />
          <path d="M196 148 C202 152 218 152 224 148" fill="none" stroke={smirk ? "#7A3E2E" : INK} strokeWidth="4" strokeLinecap="round" />
          {/* moustache */}
          <path d="M190 138 C198 130 206 134 210 136 C214 134 222 130 230 138 C222 140 214 140 210 139 C206 140 198 140 190 138 Z" fill={HAIR} />
          {/* hair: short, swept up and back */}
          <path d="M168 84 C160 46 190 22 218 26 C246 28 262 50 254 86 C248 70 238 60 222 58 C206 52 190 58 180 66 C174 70 170 76 168 84 Z" fill={HAIR} {...o} strokeWidth="5" />
          <path d="M186 50 C200 40 222 38 240 46" fill="none" stroke="#4A3528" strokeWidth="4" strokeLinecap="round" />
          {/* brows + eyes: a confident, slightly squinted look */}
          <path d="M180 92 L202 96" stroke={HAIR} strokeWidth="7" strokeLinecap="round" />
          <path d="M240 92 L218 96" stroke={HAIR} strokeWidth="7" strokeLinecap="round" />
          {blink ? <g stroke={INK} strokeWidth="4" strokeLinecap="round"><path d="M184 108 h16" /><path d="M220 108 h16" /></g> : (
            <g><ellipse cx="192" cy="108" rx="9" ry="6" fill="#fff" stroke={INK} strokeWidth="3" /><circle cx="193" cy="108" r="4" fill={INK} />
              <ellipse cx="228" cy="108" rx="9" ry="6" fill="#fff" stroke={INK} strokeWidth="3" /><circle cx="229" cy="108" r="4" fill={INK} /></g>
          )}
          <path d="M210 112 C206 122 206 126 212 127" fill="none" stroke={SHADE} strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
