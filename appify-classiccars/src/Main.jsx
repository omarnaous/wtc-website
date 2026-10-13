// "POV: websites in 2026 / Claude could never do this." Silent (the user adds trending audio in-app). The user's screen recording of the Valmora site.
// One idea: the unveil. The car sits under its cover through the hook, the cover comes off on the drop, every section gets
// one bar with a punch-in. Then the window pulls back, a cover falls over it, and on the end card the cover whips off the price.
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { SRC_FRAMES, DROP, STATEMENT, END, MAP, SECTIONS, CHIPS, CUTS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

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
        <div style={{ position: "absolute", left: 40, right: 40, top: 300, ...caption }}>
          <div style={{ fontSize: 84, letterSpacing: "-0.02em", ...pop(sp(f, -6, 11, 300), 1.3) }}>POV: websites in 2026</div>
        </div>
        <div style={{ position: "absolute", left: 14, top: 590, transform: `translate(${sx}px, ${sy}px)` }}>
          <Browser i={i} w={1052} z={z} fy={fy} />
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 1350, ...caption }}>
          {f >= 26 && <div style={{ ...D, fontSize: 92, lineHeight: 1.05, color: C.gold, textShadow: "0 4px 24px rgba(0,0,0,.6)", ...pop(sp(f, 26, 9, 300), 1.8) }}>Claude could never<br />do this.</div>}
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

// the car cover: a cream drape with folds and a rippling hem. lift 0..1 = whipped off up and to the right
function Cloth({ w, h, t = 0, lift = 0, id = "c" }) {
  const n = 7, amp = h * 0.035 * (1 + lift * 3);
  let hem = "";
  for (let k = n; k > 0; k--) {
    const x0 = (k / n) * w * 0.9 + w * 0.05, x1 = ((k - 0.5) / n) * w * 0.9 + w * 0.05, x2 = ((k - 1) / n) * w * 0.9 + w * 0.05;
    hem += ` Q ${x1} ${h + amp * Math.sin(t / 4 + k * 1.7)} ${x2} ${h - amp * 0.4 * Math.cos(t / 5 + k)}`;
  }
  const top = -h * 0.08 - lift * h * 0.3;
  const d = `M ${w * 0.05} ${h} Q ${-w * 0.03} ${h * 0.5} ${w * 0.1} ${h * 0.14} Q ${w * 0.5} ${top} ${w * 0.9} ${h * 0.14} Q ${w * 1.03} ${h * 0.5} ${w * 0.95} ${h}` + hem + " Z";
  // irregular soft folds, slightly diagonal, so it reads as fabric and not a radiator
  const folds = [[0, "#D8CCB4"], [0.08, "#F3ECDD"], [0.19, "#D2C4A8"], [0.24, "#EEE6D5"], [0.38, "#F5EFE2"], [0.47, "#CFC0A3"], [0.55, "#ECE3D1"], [0.69, "#F4EDDF"], [0.78, "#D4C6AA"], [0.86, "#EFE7D7"], [1, "#CBBB9D"]];
  return (
    <svg width={w} height={h * 1.1} viewBox={`0 ${-h * 0.1} ${w} ${h * 1.2}`} style={{ overflow: "visible", filter: `drop-shadow(0 30px 40px rgba(0,0,0,.55)) blur(${lift * 5}px)` }}>
      <defs>
        <linearGradient id={id + "f"} x1="0" x2="1" gradientTransform={`rotate(${8 + lift * 20} .5 .5)`}>{folds.map(([o, c], k) => <stop key={k} offset={o} stopColor={c} />)}</linearGradient>
        <linearGradient id={id + "s"} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#5A4A35" stopOpacity=".45" /></linearGradient>
      </defs>
      <path d={d} fill={`url(#${id}f)`} />
      <path d={d} fill={`url(#${id}s)`} />
    </svg>
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

// ── 2 · pull back: this is an Appify animated website. A cover falls over it ──────────────────────────
function Statement({ f, W, H }) {
  const t = f - STATEMENT, back = interpolate(t, [0, 18], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const i = interpolate(t, [0, 90], [600, 712], clamp);
  const drop = interpolate(t, [50, 64], [0, 1], { ...clamp, easing: easeIn });
  const settle = t >= 64 ? Math.exp(-(t - 64) / 5) * Math.sin((t - 64) / 2) : 0;
  const bw = interpolate(back, [0, 1], [1052, 800]);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Hall t={t} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 96, color: "#fff", ...pop(sp(t, 12, 10, 300)) }}>This is an <span style={{ color: C.gold }}>Appify</span></div>
          <div style={{ ...D, fontSize: 132, color: "#fff", marginTop: 14, ...pop(sp(t, 20, 9, 300), 1.6) }}>animated website.</div>
        </div>
        <div style={{ position: "absolute", left: interpolate(back, [0, 1], [14, 140]), top: interpolate(back, [0, 1], [590, 760]) }}>
          <Browser i={i} w={bw} style={{ transform: `rotate(${back * -2}deg)` }} />
        </div>
        {t >= 48 && (
          <div style={{ position: "absolute", left: 100, top: interpolate(drop, [0, 1], [-700, 700]) + settle * 14, transform: `rotate(-2deg) scaleY(${1 - settle * 0.03})`, transformOrigin: "50% 100%" }}>
            <Cloth w={880} h={560} t={t} id="st" />
          </div>
        )}
        {t >= 64 && t < 72 && <AbsoluteFill style={{ background: "radial-gradient(ellipse 40% 6% at 50% 68%, rgba(255,255,255,.18), transparent)" }} />}
      </Stage>
    </AbsoluteFill>
  );
}

