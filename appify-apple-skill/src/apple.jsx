// Apple-style kit for Remotion. Copy into src/ of a project (with the Inter fonts from assets/fonts into public/).
// Read references/rules.md first: these pieces encode its rules (critically damped springs, motion worked out from the
// start of the film, symmetric paths, size-specific tracking, one caption per scene, translucent materials).
import { useEffect, useState } from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig, staticFile, delayRender, continueRender } from "remotion";

// Load fonts from public/ before the first frame renders: useFonts(fonts) at the top of the main composition.
export function useFonts(faces) {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(faces.map(([family, file, desc]) => new FontFace(family, `url(${staticFile(file)})`, desc).load()))
      .then((loaded) => { loaded.forEach((ff) => document.fonts.add(ff)); continueRender(handle); })
      .catch((e) => { console.error(e); continueRender(handle); });
  }, []);
}
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// ── Apple springs ───────────────────────────────────────────────────────────────────────────────────
// Apple specifies a spring as (damping ratio, response in seconds). Remotion wants mass/stiffness/damping.
// stiffness = (2π / response)², damping = 4π · ratio / response (mass 1). Ratio 1 = no overshoot (the default);
// use ~0.8 only when something was thrown or flicked.
export const appleConfig = (ratio = 1, response = 0.4) => ({ mass: 1, stiffness: (2 * Math.PI / response) ** 2, damping: (4 * Math.PI * ratio) / response, overshootClamping: false });
export const aspring = (f, at, ratio = 1, response = 0.4, fps = 30) => (f < at ? 0 : spring({ frame: f - at, fps, config: appleConfig(ratio, response) }));
// "Work motion out from the start of the film": a value that changes target several times, each change springing from
// wherever the value is right now (the presentation value), never jumping. keys = [[frame, target], ...] in time order.
export function chain(f, keys, ratio = 1, response = 0.4, fps = 30) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * aspring(f, keys[i][0], ratio, response, fps);
  return v;
}
// Mirrored easing for reversible moves (in and out along the same path): use these as the two halves.
export const easeIn = [0.32, 0, 0.67, 0], easeOut = [0.33, 1, 0.68, 1];

// ── type ────────────────────────────────────────────────────────────────────────────────────────────
// Inter stands in for SF Pro (which cannot be bundled). Tracking is size-specific: tight on display, ~0 on body.
export const FONT = "'Inter', -apple-system, 'Helvetica Neue', sans-serif";
export const type = (px) => ({ fontFamily: FONT, fontSize: px, fontWeight: px >= 64 ? 600 : px >= 28 ? 500 : 400,
  letterSpacing: px >= 96 ? "-0.035em" : px >= 48 ? "-0.022em" : px >= 24 ? "-0.01em" : "0.005em", lineHeight: px >= 64 ? 1.05 : 1.35 });
export const fonts = [["Inter", "inter-latin-400-normal.woff2", { weight: "400" }], ["Inter", "inter-latin-500-normal.woff2", { weight: "500" }],
  ["Inter", "inter-latin-600-normal.woff2", { weight: "600" }], ["Inter", "inter-latin-700-normal.woff2", { weight: "700" }]];

// One caption per scene, centred, with the last word or two tinted a lighter shade of the wallpaper.
export function Caption({ f, at, text, tintWords = 2, tint = "rgba(255,255,255,.62)", size = 64, top, color = "#fff" }) {
  const { height } = useVideoConfig();
  const p = aspring(f, at, 1, 0.5), words = text.split(" "), cut = Math.max(0, words.length - tintWords);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: top ?? height * 0.56, textAlign: "center", ...type(size), color,
      opacity: p, transform: `translateY(${(1 - p) * 18}px)`, filter: `blur(${(1 - p) * 6}px)` }}>
      {words.slice(0, cut).join(" ")}{cut ? " " : ""}<span style={{ color: tint }}>{words.slice(cut).join(" ")}</span>
    </div>
  );
}

// Full-screen gradient wallpaper (macOS style): two soft radial blooms over a base. Cross-fade between scenes.
export function Wallpaper({ base = "#0B1E4A", a = "#2F6BFF", b = "#9B5CFF", drift = 0, opacity = 1 }) {
  return (
    <AbsoluteFill style={{ opacity, background: `radial-gradient(ellipse 80% 70% at ${30 + drift * 4}% 85%, ${a}, transparent 70%), radial-gradient(ellipse 70% 60% at ${75 - drift * 3}% 20%, ${b}, transparent 70%), ${base}` }} />
  );
}

