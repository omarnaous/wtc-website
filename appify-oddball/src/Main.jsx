// "POV: websites in 2026 / Claude could never do this." Silent (the user adds trending audio in-app). The user's screen recording of the Oddball site, cut to the beat:
// the shot clock runs down through the hook, the platypus dunks on the drop, every section gets one bar with a
// punch-in. Then the window pulls back, the ball flies out of the site and lands spinning on Dev's finger.
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SRC_FRAMES, DROP, STATEMENT, END, MAP, SECTIONS, CHIPS, CUTS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

const C = { ink: "#0A0913", court: "#0E3B1C", lime: "#D4F53C", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", orange: "#E8742A" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.lime, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const src = (i) => staticFile(`rec/${String(Math.max(1, Math.min(SRC_FRAMES, Math.round(i) + 1))).padStart(4, "0")}.jpg`);
function srcIndex(f) {
  for (let k = 0; k < MAP.length - 1; k++) {
    const [a, ia] = MAP[k], [b, ib] = MAP[k + 1];
    if (f <= b) return interpolate(f, [a, b], [ia, ib], clamp);
  }
  return MAP[MAP.length - 1][1];
}
const caption = { ...UI, color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,.6), 0 0 2px rgba(0,0,0,.7)", textAlign: "center" };
function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}
// the site in a browser window; z = zoom into the page, (fx, fy) = focus point (0..1)
function Browser({ i, w, z = 1, fx = 0.5, fy = 0.5, style }) {
  const h = (w * 758) / 1280;
  return (
    <div style={{ width: w, borderRadius: 26, overflow: "hidden", background: "#121612", boxShadow: "0 50px 120px rgba(0,0,0,.65), 0 0 0 2px rgba(212,245,60,.25)", ...style }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
        <div style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 10, background: "rgba(255,255,255,.07)", ...UI, fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,.75)" }}>Oddball</div>
      </div>
      <div style={{ width: w, height: h, overflow: "hidden", position: "relative" }}>
        <Img src={src(i)} style={{ position: "absolute", width: w, height: h, transformOrigin: `${fx * 100}% ${fy * 100}%`, transform: `scale(${z})` }} />
      </div>
    </div>
  );
}
function Ball({ size, rot = 0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: "drop-shadow(0 10px 18px rgba(0,0,0,.45))" }}>
      <defs><radialGradient id="bg" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FFB067" /><stop offset=".55" stopColor={C.orange} /><stop offset="1" stopColor="#A9471A" /></radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill="url(#bg)" stroke="#2A1206" strokeWidth="3" />
      <g transform={`rotate(${rot} 50 50)`} fill="none" stroke="#2A1206" strokeWidth="3" strokeLinecap="round">
        <path d="M4,50 H96 M50,4 V96" /><path d="M20,14 Q44,50 20,86 M80,14 Q56,50 80,86" />
      </g>
    </svg>
  );
}

