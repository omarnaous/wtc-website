// Series cut: "Day 1 of making ads for Lebanese brands." Same frame as the website reels (Valmora, Earshot): a blurred
// backdrop, the hook on top, the work in a browser window, the caption + a HUD chip under it, then a spark cut to an
// end card. The window plays the Tarboosh spec ad restyled to the brand's Instagram look (Tarboosh yellow, chocolate, red).
// End card: "Which Lebanese brand is next?" (comments), DM "MOTION", Dev and a chocolate buddy waving.
import { AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { FPS, PEEL0, CRACK, BURST, REWIND, REW_END, NEVER, D1_HOLD, D1_END, pt } from "./timing.js";
import { useFonts, clamp, easeIn, shake, Grain, Vignette } from "./fx.jsx";
import { World } from "./Scene3D.jsx";
import { Dev } from "./Dev.jsx";
import { Buddy } from "./Buddy.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { FONTS, Stage } from "./Main.jsx";

export const T = { yellow: "#F6C424", yellowL: "#FFDA4D", choc: "#2B1608", red: "#E0283A", ink: "#0A0913", gold: "#FFD23F" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const caption = { ...UI, color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.7)", textAlign: "center" };
const Spark = ({ size, color = T.red, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const Fez = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill={T.yellow} /><path d="M12 30 L14 12 Q20 9 26 12 L28 30 Q20 33 12 30 Z" fill={T.red} stroke={T.ink} strokeWidth="2.4" strokeLinejoin="round" /><path d="M20 11 Q22 18 18 24" fill="none" stroke={T.ink} strokeWidth="2" strokeLinecap="round" /></svg>
);
export const WIN = { w: 1052, h: 626 };

// the ad itself, inside the window: Tarboosh-yellow studio, the 3D product, small in-frame labels
export function AdWindow({ g, ready }) {
  const p = pt(g);
  const rew = g >= REWIND && g <= REW_END;
  const look = interpolate(p, [0, 160, 169], [0.62, 0.62, 0.56], clamp);
  return (
    <div style={{ position: "relative", width: WIN.w, height: WIN.h, overflow: "hidden", background: T.yellow }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 55% 75% at 50% 42%, ${T.yellowL} 0%, ${T.yellow} 55%, #E3A00B 100%)` }} />
      <div style={{ position: "absolute", left: "26%", right: "26%", top: "78%", height: 70, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(90,40,0,.35), transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: rew ? `translateX(${(random(`j${g}`) - 0.5) * 14}px)` : "none", filter: rew ? "saturate(1.3) contrast(1.1)" : "none" }}>
        {ready && (
          <ThreeCanvas width={WIN.w} height={WIN.h} camera={{ fov: 30, position: [0, 1.1, 4.2], near: 0.05, far: 40 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
            <World f={g} p={p} zoom={0.44} look={look} />
          </ThreeCanvas>
        )}
      </div>
      <div style={{ position: "absolute", left: 24, top: 20, ...M, fontSize: 15, color: "rgba(43,22,8,.55)" }}>Spec ad · unofficial</div>
      {g >= BURST + 4 && g < REWIND && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", ...M, fontSize: 17, color: T.choc, opacity: interpolate(g, [BURST + 4, BURST + 10, REWIND - 6, REWIND], [0, 1, 1, 0], clamp) }}>
          <i style={{ display: "inline-block", width: 10, height: 10, borderRadius: 9, background: T.red, marginRight: 12, opacity: Math.floor(g / 10) % 2 ? 1 : 0.3 }} />Slow motion · 0.3×
        </div>
      )}
      {rew && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(60,30,0,.14) 0 3px, transparent 3px 6px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: ((g - REWIND) * 47) % 760 - 80, height: 60, background: "linear-gradient(180deg, transparent, rgba(255,255,255,.35), transparent)" }} />
          <div style={{ position: "absolute", left: 24, top: 18, display: "flex", alignItems: "center", gap: 12, ...M, fontSize: 24, color: T.choc, background: T.yellow, padding: "2px 8px" }}>
            <svg width="44" height="24" viewBox="0 0 64 36"><path d="M32 2 L4 18 L32 34 Z M60 2 L32 18 L60 34 Z" fill={T.choc} /></svg>Rewind
          </div>
        </>
      )}
    </div>
  );
}
export function Window({ g, ready, style }) {
  return (
    <div style={{ width: WIN.w, borderRadius: 26, overflow: "hidden", background: "#22140B", boxShadow: "0 50px 120px rgba(0,0,0,.55), 0 0 0 3px rgba(246,196,36,.45)", ...style }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
        <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 10, padding: "5px 16px 5px 8px", borderRadius: 10, background: "rgba(255,255,255,.08)", ...UI, fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,.85)" }}><Fez size={24} />Tarboosh · spec ad</div>
        <div style={{ marginLeft: "auto", ...M, fontSize: 15, color: "rgba(255,255,255,.5)" }}>Made by Appify</div>
      </div>
      <AdWindow g={g} ready={ready} />
    </div>
  );
}
// the blurred backdrop the website reels get from their footage, built from the ad's palette
export function Backdrop({ f }) {
  return (
    <AbsoluteFill style={{ background: "#1E0F07", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "blur(70px)" }}>
        <div style={{ position: "absolute", left: 140, top: 520 + Math.sin(f / 40) * 30, width: 800, height: 760, borderRadius: "50%", background: "rgba(246,196,36,.55)" }} />
        <div style={{ position: "absolute", left: -120 + Math.sin(f / 50) * 40, top: 1150, width: 520, height: 520, borderRadius: "50%", background: "rgba(224,40,58,.32)" }} />
        <div style={{ position: "absolute", left: 700 + Math.cos(f / 45) * 40, top: 200, width: 480, height: 480, borderRadius: "50%", background: "rgba(122,60,20,.6)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.0), rgba(0,0,0,.45))" }} />
    </AbsoluteFill>
  );
}

function Pov({ f, ready, W, H }) {
  const g = Math.min(f, D1_HOLD);
  const s1 = shake(f, CRACK, 12, 3), s2 = shake(f, BURST, 18, 5);
  const punch = 1 + (f >= CRACK ? 0.025 * Math.exp(-(f - CRACK) / 4) : 0) + (f >= BURST ? 0.04 * Math.exp(-(f - BURST) / 5) : 0);
  const swap = f >= NEVER;   // the caption under the window swaps to the payoff on the rewind
  return (
    <AbsoluteFill>
      <Backdrop f={f} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, ...caption }}>
          <div style={{ ...D, fontSize: 98, lineHeight: 1.04, ...pop(sp(f, -6, 11, 300), 1.3) }}>Day 1 of making ads<br />for <span style={{ color: T.gold }}>Lebanese brands</span></div>
        </div>
        <div style={{ position: "absolute", left: 14, top: 600, transform: `translate(${s1[0] + s2[0]}px, ${s1[1] + s2[1]}px) scale(${punch})` }}>
          <Window g={g} ready={ready} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1330, ...caption }}>
          {!swap && f >= 16 && <div style={{ ...D, fontSize: 80, lineHeight: 1.06, ...pop(sp(f, 16, 9, 300), 1.6) }}>Every Lebanese kid<br /><span style={{ color: T.gold }}>knows this sound.</span></div>}
          {swap && <div style={{ ...D, fontSize: 80, lineHeight: 1.06, ...pop(sp(f, NEVER, 9, 300), 1.6) }}>Some things<br /><span style={{ color: T.gold }}>never change.</span></div>}
        </div>
        {f >= 6 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1590, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 28px", borderRadius: 18, background: "rgba(10,9,19,.62)", border: "3px solid rgba(246,196,36,.6)", ...pop(sp(f, 6, 11, 300), 1.3) }}>
              <span style={{ ...M, fontSize: 30, color: T.gold }}>Day 01</span>
              <Fez size={40} />
              <span style={{ ...UI, fontSize: 36, color: "#fff" }}>Tarboosh</span>
              <span style={{ width: 2, height: 34, background: "rgba(255,255,255,.25)" }} />
              <svg width="30" height="26" viewBox="0 0 34 30"><path d="M2 10h6l8-7v24l-8-7H2z" fill="#fff" /><path d="M21 9q4 6 0 12M25 5q8 10 0 20" fill="none" stroke={T.gold} strokeWidth="3" strokeLinecap="round" /></svg>
              <span style={{ ...M, fontSize: 22, color: "rgba(255,255,255,.8)" }}>Sound on</span>
            </div>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
}

