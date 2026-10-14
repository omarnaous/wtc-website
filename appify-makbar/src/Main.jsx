// MAK BAR spec commercial, 20 s, 9:16 (+4:5). All footage and photos are MAK BAR's own (their Instagram); every
// number on screen is from their own product cards. One idea: the ⚡ on every bar is the editor. Bolts strike each
// chapter in, the montage cuts on the beat, the product chapter charges up each bar's numbers, the last bolt strikes
// the wordmark: "MUNCH BETTER."
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FPS, STRIKE, CH, LOGO, CLIPS, SMASH, BARS, BAR_LEN } from "./timing.js";
import { LOGO as MARK } from "./logo.js";
import { useFonts, clamp, easeOut, easeIn, after, shake, Grain, Vignette } from "./fx.jsx";

const C = { ink: "#05070C", blue: "#2F5BEA", court: "#1E4FB8", mint: "#8EF0D0", chalk: "#F4F7FB" };
const K = { fontFamily: "Cond", fontWeight: 900, textTransform: "uppercase", lineHeight: 0.86, letterSpacing: "-0.01em" };
const M = { fontFamily: "Mono", textTransform: "uppercase", letterSpacing: "0.24em" };
const sp = (f, at, damping = 12, stiffness = 240) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
// their bolt, as on the pack (100 x 200 box)
const BOLT = "M64 0 L16 116 H47 L30 200 L86 74 H54 Z";

function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}
// a lightning strike from the top of the frame to the bottom: a jagged, branching polyline with glow
function Lightning({ f, at, seed = "l", x0 = 540, dur = 7 }) {
  const t = f - at;
  if (t < 0 || t > dur) return null;
  const grow = Math.min(1, (t + 1) / 2.5), o = interpolate(t, [0, 2, dur], [1, 1, 0], clamp);
  const pts = []; let x = x0 + (random(`${seed}x`) - 0.5) * 300;
  for (let i = 0; i <= 18; i++) { pts.push([x, (i / 18) * 1920 * grow]); x += (random(`${seed}${i}`) - 0.5) * 170; }
  const br = []; for (let b = 0; b < 3; b++) { const s = pts[4 + b * 4]; let bx = s[0], by = s[1]; const q = [[bx, by]]; for (let j = 0; j < 5; j++) { bx += (random(`${seed}b${b}${j}`) - 0.3) * 120 * (b % 2 ? -1 : 1); by += 70; q.push([bx, by]); } br.push(q); }
  const d = (p) => "M" + p.map(([a, b]) => `${a},${b}`).join(" L");
  const flick = t === 1 || t === 3 ? 0.4 : 1;
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: o * flick }}>
      <defs><filter id={`g${seed}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter></defs>
      <path d={d(pts)} stroke={C.mint} strokeWidth="38" fill="none" filter={`url(#g${seed})`} opacity="0.8" />
      {br.map((q, i) => <path key={i} d={d(q)} stroke="#fff" strokeWidth="4" fill="none" opacity="0.8" />)}
      <path d={d(pts)} stroke="#fff" strokeWidth="9" fill="none" strokeLinejoin="round" />
    </svg>
  );
}
function Flash({ f, at, peak = 0.9, color = "#E9F6FF" }) {
  const t = f - at;
  if (t < 0 || t > 6) return null;
  return <AbsoluteFill style={{ background: color, opacity: interpolate(t, [0, 1, 6], [peak, peak * 0.45, 0], clamp), mixBlendMode: "screen" }} />;
}
// footage: covers the frame, a cool contrasty grade
function Clip({ c, f }) {
  const [at, len, src, from, rate] = c, t = f - at;
  const push = 1.04 + 0.05 * (t / len);
  return (
    <Sequence from={at} durationInFrames={len} layout="none">
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <OffthreadVideo src={staticFile(`footage/${src}.mp4`)} startFrom={Math.round(from * FPS)} playbackRate={rate} muted
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${push})`, filter: "contrast(1.12) saturate(1.08) brightness(0.92)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,12,.55), rgba(5,7,12,0) 30%, rgba(5,7,12,0) 62%, rgba(5,7,12,.7))" }} />
      </AbsoluteFill>
    </Sequence>
  );
}
// big stacked condensed type that slams in
function Slam({ f, at, lines, size = 300, top = 300, color = "#fff", accent = null, out = null }) {
  if (f < at || (out !== null && f >= out)) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center" }}>
      {lines.map((l, i) => {
        const p = sp(f, at + i * 5, 11, 320);
        return <div key={l} style={{ ...K, fontSize: size, color: accent === i ? C.mint : color, opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [1.6, 1])})`, textShadow: "0 10px 50px rgba(0,0,0,.45)" }}>{l}</div>;
      })}
    </div>
  );
}
function Hud({ f, left, right }) {
  return (
    <>
      <div style={{ position: "absolute", left: 64, top: 150, ...M, fontSize: 22, color: "rgba(255,255,255,.85)" }}>{left}</div>
      <div style={{ position: "absolute", right: 64, top: 150, ...M, fontSize: 22, color: "rgba(255,255,255,.85)" }}>{right}</div>
    </>
  );
}

