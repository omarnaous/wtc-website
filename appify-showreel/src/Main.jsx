// "9 things we can animate for your brand." A numbered showreel: each style lives for 3 beats,
// and the Appify spark is the cut between them (the next style is revealed through a growing spark).
import { AbsoluteFill, Audio, Easing, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { END, N, PICK, STYLE0, STYLES, STYLE_LEN, styleStart } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, RgbSplit, Grain, Vignette } from "./fx.jsx";
import { MARK, WORDMARK, WSPARK, sparkPath } from "./brand.js";
import { LETTERS } from "./letters.js";
import { Dev } from "./Dev.jsx";

const C = { ink: "#0A0913", ink2: "#17142B", ink3: "#221D40", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", alert: "#F0384F", coral: "#FF6A3D", lime: "#C6FF3D", white: "#fff", mute: "#6D6788" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.9 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const lerp = (a, b, t) => a + (b - a) * t;
const sp = (f, at, damping = 10, stiffness = 240) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
// brand palette only: ink / uv / paper / sky, with iris + sky as the accents (no off-brand lime or coral)
export const BG = [C.ink, C.uv, C.paper, C.ink3, C.sky, C.paper, C.ink, "#050505", C.ink];
const LIGHT = [2, 4, 5];   // styles drawn on a light background

// ── 1 · kinetic type ──────────────────────────────────────────────────────────────────────────────
function Kinetic({ t, W, H, u }) {
  const words = [["WE", C.white], ["MAKE", C.iris], ["THINGS", C.white], ["MOVE.", C.sky]];
  const i = Math.min(3, Math.floor(t / 11.25)), lt = t - i * 11.25;
  const [w, col] = words[i];
  const p = sp(lt, 0, 9, 320), blur = Math.max(0, 14 - lt * 4);
  const size = Math.min(W * 0.9 / (w.length * 0.62), 420 * u);
  return (
    <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
      {/* echo outlines behind */}
      {[3, 2, 1].map((k) => <div key={k} style={{ position: "absolute", ...D, fontSize: size, color: "transparent", WebkitTextStroke: `${2 * u}px rgba(143,114,255,${0.5 - k * 0.12})`, transform: `scale(${1 + k * 0.12 * p}) translateY(${k * 10 * u}px)` }}>{w}</div>)}
      <div style={{ ...D, fontSize: size, color: col, transform: `scale(${interpolate(p, [0, 1], [1.5, 1])}) skewX(${(1 - Math.min(1, p)) * -12}deg)`, filter: `blur(${blur}px)` }}>{w}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.5 + size * 0.55, display: "flex", justifyContent: "center", gap: 14 * u }}>
        {words.map((_, k) => <span key={k} style={{ width: 60 * u, height: 8 * u, borderRadius: 9, background: k <= i ? C.iris : "rgba(255,255,255,.15)" }} />)}
      </div>
    </AbsoluteFill>
  );
}

// ── 2 · liquid morph: metaballs through a goo filter ──────────────────────────────────────────────
function Liquid({ t, W, H, u }) {
  const cx = W / 2, cy = H * 0.48, merge = interpolate(t, [0, 28, 40], [1, 0.15, 0], { ...clamp, easing: easeOut });
  const balls = Array.from({ length: 7 }, (_, i) => {
    const a = i * (Math.PI * 2 / 7) + t / 9, r = (90 + 230 * merge) * u * (1 + 0.15 * Math.sin(t / 5 + i));
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a * 1.3) * r * 0.9, r: (70 + 30 * Math.sin(t / 4 + i * 2)) * u };
  });
  const core = interpolate(t, [10, 36], [80, 250], { ...clamp, easing: easeOut }) * u;
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        <defs>
          <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation={22 * u} /><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12" /></filter>
          <linearGradient id="lq" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor={C.sky} /></linearGradient>
        </defs>
        <g filter="url(#goo)">
          {balls.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="url(#lq)" />)}
          <circle cx={cx} cy={cy} r={core} fill="url(#lq)" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.48 - 70 * u, textAlign: "center", ...D, fontSize: 150 * u, color: C.uv, opacity: interpolate(t, [24, 32], [0, 1], clamp), transform: `scale(${interpolate(t, [24, 34], [0.6, 1], { ...clamp, easing: easeOut })})` }}>fluid.</div>
    </AbsoluteFill>
  );
}

