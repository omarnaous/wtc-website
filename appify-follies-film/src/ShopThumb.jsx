// Cover for the Follies boutique reel, in appify's colours (ink, UV, yellow; the bags stay FDM orange): the POV hook on ink labels, the live site (the FDM film in the hero) in a
// tilted browser, a lookbook cut-out stepping out of it, Dev (appify on his shirt) with the orange FDM bags,
// and the pay-once sticker.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "./fx.jsx";
import { DevBags } from "./DevBags.jsx";

const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", paper: "#F3F1FA", yellow: "#FFD23F" };   // appify
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const box = (bg, fg) => ({ display: "inline-block", padding: "12px 30px 20px", borderRadius: 22, background: bg, color: fg, ...D, fontSize: 96, boxShadow: "0 18px 50px rgba(0,0,0,.45)" });

export const ShopThumb = () => {
  useFonts([["Giaza", "fonts/Giaza.otf"], ["UIR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"], ["Display", "Sora-600.ttf", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(91,43,255,.5), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: "Giaza", fontSize: 720, lineHeight: 0.8, color: "rgba(143,114,255,.1)" }}>FDM</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <span style={box(C.uv, "#fff")}><span style={{ color: C.yellow }}>POV:</span> FDM launched</span>
        <div style={{ marginTop: 12 }}><span style={box("#fff", C.ink)}>their new <span style={{ color: C.uv }}>website</span></span></div>
      </div>
      <div style={{ position: "absolute", left: 50, top: 590, width: 980, transform: "rotate(-3deg)", borderRadius: 24, overflow: "hidden", background: "#15131F", boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 80px rgba(91,43,255,.45), 0 0 0 3px rgba(143,114,255,.55)" }}>
        <div style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
          <div style={{ marginLeft: 150, padding: "5px 40px", borderRadius: 9, background: "rgba(255,255,255,.1)", fontFamily: "UIR", fontSize: 19, color: "rgba(255,255,255,.88)" }}>folliesdapresmidi.com</div>
        </div>
        <Img src={staticFile("rec/0091.jpg")} style={{ width: 980, height: 612, display: "block" }} />
      </div>
      {/* the pay-once sticker on the window's corner */}
      <div style={{ position: "absolute", left: 745, top: 525, width: 300, height: 300, borderRadius: 999, background: C.yellow, color: C.ink, display: "grid", placeItems: "center", textAlign: "center", transform: "rotate(12deg)", boxShadow: "0 20px 40px rgba(0,0,0,.45)", border: `5px solid ${C.ink}` }}>
        <div>
          <div style={{ ...M, fontSize: 18, color: C.ink }}>No subscription</div>
          <div style={{ ...D, fontSize: 46, marginTop: 10 }}>Pay once.</div>
          <div style={{ ...D, fontSize: 30, marginTop: 6, color: C.uv }}>Own it forever</div>
        </div>
      </div>
      <Img src={staticFile("cut/01.png")} style={{ position: "absolute", left: -20, bottom: -60, height: 1180, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }} />
      <div style={{ position: "absolute", left: 680, top: 1170 }}>
        <DevBags width={360} t={0} face={{ brow: 18, lid: 0.05, smile: 1, look: -8, happy: 1 }} />
      </div>
    </AbsoluteFill>
  );
};
