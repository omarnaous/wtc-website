// Cover for the CaffeineTips reel (1080x1920, inside the profile grid's 3:4 crop, y 240-1680): the hook, the cup, and the
// two numbers people save it for: the dose (3-6 mg/kg, ISSN 2021) and the sleep cutoff (8.8 h, Gardiner et al. 2023).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D } from "./Main.jsx";
import { useFonts } from "./fx.jsx";
import { Cup } from "./CaffeineTips.jsx";

const COF = "#C98B5A", COF2 = "#E8B98C", GOLD = "#FFC94A";
export const CaffeineTipsThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 35% 62%, rgba(201,139,90,.22), transparent 50%), radial-gradient(circle at 60% 55%, rgba(91,78,229,.4), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 270, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <span style={{ ...D, fontSize: 38, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
        <span style={{ marginLeft: "auto", ...D, fontSize: 34, color: COF2, letterSpacing: "0.08em" }}>Tips & tricks</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 380 }}>
        <div style={{ ...D, fontSize: 160, color: B.cream }}>Caffeine</div>
        <div style={{ ...D, fontSize: 120, color: COF2, textShadow: "0 0 60px rgba(201,139,90,.35)" }}>used right</div>
      </div>
      <Cup id="thumb" f={20} cx={300} top={820} h={640} level={0.8} glow={0.6} />
      <div style={{ position: "absolute", left: 560, right: 60, top: 860 }}>
        {[["3–6 mg/kg", "the dose that works", COF2], ["8.8 h", "before bed, last coffee", B.lo], ["400 mg", "daily ceiling", "#FF4D6A"]].map(([v, l, c]) => (
          <div key={v} style={{ marginBottom: 40 }}>
            <div style={{ ...D, fontSize: 110, color: c, lineHeight: 0.86 }}>{v}</div>
            <div style={{ ...D, fontSize: 44, color: B.cream, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "12px 24px", borderRadius: 16, background: "rgba(255,201,74,.14)", border: `3px solid ${GOLD}`, ...D, fontSize: 46, color: GOLD }}>What the studies say</div>
      </div>
    </AbsoluteFill>
  );
};