// ── 3 · UI animation: an app screen builds itself, a tap, a notification ──────────────────────────
function UI({ t, W, H, u }) {
  const pw = 520 * u, ph = 1060 * u, px = (W - pw) / 2, py = H * 0.47 - ph / 2;
  const phone = sp(t, 0, 13, 200);
  const card = (k) => sp(t, 4 + k * 4, 12, 220);
  const tap = 26, press = interpolate(t, [tap - 2, tap, tap + 4], [1, 0.92, 1], clamp), ripple = interpolate(t, [tap, tap + 14], [0, 1], clamp);
  const notif = sp(t, 31, 11, 260);
  const toggle = interpolate(t, [16, 21], [0, 1], { ...clamp, easing: easeOut });
  const fit = Math.min(1, (H * 0.6) / ph);   // the 4:5 frame is shorter: scale the whole phone down
  return (
    <AbsoluteFill style={{ transform: `scale(${fit})`, transformOrigin: `50% ${(H * 0.5 / H) * 100}%` }}>
      <div style={{ position: "absolute", left: px, top: py, width: pw, height: ph, borderRadius: 64 * u, background: C.ink, padding: 14 * u, boxShadow: "0 50px 100px rgba(10,9,19,.3)", transform: `translateY(${(1 - phone) * 400}px) rotate(${(1 - phone) * 8}deg)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 52 * u, background: "#fff", overflow: "hidden", position: "relative", padding: `${70 * u}px ${30 * u}px` }}>
          <div style={{ ...D, fontSize: 58 * u, color: C.ink, opacity: card(0), transform: `translateY(${(1 - card(0)) * 40}px)` }}>Good morning ✦</div>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ marginTop: 26 * u, height: 150 * u, borderRadius: 30 * u, background: [C.uv, "#EEEAFD", "#EEEAFD"][k], opacity: Math.min(1, card(k + 1) * 2), transform: `translateY(${(1 - card(k + 1)) * 120}px) scale(${0.9 + 0.1 * Math.min(1, card(k + 1))})`, display: "flex", alignItems: "center", gap: 20 * u, padding: `0 ${28 * u}px` }}>
              <div style={{ width: 80 * u, height: 80 * u, borderRadius: 22 * u, background: k ? C.uv : "rgba(255,255,255,.25)" }} />
              <div style={{ display: "grid", gap: 12 * u, flex: 1 }}><i style={{ height: 18 * u, width: "70%", borderRadius: 9, background: k ? "rgba(10,9,19,.2)" : "rgba(255,255,255,.7)" }} /><i style={{ height: 14 * u, width: "45%", borderRadius: 9, background: k ? "rgba(10,9,19,.12)" : "rgba(255,255,255,.4)" }} /></div>
              {k === 1 && <div style={{ width: 96 * u, height: 54 * u, borderRadius: 99, background: toggle > 0.5 ? C.uv : "#cfcae6", position: "relative" }}><div style={{ position: "absolute", top: 6 * u, left: lerp(6, 48, toggle) * u, width: 42 * u, height: 42 * u, borderRadius: 99, background: "#fff" }} /></div>}
            </div>
          ))}
          <div style={{ position: "absolute", left: 30 * u, right: 30 * u, bottom: 60 * u, height: 120 * u, borderRadius: 99, background: C.ink, color: "#fff", display: "grid", placeItems: "center", ...D, fontSize: 44 * u, transform: `scale(${press * Math.min(1, card(4))})`, overflow: "hidden" }}>
            Get started
            {t >= tap && <div style={{ position: "absolute", left: "50%", top: "50%", width: 600 * u * ripple, height: 600 * u * ripple, marginLeft: -300 * u * ripple, marginTop: -300 * u * ripple, borderRadius: "50%", background: `rgba(143,114,255,${0.6 * (1 - ripple)})` }} />}
          </div>
          <div style={{ position: "absolute", left: 20 * u, right: 20 * u, top: 20 * u, padding: 22 * u, borderRadius: 30 * u, background: "rgba(23,20,43,.92)", color: "#fff", display: "flex", gap: 16 * u, alignItems: "center", transform: `translateY(${(1 - notif) * -220 * u}px)`, fontFamily: "UI", fontWeight: 600, fontSize: 28 * u }}>
            <span style={{ width: 56 * u, height: 56 * u, borderRadius: 16 * u, background: C.uv, display: "grid", placeItems: "center" }}><Spark size={30 * u} color="#fff" /></span>
            New order · just now
          </div>
        </div>
      </div>
      {t >= tap - 6 && t < tap + 8 && <div style={{ position: "absolute", left: W / 2 + 40 * u, top: py + ph - 130 * u, width: 70 * u, height: 70 * u, borderRadius: 99, background: "rgba(10,9,19,.25)", border: `${4 * u}px solid rgba(255,255,255,.9)`, transform: `scale(${interpolate(t, [tap - 6, tap, tap + 8], [1.6, 0.8, 1.2], clamp)})`, opacity: interpolate(t, [tap + 4, tap + 8], [1, 0], clamp) }} />}
    </AbsoluteFill>
  );
}

// ── 4 · data viz: bars spring up, a line draws, a counter runs (sample data, labelled) ─────────────
function Data({ t, W, H, u }) {
  const vals = [0.32, 0.5, 0.41, 0.66, 0.58, 0.82, 0.95];
  const cw = 860 * u, ch = (H > 1600 ? 640 : 420) * u, x0 = (W - cw) / 2, y0 = H * (H > 1600 ? 0.58 : 0.62) + ch / 2;
  const bw = cw / vals.length * 0.62;
  const line = interpolate(t, [10, 32], [0, 1], { ...clamp, easing: easeOut });
  const n = Math.round(interpolate(t, [6, 34], [0, 248], { ...clamp, easing: easeOut }));
  const pts = vals.map((v, i) => [x0 + (i + 0.5) * cw / vals.length, y0 - v * ch - 40 * u]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const head = Math.min(vals.length - 1, Math.floor(line * (vals.length - 1)));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: y0 - ch - (H > 1600 ? 300 : 250) * u, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 230 * u, color: C.sky, fontVariantNumeric: "tabular-nums" }}>+{n}%</div>
        <div style={{ ...M, fontSize: 22 * u, color: "rgba(255,255,255,.5)", marginTop: 14 * u }}>Sample data</div>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3].map((k) => <line key={k} x1={x0} x2={x0 + cw} y1={y0 - k * ch / 3} y2={y0 - k * ch / 3} stroke="rgba(255,255,255,.08)" strokeWidth={2 * u} />)}
        {vals.map((v, i) => { const p = sp(t, i * 2.5, 11, 200); const h = v * ch * Math.min(1.05, p); return <rect key={i} x={x0 + (i + 0.5) * cw / vals.length - bw / 2} y={y0 - h} width={bw} height={h} rx={14 * u} fill={i === vals.length - 1 ? C.iris : "rgba(143,114,255,.35)"} />; })}
        <path d={path} fill="none" stroke={C.sky} strokeWidth={8 * u} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - line} />
        {line > 0 && <circle cx={lerp(pts[head][0], pts[Math.min(vals.length - 1, head + 1)][0], (line * (vals.length - 1)) % 1)} cy={lerp(pts[head][1], pts[Math.min(vals.length - 1, head + 1)][1], (line * (vals.length - 1)) % 1)} r={16 * u} fill={C.sky} />}
      </svg>
    </AbsoluteFill>
  );
}

// ── 5 · 3D type: an extruded word swinging in perspective ─────────────────────────────────────────
function Type3D({ t, W, H, u }) {
  const ry = Math.sin(t / 7) * 38 - 10, rx = 14 + Math.sin(t / 9) * 6, p = sp(t, 0, 12, 180);
  const word = "3D.", size = 420 * u, layers = 22;
  return (
    <AbsoluteFill style={{ perspective: 1400 * u, display: "grid", placeItems: "center" }}>
      <div style={{ position: "relative", transformStyle: "preserve-3d", transform: `scale(${interpolate(p, [0, 1], [0.3, 1])}) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
        {Array.from({ length: layers }, (_, i) => (
          <div key={i} style={{ position: i ? "absolute" : "relative", inset: 0, ...D, fontSize: size, color: i === 0 ? "#fff" : `hsl(255, 85%, ${22 + (i / layers) * 22}%)`, transform: `translateZ(${-i * 5 * u}px)`, WebkitTextStroke: i === 0 ? `${3 * u}px ${C.uv}` : "none" }}>{word}</div>
        )).reverse()}
      </div>
      {/* floating cubes */}
      {[0, 1, 2].map((k) => { const s = (110 - k * 25) * u, a = t / (12 + k * 4) + k * 2; return (
        <div key={k} style={{ position: "absolute", left: W / 2 + Math.cos(a + k) * 360 * u - s / 2, top: H * 0.5 + Math.sin(a * 1.3 + k) * 520 * u - s / 2, width: s, height: s, transformStyle: "preserve-3d", transform: `rotateX(${t * 6 + k * 40}deg) rotateY(${t * 8 + k * 30}deg)` }}>
          {[[0, 0], [90, 0], [180, 0], [270, 0], [0, 90], [0, -90]].map(([y, x], j) => <div key={j} style={{ position: "absolute", inset: 0, background: ["#fff", C.iris, C.uv, "#B9AAFF", "#fff", C.uv][j], opacity: 0.92, transform: `rotateY(${y}deg) rotateX(${x}deg) translateZ(${s / 2}px)` }} />)}
        </div>
      ); })}
    </AbsoluteFill>
  );
}

// ── 6 · particles: a vortex collapses into the centre, then everything explodes ───────────────────
function Particles({ t, W, H, u }) {
  const cx = W / 2, cy = H * 0.48, boom = 20;
  const pre = interpolate(t, [0, boom], [0, 1], { ...clamp, easing: easeIn });
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 220 }, (_, i) => {
          const a0 = random(`a${i}`) * Math.PI * 2, r0 = (200 + random(`r${i}`) * 700) * u, col = [C.iris, C.sky, "#fff", "#B9AAFF"][i % 4];
          if (t < boom) {
            const a = a0 + pre * 5, r = r0 * (1 - pre * 0.96);
            return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={(2 + random(`s${i}`) * 4) * u} fill={col} opacity={0.4 + 0.6 * pre} />;
          }
          const k = (t - boom) / 22, sp2 = (600 + random(`v${i}`) * 900) * u, d = sp2 * (1 - Math.pow(1 - Math.min(1, k), 3));
          const x = cx + Math.cos(a0) * d, y = cy + Math.sin(a0) * d, tail = 60 * u * (1 - Math.min(1, k));
          return <line key={i} x1={x} y1={y} x2={x - Math.cos(a0) * tail} y2={y - Math.sin(a0) * tail} stroke={col} strokeWidth={(3 + random(`s${i}`) * 4) * u} strokeLinecap="round" opacity={1 - k * 0.8} />;
        })}
      </svg>
      {t >= boom - 2 && <div style={{ position: "absolute", left: cx - 30 * u, top: cy - 30 * u, width: 60 * u, height: 60 * u, borderRadius: 99, background: "#fff", boxShadow: `0 0 ${160 * u}px ${80 * u}px ${C.iris}`, transform: `scale(${interpolate(t, [boom - 2, boom, boom + 10], [0.5, 3, 0], clamp)})` }} />}
      <Shockwave f={t} cx={cx} cy={cy} start={boom} max={900 * u} width={10 * u} rgb="143,114,255" dur={18} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 90 * u, textAlign: "center", ...D, fontSize: 200 * u, color: "#fff", opacity: interpolate(t, [boom + 2, boom + 6], [0, 1], clamp), transform: `scale(${interpolate(sp(t, boom + 2, 8, 300), [0, 1], [2, 1])})` }}>BOOM.</div>
    </AbsoluteFill>
  );
}

