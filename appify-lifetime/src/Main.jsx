// "Rent it or own it." The builder's meter never stops: every feature row costs it two more months at $39,
// while Appify's stays at $360, paid once. Around month 10 the builder has already paid more than Appify costs.
// Scenes are cut with the Appify spark (the next scene is revealed through a spark growing from the centre).
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TURN, ROWS, MATH, END, CUTS, MONTHLY, PRICE, MONTHS_PER_ROW, FEATURES, rowAt, CROSS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

const C = { ink: "#0A0913", ink2: "#17142B", ink3: "#221D40", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", alert: "#F0384F", mute: "#8A84A3" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.95 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 11, stiffness = 240) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pop = (p, k = 1.6) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.iris, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const SH = 1400;   // every scene is designed on a 1080 x 1400 stage, scaled to fit each format

function Stage({ W, H, children, style }) {
  const tall = H > 1600, k = Math.min(1, (H - 100) / SH);
  return (
    <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: tall ? 220 : (H - SH * k) / 2, width: 1080, height: SH, transform: `scale(${k})`, transformOrigin: "0 0", ...style }}>{children}</div>
  );
}
const Grid = ({ f, light }) => (
  <AbsoluteFill style={{ backgroundImage: `linear-gradient(${light ? "rgba(255,255,255,.08)" : "rgba(143,114,255,.08)"} 1.5px, transparent 1.5px), linear-gradient(90deg, ${light ? "rgba(255,255,255,.08)" : "rgba(143,114,255,.08)"} 1.5px, transparent 1.5px)`, backgroundSize: "60px 60px", backgroundPosition: `540px ${f * 0.8}px` }} />
);
const Glow = ({ y = 50, a = 0.5 }) => <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${y}%, rgba(91,43,255,${a}), transparent 62%)` }} />;
function Bubble({ x, y, text, p = 1 }) {
  return <div style={{ position: "absolute", left: x, top: y, padding: "16px 24px", background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 18, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: "Mono", fontSize: 34, color: C.ink, whiteSpace: "nowrap", ...pop(p, 0.6), transformOrigin: "0 100%" }}>{text}</div>;
}

// ── 1 · hook: still renting your website? the meter ticks month after month ──────────────────────
const HOOK_TICKS = [14, 23, 32, 41, 50, 59];   // one month each (sound/build_cues.py ticks on these)
function Hook({ f, W, H }) {
  const m = HOOK_TICKS.filter((t) => f >= t).length;
  const last = HOOK_TICKS[Math.max(0, m - 1)];
  const roll = m ? interpolate(f, [last, last + 5], [(m - 1) * MONTHLY, m * MONTHLY], { ...clamp, easing: easeOut }) : 0;
  const bump = m ? 1 + 0.04 * Math.exp(-(f - last) / 3) : 1;
  const devP = sp(f, 6, 12, 180);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={45} a={0.35} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, rgba(240,56,79,${0.18 + 0.1 * (m / 6)}), transparent 50%)` }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 20, display: "flex", justifyContent: "center" }}>
          <div style={{ ...M, fontSize: 26, color: C.alert, padding: "12px 26px", borderRadius: 99, border: "3px solid rgba(240,56,79,.5)" }}>website builders</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 130, color: "#fff", ...pop(sp(f, -4, 10, 300)) }}>Still renting</div>
          <div style={{ ...D, fontSize: 130, color: C.alert, marginTop: 8, ...pop(sp(f, 4, 10, 300)) }}>your website?</div>
        </div>
        <div style={{ position: "absolute", left: 160, width: 760, top: 470, padding: "34px 0 30px", borderRadius: 36, background: C.ink2, border: `4px solid ${C.alert}`, textAlign: "center", boxShadow: `0 0 ${60 + 40 * (bump - 1) * 25}px rgba(240,56,79,.35)`, opacity: Math.min(1, sp(f, 6, 12, 200) * 2), transform: `translateY(${(1 - Math.min(1, sp(f, 6, 12, 200))) * 40}px) scale(${bump})` }}>
          <div style={{ ...M, fontSize: 26, color: C.alert }}>you've paid so far</div>
          <div style={{ ...D, fontSize: 190, color: "#fff", fontVariantNumeric: "tabular-nums", margin: "14px 0 10px" }}>{money(roll)}</div>
          <div style={{ ...M, fontSize: 26, color: C.mute }}>month {Math.max(1, m)} · no end date</div>
        </div>
        <div style={{ position: "absolute", left: 60, top: 830, transform: `translateY(${(1 - Math.min(1, devP)) * 700}px)` }}>
          <Dev width={300} shock={1} smile={0.1} look={8} brow={16} lid={0.05} tilt={Math.sin(f / 5) * 2} />
        </div>
        {f >= 34 && <Bubble x={330} y={860} text="wait… forever?" p={sp(f, 34, 10, 260)} />}
      </Stage>
    </AbsoluteFill>
  );
}

