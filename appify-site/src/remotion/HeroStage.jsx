import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MARK } from "../brand.js";
import { wave, inOut, BODY, MONO, FONT } from "./kit.jsx";

export const HERO = { width: 1000, height: 1000, durationInFrames: 300, fps: 30 };
const D = HERO.durationInFrames;

const glass = {
  position: "absolute", borderRadius: 22, background: "rgba(22,19,40,.72)", backdropFilter: "blur(14px)",
  border: "1px solid rgba(205,190,255,.16)", boxShadow: "0 30px 60px rgba(0,0,0,.45)", overflow: "hidden",
};
const label = { font: `500 13px ${MONO}`, letterSpacing: ".12em", textTransform: "uppercase", color: "#9F99B8" };

function Float({ x, y, phase, children, rot = 2 }) {
  const f = useCurrentFrame();
  const dy = wave(f, D, phase) * 14;
  const r = wave(f, D, phase + 1) * rot;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translateY(${dy}px) rotate(${r}deg)` }}>{children}</div>;
}

function BrowserCard() {
  const f = useCurrentFrame();
  const shimmer = ((f % 100) / 100) * 520 - 160;
  return (
    <div style={{ ...glass, position: "relative", width: 380, height: 250 }}>
      <div style={{ display: "flex", gap: 6, padding: "14px 16px" }}>
        {[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: "rgba(255,255,255,.18)" }} />)}
        <span style={{ marginLeft: 12, ...label, fontSize: 11 }}>web</span>
      </div>
      <div style={{ padding: "6px 22px", display: "grid", gap: 12 }}>
        <div style={{ height: 18, width: "70%", borderRadius: 6, background: "#F3F1FA" }} />
        <div style={{ height: 10, width: "88%", borderRadius: 6, background: "rgba(255,255,255,.16)" }} />
        <div style={{ height: 10, width: "60%", borderRadius: 6, background: "rgba(255,255,255,.16)" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <div style={{ height: 30, width: 104, borderRadius: 99, background: "#5B2BFF" }} />
          <div style={{ height: 30, width: 84, borderRadius: 99, border: "1px solid rgba(255,255,255,.25)" }} />
        </div>
        <div style={{ height: 50, borderRadius: 12, background: "linear-gradient(120deg,#2A1B6E,#5B2BFF 60%,#74C6FF)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${shimmer}px, rgba(255,255,255,.08) ${shimmer + 60}px, transparent ${shimmer + 120}px)` }} />
    </div>
  );
}

function PhoneCard() {
  const f = useCurrentFrame();
  return (
    <div style={{ ...glass, width: 190, height: 370, borderRadius: 34, padding: 16 }}>
      <div style={{ width: 60, height: 16, borderRadius: 99, background: "#000", margin: "0 auto 18px" }} />
      <div style={{ ...label, fontSize: 11 }}>mobile</div>
      <div style={{ font: `600 30px ${FONT}`, color: "#F3F1FA", margin: "6px 0 14px", fontVariantNumeric: "tabular-nums" }}>
        {(8000 + Math.round((wave(f, D, 0) + 1) * 420)).toLocaleString("en-US")}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 110 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const h = 30 + (wave(f, D / 2, i * 0.9) + 1) * 38;
          return <div key={i} style={{ flex: 1, height: h, borderRadius: 6, background: i === 5 ? "#8F72FF" : "rgba(255,255,255,.18)" }} />;
        })}
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ width: 28, height: 28, borderRadius: 9, background: ["#5B2BFF", "#74C6FF", "#F3F1FA"][i], opacity: 0.9 }} />
            <span style={{ flex: 1, height: 8, borderRadius: 5, background: "rgba(255,255,255,.16)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatCard() {
  const f = useCurrentFrame();
  const q = inOut(f, 20, 40, 260, 285);
  const typing = inOut(f, 55, 65, 110, 118);
  const a = inOut(f, 118, 140, 260, 285);
  const dot = (i) => 0.35 + 0.65 * Math.max(0, Math.sin(f / 4 - i));
  const bubble = { padding: "10px 14px", borderRadius: 16, font: `500 15px/1.35 ${BODY}`, maxWidth: 250 };
  return (
    <div style={{ ...glass, width: 330, height: 220, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 9, background: "#3BE38B", boxShadow: "0 0 10px #3BE38B" }} />
        <span style={{ ...label, fontSize: 11 }}>ai agent · online</span>
      </div>
      <div style={{ ...bubble, alignSelf: "flex-end", background: "#5B2BFF", color: "#fff", opacity: q, transform: `translateY(${(1 - q) * 10}px)` }}>Book a table for 4 tonight</div>
      {typing > 0.01 && (
        <div style={{ ...bubble, alignSelf: "flex-start", background: "rgba(255,255,255,.1)", display: "flex", gap: 5, opacity: typing }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 9, background: "#fff", opacity: dot(i) }} />)}
        </div>
      )}
      <div style={{ ...bubble, alignSelf: "flex-start", background: "rgba(255,255,255,.1)", color: "#F3F1FA", opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>Done. 8:30 PM, table for 4. Confirmation sent.</div>
    </div>
  );
}

