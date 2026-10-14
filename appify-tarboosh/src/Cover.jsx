// Thumbnail: the slow-motion burst (shards in the air, the marshmallow mid-squish, foil petals open) under the hook.
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useFonts } from "./fx.jsx";
import { World } from "./Scene3D.jsx";
import { Backdrop, C, D, M, FONTS } from "./Main.jsx";
import { pt } from "./timing.js";

const F = 214;
export const Cover = () => {
  const ready = useFonts(FONTS);
  const { width: W, height: H } = useVideoConfig();
  const p = pt(F), feed = H < 1920;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Backdrop f={F} p={p} />
      {ready && (
        <ThreeCanvas width={W} height={H} camera={{ fov: 30, position: [0, 2.4, 9.4], near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
          <World f={F} p={p} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(8,3,3,.9) ${feed ? 4 : 10}%, rgba(8,3,3,0) ${feed ? 30 : 36}%)` }} />
      {/* text sized to the frame (not the stage) so the 4:5 cover reads as big as the 9:16 one */}
      <div style={{ position: "absolute", left: 0, right: 0, top: feed ? 70 : 300, textAlign: "center", textShadow: "0 8px 40px rgba(0,0,0,.8)" }}>
        <div style={{ ...D, fontSize: feed ? 84 : 88, color: "#fff" }}>Every Lebanese kid</div>
        <div style={{ ...D, fontSize: 110, color: "#fff", marginTop: 18, whiteSpace: "nowrap" }}>knows this <span style={{ color: C.gold }}>sound.</span></div>
      </div>
      <div style={{ position: "absolute", left: 56, top: feed ? 26 : 150, ...M, fontSize: 22, color: "rgba(255,255,255,.65)" }}>Spec ad · unofficial</div>
    </AbsoluteFill>
  );
};
