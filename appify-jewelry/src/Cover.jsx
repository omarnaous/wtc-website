// Thumbnail: "Animated website 04". The hook, the NAÏADE site in a browser window with motion trails (so it reads as
// animated), Dev holding a ring box in front of it, and appify × NAÏADE. Same grid template as 01-03.
// Everything that matters sits in the centre 1080x1440 band (the 3:4 profile-grid crop).
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DevRing } from "./RingBox.jsx";

const C = { ink: "#04161A", uv: "#0D6F6A", iris: "#35E6D8", sky: "#35E6D8" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.98 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const UI = { fontFamily: "UI", fontWeight: 600 };
const Spark = ({ size, color, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const WIN_W = 880, IMG_H = (WIN_W * 764) / 1280;
const Window = ({ ghost = 0 }) => (
  <div style={{ width: WIN_W, borderRadius: 26, overflow: "hidden", background: "#0B1214", boxShadow: ghost ? "none" : "0 50px 120px rgba(0,0,0,.7), 0 0 0 3px rgba(53,230,216,.55)" }}>
    <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 15, height: 15, borderRadius: 99, background: c }} />)}
      <div style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 10, background: "rgba(255,255,255,.07)", ...UI, fontWeight: 400, fontSize: 19, color: "rgba(255,255,255,.75)" }}>NAÏADE</div>
    </div>
    <Img src={staticFile("cover/hero.jpg")} style={{ width: WIN_W, height: IMG_H, display: "block", objectFit: "cover" }} />
  </div>
);

export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const { width: W, height: H } = useVideoConfig();
  const k = Math.min(1, H / 1440), bt = (H - 1440 * k) / 2;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(53,230,216,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(53,230,216,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: "540px 0" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 55%, rgba(13,111,106,.6), transparent 60%)" }} />
      <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: bt, width: 1080, height: 1440, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        {/* series badge */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 50, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 26px", borderRadius: 99, border: "3px solid rgba(53,230,216,.5)" }}>
            <Spark size={24} color={C.iris} />
            <span style={{ ...M, fontSize: 26, color: C.sky }}>animated website · 04</span>
          </div>
        </div>
        {/* hook */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 104, color: "#fff", whiteSpace: "nowrap" }}>Cheap website,</div>
          <div style={{ ...D, fontSize: 104, color: "#fff", whiteSpace: "nowrap", marginTop: 4 }}>cheap jewelry.</div>
          <div style={{ ...D, fontSize: 80, color: C.sky, marginTop: 12, whiteSpace: "nowrap", textShadow: "0 10px 50px rgba(53,230,216,.3)" }}>Make it feel like luxury.</div>
        </div>
        {/* the site, with motion trails behind it */}
        {[3, 2, 1].map((g) => (
          <div key={g} style={{ position: "absolute", left: 120 - g * 38, top: 490 + g * 6, transform: "rotate(-4deg)", opacity: 0.16 / g, filter: `blur(${g * 2}px)` }}><Window ghost /></div>
        ))}
        <div style={{ position: "absolute", left: 120, top: 490, transform: "rotate(-4deg)" }}><Window /></div>
        {/* speed lines + scroll cursor */}
        {[0, 1, 2].map((i) => <i key={i} style={{ position: "absolute", left: 40 - i * 10, top: 640 + i * 70, width: 120 - i * 30, height: 8, borderRadius: 9, background: C.iris, opacity: 0.85 - i * 0.2, transform: "rotate(-4deg)" }} />)}
        {/* appify × EARSHOT, stacked on the left */}
        <div style={{ position: "absolute", left: 50, top: 1150, display: "grid", gap: 16 }}>
          <svg viewBox={WORDMARK.viewBox} width={230} height={230 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ ...D, fontSize: 56, color: "rgba(255,255,255,.7)" }}>×</span>
            <span style={{ ...M, fontSize: 44, letterSpacing: "0.12em", color: "#fff" }}>NAÏADE</span>
          </div>
          <div style={{ ...M, fontSize: 20, color: "rgba(255,255,255,.7)" }}>designed & built by appify</div>
        </div>
        {/* Dev holding the ring box in front of the site */}
        <div style={{ position: "absolute", left: 600, top: 760 }}>
          <DevRing width={340} tilt={-4} t={6} face={{ brow: 16, lid: 0.04, smile: 1, happy: 1, open: 0.5 }} />
        </div>
        <Spark size={64} color={C.iris} style={{ position: "absolute", left: 980, top: 430, transform: "rotate(12deg)" }} />
      </div>
    </AbsoluteFill>
  );
};
