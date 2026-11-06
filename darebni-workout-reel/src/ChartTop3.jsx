// Instagram story (1080x1920, 8 s): Darebni AI is #3 in Top Downloaded · Health & Fitness (free apps), from the user's App
// Store screenshot (Flo #1, Befit #2, Darebni #3, Strava #4; MyFitnessPal #8 further down). Look of the progressive-overload
// carousel (CarouselOverload.jsx): ink, a soft violet glow, the 60 px grid, the Darebni header, gold/green pills as accents.
// The real list rows (public/proof/top-*.png, cropped from the screenshot, gitignored) slide in one by one, the other rows
// dim, a violet box draws round Darebni's row, "#3" lands with an "up from #4" pill (it was No. 4 on the earlier
// screenshot), then a tick line, "next stop #1" and a pointer to the band left for the Link sticker (y 1650-1700+).
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp } from "./fx.jsx";
import { B, D, UI } from "./Main.jsx";

export const CT3 = { DURATION: 240, ROW0: 8, ROW_STEP: 6, HL: 42, NUM: 60, UP: 74, TICK: 100, NEXT: 132, CTA: 160 };
const INK = "#07071A", PAPER = "#F2F0EA", GRN = "#3DDC97", GOLD = "#FFC94A";
const H = { ...D, color: PAPER };
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.6) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });

