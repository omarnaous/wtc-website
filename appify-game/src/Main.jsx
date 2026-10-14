// "This is not a video game. / It's a website." Silent (the user adds trending audio in-app). The user's screen recording of
// the Earshot site: the fox runs through four worlds, a game-style HUD counts them (1/4 ... 4/4) so people stay for the last one.
// Then a spark cut to a "LEVEL COMPLETE" end card: from $500, DM "ANIMATED WEBSITE", Dev with a gamepad doing a victory jump.
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SRC_FRAMES, END, MAP, WORLDS, SECTIONS, CUTS } from "./timing.js";
import { useFonts, clamp, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DevGamer } from "./Gamer.jsx";

const C = { ink: "#0A0913", night: "#0A1640", yellow: "#FFD23F", teal: "#3EE6C1", sky: "#74C6FF", iris: "#8F72FF" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.yellow, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
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
function Browser({ i, w, z = 1, style }) {
  const h = (w * 762) / 1280;
  return (
    <div style={{ width: w, borderRadius: 26, overflow: "hidden", background: "#101833", boxShadow: "0 50px 120px rgba(0,0,0,.55), 0 0 0 3px rgba(255,210,63,.35)", ...style }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
        <div style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 10, background: "rgba(255,255,255,.08)", ...UI, fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,.8)" }}>Earshot</div>
      </div>
      <div style={{ width: w, height: h, overflow: "hidden", position: "relative" }}>
        <Img src={src(i)} style={{ position: "absolute", width: w, height: h, transformOrigin: "50% 55%", transform: `scale(${z})` }} />
      </div>
    </div>
  );
}

// ── 1 · the site, with a game HUD counting the worlds ─────────────────────────────────────────────────
function Pov({ f, W, H }) {
  const i = srcIndex(f);
  const sec = SECTIONS.filter((s) => f >= s).pop();
  const ts = sec === undefined ? f : f - sec;
  const z = 1.02 + 0.06 * interpolate(ts, [0, 120], [0, 1], clamp) + (sec === undefined ? 0 : 0.09 * Math.exp(-ts / 5));
  const [sx, sy] = sec === undefined ? [0, 0] : shake(f, sec, 14, 4);
  const w = WORLDS.filter(([at]) => f >= at).length;          // 1..4
  const [wAt, wName] = WORLDS[w - 1];
  const hud = sp(f, Math.max(6, wAt), 11, 300);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ transform: "scale(1.35)", filter: "blur(28px) saturate(1.3) brightness(.75)" }}>
        <Img src={src(i)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.05), rgba(0,0,0,.5))" }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, ...caption }}>
          <div style={{ ...D, fontSize: 112, lineHeight: 1.02, ...pop(sp(f, -6, 11, 300), 1.3) }}>This is not<br />a video game.</div>
        </div>
        <div style={{ position: "absolute", left: 14, top: 600, transform: `translate(${sx}px, ${sy}px)` }}>
          <Browser i={i} w={1052} z={z} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1330, ...caption }}>
          {f >= 34 && <div style={{ ...D, fontSize: 104, color: C.yellow, textShadow: "0 4px 24px rgba(0,0,0,.55)", ...pop(sp(f, 34, 9, 300), 1.8) }}>It’s a website.</div>}
          {f >= 56 && <div style={{ ...UI, fontSize: 46, marginTop: 18, ...rise(sp(f, 56, 12, 260)) }}>ChatGPT could never.</div>}
        </div>
        {f >= 6 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1590, display: "flex", justifyContent: "center" }}>
            <div key={w} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 28px", borderRadius: 18, background: "rgba(10,9,19,.62)", border: "3px solid rgba(255,210,63,.55)", transform: `scale(${interpolate(hud, [0, 1], [1.3, 1])})`, opacity: Math.min(1, hud * 3) }}>
              <span style={{ ...M, fontSize: 30, color: C.yellow }}>World {w}/4</span>
              <div style={{ display: "flex", gap: 8 }}>{[1, 2, 3, 4].map((k) => <i key={k} style={{ width: 22, height: 22, borderRadius: 6, background: k <= w ? C.yellow : "rgba(255,255,255,.18)" }} />)}</div>
              <span style={{ ...UI, fontSize: 36, color: "#fff" }}>{wName}</span>
            </div>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
}

