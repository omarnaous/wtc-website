// "Every Lebanese kid knows this sound." Spec ad for Tarboosh (unofficial, not affiliated with Gandour).
// The foil peels open petal by petal, the chocolate shell cracks, a beat of silence, it bursts in slow motion and the
// marshmallow squishes. Then the tape rewinds it all back into the wrapper: "Some things never change." / "Your ads should."
import { AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { FPS, HOOK_OUT, CRACK, BURST, REWIND, REW_END, NEVER, SHOULD, CREDIT, pt } from "./timing.js";
import { useFonts, clamp, shake, Grain, Vignette } from "./fx.jsx";
import { World } from "./Scene3D.jsx";
import { WORDMARK } from "./brand.js";

export const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", yellow: "#FFD23F", gold: "#F2C14E", red: "#E0283A" };
export const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
export const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, display: "inline-block" });
export const FONTS = [["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }]];

export function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}
const Words = ({ f, at, text, gap = 4, style, accent = [], color }) => (
  <div style={{ ...D, ...style, whiteSpace: "nowrap" }}>
    {text.split(" ").map((w, i) => <span key={i} style={{ ...pop(sp(f, at + i * gap, 11, 280), 1.5), marginRight: i < text.split(" ").length - 1 ? "0.24em" : 0, color: accent.includes(i) ? color : "#fff" }}>{w}</span>)}
  </div>
);

export function Backdrop({ f, p }) {
  const end = f >= SHOULD;
  const heat = p >= BURST ? 0.25 * Math.exp(-(p - BURST) / 10) : 0;
  return end ? (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 50% at 50% 56%, #7A55FF 0%, #4A1FE0 38%, #1C0A6E 75%, #0B0530 100%)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 34% 6% at 50% 71%, rgba(10,4,40,.55), transparent 70%)" }} />
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 50% at 50% 56%, #3B1610 0%, #1A0907 46%, #080303 100%)" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 30% at 50% 56%, rgba(224,40,58,${0.22 + heat}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 30% 5% at 50% 71%, rgba(0,0,0,.6), transparent 70%)" }} />
    </AbsoluteFill>
  );
}

function SoundOn({ f }) {
  const o = interpolate(f, [2, 8, HOOK_OUT - 6, HOOK_OUT], [0, 1, 1, 0], clamp);
  const pulse = 1 + 0.06 * Math.max(0, Math.sin(f / 3));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 232, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 26px", borderRadius: 99, background: "rgba(255,255,255,.1)", border: "2px solid rgba(255,255,255,.25)", ...M, fontSize: 24, color: "#fff" }}>
        <svg width="34" height="30" viewBox="0 0 34 30" style={{ transform: `scale(${pulse})` }}><path d="M2 10h6l8-7v24l-8-7H2z" fill="#fff" /><path d="M21 9q4 6 0 12M25 5q8 10 0 20" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" /></svg>
        Sound on
      </div>
    </div>
  );
}
function Hook({ f }) {
  const out = interpolate(f, [HOOK_OUT - 8, HOOK_OUT], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 340, textAlign: "center", opacity: 1 - out, transform: `translateY(${-out * 40}px)`, textShadow: "0 8px 40px rgba(0,0,0,.6)" }}>
      <Words f={f} at={4} text="Every Lebanese kid" style={{ fontSize: 86 }} />
      <Words f={f} at={16} text="knows this sound." style={{ fontSize: 112, marginTop: 18 }} accent={[2]} color={C.gold} />
    </div>
  );
}
function SpecTag({ f }) {
  return (
    <div style={{ position: "absolute", left: 64, top: 150, ...M, fontSize: 20, color: "rgba(255,255,255,.6)", opacity: interpolate(f, [0, 10], [0, 1], clamp) * (f >= SHOULD || (f >= REWIND && f <= REW_END + 4) ? 0 : 1) }}>
      Spec ad · unofficial
    </div>
  );
}
function SlowMo({ f }) {
  if (f < BURST + 4 || f > REWIND) return null;
  const o = interpolate(f, [BURST + 4, BURST + 10, REWIND - 6, REWIND], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1680, textAlign: "center", opacity: o, ...M, fontSize: 24, color: "rgba(255,255,255,.75)" }}>
      <i style={{ display: "inline-block", width: 12, height: 12, borderRadius: 9, background: C.red, marginRight: 14, opacity: Math.floor(f / 10) % 2 ? 1 : 0.3 }} />Slow motion · 0.3×
    </div>
  );
}
// VHS rewind: tracking band, scanlines, a "◀◀" label
function Rewind({ f }) {
  if (f < REWIND || f > REW_END + 4) return null;
  const t = f - REWIND, band = (t * 83) % 2200 - 200;
  return (
    <>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 3px, transparent 3px 6px)", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: band, height: 120, background: "linear-gradient(180deg, transparent, rgba(255,255,255,.18) 40%, rgba(255,255,255,.32) 50%, rgba(255,255,255,.18) 60%, transparent)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: (band + 900) % 2000, height: 18, background: "rgba(255,255,255,.25)", filter: "blur(2px)" }} />
      <div style={{ position: "absolute", left: 64, top: 150, display: "flex", alignItems: "center", gap: 16, ...M, fontSize: 34, color: "#fff", textShadow: "2px 0 rgba(255,40,80,.8), -2px 0 rgba(60,200,255,.8)" }}>
        <svg width="64" height="36" viewBox="0 0 64 36"><path d="M32 2 L4 18 L32 34 Z M60 2 L32 18 L60 34 Z" fill="#fff" /></svg>
        Rewind
      </div>
    </>
  );
}
function Never({ f }) {
  if (f < NEVER || f >= SHOULD) return null;
  const out = interpolate(f, [SHOULD - 5, SHOULD], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 340, textAlign: "center", opacity: 1 - out, transform: `scale(${1 - out * 0.15})`, textShadow: "0 8px 40px rgba(0,0,0,.6)" }}>
      <Words f={f} at={NEVER} text="Some things" style={{ fontSize: 96 }} />
      <Words f={f} at={NEVER + 10} text="never change." style={{ fontSize: 112, marginTop: 16 }} accent={[1]} color={C.gold} />
    </div>
  );
}
export function Should({ f }) {
  const a = sp(f, SHOULD, 10, 260), b = sp(f, SHOULD + 7, 8, 300);
  const breathe = 1 + 0.015 * Math.sin(Math.max(0, f - SHOULD - 20) / 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", transform: `scale(${breathe})` }}>
      <div style={{ ...D, fontSize: 120, color: "#fff", ...pop(a, 1.4) }}>Your ads</div>
      <div style={{ ...D, fontSize: 196, color: C.yellow, marginTop: 6, ...pop(b, 1.8), textShadow: "0 0 70px rgba(255,210,63,.45)" }}>should.</div>
    </div>
  );
}
export function Credit({ f }) {
  const a = sp(f, CREDIT, 12, 200), b = sp(f, CREDIT + 8, 12, 200);
  const w = 250, h = (w * 1167) / 3224;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1490, display: "grid", justifyItems: "center" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 22, ...pop(a, 1.3) }}>
        <span style={{ ...M, fontSize: 28, lineHeight: 1, paddingBottom: 7, color: "rgba(255,255,255,.8)" }}>Spec ad by</span>
        <svg width={w} height={h} viewBox={WORDMARK.viewBox} style={{ marginBottom: -h * 0.214 }}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.yellow} /></svg>
      </div>
      <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.75)", marginTop: 26, ...pop(b, 1.2) }}>@appifylb · 3D product ads &amp; motion</div>
      <div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 22, color: "rgba(255,255,255,.45)", marginTop: 22, opacity: Math.min(1, b * 2) }}>Unofficial concept. Not affiliated with Gandour.</div>
    </div>
  );
}

