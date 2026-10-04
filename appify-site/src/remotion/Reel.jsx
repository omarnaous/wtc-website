import { AbsoluteFill, Series, useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { MARK, WORDMARK } from "../brand.js";
import { Phone, ramp, inOut, wave, FONT, BODY, MONO } from "./kit.jsx";

const INK = "#0A0913", FG = "#F3F1FA", UV = "#5B2BFF", IRIS = "#8F72FF", SKY = "#74C6FF", MUT = "#9F99B8";
const tag = { font: `500 22px ${MONO}`, letterSpacing: ".18em", textTransform: "uppercase" };

function Slate({ n, title, color = MUT }) {
  return (
    <div style={{ position: "absolute", left: 80, top: 70, right: 80, display: "flex", justifyContent: "space-between", ...tag, color }}>
      <span>{n} · {title}</span><span>appify</span>
    </div>
  );
}

/* 1 ─ Logo reveal: ring draws, stem rises, spark springs in, wordmark wipes on. */
function LogoReveal() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = (MARK.ro + MARK.ri) / 2;
  const circ = 2 * Math.PI * r;
  const draw = ramp(f, 4, 38);
  const fill = ramp(f, 30, 42);
  const stem = spring({ frame: f - 26, fps, config: { damping: 14, mass: 0.7 } });
  const spk = spring({ frame: f - 44, fps, config: { damping: 8, stiffness: 140 } });
  const burst = ramp(f, 44, 75);
  const settle = ramp(f, 66, 92);
  const wipe = ramp(f, 76, 104);
  const [vx, vy, vw, vh] = MARK.viewBox.split(" ").map(Number);
  return (
    <AbsoluteFill style={{ background: INK, alignItems: "center", justifyContent: "center" }}>
      <Slate n="01" title="Logo reveal" />
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: 999, background: `radial-gradient(circle, ${UV}55, transparent 60%)`, opacity: burst * (1 - settle * 0.5), transform: `scale(${0.4 + burst})` }} />
      <div style={{ display: "flex", alignItems: "center", gap: interpolate(settle, [0, 1], [0, 70]), transform: `translateX(${interpolate(settle, [0, 1], [0, -40])}px)` }}>
        <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} height={interpolate(settle, [0, 1], [520, 300])} style={{ overflow: "visible" }}>
          <circle cx={MARK.cx} cy={MARK.cy} r={r} fill="none" stroke={FG} strokeWidth={MARK.t} strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} transform={`rotate(-90 ${MARK.cx} ${MARK.cy})`} opacity={1 - fill} />
          <path d={MARK.ring} fill={FG} fillRule="evenodd" opacity={fill} />
          <g transform={`translate(0 ${MARK.stemY + MARK.stemH}) scale(1 ${stem}) translate(0 ${-(MARK.stemY + MARK.stemH)})`}><path d={MARK.stem} fill={FG} /></g>
          <g transform={`translate(${MARK.sparkX} ${MARK.sparkY}) rotate(${(1 - spk) * -120}) scale(${spk}) translate(${-MARK.sparkX} ${-MARK.sparkY})`}><path d={MARK.spark} fill={IRIS} /></g>
        </svg>
        <div style={{ width: interpolate(settle, [0, 1], [0, 760]), overflow: "hidden", clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
          <svg viewBox={WORDMARK.viewBox} height="190"><path d={WORDMARK.letters} fill={FG} /><path d={WORDMARK.spark} fill={IRIS} /></svg>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 150, ...tag, color: MUT, opacity: ramp(f, 96, 112), letterSpacing: ".4em" }}>Web · Mobile · Motion · AI</div>
    </AbsoluteFill>
  );
}

/* 2 ─ Kinetic type: four verbs, four colour fields, hard cuts with springs. */
const WORDS = [["Design.", INK, FG], ["Build.", UV, FG], ["Animate.", FG, INK], ["Automate.", SKY, INK]];
function KineticType() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = Math.min(3, Math.floor(f / 30));
  const local = f - i * 30;
  const [word, bg, fg] = WORDS[i];
  const s = spring({ frame: local, fps, config: { damping: 12, stiffness: 180 } });
  const letters = word.split("");
  return (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Slate n="02" title="Kinetic type" color={fg} />
      <div style={{ font: `700 300px/1 ${FONT}`, letterSpacing: "-.06em", color: fg, display: "flex" }}>
        {letters.map((ch, k) => {
          const ls = spring({ frame: local - k * 1.5, fps, config: { damping: 13, stiffness: 200 } });
          return <span key={k} style={{ display: "inline-block", transform: `translateY(${(1 - ls) * 180}px) rotate(${(1 - ls) * 8}deg)`, opacity: ls }}>{ch}</span>;
        })}
      </div>
      <div style={{ position: "absolute", bottom: 80, left: 80, right: 80, display: "flex", gap: 14 }}>
        {WORDS.map((_, k) => <span key={k} style={{ flex: 1, height: 6, borderRadius: 6, background: fg, opacity: k < i ? 0.9 : k === i ? 0.25 + 0.65 * (local / 30) : 0.15 }} />)}
      </div>
      <div style={{ position: "absolute", right: 80, top: "50%", ...tag, color: fg, opacity: 0.6 * s, transform: `translateY(-50%) rotate(90deg)` }}>0{i + 1} / 04</div>
    </AbsoluteFill>
  );
}

