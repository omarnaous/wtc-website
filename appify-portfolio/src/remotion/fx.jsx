// Reusable effects. All are pure functions of the frame, safe for parallel rendering.
import { useEffect, useState } from "react";
import { AbsoluteFill, Easing, interpolate, random, delayRender, continueRender } from "remotion";
import sora from "../fonts/Sora-600.ttf";
import mono from "../fonts/GeistMono-500.ttf";
const FONT_URL = { "Sora-600.ttf": sora, "GeistMono-500.ttf": mono };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.55, 0, 1, 0.45);
export const TAU = Math.PI * 2;
// periodic in `period` frames -> seamless loops
export const wave = (f, period, k = 1, phase = 0) => Math.sin((f / period) * TAU * k + phase);
// 0 before `start`, then interpolate (avoids clamped values leaking backwards in time)
export const after = (f, start, input, output, opts = {}) =>
  f < start ? 0 : interpolate(f - start, input, output, { ...clamp, ...opts });

// Load fonts from public/ before the first frame renders.
export function useFonts(faces) {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(faces.map(([family, file, desc]) => new FontFace(family, `url(${FONT_URL[file]})`, desc).load()))
      .then((loaded) => { loaded.forEach((ff) => document.fonts.add(ff)); continueRender(handle); })
      .catch((e) => { console.error(e); continueRender(handle); });
  }, []);
}

// Decaying camera shake. Returns [x, y] px.
export function shake(f, start, amp = 20, tau = 4.5) {
  const t = f - start;
  if (t < 0) return [0, 0];
  const k = amp * Math.exp(-t / tau);
  return [(random(`sx${f}${start}`) - 0.5) * 2 * k, (random(`sy${f}${start}`) - 0.5) * 2 * k];
}

export function Flash({ f, start, peak = 0.85, color = "#fff" }) {
  const o = f < start ? 0 : interpolate(f - start, [0, 1, 5], [peak, peak * 0.4, 0], clamp);
  return <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
}

export function Shockwave({ f, cx, cy, start, max, width = 8, rgb = "255,255,255", dur = 32 }) {
  const t = f - start;
  if (t < 0 || t > dur) return null;
  const p = interpolate(t, [0, dur], [0, 1], { ...clamp, easing: easeOut });
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <circle cx={cx} cy={cy} r={max * p} fill="none" stroke={`rgba(${rgb},${(1 - p) * 0.8})`} strokeWidth={width * (1 - p) + 0.5} />
    </svg>
  );
}

// Particle burst: streaks with drag and a little gravity. colors: array of CSS colors.
export function Burst({ f, cx, cy, start, count = 90, speed = 40, seed = "b", colors = ["#fff"], scale = 1, gravity = 0.04 }) {
  const t = f - start;
  if (t < 0 || t > 70) return null;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const a = random(`${seed}a${i}`) * TAU;
    const v = (0.35 + random(`${seed}v${i}`) * 0.65) * speed;
    const life = 18 + random(`${seed}l${i}`) * 34;
    if (t > life) continue;
    const tau = 9, dist = v * tau * (1 - Math.exp(-t / tau)), vel = v * Math.exp(-t / tau);
    const x = cx + Math.cos(a) * dist, y = cy + Math.sin(a) * dist + gravity * t * t;
    const len = Math.max(2, vel * 2.2) * scale, o = 1 - t / life;
    const col = colors[Math.floor(random(`${seed}c${i}`) * colors.length)];
    parts.push(<line key={i} x1={x} y1={y} x2={x - Math.cos(a) * len} y2={y - Math.sin(a) * len} stroke={col} strokeWidth={(1.5 + random(`${seed}w${i}`) * 2.5) * scale} strokeLinecap="round" opacity={o} />);
  }
  return <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>{parts}</svg>;
}

// Horizontal anamorphic light streak through y.
export function Streak({ f, start, y, color = "#8F72FF" }) {
  const t = f - start;
  if (t < 0 || t > 26) return null;
  const sx = interpolate(t, [0, 6, 26], [0.1, 1.2, 1.6], clamp), o = interpolate(t, [0, 3, 26], [0, 1, 0], clamp);
  return <div style={{ position: "absolute", left: 0, right: 0, top: y - 2, height: 4, opacity: o, transform: `scaleX(${sx})`, background: `linear-gradient(90deg, transparent, ${color} 30%, #fff 50%, ${color} 70%, transparent)`, filter: "blur(1.5px)", boxShadow: `0 0 40px 8px ${color}88` }} />;
}

// Render children 3x as R/G/B with screen blend, offset by `px` (decay it to 0 after a hit).
export function RgbSplit({ px, children }) {
  if (px < 0.4) return children;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {[["#FF2B4E", -px, 0], ["#2BFF8F", 0, px * 0.3], ["#3B5BFF", px, 0]].map(([c, dx, dy]) => (
        <div key={c} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", transform: `translate(${dx}px, ${dy}px)`, color: c, ["--fx-fill"]: c }}>{children}</div>
      ))}
    </div>
  );
}

export function Grain({ f, opacity = 0.07 }) {
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="fx-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 60} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.2" /></filter>
        <rect width="100%" height="100%" filter="url(#fx-grain)" />
      </svg>
    </AbsoluteFill>
  );
}

export const Vignette = ({ strength = 0.55 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: "none" }} />
);