export const Main = () => {
  const ready = useFonts(FONTS);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const p = pt(f);
  const s1 = shake(f, CRACK, 16, 3), s2 = shake(f, BURST, 26, 5), s3 = shake(f, SHOULD, 18, 4);
  const sh = [s1[0] + s2[0] + s3[0], s1[1] + s2[1] + s3[1]];
  const punch = 1 + (f >= CRACK ? 0.04 * Math.exp(-(f - CRACK) / 4) : 0) + (f >= SHOULD ? 0.05 * Math.exp(-(f - SHOULD) / 5) : 0);
  const rew = f >= REWIND && f <= REW_END;
  const jitter = rew ? (random(`j${f}`) - 0.5) * 18 : 0;
  const flash = Math.max(f >= BURST && f < BURST + 8 ? interpolate(f - BURST, [0, 1, 7], [0.55, 0.3, 0], clamp) : 0,
    f >= SHOULD && f < SHOULD + 8 ? interpolate(f - SHOULD, [0, 1, 7], [0.6, 0.3, 0], clamp) : 0,
    f >= CRACK && f < CRACK + 4 ? interpolate(f - CRACK, [0, 3], [0.25, 0], clamp) : 0);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Backdrop f={f} p={p} />
      <AbsoluteFill style={{ transform: `scale(${punch}) translateX(${jitter}px)`, filter: rew ? "saturate(1.4) contrast(1.15) hue-rotate(-8deg)" : "none" }}>
        {ready && (
          <ThreeCanvas width={W} height={H} camera={{ fov: 30, position: [0, 2.4, 9.4], near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
            <World f={f} p={p} shake={sh} />
          </ThreeCanvas>
        )}
      </AbsoluteFill>
      <Stage W={W} H={H}>
        <SpecTag f={f} />
        {f < HOOK_OUT && <><SoundOn f={f} /><Hook f={f} /></>}
        <SlowMo f={f} />
        <Rewind f={f} />
        <Never f={f} />
        {f >= SHOULD && <Should f={f} />}
        {f >= CREDIT && <Credit f={f} />}
      </Stage>
      {flash > 0 && <AbsoluteFill style={{ background: f >= SHOULD ? "#E8E0FF" : "#FFE2C4", opacity: flash, mixBlendMode: "screen" }} />}
      <Audio src={staticFile("sound.wav")} />
      <Vignette strength={0.28} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};
