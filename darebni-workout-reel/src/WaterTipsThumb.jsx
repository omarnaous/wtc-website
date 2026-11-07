// Cover for the WaterTips reel (1080x1920, everything inside the profile grid's 3:4 crop, y 240-1680): the hook on top,
// the half-drained bottle with drips on the left, the meta-analysis numbers (Savoie et al. 2015) stacked on the right,
// and a pill teasing the daily-intake answer.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D, UI } from "./Main.jsx";
import { useFonts } from "./fx.jsx";
import { Bottle } from "./WaterTips.jsx";

const AQUA = "#38BDF8", AQUA2 = "#7DD3FC", RED = "#FF4D6A";
export const WaterTipsThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const stats = [["−5.5%", "strength"], ["−8.3%", "reps"], ["−5.8%", "power"]];
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 62%, rgba(56,189,248,.28), transparent 50%), radial-gradient(circle at 70% 55%, rgba(91,78,229,.4), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 270, display: "flex", alignItems: "center", gap: 14 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <span style={{ ...D, fontSize: 38, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
        <span style={{ marginLeft: "auto", ...D, fontSize: 34, color: AQUA2, letterSpacing: "0.08em" }}>Tips & tricks</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 370 }}>
        <div style={{ ...D, fontSize: 168, color: B.cream }}>No water,</div>
        <div style={{ ...D, fontSize: 168, color: AQUA, textShadow: "0 0 60px rgba(56,189,248,.35)" }}>weaker lifts</div>
      </div>
      <Bottle id="thumb" f={40} cx={265} top={760} h={760} level={0.42} tilt={-6} glow={0.5} />
      {[0, 1, 2].map((i) => <svg key={i} width="30" height="42" viewBox="0 0 26 36" style={{ position: "absolute", left: 250 + (i - 1) * 46, top: 1540 + i * 22, opacity: 1 - i * 0.25 }}><path d="M13 0 C13 0 0 16 0 23 a13 13 0 0 0 26 0 C26 16 13 0 13 0Z" fill={AQUA} /></svg>)}
      <div style={{ position: "absolute", left: 500, right: 60, top: 790 }}>
        {stats.map(([v, l]) => (
          <div key={l} style={{ marginBottom: 34 }}>
            <div style={{ ...D, fontSize: 170, color: RED, lineHeight: 0.84, textShadow: "0 0 50px rgba(255,77,106,.35)" }}>{v}</div>
            <div style={{ ...D, fontSize: 56, color: B.cream, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 500, right: 60, top: 1500 }}>
        <div style={{ display: "inline-block", padding: "12px 22px", borderRadius: 16, background: "rgba(56,189,248,.14)", border: `3px solid ${AQUA}`, ...D, fontSize: 44, color: AQUA2 }}>+ how much you need a day</div>
      </div>
    </AbsoluteFill>
  );
};