// ── 3 · end card: the cover whips off the price ───────────────────────────────────────────────────────
function EndCard({ f, W, H }) {
  const t = f - END, devP = sp(t, 2, 13, 200), cta = sp(t, 32, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 42) / 4);
  const dw = 400, dx = 60, dy = 1920 - 330 - dw * 830 / 420 + 40;
  const lift = interpolate(t, [14, 28], [0, 1], { ...clamp, easing: easeIn });
  const price = sp(t, 16, 9, 280);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Hall t={t} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 68, color: "#fff", ...pop(sp(t, 4, 10, 300)) }}>Animated websites</div>
          <div style={{ ...D, fontSize: 170, color: C.gold, marginTop: 6, textShadow: `0 10px ${40 + 30 * price}px rgba(232,211,163,.35)`, transform: `scale(${interpolate(price, [0, 1], [0.92, 1])})` }}><span style={{ fontSize: 64, color: "#fff", verticalAlign: "0.9em", marginRight: 16 }}>from</span>$500</div>
        </div>
        {lift < 1 && (
          <div style={{ position: "absolute", left: 170, top: 230 - lift * 900, transform: `translateX(${lift * 620}px) rotate(${lift * 38}deg) skewX(${lift * -14}deg)`, transformOrigin: "0% 100%", opacity: 1 - lift * 0.3 }}>
            <Cloth w={740} h={300} t={t} lift={lift} id="ec" />
          </div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ padding: "22px 50px", borderRadius: 30, background: C.cream, textAlign: "center", boxShadow: "0 20px 60px rgba(232,211,163,.25)" }}>
            <div style={{ ...M, fontSize: 26, color: C.wine, letterSpacing: "0.2em" }}>DM</div>
            <div style={{ ...D, fontSize: 74, color: C.ink, marginTop: 6 }}>“ANIMATED WEBSITE”</div>
            <div style={{ ...UI, fontSize: 30, color: C.wine, marginTop: 10 }}>for a website like this</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 70, top: 1120, display: "grid", justifyItems: "end", gap: 14, ...rise(sp(t, 42, 12, 220)) }}>
          <svg viewBox={WORDMARK.viewBox} width={330} height={330 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.gold} /></svg>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.75)" }}>@appifylb</div>
          <div style={{ ...UI, fontWeight: 400, fontSize: 26, color: "rgba(255,255,255,.6)", marginTop: 10, textAlign: "right", lineHeight: 1.35 }}>Valmora · designed & built by Appify<br />a concept marque, imagery illustrative</div>
        </div>
        <div style={{ position: "absolute", left: dx, top: dy, transform: `translateY(${(1 - Math.min(1, devP)) * 700}px)` }}>
          <Dev width={dw} point={1} brow={16} lid={0.06} smile={1} look={4} happy={t > 24 ? 1 : 0} tilt={Math.sin(t / 8) * 2} />
        </div>
        {t >= 16 && t < 40 && [0, 1, 2, 3, 4].map((k) => {
          const g = interpolate(t, [16 + k * 2, 26 + k * 2, 36 + k], [0, 1, 0], clamp);
          return <Spark key={k} size={30 + (k % 3) * 18} style={{ position: "absolute", left: [230, 820, 330, 900, 560][k], top: [300, 280, 470, 430, 250][k], opacity: g, transform: `scale(${g}) rotate(${t * 4}deg)` }} />;
        })}
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
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.gold} strokeWidth={14 * (1 - p)} /></svg>}
      {SECTIONS.map((s) => f >= s && f < s + 4 && <Flash key={s} f={f} start={s} peak={s === DROP ? 0.35 : 0.14} />)}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.2} />}
      <Vignette strength={0.12} />
      <Grain f={f} opacity={0.025} />
    </AbsoluteFill>
  );
};
