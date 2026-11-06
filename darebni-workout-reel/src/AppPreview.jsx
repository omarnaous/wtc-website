// Darebni AI App Store app preview (886x1920, the accepted portrait size for iPhone; also a 1080x1920 cut for social), built
// to Apple's app-preview rules: only content from inside the app (real screens, no device frame, no hands), copy for
// context since previews autoplay muted, touch hotspots to show interaction, straightforward dissolves between scenes, no
// prices or dated claims, and a subscription disclosure in the end frame. 26 s at 30 fps. Screens: public/preview/
// (the real app screens with a clean status bar, from tools/mockups/devices.py; gitignored).
//
// App Review expects footage captured on device. These scenes are the real screens as stills; swap each <Screen> for a
// screen recording (OffthreadVideo of the same scene) before submitting, keeping the captions and timing.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, clamp } from "./fx.jsx";
import { B, D, UI } from "./Main.jsx";

// scenes: [screen, caption line 1, caption line 2 (accent), tap hotspots [frame offset, x, y] in screen fractions]
const SCENES = [
  ["onboarding", "Built", "around you", [[78, 0.46, 0.925]]],
  ["home", "Your week,", "planned", [[90, 0.43, 0.322]]],
  ["logging", "Log every set,", "live", [[60, 0.84, 0.437], [112, 0.61, 0.548]]],
  ["analytics", "Weekly", "AI analysis", [[84, 0.5, 0.515]]],
  ["pinned", "Track every", "PR", [[80, 0.49, 0.906]]],
];
const LEN = 138, X = 18;                       // frames per scene, dissolve length
export const AP = { DURATION: SCENES.length * LEN + 90 };
const END = SCENES.length * LEN;
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });

function Scene({ f, i, W, H }) {
  const [name, a, b, taps] = SCENES[i], start = i * LEN, t = f - start;
  if (t < -X || t > LEN + X) return null;
  const o = interpolate(t, [-X, 0, LEN - 2, LEN + X - 2], [0, 1, 1, 0], clamp);
  // the screen at its native proportions (1206x2622), as large as fits under the caption
  const sh = H - 470, sw = sh * (1206 / 2622), sx = (W - sw) / 2, sy = 390;
  const cap = sp(t, 2, 14, 200);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 150, textAlign: "center", opacity: Math.min(1, cap * 2), transform: `translateY(${(1 - Math.min(1, cap)) * 30}px)` }}>
        <div style={{ ...D, fontSize: W > 950 ? 108 : 96, color: B.cream }}>{a} <span style={{ color: i % 2 ? B.success : B.lo }}>{b}</span></div>
      </div>
      <div style={{ position: "absolute", left: sx, top: sy, width: sw, height: sh, borderRadius: 54, overflow: "hidden", border: "2px solid rgba(139,128,255,.35)" }}>
        <Img src={staticFile(`preview/${name}.jpg`)} style={{ width: sw, height: sh, display: "block" }} />
        {taps.map(([at, x, y], k) => {
          const u = t - at; if (u < -6 || u > 26) return null;
          const p = interpolate(u, [0, 22], [0, 1], clamp), press = interpolate(u, [-6, 0, 6], [0, 1, 0.6], clamp);
          return (
            <div key={k} style={{ position: "absolute", left: x * sw, top: y * sh }}>
              <div style={{ position: "absolute", width: 70, height: 70, marginLeft: -35, marginTop: -35, borderRadius: 35, background: "rgba(255,255,255,.55)", border: "3px solid rgba(91,78,229,.7)", opacity: press * (1 - p) + (u < 0 ? press : 0), transform: `scale(${0.8 + 0.2 * press})` }} />
              <div style={{ position: "absolute", width: 70, height: 70, marginLeft: -35, marginTop: -35, borderRadius: 35, border: "4px solid rgba(255,255,255,.9)", opacity: u >= 0 ? 1 - p : 0, transform: `scale(${1 + p * 1.4})` }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function EndFrame({ f, W }) {
  const t = f - END - X + 4; if (t < 0) return null;
  const o = interpolate(t, [0, 12], [0, 1], clamp), icon = sp(t, 2, 12, 180);
  return (
    <AbsoluteFill style={{ opacity: o, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("darebni-icon.png")} style={{ width: 260, height: 260, borderRadius: 60, opacity: Math.min(1, icon * 2), transform: `scale(${0.85 + 0.15 * Math.min(1, icon)})` }} />
      <div style={{ ...D, fontSize: 120, color: B.cream, marginTop: 50 }}>Darebni <span style={{ color: B.lo }}>AI</span></div>
      <div style={{ ...UI, fontSize: 46, color: "rgba(242,240,234,.85)", marginTop: 18 }}>Your AI workout coach</div>
      <div style={{ ...UI, fontFamily: "BarlowR", fontSize: 28, color: "rgba(242,240,234,.6)", marginTop: 90, textAlign: "center", padding: "0 80px", lineHeight: 1.35 }}>
        Some features require a Darebni AI Pro subscription.<br />Free trial available.
      </div>
    </AbsoluteFill>
  );
}

export const AppPreview = ({ music = true }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(91,78,229,.38), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {SCENES.map((_, i) => <Scene key={i} f={f} i={i} W={W} H={H} />)}
      <EndFrame f={f} W={W} />
      {music && <Audio src={staticFile("apppreview.wav")} />}
    </AbsoluteFill>
  );
};