// A thin macOS menu bar with the notch in its centre. Keep it to five menu items or fewer.
export function MenuBar({ items = ["Finder", "File", "Edit", "View", "Window"], right = ["", "", ""], clock = null, opacity = 1, glyph = true }) {
  const { width } = useVideoConfig(), u = width / 1920;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 34 * u, display: "flex", alignItems: "center", padding: `0 ${22 * u}px`, gap: 22 * u,
      background: "rgba(0,0,0,.28)", backdropFilter: "blur(30px) saturate(180%)", ...type(15 * u), fontWeight: 500, color: "rgba(255,255,255,.92)", opacity }}>
      {glyph && <svg width={15 * u} height={18 * u} viewBox="0 0 15 18"><path d="M12.4 9.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.6-.8-2.7-.7C4 4.8 2.7 5.6 2 6.9.5 9.5 1.6 13.3 3.1 15.4c.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.3-.9-2.3-3.5zM10.3 3.4c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.6 1.3-.6.7-1 1.6-.9 2.6 1 .1 2-.5 2.6-1.2z" fill="currentColor" /></svg>}
      {items.map((m, i) => <span key={m} style={{ fontWeight: i === 0 ? 700 : 500 }}>{m}</span>)}
      <span style={{ marginLeft: "auto", display: "flex", gap: 18 * u, alignItems: "center" }}>
        {right.map((_, i) => <i key={i} style={{ width: 16 * u, height: 10 * u, borderRadius: 3 * u, border: `${1.5 * u}px solid rgba(255,255,255,.85)` }} />)}
        {clock && <span>{clock}</span>}
      </span>
    </div>
  );
}

// The black notch at the top centre. Width and height spring on their OWN curves (open soft, close without overshoot):
// pass keys for each, worked out from the start of the film with chain(). Children render inside the open notch.
export function Notch({ f, wKeys, hKeys, radius = 18, children, contentAt = 0 }) {
  const { width } = useVideoConfig(), u = width / 1920;
  const w = chain(f, wKeys, 0.86, 0.45) * u, h = chain(f, hKeys, 0.9, 0.5) * u;
  const show = aspring(f, contentAt, 1, 0.35);
  return (
    <div style={{ position: "absolute", left: "50%", top: 0, width: w, height: h, transform: "translateX(-50%)", background: "#000",
      borderRadius: `0 0 ${Math.min(h / 2, radius * u * (h > 60 * u ? 2.2 : 1))}px ${Math.min(h / 2, radius * u * (h > 60 * u ? 2.2 : 1))}px`, overflow: "hidden",
      boxShadow: h > 60 * u ? `0 ${24 * u}px ${60 * u}px rgba(0,0,0,.35)` : "none" }}>
      <div style={{ position: "absolute", inset: 0, opacity: show, filter: `blur(${(1 - show) * 8}px)` }}>{children}</div>
    </div>
  );
}

// A translucent material (glass) card: blur + saturation, bright top edge. Materialize: blur and scale together.
export function Glass({ f, at, style, children, dark = true }) {
  const p = aspring(f, at, 1, 0.45);
  return (
    <div style={{ position: "absolute", borderRadius: 28, background: dark ? "rgba(30,30,36,.55)" : "rgba(255,255,255,.55)", backdropFilter: `blur(${30 * p}px) saturate(180%)`,
      borderTop: `1px solid rgba(255,255,255,${dark ? 0.18 : 0.6})`, boxShadow: "0 30px 80px rgba(0,0,0,.35)", opacity: p, transform: `scale(${0.94 + 0.06 * p})`, ...style }}>
      {children}
    </div>
  );
}

// Placeholder copy inside widgets: grey lines, never invented words (widgets add no claims).
export const Lines = ({ n = 3, w = [1, 0.8, 0.6], h = 10, gap = 10, color = "rgba(255,255,255,.18)" }) => (
  <div style={{ display: "grid", gap }}>{Array.from({ length: n }, (_, i) => <i key={i} style={{ height: h, width: `${(w[i] ?? 0.7) * 100}%`, borderRadius: h, background: color }} />)}</div>
);

// The Mac "hello" opener: a white script line drawn on with a stroke reveal. Pass any SVG path (a handwritten word).
export function Hello({ f, at, d, dur = 54, width = 700, viewBox = "0 0 700 260", stroke = 10 }) {
  const p = interpolate(f - at, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 2.2) });
  return (
    <svg width={width} viewBox={viewBox} style={{ overflow: "visible" }}>
      <path d={d} fill="none" stroke="#fff" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
}
// A handwritten "hello" in one continuous stroke (700 x 260 box), for Hello.
export const HELLO_D = "M40,190 C70,150 95,80 92,48 C90,24 66,30 62,64 C58,110 54,160 50,205 C64,160 92,128 116,132 C138,136 128,180 132,202 C160,192 200,172 210,152 C218,134 200,120 186,134 C170,150 172,196 202,200 C226,203 242,190 254,176 C280,140 320,90 330,58 C338,32 318,26 312,52 C302,92 300,170 318,196 C332,212 352,196 366,176 C392,140 420,90 430,58 C438,32 418,26 412,52 C402,92 400,170 418,196 C432,212 452,196 466,176 C478,160 500,140 524,142 C552,146 560,180 540,198 C520,214 492,200 496,176 C500,150 532,138 560,146 C584,152 600,164 630,158";
