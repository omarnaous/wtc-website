// Dev holding an open ring box with a pear-cut Paraíba stone (the NAÏADE Night Swim Ring), drawn in Dev's coordinates
// over the rig's default hands-in-front pose, like Gamer.jsx.
import { Dev } from "./Dev.jsx";

const INK = "#0A0913", SKIN = "#E3AE86", TEAL = "#35E6D8";
export function RingBox({ t = 0 }) {
  const glint = 0.5 + 0.5 * Math.sin(t / 4);
  return (
    <g>
      {/* open lid, tilted back */}
      <path d="M 214 640 L 228 560 Q 300 540 372 560 L 386 640 Z" fill="#12233A" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
      <path d="M 232 628 L 242 576 Q 300 560 358 576 L 368 628 Z" fill="#E9E4DA" stroke={INK} strokeWidth="4" />
      {/* base */}
      <path d="M 200 640 H 400 L 392 724 Q 392 736 380 736 H 220 Q 208 736 208 724 Z" fill="#1A3150" stroke={INK} strokeWidth="8" strokeLinejoin="round" />
      <path d="M 214 646 H 386 V 672 Q 300 690 214 672 Z" fill="#0E1C2E" />
      {/* the ring: band + pear stone + halo */}
      <ellipse cx="300" cy="668" rx="30" ry="12" fill="none" stroke="#D9DEE6" strokeWidth="7" />
      <path d="M 300 604 Q 322 632 318 648 Q 312 664 300 664 Q 288 664 282 648 Q 278 632 300 604 Z" fill={TEAL} stroke={INK} strokeWidth="5" />
      <path d="M 300 614 Q 310 630 308 642" fill="none" stroke="#C9FFFA" strokeWidth="5" strokeLinecap="round" />
      {/* glints */}
      <g opacity={glint} stroke="#fff" strokeWidth="5" strokeLinecap="round">
        <path d="M 340 600 v 28 M 326 614 h 28" /><path d="M 262 592 v 16 M 254 600 h 16" />
      </g>
      {/* hands holding the box */}
      <circle cx="204" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" /><circle cx="396" cy="712" r="24" fill={SKIN} stroke={INK} strokeWidth="8" />
    </g>
  );
}
export function DevRing({ width = 400, tilt = 0, bob = 0, t = 0, face = {} }) {
  const h = (width * 830) / 420;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}><Dev width={width} tilt={tilt} bob={bob} {...face} /></div>
      <svg viewBox="90 50 420 830" width={width} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(0 ${bob})`}><RingBox t={t} /></g>
      </svg>
    </div>
  );
}