/* 3 ─ App promo: phone turns in 3D, screens swipe, feature callouts draw on. */
const SCREENS = [
  ["Track", "#FF6A3D", "Your week at a glance"],
  ["Plan", "#8F72FF", "Workouts that adapt"],
  ["Share", "#74C6FF", "Progress worth posting"],
];
function AppPromo() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 18, mass: 1.2 } });
  const rotY = interpolate(enter, [0, 1], [-60, -16]) + wave(f, 150) * 3;
  const idx = f < 55 ? 0 : f < 100 ? 1 : 2;
  const swipe = (t) => spring({ frame: f - t, fps, config: { damping: 16 } });
  const x = -(swipe(55) + swipe(100)) * 100;
  const feats = ["Native feel on iOS and Android", "Works offline", "Ships from one codebase"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(60% 70% at 30% 50%, #2A1670, ${INK} 70%)`, perspective: 1600 }}>
      <Slate n="03" title="App promo" />
      <div style={{ position: "absolute", left: 260, top: 150, transform: `rotateY(${rotY}deg) rotateX(6deg) translateY(${(1 - enter) * 200}px)`, transformStyle: "preserve-3d" }}>
        <Phone w={380} bg={INK} frame="#050409">
          <div style={{ display: "flex", width: "300%", height: "100%", transform: `translateX(${x / 3}%)` }}>
            {SCREENS.map(([t, c, s]) => (
              <div key={t} style={{ width: "33.333%", height: "100%", padding: "80px 26px", background: `linear-gradient(180deg, ${c}33, ${INK} 55%)` }}>
                <div style={{ font: `500 16px ${MONO}`, color: MUT, letterSpacing: ".12em" }}>{t.toUpperCase()}</div>
                <div style={{ font: `600 40px/1.05 ${FONT}`, color: FG, margin: "10px 0 30px", letterSpacing: "-.02em" }}>{s}</div>
                <div style={{ display: "grid", gap: 14 }}>
                  {[0.9, 0.7, 0.8, 0.5].map((w, k) => <div key={k} style={{ height: 64, borderRadius: 18, background: "rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 14, padding: 14 }}><span style={{ width: 36, height: 36, borderRadius: 11, background: c }} /><span style={{ height: 10, width: `${w * 70}%`, borderRadius: 6, background: "rgba(255,255,255,.2)" }} /></div>)}
                </div>
              </div>
            ))}
          </div>
        </Phone>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 330, display: "grid", gap: 44 }}>
        {feats.map((t, k) => {
          const p = ramp(f, 20 + k * 22, 45 + k * 22);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 24, opacity: p }}>
              <span style={{ width: 90 * p, height: 2, background: k === idx ? IRIS : "rgba(255,255,255,.3)" }} />
              <span style={{ font: `600 46px ${FONT}`, color: k === idx ? FG : MUT, letterSpacing: "-.02em", transform: `translateX(${(1 - p) * 30}px)` }}>{t}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/* 4 ─ Data story: bars grow on a scale, the total counts up, a trend line draws. */
const DATA = [32, 41, 38, 56, 61, 74, 88];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function DataStory() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const H = 520, W = 1100, max = 100, bw = 96, gap = (W - bw * 7) / 6;
  const total = Math.round(interpolate(f, [10, 70], [0, DATA.reduce((a, b) => a + b, 0) * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const line = ramp(f, 50, 95);
  const pts = DATA.map((v, i) => [i * (bw + gap) + bw / 2, H - (v / max) * H - 24]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  return (
    <AbsoluteFill style={{ background: "#F3F1FA", color: INK }}>
      <Slate n="04" title="Data story" color="#6D6788" />
      <div style={{ position: "absolute", left: 120, top: 170 }}>
        <div style={{ ...tag, color: "#6D6788", fontSize: 20 }}>Launch week · sample data</div>
        <div style={{ font: `700 120px/1 ${FONT}`, letterSpacing: "-.05em", marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{total.toLocaleString("en-US")}</div>
        <div style={{ font: `500 28px ${BODY}`, color: "#6D6788", marginTop: 6 }}>sign-ups</div>
      </div>
      <svg width={W} height={H + 60} style={{ position: "absolute", left: 700, top: 300, overflow: "visible" }}>
        {[0, 25, 50, 75, 100].map((t) => <line key={t} x1="0" x2={W} y1={H - (t / max) * H} y2={H - (t / max) * H} stroke="rgba(10,9,19,.08)" strokeWidth="2" />)}
        {DATA.map((v, i) => {
          const s = spring({ frame: f - 8 - i * 4, fps, config: { damping: 15 } });
          const h = (v / max) * H * s;
          return (
            <g key={i}>
              <rect x={i * (bw + gap)} y={H - h} width={bw} height={h} rx="14" fill={i === 6 ? UV : "rgba(91,43,255,.22)"} />
              <text x={i * (bw + gap) + bw / 2} y={H + 44} textAnchor="middle" style={{ font: `500 22px ${MONO}` }} fill="#6D6788">{DAYS[i]}</text>
            </g>
          );
        })}
        <path d={d} fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - line} />
        <circle cx={pts[6][0]} cy={pts[6][1]} r={12 * line} fill={INK} />
      </svg>
    </AbsoluteFill>
  );
}

export const CHAPTERS = [
  { name: "Logo reveal", dur: 120, C: LogoReveal },
  { name: "Kinetic type", dur: 120, C: KineticType },
  { name: "App promo", dur: 150, C: AppPromo },
  { name: "Data story", dur: 120, C: DataStory },
];
let acc = 0;
CHAPTERS.forEach((c) => { c.from = acc; acc += c.dur; });
export const REEL = { width: 1920, height: 1080, fps: 30, durationInFrames: acc };

export default function Reel() {
  return (
    <Series>
      {CHAPTERS.map(({ name, dur, C }) => (
        <Series.Sequence key={name} durationInFrames={dur}><C /></Series.Sequence>
      ))}
    </Series>
  );
}
