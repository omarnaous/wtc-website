// "The Balloon" (3D). A latex UV balloon with the appify logo is pumped up, pump by pump, toward a needle while a camera HUD
// counts the frames to impact. At exactly 7.0 s it pops into a confetti blast in brand colours.
// "You just watched a balloon for 7 seconds." / "That's what motion does to attention." -> a confetti spark lands as the i-dot.
import { AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FPS, HOOK_OUT, PUMPS, POP, LINE1, LINE2, EXPLAIN, END, LAND, KNOT, CX, S0, S1, NEEDLE0 } from "./timing.js";
import { useFonts, clamp, easeOut, shake, Grain, Vignette } from "./fx.jsx";
import { ThreeCanvas } from "@remotion/three";
import { World } from "./Scene3D.jsx";
import { Explain } from "./Explain.jsx";
import { Dev } from "./Dev.jsx";
import { WORDMARK, WSPARK, sparkPath } from "./brand.js";

export const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", paper: "#F3F1FA", alert: "#F0384F", yellow: "#FFD23F" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });

// balloon scale: one springy step per pump (overshoot = the latex wobbling)
const STEP = (S1 - S0) / PUMPS.length;
export function scaleAt(f) {
  let s = S0;
  for (const p of PUMPS) if (f >= p) s += STEP * spring({ frame: f - p, fps: FPS, config: { damping: 7, stiffness: 260 } });
  return s;
}
const H_UNITS = 116;
const topAt = (f) => KNOT - H_UNITS * scaleAt(f);
const TOP_POP = KNOT - H_UNITS * S1;
export const needleAt = (f) => NEEDLE0 + (TOP_POP - NEEDLE0) * Math.pow(Math.min(1, f / POP), 1.8);
// squash/stretch wobble right after each pump
function wobbleAt(f) {
  let w = 0;
  for (const p of PUMPS) if (f >= p) w += Math.exp(-(f - p) / 6) * Math.sin((f - p) / 1.6) * 0.04;
  return w;
}

function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}

const BALLOON = "M50 0 C 86 0 100 30 100 52 C 100 82 74 106 55 114 L 45 114 C 26 106 0 82 0 52 C 0 30 14 0 50 0 Z";
// the balloon: knot at (CX, KNOT), s = px per unit, thin = 0..1 how stretched the latex is
export function Balloon({ s, thin = 0, wob = 0, id = "bl" }) {
  const w = 100 * s, h = H_UNITS * s;
  const sx = 1 + wob, sy = 1 - wob;
  const wm = 66, wmh = wm * 1167 / 3224;
  return (
    <div style={{ position: "absolute", left: CX - w / 2, top: KNOT - h, width: w, height: h, transform: `scale(${sx}, ${sy})`, transformOrigin: "50% 100%" }}>
      <svg width={w} height={h} viewBox="0 0 100 116" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={id + "b"} cx="36%" cy="30%" r="78%">
            <stop offset="0" stopColor={thin > 0.6 ? "#F1ECFF" : "#E2D9FF"} />
            <stop offset=".25" stopColor={C.iris} />
            <stop offset=".62" stopColor={C.uv} />
            <stop offset="1" stopColor="#1F0C6E" />
          </radialGradient>
          <radialGradient id={id + "g"} cx="50%" cy="45%" r="50%"><stop offset="0" stopColor={C.uv} stopOpacity=".6" /><stop offset="1" stopColor={C.uv} stopOpacity="0" /></radialGradient>
          <linearGradient id={id + "r"} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".0" /><stop offset=".85" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#B9A6FF" stopOpacity=".5" /></linearGradient>
        </defs>
        <ellipse cx="50" cy="55" rx="110" ry="110" fill={`url(#${id}g)`} />
        <path d={BALLOON} fill={`url(#${id}b)`} />
        <path d={BALLOON} fill="#fff" opacity={0.1 * thin} />
        <path d={BALLOON} fill={`url(#${id}r)`} />
        {/* the logo printed on the latex: it stretches with the balloon */}
        <g transform={`translate(${50 - wm / 2} ${50 - wmh / 2}) scale(${wm / 3224}) translate(20 917)`} opacity={0.92 - thin * 0.15}>
          <path d={WORDMARK.letters} fill="#fff" />
          <path d={WORDMARK.spark} fill={C.yellow} />
        </g>
        <ellipse cx="30" cy="24" rx="11" ry="6" fill="#fff" opacity=".8" transform="rotate(-35 30 24)" />
        <circle cx="40" cy="17" r="2" fill="#fff" opacity=".7" />
        <path d="M44 114 L56 114 L53 119 L47 119 Z" fill="#3A1BB0" />
      </svg>
    </div>
  );
}
function String_({ f, s }) {
  const x2 = CX + Math.sin(f / 14) * 40;
  return <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}><path d={`M ${CX} ${KNOT + 5 * s / 6} C ${CX + 30} ${KNOT + 120}, ${x2 - 40} ${KNOT + 220}, ${x2} ${KNOT + 340}`} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" /></svg>;
}
export function Needle({ tip }) {
  return (
    <>
      <div style={{ position: "absolute", left: CX - 38, top: -20, width: 76, height: tip - 300 + 20, background: "linear-gradient(90deg, #1B1A22, #6E6D7C 25%, #2C2B35 45%, #B9B8C8 60%, #2A2933 80%, #15141B)" }} />
      <div style={{ position: "absolute", left: CX - 24, top: tip - 300, width: 48, height: 46, borderRadius: "6px 6px 14px 14px", background: "linear-gradient(90deg, #2A2933, #9A99A8 50%, #2A2933)" }} />
      <svg width="40" height="260" viewBox="0 0 40 260" style={{ position: "absolute", left: CX - 20, top: tip - 256 }}>
        <defs><linearGradient id="ndl" x1="0" x2="1"><stop offset="0" stopColor="#7A7988" /><stop offset=".45" stopColor="#F2F2F8" /><stop offset="1" stopColor="#55545F" /></linearGradient></defs>
        <path d="M14 0 H26 V200 L20 256 L14 200 Z" fill="url(#ndl)" />
      </svg>
      <div style={{ position: "absolute", left: CX - 3, top: tip - 2, width: 6, height: 6, borderRadius: 9, background: "#fff", boxShadow: "0 0 18px 6px rgba(255,255,255,.6)", opacity: 0.6 }} />
    </>
  );
}

