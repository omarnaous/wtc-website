import { WORDMARK } from "./brand.js";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, easeOut } from "./fx.jsx";

export const C = {
  ink: "#0A0913", ink2: "#17142B", ink3: "#221D40", paper: "#F3F1FA", grid: "rgba(91,43,255,.10)", gridMajor: "rgba(91,43,255,.20)",
  uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", alert: "#F0384F", coral: "#FF6A3D", mute: "#6D6788",
};
export const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
export const DISPLAY = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
export const MONO = { fontFamily: "Mono", letterSpacing: "0.08em" };

// Words rise out of a mask, staggered. `colors` maps a word index to a colour.
export function Words({ text, start = 0, size = 96, color = C.ink, colors = {}, y, stagger = 4, align = "center", width = 1080, style }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: 0, width, top: y, display: "flex", flexWrap: "wrap", justifyContent: align, gap: `0 ${size * 0.26}px`, padding: "0 70px", boxSizing: "border-box", ...DISPLAY, fontSize: size, ...style }}>
      {words.map((w, i) => {
        const p = spring({ frame: f - start - i * stagger, fps, config: { damping: 14, stiffness: 200 } });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - Math.min(p, 1)) * 110}%)`, color: colors[i] ?? color }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
}

// Fade + slide out at the end of a scene.
export const exitStyle = (f, start, dur = 10, dy = -80) => {
  const p = interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: easeOut });
  return { opacity: 1 - p, transform: `translateY(${p * dy}px)` };
};

// The thermal-printer head both receipts come out of.
export function Printer({ y, width = 780 }) {
  return (
    <div style={{ position: "absolute", left: (1080 - width) / 2, top: y, width, height: 92, borderRadius: 28, background: "linear-gradient(180deg,#2B2645,#15122A)", boxShadow: "0 30px 60px rgba(10,9,19,.35), inset 0 2px 0 rgba(255,255,255,.12)" }}>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 18, height: 10, borderRadius: 6, background: "#05040B" }} />
      <div style={{ position: "absolute", right: 34, top: 22, width: 14, height: 14, borderRadius: 9, background: "#3BE38B", boxShadow: "0 0 12px #3BE38B" }} />
    </div>
  );
}

// A mock online store. Every prop is animatable.
export function Store({ w = 760, h = 980, accent = C.uv, accent2 = C.sky, radius = 22, cols = 2, dark = false, style }) {
  const bg = dark ? C.ink2 : "#FFFFFF", fg = dark ? C.paper : C.ink, sub = dark ? "rgba(243,241,250,.55)" : "rgba(10,9,19,.5)";
  const products = [["Runner 01", 89], ["Daypack", 64], ["Cap", 29], ["Bottle", 24], ["Hoodie", 72], ["Socks", 12]];
  const shown = products.slice(0, cols * 2);
  return (
    <div style={{ width: w, height: h, borderRadius: radius + 12, background: bg, overflow: "hidden", boxShadow: "0 50px 100px rgba(0,0,0,.4)", fontFamily: "Display", color: fg, ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 34px" }}>
        <span style={{ fontWeight: 600, fontSize: 30, letterSpacing: "-0.03em" }}>yourbrand</span>
        <span style={{ display: "flex", gap: 22, fontSize: 20, color: sub }}><span>Shop</span><span>New</span><span>About</span><span style={{ color: accent }}>Cart (2)</span></span>
      </div>
      <div style={{ margin: "0 26px", height: h * 0.3, borderRadius: radius, background: `linear-gradient(130deg, ${accent}, ${accent2})`, padding: 30, display: "flex", flexDirection: "column", justifyContent: "flex-end", color: "#fff" }}>
        <span style={{ fontSize: 22, opacity: 0.8, fontFamily: "Mono", letterSpacing: "0.12em" }}>NEW DROP</span>
        <span style={{ fontSize: 54, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>Built different.</span>
        <span style={{ marginTop: 16, alignSelf: "flex-start", padding: "12px 22px", borderRadius: 99, background: "#fff", color: C.ink, fontSize: 20, fontWeight: 600 }}>Shop now</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18, padding: 26 }}>
        {shown.map(([n, p], i) => (
          <div key={n} style={{ borderRadius: radius, background: dark ? C.ink3 : "#F4F2F8", padding: 14 }}>
            <div style={{ height: cols === 3 ? 120 : 170, borderRadius: Math.max(4, radius - 8), background: i % 2 ? `${accent2}55` : `${accent}33`, display: "grid", placeItems: "center" }}>
              <div style={{ width: "46%", height: "46%", borderRadius: i % 3 === 0 ? 999 : radius * 0.6, background: i % 2 ? accent2 : accent }} />
            </div>
            <div style={{ marginTop: 10, fontSize: cols === 3 ? 17 : 21, fontWeight: 600 }}>{n}</div>
            <div style={{ fontSize: cols === 3 ? 15 : 18, color: sub }}>${p}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// The wordmark as the brand name reads in this video: "appify-lb". WORDMARK letters are Sora 600 at
// 1000 units/em on a 0 baseline, so "-lb" is set in the same face right after them.
export const LB_W = 4540;
export const LB_VIEWBOX = `-20 -917 ${LB_W + 40} 1167`;
export const lbSvg = (fill, sparkFill) =>
  `<path d="${WORDMARK.letters}" fill="${fill}"/><path d="${WORDMARK.spark}" fill="${sparkFill}"/>` +
  `<text x="3200" y="0" font-family="Display" font-weight="600" font-size="1000" letter-spacing="-20" fill="${fill}">-lb</text>`;
