// Scoreboard comparison: every row knocks the subscription builder down and lights Appify up, 6/6.
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, rowAt } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";

const C = { ink: "#0A0913", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", alert: "#F0384F", mute: "#8A84A3", green: "#3BE38B" };
const DISPLAY = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 };
const MONO = { fontFamily: "Mono", letterSpacing: "0.14em" };
const BLOCK_H = 1240;
const ROW = 148, CELL = 96; // row pitch and cell height inside the block // the layout is designed on a 1080 x 1150 block, scaled to fit each format

function Cell({ f, fps, start, side, text, i, faded }) {
  const good = side === "right";
  const s = spring({ frame: f - start, fps, config: { damping: 15, stiffness: 170 } });
  const mark = spring({ frame: f - start - 6, fps, config: { damping: 8, stiffness: 260 } });
  if (f < start) return null;
  const dx = (1 - s) * (good ? 160 : -160);
  return (
    <div style={{ position: "absolute", left: good ? 550 : 40, width: 490, top: 0, height: CELL, borderRadius: 22, display: "flex", alignItems: "center", gap: 18, padding: "0 22px",
      background: good ? "linear-gradient(135deg, rgba(91,43,255,.55), rgba(143,114,255,.28))" : "rgba(243,241,250,.06)",
      border: good ? "2px solid rgba(205,190,255,.55)" : "2px solid rgba(243,241,250,.12)",
      boxShadow: good ? "0 14px 40px rgba(91,43,255,.35)" : "none",
      opacity: Math.min(1, s * 1.6) * (good ? 1 : 1 - 0.45 * faded), transform: `translateX(${dx}px)` }}>
      <div style={{ flex: "0 0 52px", height: 52, borderRadius: 99, display: "grid", placeItems: "center", background: good ? C.green : "rgba(240,56,79,.18)", transform: `scale(${mark})`, ...DISPLAY, fontSize: 32, color: good ? "#0B3D22" : C.alert }}>{good ? "✓" : "✕"}</div>
      <div style={{ ...DISPLAY, fontSize: 32, color: good ? "#fff" : "rgba(243,241,250,.62)", textDecoration: !good && faded > 0.5 ? "line-through" : "none", textDecorationColor: "rgba(240,56,79,.7)" }}>{text}</div>
    </div>
  );
}