// ── 7 · glitch: slices, RGB split, scanlines ──────────────────────────────────────────────────────
function Glitch({ t, W, H, u }) {
  const seed = Math.floor(t / 2), amp = (t % 7 < 3 ? 1 : 0.25) * 40 * u;
  const word = (
    <div style={{ ...D, fontSize: 300 * u, color: "#fff", textAlign: "center" }}>GLITCH</div>
  );
  const bands = 9;
  return (
    <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
      <div style={{ position: "relative", width: W, height: 300 * u }}>
        {Array.from({ length: bands }, (_, b) => {
          const dx = (random(`g${seed}-${b}`) - 0.5) * 2 * amp;
          return (
            <div key={b} style={{ position: "absolute", inset: 0, clipPath: `inset(${(b / bands) * 100}% 0 ${100 - ((b + 1) / bands) * 100}% 0)`, transform: `translateX(${dx}px)` }}>
              <RgbSplit px={Math.abs(dx) * 0.6 + 4 * u}>{word}</RgbSplit>
            </div>
          );
        })}
      </div>
      {Array.from({ length: 6 }, (_, i) => random(`blk${seed}${i}`) > 0.5 ? <div key={i} style={{ position: "absolute", left: random(`bx${seed}${i}`) * W, top: random(`by${seed}${i}`) * H, width: (60 + random(`bw${seed}${i}`) * 300) * u, height: (8 + random(`bh${seed}${i}`) * 40) * u, background: [C.sky, C.uv, "#fff", C.iris][i % 4], mixBlendMode: "screen", opacity: 0.8 }} /> : null)}
      <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 ${2 * u}px, transparent ${2 * u}px ${6 * u}px)` }} />
    </AbsoluteFill>
  );
}

// ── 8 · logo reveal: the mark builds (ring, stem, spark), then the wordmark ───────────────────────
function Logo({ t, W, H, u }) {
  const cx = W / 2, cy = H * 0.47;
  const ring = interpolate(t, [0, 12], [0, 1], { ...clamp, easing: easeOut }), stem = sp(t, 8, 10, 220), spark = sp(t, 14, 8, 260);
  const toWord = interpolate(t, [22, 30], [0, 1], { ...clamp, easing: easeOut });
  const ms = 2.0 * u;
  const ww = 820 * u, wh = ww * (WORDMARK.bottom - WORDMARK.top) / WORDMARK.width;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 47%, rgba(91,43,255,${0.55 * Math.max(ring, toWord)}), transparent 55%)` }} />
      <svg viewBox={MARK.viewBox} width={258 * ms} height={362 * ms} style={{ position: "absolute", left: cx - 129 * ms, top: cy - 181 * ms, opacity: 1 - toWord, transform: `scale(${1 - toWord * 0.4})` }}>
        <circle cx={MARK.cx} cy={MARK.cy} r={(MARK.ro + MARK.ri) / 2} fill="none" stroke="#fff" strokeWidth={MARK.ro - MARK.ri} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ring} transform={`rotate(-90 ${MARK.cx} ${MARK.cy})`} />
        <g transform={`translate(0 ${(1 - Math.min(1, stem)) * 120})`} opacity={Math.min(1, stem * 2)}><path d={MARK.stem} fill="#fff" /></g>
        <g transform={`translate(${MARK.sparkX} ${MARK.sparkY}) scale(${Math.min(1.2, spark)}) rotate(${(1 - Math.min(1, spark)) * 180}) translate(${-MARK.sparkX} ${-MARK.sparkY})`}><path d={MARK.spark} fill={C.iris} /></g>
      </svg>
      {toWord > 0 && (
        <svg viewBox={`0 ${WORDMARK.top} ${WORDMARK.width} ${WORDMARK.bottom - WORDMARK.top}`} width={ww} height={wh} style={{ position: "absolute", left: cx - ww / 2, top: cy - wh / 2, opacity: toWord, transform: `scale(${0.85 + 0.15 * toWord})` }}>
          <path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} />
        </svg>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: cy + wh / 2 + 40 * u, textAlign: "center", ...D, fontSize: 64 * u, color: "rgba(255,255,255,.9)", opacity: interpolate(t, [30, 36], [0, 1], clamp) }}>Ideas, <span style={{ color: C.iris }}>appified.</span></div>
    </AbsoluteFill>
  );
}

