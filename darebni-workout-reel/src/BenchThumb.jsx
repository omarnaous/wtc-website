// Cover for the BenchElbows reel (1080x1920, checked against the 3:4 profile-grid crop, y 240-1680): the question on
// top, the clip's own angle-lines frame (public/bench-thumb.png, taken at 5.8 s, kept out of git) tilted in a card
// with Darebni's three row labels on it, and a sticker saying only one is right (true: the clip marks one ✓).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D, Header } from "./Main.jsx";
import { useFonts } from "./fx.jsx";

const RED = "#FF4D5E", GRN = "#3DDC97";
const ROWS = [["Tucked in", false], ["About 45°", true], ["Flared to 90°", false]];

export const BenchThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const w = 640, h = w * 16 / 9;
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 66%, rgba(91,78,229,.5), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <Header f={0} right="Form check" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 320 }}>
        <div style={{ ...D, fontSize: 176, color: B.cream }}>Bench press</div>
        <div style={{ ...D, fontSize: 78, color: B.lo, marginTop: 10, whiteSpace: "nowrap" }}>Where do your elbows go?</div>
      </div>
      <div style={{ position: "absolute", left: 230, top: 650, width: w, height: h, borderRadius: 40, overflow: "hidden", transform: "rotate(-3deg)",
        boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 4px rgba(139,128,255,.6), 0 0 90px rgba(91,78,229,.45)" }}>
        <Img src={staticFile("bench-thumb.png")} style={{ width: w, height: h }} />
        {ROWS.map(([t, ok], i) => (
          <div key={t} style={{ position: "absolute", left: 22, top: (h / 3) * i + 18, display: "flex", alignItems: "center", gap: 10, padding: "8px 18px 8px 10px", borderRadius: 16,
            background: "rgba(7,7,26,.85)", border: `2.5px solid ${ok ? GRN : RED}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: ok ? GRN : RED, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 28, color: B.ink }}>{ok ? "✓" : "✕"}</div>
            <div style={{ ...D, fontSize: 42, color: B.cream }}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, top: 1220, width: 230, height: 230, borderRadius: "50%", background: B.success, transform: "rotate(-10deg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 60px rgba(0,0,0,.45)" }}>
        <div style={{ ...D, fontSize: 46, color: B.ink, lineHeight: 0.95, textAlign: "center" }}>Only<br /><span style={{ fontSize: 96 }}>1</span><br />is right</div>
      </div>
    </AbsoluteFill>
  );
};