// ── confetti ────────────────────────────────────────────────────────────────────────────────────────
const COLORS = [C.uv, C.iris, C.sky, C.paper, C.yellow, C.iris, C.uv, C.alert];
function confettiPiece(i, seed, f, start, origin, burst = true) {
  const r = (k) => random(`${seed}${k}${i}`);
  const t = f - start;
  if (t < 0) return null;
  const a = burst ? r("a") * Math.PI * 2 : 0;
  const v = burst ? 20 + r("v") * 72 : 0;
  const tau = 7 + r("t") * 8, term = 3 + r("g") * 5;
  const k = 1 - Math.exp(-t / tau);
  const x0 = origin.x + (r("x") - 0.5) * origin.w, y0 = origin.y + (r("y") - 0.5) * origin.h;
  const vx = Math.cos(a) * v, vy = Math.sin(a) * v - (burst ? 14 : 0);
  const x = x0 + vx * tau * k + Math.sin(t / (8 + r("s") * 10) + r("p") * 6) * 30 * Math.min(1, t / 20);
  const y = y0 + vy * tau * k + term * (t - tau * k);
  if (y > 2050 || x < -100 || x > 1180) return null;
  const kind = r("k") < 0.18 ? "spark" : r("k") < 0.32 ? "dot" : "rect";
  const size = kind === "spark" ? 26 + r("z") * 26 : kind === "dot" ? 10 + r("z") * 10 : 12 + r("z") * 14;
  const rot = r("r") * 360 + t * (6 + r("w") * 14), flip = Math.cos(t / (3 + r("f") * 4) + r("q") * 6);
  return { x, y, kind, size, rot, flip, color: COLORS[Math.floor(r("c") * COLORS.length)] };
}
function Confetti({ f, start, seed, count, origin, burst = true, front = false }) {
  const out = [];
  for (let i = 0; i < count; i++) {
    if (front !== (i % 5 === 0)) continue;     // every 5th piece flies in front of the text
    const p = confettiPiece(i, seed, f, start, origin, burst);
    if (!p) continue;
    const st = { position: "absolute", left: p.x, top: p.y, transform: `translate(-50%, -50%) rotate(${p.rot}deg) scaleY(${p.flip})` };
    if (p.kind === "spark") out.push(<svg key={i} width={p.size} height={p.size} viewBox="0 0 100 100" style={st}><path d={sparkPath(50, 50, 48, 0.22)} fill={p.color} /></svg>);
    else if (p.kind === "dot") out.push(<i key={i} style={{ ...st, width: p.size, height: p.size, borderRadius: 99, background: p.color }} />);
    else out.push(<i key={i} style={{ ...st, width: p.size * 1.7, height: p.size, borderRadius: 3, background: p.color, filter: `brightness(${0.8 + 0.4 * Math.abs(p.flip)})` }} />);
  }
  return <>{out}</>;
}
// latex shreds: snap outward and shrink
function Shreds({ f }) {
  const t = f - POP;
  if (t < 0 || t > 20) return null;
  return Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 + random(`sa${i}`) * 0.4, d = (1 - Math.exp(-t / 4)) * (260 + random(`sd${i}`) * 260);
    const cy = KNOT - H_UNITS * S1 * 0.55;
    const s = Math.max(0, 1 - t / 18) * (60 + random(`ss${i}`) * 60);
    return <svg key={i} width={s} height={s} viewBox="0 0 100 100" style={{ position: "absolute", left: CX + Math.cos(a) * d * 1.3 - s / 2, top: cy + Math.sin(a) * d - s / 2, transform: `rotate(${a * 57 + t * 30}deg)` }}><path d="M10 50 Q 30 0 90 20 Q 60 40 80 90 Q 40 70 10 50 Z" fill={i % 2 ? C.uv : C.iris} /></svg>;
  });
}

