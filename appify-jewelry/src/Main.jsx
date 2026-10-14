// Animated website 04: NAÏADE (a concept jewelry brand, design study). Silent (the user adds trending audio in-app).
// "Cheap website, / cheap jewelry." The user's screen recording of the site plays in a browser window while a
// HUD chip walks through the pieces (0/3 ... 3/3, then the whole set, $38,200) so people stay to the end. Then a spark
// cut to the end card: websites that look this expensive, from $500, DM "ANIMATED WEBSITE", Dev with a ring box.
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SRC_FRAMES, END, MAP, PIECES, SECTIONS, CUTS } from "./timing.js";
import { useFonts, clamp, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DevRing } from "./RingBox.jsx";

const C = { ink: "#05080A", night: "#04161A", teal: "#35E6D8", tealD: "#0D6F6A", pearl: "#ECE8DF" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.teal, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const src = (i) => staticFile(`rec/${String(Math.max(1, Math.min(SRC_FRAMES, Math.round(i) + 1))).padStart(4, "0")}.jpg`);
function srcIndex(f) {
  for (let k = 0; k < MAP.length - 1; k++) {
    const [a, ia] = MAP[k], [b, ib] = MAP[k + 1];
    if (f <= b) return interpolate(f, [a, b], [ia, ib], clamp);
  }
  return MAP[MAP.length - 1][1];
}
const caption = { ...UI, color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.7)", textAlign: "center" };
function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}
// Instagram fills tall phones, cropping ~100 px off each side of a 1080-wide reel, and its buttons cover the right edge
// and the caption the bottom. Everything that matters is scaled into that safe area, centred a little left.
const Safe = ({ s = 0.76, ox = 500, oy = 860, children }) => <div style={{ position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: `${ox}px ${oy}px` }}>{children}</div>;
function Browser({ i, w, z = 1, style }) {
  const h = (w * 764) / 1280;
  return (
    <div style={{ width: w, borderRadius: 26, overflow: "hidden", background: "#0B1214", boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 3px rgba(53,230,216,.4)", ...style }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
        <div style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 10, background: "rgba(255,255,255,.08)", ...UI, fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,.8)" }}>NAÏADE</div>
      </div>
      <div style={{ width: w, height: h, overflow: "hidden", position: "relative" }}>
        <Img src={src(i)} style={{ position: "absolute", width: w, height: h, transformOrigin: "50% 55%", transform: `scale(${z})` }} />
      </div>
    </div>
  );
}

// ── 1 · the site, with a HUD chip walking through the pieces ──────────────────────────────────────────
function Pov({ f, W, H }) {
  const i = srcIndex(f);
  const sec = SECTIONS.filter((s) => f >= s).pop();
  const ts = sec === undefined ? f : f - sec;
  const z = 1.02 + 0.05 * interpolate(ts, [0, 90], [0, 1], clamp) + (sec === undefined ? 0 : 0.08 * Math.exp(-ts / 5));
  const [sx, sy] = sec === undefined ? [0, 0] : shake(f, sec, 12, 4);
  const k = PIECES.filter(([at]) => f >= at).length - 1;
  const [pAt, count, name, price] = PIECES[k];
  const hud = sp(f, Math.max(6, pAt), 11, 300);
  const set = count === 4;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ transform: "scale(1.35)", filter: "blur(28px) saturate(1.2) brightness(.7)" }}>
        <Img src={src(i)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.05), rgba(0,0,0,.55))" }} />
      <Stage W={W} H={H}><Safe>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, ...caption }}>
          <div style={{ ...D, fontSize: 112, lineHeight: 1.04, ...pop(sp(f, -6, 11, 300), 1.3) }}>Cheap website,<br />cheap jewelry.</div>
        </div>
        <div style={{ position: "absolute", left: 14, top: 600, transform: `translate(${sx}px, ${sy}px)` }}>
          <Browser i={i} w={1052} z={z} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1330, ...caption }}>
          {f >= 34 && <div style={{ ...D, fontSize: 80, color: C.teal, textShadow: "0 4px 24px rgba(0,0,0,.55)", ...pop(sp(f, 34, 9, 300), 1.8) }}>Make it feel like luxury.</div>}
          {f >= 56 && <div style={{ ...UI, fontSize: 46, marginTop: 18, ...rise(sp(f, 56, 12, 260)) }}>ChatGPT could never.</div>}
        </div>
        {f >= 6 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1590, display: "flex", justifyContent: "center" }}>
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 28px", borderRadius: 18, background: "rgba(5,8,10,.66)", border: `3px solid ${set ? C.teal : "rgba(53,230,216,.5)"}`, boxShadow: set ? "0 0 40px rgba(53,230,216,.35)" : "none", transform: `scale(${interpolate(hud, [0, 1], [1.3, 1])})`, opacity: Math.min(1, hud * 3) }}>
              <span style={{ ...M, fontSize: 28, color: C.teal }}>{set ? "Set" : `Piece ${count}/3`}</span>
              <div style={{ display: "flex", gap: 8 }}>{[1, 2, 3].map((n) => <i key={n} style={{ width: 22, height: 22, borderRadius: 99, transform: "rotate(45deg) scale(.8)", background: n <= count ? C.teal : "rgba(255,255,255,.18)" }} />)}</div>
              <span style={{ ...UI, fontSize: 34, color: "#fff" }}>{set ? "Earrings · pendant · ring" : name}</span>
              {price && <span style={{ ...UI, fontSize: 34, color: C.teal }}>{price}</span>}
            </div>
          </div>
        )}
      </Safe></Stage>
    </AbsoluteFill>
  );
}

