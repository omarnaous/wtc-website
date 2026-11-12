// Cover for the SkullFix reel (1080x1920, inside the 3:4 grid crop): the hook on top, the clip's elbows-flared ✕ and
// elbows-tucked ✓ (public/lib/clean/skull-wrong.png / -right.png, frames 200 / 250, gitignored) as two tilted cards, and
// a "2 fixes" sticker.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { B, D, Header } from "./Main.jsx";
import { useFonts } from "./fx.jsx";

const RED = "#FF4D5E", GRN = "#3DDC97";
export const SkullFixThumb = () => {
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const w = 465, h = w * 640 / 540;
  const Card = ({ src, ok, label, x, rot }) => (
    <div style={{ position: "absolute", left: x, top: 700, width: w, height: h, borderRadius: 34, overflow: "hidden", transform: `rotate(${rot}deg)`,
      boxShadow: `0 50px 120px rgba(0,0,0,.6), 0 0 0 5px ${ok ? GRN : RED}, 0 0 80px ${ok ? GRN : RED}55` }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: 0, width: w, height: h }} />
      <div style={{ position: "absolute", left: 18, bottom: 18, display: "flex", alignItems: "center", gap: 10, padding: "8px 16px 8px 10px", borderRadius: 14, background: "rgba(7,7,26,.88)", border: `3px solid ${ok ? GRN : RED}` }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: ok ? GRN : RED, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 30, color: B.ink }}>{ok ? "✓" : "✕"}</div>
        <div style={{ ...D, fontSize: 40, color: B.cream }}>{label}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 66%, rgba(91,78,229,.5), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <Header f={0} right="Form check" />
      <div style={{ position: "absolute", left: 70, right: 70, top: 320 }}>
        <div style={{ ...D, fontSize: 95, color: B.cream, whiteSpace: "nowrap" }}>Skull crushers</div>
        <div style={{ ...D, fontSize: 95, color: B.lo, marginTop: 6, whiteSpace: "nowrap" }}>hurting your elbows?</div>
      </div>
      <Card src="lib/clean/skull-wrong.png" ok={false} label="Elbows out" x={50} rot={-4} />
      <Card src="lib/clean/skull-right.png" ok label="Elbows in" x={565} rot={4} />
      <div style={{ position: "absolute", left: 420, top: 1330, width: 240, height: 240, borderRadius: "50%", background: B.success, border: `6px solid ${B.ink}`, transform: "rotate(-10deg)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 60px rgba(0,0,0,.45)" }}>
        <div style={{ ...D, fontSize: 110, color: B.ink, lineHeight: 0.85 }}>2</div>
        <div style={{ ...D, fontSize: 50, color: B.ink }}>fixes</div>
      </div>
    </AbsoluteFill>
  );
};
