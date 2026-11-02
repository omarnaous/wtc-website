// Cover for the creatine story reel: the 3D tub (Jar3D.jsx) with its lid lifting, the hook on top.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { B, D } from "./Main.jsx";
import { useFonts } from "./fx.jsx";
import { Env, Jar } from "./Jar3D.jsx";

export const CreatineThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }]]);
  const H = { ...D, color: B.cream };
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 66%, rgba(91,78,229,.55), transparent 58%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, position: [0, 0, 9], near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
          <Env /><ambientLight intensity={0.25} /><directionalLight position={[3, 4, 6]} intensity={2.2} />
          <pointLight position={[-4, 1, 3]} intensity={30} color="#8B80FF" /><pointLight position={[4, -2, 2]} intensity={12} color="#B8B0FF" />
          <Jar pos={[540, 1290]} s={0.68} spin={0.25} tilt={0.18} lid={0.045} burst={0.32} />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 70, top: 250, display: "flex", alignItems: "center", gap: 16 }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 64, height: 64, borderRadius: 16 }} />
        <span style={{ ...D, fontSize: 40, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
        <span style={{ marginLeft: 18, padding: "8px 18px", borderRadius: 12, background: B.primary, ...D, fontSize: 30, color: B.cream, letterSpacing: "0.1em" }}>Story time</span>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 360 }}>
        <div style={{ ...H, fontSize: 132 }}>Creatine:</div>
        <div style={{ ...H, fontSize: 132, color: B.lo }}>what nobody</div>
        <div style={{ ...H, fontSize: 132, color: B.lo }}>tells you</div>
      </div>
    </AbsoluteFill>
  );
};
