import { useMemo, useState } from "react";
import {
  AbsoluteFill, Audio, Easing, interpolate, random, spring, staticFile,
  useCurrentFrame, useVideoConfig, delayRender, continueRender,
} from "remotion";
import { WORDMARK, WSPARK, sparkPath } from "./brand.js";
import { T } from "./timing.js";

const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", paper: "#F3F1FA" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.55, 0, 1, 0.45);

// wordmark in its own units: letters span x 0..W, baseline y=0, top WORDMARK.top
const WM_W = WORDMARK.width;
const WM_TOP = WORDMARK.top;
const WM_BOT = WORDMARK.bottom;
const WM_CY = (WM_TOP + 0) / 2 - 40; // optical centre: x-height body, ignoring descenders

function useMono() {
  const [handle] = useState(() => delayRender("font"));
  useMemo(() => {
    const faces = [
      new FontFace("GeistMono", `url(${staticFile("geist-mono-500.ttf")})`),
      new FontFace("Sora", `url(${staticFile("sora-600.ttf")})`, { weight: "600" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((loaded) => { loaded.forEach((ff) => document.fonts.add(ff)); continueRender(handle); });
  }, [handle]);
}

// ── atmosphere ───────────────────────────────────────────────
function Backdrop({ f, cx, cy }) {
  const bloom = interpolate(f, [0, T.ignite, T.traceB, T.silence, T.hit, T.hit + 30, 240], [0, 0.15, 0.45, 0.05, 1, 0.55, 0.5], clamp);
  const breathe = f > T.hit + 30 ? 0.06 * Math.sin((f - T.hit) / 18) : 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(91,43,255,${0.55 * (bloom + breathe)}) 0%, rgba(91,43,255,${0.18 * bloom}) 28%, transparent 62%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${cx + 260}px ${cy - 320}px, rgba(116,198,255,${0.12 * bloom}) 0%, transparent 40%)` }} />
    </AbsoluteFill>
  );
}

function Grid({ f, width, height, cx, cy }) {
  const o = interpolate(f, [T.ignite, T.traceB, T.silence, T.hit, T.hit + 12, T.hit + 40], [0, 0.5, 0.15, 0.9, 0.25, 0.14], clamp);
  return (
    <AbsoluteFill style={{
      opacity: o,
      backgroundImage: "linear-gradient(rgba(205,190,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(205,190,255,.10) 1px, transparent 1px)",
      backgroundSize: "54px 54px", backgroundPosition: `${cx}px ${cy}px`,
      maskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000 0%, transparent ${Math.max(width, height) * 0.42}px)`,
      WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, #000 0%, transparent ${Math.max(width, height) * 0.42}px)`,
    }} />
  );
}

function Grain({ f }) {
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 60} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.2" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
}
const Vignette = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.55) 100%)" }} />;

// ── blueprint construction during the trace ──────────────────
function Blueprint({ f, cx, cy, s }) {
  const o = interpolate(f, [T.ignite + 4, T.traceA + 10, T.suckA, T.silence], [0, 0.55, 0.55, 0], clamp);
  const d = interpolate(f, [T.ignite, T.traceB], [0, 1], { ...clamp, easing: easeOut });
  const r1 = 470 * s * 3.1, r2 = 300 * s * 3.1;
  const label = { fontFamily: "GeistMono", fontSize: 18, letterSpacing: "0.16em", fill: "rgba(205,190,255,.7)" };
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: o }}>
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke="rgba(205,190,255,.35)" strokeWidth="1.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - d} transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(205,190,255,.22)" strokeWidth="1.5" strokeDasharray="3 9" transform={`rotate(${f * 0.6} ${cx} ${cy})`} />
      <line x1={cx - r1 * d} x2={cx + r1 * d} y1={cy} y2={cy} stroke="rgba(205,190,255,.22)" strokeWidth="1.5" />
      <line x1={cx} x2={cx} y1={cy - r1 * d} y2={cy + r1 * d} stroke="rgba(205,190,255,.22)" strokeWidth="1.5" />
      <text x={cx + r1 * 0.72} y={cy - r1 * 0.72} style={label}>R {Math.round(112 * d)}</text>
      <text x={cx - r1 * 0.95} y={cy + 34} style={label}>T 56</text>
      <text x={cx + 14} y={cy + r1 - 14} style={label}>{`F ${String(f).padStart(3, "0")}`}</text>
    </svg>
  );
}

