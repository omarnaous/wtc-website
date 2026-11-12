// Cover for the SleepTips reel (1080x1920, inside the profile grid's 3:4 crop, y 240-1680): the hook, the moon and a
// drained recovery battery, and the numbers people save it for: -18% muscle protein synthesis after one sleepless night
// (Lamon et al. 2021) and +60% muscle lost when dieting on 5.5 h (Nedeltcheva et al. 2010).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D } from "./Main.jsx";
import { useFonts } from "./fx.jsx";
import { Battery } from "./SleepTips.jsx";

const MOON2 = "#C7D2FE", RED = "#FF4D6A", GOLD = "#FFC94A";
export const SleepTipsThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 58%, rgba(79,70,229,.42), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 270, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <span style={{ ...D, fontSize: 38, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
        <span style={{ marginLeft: "auto", ...D, fontSize: 34, color: MOON2, letterSpacing: "0.08em" }}>Tips & tricks</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 380 }}>
        <div style={{ ...D, fontSize: 150, color: B.cream }}>Bad sleep</div>
        <div style={{ ...D, fontSize: 150, color: RED, textShadow: "0 0 60px rgba(255,77,106,.35)" }}>kills gains</div>
      </div>
      <Battery f={0} cx={530} cy={900} w={620} level={0.22} label="Recovery" glow={0.5} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1180, display: "flex", gap: 24 }}>
        {[["−18%", "muscle building, 1 bad night", RED], ["+60%", "more muscle lost on a diet", GOLD]].map(([v, l, c]) => (
          <div key={v} style={{ flex: 1, padding: "20px 18px", borderRadius: 24, background: `${c}1f`, border: `3px solid ${c}`, textAlign: "center" }}>
            <div style={{ ...D, fontSize: 110, color: c, lineHeight: 0.9 }}>{v}</div>
            <div style={{ ...D, fontSize: 38, color: B.cream, marginTop: 6 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1530, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "12px 24px", borderRadius: 16, background: "rgba(199,210,254,.12)", border: `3px solid ${MOON2}`, ...D, fontSize: 46, color: MOON2 }}>What the studies say</div>
      </div>
    </AbsoluteFill>
  );
};
