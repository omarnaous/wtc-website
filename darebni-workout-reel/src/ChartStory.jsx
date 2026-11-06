// Instagram story (1080x1920, 8 s): Darebni AI is No. 4 in Health & Fitness on the App Store (Lebanon), from the store page
// screenshot (chart No. 4 · Health & Fitness; 5.0 from 2 ratings). The icon pops in, a rank counter rolls #50 -> #4 and
// locks with gold laurels and confetti, the category/country chips and the rating land, then "thank you" and "next stop
// #1", and a pointer to the empty band left for the Link sticker (y 1450-1620). Story safe zones: nothing under y 250
// (profile bar) or over y 1700 (reply bar).
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI } from "./Main.jsx";

export const CHS = { DURATION: 240, ICON: 4, ROLL: [34, 84], LOCK: 84, CHIPS: 100, RATE: 122, THANKS: 146, NEXT: 160, CTA: 188 };
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
  const [r0, r1] = CHS.ROLL;
  const u = interpolate(f, [r0, r1], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
  const rank = f < r0 ? 50 : Math.max(4, Math.round(50 - 46 * u));
  const lock = sp(f, CHS.LOCK, 8, 320), locked = f >= CHS.LOCK;
  const punch = locked ? 1 + 0.18 * Math.max(0, 1 - (f - CHS.LOCK) / 10) : 1 + 0.04 * Math.sin(f * 1.3) * (f > r0 ? 1 : 0);
  const flash = interpolate(f, [CHS.LOCK - 1, CHS.LOCK, CHS.LOCK + 8], [0, 0.55, 0], clamp);
  const icon = sp(f, CHS.ICON, 11, 200), glow = 0.35 + 0.12 * Math.sin(f / 12) + 0.3 * Math.max(0, 1 - Math.abs(f - CHS.LOCK - 6) / 20);
  const cta = sp(f, CHS.CTA, 10, 240), bob = f > CHS.CTA + 20 ? Math.sin((f - CHS.CTA) / 5) * 10 : 0;
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(91,78,229,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${-f * 0.5}px` }} />
      {/* rays behind the rank once it locks */}
      {locked && <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.18 * Math.min(1, (f - CHS.LOCK) / 10) }}>
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
        <Laurel p={locked ? interpolate(f, [CHS.LOCK, CHS.LOCK + 22], [0, 1], clamp) : 0} />
        <Laurel p={locked ? interpolate(f, [CHS.LOCK, CHS.LOCK + 22], [0, 1], clamp) : 0} flip />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...D, fontSize: 380, lineHeight: 1, color: locked ? GOLD : B.cream, textShadow: locked ? "0 0 60px rgba(255,201,74,.55), 0 14px 0 rgba(0,0,0,.35)" : "0 14px 0 rgba(0,0,0,.35)",
        transform: `scale(${punch})`, opacity: Math.min(1, sp(f, r0 - 6, 12, 240) * 2), filter: !locked && f > r0 ? `blur(${2 * (1 - u)}px)` : "none" }}>
        <span style={{ fontSize: 200, verticalAlign: "top", marginRight: 6, color: locked ? GOLD : B.xlo }}>#</span>{rank}
      </div>
      {/* category + country */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1125, display: "flex", justifyContent: "center", gap: 14 }}>
        {["Health & Fitness", "App Store · Lebanon"].map((c, i) => (
          <div key={c} style={{ padding: "12px 26px", borderRadius: 18, background: i ? "rgba(139,128,255,.16)" : B.primary, border: `2px solid ${i ? "rgba(139,128,255,.45)" : B.lo}`, ...D, fontSize: 46, color: B.cream, ...pop(sp(f, CHS.CHIPS + i * 6, 10, 280), 1.4) }}>{c}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1225, display: "flex", justifyContent: "center", ...pop(sp(f, CHS.RATE, 10, 280), 1.4) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 24px", borderRadius: 999, background: "rgba(7,7,26,.6)", border: `2px solid ${GOLD}` }}>
          <span style={{ ...D, fontSize: 46, color: GOLD }}>5.0</span>
          <span style={{ fontSize: 40, color: GOLD, letterSpacing: 4 }}>★★★★★</span>
          <span style={{ ...UI, fontSize: 28, color: B.cream }}>rating</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1330, textAlign: "center" }}>
        <div style={{ ...UI, fontSize: 44, color: B.cream, ...rise(sp(f, CHS.THANKS)) }}>Thank you for getting us here</div>
        <div style={{ ...D, fontSize: 86, color: GRN, marginTop: 8, ...pop(sp(f, CHS.NEXT, 9, 300), 1.6) }}>Next stop: #1</div>
      </div>
      {/* the pointer to the Link sticker the user places below */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, cta * 2), transform: `translateY(${(1 - Math.min(1, cta)) * 30 + bob}px)` }}>
        <div style={{ ...D, fontSize: 40, color: B.xlo, letterSpacing: "0.1em" }}>Start your free week</div>
        <svg width="60" height="70" viewBox="0 0 60 70" style={{ marginTop: 6 }}><path d="M30 4 V58 M10 40 L30 62 L50 40" fill="none" stroke={B.xlo} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <Confetti f={f} at={CHS.LOCK} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Grain f={f} opacity={0.035} />
      {sound && <Audio src={staticFile("chartstory.wav")} />}
    </AbsoluteFill>
  );
};

// ── the proof version: the real App Store page (cropped from the user's screenshot; the TestFlight bar left out) as the
// evidence. A gold box draws round the "Chart · No. 4 · Health & Fitness" cell, that exact patch of the screenshot flies
// out and zooms into a gold frame with laurels and confetti, then thanks / next stop #1 / the Link-sticker pointer. Same
// beats as ChartStory (lock at frame 84), so it shares public/chartstory.wav. Crops: public/proof/ (gitignored).
const CARD = { x: 36, y: 340, pad: 24, w: 960 }, SC = 960 / 1277;     // store-top 1277x394, store-stats 1277x287
const CELL = { x: CARD.x + CARD.pad + 656 * SC, y: CARD.y + CARD.pad + 300 + 26 * SC, w: 336 * SC, h: 238 * SC };   // the chart cell on screen
const ZOOM = { cx: 540, cy: 1160, w: 400 };
export const ChartProof = ({ sound = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const LOCK = CHS.LOCK, BOX = 32, FLY = 56;
  const card = sp(f, 2, 14, 160), box = interpolate(f, [BOX, BOX + 16], [0, 1], clamp), boxPulse = f > BOX + 16 ? 0.5 + 0.5 * Math.sin((f - BOX) / 4) : 0;
  const fly = Math.min(1.02, sp(f, FLY, 13, 140)), locked = f >= LOCK, lockP = sp(f, LOCK, 8, 320);
  const zw = CELL.w + (ZOOM.w - CELL.w) * fly, zh = zw * (238 / 336);
  const zx = CELL.x + CELL.w / 2 + (ZOOM.cx - CELL.x - CELL.w / 2) * fly, zy = CELL.y + CELL.h / 2 + (ZOOM.cy - CELL.y - CELL.h / 2) * fly;
  const punch = locked ? 1 + 0.12 * Math.max(0, 1 - (f - LOCK) / 10) : 1;
  const flash = interpolate(f, [LOCK - 1, LOCK, LOCK + 8], [0, 0.5, 0], clamp);
  const glow = 0.33 + 0.1 * Math.sin(f / 12) + 0.3 * Math.max(0, 1 - Math.abs(f - LOCK - 6) / 20);
  const cta = sp(f, CHS.CTA, 10, 240), bob = f > CHS.CTA + 20 ? Math.sin((f - CHS.CTA) / 5) * 10 : 0;
  const lp = locked ? interpolate(f, [LOCK, LOCK + 22], [0, 1], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: B.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, rgba(91,78,229,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `0 ${-f * 0.5}px` }} />
      {locked && <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.16 * Math.min(1, (f - LOCK) / 10) }}>
        {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2 + f / 120; return <path key={i} d={`M${ZOOM.cx},${ZOOM.cy} L${ZOOM.cx + Math.cos(a) * 1500},${ZOOM.cy + Math.sin(a) * 1500} L${ZOOM.cx + Math.cos(a + 0.09) * 1500},${ZOOM.cy + Math.sin(a + 0.09) * 1500} Z`} fill={GOLD} />; })}
      </svg>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 252, textAlign: "center", ...D, fontSize: 60, color: B.xlo, letterSpacing: "0.12em", ...rise(sp(f, 0)) }}>We just hit <span style={{ color: GOLD }}>#4</span> on the App Store</div>
      {/* the real store page */}
      <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w + CARD.pad * 2, padding: CARD.pad, boxSizing: "border-box", borderRadius: 40, background: "#000", border: "2px solid rgba(255,255,255,.14)",
        boxShadow: "0 40px 100px rgba(0,0,0,.6), 0 0 80px rgba(91,78,229,.35)", opacity: Math.min(1, card * 2), transform: `translateY(${(1 - Math.min(1, card)) * 120}px) scale(${0.94 + 0.06 * Math.min(1, card)})` }}>
        <Img src={staticFile("proof/store-top.png")} style={{ display: "block", width: CARD.w, height: 394 * SC }} />
        <div style={{ height: 4 }} />
        <Img src={staticFile("proof/store-stats.png")} style={{ display: "block", width: CARD.w, height: 287 * SC, filter: f > BOX ? "brightness(.7)" : "none" }} />
      </div>
      {/* the chart cell, lit, with a gold box drawing round it */}
      {f > BOX - 2 && <Img src={staticFile("proof/store-chart.png")} style={{ position: "absolute", left: CELL.x, top: CELL.y, width: CELL.w, height: CELL.h, opacity: Math.min(1, box * 2) }} />}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <rect x={CELL.x - 8} y={CELL.y - 8} width={CELL.w + 16} height={CELL.h + 16} rx="18" fill="none" stroke={GOLD} strokeWidth={6 + 3 * boxPulse} strokeDasharray="1000" strokeDashoffset={1000 * (1 - box)}
          style={{ filter: `drop-shadow(0 0 ${10 + 14 * boxPulse}px rgba(255,201,74,.9))` }} />
      </svg>
      {/* the zoomed proof in a gold frame, laurels around it once it lands */}
      <div style={{ position: "absolute", left: ZOOM.cx - 320, top: ZOOM.cy - 320, width: 640, height: 640, opacity: lockP, transform: `scale(${(0.6 + 0.4 * Math.min(1, lockP)) * 1.12}, ${(0.6 + 0.4 * Math.min(1, lockP)) * 0.9})` }}>
        <Laurel p={lp} /><Laurel p={lp} flip />
      </div>
      {f >= FLY && (
        <div style={{ position: "absolute", left: zx - zw / 2, top: zy - zh / 2, width: zw, height: zh, borderRadius: 24 * fly, overflow: "hidden", background: "#000",
          border: `${3 + 5 * fly}px solid ${GOLD}`, boxShadow: `0 30px 80px rgba(0,0,0,.6), 0 0 ${40 + 40 * fly}px rgba(255,201,74,.55)`, transform: `scale(${punch}) rotate(${(1 - Math.min(1, fly)) * -6}deg)` }}>
          <Img src={staticFile("proof/store-chart.png")} style={{ width: "100%", height: "100%" }} />
        </div>
      )}
      {/* the country, as a tilted badge on the zoomed proof's corner */}
      <div style={{ position: "absolute", left: ZOOM.cx + ZOOM.w / 2 - 150, top: ZOOM.cy - (ZOOM.w * 238) / 336 / 2 - 36, transform: `rotate(8deg) scale(${interpolate(sp(f, CHS.CHIPS, 9, 300), [0, 1], [2, 1])})`, opacity: Math.min(1, sp(f, CHS.CHIPS, 9, 300) * 3),
        padding: "8px 18px", borderRadius: 14, background: B.primary, border: `4px solid ${B.ink}`, boxShadow: "0 10px 30px rgba(0,0,0,.5)", ...D, fontSize: 36, color: B.cream, whiteSpace: "nowrap" }}>App Store · Lebanon</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1478, textAlign: "center" }}>
        <div style={{ ...UI, fontSize: 40, color: B.cream, ...rise(sp(f, CHS.THANKS)) }}>Thank you for getting us here</div>
        <div style={{ ...D, fontSize: 80, color: GRN, marginTop: 4, ...pop(sp(f, CHS.NEXT, 9, 300), 1.6) }}>Next stop: #1</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1620, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, cta * 2), transform: `translateY(${(1 - Math.min(1, cta)) * 30 + bob}px)` }}>
        <div style={{ ...D, fontSize: 36, color: B.xlo, letterSpacing: "0.1em" }}>Start your free week</div>
        <svg width="50" height="56" viewBox="0 0 60 70" style={{ marginTop: 4 }}><path d="M30 4 V58 M10 40 L30 62 L50 40" fill="none" stroke={B.xlo} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <Confetti f={f} at={LOCK} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Grain f={f} opacity={0.03} />
      {sound && <Audio src={staticFile("chartstory.wav")} />}
    </AbsoluteFill>
  );
};
