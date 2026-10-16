// Instagram highlight cover for the price list: the Stories' receipt as an icon. Instagram crops the middle into a
// circle, so everything sits inside a centred 640 px circle; the rest is background.
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { sparkPath } from "./brand.js";

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
      <AbsoluteFill style={{ transform: "scale(1.35)", transformOrigin: "50% 50%" }}>
      <div style={{ position: "absolute", left: (W - w) / 2, top: (H - h) / 2 + 10, width: w, height: h, transform: "rotate(-7deg)", filter: "drop-shadow(0 30px 40px rgba(10,9,19,.45))" }}>
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
      <svg width={120} height={120} viewBox="0 0 100 100" style={{ position: "absolute", left: W / 2 + 120, top: H / 2 - 250 }}><path d={sparkPath(50, 50, 48, 0.22)} fill={dark ? IRIS : "#fff"} /></svg>
      <svg width={54} height={54} viewBox="0 0 100 100" style={{ position: "absolute", left: W / 2 - 230, top: H / 2 + 150 }}><path d={sparkPath(50, 50, 48, 0.22)} fill={dark ? "#74C6FF" : "rgba(255,255,255,.75)"} /></svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