function TimelineCard() {
  const f = useCurrentFrame();
  const W = 340;
  const head = (f / D) * W;
  const tracks = [
    [["#5B2BFF", 0, 120], ["#8F72FF", 130, 90], ["#5B2BFF", 230, 110]],
    [["#74C6FF", 40, 150], ["#74C6FF", 205, 80]],
    [["rgba(255,255,255,.35)", 0, 340]],
  ];
  return (
    <div style={{ ...glass, width: 380, height: 170, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ ...label, fontSize: 11 }}>motion</span>
        <span style={{ font: `500 12px ${MONO}`, color: "#F3F1FA", fontVariantNumeric: "tabular-nums" }}>00:00:{String(Math.floor(f / 30)).padStart(2, "0")}:{String(f % 30).padStart(2, "0")}</span>
      </div>
      <div style={{ position: "relative", display: "grid", gap: 10, width: W }}>
        {tracks.map((t, i) => (
          <div key={i} style={{ position: "relative", height: i === 2 ? 14 : 24 }}>
            {t.map(([c, x, w], j) => <span key={j} style={{ position: "absolute", left: x, width: w, top: 0, bottom: 0, borderRadius: 6, background: c, opacity: i === 2 ? 0.5 : 0.9 }} />)}
          </div>
        ))}
        <span style={{ position: "absolute", left: head, top: -8, bottom: -8, width: 2, background: "#fff", boxShadow: "0 0 12px #fff" }} />
      </div>
    </div>
  );
}

function CenterMark() {
  const f = useCurrentFrame();
  const s = 1 + wave(f, D / 2, 0) * 0.06;
  const r = wave(f, D, 0.5) * 10;
  const glow = 0.55 + wave(f, D / 2, 0) * 0.25;
  const [vx, vy, vw, vh] = MARK.viewBox.split(" ").map(Number);
  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} width="300" style={{ position: "absolute", left: 350, top: 330, overflow: "visible" }}>
      <defs>
        <radialGradient id="hg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#8F72FF" stopOpacity="1" /><stop offset="1" stopColor="#8F72FF" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={MARK.sparkX} cy={MARK.sparkY} r={MARK.sparkR * 3.4} fill="url(#hg)" opacity={glow * 0.55} />
      <path d={`${MARK.ring} ${MARK.stem}`} fill="#F3F1FA" />
      <g transform={`translate(${MARK.sparkX} ${MARK.sparkY}) rotate(${r}) scale(${s}) translate(${-MARK.sparkX} ${-MARK.sparkY})`}>
        <path d={MARK.spark} fill="#8F72FF" />
      </g>
    </svg>
  );
}

export default function HeroStage() {
  const f = useCurrentFrame();
  const rot = (f / D) * 360;
  const nodes = [[250, 250], [770, 260], [230, 760], [760, 760]];
  return (
    <AbsoluteFill>
      <svg width="1000" height="1000" style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${rot} 500 500)`}>
          <circle cx="500" cy="500" r="300" fill="none" stroke="rgba(205,190,255,.14)" strokeDasharray="2 10" strokeWidth="2" />
        </g>
        <g transform={`rotate(${-rot / 2} 500 500)`}>
          <circle cx="500" cy="500" r="440" fill="none" stroke="rgba(205,190,255,.09)" strokeDasharray="1 14" strokeWidth="2" />
        </g>
        {nodes.map(([x, y], i) => (
          <line key={i} x1="500" y1="520" x2={x} y2={y} stroke="rgba(143,114,255,.35)" strokeWidth="1.5" strokeDasharray="4 8" strokeDashoffset={-f * 1.2} />
        ))}
      </svg>
      <CenterMark />
      <Float x={40} y={110} phase={0}><BrowserCard /></Float>
      <Float x={620} y={130} phase={1.6}><ChatCard /></Float>
      <Float x={120} y={570} phase={3.1}><PhoneCard /></Float>
      <Float x={560} y={720} phase={4.4}><TimelineCard /></Float>
    </AbsoluteFill>
  );
}
