// "Stop pressing Boost." Appify's ads mascot stops a finger on the Boost button, then walks through what
// Meta Ads Manager does that a boost can't, and pitches the service: we run your Meta ads. DM "ADS".
// Scenes are cut with the Appify spark.
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TAP, WAIT, SMART, VS, ROWS, rowAt, SERVICE, SERVICES, END, CUTS } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Girl } from "./Girl.jsx";
import { Dev } from "./Dev.jsx";

const C = { ink: "#0A0913", ink2: "#17142B", ink3: "#221D40", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", mute: "#8A84A3", alert: "#F0384F", fb: "#1877F2" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const UI = { fontFamily: "UI", fontWeight: 600 };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const pop = (p, k = 1.5) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const Spark = ({ size, color = C.iris, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const SH = 1400;
function Stage({ W, H, children, style }) {
  const tall = H > 1600, k = Math.min(1, (H - 90) / SH);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: tall ? 220 : (H - SH * k) / 2, width: 1080, height: SH, transform: `scale(${k})`, transformOrigin: "0 0", ...style }}>{children}</div>;
}
const Grid = ({ f }) => <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `540px ${f * 0.8}px` }} />;
const Glow = ({ x = 50, y = 50, a = 0.5 }) => <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, rgba(91,43,255,${a}), transparent 62%)` }} />;
function Bubble({ x, y, text, p = 1, size = 38, origin = "0 100%" }) {
  return <div style={{ position: "absolute", left: x, top: y, padding: "16px 24px", background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 18, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: "Mono", fontSize: size, color: C.ink, whiteSpace: "nowrap", ...pop(p, 0.5), transformOrigin: origin }}>{text}</div>;
}
const talk = (f, a, b) => (f >= a && f < b ? 0.25 + 0.55 * Math.abs(Math.sin((f - a) * 0.9)) : 0);

// ── 1 · hook: a finger heads for "Boost post"; she stops it ────────────────────────────────────────
function Hook({ f, W, H }) {
  const card = sp(f, -8, 13, 200), girlP = sp(f, WAIT - 8, 10, 220);
  const fx = interpolate(f, [0, TAP], [860, 620], { ...clamp, easing: easeOut }), fy = interpolate(f, [0, TAP], [1180, 790], { ...clamp, easing: easeOut });
  const pulled = interpolate(f, [WAIT, WAIT + 10], [0, 1], { ...clamp, easing: easeOut });
  const stamp = sp(f, WAIT + 6, 8, 300);
  const [sx, sy] = shake(f, WAIT + 6, 12, 4);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={55} a={0.4} />
      <Stage W={W} H={H} style={{ translate: `${sx}px ${sy}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 20, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 120, color: "#fff", ...pop(sp(f, -6, 10, 300)) }}>Still pressing</div>
          <div style={{ ...D, fontSize: 132, color: C.alert, marginTop: 8, ...pop(sp(f, -4, 10, 300)) }}>“Boost post”?</div>
        </div>
        {/* a generic post with the boost button */}
        <div style={{ position: "absolute", left: 300, top: 320, width: 500, borderRadius: 30, background: "#fff", overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.5)", transform: `rotate(-3deg) translateY(${(1 - Math.min(1, card)) * 200}px)`, opacity: Math.min(1, card * 2) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px" }}><div style={{ width: 46, height: 46, borderRadius: 99, background: "#E3E0EE" }} /><div style={{ ...UI, fontSize: 24, color: "#111" }}>your.brand</div></div>
          <div style={{ height: 280, background: `linear-gradient(135deg, #2B2733, #4C4858)`, display: "grid", placeItems: "center" }}><div style={{ ...D, fontSize: 64, color: "rgba(255,255,255,.85)" }}>NEW DROP</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", ...UI, fontSize: 22, color: "#555" }}>♡ 12 likes · 2 comments</div>
          <div style={{ margin: "0 22px 24px", height: 84, borderRadius: 16, background: C.fb, display: "grid", placeItems: "center", ...UI, fontSize: 32, color: "#fff", transform: `scale(${f >= TAP - 2 && f < WAIT ? 0.96 : 1})` }}>Boost post</div>
          {f >= WAIT + 6 && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, display: "grid", placeItems: "center" }}>
            <div style={{ ...M, fontSize: 40, color: "#fff", padding: "16px 30px", borderRadius: 14, background: C.alert, letterSpacing: "0.12em", whiteSpace: "nowrap", transform: `rotate(-6deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`, opacity: Math.min(1, stamp * 3), boxShadow: "0 10px 30px rgba(240,56,79,.5)" }}>wait. not yet.</div>
          </div>}
        </div>
        {/* the finger, pulled back once she steps in */}
        <div style={{ position: "absolute", left: fx + pulled * 160, top: fy + pulled * 260, width: 86, height: 86, borderRadius: 99, background: "rgba(255,255,255,.18)", border: "5px solid #fff", boxShadow: "0 10px 30px rgba(0,0,0,.4)", opacity: 1 - pulled }} />
        {/* she steps in from the left */}
        <div style={{ position: "absolute", left: -10, top: SH - 590, transform: `translateX(${(1 - Math.min(1, girlP)) * -500}px)` }}>
          <Girl width={300} point={f >= WAIT ? 1 : 0} shock={f >= WAIT && f < SMART ? 0.6 : 0} open={talk(f, WAIT, WAIT + 10) + talk(f, SMART, SMART + 18)} smile={f >= SMART ? 1 : 0.4} look={8} tilt={Math.sin(f / 6) * 2} />
        </div>
        {f >= WAIT && f < SMART && <Bubble x={270} y={SH - 560} text="wait—" p={sp(f, WAIT, 10, 260)} size={44} />}
        {f >= SMART && <Bubble x={270} y={SH - 560} text="there's a smarter button." p={sp(f, SMART, 10, 260)} size={36} />}
      </Stage>
    </AbsoluteFill>
  );
}

