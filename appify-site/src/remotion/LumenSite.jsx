import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, Easing } from "remotion";
import { Browser, Cursor, inOut, ramp, FONT, BODY, MONO } from "./kit.jsx";

const C = { bg: "#E6F4F2", white: "#FFFFFF", ink: "#0E2A2C", mut: "#5E7A7B", teal: "#0E9E94", tealSoft: "#D5EFEC", line: "#E3ECEB" };

// cursor keyframes: [frame, x, y]
const PATH = [[0, 1060, 600], [40, 1060, 600], [70, 963, 362], [95, 963, 362], [120, 955, 501], [145, 955, 501], [170, 900, 559], [200, 900, 559], [300, 1060, 600]];
const at = (f, i) => interpolate(f, PATH.map((p) => p[0]), PATH.map((p) => p[i]), { easing: Easing.inOut(Easing.cubic), extrapolateRight: "clamp" });
const press = (f, t) => (f >= t && f < t + 10 ? 1 - (f - t) / 10 : 0);

export const LUMEN = { width: 1280, height: 800, durationInFrames: 300, fps: 30 };
export default function LumenSite() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const day = f >= 82 && f < 285;
  const slot = f >= 132 && f < 285;
  const slots = inOut(f, 85, 100, 270, 285);
  const toast = spring({ frame: f - 182, fps, config: { damping: 14 } }) * inOut(f, 180, 181, 265, 285);
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <AbsoluteFill style={{ background: C.bg, alignItems: "center", justifyContent: "center" }}>
      <Browser w={1100} h={690} url="lumen-dental.com" bg={C.white} chrome="#F1F5F5" style={{ transform: "translateY(60px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 44px", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ font: `600 20px ${FONT}`, color: C.ink, display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 22, height: 22, borderRadius: 99, background: C.teal }} />Lumen Dental</span>
          <span style={{ display: "flex", gap: 26, font: `500 15px ${BODY}`, color: C.mut }}><span>Treatments</span><span>Team</span><span>Prices</span><span style={{ color: C.teal }}>Book</span></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 40, padding: "46px 44px" }}>
          <div>
            <div style={{ font: `500 13px ${MONO}`, color: C.teal, letterSpacing: ".12em" }}>ONLINE BOOKING</div>
            <div style={{ font: `600 52px/1.04 ${FONT}`, color: C.ink, letterSpacing: "-.03em", margin: "14px 0 18px" }}>Book a cleaning in 30 seconds.</div>
            <div style={{ font: `400 18px/1.55 ${BODY}`, color: C.mut, width: 380 }}>Pick a time that suits you. Reminders by SMS, rescheduling in one tap.</div>
            <div style={{ display: "flex", gap: 22, marginTop: 34 }}>
              {[["4.9", "Patient rating"], ["12 min", "Average wait"]].map(([a, b]) => (
                <div key={b}><div style={{ font: `600 28px ${FONT}`, color: C.ink }}>{a}</div><div style={{ font: `500 14px ${BODY}`, color: C.mut }}>{b}</div></div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius: 20, border: `1px solid ${C.line}`, padding: 22, boxShadow: "0 20px 50px rgba(14,42,44,.08)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", font: `600 17px ${FONT}`, color: C.ink, marginBottom: 14 }}><span>February</span><span style={{ color: C.mut }}>‹ ›</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} style={{ textAlign: "center", font: `500 12px ${MONO}`, color: C.mut }}>{d}</span>)}
              {days.map((d) => {
                const sel = d === 12 && day;
                const off = d % 7 === 6 || d % 7 === 0;
                return <span key={d} style={{ height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", font: `500 14px ${BODY}`, background: sel ? C.teal : "transparent", color: sel ? "#fff" : off ? "#B5C6C6" : C.ink }}>{d}</span>;
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, opacity: slots, transform: `translateY(${(1 - slots) * 10}px)` }}>
              {["09:00", "11:30", "14:30", "16:00"].map((t) => {
                const on = t === "14:30" && slot;
                return <span key={t} style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${on ? C.teal : C.line}`, background: on ? C.tealSoft : "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: `500 14px ${BODY}`, color: on ? C.teal : C.ink }}>{t}</span>;
              })}
            </div>
            <div style={{ marginTop: 14, height: 48, borderRadius: 12, background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: `600 16px ${FONT}` }}>Confirm booking</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 40, bottom: 34, padding: "14px 20px", borderRadius: 14, background: C.ink, color: "#fff", display: "flex", gap: 12, alignItems: "center", transform: `translateY(${(1 - toast) * 120}px)`, opacity: toast }}>
          <span style={{ width: 26, height: 26, borderRadius: 99, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", font: `700 14px ${BODY}` }}>✓</span>
          <span style={{ font: `500 15px ${BODY}` }}>Booked · Thu 12 Feb, 14:30</span>
        </div>
        <Cursor x={at(f, 1) - 90} y={at(f, 2) - 104} press={Math.max(press(f, 78), press(f, 128), press(f, 178))} />
      </Browser>
    </AbsoluteFill>
  );
}