// ── 2 · turn: or own it. $360 once ─────────────────────────────────────────────────────────────────
function Turn({ f, W, H }) {
  const t = f - TURN, slam = sp(t, 8, 8, 300);
  const [sx, sy] = shake(t, 8, 18, 4);
  return (
    <AbsoluteFill style={{ background: C.uv }}>
      <Grid f={f} light />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,.22), transparent 55%)" }} />
      <Stage W={W} H={H} style={{ translate: `${sx}px ${sy}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", ...D, fontSize: 120, color: "#fff", ...pop(sp(t, 0, 10, 300)) }}>Or own it.</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 10 }}>
          <div style={{ ...D, fontSize: 380, color: "#fff", letterSpacing: "-0.06em", opacity: Math.min(1, slam * 3), transform: `scale(${interpolate(slam, [0, 1], [2.4, 1])})` }}>$360</div>
          <Spark size={110} color={C.sky} style={{ marginTop: 30, transform: `scale(${Math.min(1.2, sp(t, 12, 8, 260))}) rotate(${t * 3}deg)` }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", gap: 18 }}>
          {["one-time", "lifetime plan", "$0/month"].map((s, k) => (
            <div key={s} style={{ ...M, fontSize: 30, padding: "16px 26px", borderRadius: 99, background: k === 2 ? C.sky : "#fff", color: k === 2 ? C.ink : C.uv, ...pop(sp(t, 16 + k * 4, 10, 280), 1.4) }}>{s}</div>
          ))}
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

// ── 3 · rows: builder vs Appify, the builder meter keeps running ──────────────────────────────────
function Rows({ f, W, H }) {
  const shown = FEATURES.filter((_, i) => f >= rowAt(i)).length;
  const at = shown ? rowAt(shown - 1) : ROWS;
  const months = interpolate(f, [at, at + 6], [Math.max(0, shown - 1), shown], { ...clamp, easing: easeOut }) * MONTHS_PER_ROW;
  const paid = months * MONTHLY, crossF = rowAt(CROSS), crossed = f >= crossF + 6;
  const hit = f >= crossF + 6 ? Math.exp(-(f - crossF - 6) / 6) : 0;
  const [sx, sy] = shake(f, crossF + 6, 14, 4);
  const stamp = sp(f, crossF + 6, 9, 300);
  const head = sp(f, ROWS, 12, 220);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={55} a={0.4} />
      <Stage W={W} H={H} style={{ translate: `${sx}px ${sy}px` }}>
        {/* column heads */}
        <div style={{ position: "absolute", left: 30, width: 495, top: 0, textAlign: "center", ...M, fontSize: 24, color: C.mute, padding: "14px 0", ...rise(head) }}>subscription builder</div>
        <div style={{ position: "absolute", left: 555, width: 495, top: 0, display: "flex", justifyContent: "center", ...rise(head) }}>
          <div style={{ ...M, fontSize: 24, color: "#fff", padding: "14px 26px", borderRadius: 99, background: C.uv, display: "flex", gap: 10, alignItems: "center" }}><Spark size={22} color="#fff" />appify lifetime</div>
        </div>
        {/* meters */}
        <div style={{ position: "absolute", left: 30, width: 495, top: 80, height: 180, borderRadius: 28, background: crossed ? `rgba(240,56,79,${0.22 + 0.5 * hit})` : C.ink2, border: `3px solid ${crossed ? C.alert : "rgba(240,56,79,.45)"}`, textAlign: "center", ...rise(head) }}>
          <div style={{ ...D, fontSize: 104, color: crossed ? "#fff" : C.alert, fontVariantNumeric: "tabular-nums", marginTop: 26 }}>{money(paid)}</div>
          <div style={{ ...M, fontSize: 22, color: crossed ? "#fff" : C.mute, marginTop: 14 }}>{Math.round(months)} months · still paying</div>
        </div>
        <div style={{ position: "absolute", left: 555, width: 495, top: 80, height: 180, borderRadius: 28, background: "linear-gradient(135deg, rgba(91,43,255,.55), rgba(143,114,255,.25))", border: "3px solid rgba(205,190,255,.55)", textAlign: "center", ...rise(head) }}>
          <div style={{ ...D, fontSize: 104, color: "#fff", marginTop: 26 }}>{money(PRICE)}</div>
          <div style={{ ...M, fontSize: 22, color: C.sky, marginTop: 14 }}>paid once · $0/month</div>
        </div>
        {/* the crossover stamp */}
        {crossed && (
          <div style={{ position: "absolute", left: 70, top: 262, padding: "8px 16px", borderRadius: 12, background: C.alert, ...M, fontSize: 22, color: "#fff", letterSpacing: "0.1em", transform: `rotate(-4deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`, opacity: Math.min(1, stamp * 3), boxShadow: "0 10px 30px rgba(240,56,79,.5)" }}>already paid more than appify</div>
        )}
        {/* rows */}
        {FEATURES.map(([bad, good], i) => {
          const s0 = rowAt(i); if (f < s0) return null;
          const y = 310 + i * 152, a = sp(f, s0, 13, 200), b = sp(f, s0 + 5, 12, 220), chk = sp(f, s0 + 10, 8, 300);
          const dim = crossed && i <= CROSS ? 0.55 : 1;
          return (
            <div key={i}>
              <div style={{ position: "absolute", left: 30, width: 495, top: y, height: 124, borderRadius: 24, background: "rgba(243,241,250,.05)", border: "2px solid rgba(243,241,250,.1)", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", opacity: Math.min(1, a * 2) * dim, transform: `translateX(${(1 - Math.min(1, a)) * -200}px)` }}>
                <div style={{ flex: "0 0 52px", height: 52, borderRadius: 99, display: "grid", placeItems: "center", background: "rgba(240,56,79,.18)", color: C.alert, ...D, fontSize: 30 }}>✕</div>
                <div style={{ ...D, fontSize: 33, color: "rgba(243,241,250,.6)", lineHeight: 1.1 }}>{bad}</div>
              </div>
              <div style={{ position: "absolute", left: 555, width: 495, top: y, height: 124, borderRadius: 24, background: "linear-gradient(135deg, rgba(91,43,255,.6), rgba(143,114,255,.3))", border: "2px solid rgba(205,190,255,.55)", boxShadow: "0 14px 40px rgba(91,43,255,.35)", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", opacity: Math.min(1, b * 2), transform: `translateX(${(1 - Math.min(1, b)) * 200}px)` }}>
                <div style={{ flex: "0 0 52px", height: 52, borderRadius: 99, display: "grid", placeItems: "center", background: C.sky, color: C.ink, ...D, fontSize: 30, transform: `scale(${chk})` }}>✓</div>
                <div style={{ ...D, fontSize: 36, color: "#fff", lineHeight: 1.1 }}>{good}</div>
              </div>
            </div>
          );
        })}
      </Stage>
      {crossed && <Flash f={f} start={crossF + 6} peak={0.18} color={C.alert} />}
    </AbsoluteFill>
  );
}

// ── 4 · math: over 3 years ──────────────────────────────────────────────────────────────────────────
function MathScene({ f, W, H }) {
  const t = f - MATH, total = MONTHLY * 36, keep = total - PRICE;
  const g = interpolate(t, [4, 26], [0, 1], { ...clamp, easing: easeOut });
  const g2 = interpolate(t, [10, 22], [0, 1], { ...clamp, easing: easeOut });
  const bw = 820;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={50} a={0.4} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", ...D, fontSize: 110, color: "#fff", ...pop(sp(t, 0, 10, 300)) }}>Over 3 years</div>
        <div style={{ position: "absolute", left: 80, top: 290, ...M, fontSize: 26, color: C.mute }}>subscription builder</div>
        <div style={{ position: "absolute", left: 80, top: 340, height: 130, width: Math.max(8, bw * g), borderRadius: 24, background: `linear-gradient(90deg, rgba(240,56,79,.55), ${C.alert})`, boxShadow: "0 16px 40px rgba(240,56,79,.35)" }} />
        <div style={{ position: "absolute", left: 80, top: 495, ...D, fontSize: 90, color: C.alert, fontVariantNumeric: "tabular-nums" }}>{money(total * g)}</div>
        <div style={{ position: "absolute", left: 80, top: 650, ...M, fontSize: 26, color: C.sky }}>appify lifetime</div>
        <div style={{ position: "absolute", left: 80, top: 700, height: 130, width: Math.max(8, bw * (PRICE / total) * g2), borderRadius: 24, background: `linear-gradient(90deg, ${C.uv}, ${C.iris})`, boxShadow: "0 16px 40px rgba(91,43,255,.45)" }} />
        <div style={{ position: "absolute", left: 80 + bw * (PRICE / total) + 30, top: 718, ...D, fontSize: 90, color: "#fff", opacity: g2 }}>{money(PRICE)}<span style={{ ...M, fontSize: 26, color: C.sky, marginLeft: 18, letterSpacing: "0.12em" }}>once</span></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", ...D, fontSize: 92, color: "#fff", ...pop(sp(t, 30, 9, 300), 1.8) }}>You keep <span style={{ color: C.sky }}>{money(keep)}</span></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", ...M, fontSize: 22, color: C.mute, opacity: interpolate(t, [34, 40], [0, 1], clamp) }}>vs a typical ${MONTHLY}/month builder plan · 36 months</div>
      </Stage>
    </AbsoluteFill>
  );
}

// ── 5 · end card: live in under 7 days, $360 once, DM LAUNCH ──────────────────────────────────────
function EndCard({ f, W, H }) {
  const t = f - END;
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 46) / 4);
  const devP = sp(t, 20, 12, 180);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={45} a={0.5 + 0.08 * Math.sin(t / 6)} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 124, color: "#fff", ...pop(sp(t, 2, 10, 300)) }}>Live in</div>
          <div style={{ ...D, fontSize: 124, color: C.sky, marginTop: 6, ...pop(sp(t, 8, 10, 300)) }}>under 7 days.</div>
        </div>
        <div style={{ position: "absolute", left: (1080 - (7 * 118 + 6 * 14)) / 2, top: 340, display: "flex", gap: 14 }}>
          {Array.from({ length: 7 }, (_, k) => {
            const p = sp(t, 12 + k * 3, 10, 280), live = k === 6;
            return (
              <div key={k} style={{ width: 118, height: 136, borderRadius: 22, background: p > 0.5 ? (live ? C.sky : C.uv) : C.ink2, border: `3px solid ${live ? C.sky : "rgba(143,114,255,.45)"}`, display: "grid", placeItems: "center", alignContent: "center", gap: 6, transform: `scale(${0.85 + 0.15 * Math.min(1, p)})` }}>
                <div style={{ ...M, fontSize: 18, color: live && p > 0.5 ? C.ink : "rgba(255,255,255,.7)", letterSpacing: "0.08em" }}>day {k + 1}</div>
                {live ? <div style={{ ...D, fontSize: 30, color: p > 0.5 ? C.ink : "#fff" }}>LIVE</div> : <div style={{ ...D, fontSize: 40, color: "#fff", opacity: Math.min(1, p) }}>✓</div>}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 545, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 22, ...D, ...rise(sp(t, 28, 12, 220)) }}>
          <span style={{ fontSize: 96, color: "#fff" }}>$360 once</span>
          <span style={{ fontSize: 60, color: C.mute }}>·</span>
          <span style={{ fontSize: 96, color: C.sky }}>$0/month</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 710, display: "grid", justifyItems: "center", transform: `scale(${interpolate(sp(t, 40, 9, 260), [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, sp(t, 40, 9, 260) * 2) }}>
          <div style={{ padding: "26px 56px", borderRadius: 30, background: C.uv, textAlign: "center", boxShadow: "0 20px 60px rgba(91,43,255,.55)" }}>
            <div style={{ ...D, fontSize: 84, color: "#fff" }}>DM “LAUNCH”</div>
            <div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 34, color: C.sky, marginTop: 10 }}>for a free prototype</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "grid", justifyItems: "center", gap: 14, ...rise(sp(t, 48, 12, 220)) }}>
          <svg viewBox={WORDMARK.viewBox} width={300} height={300 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.7)" }}>www.appify-lb.com</div>
        </div>
        <div style={{ position: "absolute", left: 20, top: SH - 470, transform: `translateY(${(1 - Math.min(1, devP)) * 600}px)` }}>
          <Dev width={230} thumbs={1} brow={16} lid={0.08} smile={1} look={6} happy={1} tilt={Math.sin(t / 8) * 2} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const scenes = [Hook, Turn, Rows, MathScene, EndCard];
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 9;
  const R = (p) => Math.max(1, p * Math.hypot(W, H) * 1.25);
  const p = interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: easeIn });
  const layer = (k) => { const S = scenes[k]; return <S f={f} W={W} H={H} />; };
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {inCut && layer(i - 1)}
      <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R(p), 0.3)}')` } : undefined}>{layer(i)}</AbsoluteFill>
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R(p), 0.3)} fill="none" stroke={C.iris} strokeWidth={14 * (1 - p)} /></svg>}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.22} />}
      <Vignette strength={0.18} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};
