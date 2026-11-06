// Instagram story (1080x1920, 8 s): Darebni AI is No. 4 in Health & Fitness on the App Store (Lebanon), from the store page
// screenshot (chart No. 4 · Health & Fitness; 5.0 from 2 ratings). The icon pops in, a rank counter rolls #50 -> #4 and
// locks with gold laurels and confetti, the category/country chips and the rating land, then "thank you" and "next stop
// #1", and a pointer to the empty band left for the Link sticker (y 1450-1620). Story safe zones: nothing under y 250
// (profile bar) or over y 1700 (reply bar).
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI } from "./Main.jsx";

export const CS = { DURATION: 240, ICON: 4, ROLL: [34, 84], LOCK: 84, CHIPS: 100, RATE: 122, THANKS: 146, NEXT: 160, CTA: 188 };
const GOLD = "#FFC94A", GRN = "#3DDC97";
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const pop = (p, k = 1.5) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });

// a laurel branch on the left side of the rank (mirrored for the right): leaves along an arc from the bottom up to the
// upper left, drawn in one after another
function Laurel({ p, flip }) {
  const r = 255, A0 = 262, A1 = 128;      // degrees, measured like a clock face from +x, counter-clockwise
  const pt = (deg, rr = r) => [Math.cos((deg * Math.PI) / 180) * rr, -Math.sin((deg * Math.PI) / 180) * rr];
  const leaves = Array.from({ length: 10 }, (_, i) => {
    const deg = A0 - (i / 9) * (A0 - A1), show = Math.min(1, Math.max(0, p * 11 - i));
    return [-1, 1].map((side) => {
      const [x, y] = pt(deg, r + side * 22), tilt = -deg + 90 + side * 38;
      return <ellipse key={`${i}${side}`} cx={x} cy={y} rx={30 * show} ry={13 * show} fill={GOLD} stroke="#B8860B" strokeWidth="3" transform={`rotate(${tilt} ${x} ${y})`} />;
    });
  });
  const [sx, sy] = pt(A0), [ex, ey] = pt(A1);
  return (
    <svg width="640" height="640" viewBox="-320 -320 640 640" style={{ position: "absolute", left: 0, top: 0, transform: flip ? "scaleX(-1)" : "none" }}>
      <path d={`M${sx},${sy} A${r},${r} 0 0 1 ${ex},${ey}`} fill="none" stroke="#B8860B" strokeWidth="7" strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - p)} />
      {leaves}
    </svg>
  );
}

function Confetti({ f, at }) {
  const t = f - at; if (t < 0) return null;
  const cols = [GOLD, B.lo, GRN, "#FF6B8B", B.cream];
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 70 }, (_, i) => {
        const a = random(`ca${i}`) * Math.PI * 2, v = 14 + random(`cv${i}`) * 22, x = 540 + Math.cos(a) * v * t, y = 860 + Math.sin(a) * v * t + 0.55 * t * t * (0.6 + random(`cg${i}`));
        const o = Math.max(0, 1 - t / 110), w = 10 + random(`cw${i}`) * 14;
        return <rect key={i} x={x} y={y} width={w} height={w * 0.5} fill={cols[i % 5]} opacity={o} transform={`rotate(${t * (6 + i % 7) + i * 40} ${x} ${y})`} />;
      })}
    </svg>
  );
}