// ── 2 · end card: a night pool, websites that look this expensive ─────────────────────────────────────
function Caustics({ t }) {
  return Array.from({ length: 14 }, (_, k) => {
    const x = (k * 223) % 1080, y = 120 + ((k * 137) % 900), s = 160 + (k % 4) * 60;
    return <i key={k} style={{ position: "absolute", left: x - s / 2 + Math.sin(t / 20 + k) * 30, top: y - s / 4 + Math.cos(t / 24 + k) * 20, width: s, height: s / 2, borderRadius: "50%", border: `3px solid rgba(53,230,216,${0.08 + 0.08 * Math.abs(Math.sin(t / 14 + k))})`, filter: "blur(2px)" }} />;
  });
}
function EndCard({ f, W, H }) {
  const t = f - END, cta = sp(t, 30, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 40) / 4);
  const devP = sp(t, 6, 13, 200), offer = sp(t, 26, 8, 300);
  const dw = 380, dx = 330, dy = 1920 - 110 - dw * 830 / 420;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #02090B, ${C.night} 55%, #062B30)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 22% at ${40 + 8 * Math.sin(t / 30)}% 20%, rgba(53,230,216,.28), transparent 70%)`, filter: "blur(10px)" }} />
      <Stage W={W} H={H}>
        <Caustics t={t} />
        <Safe s={0.8} oy={900}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}>
          <div style={{ display: "grid", justifyItems: "center", gap: 10, ...pop(sp(t, 2, 10, 300)) }}><svg viewBox={WORDMARK.viewBox} width={280} height={280 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.teal} /></svg><span style={{ ...M, fontSize: 24, color: C.teal }}>@appifylb</span></div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 18 }}>{[0, 1, 2].map((k) => <Spark key={k} size={60} style={{ ...pop(sp(t, 6 + k * 5, 8, 320), 2) }} />)}</div>
          <div style={{ ...D, fontSize: 76, color: "#fff", marginTop: 40, ...pop(sp(t, 12, 10, 300)) }}>Websites that look</div>
          <div style={{ ...D, fontSize: 76, color: "#fff", marginTop: 6, ...pop(sp(t, 16, 10, 300)) }}>this expensive</div>
          <div style={{ ...D, fontSize: 170, color: C.teal, marginTop: 6, textShadow: "0 10px 50px rgba(53,230,216,.35)", ...pop(offer, 1.8) }}><span style={{ fontSize: 64, color: "#fff", verticalAlign: "0.9em", marginRight: 16 }}>from</span>$500</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 780, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ padding: "22px 50px", borderRadius: 30, background: C.teal, textAlign: "center", boxShadow: "0 20px 60px rgba(53,230,216,.3)" }}>
            <div style={{ ...M, fontSize: 26, color: C.night, letterSpacing: "0.2em" }}>DM</div>
            <div style={{ ...D, fontSize: 74, color: C.ink, marginTop: 6 }}>“ANIMATED WEBSITE”</div>
            <div style={{ ...UI, fontSize: 30, color: C.night, marginTop: 10 }}>for a website like this</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", ...UI, fontWeight: 400, fontSize: 24, color: "rgba(255,255,255,.6)", ...rise(sp(t, 42, 12, 220)) }}>NAÏADE · concept brand · designed &amp; built by Appify</div>
        <div style={{ position: "absolute", left: dx, top: dy, transform: `translateY(${(1 - Math.min(1, devP)) * 700}px)` }}>
          <DevRing width={dw} t={t} tilt={Math.sin(t / 9) * 3} bob={Math.sin(t / 6) * 3} face={{ brow: 18, lid: (t % 70) > 66 ? 1 : 0.04, smile: 1, look: 6, happy: t > 24 ? 1 : 0, open: t > 16 && t < 30 ? 0.5 : 0 }} />
        </div>
        </Safe>
      </Stage>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const scenes = [Pov, EndCard];
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 9;
  const p = interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.25);
  const layer = (k) => { const S = scenes[k]; return <S f={f} W={W} H={H} />; };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {inCut && layer(i - 1)}
      <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R, 0.3)}')` } : undefined}>{layer(i)}</AbsoluteFill>
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.teal} strokeWidth={14 * (1 - p)} /></svg>}
      {SECTIONS.map((s) => f >= s && f < s + 4 && <Flash key={s} f={f} start={s} peak={0.16} />)}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.2} />}
      <Vignette strength={0.12} />
      <Grain f={f} opacity={0.02} />
    </AbsoluteFill>
  );
};
