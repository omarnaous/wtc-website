// Cover for the StepsTips reel (1080x1920, inside the profile grid's 3:4 crop, y 240-1680): the hook, the step ring at
// 10,000 crossed by a "Hype?" stamp, and the answer teased: 7,000 (Ding et al. 2025).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D } from "./Main.jsx";
import { useFonts } from "./fx.jsx";
import { Ring } from "./StepsTips.jsx";

const GRN = "#3DDC97", GRN2 = "#86EFC1", RED = "#FF4D6A", GOLD = "#FFC94A";
export const StepsTipsThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(61,220,151,.18), transparent 50%), radial-gradient(circle at 50% 55%, rgba(91,78,229,.4), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 270, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <span style={{ ...D, fontSize: 38, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
        <span style={{ marginLeft: "auto", ...D, fontSize: 34, color: GRN2, letterSpacing: "0.08em" }}>Tips & tricks</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 170, color: B.cream }}>10,000 steps</div>
        <div style={{ ...D, fontSize: 120, color: GRN, marginTop: 6, textShadow: "0 0 60px rgba(61,220,151,.35)" }}>worth the hype?</div>
      </div>
      <Ring f={0} cx={540} cy={1140} r={290} value={10000} glow={0.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "6px 26px", border: `8px solid ${RED}`, borderRadius: 18, ...D, fontSize: 140, color: RED, transform: "rotate(-12deg)", background: "rgba(7,7,26,.6)", boxShadow: `0 0 50px ${RED}55` }}>Hype?</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1530, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "12px 24px", borderRadius: 16, background: "rgba(255,201,74,.14)", border: `3px solid ${GOLD}`, ...D, fontSize: 48, color: GOLD }}>The science says 7,000</div>
      </div>
    </AbsoluteFill>
  );
};
