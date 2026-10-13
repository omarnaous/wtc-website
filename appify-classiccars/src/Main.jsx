// "POV: this website looks like it cost $10,000 / ChatGPT could never do this." Silent (the user adds trending audio in-app). The user's screen recording of the Valmora site.
// The car sits under its cover through the hook, the cover comes off on the drop, every section gets one bar with a punch-in.
// Then the window pulls back ("this is an Appify animated website"), Dev screeches in driving a classic spider,
// and the punchline lands: "costs from $500", DM "ANIMATED WEBSITE".
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SRC_FRAMES, DROP, STATEMENT, END, MAP, SECTIONS, CHIPS, CUTS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DevCar } from "./Car.jsx";

const C = { ink: "#0A0913", bg: "#100E0C", gold: "#E8D3A3", cream: "#EDE6D8", wine: "#7A1426", uv: "#5B2BFF", iris: "#8F72FF" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.gold, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
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
  const h = (w * 756) / 1280;
  return (
    <div style={{ width: w, borderRadius: 26, overflow: "hidden", background: "#16130F", boxShadow: "0 50px 120px rgba(0,0,0,.65), 0 0 0 2px rgba(232,211,163,.28)", ...style }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
        <div style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 10, background: "rgba(255,255,255,.07)", ...UI, fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,.75)" }}>Valmora</div>
      </div>
      <div style={{ width: w, height: h, overflow: "hidden", position: "relative" }}>
        <Img src={src(i)} style={{ position: "absolute", width: w, height: h, transformOrigin: `${fx * 100}% ${fy * 100}%`, transform: `scale(${z})` }} />
      </div>
    </div>
  );
}
// ── 1 · POV montage ────────────────────────────────────────────────────────────────────────────────
function Pov({ f, W, H }) {
  const i = srcIndex(f);
  const sec = SECTIONS.filter((s) => f >= s).pop();
  const ts = sec === undefined ? f : f - sec;
  const z = sec === undefined ? interpolate(f, [0, DROP], [1, 1.12], { ...clamp, easing: Easing.bezier(0.5, 0, 0.8, 0.6) })
    : 1.06 + 0.1 * interpolate(ts, [0, 60], [0, 1], clamp) + 0.08 * Math.exp(-ts / 5);
  const fy = sec === undefined || sec === DROP ? 0.6 : 0.5;
  const [sx, sy] = shake(f, DROP, 22, 5);
  const chip = CHIPS.filter(([at]) => f >= at && f < at + 34).pop();
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* the same footage, blown up and blurred, fills the frame behind the window */}
      <AbsoluteFill style={{ transform: "scale(1.35)", filter: "blur(28px) saturate(1.3) brightness(.7)" }}>
        <Img src={src(i)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.05), rgba(0,0,0,.55))" }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 230, ...caption }}>
          <div style={{ fontSize: 58, letterSpacing: "-0.02em", whiteSpace: "nowrap", ...pop(sp(f, -6, 11, 300), 1.3) }}>POV: this website looks like it cost</div>
          <div style={{ ...D, fontSize: 150, color: C.gold, marginTop: 4, textShadow: "0 6px 40px rgba(0,0,0,.6)", ...pop(sp(f, -3, 8, 300), 1.8) }}>$10,000</div>
        </div>
        <div style={{ position: "absolute", left: 14, top: 590, transform: `translate(${sx}px, ${sy}px)` }}>
          <Browser i={i} w={1052} z={z} fy={fy} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 1350, ...caption }}>
          {f >= 26 && <div style={{ ...D, fontSize: 92, lineHeight: 1.05, color: C.gold, textShadow: "0 4px 24px rgba(0,0,0,.6)", ...pop(sp(f, 26, 9, 300), 1.8) }}>ChatGPT could never<br />do this.</div>}
        </div>
        {chip && (
          <div key={chip[0]} style={{ position: "absolute", left: 0, right: 0, top: 1580, display: "flex", justifyContent: "center", opacity: interpolate(f - chip[0], [0, 4, 30, 34], [0, 1, 1, 0], clamp) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 28px 16px 20px", borderRadius: 99, background: "rgba(10,9,19,.6)", border: "2px solid rgba(232,211,163,.5)", ...UI, fontSize: 38, color: "#fff", transform: `translateY(${(1 - Math.min(1, sp(f, chip[0], 12, 260))) * 30}px)` }}>
              <Spark size={34} />{chip[1]}
            </div>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
}

// a showroom: dark hall, one cool skylight cone, warm floor glow
const Hall = ({ t }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 30% at 50% 100%, rgba(232,160,90,${0.16 + 0.03 * Math.sin(t / 9)}), transparent 70%)` }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(170,195,230,.32), rgba(170,195,230,0) 75%)", clipPath: "polygon(36% 0, 64% 0, 92% 100%, 8% 100%)", filter: "blur(30px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 30% 6% at 50% 0%, rgba(220,235,255,.6), transparent 100%)" }} />
  </>
);

// ── 2 · "this is an Appify animated website": the window pulls back, Dev screeches in, "costs from $500" ────────
const ARRIVE = 34, STOP = 56;                  // relative to STATEMENT
const CAR_W = 960, CAR_X = 60, CAR_Y = 1330;
function Finale({ f, W, H }) {
  const t = f - STATEMENT, e = f - END;
  const back = interpolate(t, [0, 18], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const out = interpolate(e, [0, 7], [0, 1], { ...clamp, easing: easeIn });
  const i = interpolate(t, [0, 90], [600, 712], clamp);
  // the drive-in: fast, then a hard brake with the nose dipping and rocking back
  const drive = interpolate(t, [ARRIVE, STOP], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.3, 1) });
  const x = interpolate(drive, [0, 1], [-1150, CAR_X]);
  const st = t - STOP, rock = st >= 0 ? 2.6 * Math.exp(-st / 6) * Math.cos(st / 2.2) : 0;
  const rot = (x + 1150) / 0.78 * 0.9;           // wheel turns with the distance travelled
  const idle = st > 12 ? Math.sin(t * 2.4) * 1.2 : 0;
  const moving = t >= ARRIVE && t < STOP;
  const beep = [130, 146].find((b) => e >= b && e < b + 12);
  const A = sp(t, 12, 10, 300), A2 = sp(t, 20, 9, 300);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Hall t={t} />
      <Stage W={W} H={H}>
        {/* line 1: the claim */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: 1 - out, transform: `translateY(${-out * 60}px)` }}>
          <div style={{ ...D, fontSize: 96, color: "#fff", ...pop(A) }}>This is an <span style={{ color: C.gold }}>Appify</span></div>
          <div style={{ ...D, fontSize: 112, color: "#fff", marginTop: 14, whiteSpace: "nowrap", ...pop(A2, 1.6) }}>animated website.</div>
        </div>
        {/* line 2: the price */}
        {e >= 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
            <div style={{ ...D, fontSize: 76, color: "#fff", ...pop(sp(e, 4, 10, 300)) }}>Looks like <span style={{ color: "rgba(255,255,255,.55)" }}>$10,000.</span></div>
            <div style={{ ...D, fontSize: 170, color: C.gold, marginTop: 4, textShadow: "0 10px 60px rgba(232,211,163,.4)", ...pop(sp(e, 11, 8, 300), 1.8) }}><span style={{ fontSize: 64, color: "#fff", verticalAlign: "0.9em", marginRight: 16 }}>costs from</span>$500</div>
          </div>
        )}
        {/* the site, pulled back */}
        {out < 1 && (
          <div style={{ position: "absolute", left: interpolate(back, [0, 1], [14, 160]), top: interpolate(back, [0, 1], [590, 600]) - out * 400, opacity: 1 - out, transform: `scale(${1 - out * 0.4})` }}>
            <Browser i={i} w={interpolate(back, [0, 1], [1052, 760])} style={{ transform: `rotate(${back * -2}deg)` }} />
          </div>
        )}
        {e >= 0 && (() => {
          const cta = sp(e, 28, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, e - 40) / 4);
          return (
            <>
              <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
                <div style={{ padding: "22px 50px", borderRadius: 30, background: C.cream, textAlign: "center", boxShadow: "0 20px 60px rgba(232,211,163,.25)" }}>
                  <div style={{ ...M, fontSize: 26, color: C.wine, letterSpacing: "0.2em" }}>DM</div>
                  <div style={{ ...D, fontSize: 74, color: C.ink, marginTop: 6 }}>“ANIMATED WEBSITE”</div>
                  <div style={{ ...UI, fontSize: 30, color: C.wine, marginTop: 10 }}>for a website like this</div>
                </div>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 850, display: "grid", justifyItems: "center", gap: 12, ...rise(sp(e, 40, 12, 220)) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                  <svg viewBox={WORDMARK.viewBox} width={250} height={250 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.gold} /></svg>
                  <div style={{ ...M, fontSize: 26, color: "rgba(255,255,255,.75)" }}>@appifylb</div>
                </div>
                <div style={{ ...UI, fontWeight: 400, fontSize: 24, color: "rgba(255,255,255,.55)" }}>Valmora · a concept marque, designed & built by Appify</div>
              </div>
            </>
          );
        })()}
        {/* speed lines + tyre smoke */}
        {moving && [0, 1, 2, 3].map((k) => <i key={k} style={{ position: "absolute", left: x - 200 + k * 30, top: CAR_Y + 60 + k * 62, width: 220 - k * 30, height: 9, borderRadius: 9, background: C.gold, opacity: 0.7 * (1 - drive) + 0.2 }} />)}
        {t >= STOP - 8 && t < STOP + 30 && [0, 1, 2, 3, 4, 5].map((k) => {
          const a = t - (STOP - 8) - k * 2, g = interpolate(a, [0, 26], [0, 1], clamp);
          if (a < 0) return null;
          return <i key={k} style={{ position: "absolute", left: CAR_X + 120 - g * (90 + k * 30), top: CAR_Y + 250 - g * (40 + k * 12), width: 80 + g * 120, height: 80 + g * 120, borderRadius: 999, background: "rgba(230,224,214,.9)", opacity: 0.55 * (1 - g), filter: "blur(10px)" }} />;
        })}
        {/* exhaust puffs while it idles */}
        {st > 10 && [0, 1, 2].map((k) => {
          const a = ((t + k * 9) % 27) / 27;
          return <i key={k} style={{ position: "absolute", left: CAR_X + 30 - a * 120, top: CAR_Y + 270 - a * 50, width: 30 + a * 60, height: 30 + a * 60, borderRadius: 99, background: "rgba(220,214,204,.8)", opacity: 0.4 * (1 - a), filter: "blur(6px)" }} />;
        })}
        <div style={{ position: "absolute", left: x, top: CAR_Y }}>
          <DevCar width={CAR_W} rot={rot} pitch={rock} bounce={idle} wave={1} waveAng={Math.sin(t / 3) * 22} thumbs={1} tilt={Math.sin(t / 7) * 3}
            face={{ brow: 16, lid: 0.04, smile: 1, look: moving ? 8 : 0, happy: st > 14 ? 1 : 0, shock: moving ? 0.5 : 0 }} />
        </div>
        {beep && (
          <div style={{ position: "absolute", left: CAR_X + 700, top: CAR_Y - 150, transform: `rotate(-10deg) scale(${interpolate(e - beep, [0, 3, 12], [0.6, 1.1, 1], clamp)})`, ...D, fontSize: 64, color: "#fff", textShadow: `0 0 0 ${C.wine}, 4px 4px 0 ${C.wine}` }}>BEEP BEEP!</div>
        )}
      </Stage>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const scenes = [Pov, Finale];
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 9;
  const p = interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.25);
  const layer = (k) => { const S = scenes[k]; return <S f={f} W={W} H={H} />; };
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {inCut && layer(i - 1)}
      <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R, 0.3)}')` } : undefined}>{layer(i)}</AbsoluteFill>
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.gold} strokeWidth={14 * (1 - p)} /></svg>}
      {SECTIONS.map((s) => f >= s && f < s + 4 && <Flash key={s} f={f} start={s} peak={s === DROP ? 0.35 : 0.14} />)}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.2} />}
      <Vignette strength={0.12} />
      <Grain f={f} opacity={0.025} />
    </AbsoluteFill>
  );
};
