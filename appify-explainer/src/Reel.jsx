// The reel: the explainer playing on a laptop on a warm, dark desk, filmed from the front and a little above, with
// the trend's caption on top ("…just cooked 🔥", then the comment call to action). A slow handheld drift keeps it
// feeling filmed rather than flat.
import { AbsoluteFill, interpolate } from "remotion";
import { Explainer } from "./Explainer.jsx";
import { clamp, easeOut } from "./fx.jsx";
import { DURATION } from "./timing.js";

const W = 1080, H = 1920;
export const CAPTION_SWAP = DURATION - 105;   // the call to action takes over for the last 3.5 s

// laptop geometry on the 1080 x 1920 frame
const LID = { x: 70, y: 690, w: 940, h: 560, r: 26, bezel: 20 };
const BASE = { tl: [40, 1262], tr: [1040, 1262], br: [1160, 1760], bl: [-80, 1760] };
const lerp = (a, b, t) => a + (b - a) * t;
const at = (u, v) => [lerp(lerp(BASE.tl[0], BASE.tr[0], u), lerp(BASE.bl[0], BASE.br[0], u), v), lerp(lerp(BASE.tl[1], BASE.tr[1], u), lerp(BASE.bl[1], BASE.br[1], u), v)];
const quad = (u0, v0, u1, v1) => [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map((p) => p.join(",")).join(" ");

function Keyboard() {
  const rows = [14, 14, 13, 12, 11], keys = [];
  rows.forEach((n, r) => {
    const v0 = 0.08 + r * 0.085, v1 = v0 + 0.07;
    for (let k = 0; k < n; k++) {
      const pad = (14 - n) * 0.012, u0 = 0.09 + pad + k * ((0.82 - 2 * pad) / n), u1 = u0 + (0.82 - 2 * pad) / n - 0.008;
      keys.push(<polygon key={`${r}-${k}`} points={quad(u0, v0, u1, v1)} fill="#17130F" stroke="#2A221B" strokeWidth="1.5" />);
    }
  });
  keys.push(<polygon key="space" points={quad(0.33, 0.505, 0.67, 0.575)} fill="#17130F" stroke="#2A221B" strokeWidth="1.5" />);
  return <>{keys}</>;
}

function Laptop({ f }) {
  const s = (LID.w - 2 * LID.bezel) / 1920;   // explainer scale on the screen
  const glow = 0.5 + 0.08 * Math.sin(f / 20);
  return (
    <>
      {/* the screen's light on the desk */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 1180, height: 420, background: `radial-gradient(ellipse at 50% 0%, rgba(235,230,255,${0.16 * glow}), transparent 70%)` }} />
      {/* base: gold aluminium deck, keyboard, trackpad */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="alu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E2BC92" /><stop offset=".5" stopColor="#B88C5F" /><stop offset="1" stopColor="#6E4E2F" /></linearGradient>
          <radialGradient id="lamp" cx=".5" cy="0" r="1"><stop offset="0" stopColor="rgba(0,0,0,0)" /><stop offset=".6" stopColor="rgba(0,0,0,.15)" /><stop offset="1" stopColor="rgba(0,0,0,.6)" /></radialGradient>
          <linearGradient id="pad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D6B48B" /><stop offset="1" stopColor="#9E774D" /></linearGradient>
        </defs>
        <polygon points={quad(0, 0, 1, 1)} fill="url(#alu)" />
        <Keyboard />
        <polygon points={quad(0.3, 0.64, 0.7, 0.97)} fill="url(#pad)" stroke="#B48B5E" strokeWidth="2" />
        <polygon points={quad(0, 0, 1, 0.012)} fill="#7A5A3A" />
        <polygon points={quad(0, 0, 1, 1)} fill="url(#lamp)" />
        <polygon points={quad(0, 0, 1, 0.05)} fill="rgba(0,0,0,.35)" />
      </svg>
      {/* lid: black bezel and the explainer on the display */}
      <div style={{ position: "absolute", left: LID.x, top: LID.y, width: LID.w, height: LID.h, borderRadius: `${LID.r}px ${LID.r}px 6px 6px`, background: "#0B0B0E", boxShadow: "0 0 0 3px #3A2E22, 0 30px 80px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", left: LID.bezel, top: LID.bezel, width: LID.w - 2 * LID.bezel, height: 1080 * s, overflow: "hidden", borderRadius: 6 }}>
          <div style={{ width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0" }}><Explainer f={f} /></div>
          {/* glass: a soft reflection and a little falloff toward the edges */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,.10), transparent 35%, transparent 70%, rgba(255,255,255,.05))" }} />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(0,0,0,.25)" }} />
        </div>
        <div style={{ position: "absolute", left: "50%", top: 7, width: 8, height: 8, marginLeft: -4, borderRadius: 4, background: "#1E1E24" }} />
      </div>
    </>
  );
}

function Caption({ f }) {
  const swap = interpolate(f, [CAPTION_SWAP - 4, CAPTION_SWAP + 4], [0, 1], clamp);
  const inP = interpolate(f, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const line = (txt, o) => (
    <div style={{ position: "absolute", left: 70, right: 70, top: 470, textAlign: "center", fontFamily: "UI, 'Noto Color Emoji'", fontWeight: 600, fontSize: 64, lineHeight: 1.18, letterSpacing: "-0.01em", color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,.45)", opacity: o }}>{txt}</div>
  );
  return (
    <>
      {line(<>Our new ad just<br />cooked <span style={{ fontFamily: "'Noto Color Emoji'" }}>🔥</span></>, inP * (1 - swap))}
      {line(<>Comment “APPIFY” and<br />we’ll make yours.</>, swap)}
    </>
  );
}

export function Reel({ f }) {
  // slow handheld drift: a few pixels and a fraction of a degree, looping smoothly
  const t = f / 30, dx = Math.sin(t * 0.9) * 6 + Math.sin(t * 2.3) * 2, dy = Math.cos(t * 0.7) * 5, rot = Math.sin(t * 0.6) * 0.35;
  return (
    <AbsoluteFill style={{ background: "#0B0705", overflow: "hidden" }}>
      {/* warm desk under a lamp: wood tones, faint grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 60% at 50% 38%, #5A3A26 0%, #2A1A11 45%, #0F0906 80%)" }} />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(176deg, rgba(255,220,180,.025) 0 3px, transparent 3px 11px)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1.03)`, transformOrigin: "50% 60%" }}>
        <Laptop f={f} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%)" }} />
      <Caption f={f} />
    </AbsoluteFill>
  );
}
