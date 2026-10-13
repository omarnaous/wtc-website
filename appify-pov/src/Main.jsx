// "POV: websites in 2026." It looks like a film; it's a website. Real recordings of the Firnlight site
// (built by Appify) are scrolled with a visible thumb, then the view pulls back to the same site on desktop.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { M_FRAMES, D_FRAMES, DROP, REVEAL, END, SCROLL, SWIPES, CHIPS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";

const C = { ink: "#0A0913", ink2: "#17142B", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", lensA: "#FFB02E", lensB: "#7A3CFF" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.iris, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
// per-chip height (fraction of the frame) chosen to stay clear of the site's own callouts and headline
const CHIP_Y = [0.5, 0.5, 0.42, 0.42, 0.32];
const flick = Easing.bezier(0.2, 0.75, 0.25, 1);   // a thumb flick: fast start, long settle
const pad = (n) => String(Math.max(0, Math.round(n))).padStart(4, "0");
const mFrame = (i) => staticFile(`rec/m/${pad(Math.min(M_FRAMES - 1, i))}.jpg`);
const dFrame = (i) => staticFile(`rec/d/${pad(Math.min(D_FRAMES - 1, i))}.jpg`);
function scrollIndex(f) {
  for (let k = 0; k < SCROLL.length - 1; k++) {
    const [a, ia] = SCROLL[k], [b, ib] = SCROLL[k + 1];
    if (f <= b) return interpolate(f, [a, b], [ia, ib], { ...clamp, easing: flick });
  }
  return SCROLL[SCROLL.length - 1][1];
}
// Instagram-native caption: white bold text with a soft shadow
const caption = { ...UI, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)", textAlign: "center" };
// a design stage for the composed scenes: 1080x1920, scaled to fit any format
function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}

// ── 1 · POV: the site, full-bleed, scrolled by a thumb ─────────────────────────────────────────────
function Touch({ f, W, H }) {
  const s = SWIPES.filter((x) => f >= x).pop();
  if (s === undefined || f > s + 12) return null;
  const t = f - s, p = interpolate(t, [0, 9], [0, 1], { ...clamp, easing: easeOut });
  const x = W * 0.56, y = H * 0.74 - p * H * 0.22;
  return <div style={{ position: "absolute", left: x - 46, top: y - 46, width: 92, height: 92, borderRadius: 99, background: "rgba(255,255,255,.28)", border: "3px solid rgba(255,255,255,.75)", boxShadow: "0 6px 24px rgba(0,0,0,.35)", opacity: interpolate(t, [0, 2, 9, 12], [0, 1, 1, 0], clamp), transform: `scale(${interpolate(t, [0, 3], [1.3, 1], clamp)})` }} />;
}
function Pov({ f, W, H }) {
  const idx = scrollIndex(f);
  const [sx, sy] = shake(f, DROP, 10, 4);
  const chip = CHIPS.filter(([at]) => f >= at && f < at + 44).pop();
  const k = W / 1080;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${1 + 0.02 * Math.exp(-Math.max(0, f - DROP) / 8) * (f >= DROP ? 1 : 0)})` }}>
        <Img src={mFrame(idx)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,0) 22%)" }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: H > 1600 ? 230 : 90, ...caption }}>
        <div style={{ fontSize: 76 * k, letterSpacing: "-0.02em", ...pop(sp(f, -6, 11, 300), 1.3) }}>POV: websites in 2026</div>
        {f >= 30 && f < 170 && <div style={{ fontSize: 44 * k, marginTop: 14 * k, fontWeight: 400, fontFamily: "UI", opacity: interpolate(f, [150, 170], [1, 0], clamp), ...{ transform: `translateY(${(1 - Math.min(1, sp(f, 30, 12, 240))) * 20}px)` } }}>(this isn't a video. it's scrolling.)</div>}
      </div>
      {chip && (
        <div key={chip[0]} style={{ position: "absolute", left: 50 * k, top: H * CHIP_Y[CHIPS.indexOf(chip)], display: "flex", alignItems: "center", gap: 14 * k, padding: `${16 * k}px ${26 * k}px ${16 * k}px ${18 * k}px`, borderRadius: 99, background: "rgba(10,9,19,.55)", backdropFilter: "blur(12px)", border: "2px solid rgba(255,255,255,.25)", ...UI, fontSize: 36 * k, color: "#fff", opacity: interpolate(f - chip[0], [0, 4, 38, 44], [0, 1, 1, 0], clamp), transform: `translateX(${(1 - Math.min(1, sp(f, chip[0], 12, 260))) * -80}px)` }}>
          <Spark size={34 * k} color={C.lensA} />{chip[1]}
        </div>
      )}
      <Touch f={f} W={W} H={H} />
    </AbsoluteFill>
  );
}

// ── 2 · pull back: it's a website (phone + desktop browser) ────────────────────────────────────────
function Reveal({ f, W, H }) {
  const t = f - REVEAL, shrink = interpolate(t, [0, 16], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const win = sp(t, 8, 13, 180), title = sp(t, 14, 10, 280);
  // the phone scrolls back to the top, then starts again; the desktop scrolls through the film
  const mi = t < 20 ? 599 : interpolate(t, [20, 40, 90], [599, 0, 60], { ...clamp, easing: easeOut });
  const di = interpolate(t, [10, 90], [0, 150], { ...clamp, easing: Easing.bezier(0.3, 0.1, 0.4, 1) });
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", opacity: shrink }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(122,60,255,${0.45 * shrink}), transparent 60%)` }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", ...D, fontSize: 124, color: "#fff", ...pop(title, 1.6) }}>It's a <span style={{ background: `linear-gradient(90deg, ${C.lensA}, #FF5E8A, ${C.lensB})`, WebkitBackgroundClip: "text", color: "transparent" }}>website.</span></div>
        {/* desktop browser */}
        <div style={{ position: "absolute", left: 60, top: 470, width: 960, borderRadius: 22, overflow: "hidden", background: "#1B1A22", boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 2px rgba(255,255,255,.08)", opacity: Math.min(1, win * 2), transform: `translateY(${(1 - Math.min(1, win)) * 260}px) rotate(${(1 - Math.min(1, win)) * -4}deg)` }}>
          <div style={{ height: 58, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 16, height: 16, borderRadius: 99, background: c }} />)}
            <div style={{ marginLeft: 20, flex: 1, height: 34, borderRadius: 10, background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", padding: "0 16px", ...UI, fontWeight: 400, fontSize: 20, color: "rgba(255,255,255,.75)" }}>omarnaous.github.io/firnlight</div>
          </div>
          <Img src={dFrame(di)} style={{ width: 960, height: 600, display: "block", objectFit: "cover" }} />
        </div>
      </Stage>
      {/* the phone footage shrinks from full screen into a phone (rect interpolated in screen space) */}
      {(() => {
        const k = Math.min(W / 1080, H / 1920), ox = (W - 1080 * k) / 2, oy = (H - 1920 * k) / 2;
        const tx = ox + 610 * k, ty = oy + 1050 * k, tw = 1080 * 0.38 * k, th = 1920 * 0.38 * k;
        const x = interpolate(shrink, [0, 1], [0, tx]), y = interpolate(shrink, [0, 1], [0, ty]);
        const w = interpolate(shrink, [0, 1], [W, tw]), h = interpolate(shrink, [0, 1], [H, th]);
        return (
          <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 50 * k * shrink, overflow: "hidden", boxShadow: shrink > 0.3 ? `0 0 0 ${12 * k}px #000, 0 0 0 ${14 * k}px rgba(143,114,255,.5), 0 ${40 * k}px ${110 * k}px rgba(0,0,0,.6)` : "none" }}>
            <Img src={mFrame(mi)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })()}
    </AbsoluteFill>
  );
}