// ── the spark ────────────────────────────────────────────────
function Spark({ x, y, r, rot = 0, sx = 1, sy = 1, glow = 1, color = C.paper }) {
  return (
    <svg style={{ position: "absolute", left: x - r * 3, top: y - r * 3, overflow: "visible" }} width={r * 6} height={r * 6} viewBox={`${-r * 3} ${-r * 3} ${r * 6} ${r * 6}`}>
      <defs><radialGradient id={`sg${Math.round(r)}`}><stop offset="0" stopColor={C.iris} stopOpacity=".9" /><stop offset="1" stopColor={C.iris} stopOpacity="0" /></radialGradient></defs>
      <circle r={r * 2.6} fill={`url(#sg${Math.round(r)})`} opacity={glow * 0.8} />
      <g transform={`rotate(${rot}) scale(${sx} ${sy})`}><path d={sparkPath(0, 0, r, 0.2)} fill={color} /></g>
    </svg>
  );
}

// ── hit effects ──────────────────────────────────────────────
function Shockwave({ f, cx, cy, start, max, width = 6, color = "255,255,255" }) {
  const t = f - start;
  if (t < 0 || t > 32) return null;
  const p = interpolate(t, [0, 32], [0, 1], { ...clamp, easing: easeOut });
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <circle cx={cx} cy={cy} r={max * p} fill="none" stroke={`rgba(${color},${(1 - p) * 0.8})`} strokeWidth={width * (1 - p) + 0.5} />
    </svg>
  );
}

function Burst({ f, cx, cy, start, count, speed, seed, scale = 1 }) {
  const t = f - start;
  if (t < 0 || t > 60) return null;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const a = random(`${seed}a${i}`) * Math.PI * 2;
    const v = (0.35 + random(`${seed}v${i}`) * 0.65) * speed;
    const life = 18 + random(`${seed}l${i}`) * 34;
    if (t > life) continue;
    const tau = 9;
    const dist = v * tau * (1 - Math.exp(-t / tau));
    const vel = v * Math.exp(-t / tau);
    const x = cx + Math.cos(a) * dist;
    const y = cy + Math.sin(a) * dist + 0.04 * t * t;
    const o = 1 - t / life;
    const kind = random(`${seed}k${i}`);
    const col = kind < 0.5 ? "#FFFFFF" : kind < 0.8 ? C.iris : C.sky;
    if (kind > 0.86) {
      const r = (6 + random(`${seed}s${i}`) * 10) * scale;
      parts.push(<path key={i} d={sparkPath(x, y, r * o + 2, 0.2)} fill={col} opacity={o} />);
    } else {
      const len = Math.max(2, vel * 2.2) * scale;
      const w = (1.5 + random(`${seed}w${i}`) * 2.5) * scale;
      parts.push(<line key={i} x1={x} y1={y} x2={x - Math.cos(a) * len} y2={y - Math.sin(a) * len} stroke={col} strokeWidth={w} strokeLinecap="round" opacity={o} />);
    }
  }
  return <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>{parts}</svg>;
}

function Streak({ f, cy }) {
  const t = f - T.hit;
  if (t < 0 || t > 26) return null;
  const sx = interpolate(t, [0, 6, 26], [0.1, 1.2, 1.6], clamp);
  const o = interpolate(t, [0, 3, 26], [0, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: cy - 2, height: 4, opacity: o, transform: `scaleX(${sx})`, background: `linear-gradient(90deg, transparent, ${C.iris} 30%, #fff 50%, ${C.iris} 70%, transparent)`, filter: "blur(1.5px)", boxShadow: `0 0 40px 8px rgba(143,114,255,.55)` }} />
  );
}

