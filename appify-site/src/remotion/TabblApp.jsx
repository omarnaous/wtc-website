import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { Phone, inOut, ramp, wave, FONT, BODY, MONO } from "./kit.jsx";

const C = { bg: "#EFE6D6", paper: "#FBF7F0", ink: "#22201B", mut: "#7C7468", tomato: "#E2532D", herb: "#2F5D45", saffron: "#F2B33D" };

function Dish({ c1, c2, size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r="33" fill="#fff" />
      <circle cx="35" cy="35" r="25" fill={c1} />
      <circle cx="28" cy="30" r="7" fill={c2} /><circle cx="42" cy="38" r="6" fill={c2} opacity=".8" /><circle cx="33" cy="44" r="4" fill="#fff" opacity=".7" />
    </svg>
  );
}

const MENU = [["Charred halloumi", "12", C.saffron, C.herb], ["Tomato & sumac", "9", C.tomato, C.saffron], ["Lamb kafta", "16", "#8C4A2F", C.herb], ["Fattoush", "10", C.herb, C.tomato]];

function Menu() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const taps = [70, 120, 165];
  const count = taps.filter((t) => f >= t && f < 270).length;
  const bump = taps.reduce((m, t) => Math.max(m, spring({ frame: f - t, fps, config: { damping: 9 } }) * (f - t < 20 && f >= t ? 1 : 0)), 0);
  const sheet = inOut(f, 190, 215, 255, 280);
  return (
    <div style={{ padding: "54px 18px 0", color: C.ink, position: "relative", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ font: `700 28px ${FONT}`, letterSpacing: "-.02em" }}>tabbl</div>
        <div style={{ position: "relative", width: 40, height: 40, borderRadius: 12, background: C.ink }}>
          <span style={{ position: "absolute", right: -6, top: -6, minWidth: 22, height: 22, borderRadius: 99, background: C.tomato, color: "#fff", font: `600 12px ${BODY}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + bump * 0.35})` }}>{count}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
        {["Mezze", "Grill", "Salads", "Sweet"].map((t, i) => (
          <span key={t} style={{ padding: "7px 12px", borderRadius: 99, font: `500 13px ${BODY}`, background: i === 0 ? C.ink : "transparent", color: i === 0 ? C.paper : C.ink, border: `1px solid ${i === 0 ? C.ink : "rgba(0,0,0,.15)"}` }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {MENU.map(([n, p, a, b], i) => {
          const hit = f >= taps[i] && f < taps[i] + 12;
          return (
            <div key={n} style={{ display: "flex", gap: 12, alignItems: "center", background: C.paper, borderRadius: 18, padding: 10 }}>
              <Dish c1={a} c2={b} size={58} />
              <div style={{ flex: 1 }}>
                <div style={{ font: `600 15px ${FONT}` }}>{n}</div>
                <div style={{ font: `500 13px ${BODY}`, color: C.mut }}>${p}</div>
              </div>
              <span style={{ width: 34, height: 34, borderRadius: 99, background: hit ? C.tomato : C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: `500 20px ${BODY}`, transform: `scale(${hit ? 0.88 : 1})` }}>+</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 10, right: 10, bottom: 12, height: 74, borderRadius: 22, background: C.tomato, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", transform: `translateY(${(1 - sheet) * 120}px)` }}>
        <span style={{ font: `600 17px ${FONT}` }}>Order · 3 items</span>
        <span style={{ font: `600 17px ${FONT}` }}>$37</span>
      </div>
    </div>
  );
}

function Tracking() {
  const f = useCurrentFrame();
  const p = inOut(f, 40, 200, 255, 290);
  const steps = ["Order placed", "Preparing", "On the way", "Delivered"];
  return (
    <div style={{ padding: "54px 20px 0", color: C.ink }}>
      <div style={{ font: `500 12px ${MONO}`, color: C.mut, letterSpacing: ".1em" }}>ORDER #2048</div>
      <div style={{ font: `600 28px ${FONT}`, margin: "4px 0 6px" }}>Arriving in {Math.max(8, Math.round(26 - p * 18))} min</div>
      <div style={{ height: 170, borderRadius: 20, background: "#E2D7C2", position: "relative", overflow: "hidden", margin: "14px 0 18px" }}>
        <svg width="100%" height="170" viewBox="0 0 270 170"><path d="M20 140 C 80 140, 90 40, 150 60 S 230 30, 250 30" fill="none" stroke={C.herb} strokeWidth="5" strokeLinecap="round" strokeDasharray="300" strokeDashoffset={300 * (1 - p)} /><circle cx="250" cy="30" r="9" fill={C.tomato} /></svg>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {steps.map((s, i) => {
          const on = p * 3.2 >= i;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 22, height: 22, borderRadius: 99, background: on ? C.herb : "transparent", border: `2px solid ${on ? C.herb : "rgba(0,0,0,.2)"}` }} />
              <span style={{ font: `${on ? 600 : 500} 16px ${BODY}`, color: on ? C.ink : C.mut }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const TABBL = { width: 1280, height: 800, durationInFrames: 300, fps: 30 };
export default function TabblApp() {
  const f = useCurrentFrame();
  const a = wave(f, 300, 1) * 6;
  return (
    <AbsoluteFill style={{ background: C.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: 999, background: C.saffron, opacity: 0.22, left: 190, top: 160 }} />
      <div style={{ display: "flex", gap: 56, alignItems: "center", transform: "translateY(140px)" }}>
        <Phone w={310} bg={C.bg} style={{ transform: `translateY(${a}px)` }}><Menu /></Phone>
        <Phone w={310} bg={C.paper} style={{ transform: `translateY(${60 - a}px)` }}><Tracking /></Phone>
      </div>
    </AbsoluteFill>
  );
}
