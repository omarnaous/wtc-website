// The 10-second explainer after the pop. A phone feed: static photo posts fly past, then the feed brakes on
import React from "react";
// an animated post (the balloon) and stops. Then attention -> clicks -> customers, then what Appify makes.
import { AbsoluteFill, interpolate, spring, Easing } from "remotion";
import { FPS, EXPLAIN, BEATS, END } from "./timing.js";
import { sparkPath, WORDMARK } from "./brand.js";

const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", paper: "#F3F1FA", yellow: "#FFD23F", alert: "#F0384F" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const sp = (t, at, damping = 12, stiffness = 220) => spring({ frame: t - at, fps: FPS, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const Spark = ({ size, color, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;

const POST_H = 560, STOP_AT = 6;                       // post height in the feed, index of the animated post
const PHOTOS = [["#2B2A36", "#4A4858"], ["#3A2E2A", "#6B564C"], ["#22303A", "#3F5868"], ["#2E2A3A", "#585070"], ["#2F3A2C", "#55684E"], ["#3A2A30", "#6A4C58"]];

function StaticPost({ i }) {
  const [a, b] = PHOTOS[i % PHOTOS.length];
  return (
    <div style={{ height: POST_H - 20, borderRadius: 22, overflow: "hidden", background: "#15131F", marginBottom: 20 }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
        <i style={{ width: 36, height: 36, borderRadius: 99, background: "#3A3746" }} />
        <i style={{ width: 150, height: 12, borderRadius: 9, background: "#3A3746" }} />
      </div>
      <div style={{ height: 400, background: `linear-gradient(160deg, ${a}, ${b})`, display: "grid", placeItems: "center" }}>
        <div style={{ width: 150, height: i % 2 ? 190 : 150, borderRadius: i % 3 ? 24 : 99, background: "rgba(255,255,255,.12)" }} />
      </div>
      <div style={{ display: "flex", gap: 14, padding: "16px 18px" }}>{[0, 1, 2].map((k) => <i key={k} style={{ width: 28, height: 28, borderRadius: 8, background: "#3A3746" }} />)}</div>
    </div>
  );
}
function MotionPost({ t, stopped }) {
  const bob = Math.sin(t / 6) * 14, sq = 1 + Math.sin(t / 3) * 0.03;
  return (
    <div style={{ height: POST_H - 20, borderRadius: 22, overflow: "hidden", background: "#15131F", marginBottom: 20, boxShadow: stopped ? "0 0 0 4px rgba(143,114,255,.8), 0 30px 80px rgba(91,43,255,.6)" : "none" }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
        <i style={{ width: 36, height: 36, borderRadius: 99, background: C.uv, display: "grid", placeItems: "center" }}><Spark size={20} color="#fff" /></i>
        <span style={{ ...UI, fontSize: 20, color: "#fff" }}>appifylb</span>
        <span style={{ ...M, fontSize: 13, color: C.sky, marginLeft: "auto" }}>▶ reel</span>
      </div>
      <div style={{ height: 400, position: "relative", background: "radial-gradient(circle at 50% 45%, #3B1AB8, #120840 75%)", display: "grid", placeItems: "center", overflow: "hidden" }}>
        {Array.from({ length: 14 }, (_, k) => {
          const a = k * 2.3 + t / 20, r = 120 + (k % 4) * 30;
          return <i key={k} style={{ position: "absolute", left: 200 + Math.cos(a) * r, top: 190 + Math.sin(a) * r * 0.7, width: 12, height: 7, borderRadius: 2, background: [C.yellow, C.sky, C.iris, "#fff", C.alert][k % 5], transform: `rotate(${a * 90}deg)` }} />;
        })}
        <div style={{ width: 190, height: 220, transform: `translateY(${bob}px) scale(${sq}, ${2 - sq})`, borderRadius: "50% 50% 46% 46% / 54% 54% 46% 46%", background: "radial-gradient(circle at 34% 28%, #E2D9FF, #8F72FF 30%, #5B2BFF 62%, #2A0FA0)", display: "grid", placeItems: "center", boxShadow: "0 30px 50px rgba(0,0,0,.4)" }}>
          <svg viewBox={WORDMARK.viewBox} width={120}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.yellow} /></svg>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, padding: "16px 18px", alignItems: "center" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" style={{ transform: `scale(${stopped ? 1 + 0.3 * Math.exp(-Math.max(0, t - 112) / 6) : 1})` }}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" fill={stopped ? C.alert : "#3A3746"} /></svg>
        <i style={{ width: 28, height: 28, borderRadius: 8, background: "#3A3746" }} /><i style={{ width: 28, height: 28, borderRadius: 8, background: "#3A3746" }} />
      </div>
    </div>
  );
}

const ICON = {
  eye: <svg viewBox="0 0 48 48" width="64" height="64"><path d="M4 24s7-13 20-13 20 13 20 13-7 13-20 13S4 24 4 24Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" /><circle cx="24" cy="24" r="6.5" fill="currentColor" /></svg>,
  tap: <svg viewBox="0 0 48 48" width="64" height="64"><path d="M19 22V10a3.5 3.5 0 0 1 7 0v10l9 2.5a4 4 0 0 1 2.9 4.6L36 37a6 6 0 0 1-6 5H23a6 6 0 0 1-4.6-2.2L11 30.5a3.2 3.2 0 0 1 4.6-4.4L19 29" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  bag: <svg viewBox="0 0 48 48" width="64" height="64"><path d="M9 16h30l-2.5 25h-25ZM17 16v-3a7 7 0 0 1 14 0v3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" /></svg>,
};

export function Explain({ f }) {
  const t = f - EXPLAIN;
  const [A, B, Cb, Dd] = BEATS;
  const fadeIn = interpolate(t, [0, 10], [0, 1], clamp), fadeOut = interpolate(f, [END - 8, END + 4], [1, 0], clamp);
  // feed scroll: fast flicks past static photos, then brakes on the motion post
  const target = STOP_AT * POST_H - 90;
  const off = t < 60 ? interpolate(t, [0, 60], [0, target - 520], { easing: Easing.bezier(0.5, 0, 0.7, 1) })
    : interpolate(t, [60, 112], [target - 520, target], { ...clamp, easing: Easing.bezier(0.1, 0.9, 0.2, 1) });
  const speed = t < 112 ? Math.abs(off - (t < 61 ? interpolate(t - 1, [0, 60], [0, target - 520], { easing: Easing.bezier(0.5, 0, 0.7, 1) }) : interpolate(t - 1, [60, 112], [target - 520, target], { ...clamp, easing: Easing.bezier(0.1, 0.9, 0.2, 1) }))) : 0;
  const stopped = t >= 112;
  const shrink = interpolate(t, [Cb - 6, Cb + 14], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const phoneOut = interpolate(t, [Dd - 8, Dd + 8], [1, 0], clamp);
  const titles = [
    [A, "Photos get", "scrolled past.", "#fff"],
    [B, "Motion stops", "the scroll.", C.sky],
    [Cb, "Attention turns", "into customers.", C.yellow],
    [Dd, "That's what", "we make.", C.iris],
  ];
  const cur = titles.filter(([at]) => t >= at).pop();
  const ct = t - cur[0];
  return (
    <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
      <AbsoluteFill style={{ background: "rgba(10,9,19,.9)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at 50% ${55 - shrink * 10}%, rgba(91,43,255,${stopped ? 0.45 : 0.25}), transparent 70%)` }} />
      {/* headline */}
      <div key={cur[0]} style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 92, color: "#fff", ...pop(sp(ct, 0, 11, 300), 1.25) }}>{cur[1]}</div>
        <div style={{ ...D, fontSize: 92, color: cur[3], marginTop: 6, ...pop(sp(ct, 6, 9, 300), 1.6) }}>{cur[2]}</div>
      </div>
      {/* the phone */}
      {phoneOut > 0 && (
        <div style={{ position: "absolute", left: 290, top: 470, width: 500, height: 1000, transform: `translateY(${-shrink * 60}px) scale(${1 - shrink * 0.42})`, transformOrigin: "50% 0%", opacity: phoneOut }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 64, padding: 14, background: "linear-gradient(145deg, #2A2740, #0C0B16)", boxShadow: "0 50px 100px rgba(0,0,0,.6), inset 0 0 0 2px rgba(255,255,255,.12)" }}>
            <div style={{ position: "relative", height: "100%", borderRadius: 52, overflow: "hidden", background: "#0B0A12" }}>
              <div style={{ position: "absolute", left: 16, right: 16, top: 70, transform: `translateY(${-off}px)`, filter: `blur(${Math.min(10, speed * 0.12)}px)` }}>
                {Array.from({ length: STOP_AT + 2 }, (_, i) => (i === STOP_AT ? <MotionPost key={i} t={t} stopped={stopped} /> : <StaticPost key={i} i={i} />))}
              </div>
              <div style={{ position: "absolute", left: "50%", top: 18, translate: "-50% 0", width: 110, height: 30, borderRadius: 20, background: "#000" }} />
            </div>
          </div>
          {/* swipe hint during the flick */}
          {t < 60 && <div style={{ position: "absolute", right: -60, top: 520 - (t % 20) * 16, opacity: interpolate(t % 20, [0, 4, 16, 20], [0, 1, 1, 0]), fontSize: 64 }}>☝️</div>}
          {stopped && t < Cb && <div style={{ position: "absolute", left: "50%", top: 300, translate: "-50% 0", ...pop(sp(t, 112, 8, 320), 2), padding: "12px 22px", borderRadius: 99, background: "#fff", color: C.ink, ...UI, fontSize: 26, whiteSpace: "nowrap" }}>⏸ Stopped scrolling</div>}
        </div>
      )}
      {/* attention -> clicks -> customers */}
      {t >= Cb && t < Dd + 8 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 1100, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: phoneOut }}>
          {[["eye", "Attention", C.sky], ["tap", "Clicks", C.iris], ["bag", "Customers", C.yellow]].map(([ic, label, col], k) => {
            const p = sp(t, Cb + 14 + k * 14, 9, 260);
            return [
              k > 0 && <div key={"a" + k} style={{ flex: 1, height: 6, margin: "0 12px 46px", borderRadius: 6, background: `linear-gradient(90deg, rgba(143,114,255,.3), ${col})`, transform: `scaleX(${Math.min(1, sp(t, Cb + 8 + k * 14, 14, 200))})`, transformOrigin: "0 50%" }} />,
              <div key={ic} style={{ display: "grid", justifyItems: "center", gap: 14, ...pop(p, 1.8) }}>
                <div style={{ width: 160, height: 160, borderRadius: 48, display: "grid", placeItems: "center", color: col, background: "rgba(26,23,48,.95)", border: `3px solid ${col}`, boxShadow: `0 20px 60px -10px ${col}88` }}>{ICON[ic]}</div>
                <span style={{ ...UI, fontSize: 32, color: "#fff" }}>{label}</span>
              </div>,
            ];
          })}
        </div>
      )}
      {/* what Appify makes */}
      {t >= Dd && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 900 }}>
          {[["Reels & TikToks", 0, 0, C.sky], ["Content ads", -250, 150, C.yellow], ["3D animation", 250, 160, C.iris], ["Logo reveals", -235, 330, "#fff"], ["Animated websites", 225, 340, C.sky], ["Meta ads", 0, 500, C.yellow]].map(([txt, x, y, col], k) => {
            const p = sp(t, Dd + 6 + k * 6, 9, 280), fl = Math.sin((t + k * 9) / 10) * 8;
            return <div key={txt} style={{ position: "absolute", left: 540 + x, top: y + fl, translate: "-50% 0", padding: "20px 32px", borderRadius: 99, background: "rgba(26,23,48,.95)", border: `2.5px solid ${col}`, ...UI, fontSize: 40, color: col, whiteSpace: "nowrap", boxShadow: `0 20px 50px -14px ${col}99`, ...pop(p, 0.4) }}><Spark size={26} color={col} style={{ display: "inline-block", marginRight: 12, verticalAlign: "-3px" }} />{txt}</div>;
          })}
        </div>
      )}
    </AbsoluteFill>
  );
}
