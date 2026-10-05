// Starter scene: build-up, silent beat, impact, subtitle, breathing hold.
// Replace freely; keep frame-driven animation and width/height-relative layout.
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Streak, RgbSplit, Grain, Vignette } from "./fx.jsx";

const C = { ink: "#0A0913", paper: "#F3F1FA", accent: "#8F72FF", accent2: "#74C6FF" };

export const Main = ({ title, subtitle }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const cx = width / 2, cy = height * 0.46;
  const unit = width / 1080;

  const glow = interpolate(f, [T.intro, T.silence - 4, T.silence, T.hit, T.hit + 30], [0.1, 0.5, 0.05, 1, 0.5], clamp);
  const seed = spring({ frame: f - T.intro, fps, config: { damping: 9 } });
  const collapse = interpolate(f, [T.silence - 10, T.silence], [0, 1], { ...clamp, easing: easeIn });
  const slam = interpolate(spring({ frame: f - T.hit, fps, config: { damping: 11, stiffness: 210 } }), [0, 1], [1.45, 1]);
  const blur = f < T.hit ? 0 : interpolate(f - T.hit, [0, 5], [14, 0], clamp);
  const ca = f < T.hit ? 0 : 16 * Math.exp(-(f - T.hit) / 4);
  const [sx, sy] = shake(f, T.hit);
  const push = interpolate(f, [T.hit, 180], [1, 1.04], clamp);
  const sub = interpolate(f, [T.sub, T.sub + 18], [0, 1], { ...clamp, easing: easeOut });

  const titleEl = (
    <div style={{ fontFamily: "Display", fontWeight: 600, fontSize: 220 * unit, letterSpacing: "-0.05em", color: "var(--fx-fill, " + C.paper + ")", textAlign: "center", lineHeight: 1 }}>{title}</div>
  );

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(91,43,255,${0.55 * glow}), transparent 60%)` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${push})`, transformOrigin: `${cx}px ${cy}px` }}>
        {f >= T.intro && f < T.silence && (
          <div style={{ position: "absolute", left: cx - 14, top: cy - 14, width: 28, height: 28, borderRadius: 99, background: C.paper, boxShadow: `0 0 60px 20px ${C.accent}`, transform: `scale(${seed * (1 - collapse)})` }} />
        )}
        {f >= T.hit && (
          <div style={{ position: "absolute", left: 0, right: 0, top: cy - 120 * unit, height: 240 * unit, transform: `scale(${slam})`, filter: `blur(${blur}px)` }}>
            <RgbSplit px={ca}>{titleEl}</RgbSplit>
          </div>
        )}
        <Shockwave f={f} cx={cx} cy={cy} start={T.hit} max={Math.max(width, height) * 0.9} width={10} />
        <Streak f={f} start={T.hit} y={cy} color={C.accent} />
        <Burst f={f} cx={cx} cy={cy} start={T.hit} count={100} speed={40 * unit} colors={["#fff", C.accent, C.accent2]} />
        <div style={{ position: "absolute", left: 0, right: 0, top: cy + 170 * unit, textAlign: "center", fontFamily: "Mono", fontSize: 34 * unit, letterSpacing: "0.22em", color: C.paper, opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>{subtitle}</div>
      </AbsoluteFill>
      <Flash f={f} start={T.hit} />
      <Vignette />
      <Grain f={f} />
    </AbsoluteFill>
  );
};