// ── 6 · mascot animation: Dev jumps in, waves, talks, thumbs up ───────────────────────────────────
function Mascot({ t, W, H, u }) {
  const inP = sp(t, 0, 9, 200), w = 400 * u, h = w * 830 / 420;
  const wave = interpolate(t, [6, 9, 26, 29], [0, 1, 1, 0], clamp), thumbs = interpolate(t, [29, 32, 44, 45], [0, 1, 1, 1], clamp);
  const line = "I'm animated too!", typed = line.slice(0, Math.max(0, Math.floor((t - 8) * 1.4)));
  const talking = typed.length > 0 && typed.length < line.length;
  const jump = t >= 30 && t < 40 ? -Math.sin(((t - 30) / 10) * Math.PI) * 60 * u : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: W / 2 - 220 * u, top: H * 0.5 + h * 0.36, width: 440 * u, height: 50 * u, borderRadius: "50%", background: "rgba(10,9,19,.18)", transform: `scale(${Math.min(1, inP) * (1 + jump / (300 * u))})` }} />
      <div style={{ position: "absolute", left: W / 2 - w / 2, top: H * 0.5 - h * 0.48 + jump, transform: `translateY(${(1 - Math.min(1, inP)) * 900 * u}px)` }}>
        <Dev width={w} wave={wave} waveAng={Math.sin(t / 2) * 24} thumbs={thumbs} tilt={Math.sin(t / 6) * 2} bob={talking ? -Math.abs(Math.sin(t)) * 4 : 0}
          open={talking ? 0.3 + 0.5 * Math.abs(Math.sin(t * 1.7)) : 0} brow={16} lid={0.08} smile={1} look={4} happy={t > 38 ? 1 : 0} />
      </div>
      {typed && <div style={{ position: "absolute", left: W / 2 + 40 * u, top: H * 0.5 - h * 0.6, padding: `${20 * u}px ${28 * u}px`, background: "#fff", border: `${5 * u}px solid ${C.ink}`, borderRadius: 18 * u, boxShadow: `0 ${8 * u}px 0 ${C.ink}`, fontFamily: "Mono", fontSize: 38 * u, color: C.ink, whiteSpace: "nowrap" }}>{typed}</div>}
    </AbsoluteFill>
  );
}