export const Main = ({ rows, price, monthly, cta, url }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const k = Math.min(W / 1080, (H * (H > 1600 ? 0.66 : 0.9)) / BLOCK_H);
  const top = H > 1600 ? H * 0.46 - (BLOCK_H * k) / 2 : (H - BLOCK_H * k) / 2;

  const score = rows.reduce((n, _, i) => n + (f >= rowAt(i) + 20 ? 1 : 0), 0);
  const faded = interpolate(f, [T.hush, T.verdict], [0, 1], clamp);
  const verdict = spring({ frame: f - T.verdict, fps, config: { damping: 9, stiffness: 240 } });
  const out = interpolate(f, [T.out, T.out + 16], [0, 1], { ...clamp, easing: easeIn });
  const [sx, sy] = shake(f, T.verdict, 10, 4);
  const titleW = (txt, i, color, size) => {
    const p = spring({ frame: f - T.title - i * 6, fps, config: { damping: 13, stiffness: 200 } });
    return <span key={txt} style={{ display: "inline-block", ...DISPLAY, fontSize: size, color, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)`, marginRight: 18 }}>{txt}</span>;
  };
  const heads = spring({ frame: f - T.heads, fps, config: { damping: 15 } });
  const glow = 0.4 + 0.12 * Math.sin(f / 18) + 0.4 * Math.exp(-Math.max(0, f - T.verdict) / 20) * (f >= T.verdict ? 1 : 0);

  // end card
  const e = (d) => spring({ frame: f - T.end - d, fps, config: { damping: 13, stiffness: 190 } });
  const rise = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px)` });
  const wmW = 300, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  const push = interpolate(f, [T.end, 450], [1, 1.035], clamp);

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 50%, rgba(91,43,255,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ opacity: 0.08, backgroundImage: "linear-gradient(rgba(205,190,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(205,190,255,.6) 1px, transparent 1px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${-f * 0.4}px` }} />

      {/* ── the scoreboard */}
      {f < T.out + 18 && (
        <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top, width: 1080, height: BLOCK_H, transform: `translate(${sx}px, ${sy - out * 80}px) scale(${k})`, transformOrigin: "0 0", opacity: 1 - out }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center" }}>
            <div>{titleW("Subscription", 0, "rgba(243,241,250,.75)", 74)}{titleW("builder", 1, "rgba(243,241,250,.75)", 74)}</div>
            <div style={{ marginTop: 6 }}>{titleW("vs", 2, C.mute, 74)}{titleW("Appify", 3, C.iris, 74)}{titleW("custom", 4, "#fff", 74)}</div>
          </div>
          {/* column headers + live score */}
          <div style={{ position: "absolute", top: 196, left: 40, width: 490, display: "flex", justifyContent: "space-between", alignItems: "center", ...MONO, fontSize: 22, color: C.mute, opacity: heads * (1 - 0.5 * faded), transform: `translateX(${(1 - heads) * -80}px)` }}>
            <span>SUBSCRIPTION BUILDER</span><span style={{ ...DISPLAY, fontSize: 40, color: "rgba(240,56,79,.8)" }}>0/{rows.length}</span>
          </div>
          <div style={{ position: "absolute", top: 196, left: 550, width: 490, display: "flex", justifyContent: "space-between", alignItems: "center", ...MONO, fontSize: 22, color: C.paper, opacity: heads, transform: `translateX(${(1 - heads) * 80}px)` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><svg width="26" height="26" viewBox="-13 -13 26 26"><path d={sparkPath(0, 0, 12, 0.22)} fill={C.iris} /></svg>APPIFY CUSTOM</span>
            <span style={{ ...DISPLAY, fontSize: 40, color: C.green, transform: `scale(${1 + 0.25 * (f >= T.verdict ? Math.max(0, 1 - (f - T.verdict) / 12) : 0)})` }}>{score}/{rows.length}</span>
          </div>
          {rows.map(([label, bad, good], i) => {
            const r = rowAt(i);
            const lp = interpolate(f, [r, r + 8], [0, 1], { ...clamp, easing: easeOut });
            return (
              <div key={label} style={{ position: "absolute", left: 0, top: 262 + i * ROW, width: 1080, height: ROW }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, textAlign: "center", ...MONO, fontSize: 21, color: C.mute, opacity: lp }}>{label}</div>
                <div style={{ position: "absolute", left: 0, top: 32, width: 1080 }}>
                  <Cell f={f} fps={fps} start={r + 2} side="left" text={bad} i={i} faded={faded} />
                  <Cell f={f} fps={fps} start={r + 14} side="right" text={good} i={i} faded={0} />
                </div>
              </div>
            );
          })}
          {/* verdict stamp on the Appify column */}
          {f >= T.verdict && (
            <div style={{ position: "absolute", left: 640, top: 1150, padding: "8px 28px", borderRadius: 16, border: `6px solid ${C.green}`, background: "rgba(10,9,19,.82)", ...DISPLAY, fontSize: 58, color: C.green, transform: `rotate(-6deg) scale(${interpolate(verdict, [0, 1], [2.2, 1])})`, opacity: Math.min(1, verdict * 2) }}>WINNER</div>
          )}
        </div>
      )}
      <Shockwave f={f} cx={W / 2 + 255 * k} cy={top + 1190 * k} start={T.verdict} max={W * 0.9} width={6} rgb="59,227,139" dur={26} />
      <Burst f={f} cx={W / 2 + 255 * k} cy={top + 1190 * k} start={T.verdict} count={60} speed={26 * k} colors={["#fff", C.green, C.iris]} seed="win" scale={0.8} />

      {/* ── end card */}
      {f >= T.end && (
        <div style={{ position: "absolute", left: 0, top: H * (H > 1600 ? 0.47 : 0.5), width: W, transform: `translateY(-50%) scale(${push * Math.min(1, W / 1080)})`, display: "grid", justifyItems: "center", textAlign: "center" }}>
          <div style={{ ...DISPLAY, fontSize: 112, color: "#fff", ...rise(e(0)) }}>Own your store.</div>
          <div style={{ ...DISPLAY, fontSize: 112, color: C.iris, marginTop: 4, ...rise(e(8)) }}>Pay once.</div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 40, ...DISPLAY, fontSize: 48, ...rise(e(20)) }}>
            <span style={{ fontSize: 96, color: "#fff" }}>${price}</span>
            <span style={{ padding: "8px 22px", borderRadius: 99, background: C.uv, color: "#fff", fontSize: 40 }}>one-time</span>
            <span style={{ color: "rgba(243,241,250,.55)", textDecoration: "line-through", textDecorationColor: C.alert, textDecorationThickness: 5, fontSize: 40 }}>${monthly * 12}/yr</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 30, ...rise(e(26)) }}>
            {["Custom analytics + admin", "Live in under 1 week"].map((t) => (
              <span key={t} style={{ padding: "10px 16px", borderRadius: 99, border: "2px solid rgba(59,227,139,.45)", background: "rgba(59,227,139,.1)", ...DISPLAY, fontSize: 27, color: C.paper }}><span style={{ color: C.green }}>✓</span> {t}</span>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: "22px 36px", borderRadius: 26, background: "rgba(243,241,250,.07)", border: "2px solid rgba(205,190,255,.3)", ...rise(e(38)) }}>
            <div style={{ ...DISPLAY, fontSize: 40, color: C.paper }}>Comment <span style={{ color: C.iris }}>“{cta}”</span></div>
            <div style={{ ...DISPLAY, fontSize: 34, color: "rgba(243,241,250,.7)", marginTop: 8 }}>for a <span style={{ color: C.sky }}>free prototype</span></div>
          </div>
          <div style={{ display: "grid", justifyItems: "center", gap: 12, marginTop: 44, ...rise(e(50)) }}>
            <svg viewBox={WORDMARK.viewBox} width={wmW} height={wmH}><path d={WORDMARK.letters} fill={C.paper} /><path d={WORDMARK.spark} fill={C.iris} /></svg>
            <div style={{ ...MONO, fontSize: 28, color: C.paper, letterSpacing: "0.18em" }}>{url}</div>
          </div>
        </div>
      )}
      <Flash f={f} start={T.verdict} peak={0.25} />
      <Vignette strength={0.4} />
      <Grain f={f} opacity={0.05} />
    </AbsoluteFill>
  );
};