// ── 3 · end card ───────────────────────────────────────────────────────────────────────────────────
function EndCard({ f, W, H }) {
  const t = f - END, cta = sp(t, 24, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 34) / 4);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ transform: `scale(${1.08 + t * 0.0006})`, filter: "blur(18px) saturate(1.2)", opacity: 0.45 }}>
        <Img src={mFrame(60)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,9,19,.55), rgba(10,9,19,.85))" }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 104, color: "#fff", ...pop(sp(t, 0, 10, 300)) }}>Want a website</div>
          <div style={{ ...D, fontSize: 104, marginTop: 10, background: `linear-gradient(90deg, ${C.lensA}, #FF5E8A, ${C.lensB})`, WebkitBackgroundClip: "text", color: "transparent", ...pop(sp(t, 6, 10, 300)) }}>that feels like this?</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ padding: "30px 70px", borderRadius: 34, background: C.uv, textAlign: "center", boxShadow: "0 20px 60px rgba(91,43,255,.55)" }}>
            <div style={{ ...D, fontSize: 104, color: "#fff" }}>DM “WEBSITE”</div>
            <div style={{ ...UI, fontSize: 36, color: C.sky, marginTop: 12 }}>and we'll design yours</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "grid", justifyItems: "center", gap: 16, ...rise(sp(t, 34, 12, 220)) }}>
          <svg viewBox={WORDMARK.viewBox} width={320} height={320 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.75)" }}>@appifylb · www.appify-lb.com</div>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1230, textAlign: "center", ...UI, fontWeight: 400, fontSize: 30, color: "rgba(255,255,255,.6)", opacity: interpolate(t, [40, 50], [0, 1], clamp) }}>Firnlight is a concept brand. Design & build: Appify.</div>
      </Stage>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const S = f < REVEAL ? Pov : f < END ? Reveal : EndCard;
  const cut = f >= END && f < END + 9;
  const p = interpolate(f, [END, END + 9], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.25);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {cut && <Reveal f={f} W={W} H={H} />}
      <AbsoluteFill style={cut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R, 0.3)}')` } : undefined}><S f={f} W={W} H={H} /></AbsoluteFill>
      {cut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.iris} strokeWidth={14 * (1 - p)} /></svg>}
      {f >= DROP && f < DROP + 4 && <Flash f={f} start={DROP} peak={0.18} />}
      {f >= END && f < END + 4 && <Flash f={f} start={END} peak={0.2} />}
      <Vignette strength={0.12} />
      <Grain f={f} opacity={0.025} />
    </AbsoluteFill>
  );
};