function Spark({ size, color = C.iris, style }) {
  return <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
}
export const SCENES = [Kinetic, Liquid, UI, Data, Type3D, Mascot, Particles, Glitch, Logo];

// ── hook + HUD + end card ─────────────────────────────────────────────────────────────────────────
// The brand intro (1 bar): the spark slams in, flies up and lands as the i-dot of the wordmark while the letters rise,
// then "WE MAKE / MOTION / GRAPHICS." lands word by word on the beat, and MOTION keeps moving.
function Intro({ f, W, H, u, tall }) {
  const ww = (tall ? 680 : 540) * u, k = ww / 3224, wx = (W - ww) / 2, wy = tall ? H * 0.17 : H * 0.07;
  const wh = 1167 * k;
  const dotX = wx + (WSPARK.x + 20) * k, dotY = wy + (WSPARK.y + 917) * k, dotR = WSPARK.r * k;
  const cx = W / 2, cy = H * 0.46;
  const slam = sp(f, 0, 9, 320);
  const fly = interpolate(f, [7, 20], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const landed = f >= 20;
  const sparkAt = (q) => [lerp(cx, dotX, q), lerp(cy, dotY, q) - Math.sin(q * Math.PI) * 160 * u, lerp(150 * u * interpolate(slam, [0, 1], [2.4, 1]), dotR, q)];
  const fit = (w, base) => Math.min(base, (W * 0.88) / (w.length * 0.66));
  const words = [["WE MAKE", "#fff", fit("WE MAKE", (tall ? 130 : 104) * u), 22], ["MOTION", C.sky, fit("MOTION", (tall ? 220 : 186) * u), 34], ["GRAPHICS.", "#fff", fit("GRAPHICS.", (tall ? 150 : 118) * u), 45]];
  const top = tall ? H * 0.43 : H * 0.36;
  const sub = sp(f, 56, 12, 220), line = interpolate(f, [40, 54], [0, 1], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.08) 1.5px, transparent 1.5px)", backgroundSize: `${60 * u}px ${60 * u}px`, backgroundPosition: `${W / 2}px ${f * 0.8}px` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${landed ? 30 : 46}%, rgba(91,43,255,${0.55 + 0.15 * Math.sin(f / 5)}), transparent ${tall ? 50 : 60}%)` }} />
      {/* wordmark: letters rise one by one, the spark is the i-dot */}
      <svg viewBox={WORDMARK.viewBox} width={ww} height={wh} style={{ position: "absolute", left: wx, top: wy, overflow: "visible" }}>
        {LETTERS.map((l, j) => { const p = sp(f, 10 + j * 2, 11, 240); return <path key={j} d={l.d} fill="#fff" opacity={Math.min(1, p * 2)} transform={`translate(0 ${(1 - Math.min(1, p)) * 500})`} />; })}
        {landed && <path d={WORDMARK.spark} fill={C.iris} transform={`translate(${WSPARK.x} ${WSPARK.y}) scale(${interpolate(sp(f, 20, 8, 300), [0, 1], [1.8, 1])}) translate(${-WSPARK.x} ${-WSPARK.y})`} />}
      </svg>
      {!landed && [3, 2, 1, 0].map((g) => {   // the flying spark with a short trail
        const [x, y, r] = sparkAt(Math.max(0, fly - g * 0.06));
        return <svg key={g} width={W} height={H} style={{ position: "absolute", inset: 0, opacity: g ? 0.25 / g : 1 }}><path d={sparkPath(x, y, r, 0.2)} fill={C.iris} transform={`rotate(${(1 - Math.min(1, slam)) * -90 + f * 4 * (1 - fly)} ${x} ${y})`} style={{ filter: g ? "none" : `drop-shadow(0 0 ${30 * u}px rgba(143,114,255,.9))` }} /></svg>;
      })}
      <Shockwave f={f} cx={dotX} cy={dotY} start={20} max={260 * u} width={5 * u} rgb="143,114,255" dur={14} />
      {/* WE MAKE / MOTION / GRAPHICS. */}
      <div style={{ position: "absolute", left: 0, right: 0, top, display: "grid", justifyItems: "center", gap: 4 * u }}>
        {words.map(([w, col, size, at], j) => {
          const p = sp(f, at, 9, 300);
          return (
            <div key={w} style={{ ...D, fontSize: size, color: col, opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [1.7, 1])})`, filter: `blur(${Math.max(0, 10 - (f - at) * 3)}px)`, display: "flex", position: "relative" }}>
              {j === 1 ? w.split("").map((ch, q) => <span key={q} style={{ display: "inline-block", transform: `translateY(${f > 46 ? Math.sin((f - 46) / 3.2 - q * 0.7) * 16 * u : 0}px) rotate(${f > 46 ? Math.sin((f - 46) / 3.2 - q * 0.7 - 1) * 4 : 0}deg)` }}>{ch}</span>) : w}
              {j === 1 && <i style={{ position: "absolute", left: "4%", right: "4%", bottom: -size * 0.04, height: 12 * u, borderRadius: 9, background: C.iris, transform: `scaleX(${line})`, transformOrigin: "0 50%" }} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: tall ? H * 0.8 : H * 0.86, textAlign: "center", ...M, fontSize: (tall ? 30 : 26) * u, color: "rgba(255,255,255,.8)", opacity: Math.min(1, sub * 2), transform: `translateY(${(1 - Math.min(1, sub)) * 30}px)` }}>
        for your brand · @appifylb
      </div>
    </AbsoluteFill>
  );
}

// The hook: the Appify spark slams in, "PICK A NUMBER." lands, then the spark bursts into the 9 numbers
// (the same 9 the end card asks you to comment). Chip 1 lights up and the spark cut opens on style 01.
function Hook({ f, W, H, u, tall }) {
  const cx = W / 2, cy = H * (tall ? 0.53 : 0.57), R = (tall ? 300 : 225) * u;
  const slam = sp(f, 0, 9, 320), l1 = sp(f, -4, 10, 300), l2 = sp(f, 2, 10, 300), sub = sp(f, 22, 12, 220);
  const burst = interpolate(f, [13, 15], [0, 1], clamp);
  const sparkS = interpolate(slam, [0, 1], [2.6, 1]) * interpolate(f, [13, 20], [1, 0.38], { ...clamp, easing: easeOut });
  const pop = (p, k = 1.8) => ({ transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, opacity: Math.min(1, p * 3) });
  const glow = 0.5 + 0.2 * Math.sin(f / 4);
  const chip = (tall ? 132 : 110) * u;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${(cy / H) * 100}%, rgba(91,43,255,${glow}), transparent ${tall ? 45 : 55}%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: tall ? H * 0.15 : H * 0.06, textAlign: "center" }}>
        <div style={{ ...D, fontSize: (tall ? 168 : 140) * u, color: "#fff", ...pop(l1) }}>PICK A</div>
        <div style={{ ...D, fontSize: (tall ? 168 : 140) * u, color: C.sky, ...pop(l2) }}>NUMBER.</div>
      </div>
      <Spark size={300 * u} color={C.iris} style={{ position: "absolute", left: cx - 150 * u, top: cy - 150 * u, transform: `scale(${sparkS}) rotate(${(1 - Math.min(1, slam)) * -90 + f * 1.5}deg)`, filter: `drop-shadow(0 0 ${30 * u}px rgba(143,114,255,.9))` }} />
      <Shockwave f={f} cx={cx} cy={cy} start={14} max={R * 1.8} width={6 * u} rgb="143,114,255" dur={16} />
      {burst > 0 && Array.from({ length: 9 }, (_, k) => {
        const p = sp(f, 14 + k * 1.2, 10, 240), a = -Math.PI / 2 + (k / 9) * Math.PI * 2, d = R * Math.min(1.06, p);
        const on = k === 0 && f >= 32, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
        const s = on ? 1 + 0.12 * Math.sin((f - 32) / 1.6) + 0.1 : 1;
        return (
          <div key={k} style={{ position: "absolute", left: x - chip / 2, top: y - chip / 2, width: chip, height: chip, borderRadius: 99, display: "grid", placeItems: "center",
            background: on ? C.sky : C.ink2, border: `${4 * u}px solid ${on ? C.sky : C.iris}`, ...D, fontSize: chip * 0.52, color: on ? C.ink : "#fff",
            transform: `scale(${Math.min(1, p * 1.4) * s}) rotate(${(1 - Math.min(1, p)) * -120}deg)`, boxShadow: on ? `0 0 ${50 * u}px rgba(116,198,255,.8)` : "none" }}>{k + 1}</div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: cy + R + chip / 2 + (tall ? 90 : 40) * u, textAlign: "center", ...M, fontSize: (tall ? 32 : 28) * u, color: "rgba(255,255,255,.8)", opacity: Math.min(1, sub * 2), transform: `translateY(${(1 - Math.min(1, sub)) * 30}px)` }}>
        9 ways we can animate your brand ↓
      </div>
    </AbsoluteFill>
  );
}
function HUD({ f, i, W, H, u, tall }) {
  const t = f - styleStart(i), dark = !LIGHT.includes(i);
  const p = sp(t, 0, 12, 260);
  const ink = dark ? "#fff" : C.ink;
  const y = tall ? 240 * u : 70 * u;
  return (
    <>
      <div style={{ position: "absolute", left: 60 * u, top: y, display: "flex", alignItems: "baseline", gap: 12 * u }}>
        <span style={{ ...D, fontSize: 150 * u, color: dark ? C.sky : C.uv, display: "inline-block", transform: `translateY(${(1 - Math.min(1, p)) * -80}px)` }}>{String(i + 1).padStart(2, "0")}</span>
        <span style={{ ...M, fontSize: 26 * u, color: ink, opacity: 0.55 }}>/0{N}</span>
      </div>
      <div style={{ position: "absolute", right: 60 * u, top: y + 50 * u, padding: `${12 * u}px ${22 * u}px`, borderRadius: 99, border: `${3 * u}px solid ${ink}`, ...M, fontSize: 24 * u, color: ink, transform: `translateX(${(1 - Math.min(1, p)) * 300}px)` }}>{STYLES[i]}</div>
      {i !== N - 1 && <svg viewBox={WORDMARK.viewBox} width={150 * u} height={150 * u * 1167 / 3224} style={{ position: "absolute", right: 60 * u, bottom: (tall ? 380 : 70) * u + 30 * u, opacity: 0.85 }}><path d={WORDMARK.letters} fill={ink} /><path d={WORDMARK.spark} fill={dark ? C.iris : C.uv} /></svg>}
      <div style={{ position: "absolute", left: 60 * u, right: 60 * u, bottom: tall ? 380 * u : 70 * u, display: "flex", gap: 10 * u }}>
        {STYLES.map((_, k) => <div key={k} style={{ flex: 1, height: 8 * u, borderRadius: 9, background: k < i ? ink : k === i ? (dark ? C.sky : C.uv) : dark ? "rgba(255,255,255,.18)" : "rgba(10,9,19,.15)", transform: k === i ? `scaleX(${interpolate(t, [0, STYLE_LEN], [0.1, 1], clamp)})` : "none", transformOrigin: "0 50%" }} />)}
      </div>
    </>
  );
}
const GLYPHS = ["Aa", "◐", "▭", "▁▃▅", "3D", "☺", "✺", "▚", "✦"];
function EndCard({ f, W, H, u, tall }) {
  const t = f - END;
  const title = sp(t, 0, 11, 220);
  const cols = 3, tile = (tall ? 190 : 140) * u, gap = 22 * u, gw = cols * tile + (cols - 1) * gap, gx = (W - gw) / 2, gy = tall ? H * 0.27 : H * 0.24;
  const box = sp(t, 30, 9, 240), devP = sp(t, 16, 12, 180);
  const pulse = 1 + 0.03 * Math.sin(Math.max(0, t - 40) / 4);
  const by = gy + 3 * tile + 2 * gap + (tall ? 70 : 40) * u;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(rgba(91,43,255,.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(91,43,255,.12) 1.5px, transparent 1.5px)`, backgroundSize: `${60 * u}px ${60 * u}px`, backgroundPosition: `0 ${t * 1.2}px` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: tall ? H * 0.13 : H * 0.05, textAlign: "center", ...D, fontSize: (tall ? 100 : 84) * u, color: C.ink, transform: `scale(${interpolate(title, [0, 1], [1.5, 1])})`, opacity: Math.min(1, title * 2) }}>Which one do<br /><span style={{ color: C.uv }}>you want?</span></div>
      {STYLES.map((s, k) => {
        const p = sp(t, 6 + k * 2, 10, 260), r = Math.floor(k / cols), c = k % cols, light = LIGHT.includes(k);
        return (
          <div key={s} style={{ position: "absolute", left: gx + c * (tile + gap), top: gy + r * (tile + gap), width: tile, height: tile, borderRadius: 32 * u, background: BG[k], transform: `scale(${Math.min(1, p)}) rotate(${(1 - Math.min(1, p)) * 20}deg)`, boxShadow: "0 18px 40px rgba(10,9,19,.18)", overflow: "hidden" }}>
            <span style={{ position: "absolute", right: 14 * u, bottom: 8 * u, ...D, fontSize: tile * 0.42, color: light ? C.ink : "#fff", opacity: 0.22 }}>{GLYPHS[k]}</span>
            <span style={{ position: "absolute", left: 16 * u, top: 10 * u, ...D, fontSize: tile * 0.34, color: light ? C.uv : C.sky }}>{k + 1}</span>
            <span style={{ position: "absolute", left: 16 * u, right: 12 * u, bottom: 14 * u, fontFamily: "UI", fontWeight: 600, fontSize: tile * 0.1, lineHeight: 1.1, color: light ? C.ink : "rgba(255,255,255,.85)" }}>{s}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: by, display: "grid", justifyItems: "center", transform: `scale(${interpolate(box, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, box * 2) }}>
        <div style={{ padding: `${24 * u}px ${52 * u}px`, borderRadius: 30 * u, background: C.uv, boxShadow: "0 20px 50px rgba(91,43,255,.45)", textAlign: "center" }}>
          <div style={{ ...M, fontSize: 24 * u, color: "rgba(255,255,255,.75)", marginBottom: 6 * u }}>Want one for your brand?</div>
          <div style={{ ...D, fontSize: (tall ? 76 : 64) * u, color: "#fff" }}>Comment “MOTION”</div>
          <div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 30 * u, color: C.sky, marginTop: 8 * u }}>+ your favourite number</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 30 * u, bottom: tall ? 80 * u : 6 * u, transform: `translateY(${(1 - Math.min(1, devP)) * 500}px)` }}>
        <Dev width={(tall ? 220 : 140) * u} point={1} brow={16} lid={0.08} smile={1} look={6} bob={Math.sin(t / 6) * 2} tilt={Math.sin(t / 10) * 2} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: by + (tall ? 260 : 215) * u, display: "grid", justifyItems: "center", gap: 8 * u, opacity: interpolate(t, [36, 44], [0, 1], clamp) }}>
        <svg viewBox={WORDMARK.viewBox} width={(tall ? 260 : 170) * u} height={(tall ? 260 : 170) * u * 1167 / 3224}><path d={WORDMARK.letters} fill={C.ink} /><path d={WORDMARK.spark} fill={C.uv} /></svg>
        <div style={{ ...M, fontSize: 22 * u, color: C.mute }}>@appifylb · Ideas, appified.</div>
      </div>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const u = W / 1080, tall = H > 1600;
  const i = f < PICK ? -2 : f < STYLE0 ? -1 : f >= END ? N : Math.floor((f - STYLE0) / STYLE_LEN);
  // the spark cut: the next scene is revealed through a spark that grows from the centre in 9 frames
  const cut = (at) => { const p = interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: easeIn }); const R = p * Math.hypot(W, H) * 1.25; return `path('${sparkPath(W / 2, H * 0.48, Math.max(1, R), 0.3)}')`; };
  const layer = (k) => {
    if (k === -2) return <Intro f={f} W={W} H={H} u={u} tall={tall} />;
    if (k === -1) return <Hook f={f - PICK} W={W} H={H} u={u} tall={tall} />;
    if (k === N) return <EndCard f={f} W={W} H={H} u={u} tall={tall} />;
    const S = SCENES[k], t = f - styleStart(k);
    const [sx, sy] = shake(t, SCENES[k] === Particles ? 20 : 0, SCENES[k] === Particles ? 26 : 10, 4);
    return (
      <AbsoluteFill style={{ background: BG[k] }}>
        <AbsoluteFill style={{ backgroundImage: `linear-gradient(${LIGHT.includes(k) ? "rgba(91,43,255,.11)" : "rgba(143,114,255,.08)"} 1.5px, transparent 1.5px), linear-gradient(90deg, ${LIGHT.includes(k) ? "rgba(91,43,255,.11)" : "rgba(143,114,255,.08)"} 1.5px, transparent 1.5px)`, backgroundSize: `${60 * u}px ${60 * u}px`, backgroundPosition: `${W / 2}px ${t * 0.8}px` }} />
        <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}><S t={t} W={W} H={H} u={u} /></AbsoluteFill>
        <HUD f={f} i={k} W={W} H={H} u={u} tall={tall} />
      </AbsoluteFill>
    );
  };
  const cur = i, prev = i - 1, at = i === N ? END : i >= 0 ? styleStart(i) : i === -1 ? PICK : 0;
  const inCut = i >= -1 && f < at + 9;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {inCut && layer(prev)}
      <AbsoluteFill style={inCut ? { clipPath: cut(at) } : undefined}>{layer(cur)}</AbsoluteFill>
      {inCut && (() => { const p = interpolate(f, [at, at + 9], [0, 1], clamp); return <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, Math.max(1, p * Math.hypot(W, H) * 1.25), 0.3)} fill="none" stroke={C.iris} strokeWidth={14 * u * (1 - p)} /></svg>; })()}
      {i >= -1 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.25} />}
      <Vignette strength={0.16} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};

// ── cover / thumbnail: a still. Everything that matters sits in the centre 1080x1350 band (the profile-grid crop);
// on 9:16 the wordmark sits above it and the comment prompt below it.
const COVER_T = [40, 38, 34, 40, 20, 33, 26, 3, 40];   // the frame of each style that reads best as a still
export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const { width: W, height: H } = useVideoConfig();
  const u = W / 1080, tall = H > 1600, bt = (H - 1350 * u) / 2;
  const tile = (tall ? 272 : 262) * u, gap = 20 * u, gw = 3 * tile + 2 * gap, gx = (W - gw) / 2, gy = bt + (tall ? 400 : 440) * u;
  const S0 = 1080;   // each style renders as a 1080x1080 frame, scaled into its tile
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.08) 1.5px, transparent 1.5px)", backgroundSize: `${60 * u}px ${60 * u}px`, backgroundPosition: `${W / 2}px 0` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${((gy + gw / 2) / H) * 100}%, rgba(91,43,255,.6), transparent 60%)` }} />
      {tall && <svg viewBox={WORDMARK.viewBox} width={330 * u} height={330 * u * 1167 / 3224} style={{ position: "absolute", left: (W - 330 * u) / 2, top: bt - 215 * u }}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>}
      <div style={{ position: "absolute", left: 0, right: 0, top: bt + 40 * u, textAlign: "center" }}>
        {!tall && <div style={{ ...M, fontSize: 24 * u, color: C.iris, marginBottom: 14 * u }}>appify · motion graphics</div>}
        <div style={{ ...D, fontSize: 150 * u, color: "#fff" }}>9 MOTION</div>
        <div style={{ ...D, fontSize: 150 * u, color: C.sky, display: "inline-flex", alignItems: "center", gap: 16 * u }}>STYLES<Spark size={96 * u} color={C.iris} /></div>
        <div style={{ ...M, fontSize: 28 * u, color: "rgba(255,255,255,.85)", marginTop: 18 * u }}>pick one for your brand ↓</div>
      </div>
      {SCENES.map((Sc, k) => {
        const r = Math.floor(k / 3), c = k % 3;
        return (
          <div key={k} style={{ position: "absolute", left: gx + c * (tile + gap), top: gy + r * (tile + gap), width: tile, height: tile, borderRadius: 30 * u, overflow: "hidden", background: BG[k], boxShadow: `0 ${20 * u}px ${50 * u}px rgba(0,0,0,.45)`, border: `${3 * u}px solid rgba(143,114,255,.35)` }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: S0, height: S0, transform: `scale(${tile / S0})`, transformOrigin: "0 0" }}>
              <AbsoluteFill style={{ background: BG[k] }}><AbsoluteFill style={{ transform: `translateY(${k === 3 ? 90 : 0}px)` }}><Sc t={COVER_T[k]} W={S0} H={S0} u={1} /></AbsoluteFill></AbsoluteFill>
            </div>
            <div style={{ position: "absolute", left: 14 * u, top: 14 * u, width: 64 * u, height: 64 * u, borderRadius: 99, background: C.sky, color: C.ink, display: "grid", placeItems: "center", ...D, fontSize: 38 * u, boxShadow: "0 4px 14px rgba(0,0,0,.3)" }}>{k + 1}</div>
          </div>
        );
      })}
      {tall && (
        <div style={{ position: "absolute", left: 0, right: 0, top: bt + 1350 * u + 40 * u, display: "grid", justifyItems: "center" }}>
          <div style={{ padding: `${20 * u}px ${44 * u}px`, borderRadius: 26 * u, background: C.uv, ...D, fontSize: 56 * u, color: "#fff", boxShadow: "0 20px 50px rgba(91,43,255,.45)" }}>Comment “MOTION”</div>
        </div>
      )}
      <Vignette strength={0.16} />
    </AbsoluteFill>
  );
};