const CW = 940, SC = CW / 1320, CX = 70, CY = 548, HDR = 154 * SC, RH = 246.5 * SC;     // card width/scale, header + row heights
const rowTop = (i) => CY + HDR + i * RH;
const Tick = ({ size = 50 }) => (
  <div style={{ flex: "none", width: size, height: size, borderRadius: size / 2, background: GRN, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);

export const ChartTop3 = ({ sound = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const hl = interpolate(f, [CT3.HL, CT3.HL + 14], [0, 1], clamp), dim = interpolate(f, [CT3.HL, CT3.HL + 10], [0, 0.62], clamp);
  const lift = sp(f, CT3.HL, 12, 220), pulse = f > CT3.HL + 14 ? 0.5 + 0.5 * Math.sin((f - CT3.HL) / 5) : 0;
  const num = sp(f, CT3.NUM, 9, 300), ring = interpolate(f, [CT3.NUM, CT3.NUM + 22], [0, 1], clamp);
  const cta = sp(f, CT3.CTA, 10, 240), bob = f > CT3.CTA + 20 ? Math.sin((f - CT3.CTA) / 5) * 9 : 0;
  const glow = 0.35 + 0.08 * Math.sin(f / 14);
  const y3 = rowTop(2);
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(91,78,229,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      {/* header, as on the carousel slides */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 250, display: "flex", alignItems: "center", gap: 14, ...rise(sp(f, 0)) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 60, height: 60, borderRadius: 15 }} />
        <span style={{ ...D, fontSize: 40, color: PAPER, letterSpacing: "0.04em" }}>Darebni AI</span>
        <span style={{ marginLeft: "auto", ...D, fontSize: 30, color: "rgba(242,240,234,.55)", letterSpacing: "0.08em" }}>App Store</span>
      </div>
      {/* the headline: "We just hit" + #3 */}
      <div style={{ position: "absolute", left: 64, right: 64, top: 345, display: "flex", alignItems: "flex-end", gap: 22 }}>
        <div style={{ ...H, fontSize: 120, ...rise(sp(f, 4), 50) }}>We just hit</div>
        <div style={{ position: "relative" }}>
          {ring > 0 && ring < 1 && <div style={{ position: "absolute", left: "50%", top: "50%", width: 260 * (0.4 + ring), height: 260 * (0.4 + ring), marginLeft: -130 * (0.4 + ring), marginTop: -130 * (0.4 + ring), borderRadius: "50%", border: `${8 * (1 - ring)}px solid ${GRN}`, opacity: 1 - ring }} />}
          <div style={{ ...D, fontSize: 150, color: GRN, lineHeight: 0.82, textShadow: "0 0 40px rgba(61,220,151,.35)", ...pop(num, 2.2), transformOrigin: "50% 80%" }}>#3</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 64, top: 485, display: "flex", gap: 12 }}>
        <div style={{ padding: "8px 20px", borderRadius: 12, background: GOLD, ...D, fontSize: 32, color: INK, letterSpacing: "0.06em", ...rise(sp(f, 10)) }}>Top downloaded · Health & Fitness</div>
        <div style={{ padding: "8px 18px", borderRadius: 12, background: "rgba(61,220,151,.16)", border: `2px solid ${GRN}`, ...D, fontSize: 32, color: GRN, letterSpacing: "0.04em", ...pop(sp(f, CT3.UP, 10, 280), 1.5) }}>↑ Up from #4</div>
      </div>
      {/* the proof: the real App Store list */}
      <div style={{ position: "absolute", left: CX, top: CY, width: CW, height: HDR + 4 * RH, borderRadius: 34, overflow: "hidden", background: "#F2F2F7", boxShadow: "0 40px 100px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.12)", ...rise(sp(f, 0, 14, 180), 80) }}>
        <Img src={staticFile("proof/top-header.png")} style={{ position: "absolute", left: 0, top: 0, width: CW, height: HDR }} />
        {[1, 2, 3, 4].map((n, i) => {
          const p = sp(f, CT3.ROW0 + i * CT3.ROW_STEP, 13, 220);
          return <Img key={n} src={staticFile(`proof/top-row${n}.png`)} style={{ position: "absolute", left: 0, top: HDR + i * RH, width: CW, height: RH, opacity: Math.min(1, p * 2), transform: `translateX(${(1 - Math.min(1, p)) * 120}px)` }} />;
        })}
        {/* dim everything but Darebni's row */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: HDR + 2 * RH, background: INK, opacity: dim }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: HDR + 3 * RH, height: RH, background: INK, opacity: dim }} />
      </div>
      {/* Darebni's row, lifted out of the card with a violet box drawing round it */}
      {f >= CT3.HL && (
        <div style={{ position: "absolute", left: CX - 10 * lift, top: y3 - 6 * lift, width: CW + 20 * lift, height: RH + 12 * lift, borderRadius: 26, overflow: "hidden", background: "#fff",
          boxShadow: `0 24px 60px rgba(0,0,0,.5), 0 0 ${40 + 30 * pulse}px rgba(139,128,255,.75)` }}>
          <Img src={staticFile("proof/top-row3.png")} style={{ width: "100%", height: "100%" }} />
        </div>
      )}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <rect x={CX - 14} y={y3 - 10} width={CW + 28} height={RH + 20} rx="28" fill="none" stroke={B.lo} strokeWidth={6 + 2 * pulse} strokeDasharray="2400" strokeDashoffset={2400 * (1 - hl)} />
      </svg>
      {/* takeaways */}
      <div style={{ position: "absolute", left: 64, right: 64, top: CY + HDR + 4 * RH + 28, display: "flex", alignItems: "center", gap: 20, ...rise(sp(f, CT3.TICK)) }}>
        <Tick /><span style={{ ...UI, fontSize: 42, color: PAPER }}>Ahead of Strava & MyFitnessPal</span>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: CY + HDR + 4 * RH + 102 }}>
        <div style={{ ...UI, fontSize: 38, color: "rgba(242,240,234,.85)", ...rise(sp(f, CT3.NEXT - 8)) }}>Thank you for getting us here 🙏</div>
        <div style={{ ...H, fontSize: 84, color: GRN, marginTop: 4, ...pop(sp(f, CT3.NEXT, 9, 300), 1.5), transformOrigin: "0% 60%" }}>Next stop: #1</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1628, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, cta * 2), transform: `translateY(${(1 - Math.min(1, cta)) * 30 + bob}px)` }}>
        <div style={{ ...D, fontSize: 34, color: B.xlo, letterSpacing: "0.1em" }}>Start your free week</div>
        <svg width="44" height="50" viewBox="0 0 60 70" style={{ marginTop: 2 }}><path d="M30 4 V58 M10 40 L30 62 L50 40" fill="none" stroke={B.xlo} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {sound && <Audio src={staticFile("charttop3.wav")} />}
    </AbsoluteFill>
  );
};
