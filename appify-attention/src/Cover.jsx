// Thumbnail: the press a few frames from impact, the counter in the red, "Can you watch this for 7 seconds?".
// Stage coordinates are shared with the reel; the Feed cover shows the centre 1080x1350 of the same stage.
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { WORDMARK } from "./brand.js";
import { PressShot, C } from "./Main.jsx";

const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const { width: W, height: H } = useVideoConfig();
  const top = (H - 1920) / 2;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top, width: 1080, height: 1920 }}>
        <PressShot f={201} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,9,19,.85) 14%, rgba(10,9,19,0) 32%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>
          <div style={{ ...D, fontSize: 84, color: "#fff" }}>Can you watch this</div>
          <div style={{ ...D, fontSize: 132, color: "#fff", marginTop: 12, whiteSpace: "nowrap" }}>for <span style={{ color: C.iris }}>7</span> seconds?</div>
        </div>
        <svg viewBox={WORDMARK.viewBox} width={240} height={240 * 1167 / 3224} style={{ position: "absolute", left: 420, top: 1640 }}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
      </div>
    </AbsoluteFill>
  );
};
