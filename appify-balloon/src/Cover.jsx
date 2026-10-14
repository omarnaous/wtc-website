// Thumbnail: the balloon almost at the needle, the counter in the red, "Can you watch this for 7 seconds?".
// Stage coordinates are shared with the reel; the Feed cover shows the centre 1080x1350 of the same stage.
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { BalloonShot, C } from "./Main.jsx";

const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const { height: H } = useVideoConfig();
  const feed = H < 1920, off = feed ? -340 : 0;   // feed: keep the counter in frame
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: off, width: 1080, height: 1920 }}>
        <BalloonShot f={182} />
      </div>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,9,19,.85) ${feed ? 4 : 14}%, rgba(10,9,19,0) ${feed ? 24 : 30}%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: feed ? 40 : 330, textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>
        <div style={{ ...D, fontSize: 84, color: "#fff" }}>Can you watch this</div>
        <div style={{ ...D, fontSize: 132, color: "#fff", marginTop: 12, whiteSpace: "nowrap" }}>for <span style={{ color: C.yellow }}>7</span> seconds?</div>
      </div>
    </AbsoluteFill>
  );
};
