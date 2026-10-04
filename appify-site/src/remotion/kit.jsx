import { interpolate, Easing } from "remotion";

export const TAU = Math.PI * 2;
export const FONT = "'Sora', ui-sans-serif, system-ui, sans-serif";
export const BODY = "'Geist', ui-sans-serif, system-ui, sans-serif";
export const MONO = "'Geist Mono', ui-monospace, Menlo, monospace";

// Periodic wave that repeats exactly every `period` frames (seamless loops).
export const wave = (frame, period, phase = 0) => Math.sin((frame / period) * TAU + phase);

const ease = Easing.bezier(0.22, 1, 0.36, 1);
// In at [a,b], out at [c,d]. Returns 0..1. Keeps loops clean: 0 at start and end.
export const inOut = (frame, a, b, c, d) =>
  interpolate(frame, [a, b, c, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const ramp = (frame, a, b, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export function Phone({ w = 300, children, bg = "#fff", frame = "#0b0b0f", style }) {
  const h = w * 2.06;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.16, background: frame, padding: w * 0.035, boxShadow: "0 40px 80px rgba(0,0,0,.35), inset 0 0 0 2px rgba(255,255,255,.08)", ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.13, overflow: "hidden", background: bg }}>
        <div style={{ position: "absolute", top: w * 0.03, left: "50%", transform: "translateX(-50%)", width: w * 0.3, height: w * 0.085, borderRadius: 99, background: "#000", zIndex: 5 }} />
        {children}
      </div>
    </div>
  );
}

export function Browser({ w = 1100, h = 680, url = "yourbrand.com", children, chrome = "#ECEAF0", bg = "#fff", dark = false, style }) {
  const ink = dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.45)";
  return (
    <div style={{ width: w, height: h, borderRadius: 18, overflow: "hidden", background: bg, boxShadow: "0 50px 100px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.06)", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ height: 44, flex: "none", background: chrome, display: "flex", alignItems: "center", gap: 8, padding: "0 18px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 99, background: c }} />)}
        <div style={{ margin: "0 auto", width: 360, height: 26, borderRadius: 8, background: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)", display: "flex", alignItems: "center", justifyContent: "center", font: `500 13px ${BODY}`, color: ink }}>{url}</div>
        <span style={{ width: 52 }} />
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

export function Cursor({ x, y, press = 0 }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 50, transform: `scale(${1 - press * 0.15})`, transformOrigin: "0 0" }}>
      {press > 0.01 && <span style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: 99, border: "2px solid rgba(0,0,0,.25)", opacity: press, transform: `scale(${0.6 + press})` }} />}
      <svg width="26" height="30" viewBox="0 0 26 30"><path d="M2 2 L2 24 L8 18.5 L12.5 28 L16.5 26.2 L12.2 17 L20.5 17 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
    </div>
  );
}