// ── product chapter: each bar's real numbers charge up ──────────────────────────────────────────────
function Charge({ b, f }) {
  const t = f - b.at;
  if (t < 0 || t >= BAR_LEN) return null;
  const n = Math.round(interpolate(t, [4, 22], [0, b.big], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = t >= 22 ? 1 + 0.12 * Math.exp(-(t - 22) / 4) : interpolate(t, [4, 22], [0.85, 1], clamp);
  const name = sp(t, 0, 12, 260);
  const meter = interpolate(t, [4, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(5,7,12,0) 42%, ${b.tint}55 70%, rgba(5,7,12,.85) 100%)` }} />
      <div style={{ position: "absolute", left: 70, top: 250, opacity: Math.min(1, name * 3), transform: `translateX(${(1 - name) * -60}px)` }}>
        <div style={{ ...M, fontSize: 26, color: C.mint }}>{b.line}</div>
        {b.name.map((l) => <div key={l} style={{ ...K, fontSize: 150, color: "#fff", textShadow: "0 8px 40px rgba(0,0,0,.5)" }}>{l}</div>)}
      </div>
      <div style={{ position: "absolute", left: 70, top: 1190, display: "flex", alignItems: "flex-end", gap: 18 }}>
        <svg width="70" height="140" viewBox="0 0 100 200" style={{ marginBottom: 30, filter: `drop-shadow(0 0 ${20 * meter}px ${C.mint})` }}><path d={BOLT} fill={meter >= 1 ? C.mint : "rgba(255,255,255,.35)"} /></svg>
        <div style={{ ...K, fontSize: 330, color: "#fff", transform: `scale(${land})`, transformOrigin: "0 100%", fontVariantNumeric: "tabular-nums" }}>{n}<span style={{ fontSize: 170, textTransform: "none" }}>{b.unit}</span></div>
        <div style={{ ...K, fontSize: 90, color: C.mint, marginBottom: 46 }}>{b.label}</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1500, width: 940, height: 10, borderRadius: 9, background: "rgba(255,255,255,.18)" }}>
        <div style={{ width: `${meter * 100}%`, height: "100%", borderRadius: 9, background: `linear-gradient(90deg, ${C.blue}, ${C.mint})`, boxShadow: `0 0 24px ${C.mint}` }} />
      </div>
      <div style={{ position: "absolute", left: 70, top: 1550, display: "flex", flexWrap: "wrap", gap: 16, width: 960 }}>
        {b.chips.map((c, i) => { const p = sp(t, 24 + i * 6, 12, 300); return <div key={c} style={{ ...M, letterSpacing: "0.12em", fontSize: 28, color: C.ink, background: i ? "#fff" : C.mint, padding: "14px 24px", borderRadius: 999, opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [1.3, 1])})` }}>{c}</div>; })}
      </div>
    </>
  );
}

