import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { Phone, inOut, ramp, wave, FONT, BODY, MONO } from "./kit.jsx";

const C = { bg: "#141210", card: "#1E1B18", line: "rgba(255,255,255,.08)", fg: "#F7F3EE", mut: "#9C958C", coral: "#FF6A3D", amber: "#FFB547", mint: "#5FE3B0" };

function Ring({ r, w, p, color }) {
  const c = 2 * Math.PI * r;
  return (
    <>
      <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={w} />
      <circle cx="110" cy="110" r={r} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform="rotate(-90 110 110)" />
    </>
  );
}

function Today() {
  const f = useCurrentFrame();
  const k = inOut(f, 10, 80, 250, 290);
  const steps = Math.round(8412 * k);
  const pts = Array.from({ length: 24 }, (_, i) => `${i * 10},${40 - (Math.sin(i * 0.9 + f / 6) * 12 + (i % 5 === 0 ? 16 : 0))}`).join(" ");
  return (
    <div style={{ padding: "54px 20px 0", color: C.fg, fontFamily: BODY }}>
      <div style={{ font: `500 13px ${MONO}`, color: C.mut, letterSpacing: ".1em" }}>TODAY · THU</div>
      <div style={{ font: `600 30px ${FONT}`, margin: "4px 0 10px" }}>Good morning</div>
      <svg width="220" height="220" style={{ display: "block", margin: "0 auto" }}>
        <Ring r={96} w={18} p={0.82 * k} color={C.coral} />
        <Ring r={72} w={18} p={0.64 * k} color={C.amber} />
        <Ring r={48} w={18} p={0.9 * k} color={C.mint} />
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        <div style={{ background: C.card, borderRadius: 16, padding: 12 }}>
          <div style={{ font: `500 12px ${BODY}`, color: C.mut }}>Steps</div>
          <div style={{ font: `600 24px ${FONT}`, fontVariantNumeric: "tabular-nums" }}>{steps.toLocaleString("en-US")}</div>
        </div>
        <div style={{ background: C.card, borderRadius: 16, padding: 12 }}>
          <div style={{ font: `500 12px ${BODY}`, color: C.mut }}>Heart · bpm</div>
          <svg width="110" height="44"><polyline points={pts} fill="none" stroke={C.coral} strokeWidth="2.5" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
}

function Workouts() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [["Push day", "52 min · 9 sets", C.coral], ["5K tempo run", "24 min · 4:48 /km", C.amber], ["Mobility flow", "15 min", C.mint], ["Leg day", "60 min · 12 sets", C.coral]];
  const out = inOut(f, 0, 1, 255, 290);
  const pulse = 1 + Math.max(0, wave(f, 30)) * 0.04;
  return (
    <div style={{ padding: "54px 20px 0", color: C.fg }}>
      <div style={{ font: `500 13px ${MONO}`, color: C.mut, letterSpacing: ".1em" }}>THIS WEEK</div>
      <div style={{ font: `600 30px ${FONT}`, margin: "4px 0 16px" }}>Your plan</div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map(([t, s, c], i) => {
          const sp = spring({ frame: f - 20 - i * 8, fps, config: { damping: 16 } });
          return (
            <div key={t} style={{ background: C.card, borderRadius: 18, padding: 14, display: "flex", gap: 12, alignItems: "center", opacity: sp * out, transform: `translateY(${(1 - sp) * 40}px)` }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: c, opacity: 0.9 }} />
              <div style={{ flex: 1 }}>
                <div style={{ font: `600 16px ${FONT}` }}>{t}</div>
                <div style={{ font: `500 12px ${BODY}`, color: C.mut }}>{s}</div>
              </div>
              <span style={{ font: `500 18px ${BODY}`, color: C.mut }}>›</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 18, height: 54, borderRadius: 99, background: C.coral, display: "flex", alignItems: "center", justifyContent: "center", font: `600 17px ${FONT}`, color: "#1a0d07", transform: `scale(${pulse})` }}>Start workout</div>
    </div>
  );
}

export const PULSE = { width: 1280, height: 800, durationInFrames: 300, fps: 30 };
export default function PulseApp() {
  const f = useCurrentFrame();
  const a = wave(f, 300) * 6;
  const chip = inOut(f, 95, 115, 240, 265);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 90% at 70% 10%, #3A1A10 0%, ${C.bg} 60%)`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 60, alignItems: "center", transform: "translateY(150px)" }}>
        <Phone w={310} bg={C.bg} style={{ transform: `rotate(${-6 + a * 0.2}deg) translateY(${a}px)` }}><Today /></Phone>
        <Phone w={310} bg={C.bg} style={{ transform: `rotate(${5 - a * 0.2}deg) translateY(${40 - a}px)` }}><Workouts /></Phone>
      </div>
      <div style={{ position: "absolute", left: 120, top: 120, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: `1px solid ${C.line}`, color: C.fg, opacity: chip, transform: `translateY(${(1 - chip) * 20}px)` }}>
        <div style={{ font: `500 12px ${MONO}`, color: C.mut, letterSpacing: ".1em" }}>STREAK</div>
        <div style={{ font: `600 28px ${FONT}` }}>14 days <span style={{ color: C.mint }}>↑</span></div>
      </div>
    </AbsoluteFill>
  );
}