// ── 2 · versus: Boost post vs Meta Ads Manager ─────────────────────────────────────────────────────
const COMMENTS = [[0, "likes ≠ sales."], [2, "retarget the ones who almost bought."], [4, "test, don't guess."]];
function Versus({ f, W, H }) {
  const t = f - VS, head = sp(t, 0, 12, 220);
  const [sx, sy] = shake(f, VS, 14, 5);
  const X0 = 30, X1 = 300, X2 = 660, X3 = 1050, RH = 128, Y0 = 170;
  const cm = COMMENTS.filter(([i]) => f >= rowAt(i) + 8).pop();
  const cmAt = cm ? rowAt(cm[0]) + 8 : 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={40} a={0.45} />
      <Stage W={W} H={H} style={{ translate: `${sx}px ${sy}px` }}>
        <div style={{ position: "absolute", left: X2 - 12, top: 30, width: X3 - X2 + 12, height: Y0 + ROWS.length * RH - 20, borderRadius: 34, background: "linear-gradient(180deg, rgba(91,43,255,.55), rgba(143,114,255,.2))", border: "3px solid rgba(205,190,255,.55)", boxShadow: "0 20px 70px rgba(91,43,255,.4)", opacity: Math.min(1, head * 2) }} />
        <div style={{ position: "absolute", left: X1, width: X2 - X1 - 20, top: 66, display: "flex", justifyContent: "center", ...rise(head) }}>
          <div style={{ ...UI, fontSize: 28, color: "#fff", padding: "14px 26px", borderRadius: 14, background: C.fb, opacity: 0.55 }}>Boost post</div>
        </div>
        <div style={{ position: "absolute", left: X2, width: X3 - X2, top: 60, textAlign: "center", ...rise(head) }}>
          <div style={{ ...D, fontSize: 46, color: "#fff" }}>Meta Ads Manager</div>
          <div style={{ ...M, fontSize: 18, color: C.sky, marginTop: 10 }}>run by appify</div>
        </div>
        {ROWS.map(([what, bad, good], k) => {
          const s0 = rowAt(k); if (f < s0) return null;
          const a = sp(f, s0, 13, 220), b = sp(f, s0 + 6, 12, 230), chk = sp(f, s0 + 8, 8, 300), y = Y0 + k * RH;
          return (
            <div key={what}>
              <div style={{ position: "absolute", left: X0, right: 1080 - X3, top: y + RH - 2, height: 2, background: "rgba(255,255,255,.08)" }} />
              <div style={{ position: "absolute", left: X0, width: X1 - X0, top: y, height: RH, display: "flex", alignItems: "center", ...M, fontSize: 20, color: C.mute, letterSpacing: "0.1em", opacity: Math.min(1, a * 2) }}>{what}</div>
              <div style={{ position: "absolute", left: X1, width: X2 - X1 - 30, top: y, height: RH, display: "flex", alignItems: "center", gap: 14, ...D, fontSize: 30, lineHeight: 1.1, color: "rgba(255,255,255,.5)", opacity: Math.min(1, a * 2), transform: `translateX(${(1 - Math.min(1, a)) * -120}px)` }}>
                <span style={{ flex: "0 0 40px", height: 40, borderRadius: 99, background: "rgba(240,56,79,.18)", color: C.alert, display: "grid", placeItems: "center", fontSize: 22 }}>✕</span>{bad}
              </div>
              <div style={{ position: "absolute", left: X2 + 10, width: X3 - X2 - 30, top: y, height: RH, display: "flex", alignItems: "center", gap: 14, ...D, fontSize: 34, lineHeight: 1.1, color: "#fff", opacity: Math.min(1, b * 2), transform: `translateX(${(1 - Math.min(1, b)) * 120}px)` }}>
                <span style={{ flex: "0 0 44px", height: 44, borderRadius: 99, background: C.sky, color: C.ink, display: "grid", placeItems: "center", fontSize: 24, transform: `scale(${chk})` }}>✓</span>{good}
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 10, top: 952 }}>
          <Girl width={226} point={1} smile={1} look={8} open={cm ? talk(f, cmAt, cmAt + 16) : 0} tilt={Math.sin(f / 7) * 2} bob={Math.sin(f / 4) * 2} />
        </div>
        {cm && <Bubble key={cm[0]} x={230} y={990} text={cm[1]} p={sp(f, cmAt, 10, 260)} size={32} />}
      </Stage>
    </AbsoluteFill>
  );
}

// ── 3 · the service ────────────────────────────────────────────────────────────────────────────────
function Service({ f, W, H }) {
  const t = f - SERVICE;
  return (
    <AbsoluteFill style={{ background: C.uv }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 30% 40%, rgba(255,255,255,.2), transparent 55%)" }} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 60, top: 40 }}>
          <div style={{ ...D, fontSize: 110, color: "#fff", ...pop(sp(t, 0, 10, 300)) }}>We run your</div>
          <div style={{ ...D, fontSize: 130, color: C.sky, marginTop: 10, ...pop(sp(t, 5, 10, 300)) }}>Meta ads.</div>
        </div>
        <div style={{ position: "absolute", left: 60, top: 380, display: "grid", gap: 18 }}>
          {SERVICES.map((s, k) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 30px 20px 20px", borderRadius: 26, background: "rgba(255,255,255,.14)", border: "2px solid rgba(255,255,255,.35)", ...D, fontSize: 40, color: "#fff", ...rise(sp(t, 16 + k * 7, 12, 240), 30) }}>
              <span style={{ width: 52, height: 52, borderRadius: 99, background: "#fff", color: C.uv, display: "grid", placeItems: "center", fontSize: 28 }}>✓</span>{s}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", right: 0, top: SH - 640, transform: `translateX(${(1 - Math.min(1, sp(t, 8, 12, 180))) * 400}px)` }}>
          <Girl width={300} phone={1} smile={1} happy={t > 50 ? 1 : 0} look={-6} rim="rgba(255,255,255,.7)" tilt={Math.sin(f / 6) * 3} bob={Math.sin(f / 4) * 2} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

// ── 4 · end card ───────────────────────────────────────────────────────────────────────────────────
function EndCard({ f, W, H }) {
  const t = f - END, cta = sp(t, 24, 9, 260), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 34) / 4);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} /><Glow y={45} a={0.5 + 0.08 * Math.sin(t / 6)} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 118, color: "rgba(255,255,255,.6)", ...pop(sp(t, 0, 10, 300)) }}>Stop boosting.</div>
          <div style={{ ...D, fontSize: 118, color: "#fff", marginTop: 10, ...pop(sp(t, 8, 10, 300)) }}>Start <span style={{ color: C.sky }}>advertising.</span></div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 340, display: "grid", justifyItems: "center", transform: `scale(${interpolate(cta, [0, 1], [1.5, 1]) * pulse})`, opacity: Math.min(1, cta * 2) }}>
          <div style={{ padding: "28px 70px", borderRadius: 32, background: C.uv, textAlign: "center", boxShadow: "0 20px 60px rgba(91,43,255,.55)" }}>
            <div style={{ ...D, fontSize: 104, color: "#fff" }}>DM “ADS”</div>
            <div style={{ ...UI, fontSize: 34, color: C.sky, marginTop: 12 }}>and we'll plan your first campaign</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "grid", justifyItems: "center", gap: 14, ...rise(sp(t, 34, 12, 220)) }}>
          <svg viewBox={WORDMARK.viewBox} width={300} height={300 * 1167 / 3224}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.7)" }}>@appifylb · www.appify-lb.com</div>
        </div>
        {/* the team */}
        <div style={{ position: "absolute", left: 170, top: SH - 560, transform: `translateY(${(1 - Math.min(1, sp(t, 12, 12, 180))) * 600}px)` }}>
          <Girl width={270} wave={1} waveAng={Math.sin(t / 2.5) * 22} smile={1} look={6} tilt={Math.sin(t / 7) * 2} />
        </div>
        <div style={{ position: "absolute", left: 600, top: SH - 560, transform: `translateY(${(1 - Math.min(1, sp(t, 18, 12, 180))) * 600}px)` }}>
          <Dev width={270} thumbs={1} brow={16} lid={0.08} smile={1} look={-6} tilt={Math.sin(t / 8) * 2} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const scenes = [Hook, Versus, Service, EndCard];
  const i = CUTS.filter((c) => f >= c).length;
  const at = i ? CUTS[i - 1] : 0, inCut = i > 0 && f < at + 9;
  const p = interpolate(f, [at, at + 9], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.25);
  const layer = (k) => { const S = scenes[k]; return <S f={f} W={W} H={H} />; };
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {inCut && layer(i - 1)}
      <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R, 0.3)}')` } : undefined}>{layer(i)}</AbsoluteFill>
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={C.iris} strokeWidth={14 * (1 - p)} /></svg>}
      {i > 0 && f >= at && f < at + 4 && <Flash f={f} start={at} peak={0.22} />}
      <Vignette strength={0.18} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};

