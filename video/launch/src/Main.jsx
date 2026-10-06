// WTC launch film, 20 s. One idea: a gold chronograph hand sweeps through every chapter
// (it draws the opening tick ring, wipes between scenes, lights the wall) and ends as the hand in the WTC mark.
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { S, T, PLANETS, STRAPS, ALL } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, after, shake, Flash, Shockwave, Burst, Streak, RgbSplit, Grain, Vignette, TAU } from "./fx.jsx";

const C = { ink: "#09090a", surface: "#16161a", line: "#26262c", chalk: "#f4f3f0", mute: "#8d8d95", gold: "#c9a227", goldSoft: "#e2c469" };
const DISPLAY = "Grotesk", SERIF = "Serif", SANS = "Inter";
const inOut = Easing.inOut(Easing.cubic);
const watch = (sku) => staticFile(`w/${sku}.png`);
const WATCH_AR = 0.59; // packshot width / height (head + strap)

const useLayout = () => {
  const { width: W, height: H } = useVideoConfig();
  const u = Math.min(W, H) / 1080;
  return { W, H, u, cx: W / 2, cy: H / 2, wide: W > H };
};

// ─────────────────────────────────────────── the through-line: a gold hand
function Hand({ cx, cy, len, deg, width = 6, glow = 1, tail = 0.18 }) {
  const a = ((deg - 90) * Math.PI) / 180;
  const x2 = cx + Math.cos(a) * len, y2 = cy + Math.sin(a) * len;
  const x0 = cx - Math.cos(a) * len * tail, y0 = cy - Math.sin(a) * len * tail;
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <line x1={x0} y1={y0} x2={x2} y2={y2} stroke={C.goldSoft} strokeWidth={width * 4} strokeLinecap="round" opacity={0.18 * glow} />
      <line x1={x0} y1={y0} x2={x2} y2={y2} stroke={C.gold} strokeWidth={width} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={width * 1.6} fill={C.gold} />
      <circle cx={cx} cy={cy} r={width * 0.6} fill={C.ink} />
    </svg>
  );
}

// Clock wipe: reveals children clockwise from 12 o'clock with the gold hand on the edge.
function ClockWipe({ dur, children }) {
  const f = useCurrentFrame();
  const { W, H, cx, cy, u } = useLayout();
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: inOut });
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const deg = p * 360;
  const mask = `conic-gradient(from 0deg at 50% 50%, #000 0deg, #000 ${deg}deg, transparent ${deg + 0.01}deg)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>{children}</AbsoluteFill>
      <Hand cx={cx} cy={cy} len={Math.hypot(W, H)} deg={deg} width={5 * u} tail={0} glow={2} />
    </AbsoluteFill>
  );
}

// Text that rises out of a mask, word by word.
function Rise({ f, start, text, style, stagger = 3, dist = 1.1 }) {
  const words = text.split(" ");
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0 0.26em", ...style }}>
      {words.map((w, i) => {
        const p = after(f, start + i * stagger, [0, 14], [0, 1], { easing: easeOut });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em", lineHeight: 1.05 }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * dist * 100}%)` }}>{w}</span>
          </span>
        );
      })}
    </span>
  );
}

const Mono = ({ children, style }) => (
  <div style={{ fontFamily: "Mono", textTransform: "uppercase", letterSpacing: "0.28em", ...style }}>{children}</div>
);

