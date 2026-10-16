// Instagram highlight cover for the price list: Dev pointing up at the Stories' receipt. Instagram crops the middle
// into a circle, so Dev's head, his pointing hand and the receipt all sit inside the centred circle.
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

const UV = "#5B2BFF", IRIS = "#8F72FF", INK = "#0A0913", PAPER = "#F3F1FA";

export const Cover = ({ dark = false }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }]]);
  const { width: W, height: H } = useVideoConfig();
  const bg = dark
    ? `radial-gradient(circle at 50% 50%, rgba(91,43,255,.55), transparent 42%), ${INK}`
    : `radial-gradient(circle at 50% 42%, #7B57FF, ${UV} 38%, #3A1BB0 75%, #22106E)`;
  const w = 330, h = 420; // receipt
  const zig = Array.from({ length: 13 }, (_, k) => `${(k / 12) * 100}% ${k % 2 ? 0 : 16}px`).join(",");
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={W / 2} cy={H / 2} r={420} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={3} strokeDasharray="4 14" />
      </svg>
      {/* Dev: head and shoulders fill the circle, pointing up at the receipt */}
      <div style={{ position: "absolute", left: 70, top: 560 }}>
        <Dev width={760} point={1} brow={18} lid={0.05} smile={1} happy={0.6} look={7} tilt={-4} />
      </div>
      {/* the receipt from the Stories, small, top right */}
      <div style={{ position: "absolute", left: 700, top: 640, width: w, height: h, transform: "rotate(9deg) scale(0.72)", transformOrigin: "50% 50%", filter: "drop-shadow(0 24px 30px rgba(10,9,19,.5))" }}>
        <div style={{ position: "absolute", inset: 0, background: PAPER, borderRadius: "0 0 22px 22px", clipPath: `polygon(${zig}, 100% 100%, 0 100%)` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 54, textAlign: "center", fontFamily: "Display", fontWeight: 600, fontSize: 150, lineHeight: 1, letterSpacing: "-0.04em", color: UV }}>$</div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: 46, right: 46, top: 236 + i * 50, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: UV, display: "grid", placeItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#CFCAE0", maxWidth: [170, 130, 150][i] }} />
            </div>
          ))}
        </div>
      </div>
      <svg width={76} height={76} viewBox="0 0 100 100" style={{ position: "absolute", left: 610, top: 545 }}><path d={sparkPath(50, 50, 48, 0.22)} fill={dark ? IRIS : "#fff"} /></svg>
      <svg width={48} height={48} viewBox="0 0 100 100" style={{ position: "absolute", left: 140, top: 640 }}><path d={sparkPath(50, 50, 48, 0.22)} fill={dark ? "#74C6FF" : "rgba(255,255,255,.75)"} /></svg>
    </AbsoluteFill>
  );
};
