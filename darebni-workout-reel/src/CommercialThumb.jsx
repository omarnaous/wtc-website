// Cover for the Darebni AI commercial (1080x1920, checked against the 3:4 grid crop, y 240-1680): a right-vs-wrong
// frame from the library (public/lib/clean/thumb-color.png, gitignored) in its original colours, the Arabic
// word دربني, and the line "Stop guessing. Start training."
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D, UI } from "./Main.jsx";
import { useFonts } from "./fx.jsx";

export const CommercialThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["Tajawal", "Tajawal-ExtraBold.ttf", { weight: "800" }]]);
  const W = { ...D, color: B.cream, textShadow: "0 10px 50px rgba(0,0,0,.7)" };
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(91,78,229,.45), transparent 60%)" }} />
      {/* the clip in its own colours, as a tilted card: right (✓, top) vs wrong (✕, bottom), frame 5.6 s of library clip 400 */}
      <div style={{ position: "absolute", left: 280, top: 700, width: 540, height: 960, borderRadius: 36, overflow: "hidden", transform: "rotate(-3deg)",
        boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 4px rgba(139,128,255,.6), 0 0 90px rgba(91,78,229,.45)" }}>
        <Img src={staticFile("lib/clean/thumb-color.png")} style={{ width: 540, height: 960 }} />
      </div>
      
      <div style={{ position: "absolute", left: 70, top: 250, display: "flex", alignItems: "center", gap: 16 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
        <span style={{ ...D, fontSize: 40, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 360 }}>
        <div style={{ ...W, fontSize: 150 }}>Stop</div>
        <div style={{ ...W, fontSize: 150, color: B.lo }}>guessing.</div>
        <div style={{ ...W, fontSize: 64, marginTop: 14 }}>Start training.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1690, textAlign: "center", display: "none" }}>
        <div style={{ fontFamily: "Tajawal", fontWeight: 800, fontSize: 170, color: B.lo, direction: "rtl", lineHeight: 1.1, textShadow: "0 0 60px rgba(139,128,255,.6)" }}>دربني</div>
        <div style={{ ...W, fontSize: 64, marginTop: 30, letterSpacing: "0.02em" }}>Start training.</div>
      </div>
    </AbsoluteFill>
  );
};