// ─────────────────────────────────────────── 1. open: tick ring + the Moon
function Open() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy, wide } = useLayout();
  const { fps } = useVideoConfig();
  const R = 380 * u;
  const hand = interpolate(f, [0, T.sweepEnd], [150, 360], { ...clamp, easing: Easing.bezier(0.5, 0, 0.25, 1) });
  const spin = f > T.h1 ? (f - T.h1) * 0.35 : 0;
  const [sx, sy] = shake(f, T.h1, 22 * u);
  const slam = f < T.h1 ? 0 : interpolate(spring({ frame: f - T.h1, fps, config: { damping: 12, stiffness: 220 } }), [0, 1], [1.7, 1]);
  const blur = after(f, T.h1, [0, 5], [16, 0]);
  const exit = interpolate(f, [50, 60], [0, 1], { ...clamp, easing: easeIn });
  const wH = wide ? 1.08 * H : 0.55 * H;
  const glow = f < T.h1 ? interpolate(f, [0, T.sweepEnd], [0.15, 0.45], clamp) : interpolate(f - T.h1, [0, 2, 24], [1.2, 1.2, 0.55], clamp);
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const deg = i * 6;
    if (deg > hand && f < T.h1) continue;
    const big = i % 5 === 0;
    const a = ((deg + spin - 90) * Math.PI) / 180;
    const r0 = R * (big ? 0.9 : 0.95);
    const lit = f < T.h1 ? interpolate(hand - deg, [0, 30], [1, 0.45], clamp) : 0.55;
    ticks.push(<line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R}
      stroke={big ? C.gold : C.chalk} strokeWidth={(big ? 5 : 2.2) * u} opacity={lit} strokeLinecap="round" />);
  }
  const textSize = (wide ? 104 : 96) * u;
  const headR = wH * WATCH_AR * 0.5;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(201,162,39,${0.32 * glow}), transparent 55%)` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${1 + exit * 1.8})`, filter: `blur(${exit * 18}px)`, opacity: 1 - exit * 0.6 }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}><circle cx={cx} cy={cy} r={R * 1.04} fill="none" stroke={C.gold} strokeOpacity={0.22} strokeWidth={1.5 * u} />{ticks}</svg>
        {f < T.h1 && <Hand cx={cx} cy={cy} len={R * 1.02} deg={hand} width={5 * u} glow={1.5} />}
        <Shockwave f={f} cx={cx} cy={cy} start={T.h1} max={Math.hypot(W, H) * 0.6} width={10 * u} rgb="226,196,105" />
        {f >= T.h1 && (
          <Img src={watch("SO33M100")} style={{ position: "absolute", height: wH, left: cx - (wH * WATCH_AR) / 2, top: cy - wH / 2, transform: `scale(${slam}) rotate(${(slam - 1) * -14}deg)`, filter: `blur(${blur}px) drop-shadow(0 ${30 * u}px ${60 * u}px rgba(0,0,0,0.7))` }} />
        )}
        <Streak f={f} start={T.h1} y={cy} color={C.gold} />
        <Burst f={f} cx={cx} cy={cy} start={T.h1} count={110} speed={46 * u} colors={["#fff", C.gold, C.goldSoft]} />
        {/* Every watch, / one insider. */}
        <div style={{ position: "absolute", ...(wide ? { right: cx + headR + 50 * u, top: cy - textSize * 0.6, textAlign: "right" } : { left: 0, right: 0, top: H * 0.13, textAlign: "center" }), fontFamily: DISPLAY, fontWeight: 700, fontSize: textSize, letterSpacing: "-0.045em", color: C.chalk, textTransform: "uppercase" }}>
          <Rise f={f} start={T.w1} text="Every watch," />
        </div>
        <div style={{ position: "absolute", ...(wide ? { left: cx + headR + 50 * u, top: cy - textSize * 0.62 } : { left: 0, right: 0, top: H * 0.79, textAlign: "center" }), fontFamily: SERIF, fontStyle: "italic", fontSize: textSize * 1.12, color: C.goldSoft }}>
          <Rise f={f} start={T.w2} text="one insider." />
        </div>
      </AbsoluteFill>
      <Flash f={f} start={T.h1} peak={0.9} />
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 2. planets: one mission per beat
function Planets() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy, wide } = useLayout();
  const i = Math.min(PLANETS.length - 1, Math.floor(f / T.planetBeat));
  const p = PLANETS[i];
  const lf = f - i * T.planetBeat;
  const dir = i % 2 ? -1 : 1;
  const inP = interpolate(lf, [0, 6], [0, 1], { ...clamp, easing: easeOut });
  const wx = (1 - inP) * W * 0.55 * dir;
  const wBlur = (1 - inP) * 22;
  const drift = lf * 2.2 * u;
  const wordSize = Math.min((W * 0.94) / (p.word.length * 0.6), (wide ? 0.62 : 0.3) * H);
  const outline = i % 2 === 1;
  const wH = wide ? H * 1.32 : H * 0.82;
  const [sx, sy] = shake(f, i * T.planetBeat, 9 * u, 3);
  const pulse = interpolate(lf, [0, 3, 12], [1.06, 1.06, 1], clamp);
  return (
    <AbsoluteFill style={{ background: p.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(255,255,255,0.22), transparent 60%)` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - wordSize * 0.58, textAlign: "center", whiteSpace: "nowrap", fontFamily: DISPLAY, fontWeight: 700, fontSize: wordSize, lineHeight: 1, letterSpacing: "-0.05em",
          color: outline ? "transparent" : p.fg, WebkitTextStroke: outline ? `${4 * u}px ${p.fg}` : "none", opacity: 0.95,
          transform: `translateX(${-wx * 0.35 - drift * dir}px) scale(${pulse})` }}>{p.word}</div>
        <Img src={watch(p.sku)} style={{ position: "absolute", height: wH, left: cx - (wH * WATCH_AR) / 2, top: cy - wH / 2 + (wide ? 0 : H * 0.02),
          transform: `translateX(${wx}px) rotate(${(1 - inP) * 18 * dir + lf * 0.25 * dir}deg)`, filter: `blur(${wBlur}px) drop-shadow(0 ${28 * u}px ${50 * u}px rgba(0,0,0,0.45))` }} />
      </AbsoluteFill>
      <Mono style={{ position: "absolute", left: 56 * u, bottom: 52 * u, fontSize: 22 * u, color: p.fg, opacity: 0.85 }}>Omega × Swatch — {p.name}</Mono>
      <Mono style={{ position: "absolute", right: 56 * u, top: 52 * u, fontSize: 22 * u, color: p.fg, opacity: 0.85 }}>{String(i + 1).padStart(2, "0")} / {String(PLANETS.length).padStart(2, "0")}</Mono>
      <Flash f={lf} start={0} peak={0.35} />
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 3. orbit: the collection circles a counter
const ORBIT = ["SO33W700", "SO33R100", "SO33J100", "SO33N700", "SO33P700", "SO33L100", "SO33C100", "SO33G100",
  "SO33A100", "SO33P100", "SO33T100", "SO33B700", "SO33M700", "SO33N100", "SO33M101", "SO33L103"];
function Orbit() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy, wide } = useLayout();
  const { fps } = useVideoConfig();
  const open = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 90 } });
  const collapse = interpolate(f, [100, 120], [0, 1], { ...clamp, easing: easeIn });
  const rad = open * (1 - collapse);
  const rx = (wide ? 0.42 * W : 0.42 * W) * rad, ry = (wide ? 0.15 * H : 0.1 * H) * rad;
  const rot = 2.2 * (1 - Math.exp(-f / 22)) + f * 0.006 + collapse * 2;
  const n = ORBIT.length;
  const items = ORBIT.map((sku, k) => {
    const a = rot + (k / n) * TAU;
    const z = Math.sin(a);
    const x = cx + Math.cos(a) * rx, y = cy + z * ry + (wide ? 0.06 * H : 0.02 * H);
    const s = 0.55 + 0.45 * ((z + 1) / 2);
    const h = (wide ? 0.34 : 0.2) * H * s;
    return { sku, x, y, z, h, s };
  }).sort((a, b) => a.z - b.z);
  const draw = (it) => (
    <Img key={it.sku} src={watch(it.sku)} style={{ position: "absolute", height: it.h, left: it.x - (it.h * WATCH_AR) / 2, top: it.y - it.h / 2,
      filter: `brightness(${0.45 + 0.55 * it.s}) blur(${(1 - it.s) * 5}px)`, opacity: 1 - collapse * 0.6 }} />
  );
  const cnt = Math.round(interpolate(f, [T.count0, T.count1], [0, 32], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = f < T.count1 ? 0 : interpolate(spring({ frame: f - T.count1, fps, config: { damping: 9, stiffness: 200 } }), [0, 1], [1.25, 1]);
  const cntScale = f < T.count1 ? interpolate(f, [T.count0, T.count1], [0.7, 1], clamp) : land;
  const cIn = after(f, 4, [0, 10], [0, 1]);
  const big = (wide ? 300 : 260) * u;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Stars f={f} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(201,162,39,${0.22 + after(f, T.count1, [0, 2, 20], [0, 0.35, 0.12])}), transparent 50%)` }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={cx} cy={cy + (wide ? 0.06 * H : 0.02 * H)} rx={Math.max(1, rx)} ry={Math.max(1, ry)} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={1.5 * u} strokeDasharray={`${3 * u} ${9 * u}`} />
      </svg>
      {items.filter((it) => it.z < 0).map(draw)}
      {items.filter((it) => it.z >= 0).map(draw)}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${big * 1.9}px ${big * 1.0}px at 50% ${((cy - 0.07 * H) / H) * 100}%, rgba(9,9,10,0.95) 30%, rgba(9,9,10,0.6) 60%, transparent)`, opacity: cIn * (1 - collapse) }} />
      <AbsoluteFill style={{ background: `linear-gradient(to top, rgba(9,9,10,0.92) 0%, rgba(9,9,10,0.6) 16%, transparent 30%)`, opacity: after(f, T.line1 - 4, [0, 10], [0, 1]) * (1 - collapse) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 0.07 * H - big * 0.62, textAlign: "center", opacity: cIn * (1 - collapse), transform: `scale(${cntScale * (1 - collapse * 0.6)})` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: big, lineHeight: 1, letterSpacing: "-0.06em", color: C.chalk, fontVariantNumeric: "tabular-nums" }}>{cnt}</div>
        <Mono style={{ fontSize: 26 * u, color: C.goldSoft, marginTop: 4 * u, textShadow: `0 0 ${12 * u}px #000, 0 0 ${24 * u}px #000` }}>watches · one collection</Mono>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: (wide ? 70 : 300) * u, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: (wide ? 64 : 70) * u, color: C.chalk, opacity: 1 - collapse, lineHeight: 1.1 }}>
        <Rise f={f} start={T.line1} text="Checked in hand." style={{ justifyContent: "center" }} />
        {wide ? " " : <br />}
        <span style={{ color: C.goldSoft }}><Rise f={f} start={T.line2} text="Shipped complete." style={{ justifyContent: "center" }} /></span>
      </div>
      <Flash f={f} start={T.count1} peak={0.25} color={C.goldSoft} />
    </AbsoluteFill>
  );
}