export const ChartStory = ({ sound = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const [r0, r1] = CS.ROLL;
  const u = interpolate(f, [r0, r1], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
  const rank = f < r0 ? 50 : Math.max(4, Math.round(50 - 46 * u));
  const lock = sp(f, CS.LOCK, 8, 320), locked = f >= CS.LOCK;
  const punch = locked ? 1 + 0.18 * Math.max(0, 1 - (f - CS.LOCK) / 10) : 1 + 0.04 * Math.sin(f * 1.3) * (f > r0 ? 1 : 0);
  const flash = interpolate(f, [CS.LOCK - 1, CS.LOCK, CS.LOCK + 8], [0, 0.55, 0], clamp);
  const icon = sp(f, CS.ICON, 11, 200), glow = 0.35 + 0.12 * Math.sin(f / 12) + 0.3 * Math.max(0, 1 - Math.abs(f - CS.LOCK - 6) / 20);
  const cta = sp(f, CS.CTA, 10, 240), bob = f > CS.CTA + 20 ? Math.sin((f - CS.CTA) / 5) * 10 : 0;
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(91,78,229,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${-f * 0.5}px` }} />
      {/* rays behind the rank once it locks */}
      {locked && <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.18 * Math.min(1, (f - CS.LOCK) / 10) }}>
        {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2 + f / 120; return <path key={i} d={`M540,860 L${540 + Math.cos(a) * 1400},${860 + Math.sin(a) * 1400} L${540 + Math.cos(a + 0.09) * 1400},${860 + Math.sin(a + 0.09) * 1400} Z`} fill={GOLD} />; })}
      </svg>}
      {/* icon + name */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, ...pop(icon, 0.4) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 120, height: 120, borderRadius: 28, boxShadow: "0 0 50px rgba(139,128,255,.7)" }} />
        <div>
          <div style={{ ...D, fontSize: 64, color: B.cream }}>Darebni AI</div>
          <div style={{ ...UI, fontSize: 30, color: B.xlo }}>Workout Coach</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", ...D, fontSize: 64, color: B.xlo, letterSpacing: "0.12em", ...rise(sp(f, 20)) }}>We just hit</div>
      {/* the rank */}
      <div style={{ position: "absolute", left: 540 - 320, top: 835 - 320, width: 640, height: 640, opacity: lock, transform: `scale(${0.6 + 0.4 * Math.min(1, lock)})` }}>
        <Laurel p={locked ? interpolate(f, [CS.LOCK, CS.LOCK + 22], [0, 1], clamp) : 0} />
        <Laurel p={locked ? interpolate(f, [CS.LOCK, CS.LOCK + 22], [0, 1], clamp) : 0} flip />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...D, fontSize: 380, lineHeight: 1, color: locked ? GOLD : B.cream, textShadow: locked ? "0 0 60px rgba(255,201,74,.55), 0 14px 0 rgba(0,0,0,.35)" : "0 14px 0 rgba(0,0,0,.35)",
        transform: `scale(${punch})`, opacity: Math.min(1, sp(f, r0 - 6, 12, 240) * 2), filter: !locked && f > r0 ? `blur(${2 * (1 - u)}px)` : "none" }}>
        <span style={{ fontSize: 200, verticalAlign: "top", marginRight: 6, color: locked ? GOLD : B.xlo }}>#</span>{rank}
      </div>
      {/* category + country */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1125, display: "flex", justifyContent: "center", gap: 14 }}>
        {["Health & Fitness", "App Store · Lebanon"].map((c, i) => (
          <div key={c} style={{ padding: "12px 26px", borderRadius: 18, background: i ? "rgba(139,128,255,.16)" : B.primary, border: `2px solid ${i ? "rgba(139,128,255,.45)" : B.lo}`, ...D, fontSize: 46, color: B.cream, ...pop(sp(f, CS.CHIPS + i * 6, 10, 280), 1.4) }}>{c}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1225, display: "flex", justifyContent: "center", ...pop(sp(f, CS.RATE, 10, 280), 1.4) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 24px", borderRadius: 999, background: "rgba(7,7,26,.6)", border: `2px solid ${GOLD}` }}>
          <span style={{ ...D, fontSize: 46, color: GOLD }}>5.0</span>
          <span style={{ fontSize: 40, color: GOLD, letterSpacing: 4 }}>★★★★★</span>
          <span style={{ ...UI, fontSize: 28, color: B.cream }}>rating</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1330, textAlign: "center" }}>
        <div style={{ ...UI, fontSize: 44, color: B.cream, ...rise(sp(f, CS.THANKS)) }}>Thank you for getting us here</div>
        <div style={{ ...D, fontSize: 86, color: GRN, marginTop: 8, ...pop(sp(f, CS.NEXT, 9, 300), 1.6) }}>Next stop: #1</div>
      </div>
      {/* the pointer to the Link sticker the user places below */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, cta * 2), transform: `translateY(${(1 - Math.min(1, cta)) * 30 + bob}px)` }}>
        <div style={{ ...D, fontSize: 40, color: B.xlo, letterSpacing: "0.1em" }}>Start your free week</div>
        <svg width="60" height="70" viewBox="0 0 60 70" style={{ marginTop: 6 }}><path d="M30 4 V58 M10 40 L30 62 L50 40" fill="none" stroke={B.xlo} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <Confetti f={f} at={CS.LOCK} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Grain f={f} opacity={0.035} />
      {sound && <Audio src={staticFile("chartstory.wav")} />}
    </AbsoluteFill>
  );
};