// ── end card: Day 01 done, which brand is next, DM, Dev + the chocolate buddy ───────────────────────────
export function EndCard({ t, W, H }) {
  const cta = sp(t, 30, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 40) / 4);
  const devUp = sp(t, 6, 12, 170), budUp = sp(t, 14, 10, 200);
  const hop = t >= 24 ? Math.abs(Math.sin((t - 24) / 5)) : 0;
  const arrow = Math.abs(Math.sin(t / 5)) * 14;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 55% at 50% 40%, ${T.yellowL}, ${T.yellow} 55%, #E3A00B)` }}>
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 18, ...pop(sp(t, 2, 10, 300)) }}>
            <Spark size={44} /><span style={{ ...M, fontSize: 36, color: T.choc, letterSpacing: "0.26em" }}>Day 01 complete</span><Spark size={44} />
          </div>
          <div style={{ ...D, fontSize: 92, color: T.choc, marginTop: 50, ...pop(sp(t, 8, 10, 300)) }}>Which Lebanese brand</div>
          <div style={{ ...D, fontSize: 150, color: T.red, marginTop: 8, ...pop(sp(t, 14, 8, 300), 1.8) }}>is next?</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 34, padding: "16px 34px", borderRadius: 99, background: T.choc, ...UI, fontSize: 38, color: T.gold, ...rise(sp(t, 22, 12, 240)) }}>
            Comment it below
            <svg width="30" height="40" viewBox="0 0 30 40" style={{ transform: `translateY(${arrow - 7}px)` }}><path d="M15 4 V32 M4 22 L15 34 L26 22" fill="none" stroke={T.gold} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 770, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ padding: "20px 50px", borderRadius: 30, background: T.ink, textAlign: "center", boxShadow: "0 20px 60px rgba(90,40,0,.35)" }}>
            <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.7)", letterSpacing: "0.2em" }}>Own a brand? DM</div>
            <div style={{ ...D, fontSize: 74, color: T.gold, marginTop: 6 }}>“MOTION”</div>
            <div style={{ ...UI, fontSize: 28, color: "rgba(255,255,255,.8)", marginTop: 8 }}>for an ad like this</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1085, display: "grid", justifyItems: "center", gap: 10, ...rise(sp(t, 40, 12, 220)) }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <span style={{ ...M, fontSize: 22, lineHeight: 1, paddingBottom: 6, color: T.choc }}>Spec ad by</span>
            <svg viewBox={WORDMARK.viewBox} width={200} height={200 * 1167 / 3224} style={{ marginBottom: -200 * 1167 / 3224 * 0.214 }}><path d={WORDMARK.letters} fill={T.choc} /><path d={WORDMARK.spark} fill={T.red} /></svg>
            <span style={{ ...M, fontSize: 22, lineHeight: 1, paddingBottom: 6, color: T.choc }}>@appifylb</span>
          </div>
          <div style={{ ...UI, fontWeight: 400, fontSize: 21, color: "rgba(43,22,8,.6)" }}>Unofficial concept. Not affiliated with Gandour or Tarboosh.</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1700, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(90,40,0,.3), transparent 70%)" }} />
        <div style={{ position: "absolute", left: 150, top: 1740 - 340 * 830 / 420 + (1 - devUp) * 800 }}>
          <Dev width={340} wave={1} waveAng={Math.sin(t / 2.4) * 22} brow={14} lid={(t % 70) > 66 ? 1 : 0.05} smile={1} happy={t > 20 ? 1 : 0} tilt={Math.sin(t / 9) * 3} look={6} bob={Math.sin(t / 6) * 3} />
        </div>
        <div style={{ position: "absolute", left: 600, top: 1745 - 280 * 470 / 300 + (1 - budUp) * 800 - hop * 26 }}>
          <Buddy width={280} wave={1} waveAng={Math.sin(t / 2.2 + 1) * 26} look={-6} happy={t > 26 ? 1 : 0} squash={t >= 24 ? 0.05 * Math.max(0, Math.cos((t - 24) / 5 * 2)) : 0} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

export const Day1 = () => {
  const ready = useFonts(FONTS);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const t = f - D1_END;
  // spark cut: a circle of the end card opens from the window centre
  const p = interpolate(t, [0, 9], [0, 1], { ...clamp, easing: easeIn });
  const k = Math.min(W / 1080, H / 1920), cx = W / 2, cy = (H - 1920 * k) / 2 + (600 + 338) * k;
  const R = Math.max(1, p * Math.hypot(W, H) * 1.2);
  return (
    <AbsoluteFill style={{ background: T.ink }}>
      {(t < 9) && <Pov f={f} ready={ready} W={W} H={H} />}
      {t >= 0 && <AbsoluteFill style={{ clipPath: t < 9 ? `circle(${R}px at ${cx}px ${cy}px)` : "none" }}><EndCard t={t} W={W} H={H} /></AbsoluteFill>}
      {t >= 0 && t < 10 && <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [0, 2, 10], [0, 0.5, 0], clamp), mixBlendMode: "screen" }} />}
      <Audio src={staticFile("day1.wav")} />
      <Vignette strength={0.22} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};
