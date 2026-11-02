// Cover for the 20 s Darebni AI commercial (1080x1920, inside the 3:4 grid crop, y 240-1680): the logo, the line,
// an upper-body lift from the library in its own colours (cable fly with its green form lines, frame 3.6 s of clip 311,
// public/lib/clean/thumb-color.png, gitignored) and the real app's workout tracker in a phone.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D, Phone } from "./Main.jsx";
import { useFonts } from "./fx.jsx";

export const CommercialThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }]]);
  const W = { ...D, color: B.cream, textShadow: "0 10px 50px rgba(0,0,0,.7)" };
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 55% 62%, rgba(91,78,229,.55), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {/* logo */}
      <div style={{ position: "absolute", left: 70, top: 260, display: "flex", alignItems: "center", gap: 22 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 110, height: 110, borderRadius: 26, boxShadow: "0 0 60px rgba(91,78,229,.7)" }} />
        <span style={{ ...D, fontSize: 84, color: B.cream, letterSpacing: "0.03em" }}>Darebni <span style={{ color: B.lo }}>AI</span></span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 420 }}>
        <div style={{ ...W, fontSize: 124 }}>Stop guessing.</div>
        <div style={{ ...W, fontSize: 124, color: B.lo }}>Start training.</div>
      </div>
      {/* the lift, upper body, as a tilted card */}
      <div style={{ position: "absolute", left: 80, top: 720, width: 550, height: 900, borderRadius: 36, overflow: "hidden", transform: "rotate(-4deg)",
        boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 4px rgba(139,128,255,.6), 0 0 90px rgba(91,78,229,.45)" }}>
        <Img src={staticFile("lib/clean/thumb-color.png")} style={{ position: "absolute", left: 0, top: 0, width: 560, height: 995, transform: "scale(1.75)", transformOrigin: "50% 30%" }} />
      </div>
      {/* the app */}
      <Phone src="app/tracker.jpg" w={330} x={660} y={850} rot={7} />
    </AbsoluteFill>
  );
};
