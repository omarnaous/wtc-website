// Thumbnail: the balloon almost at the needle, the counter in the red, "Can you watch this for 7 seconds?".
// Stage coordinates are shared with the reel; the Feed cover shows the centre 1080x1350 of the same stage.
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { ThreeCanvas } from "@remotion/three";
import { BalloonShot, C } from "./Main.jsx";
import { World } from "./Scene3D.jsx";
import { Dev } from "./Dev.jsx";

const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const { height: H } = useVideoConfig();
  const feed = H < 1920, off = feed ? -340 : 0;   // feed: keep the counter in frame
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: off, width: 1080, height: 1920 }}>
        <BalloonShot f={182} layer="bg" />
        <div style={{ position: "absolute", inset: 0 }}>
          <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, position: [0, 0.15, 9], near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
            <World f={182} />
          </ThreeCanvas>
        </div>
        <BalloonShot f={182} layer="hud" />
        {/* Dev, shocked, pointing up at the needle */}
        <div style={{ position: "absolute", left: -60, top: 1110, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>
          <Dev width={360} point={1} shock={1} look={7} brow={10} tilt={-5} />
        </div>
      </div>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,9,19,.85) ${feed ? 4 : 14}%, rgba(10,9,19,0) ${feed ? 24 : 30}%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: feed ? 40 : 330, textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,.7)" }}>
        <div style={{ ...D, fontSize: 84, color: "#fff" }}>Can you watch this</div>
        <div style={{ ...D, fontSize: 132, color: "#fff", marginTop: 12, whiteSpace: "nowrap" }}>for <span style={{ color: C.yellow }}>7</span> seconds?</div>
      </div>
    </AbsoluteFill>
  );
};