// ── the composition ──────────────────────────────────────────
export const Reveal = ({ url, slogan, services = [], servicesStyle = "line" }) => {
  useMono();
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const cx = width / 2;
  const cy = height * (height > 1600 ? 0.46 : 0.45);
  const s = Math.min(width * 0.74, 820) / WM_W; // wordmark scale, units -> px
  // screen position of wordmark units
  const X = (u) => cx + (u - WM_W / 2) * s;
  const Y = (v) => cy + (v - WM_CY) * s;

  // camera: slow push-in after the hit, plus shake on impacts
  const push = interpolate(f, [T.hit, 240], [1, 1.045], clamp);
  const shake = (start, amp, tau) => {
    const t = f - start;
    if (t < 0) return [0, 0];
    const k = amp * Math.exp(-t / tau);
    return [(random(`sx${f}`) - 0.5) * 2 * k, (random(`sy${f}`) - 0.5) * 2 * k];
  };
  const [s1x, s1y] = shake(T.hit, 22, 4.5);
  const [s2x, s2y] = shake(T.land, 5, 3);
  const camX = s1x + s2x, camY = s1y + s2y;

  // trace: spark pen runs along the outline
  const traceP = interpolate(f, [T.traceA, T.traceB], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const suck = interpolate(f, [T.suckA, T.silence], [0, 1], { ...clamp, easing: easeIn });
  const traceTilt = interpolate(f, [T.traceA, T.traceB], [28, 0], { ...clamp, easing: easeOut });
  const traceScale = interpolate(f, [T.traceA, T.traceB], [1.18, 1.0], { ...clamp, easing: easeOut }) * (1 - suck * 0.45);

  // seed spark position: ignites at centre, rides the pen, then shoots up and away
  const seedOn = f >= T.ignite && f < T.silence;
  const ignite = spring({ frame: f - T.ignite, fps, config: { damping: 9, stiffness: 160 } });
  // the seed rides the tip of the construction circle as it draws
  const draw = interpolate(f, [T.ignite, T.traceB], [0, 1], { ...clamp, easing: easeOut });
  const ang = -Math.PI / 2 + draw * Math.PI * 2;
  const ringR = 470 * s * 3.1 * Math.min(1, draw * 12);
  let seedX = cx + Math.cos(ang) * ringR, seedY = cy + Math.sin(ang) * ringR;
  const leave = interpolate(f, [T.suckA, T.silence], [0, 1], { ...clamp, easing: easeIn });
  seedX = interpolate(leave, [0, 1], [seedX, X(WSPARK.x)]);
  seedY = interpolate(leave, [0, 1], [seedY, -300]);

  // hit: wordmark slams in
  const hitS = spring({ frame: f - T.hit, fps, config: { damping: 11, stiffness: 210, mass: 0.9 } });
  const slam = interpolate(hitS, [0, 1], [1.4, 1]);
  const blurPx = interpolate(f - T.hit, [0, 5], [14, 0], clamp);
  const ca = f >= T.hit ? 16 * Math.exp(-(f - T.hit) / 4) : 0; // chromatic split, px
  const flash = f < T.hit ? 0 : interpolate(f - T.hit, [0, 1, 5], [0.85, 0.35, 0], clamp);

  // spark drop + land
  const fall = interpolate(f, [T.dropA, T.land], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const landS = spring({ frame: f - T.land, fps, config: { damping: 7, stiffness: 220 } });
  const sparkX = X(WSPARK.x);
  const sparkY = f < T.land ? interpolate(fall, [0, 1], [-260, Y(WSPARK.y)]) : Y(WSPARK.y);
  const squashX = f < T.land ? 1 - fall * 0.35 : interpolate(landS, [0, 1], [1.45, 1]);
  const squashY = f < T.land ? 1 + fall * 0.9 : interpolate(landS, [0, 1], [0.55, 1]);
  const sparkRot = f < T.land ? -40 * (1 - fall) : interpolate(landS, [0, 1], [8, 0]) + (f > T.land + 30 ? 6 * Math.sin((f - T.land) / 20) : 0);

  // URL reveal
  const lineP = interpolate(f, [T.urlA + 12, T.urlA + 28], [0, 1], { ...clamp, easing: easeOut });
  const urlY = Y(WM_BOT) + 70 * (width / 1080);
  const words = slogan.split(" ");

  // sheen sweep, in wordmark units
  const sheenX = interpolate(f, [T.sheen, T.sheen + 34], [-800, WM_W + 800], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  const showSolid = f >= T.hit;
  const vb = `0 ${WM_TOP} ${WM_W} ${WM_BOT - WM_TOP}`;
  const wmBox = { position: "absolute", left: X(0), top: Y(WM_TOP), width: WM_W * s, height: (WM_BOT - WM_TOP) * s };

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("reveal.wav")} />
      <Backdrop f={f} cx={cx} cy={cy} />
      <AbsoluteFill style={{ transform: `translate(${camX}px, ${camY}px) scale(${push})`, transformOrigin: `${cx}px ${cy}px` }}>
        <Grid f={f} width={width} height={height} cx={cx} cy={cy} />
        <Blueprint f={f} cx={cx} cy={cy} s={s} />

        {/* light-trace of the letters */}
        {f >= T.traceA && f < T.silence + 2 && (
          <div style={{ ...wmBox, perspective: 1400, opacity: 1 - suck, filter: `blur(${suck * 10}px)` }}>
            <svg viewBox={vb} width="100%" height="100%" style={{ overflow: "visible", transform: `rotateX(${traceTilt}deg) scale(${traceScale})`, transformOrigin: `50% ${((WM_CY - WM_TOP) / (WM_BOT - WM_TOP)) * 100}%` }}>
              <path d={WORDMARK.letters} fill="none" stroke={C.iris} strokeWidth={16} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - traceP} style={{ filter: `drop-shadow(0 0 30px ${C.uv})` }} />
              <path d={WORDMARK.letters} fill="none" stroke="#fff" strokeWidth={5} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - traceP} />
              <path d={WORDMARK.letters} fill={C.paper} opacity={traceP * 0.07} />
            </svg>
          </div>
        )}

        {/* solid wordmark with RGB split on impact */}
        {showSolid && (
          <div style={{ ...wmBox, transform: `scale(${slam})`, filter: `blur(${blurPx}px)`, transformOrigin: `50% ${((WM_CY - WM_TOP) / (WM_BOT - WM_TOP)) * 100}%` }}>
            {ca > 0.4 ? (
              [["#FF2B4E", -ca, 0], ["#2BFF8F", 0, ca * 0.3], ["#3B5BFF", ca, 0]].map(([col, dx, dy]) => (
                <svg key={col} viewBox={vb} width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "screen", transform: `translate(${dx}px, ${dy}px)` }}>
                  <path d={WORDMARK.letters} fill={col} />
                </svg>
              ))
            ) : (
              <svg viewBox={vb} width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                <defs>
                  <clipPath id="letters"><path d={WORDMARK.letters} /></clipPath>
                  <linearGradient id="sheen" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".95" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
                </defs>
                <path d={WORDMARK.letters} fill={C.paper} />
                <g clipPath="url(#letters)">
                  <rect x={sheenX - 260} y={WM_TOP - 400} width="520" height={WM_BOT - WM_TOP + 800} fill="url(#sheen)" transform={`skewX(-20)`} opacity=".55" />
                  <rect x={sheenX - 260} y={WM_TOP - 400} width="520" height={WM_BOT - WM_TOP + 800} fill={C.iris} transform={`skewX(-20) translate(-300 0)`} opacity=".25" />
                </g>
              </svg>
            )}
          </div>
        )}

        <Shockwave f={f} cx={cx} cy={cy} start={T.hit} max={Math.max(width, height) * 0.9} width={10} />
        <Shockwave f={f} cx={cx} cy={cy} start={T.hit + 3} max={Math.max(width, height) * 0.6} width={4} color="143,114,255" />
        <Streak f={f} cy={cy} />
        <Burst f={f} cx={cx} cy={cy} start={T.hit} count={110} speed={42} seed="hit" />

        {/* seed spark */}
        {seedOn && (
          <Spark x={seedX} y={seedY} r={22 * ignite * (1 - leave * 0.3)} rot={f * 4} sy={1 + leave * 1.8} sx={1 - leave * 0.4} glow={1.2} />
        )}
        {/* returning spark = the i-dot */}
        {f >= T.dropA && (
          <Spark x={sparkX} y={sparkY} r={WSPARK.r * s} rot={sparkRot} sx={squashX} sy={squashY} glow={f < T.land ? 1 : interpolate(f - T.land, [0, 20], [1.6, 0.7], clamp)} color={C.iris} />
        )}
        <Shockwave f={f} cx={sparkX} cy={Y(WSPARK.y)} start={T.land} max={220} width={4} color="143,114,255" />
        <Burst f={f} cx={sparkX} cy={Y(WSPARK.y)} start={T.land} count={16} speed={11} seed="land" scale={0.7} />

        {/* slogan, divider, URL */}
        {f >= T.urlA && (
          <div style={{ position: "absolute", left: 0, right: 0, top: urlY, display: "grid", justifyItems: "center", gap: 30 }}>
            <div style={{ display: "flex", gap: "0.28em", fontFamily: "Sora", fontWeight: 600, fontSize: 58, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              {words.map((w, i) => {
                const p = interpolate(f, [T.urlA + i * 5, T.urlA + 16 + i * 5], [0, 1], { ...clamp, easing: easeOut });
                return (
                  <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 6 }}>
                    <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, color: i === words.length - 1 ? C.iris : C.paper }}>{w}</span>
                  </span>
                );
              })}
            </div>
            <div style={{ width: 300 * lineP, height: 2, background: `linear-gradient(90deg, transparent, ${C.iris}, transparent)` }} />
            <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 30, letterSpacing: "0.2em", color: C.paper, opacity: 0.85 }}>
              {url.split("").map((ch, i) => {
                const p = interpolate(f, [T.urlA + 20 + i * 1.1, T.urlA + 32 + i * 1.1], [0, 1], { ...clamp, easing: easeOut });
                return <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: `blur(${(1 - p) * 6}px)`, color: ch === "." ? C.iris : C.paper }}>{ch}</span>;
              })}
            </div>
            {services.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: servicesStyle === "pills" ? 12 : 0, marginTop: servicesStyle === "pills" ? 18 : 10, maxWidth: width - 120 }}>
                {services.map((sv, i) => {
                  const p = interpolate(f, [T.urlA + 44 + i * 4, T.urlA + 58 + i * 4], [0, 1], { ...clamp, easing: easeOut });
                  const base = { display: "inline-flex", alignItems: "center", opacity: p, transform: `translateY(${(1 - p) * 12}px)`, fontFamily: "GeistMono", textTransform: "uppercase" };
                  return servicesStyle === "pills" ? (
                    <span key={sv} style={{ ...base, height: 50, padding: "0 22px", borderRadius: 99, border: "1.5px solid rgba(205,190,255,.28)", background: "rgba(143,114,255,.08)", fontSize: 20, letterSpacing: "0.12em", color: C.paper }}>{sv}</span>
                  ) : (
                    <span key={sv} style={{ ...base, fontSize: 22, letterSpacing: "0.18em", color: "rgba(243,241,250,.62)" }}>
                      {i > 0 && <span style={{ margin: "0 18px", color: C.iris }}>✦</span>}{sv}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />
      <Vignette />
      <Grain f={f} />
    </AbsoluteFill>
  );
};