// ── the end: one last bolt strikes the wordmark ─────────────────────────────────────────────────────
function EndCard({ f }) {
  const t = f - CH.end;
  if (t < 0) return null;
  const p = sp(f, LOGO, 10, 230), blur = after(f, LOGO, [0, 5], [16, 0]);
  const w = 560, h = (w * MARK.h) / MARK.w;
  const [sx, sy] = shake(f, LOGO, 22, 5);
  const glow = interpolate(f - LOGO, [0, 3, 30], [1.2, 1.2, 0.5], clamp);
  const breathe = 1 + 0.012 * Math.sin(Math.max(0, f - LOGO - 20) / 14);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 40% at 50% 42%, rgba(47,91,234,${0.45 * glow}), transparent 70%), radial-gradient(ellipse 60% 30% at 50% 70%, rgba(142,240,208,${0.25 * glow}), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
        {f >= LOGO && (
          <svg viewBox={`0 0 ${MARK.w} ${MARK.h}`} width={w} height={h} style={{ position: "absolute", left: 540 - w / 2, top: 600, transform: `scale(${interpolate(p, [0, 1], [1.7, 1]) * breathe})`, filter: `blur(${blur}px) drop-shadow(0 0 30px rgba(142,240,208,${0.4 * glow}))` }}>
            <path d={MARK.d} fill="#fff" fillRule="evenodd" />
          </svg>
        )}
        <Slam f={f} at={LOGO + 14} lines={["MUNCH BETTER."]} size={150} top={1430} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...M, fontSize: 30, color: C.mint, opacity: after(f, LOGO + 28, [0, 10], [0, 1]) }}>@wearemakbar · #beoneofus</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1730, textAlign: "center", ...M, fontSize: 18, color: "rgba(255,255,255,.45)", opacity: after(f, LOGO + 36, [0, 10], [0, 1]) }}>Spec ad · unofficial · motion by Appify @appifylb</div>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Cond", "barlow-condensed-latin-900-normal.woff2", { weight: "900" }], ["Mono", "GeistMono-500.ttf"], ["Inter", "inter-latin-600-normal.woff2", { weight: "600" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const cutAt = CLIPS.map((c) => c[0]).filter((a) => a > 0 && a !== CH.court && a !== CH.quiet && a !== CH.product && a !== CH.munch);
  const strikes = [STRIKE, CH.court, CH.product, CH.munch, LOGO - 2];
  const recent = Math.max(...[...cutAt, ...strikes].filter((a) => a <= f), -99);
  const [sx, sy] = shake(f, recent, strikes.includes(recent) ? 20 : 9, 3);
  const punch = 1 + 0.05 * Math.exp(-Math.max(0, f - recent) / 4) * (f >= recent ? 1 : 0);
  const rep = CLIPS.filter((c) => c[0] >= CH.train && c[0] < CH.court && f >= c[0]).length;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${punch})` }}>
        {f >= STRIKE && f < CH.end && CLIPS.map((c) => <Clip key={c[0]} c={c} f={f} />)}
        {f >= SMASH[0] && f < SMASH[0] + SMASH[1] && (
          <AbsoluteFill style={{ overflow: "hidden" }}>
            <Img src={staticFile("ig/smash.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.08 + 0.004 * (f - SMASH[0])})`, filter: "contrast(1.1)" }} />
            <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,12,.6), rgba(5,7,12,0) 35%, rgba(5,7,12,0) 60%, rgba(5,7,12,.6))" }} />
          </AbsoluteFill>
        )}
        {f >= CH.quiet && f < CH.product && <AbsoluteFill style={{ background: `rgba(5,7,12,${interpolate(f, [CH.quiet, CH.quiet + 6, CH.product - 4, CH.product], [0.2, 0.45, 0.45, 0.9], clamp)})` }} />}
      </AbsoluteFill>
      <Stage W={W} H={H}>
        {/* hook */}
        <Slam f={f} at={STRIKE + 2} lines={["FUEL", "THE JOURNEY."]} size={260} top={560} accent={1} out={CH.train} />
        {/* train */}
        {f >= CH.train && f < CH.court && <Hud f={f} left="MAK BAR · TRAIN" right={`REP ${String(rep).padStart(2, "0")} / 07`} />}
        <Slam f={f} at={CH.train + 2} lines={["PT", "ENERGY."]} size={250} top={1180} out={CH.train + 60} />
        <Slam f={f} at={CH.train + 62} lines={["LAGREE", "PRECISION."]} size={230} top={1180} accent={1} out={CH.court} />
        {/* court */}
        {f >= CH.court && f < CH.quiet && <Hud f={f} left="MAK BAR · COURT" right="ON COURT" />}
        <Slam f={f} at={SMASH[0] + 2} lines={["BELIEVE."]} size={300} top={1240} out={CH.quiet} />
        {/* quiet: the bar comes out of the bag */}
        {f >= CH.quiet + 6 && f < CH.product && <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", ...K, fontSize: 110, color: "#fff", opacity: after(f, CH.quiet + 6, [0, 8], [0, 1]) }}>Fuel up.</div>}
        {/* product */}
        {BARS.map((b) => <Charge key={b.at} b={b} f={f} />)}
        {/* munch */}
        <Slam f={f} at={CH.munch + 17} lines={["MUNCH"]} size={330} top={1150} out={CH.munch + 45} />
        <Slam f={f} at={CH.munch + 45} lines={["BETTER."]} size={330} top={1150} accent={0} out={CH.end} />
        <EndCard f={f} />
        {strikes.map((s, i) => <Lightning key={s} f={f} at={s} seed={`s${i}`} x0={[540, 380, 700, 460, 540][i]} />)}
      </Stage>
      {strikes.map((s) => <Flash key={s} f={f} at={s} peak={s === STRIKE || s === LOGO - 2 ? 0.9 : 0.6} />)}
      {cutAt.map((s) => <Flash key={"c" + s} f={f} at={s} peak={0.18} />)}
      <Audio src={staticFile("sound.wav")} />
      <Vignette strength={0.3} />
      <Grain f={f} opacity={0.04} />
    </AbsoluteFill>
  );
};
