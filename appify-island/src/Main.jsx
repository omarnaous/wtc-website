// Appify brand film (15 s, 9:16). One yellow shape becomes everything Appify makes: a line draws itself, inflates into a
// pill, then morphs into a website, a video frame, a phone and a 7-day ring, and finally into the spark that lands as the
// wordmark's i-dot. Masked type rises and settles beside it; a slow camera drifts through parallax layers.
// Every word and number is from appify-lb.com (appify-web/migrations/0002_seed.sql), shown at its real value.
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Audio, staticFile, random } from "remotion";
import { useFonts, fonts, aspring, clamp, type } from "./apple.jsx";
import { WORDMARK } from "./brand.js";
import { DURATION, LINE, PILL, S, SPARK, WORD, LAND, TAG, URL } from "./timing.js";

const ACC = "#FFD23F", INK = "#0B0B0E", CX = 540, CY = 620;
const out = Easing.bezier(0.22, 1, 0.36, 1);
const SPRING = 0.78; // springy settle: a little overshoot on arrivals, as the brief asks

// ── shape morphing: every state is N points, clockwise from the top centre, evenly spaced along the outline ────
const N = 180;
function resample(poly) {
  const seg = poly.map((p, i) => Math.hypot(poly[(i + 1) % poly.length][0] - p[0], poly[(i + 1) % poly.length][1] - p[1]));
  const L = seg.reduce((a, b) => a + b, 0), pts = [];
  let i = 0, acc = 0;
  for (let k = 0; k < N; k++) {
    const target = (k / N) * L;
    while (i < seg.length - 1 && acc + seg[i] < target) { acc += seg[i]; i++; }
    const t = seg[i] ? (target - acc) / seg[i] : 0, a = poly[i], b = poly[(i + 1) % poly.length];
    pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return pts;
}
function rrect(cx, cy, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, p = [];
  const arc = (ax, ay, a0) => { for (let j = 0; j <= 16; j++) { const a = a0 + (j / 16) * Math.PI / 2; p.push([ax + r * Math.cos(a), ay + r * Math.sin(a)]); } };
  p.push([cx, y0]);
  arc(x1 - r, y0 + r, -Math.PI / 2); arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI);
  return resample(p);
}
function spark(cx, cy, R) {
  const q = R * 0.2, P = [[cx, cy - R], [cx + R, cy], [cx, cy + R], [cx - R, cy]], C = [[cx + q, cy - q], [cx + q, cy + q], [cx - q, cy + q], [cx - q, cy - q]], p = [];
  for (let s = 0; s < 4; s++) {
    const a = P[s], b = P[(s + 1) % 4], c = C[s];
    for (let j = 0; j < 30; j++) { const t = j / 30, u = 1 - t; // cubic with both controls at c
      p.push([u * u * u * a[0] + 3 * u * t * (u + t) * c[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * t * (u + t) * c[1] + t * t * t * b[1]]); }
  }
  return resample(p);
}

// wordmark placement (end frame) and its i-dot
const WM = 660, WMH = WM * 1167 / 3224, WMX = (1080 - WM) / 2, WMY = 800, WS = WM / 3224;
const DOT = { x: WMX + (2118.5 + 20) * WS, y: WMY + (-750.89 + 917) * WS, r: 146.15 * WS };

const STATES = [
  [0, rrect(CX, CY, 2, 6, 3), 1, 0.4],                 // a dot of light
  [LINE, rrect(CX, CY, 320, 6, 3), 1, 0.5],            // the line draws itself
  [PILL, rrect(CX, CY, 320, 100, 50), SPRING, 0.5],    // inflates into a pill
  [S[0], rrect(CX, CY, 580, 420, 44), SPRING, 0.6],    // website
  [S[1], rrect(CX, CY, 640, 360, 40), SPRING, 0.55],   // video frame
  [S[2], rrect(CX, CY, 310, 620, 66), SPRING, 0.6],    // phone
  [S[3], rrect(CX, CY, 470, 470, 235), SPRING, 0.6],   // ring
  [SPARK, spark(DOT.x, DOT.y, DOT.r), 0.82, 0.75],     // the spark, at the i-dot
];
function heroPts(f) {
  const P = STATES[0][1].map((p) => [...p]);
  for (let k = 1; k < STATES.length; k++) {
    const [at, pts, ratio, resp] = STATES[k], prev = STATES[k - 1][1], s = aspring(f, at, ratio, resp);
    if (!s) continue;
    for (let i = 0; i < N; i++) { P[i][0] += (pts[i][0] - prev[i][0]) * s; P[i][1] += (pts[i][1] - prev[i][1]) * s; }
  }
  return P;
}
const toPath = (P) => "M" + P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L") + "Z";
// a small rotation kick on every morph, alternating direction, so each change has a physical push
const MORPHS = [S[0], S[1], S[2], S[3], SPARK];
const kick = (f) => MORPHS.reduce((a, t, i) => a + (i % 2 ? -1 : 1) * 7 * (aspring(f, t, 0.7, 0.5) - aspring(f, t + 8, 1, 0.6)), 0);

// ── camera: slow drift + a soft push on each morph; layers take it at different depths (parallax) ──────────────
function cam(f) {
  const push = MORPHS.reduce((a, t) => a + 0.03 * (aspring(f, t, 0.8, 0.6) - aspring(f, t + 12, 1, 0.9)), 0);
  return { x: 22 * Math.sin(f / 95), y: -46 * (f / DURATION) + 12 * Math.sin(f / 70), s: 1 + 0.05 * (f / DURATION) + push, r: 0.7 * Math.sin(f / 140) };
}
const Layer = ({ f, depth, children }) => {
  const c = cam(f);
  return <AbsoluteFill style={{ transform: `translate(${c.x * depth}px, ${c.y * depth}px) scale(${1 + (c.s - 1) * depth}) rotate(${c.r * depth}deg)`, transformOrigin: "540px 860px" }}>{children}</AbsoluteFill>;
};

// ── lines that draw themselves (and retract before the next morph) ─────────────────────────────────────────────
const draw = (f, a, b, r0, r1) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: out }) - interpolate(f, [r0, r1], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
const Stroke = ({ f, d, a, b, r0, r1, w = 6, o = 1, color = INK }) => {
  const p = draw(f, a, b, r0, r1);
  return p > 0.001 && <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />;
};
const Pop = ({ f, x, y, r, a, r0, color = INK }) => {
  const p = aspring(f, a, 0.6, 0.35) * (1 - aspring(f, r0, 1, 0.25));
  return p > 0.001 && <circle cx={x} cy={y} r={r * p} fill={color} />;
};
const rr = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;

function Details({ f }) {
  const [A, B, C, D] = S;
  const w0 = CX - 290, t0 = CY - 210;                       // website 580 x 420
  const prog = interpolate(f, [B + 20, C - 6], [0, 1], clamp); // video: the progress line keeps running
  const px = CX - 155, py = CY - 310;                       // phone 310 x 620
  const inner = aspring(f, D + 8, SPRING, 0.5) * (1 - aspring(f, SPARK - 8, 1, 0.3)); // ring: the inner disc
  return (
    <g>
      {/* website: browser bar, headline, copy, a button */}
      <Stroke f={f} d={`M${w0 + 36},${t0 + 62} H${w0 + 544}`} a={A + 10} b={A + 24} r0={B - 10} r1={B - 2} w={4} o={0.55} />
      {[0, 1, 2].map((i) => <Pop key={i} f={f} x={w0 + 46 + i * 24} y={t0 + 36} r={7} a={A + 12 + i * 2} r0={B - 8} />)}
      <Stroke f={f} d={`M${w0 + 50},${t0 + 128} H${w0 + 400}`} a={A + 16} b={A + 32} r0={B - 10} r1={B - 2} w={30} />
      <Stroke f={f} d={`M${w0 + 50},${t0 + 176} H${w0 + 300}`} a={A + 20} b={A + 36} r0={B - 10} r1={B - 2} w={30} />
      {[0, 1, 2].map((i) => <Stroke key={i} f={f} d={`M${w0 + 50},${t0 + 238 + i * 30} H${w0 + [500, 450, 380][i]}`} a={A + 24 + i * 3} b={A + 40 + i * 3} r0={B - 10} r1={B - 2} w={10} o={0.6} />)}
      <Stroke f={f} d={rr(w0 + 50, t0 + 332, 190, 56, 28)} a={A + 32} b={A + 50} r0={B - 10} r1={B - 2} w={5} />
      {/* video: play triangle and a progress line */}
      <Stroke f={f} d={`M${CX - 30},${CY - 52} L${CX + 50},${CY} L${CX - 30},${CY + 52} Z`} a={B + 10} b={B + 26} r0={C - 10} r1={C - 2} w={9} />
      <Stroke f={f} d={`M${CX - 280},${CY + 128} H${CX + 280}`} a={B + 14} b={B + 26} r0={C - 10} r1={C - 2} w={6} o={0.3} />
      {f >= B + 20 && f < C - 2 && <>
        <path d={`M${CX - 280},${CY + 128} H${CX - 280 + 560 * prog}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <circle cx={CX - 280 + 560 * prog} cy={CY + 128} r={13 * aspring(f, B + 20, 0.6, 0.35) * (1 - aspring(f, C - 8, 1, 0.25))} fill={INK} />
      </>}
      {/* phone: island, cards, list, tab bar */}
      <Stroke f={f} d={`M${CX - 40},${py + 38} H${CX + 40}`} a={C + 8} b={C + 18} r0={D - 10} r1={D - 2} w={24} />
      <Stroke f={f} d={rr(px + 30, py + 90, 250, 160, 26)} a={C + 12} b={C + 30} r0={D - 10} r1={D - 2} w={5} />
      <Stroke f={f} d={rr(px + 30, py + 274, 115, 115, 24)} a={C + 16} b={C + 32} r0={D - 10} r1={D - 2} w={5} />
      <Stroke f={f} d={rr(px + 165, py + 274, 115, 115, 24)} a={C + 19} b={C + 35} r0={D - 10} r1={D - 2} w={5} />
      <Stroke f={f} d={`M${px + 30},${py + 430} H${px + 280}`} a={C + 22} b={C + 36} r0={D - 10} r1={D - 2} w={12} o={0.6} />
      <Stroke f={f} d={`M${px + 30},${py + 462} H${px + 210}`} a={C + 24} b={C + 38} r0={D - 10} r1={D - 2} w={12} o={0.6} />
      <Stroke f={f} d={`M${px + 20},${py + 530} H${px + 290}`} a={C + 26} b={C + 38} r0={D - 10} r1={D - 2} w={3} o={0.4} />
      {[0, 1, 2, 3].map((i) => <Pop key={i} f={f} x={px + 62 + i * 62} y={py + 570} r={9} a={C + 30 + i * 2} r0={D - 8} />)}
      {/* ring: the inner disc opens it, 7 day-ticks draw around the band */}
      {inner > 0.001 && <circle cx={CX} cy={CY} r={192 * inner} fill={INK} />}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (-90 + (i * 360) / 7) * Math.PI / 180;
        return <Stroke key={i} f={f} d={`M${CX + 200 * Math.cos(a)},${CY + 200 * Math.sin(a)} L${CX + 224 * Math.cos(a)},${CY + 224 * Math.sin(a)}`} a={D + 14 + i * 4} b={D + 22 + i * 4} r0={SPARK - 12} r1={SPARK - 6} w={9} />;
      })}
    </g>
  );
}

// the "7" inside the ring: rises through a circular mask, sinks before the ring closes
function Seven({ f }) {
  const p = aspring(f, S[3] + 16, SPRING, 0.55), q = aspring(f, SPARK - 12, 1, 0.4);
  if (p < 0.001 || q > 0.999) return null;
  return (
    <div style={{ position: "absolute", left: CX - 190, top: CY - 190, width: 380, height: 380, borderRadius: 190, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...type(300), fontWeight: 700, letterSpacing: "-0.05em", color: ACC, lineHeight: 1, transform: `translateY(${(1 - p) * 120 + q * 120}%)`, marginTop: -10 }}>7</div>
    </div>
  );
}

// ── masked type: each line rises out of its own slot, settles with a little spring, and leaves upward ───────────
const BIG = { ...type(158), fontWeight: 700, letterSpacing: "-0.05em", color: "#fff", lineHeight: 1 };
const SUB = { ...type(64), fontWeight: 600, letterSpacing: "-0.025em", color: "rgba(255,255,255,.72)", lineHeight: 1.1 };
const Acc = ({ children }) => <span style={{ color: ACC }}>{children}</span>;
const SLOTS = { big: [990, 178], s1: [1178, 84], s2: [1260, 84] };
const COPY = [
  // [enter, leave, slot, content]
  [PILL + 2, S[0] - 4, "big", "Ideas,"],
  [S[0] + 4, S[1] - 4, "big", "Websites"],
  [S[0] + 9, S[1] - 2, "s1", <><Acc>$360</Acc>, paid once.</>],
  [S[0] + 13, S[1], "s2", "$0 a month."],
  [S[1] + 4, S[2] - 4, "big", "Animated"],
  [S[1] + 9, S[2] - 2, "s1", <>websites from <Acc>$500</Acc>.</>],
  [S[2] + 4, S[3] - 4, "big", "Apps"],
  [S[2] + 9, S[3] - 2, "s1", "for iOS and Android."],
  [S[3] + 4, SPARK - 6, "big", "Delivered"],
  [S[3] + 9, SPARK - 4, "s1", <>in under <Acc>7 days</Acc>.</>],
];
function Copy({ f }) {
  return COPY.map(([a, b, slot, content], i) => {
    const p = aspring(f, a, SPRING, 0.55), q = aspring(f, b, 1, 0.42);
    if (p < 0.001 || q > 0.999) return null;
    const [top, h] = SLOTS[slot];
    return (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top, height: h + 20, overflow: "hidden", textAlign: "center" }}>
        <div style={{ ...(slot === "big" ? BIG : SUB), transform: `translateY(${((1 - p) - q) * (h + 40)}px) rotate(${(1 - p) * 3 - q * 2}deg)`, transformOrigin: "50% 100%" }}>{content}</div>
      </div>
    );
  });
}

// ── end frame: wordmark rises under the landing spark, the line and the URL follow ─────────────────────────────
function End({ f }) {
  if (f < WORD - 2) return null;
  const p = aspring(f, WORD, SPRING, 0.6), t = aspring(f, TAG, SPRING, 0.55), u = aspring(f, URL, SPRING, 0.55);
  const line = interpolate(f, [URL + 4, URL + 24], [0, 1], { ...clamp, easing: out });
  const ring = interpolate(f, [LAND - 4, LAND + 22], [0, 1], { ...clamp, easing: out });
  return (
    <>
      <div style={{ position: "absolute", left: WMX - 20, top: WMY - 40, width: WM + 40, height: WMH + 70, overflow: "hidden" }}>
        <svg viewBox={WORDMARK.viewBox} width={WM} height={WMH} style={{ position: "absolute", left: 20, top: 40, transform: `translateY(${(1 - p) * (WMH + 80)}px)` }}>
          <path d={WORDMARK.letters} fill="#fff" />
        </svg>
      </div>
      {ring > 0 && ring < 1 && <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        <circle cx={DOT.x} cy={DOT.y} r={40 + 120 * ring} fill="none" stroke={ACC} strokeWidth={3} opacity={0.7 * (1 - ring)} />
      </svg>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1100, height: 90, overflow: "hidden", textAlign: "center" }}>
        <div style={{ ...SUB, color: "#fff", transform: `translateY(${(1 - t) * 130}px)` }}>Ideas, <Acc>appified.</Acc></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, height: 60, overflow: "hidden", textAlign: "center" }}>
        <div style={{ ...type(38), color: "rgba(255,255,255,.55)", transform: `translateY(${(1 - u) * 100}px)` }}>appify-lb.com</div>
      </div>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        <path d="M410,1268 H670" stroke={ACC} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
      </svg>
    </>
  );
}

// ── background: rich dark with a soft accent glow that follows the shape, dust at three depths, grain ──────────
const DUST = Array.from({ length: 34 }, (_, i) => ({ x: random(`x${i}`) * 1080, y: random(`y${i}`) * 1920, r: 1 + random(`r${i}`) * 2.4, d: [0.5, 1.0, 1.5][i % 3], o: 0.08 + random(`o${i}`) * 0.25 }));
function Room({ f }) {
  const glow = interpolate(f, [0, PILL + 10], [0.35, 1], { ...clamp, easing: out });
  const end = interpolate(f, [SPARK, LAND], [0, 1], { ...clamp, easing: out });
  const gx = CX + (DOT.x - CX) * end, gy = CY + (DOT.y - CY) * end;
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 120% 80% at 50% 0%, #1b1710 0%, #0a0a0c 55%, #050506 100%)" }} />
      <Layer f={f} depth={0.3}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 38% at ${gx / 10.8}% ${gy / 19.2}%, rgba(255,210,63,${0.22 * glow}), rgba(255,170,30,${0.07 * glow}) 45%, transparent 75%)` }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 30% at ${30 + 8 * Math.sin(f / 80)}% 88%, rgba(255,210,63,.06), transparent 70%)` }} />
      </Layer>
      {[0.5, 1.0, 1.5].map((band) => (
        <Layer key={band} f={f} depth={band}>
          <svg width={1080} height={1920} style={{ position: "absolute" }}>
            {DUST.filter((d) => d.d === band).map((d, i) => (
              <circle key={i} cx={d.x} cy={(d.y - f * 0.4 * d.d + 1920) % 1920} r={d.r} fill={i % 3 ? "#fff" : ACC} opacity={d.o * glow} />
            ))}
          </svg>
        </Layer>
      ))}
    </>
  );
}
const Grain = ({ f }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /></filter>
    <rect width="100%" height="100%" filter="url(#g)" />
  </svg>
);

export function Main({ audio }) {
  useFonts(fonts);
  const f = useCurrentFrame();
  const P = heroPts(f), d = toPath(P), rot = kick(f);
  const cxNow = P.reduce((a, p) => a + p[0], 0) / N, cyNow = P.reduce((a, p) => a + p[1], 0) / N;
  const big = f < SPARK + 8;
  return (
    <AbsoluteFill style={{ background: "#050506", overflow: "hidden" }}>
      <Room f={f} />
      {/* the hero: glow underneath, soft shadow, a lit gradient face, the inner lines on top */}
      <Layer f={f} depth={1}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="face" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor="#FFE37E" /><stop offset="0.55" stopColor={ACC} /><stop offset="1" stopColor="#F2B512" /></linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="46" stdDeviation="40" floodColor="#000" floodOpacity="0.6" /></filter>
            <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="55" /></filter>
          </defs>
          <g transform={`rotate(${rot} ${cxNow} ${cyNow})`}>
            {big && <path d={d} fill={ACC} opacity={0.32} filter="url(#bloom)" />}
            <path d={d} fill="url(#face)" filter={big ? "url(#shadow)" : undefined} />
            <Details f={f} />
          </g>
        </svg>
        <Seven f={f} />
        <End f={f} />
      </Layer>
      <Layer f={f} depth={1.15}><Copy f={f} /></Layer>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%)", pointerEvents: "none" }} />
      <Grain f={f} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
}
