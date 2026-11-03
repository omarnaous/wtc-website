// Cover for the mascot cut: the two sporty Dev-rig mascots (Karim shocked, Sami smirking and pointing) under the title.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "./fx.jsx";
import { D } from "./Main.jsx";
import { SportDev } from "./cartoon/SportDev.jsx";
const INK = "#07071A", PAPER = "#F2F0EA", RED = "#FF4D6A", GOLD = "#FFC94A";
export const MythsMascotThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0E0C26 0%, #1A1548 60%, #0E0C26 100%)", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(91,78,229,.5), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(139,128,255,.08) 2px, transparent 2px)", backgroundSize: "72px 72px" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
        {Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2; return <line key={i} x1={540 + Math.cos(a) * 300} y1={1200 + Math.sin(a) * 300} x2={540 + Math.cos(a) * 1500} y2={1200 + Math.sin(a) * 1500} stroke={GOLD} strokeWidth="8" />; })}
      </svg>
      <div style={{ position: "absolute", left: -40, right: -40, top: 1700, height: 260, background: "linear-gradient(180deg, #2A2363, #0C0A22)", borderTop: `6px solid ${INK}` }} />
      <div style={{ position: "absolute", left: 0, top: 820 }}><SportDev who="karim" width={480} shock={1} brow={26} smile={0} sweat={1} look={6} /></div>
      <div style={{ position: "absolute", left: 600, top: 860 }}><SportDev who="sami" flip width={450} point={1} brow={14} lid={0.35} smile={0.8} look={8} /></div>
      <div style={{ position: "absolute", left: 360, top: 830, width: 110, height: 110, borderRadius: 55, background: RED, border: `6px solid ${INK}`, boxShadow: `0 8px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 80, color: "#fff" }}>!</div>
      <div style={{ position: "absolute", left: 60, top: 250, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16, border: `3px solid ${INK}` }} />
        <span style={{ ...D, fontSize: 40, color: PAPER, textShadow: `3px 3px 0 ${INK}` }}>Darebni AI · Story time</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 350 }}>
        <div style={{ ...D, fontSize: 190, color: PAPER, textShadow: `9px 9px 0 ${INK}`, transform: "rotate(-3deg)" }}>Creatine</div>
        <div style={{ ...D, fontSize: 130, color: GOLD, textShadow: `8px 8px 0 ${INK}`, transform: "rotate(-3deg)", marginTop: 10 }}>Facts <span style={{ color: PAPER }}>vs</span> <span style={{ color: RED }}>myths</span></div>
      </div>
      <div style={{ position: "absolute", right: 60, top: 700, padding: "12px 26px", border: `8px solid ${RED}`, borderRadius: 18, background: "rgba(242,240,234,.95)", ...D, fontSize: 60, color: RED, transform: "rotate(8deg)" }}>Bald? Kidneys? Fat?</div>
    </AbsoluteFill>
  );
};