function Stars({ f, n = 90 }) {
  const { W, H } = useLayout();
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const x = random(`sx${i}`) * W, y = random(`sy${i}`) * H, r = 0.6 + random(`sr${i}`) * 1.6;
        const tw = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(f * 0.15 + i));
        return <circle key={i} cx={(x - f * (0.3 + r * 0.4) + W) % W} cy={y} r={r} fill="#fff" opacity={tw * 0.6} />;
      })}
    </svg>
  );
}

// ─────────────────────────────────────────── 4. strap studio
// The try-on photos end in a flat cut at the top and bottom; fade the strap out before it, as on the site.
const STRAP_FADE = "linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)";
function Strap() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy, wide } = useLayout();
  const { fps } = useVideoConfig();
  let k = 0;
  for (let j = 0; j < T.swaps.length; j++) if (f >= T.swaps[j]) k = j;
  const cur = STRAPS[k], prev = STRAPS[Math.max(0, k - 1)];
  const lf = f - T.swaps[k];
  const wipe = k === 0 ? 1 : interpolate(lf, [0, 5], [0, 1], { ...clamp, easing: easeOut });
  const final = k === T.swaps.length - 1;
  const bump = final ? interpolate(spring({ frame: lf, fps, config: { damping: 10, stiffness: 180 } }), [0, 1], [1.06, 1]) : interpolate(lf, [0, 2, 7], [1.02, 1.02, 1], clamp);
  const tint = prev.tint === cur.tint ? cur.tint : cur.tint;
  const enter = spring({ frame: f, fps, config: { damping: 16, stiffness: 120 } });
  const exit = interpolate(f, [116, 132], [0, 1], { ...clamp, easing: easeIn });
  const sH = wide ? H * 0.86 : H * 0.56;
  const sW = sH * (605 / 1084);
  const wx = wide ? W * 0.68 : cx, wy = wide ? cy : H * 0.56;
  const img = (file, clip) => (
    <div style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 ${30 * u}px ${60 * u}px rgba(0,0,0,0.55))` }}>
      <Img src={staticFile(`s/${file}.png`)} style={{ position: "absolute", height: sH, left: wx - sW / 2, top: wy - sH / 2, clipPath: clip, WebkitMaskImage: STRAP_FADE, maskImage: STRAP_FADE }} />
    </div>
  );
  const tx = wide ? 120 * u : 0;
  const chip = 46 * u, gap = 18 * u;
  const railW = STRAPS.length * chip + (STRAPS.length - 1) * gap;
  const railX = wide ? tx : cx - railW / 2, railY = wide ? cy + 190 * u : H * 0.9;
  const ringX = railX + k * (chip + gap) + chip / 2;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${(wx / W) * 100}% 50%, ${tint}, ${C.ink} 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${(wx / W) * 100}% 50%, ${STRAPS[k].chip}${final ? "55" : "22"}, transparent 45%)`, opacity: wipe }} />
      <AbsoluteFill style={{ transform: `translateY(${(1 - enter) * 80 * u - exit * H * 1.1}px)` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", transform: `scale(${bump})`, transformOrigin: `${wx}px ${wy}px` }}>
          {k > 0 && img(prev.file, "none")}
          {img(cur.file, `inset(0 0 ${(1 - wipe) * 100}% 0)`)}
          {k > 0 && wipe < 1 && (
            <div style={{ position: "absolute", left: wx - sW * 0.55, width: sW * 1.1, top: wy - sH / 2 + wipe * sH - 2 * u, height: 4 * u, background: C.goldSoft, boxShadow: `0 0 ${30 * u}px ${8 * u}px ${C.gold}88` }} />
          )}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateY(${-exit * H * 0.6}px)`, opacity: 1 - exit }}>
        <div style={{ position: "absolute", left: wide ? tx : 0, right: wide ? undefined : 0, top: wide ? cy - 250 * u : H * 0.07, textAlign: wide ? "left" : "center" }}>
          <Mono style={{ fontSize: 24 * u, color: C.goldSoft, opacity: after(f, 4, [0, 8], [0, 1]) }}>Strap Studio</Mono>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: (wide ? 128 : 120) * u, letterSpacing: "-0.045em", color: C.chalk, lineHeight: 1, marginTop: 18 * u, textTransform: "uppercase" }}>
            <Rise f={f} start={8} text="Try it on" style={{ justifyContent: wide ? "flex-start" : "center" }} />
          </div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: (wide ? 120 : 112) * u, color: C.goldSoft, lineHeight: 1.05 }}>
            <Rise f={f} start={18} text="before you buy." style={{ justifyContent: wide ? "flex-start" : "center" }} />
          </div>
        </div>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {STRAPS.map((s, j) => {
            const a = after(f, 20 + j * 2, [0, 10], [0, 1], { easing: easeOut });
            const x = railX + j * (chip + gap) + chip / 2;
            return (
              <g key={j} transform={`translate(${x} ${railY + (1 - a) * 30 * u})`} opacity={a}>
                <circle r={chip / 2} fill={s.chip} stroke={s.ring || "rgba(255,255,255,0.18)"} strokeWidth={s.ring ? 4 * u : 1.5 * u} />
              </g>
            );
          })}
          <circle cx={ringX} cy={railY} r={chip / 2 + 9 * u} fill="none" stroke={C.gold} strokeWidth={3 * u} opacity={after(f, 24, [0, 8], [0, 1])} />
        </svg>
        <Mono style={{ position: "absolute", left: wide ? tx : 0, right: wide ? undefined : 0, textAlign: wide ? "left" : "center", top: railY + 50 * u, fontSize: 20 * u, color: C.mute, opacity: after(f, 30, [0, 10], [0, 1]) }}>
          {cur.file.replace("vertech-", "").replace(/-/g, " ")}
        </Mono>
      </AbsoluteFill>
      {final && <Flash f={lf} start={0} peak={0.3} color={C.goldSoft} />}
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 5. the wall
function Wall() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy, wide } = useLayout();
  const cols = wide ? 11 : 6, rows = wide ? 3 : 5;
  const cellW = wide ? W / 8.4 : W / 4.3, cellH = cellW / WATCH_AR * 0.62;
  const pull = interpolate(f, [0, 48], [1.9, 0.92], { ...clamp, easing: easeOut });
  const dive = interpolate(f, [66, 90], [0, 1], { ...clamp, easing: easeIn });
  const scale = pull * (1 + dive * 9);
  const sweep = interpolate(f, [26, 62], [-60, 240], { ...clamp, easing: inOut }); // the hand, as light
  const cards = [];
  let n = 0;
  const midR = (rows - 1) / 2, midC = (cols - 1) / 2;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const sku = ALL[n++ % ALL.length];
    const d = Math.hypot(r - midR, c - midC);
    const a = after(f, d * 2.2, [0, 12], [0, 1], { easing: easeOut });
    const x = cx + (c - midC) * cellW, y = cy + (r - midR) * cellH;
    const ang = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
    const hit = Math.max(0, 1 - Math.abs(((ang - sweep + 540) % 360) - 180) / 22);
    const h = cellH * 1.45;
    cards.push(
      <Img key={`${r}-${c}`} src={watch(sku)} style={{ position: "absolute", height: h, left: x - (h * WATCH_AR) / 2, top: y - h / 2,
        opacity: a, transform: `translateY(${(1 - a) * 60 * u}px) scale(${0.85 + a * 0.15})`, filter: `brightness(${0.62 + hit * 0.7})` }} />
    );
  }
  const textO = after(f, 20, [0, 10], [0, 1]) * (1 - dive * 3);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${-6 + dive * 8}deg)`, transformOrigin: `${cx}px ${cy}px`, opacity: 1 - interpolate(f, [80, 90], [0, 1], clamp) }}>
        {cards}
      </AbsoluteFill>
      {f > 24 && f < 64 && <AbsoluteFill style={{ background: `conic-gradient(from ${sweep - 14}deg at 50% 50%, transparent 0deg, rgba(226,196,105,0.28) 12deg, rgba(255,240,200,0.5) 14deg, transparent 15deg)`, mixBlendMode: "screen" }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(9,9,10,0.82) 0%, rgba(9,9,10,0.55) 30%, transparent 60%)", opacity: textO }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 120 * u, textAlign: "center", opacity: textO }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: (wide ? 120 : 104) * u, letterSpacing: "-0.045em", color: C.chalk, textTransform: "uppercase", lineHeight: 1 }}>
          <Rise f={f} start={20} text="The whole collection." style={{ justifyContent: "center" }} />
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: (wide ? 112 : 104) * u, color: C.goldSoft, lineHeight: 1.1 }}>
          <Rise f={f} start={30} text="One place." style={{ justifyContent: "center" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 6. now online: the shop on a laptop
// The page is laid out at 1440 px wide (like the real site at desktop size) and scaled onto the screen.
const PW = 1440, PH = 900, CHROME = 44, NAV = 64;
const CARDS = [
  { sku: "SO33W700", name: "Mission to the Moonphase", sub: "Full Moon" },
  { sku: "SO33M100", name: "Mission to the Moon", sub: "Omega × Swatch" },
  { sku: "SO33B700", name: "Mission to the Moonphase", sub: "New Moon" },
  { sku: "SO33N700", name: "Super Blue Moonphase", sub: "Omega × Swatch" },
];
const PICK = 1; // the card the cursor buys
const SCROLL = 900;
// Card geometry on the page (page px).
const CARD_W = 300, CARD_GAP = 28, CARD_X0 = (PW - (4 * CARD_W + 3 * CARD_GAP)) / 2, CARD_Y = NAV + 820 + 200, CARD_H = 470;
const btn = (i) => ({ x: CARD_X0 + i * (CARD_W + CARD_GAP) + CARD_W / 2, y: CARD_Y + CARD_H - 44 });

function Page({ f }) {
  const scroll = interpolate(f, [T.scroll0, T.scroll1], [0, SCROLL], { ...clamp, easing: inOut });
  const loaded = after(f, T.load, [0, 10], [0, 1], { easing: easeOut });
  const added = f >= T.click;
  const badge = f < T.click ? 0 : spring({ frame: f - T.click, fps: 30, config: { damping: 8, stiffness: 220 } });
  const toast = f < T.toast ? 0 : spring({ frame: f - T.toast, fps: 30, config: { damping: 14, stiffness: 160 } });
  const hb = btn(PICK);
  const press = f >= T.click && f < T.click + 4 ? 0.94 : 1;
  // cursor: comes in from the right after the scroll, lands on the button
  const mv = interpolate(f, [T.move0, T.click - 2], [0, 1], { ...clamp, easing: inOut });
  const curX = interpolate(mv, [0, 1], [PW * 0.92, hb.x + 30]);
  const curY = interpolate(mv, [0, 1], [PH * 0.45, hb.y - SCROLL + CHROME - 6]);
  const hover = mv > 0.9;
  return (
    <div style={{ width: PW, height: PH, background: C.ink, position: "relative", overflow: "hidden", fontFamily: SANS, color: C.chalk }}>
      {/* the page */}
      <div style={{ position: "absolute", left: 0, right: 0, top: CHROME, bottom: 0, overflow: "hidden", opacity: loaded }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -scroll + (1 - loaded) * 30 }}>
          {/* hero */}
          <div style={{ position: "relative", height: 820, marginTop: NAV, borderBottom: `1px solid ${C.line}`, overflow: "hidden" }}>
            <Img src={watch("SO33M100")} style={{ position: "absolute", right: 120, top: -120, height: 1040, transform: `rotate(-8deg) translateY(${-scroll * 0.25}px)` }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #09090a 0%, rgba(9,9,10,0.88) 30%, rgba(9,9,10,0.4) 50%, transparent 70%)" }} />
            <div style={{ position: "absolute", left: 96, bottom: 76, width: 760 }}>
              <div style={{ fontFamily: "Mono", fontSize: 12, letterSpacing: "0.28em", color: C.goldSoft, textTransform: "uppercase" }}>Watch Trade Chronicles</div>
              <div style={{ marginTop: 20, fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, lineHeight: 0.95, letterSpacing: "-0.03em" }}>
                Every watch,<br /><span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", color: C.goldSoft }}>one insider.</span>
              </div>
              <div style={{ marginTop: 24, fontSize: 16, lineHeight: 1.6, color: C.mute, width: 470 }}>Carefully sourced watches, checked in hand and shipped complete — with everything they came with.</div>
              <div style={{ marginTop: 34, display: "flex", gap: 12 }}>
                <div style={{ borderRadius: 999, background: C.chalk, color: C.ink, padding: "15px 28px", fontSize: 14, fontWeight: 600 }}>Shop the collection</div>
                <div style={{ borderRadius: 999, border: `1px solid ${C.line}`, padding: "15px 28px", fontSize: 14 }}>Try the Strap Studio</div>
              </div>
              <div style={{ marginTop: 52, paddingTop: 26, borderTop: `1px solid ${C.line}`, display: "flex", gap: 64 }}>
                {[["200+", "Satisfied customers"], ["26", "Items in stock"], ["100%", "Carefully selected"]].map(([v, l]) => (
                  <div key={l}><div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 30 }}>{v}</div><div style={{ marginTop: 4, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.mute }}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
          {/* bestsellers */}
          <div style={{ position: "relative", height: 900, padding: "84px 96px 0" }}>
            <div style={{ fontFamily: "Mono", fontSize: 12, letterSpacing: "0.28em", color: C.goldSoft, textTransform: "uppercase" }}>Bestsellers</div>
            <div style={{ marginTop: 16, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: "-0.03em" }}>The most wanted, <span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", color: C.goldSoft }}>ready to ship.</span></div>
            {CARDS.map((c, i) => {
              const isPick = i === PICK;
              const lift = isPick && hover ? -6 : 0;
              return (
                <div key={c.sku} style={{ position: "absolute", left: CARD_X0 + i * (CARD_W + CARD_GAP), top: CARD_Y - NAV - 820, width: CARD_W, height: CARD_H, borderRadius: 26, border: `1px solid ${isPick && hover ? C.gold : C.line}`,
                  background: "radial-gradient(ellipse at 50% 40%, #1b1b21 0%, #111114 60%, #0b0b0d 100%)", overflow: "hidden", transform: `translateY(${lift}px)` }}>
                  <div style={{ position: "absolute", left: 18, top: 16, fontFamily: DISPLAY, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: C.goldSoft, border: `1px solid rgba(201,162,39,0.3)`, borderRadius: 99, padding: "4px 10px" }}>No. {String(i + 1).padStart(2, "0")}</div>
                  <Img src={watch(c.sku)} style={{ position: "absolute", left: (CARD_W - 270 * WATCH_AR) / 2, top: 30, height: 270 }} />
                  <div style={{ position: "absolute", left: 20, right: 20, top: 316 }}>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em" }}>{c.name}</div>
                    <div style={{ marginTop: 3, fontSize: 13, color: C.mute }}>{c.sub}</div>
                  </div>
                  <div style={{ position: "absolute", left: 20, right: 20, bottom: 22, height: 46, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600,
                    background: isPick && added ? C.gold : isPick && hover ? C.goldSoft : C.chalk, color: C.ink, transform: `scale(${isPick ? press : 1})` }}>
                    {isPick && added ? "Added to bag ✓" : "Add to bag"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* sticky header */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: NAV, background: "rgba(9,9,10,0.95)", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 96px" }}>
          <div style={{ fontFamily: SERIF, fontSize: 30, letterSpacing: "0.04em" }}>WTC</div>
          <div style={{ display: "flex", gap: 36, fontSize: 13, color: C.mute, fontWeight: 500 }}>{["Shop", "Strap Studio", "Collections", "Reviews"].map((n) => <span key={n}>{n}</span>)}</div>
          <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.chalk} strokeWidth="1.6"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {badge > 0.01 && <div style={{ position: "absolute", right: -2, top: -2, width: 20, height: 20, borderRadius: 99, background: C.gold, color: C.ink, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${badge})` }}>1</div>}
          </div>
        </div>
        {/* toast */}
        {toast > 0.01 && (
          <div style={{ position: "absolute", right: 40, top: NAV + 20, width: 360, padding: 16, borderRadius: 18, background: "#16161a", border: `1px solid ${C.line}`, display: "flex", gap: 14, alignItems: "center",
            transform: `translateX(${(1 - toast) * 420}px)`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, background: "#0d0d10", position: "relative", overflow: "hidden" }}><Img src={watch(CARDS[PICK].sku)} style={{ position: "absolute", height: 92, left: (54 - 92 * WATCH_AR) / 2, top: -19 }} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>Added to your bag</div><div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{CARDS[PICK].name}</div></div>
            <div style={{ borderRadius: 99, background: C.gold, color: C.ink, padding: "9px 14px", fontSize: 12, fontWeight: 700 }}>Checkout</div>
          </div>
        )}
      </div>
      {/* browser chrome */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: CHROME, background: "#141417", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 14, padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 7 }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 99, background: c }} />)}</div>
        <div style={{ flex: 1, maxWidth: 620, margin: "0 auto", height: 28, borderRadius: 8, background: "#1f1f24", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", fontSize: 14, color: C.chalk }}>
          <svg width="12" height="12" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke={C.mute} strokeWidth="2.4" /><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke={C.mute} strokeWidth="2.4" /></svg>
          <UrlTyping f={f} />
        </div>
      </div>
      {f < T.load && <div style={{ position: "absolute", left: 0, right: 0, top: CHROME, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: SERIF, fontSize: 64, color: "#222" }}>WTC</div></div>}
      {/* load bar */}
      {f >= T.type1 && f < T.load + 12 && <div style={{ position: "absolute", left: 0, top: CHROME - 2, height: 3, width: `${interpolate(f, [T.type1, T.load + 8], [0, 100], clamp)}%`, background: C.gold }} />}
      {/* cursor */}
      {f >= T.move0 && (
        <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: "absolute", left: curX, top: curY, transform: `scale(${press})`, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.6))" }}>
          {hover ? <path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.5 14a1.5 1.5 0 0 1 2.4-1.8L9 15" fill="#fff" stroke="#000" strokeWidth="1.2" />
            : <path d="M4 2l15 11-7 1-4 7z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />}
        </svg>
      )}
      {f >= T.click && f < T.click + 14 && (
        <div style={{ position: "absolute", left: hb.x - 40, top: hb.y - SCROLL - 40 + CHROME, width: 80, height: 80, borderRadius: 99, border: `2px solid ${C.goldSoft}`,
          transform: `scale(${interpolate(f - T.click, [0, 14], [0.3, 1.6], clamp)})`, opacity: interpolate(f - T.click, [0, 14], [1, 0], clamp) }} />
      )}
    </div>
  );
}

function UrlTyping({ f }) {
  const url = "watchtradechronicles.com";
  const n = Math.round(interpolate(f, [T.type0, T.type1], [0, url.length], clamp));
  const caret = f < T.load && Math.floor(f / 6) % 2 === 0;
  return <span>{url.slice(0, n)}<span style={{ opacity: caret ? 1 : 0, color: C.gold }}>|</span></span>;
}

function Site() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy, wide } = useLayout();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: f, fps, config: { damping: 16, stiffness: 90 } });
  const lid = interpolate(spring({ frame: f - 4, fps, config: { damping: 13, stiffness: 70 } }), [0, 1], [-92, 0]);
  const on = after(f, 14, [0, 8], [0, 1]);
  const push = interpolate(f, [T.push, 150], [0, 1], { ...clamp, easing: easeIn });
  const SW = wide ? W * 0.6 : W * 0.92;           // screen width incl. bezel
  const bez = 16 * u;
  const SH = (SW - 2 * bez) * (PH / PW) + 2 * bez + 8 * u;
  const lx = wide ? W * 0.635 : cx, ly = wide ? cy + 10 * u : H * 0.52; // screen centre
  const scale = (SW - 2 * bez) / PW;
  const zoom = 1 + push * 2.2;
  const textX = 110 * u;
  const tilt = interpolate(f, [0, 60, 150], [10, 4, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${(lx / W) * 100}% ${(ly / H) * 100}%, rgba(201,162,39,${0.08 + on * 0.18}), transparent 60%)` }} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${lx}px ${ly}px`, opacity: 1 - interpolate(f, [142, 150], [0, 1], clamp) }}>
        {/* the laptop */}
        <div style={{ position: "absolute", left: lx - SW / 2, top: ly - SH / 2 + (1 - rise) * 260 * u, width: SW, height: SH + 60 * u, perspective: 2400 * u, transform: `rotateY(${-tilt}deg)` }}>
          <div style={{ position: "absolute", left: SW * 0.08, right: SW * 0.08, top: SH + 34 * u, height: 50 * u, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.85), transparent 70%)", filter: `blur(${8 * u}px)` }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transformOrigin: "50% 100%", transform: `rotateX(${lid}deg)`, borderRadius: 22 * u, background: "linear-gradient(180deg,#2a2a2f,#18181c)", padding: bez, boxShadow: `0 0 0 ${1.5 * u}px #3a3a40 inset, 0 ${40 * u}px ${90 * u}px rgba(0,0,0,0.6)` }}>
            <div style={{ position: "absolute", left: SW / 2 - 4 * u, top: 6 * u, width: 8 * u, height: 8 * u, borderRadius: 99, background: "#0c0c0e" }} />
            <div style={{ position: "relative", width: SW - 2 * bez, height: (SW - 2 * bez) * (PH / PW), borderRadius: 6 * u, overflow: "hidden", background: "#000", marginTop: 8 * u }}>
              <div style={{ width: PW, height: PH, transform: `scale(${scale})`, transformOrigin: "0 0", opacity: on }}><Page f={f} /></div>
              {/* glare */}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${interpolate(f, [14, 70], [-20, 90], clamp)}%, rgba(255,255,255,0.10) ${interpolate(f, [14, 70], [-10, 100], clamp)}%, transparent ${interpolate(f, [14, 70], [0, 110], clamp)}%)` }} />
            </div>
          </div>
          {/* base */}
          <div style={{ position: "absolute", left: -SW * 0.07, width: SW * 1.14, top: SH - 2 * u, height: 26 * u, background: "linear-gradient(180deg,#3a3a40 0%,#232327 55%,#151518 100%)", clipPath: `polygon(0 0, 100% 0, 98.5% 100%, 1.5% 100%)`, borderRadius: `0 0 ${14 * u}px ${14 * u}px` }}>
            <div style={{ position: "absolute", left: "50%", marginLeft: -SW * 0.08, width: SW * 0.16, top: 0, height: 9 * u, background: "#1a1a1e", borderRadius: `0 0 ${10 * u}px ${10 * u}px` }} />
          </div>
        </div>
      </AbsoluteFill>
      {/* the message */}
      <div style={{ position: "absolute", ...(wide ? { left: textX, top: cy - 200 * u, width: W * 0.27 } : { left: 0, right: 0, top: H * 0.1, textAlign: "center" }), opacity: 1 - push * 2 }}>
        <Mono style={{ fontSize: (wide ? 20 : 24) * u, color: C.goldSoft, opacity: after(f, T.now - 6, [0, 8], [0, 1]) }}>New · Online store</Mono>
        <div style={{ marginTop: 20 * u, fontFamily: DISPLAY, fontWeight: 700, fontSize: (wide ? 112 : 124) * u, letterSpacing: "-0.045em", lineHeight: 0.95, textTransform: "uppercase", color: C.chalk }}>
          <Rise f={f} start={T.now} text="Now online." style={{ justifyContent: wide ? "flex-start" : "center" }} />
        </div>
        <div style={{ marginTop: 10 * u, fontFamily: SERIF, fontStyle: "italic", fontSize: (wide ? 88 : 96) * u, color: C.goldSoft, lineHeight: 1.05 }}>
          <Rise f={f} start={T.order} text="Order from anywhere." style={{ justifyContent: wide ? "flex-start" : "center" }} />
        </div>
      </div>
      {!wide && (
        <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.78, textAlign: "center", opacity: after(f, T.toast, [0, 10], [0, 1]) * (1 - push * 2) }}>
          <Mono style={{ fontSize: 26 * u, color: C.chalk }}>Add to bag · Checkout · Delivered</Mono>
        </div>
      )}
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 7. the mark
function Logo() {
  const f = useCurrentFrame();
  const { W, H, u, cx, wide } = useLayout();
  const { fps } = useVideoConfig();
  const h = T.logoHit;
  const cy = wide ? H * 0.34 : H * 0.36;
  const R = 215 * u;
  const push = interpolate(f, [h, 120], [1, 1.05], clamp);
  const [sx, sy] = shake(f, h, 18 * u);
  const slam = f < h ? 0 : interpolate(spring({ frame: f - h, fps, config: { damping: 11, stiffness: 210 } }), [0, 1], [1.5, 1]);
  const blur = after(f, h, [0, 5], [14, 0]);
  const ca = f < h ? 0 : 14 * Math.exp(-(f - h) / 4);
  const handDeg = f < h ? 90 : interpolate(spring({ frame: f - h - 2, fps, config: { damping: 9, stiffness: 120 } }), [0, 1], [90, -28]);
  const tickAngles = [-90, -60, -30, 0, 30, 60, 90];
  const glow = f < h ? 0 : interpolate(f - h, [0, 3, 30], [1.3, 1.3, 0.6], clamp);
  const tag = after(f, T.tagline, [0, 16], [0, 1], { easing: easeOut });
  const url = "watchtradechronicles.com";
  const typed = url.length;
  const urlIn = after(f, T.url0 - 6, [0, 10], [0, 1], { easing: easeOut });
  const cta = f < T.cta ? 0 : spring({ frame: f - T.cta, fps, config: { damping: 12, stiffness: 160 } });
  const sheen = interpolate(f, [T.sheen, T.sheen + 22], [-30, 130], clamp);
  const wtcSize = 240 * u;
  const caret = 0;
  const mark = (
    <div style={{ position: "absolute", left: 0, right: 0, top: cy + 2 * u, textAlign: "center", fontFamily: SERIF, fontSize: wtcSize, lineHeight: 1, letterSpacing: "0.04em", color: "var(--fx-fill, #f4f3f0)" }}>WTC</div>
  );
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${(cy / H) * 100}%, rgba(201,162,39,${0.3 * glow}), transparent 50%)` }} />
      {f >= h && (
        <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${push})`, transformOrigin: `${cx}px ${cy}px` }}>
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {tickAngles.map((d, i) => {
              const a = after(f, h + 1 + i * 2, [0, 8], [0, 1], { easing: easeOut });
              const rad = ((d - 90) * Math.PI) / 180, side = Math.abs(d) === 90;
              const r0 = R * (side ? 0.86 : 0.8), r1 = R;
              return <line key={d} x1={cx + Math.cos(rad) * r0} y1={cy + Math.sin(rad) * r0} x2={cx + Math.cos(rad) * (r0 + (r1 - r0) * a)} y2={cy + Math.sin(rad) * (r0 + (r1 - r0) * a)}
                stroke={C.chalk} strokeWidth={7 * u} strokeLinecap="round" opacity={a} />;
            })}
          </svg>
          <Hand cx={cx} cy={cy} len={R * 0.78} deg={handDeg} width={4.5 * u} tail={0.08} glow={1.2} />
          <div style={{ position: "absolute", inset: 0, transform: `scale(${slam})`, transformOrigin: `${cx}px ${cy + wtcSize / 2}px`, filter: `blur(${blur}px)` }}>
            <RgbSplit px={ca}>{mark}</RgbSplit>
            <div style={{ position: "absolute", left: 0, right: 0, top: cy + 2 * u, textAlign: "center", fontFamily: SERIF, fontSize: wtcSize, lineHeight: 1, letterSpacing: "0.04em", color: "transparent",
              backgroundImage: `linear-gradient(105deg, transparent ${sheen - 12}%, rgba(255,236,170,0.95) ${sheen}%, transparent ${sheen + 12}%)`, WebkitBackgroundClip: "text", backgroundClip: "text" }}>WTC</div>
          </div>
          <Mono style={{ position: "absolute", left: 0, right: 0, textAlign: "center", top: cy + wtcSize * 1.08, fontSize: 32 * u, letterSpacing: `${0.3 + (1 - tag) * 0.4}em`, color: C.chalk, opacity: tag * 0.85, fontFamily: SERIF, fontStyle: "normal" }}>Your Watch Insider</Mono>
        </AbsoluteFill>
      )}
      <Shockwave f={f} cx={cx} cy={cy} start={h} max={Math.hypot(W, H) * 0.7} width={10 * u} rgb="226,196,105" />
      <Streak f={f} start={h} y={cy + wtcSize * 0.5} color={C.gold} />
      <Burst f={f} cx={cx} cy={cy + wtcSize * 0.4} start={h} count={120} speed={44 * u} colors={["#fff", C.gold, C.goldSoft]} />
      {/* the address */}
      <div style={{ position: "absolute", left: 0, right: 0, top: cy + wtcSize * 1.5 + (wide ? 0 : 80 * u), display: "flex", flexDirection: "column", alignItems: "center", gap: 26 * u }}>
        <div style={{ opacity: urlIn, transform: `translateY(${(1 - urlIn) * 20 * u}px)`, padding: `${16 * u}px ${34 * u}px`, borderRadius: 999, border: `${1.5 * u}px solid ${C.line}`, background: "rgba(22,22,26,0.85)",
          fontFamily: DISPLAY, fontWeight: 500, fontSize: (wide ? 50 : 50) * u, color: C.chalk, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 14 * u, whiteSpace: "nowrap" }}>
          <svg width={22 * u} height={22 * u} viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke={C.goldSoft} strokeWidth="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke={C.goldSoft} strokeWidth="2" /></svg>
          <span>{url.slice(0, typed)}<span style={{ opacity: caret, color: C.gold }}>|</span><span style={{ opacity: 0 }}>{url.slice(typed)}</span></span>
        </div>
        <div style={{ transform: `scale(${cta})`, opacity: Math.min(1, cta * 1.5), padding: `${18 * u}px ${44 * u}px`, borderRadius: 999, background: C.gold, color: C.ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: (wide ? 36 : 40) * u, letterSpacing: "0.02em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          Order now →
        </div>
      </div>
      <Flash f={f} start={h} peak={0.85} />
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── assembly
export const Main = () => {
  useFonts([
    [DISPLAY, "space-grotesk-latin-700-normal.woff2", { weight: "700" }],
    [DISPLAY, "space-grotesk-latin-500-normal.woff2", { weight: "500" }],
    [SERIF, "instrument-serif-latin-400-normal.woff2", { style: "normal" }],
    [SERIF, "instrument-serif-latin-400-italic.woff2", { style: "italic" }],
    [SANS, "inter-latin-400-normal.woff2", { weight: "400" }],
    ["Mono", "GeistMono-500.ttf"],
  ]);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Audio src={staticFile("sound.wav")} />
      <Sequence from={S.open} durationInFrames={S.planets - S.open}><Open /></Sequence>
      <Sequence from={S.planets} durationInFrames={S.orbit - S.planets + T.wipe}><Planets /></Sequence>
      <Sequence from={S.orbit} durationInFrames={S.strap - S.orbit}><ClockWipe dur={T.wipe}><Orbit /></ClockWipe></Sequence>
      <Sequence from={S.strap} durationInFrames={S.wall - S.strap + T.wipe}><Strap /></Sequence>
      <Sequence from={S.wall} durationInFrames={S.logo - S.wall}><ClockWipe dur={T.wipe}><Wall /></ClockWipe></Sequence>
      <Sequence from={S.site} durationInFrames={S.logo - S.site}><Site /></Sequence>
      <Sequence from={S.logo}><Logo /></Sequence>
      <Vignette strength={0.5} />
      <Grain f={f} opacity={0.06} />
    </AbsoluteFill>
  );
};
