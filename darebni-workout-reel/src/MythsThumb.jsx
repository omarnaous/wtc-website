// Cover for the creatine myths cartoon: Karim panicking, Sami smirking, the title in comic type, a "MYTH?" sticker.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "./fx.jsx";
import { D } from "./Main.jsx";
import { Toon, blendExpr } from "./cartoon/Toon.jsx";
import { Gym } from "./cartoon/Gym.jsx";
const INK = "#07071A", PAPER = "#F2F0EA", RED = "#FF4D6A", GOLD = "#FFC94A";
export const MythsThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: "translate(540px, 1260px) scale(1.15) translate(-540px, -1180px)", transformOrigin: "0 0" }}><Gym f={0} /></div>
      <div style={{ position: "absolute", left: -60, top: 860, width: 700, height: 1100, transform: "scale(.86)", transformOrigin: "0 0" }}>
        <Toon who="karim" e={blendExpr("neutral", "panic", 1)} mouth={0.8} gaze={0.5} />
      </div>
      <div style={{ position: "absolute", left: 500, top: 900, width: 700, height: 1100, transform: "scale(.8)", transformOrigin: "0 0" }}>
        <Toon who="sami" e={blendExpr("neutral", "smirk", 1)} gaze={-0.6} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 250, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16, border: `3px solid ${INK}` }} />
        <span style={{ ...D, fontSize: 40, color: PAPER, textShadow: `3px 3px 0 ${INK}` }}>Darebni AI · Story time</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 350 }}>
        <div style={{ ...D, fontSize: 190, color: PAPER, textShadow: `9px 9px 0 ${INK}`, transform: "rotate(-3deg)" }}>Creatine</div>
        <div style={{ ...D, fontSize: 130, color: GOLD, textShadow: `8px 8px 0 ${INK}`, transform: "rotate(-3deg)", marginTop: 10 }}>Facts <span style={{ color: PAPER }}>vs</span> <span style={{ color: RED }}>myths</span></div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 760, padding: "14px 30px", border: `9px solid ${RED}`, borderRadius: 18, background: "rgba(242,240,234,.95)", ...D, fontSize: 70, color: RED, transform: "rotate(10deg)" }}>Bald? Kidneys? Fat?</div>
    </AbsoluteFill>
  );
};