// ── cover / thumbnail (shared cover template: everything inside the centre 1080x1440 band) ──────────
export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const { width: W, height: H } = useVideoConfig();
  const k = Math.min(1, H / 1440), bt = (H - 1440 * k) / 2;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Grid f={0} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 55%, rgba(91,43,255,.55), transparent 60%)" }} />
      <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: bt, width: 1080, height: 1440, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 60, display: "flex", justifyContent: "center" }}>
          <div style={{ ...M, fontSize: 26, color: C.sky, padding: "12px 26px", borderRadius: 99, border: "3px solid rgba(116,198,255,.5)", display: "flex", alignItems: "center", gap: 12 }}><Spark size={24} color={C.iris} />meta ads</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
          <div style={{ ...D, fontSize: 130, color: "#fff" }}>Stop pressing</div>
          <div style={{ ...D, fontSize: 150, color: C.alert, marginTop: 10 }}>“Boost”.</div>
        </div>
        <div style={{ position: "absolute", left: 470, top: 540, width: 540, padding: "30px 30px 24px", borderRadius: 30, background: C.ink2, border: "3px solid rgba(143,114,255,.5)", transform: "rotate(4deg)", boxShadow: "0 40px 90px rgba(0,0,0,.5)" }}>
          {[["Boost post", false], ["Meta Ads Manager", true]].map(([n, good]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 0", borderBottom: good ? "none" : "2px solid rgba(255,255,255,.1)", ...D, fontSize: 42, color: good ? "#fff" : "rgba(255,255,255,.5)" }}>
              <span style={{ width: 54, height: 54, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 30, background: good ? C.sky : "rgba(240,56,79,.2)", color: good ? C.ink : C.alert }}>{good ? "✓" : "✕"}</span>{n}
            </div>
          ))}
          <div style={{ ...M, fontSize: 20, color: C.sky, marginTop: 10 }}>we run it for you</div>
        </div>
        <div style={{ position: "absolute", left: 10, top: 1410 - 340 * 830 / 420 * 0.98 }}><Girl width={340} point={1} smile={1} look={8} /></div>
        <div style={{ position: "absolute", left: 30, top: 1410 - 340 * 830 / 420 * 0.98 - 100, padding: "18px 26px", background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 18, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: "Mono", fontSize: 38, color: C.ink, whiteSpace: "nowrap" }}>likes ≠ sales.</div>
        <svg viewBox={WORDMARK.viewBox} width={200} height={200 * 1167 / 3224} style={{ position: "absolute", right: 60, top: 1340 }}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
      </div>
      <Vignette strength={0.16} />
    </AbsoluteFill>
  );
};