// the HUD + balloon + needle shot at frame f (also the thumbnail)
export function BalloonShot({ f, hud = true, layer = "all" }) {
  const s = scaleAt(Math.min(f, POP)), thin = interpolate(s, [S0, S1], [0, 1], clamp);
  const tip = f < POP ? needleAt(f) : needleAt(POP) - interpolate(f - POP, [0, 8], [0, 40], { ...clamp, easing: easeOut });
  const tremble = f > POP - 26 && f < POP ? (f - (POP - 26)) / 26 : 0;
  const [tx, ty] = [Math.sin(f * 2.9) * 4 * tremble, Math.cos(f * 3.3) * 3 * tremble];
  const left = Math.max(0, POP - f), danger = left <= 30;
  const psi = (2 + 13 * Math.pow(thin, 1.5)).toFixed(1);
  const tc = (n) => String(n).padStart(2, "0");
  return (
    <>
      {layer !== "hud" && <>
      <AbsoluteFill style={{ background: C.ink }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.06) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: "540px 0" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 34% at 50% 52%, rgba(91,43,255,${0.3 + 0.2 * thin}), transparent 70%)` }} />
      </>}
      {hud && layer !== "bg" && (
        <>
          {[[60, 200, 0], [960, 200, 90], [60, 1640, -90], [960, 1640, 180]].map(([x, yy, rot], n) => (
            <svg key={n} width="60" height="60" style={{ position: "absolute", left: x, top: yy, transform: `rotate(${rot}deg)` }}><path d="M4 56 V4 H56" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="4" /></svg>
          ))}
          <div style={{ position: "absolute", left: 76, top: 278, display: "flex", alignItems: "center", gap: 12, ...M, fontSize: 26, color: "#fff" }}>
            <i style={{ width: 16, height: 16, borderRadius: 99, background: C.alert, opacity: Math.floor(f / 12) % 2 ? 1 : 0.3 }} />REC 00:00:{tc(Math.floor(f / FPS))}:{tc(f % FPS)}
          </div>
          <div style={{ position: "absolute", right: 76, top: 278, ...M, fontSize: 24, color: "rgba(255,255,255,.7)" }}>Pressure {psi} psi</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1490, textAlign: "center" }}>
            <div style={{ ...M, fontSize: 28, color: "rgba(255,255,255,.75)" }}>{f < POP ? "Frames to impact" : "Popped"}</div>
            <div style={{ fontFamily: "Mono", fontSize: 140, color: danger ? C.alert : "#fff", marginTop: 6, transform: `scale(${danger && f < POP ? 1 + 0.04 * Math.abs(Math.sin(f / 2)) : 1})`, textShadow: danger ? "0 0 40px rgba(240,56,79,.5)" : "none" }}>{String(left).padStart(3, "0")}</div>
          </div>
        </>
      )}
    </>
  );
}

function Scene({ f, W, H }) {
  const [sx, sy] = shake(f, POP, 38, 5);
  const punch = f >= POP ? 1 + 0.08 * Math.exp(-(f - POP) / 5) : 1;
  const shotOut = interpolate(f, [LINE1 - 10, LINE1 + 4], [1, 0], clamp);
  const hook = interpolate(f, [HOOK_OUT, HOOK_OUT + 10], [1, 0], clamp);
  const origin = { x: CX, y: KNOT - H_UNITS * S1 * 0.5, w: 640, h: 700 };
  const flash = f >= POP && f < POP + 8 ? interpolate(f - POP, [0, 1, 7], [0.9, 0.6, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {shotOut > 0 && <AbsoluteFill style={{ opacity: shotOut }}><BalloonShot f={f} layer="bg" /></AbsoluteFill>}
      {f >= POP && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(91,43,255,${0.55 * Math.exp(-(f - POP) / 20) + 0.18}), transparent 65%)` }} />}
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${punch})` }}>
          {f >= POP && f < POP + 30 && [0, 1].map((k) => { const p = interpolate(f - POP - k * 4, [0, 24], [0, 1], { ...clamp, easing: easeOut }); return p > 0 && <div key={k} style={{ position: "absolute", left: CX - 900 * p, top: origin.y - 900 * p, width: 1800 * p, height: 1800 * p, borderRadius: 999, border: `${10 * (1 - p) + 1}px solid rgba(201,184,255,${1 - p})` }} />; })}
        </div>
      </Stage>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        <ThreeCanvas width={W} height={H} camera={{ fov: 30, position: [0, 0.15, 9], near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
          <World f={f} shake={[sx, sy]} />
        </ThreeCanvas>
      </AbsoluteFill>
      <Stage W={W} H={H}>
        {shotOut > 0 && <div style={{ position: "absolute", inset: 0, opacity: shotOut, transform: `translate(${sx}px, ${sy}px)` }}><BalloonShot f={f} layer="hud" /></div>}
        {f >= LINE1 && f < LINE2 && <Line1 t={f - LINE1} out={interpolate(f, [LINE2 - 6, LINE2], [0, 1], clamp)} />}
        {f >= EXPLAIN && f < END + 6 && <Explain f={f} />}
        {f >= END && <EndCard f={f} />}
      </Stage>
      {flash > 0 && <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
}

function Line1({ t, out }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ ...D, fontSize: 74, color: "#fff", whiteSpace: "nowrap", ...pop(sp(t, 0, 11, 300), 1.3) }}>You just watched a balloon</div>
      <div style={{ ...D, fontSize: 136, color: "#fff", marginTop: 20, whiteSpace: "nowrap", ...pop(sp(t, 10, 8, 300), 1.7) }}>for <span style={{ color: C.yellow, textShadow: "0 0 60px rgba(255,210,63,.55)" }}>7</span> seconds.</div>
    </div>
  );
}
function Line2({ t, out }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", opacity: 1 - out, transform: `scale(${1 - out * 0.1})` }}>
      <div style={{ ...D, fontSize: 104, color: "#fff", ...pop(sp(t, 0, 10, 300), 1.3) }}>That’s what motion</div>
      <div style={{ ...D, fontSize: 104, color: C.sky, marginTop: 14, ...pop(sp(t, 8, 9, 300), 1.6) }}>does to attention.</div>
    </div>
  );
}

// ── end card: one confetti spark drifts down and lands as the i-dot ───────────────────────────────────
const WM_W = 720, WM_S = WM_W / 3224, WM_L = CX - WM_W / 2, WM_T = 560 - WM_W * 1167 / 3224 / 2;
const DOT = { x: WM_L + (WSPARK.x + 20) * WM_S, y: WM_T + (WSPARK.y + 917) * WM_S, r: WSPARK.r * WM_S };
function EndCard({ f }) {
  const t = f - END;
  const letters = sp(f, END + 2, 12, 200);
  const lamp = interpolate(t, [0, 2, 3, 4, 5, 7], [0, 0, 1, 0.45, 1, 1], clamp);   // the spotlight snaps on with a flicker
  const fall = interpolate(f, [END + 4, LAND], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1) });
  const sx = DOT.x + Math.sin(fall * Math.PI * 3) * 120 * (1 - fall), sy = interpolate(fall, [0, 1], [-60, DOT.y]);
  const size = interpolate(fall, [0, 1], [70, DOT.r * 2]);
  const land = f >= LAND ? f - LAND : -1;
  const sq = land >= 0 ? 1 + 0.4 * Math.exp(-land / 3) * Math.cos(land / 1.5) : 1;
  return (
    <>
      <AbsoluteFill style={{ opacity: lamp * 0.9, mixBlendMode: "screen", background: "linear-gradient(180deg, rgba(235,230,255,.55), rgba(200,185,255,.12) 45%, rgba(200,185,255,0) 62%)", clipPath: "polygon(43% 0, 57% 0, 100% 100%, 0% 100%)", filter: "blur(24px)" }} />
      <AbsoluteFill style={{ opacity: lamp, mixBlendMode: "screen", background: "radial-gradient(ellipse 36% 4% at 50% 96%, rgba(220,210,255,.45), transparent 70%)" }} />
      <AbsoluteFill style={{ opacity: lamp, background: "radial-gradient(ellipse 22% 4% at 50% 0%, rgba(255,255,255,.9), transparent 100%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 30% at 50% 40%, rgba(91,43,255,${0.3 + (land >= 0 ? 0.15 * Math.exp(-land / 20) : 0)}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 730, textAlign: "center", ...pop(sp(f, LAND + 6, 11, 260), 1.2) }}>
        <div style={{ ...D, fontSize: 76, color: "#fff" }}>We put your brand</div>
        <div style={{ ...D, fontSize: 76, color: C.yellow, marginTop: 8, textShadow: "0 0 40px rgba(255,210,63,.45)" }}>in the spotlight.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "grid", justifyItems: "center", ...pop(sp(f, LAND + 16, 9, 260), 1.5) }}>
        <div style={{ ...M, fontSize: 26, color: "rgba(255,255,255,.75)", marginBottom: 18 }}>@appifylb · motion graphics &amp; animated websites</div>
        <div style={{ padding: "18px 46px", borderRadius: 26, background: C.uv, textAlign: "center", boxShadow: "0 20px 60px rgba(91,43,255,.45)", transform: `scale(${1 + 0.025 * Math.sin(Math.max(0, f - LAND - 30) / 4)})` }}>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.75)" }}>DM</div>
          <div style={{ ...D, fontSize: 70, color: "#fff", marginTop: 6 }}>“MOTION”</div>
        </div>
      </div>
      <EndDev f={f} />
    </>
  );
}

// Dev steps up into the spotlight: pops up, waves, then points at the DM box
function EndDev({ f }) {
  const t = f - (LAND + 10);
  if (t < 0) return null;
  const up = spring({ frame: t, fps: FPS, config: { damping: 11, stiffness: 160 } });
  const toPoint = interpolate(t, [44, 54], [0, 1], clamp);
  const blink = (t % 70) > 66 ? 1 : 0;
  const w = 380, h = w * 830 / 420;
  return (
    <div style={{ position: "absolute", left: CX - w / 2, top: 1870 - h + (1 - up) * 700, width: w, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}>
      <Dev width={w} wave={1 - toPoint} waveAng={Math.sin(t / 2.4) * 22} point={toPoint} brow={14} lid={Math.max(0.05, blink)} smile={1}
        happy={t > 20 && t < 44 ? 1 : 0} open={t < 30 ? 0.3 + 0.3 * Math.abs(Math.sin(t / 2)) : 0} tilt={Math.sin(t / 9) * 3} look={toPoint * 6} bob={Math.sin(t / 6) * 3} />
    </div>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Scene f={f} W={W} H={H} />
      <Audio src={staticFile("sound.wav")} />
      <Vignette strength={0.2} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};