// ── 1 · POV montage ────────────────────────────────────────────────────────────────────────────────
function Pov({ f, W, H }) {
  const i = srcIndex(f);
  const sec = SECTIONS.filter((s) => f >= s).pop();
  const ts = sec === undefined ? f : f - sec;
  const z = sec === undefined ? interpolate(f, [0, DROP], [1, 1.12], { ...clamp, easing: Easing.bezier(0.5, 0, 0.8, 0.6) })
    : 1.06 + 0.1 * interpolate(ts, [0, 60], [0, 1], clamp) + 0.08 * Math.exp(-ts / 5);
  const fy = sec === DROP ? 0.45 : 0.5;
  const [sx, sy] = shake(f, DROP, 22, 5);
  const chip = CHIPS.filter(([at]) => f >= at && f < at + 34).pop();
  return (
    <AbsoluteFill style={{ background: C.court }}>
      {/* the same footage, blown up and blurred, fills the frame behind the window */}
      <AbsoluteFill style={{ transform: "scale(1.35)", filter: "blur(28px) saturate(1.3) brightness(.7)" }}>
        <Img src={src(i)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.05), rgba(0,0,0,.55))" }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, ...caption }}>
          <div style={{ fontSize: 84, letterSpacing: "-0.02em", ...pop(sp(f, -6, 11, 300), 1.3) }}>POV: websites in 2026</div>
        </div>
        <div style={{ position: "absolute", left: 14, top: 590, transform: `translate(${sx}px, ${sy}px)` }}>
          <Browser i={i} w={1052} z={z} fy={fy} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 1350, ...caption }}>
          {f >= 26 && <div style={{ ...D, fontSize: 92, lineHeight: 1.05, color: C.lime, textShadow: "0 4px 24px rgba(0,0,0,.6)", ...pop(sp(f, 26, 9, 300), 1.8) }}>Claude could never<br />do this.</div>}
        </div>
        {chip && (
          <div key={chip[0]} style={{ position: "absolute", left: 0, right: 0, top: 1580, display: "flex", justifyContent: "center", opacity: interpolate(f - chip[0], [0, 4, 30, 34], [0, 1, 1, 0], clamp) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 28px 16px 20px", borderRadius: 99, background: "rgba(10,9,19,.6)", border: "2px solid rgba(212,245,60,.45)", ...UI, fontSize: 38, color: "#fff", transform: `translateY(${(1 - Math.min(1, sp(f, chip[0], 12, 260))) * 30}px)` }}>
              <Spark size={34} />{chip[1]}
            </div>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
}

// ── 2 · pull back: this is an Appify animated website ──────────────────────────────────────────────
function Statement({ f, W, H }) {
  const t = f - STATEMENT, back = interpolate(t, [0, 18], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const i = interpolate(t, [0, 90], [0, 80], clamp);   // the hero again, small, in the window
  const ballT = interpolate(t, [52, 90], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.7, 1) });
  return (
    <AbsoluteFill style={{ background: C.court }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(212,245,60,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(212,245,60,.06) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(212,245,60,.18), transparent 60%)" }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 96, color: "#fff", ...pop(sp(t, 12, 10, 300)) }}>This is an <span style={{ color: C.lime }}>Appify</span></div>
          <div style={{ ...D, fontSize: 132, color: "#fff", marginTop: 14, ...pop(sp(t, 20, 9, 300), 1.6) }}>animated website.</div>
        </div>
        <div style={{ position: "absolute", left: interpolate(back, [0, 1], [14, 140]), top: interpolate(back, [0, 1], [590, 700]) }}>
          <Browser i={i} w={interpolate(back, [0, 1], [1052, 800])} style={{ transform: `rotate(${back * -3}deg)` }} />
        </div>
        {t >= 52 && (
          <div style={{ position: "absolute", left: interpolate(ballT, [0, 1], [430, 820]) - 60, top: 980 - Math.sin(ballT * Math.PI) * 420 + ballT * 520 - 60, transform: `scale(${interpolate(ballT, [0, 1], [0.7, 1.15])})` }}>
            <Ball size={120} rot={t * 14} />
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
}

// ── 3 · end card: the ball lands spinning on Dev's finger ──────────────────────────────────────────
function EndCard({ f, W, H }) {
  const t = f - END, devP = sp(t, -4, 13, 200), cta = sp(t, 30, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 40) / 4);
  const dw = 400, dx = 70, dy = 1920 - 330 - dw * 830 / 420 + 40, s = dw / 420;
  const tipX = dx + (548 - 90) * s, tipY = dy + (392 - 50) * s;   // Dev's raised index fingertip (point pose)
  const fall = interpolate(t, [0, 16], [0, 1], { ...clamp, easing: easeIn });
  const land = t >= 16 ? 1 - Math.exp(-(t - 16) / 3) : 0;
  const bx = interpolate(fall, [0, 1], [tipX + 260, tipX]), by = interpolate(fall, [0, 1], [tipY - 640, tipY - 62]) - (t >= 16 ? Math.abs(Math.sin((t - 16) / 3)) * 26 * Math.exp(-(t - 16) / 6) : 0);
  const squash = t >= 16 && t < 20 ? 1 - 0.12 * (1 - (t - 16) / 4) : 1;
  return (
    <AbsoluteFill style={{ background: C.court }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(212,245,60,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(212,245,60,.06) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, rgba(212,245,60,${0.2 + 0.05 * Math.sin(t / 6)}), transparent 60%)` }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 68, color: "#fff", ...pop(sp(t, 4, 10, 300)) }}>Animated websites</div>
          <div style={{ ...D, fontSize: 170, color: C.lime, marginTop: 6, textShadow: "0 10px 50px rgba(212,245,60,.35)", ...pop(sp(t, 10, 8, 300), 1.8) }}><span style={{ fontSize: 64, color: "#fff", verticalAlign: "0.9em", marginRight: 16 }}>from</span>$500</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ padding: "22px 50px", borderRadius: 30, background: C.lime, textAlign: "center", boxShadow: "0 20px 60px rgba(212,245,60,.35)" }}>
            <div style={{ ...M, fontSize: 26, color: C.court, letterSpacing: "0.2em" }}>DM</div>
            <div style={{ ...D, fontSize: 74, color: C.ink, marginTop: 6 }}>“ANIMATED WEBSITE”</div>
            <div style={{ ...UI, fontSize: 30, color: C.court, marginTop: 10 }}>for a website like this</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 70, top: 1120, display: "grid", justifyItems: "end", gap: 14, ...rise(sp(t, 40, 12, 220)) }}>
          <svg viewBox={WORDMARK.viewBox} width={330} height={330 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.lime} /></svg>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.75)" }}>@appifylb</div>
          <div style={{ ...UI, fontWeight: 400, fontSize: 26, color: "rgba(255,255,255,.6)", marginTop: 10 }}>Oddball · designed & built by Appify</div>
        </div>
        <div style={{ position: "absolute", left: dx, top: dy, transform: `translateY(${(1 - Math.min(1, devP)) * 700}px)` }}>
          <Dev width={dw} point={1} brow={16} lid={0.06} smile={1} look={4} happy={t > 22 ? 1 : 0} tilt={Math.sin(t / 8) * 2} />
        </div>
        <div style={{ position: "absolute", left: bx - 60, top: by - 60 + (1 - Math.min(1, devP)) * 0, transform: `scale(${1.15 / squash}, ${1.15 * squash})`, transformOrigin: "50% 100%" }}>
          <Ball size={120} rot={t * (t >= 16 ? 26 : 14)} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const scenes = [Pov, Statement, EndCard];
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 9;
  const p = interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.25);
  const layer = (k) => { const S = scenes[k]; return <S f={f} W={W} H={H} />; };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {inCut && layer(i - 1)}
      <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R, 0.3)}')` } : undefined}>{layer(i)}</AbsoluteFill>
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.lime} strokeWidth={14 * (1 - p)} /></svg>}
      {SECTIONS.map((s) => f >= s && f < s + 4 && <Flash key={s} f={f} start={s} peak={s === DROP ? 0.35 : 0.14} />)}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.2} />}
      <Vignette strength={0.12} />
      <Grain f={f} opacity={0.025} />
    </AbsoluteFill>
  );
};
