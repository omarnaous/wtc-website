// Cover for the Darebni AI commercial (1080x1920, checked against the 3:4 grid crop, y 240-1680): the hook lifter
// (public/lib/clean/thumb.png, a frame of the cleaned hook shot, gitignored) graded violet like the spot, the Arabic
// word دربني with its meaning, and the line "Stop guessing. Start training."
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D, UI } from "./Main.jsx";
import { useFonts } from "./fx.jsx";

export const CommercialThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["Tajawal", "Tajawal-ExtraBold.ttf", { weight: "800" }]]);
  const W = { ...D, color: B.cream, textShadow: "0 10px 50px rgba(0,0,0,.7)" };
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: "scale(1.3)", transformOrigin: "50% 95%" }}>
        <Img src={staticFile("lib/clean/thumb.png")} style={{ width: 1080, height: 1920, filter: "grayscale(1) contrast(1.3) brightness(.62)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(91,78,229,.6), rgba(67,56,202,.35))", mixBlendMode: "color" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,7,26,.92) 0%, rgba(7,7,26,.35) 30%, rgba(7,7,26,.2) 55%, rgba(7,7,26,.95) 85%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(7,7,26,.8) 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 250, display: "flex", alignItems: "center", gap: 16 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
        <span style={{ ...D, fontSize: 40, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 360 }}>
        <div style={{ ...W, fontSize: 150 }}>Stop</div>
        <div style={{ ...W, fontSize: 150, color: B.lo }}>guessing.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center" }}>
        <div style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 170, color: B.lo, direction: "rtl", lineHeight: 1.1, textShadow: "0 0 60px rgba(139,128,255,.6)" }}>دربني</div>
        <div style={{ ...UI, fontSize: 44, color: B.cream, marginTop: 6 }}>“train me”</div>
        <div style={{ ...W, fontSize: 64, marginTop: 30, letterSpacing: "0.02em" }}>Start training.</div>
      </div>
    </AbsoluteFill>
  );
};