// ── 2 · end card: LEVEL COMPLETE ──────────────────────────────────────────────────────────────────────
function Stars({ t }) {
  return Array.from({ length: 40 }, (_, k) => {
    const x = (k * 263) % 1080, y = (k * 151) % 1100, tw = 0.4 + 0.6 * Math.abs(Math.sin(t / 7 + k));
    return <i key={k} style={{ position: "absolute", left: x, top: y, width: 4 + (k % 3) * 2, height: 4 + (k % 3) * 2, borderRadius: 9, background: "#fff", opacity: 0.5 * tw }} />;
  });
}
function EndCard({ f, W, H }) {
  const t = f - END, devP = sp(t, 0, 13, 200), cta = sp(t, 30, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 40) / 4);
  const jump = t >= 18 && t < 36 ? Math.sin(((t - 18) / 18) * Math.PI) : 0;               // victory jump
  const hop = t >= 36 ? Math.abs(Math.sin((t - 36) / 6)) * 0.12 : 0;                      // then bouncing while playing
  const dw = 380, dx = 50, dy = 1920 - 200 - dw * 830 / 420 - (jump + hop) * 140;
  const coin = interpolate(t, [22, 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #050A22, ${C.night} 55%, #13245C)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 22% at ${30 + 8 * Math.sin(t / 20)}% 18%, rgba(62,230,193,.4), transparent 70%), radial-gradient(ellipse 50% 18% at 75% 28%, rgba(143,114,255,.35), transparent 70%)`, filter: "blur(10px)" }} />
      <Stage W={W} H={H}>
        <Stars t={t} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}>
          <div style={{ ...M, fontSize: 40, color: C.yellow, letterSpacing: "0.3em", ...pop(sp(t, 2, 10, 300)) }}>Level complete</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 18 }}>
            {[0, 1, 2].map((k) => <Spark key={k} size={70} style={{ ...pop(sp(t, 6 + k * 5, 8, 320), 2) }} />)}
          </div>
          <div style={{ ...D, fontSize: 68, color: "#fff", marginTop: 40, ...pop(sp(t, 14, 10, 300)) }}>Animated websites</div>
          <div style={{ ...D, fontSize: 170, color: C.yellow, marginTop: 6, textShadow: "0 10px 50px rgba(255,210,63,.35)", ...pop(sp(t, 20, 8, 300), 1.8) }}><span style={{ fontSize: 64, color: "#fff", verticalAlign: "0.9em", marginRight: 16 }}>from</span>$500</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "grid", justifyItems: "center", gap: 16, transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ ...M, fontSize: 28, color: "#fff", opacity: Math.floor(t / 10) % 2 ? 1 : 0.35 }}>▶ press start</div>
          <div style={{ padding: "22px 50px", borderRadius: 30, background: C.yellow, textAlign: "center", boxShadow: "0 20px 60px rgba(255,210,63,.3)" }}>
            <div style={{ ...M, fontSize: 26, color: C.night, letterSpacing: "0.2em" }}>DM</div>
            <div style={{ ...D, fontSize: 74, color: C.ink, marginTop: 6 }}>“ANIMATED WEBSITE”</div>
            <div style={{ ...UI, fontSize: 30, color: C.night, marginTop: 10 }}>for a website like this</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 70, top: 1230, display: "grid", justifyItems: "end", gap: 14, ...rise(sp(t, 42, 12, 220)) }}>
          <svg viewBox={WORDMARK.viewBox} width={330} height={330 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.yellow} /></svg>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.75)" }}>@appifylb</div>
          <div style={{ ...UI, fontWeight: 400, fontSize: 26, color: "rgba(255,255,255,.6)", marginTop: 10 }}>Earshot · designed & built by Appify</div>
        </div>
        {/* the coin that pops out on the jump */}
        {t >= 22 && coin < 1 && (
          <div style={{ position: "absolute", left: dx + dw / 2 - 40, top: dy - 40 - coin * 150, opacity: 1 - Math.max(0, coin - 0.7) / 0.3, transform: `scaleX(${Math.cos(t * 0.6)})` }}>
            <div style={{ width: 80, height: 80, borderRadius: 99, background: C.yellow, border: "6px solid #B8860B", display: "grid", placeItems: "center", ...D, fontSize: 44, color: "#8A5A00" }}>$</div>
          </div>
        )}
        {t >= 26 && t < 52 && <div style={{ position: "absolute", left: dx + dw / 2 + 50, top: dy - 150 - (t - 26) * 2, ...D, fontSize: 52, color: C.yellow, opacity: interpolate(t, [26, 30, 46, 52], [0, 1, 1, 0], clamp), textShadow: "0 4px 0 #8A5A00" }}>+1</div>}
        <div style={{ position: "absolute", left: dx, top: dy, transform: `translateY(${(1 - Math.min(1, devP)) * 700}px) scaleY(${t >= 36 && t < 40 ? 0.96 : 1})`, transformOrigin: "50% 100%" }}>
          <DevGamer width={dw} tilt={Math.sin(t / 5) * 4} face={{ brow: 16, lid: 0.04, smile: 1, look: 6, happy: t > 18 ? 1 : 0, open: t > 18 && t < 34 ? 0.6 : 0 }} />
        </div>
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
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.yellow} strokeWidth={14 * (1 - p)} /></svg>}
      {SECTIONS.map((s) => f >= s && f < s + 4 && <Flash key={s} f={f} start={s} peak={0.18} />)}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.2} />}
      <Vignette strength={0.12} />
      <Grain f={f} opacity={0.02} />
    </AbsoluteFill>
  );
};
