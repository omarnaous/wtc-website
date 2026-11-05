// The pull-day reel's cover (copy of Thumb.jsx with the chest & back plan and the B&W standing photo) (1080x1920, checked against the profile grid's 3:4 crop, y 240-1680): the hook on top, the
// ambassador stepping in front of the real app in a tilted phone.
import { AbsoluteFill } from "remotion";
import W from "./chestback_workout.json";
import { B, D, Header, Ambassador, Phone, Chip } from "./Main.jsx";
import { useFonts } from "./fx.jsx";

export const ChestBackThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 62%, rgba(91,78,229,.5), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <Header f={0} right="Chest + back" />
      <div style={{ position: "absolute", left: 70, top: 320 }}>
        <div style={{ ...D, fontSize: 210, color: B.cream, lineHeight: 0.86 }}>Chest<br /><span style={{ color: B.lo }}>+ back</span></div>
        <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
          <Chip hot>{W.exercises.length} moves</Chip><Chip>Sets · reps · rest</Chip>
        </div>
      </div>
      <Phone src="app/home.jpg" w={340} x={120} y={790} rot={-8} />
      <Ambassador f={200} x={700} w={600} top={800} src="ambassador-arnold.png" aspect={1018 / 762} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 1590, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ padding: "14px 24px", borderRadius: 18, background: B.cream, ...D, fontSize: 44, color: B.ink }}>Full plan in Darebni AI</div>
      </div>
    </AbsoluteFill>
  );
};
