// Appify — website showcase Reel. A studio monitor in a designed, lit studio; on screen a high-end editorial
// concept for WTC, scrolling through motion-graphic sections; boxed captions; Appify end card.
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { SCROLL, ARRIVE, T, CAPTIONS } from "./timing.js";
import { useFonts, clamp, easeOut, after, Grain } from "./fx.jsx";

const A = { navy: "#120c3a", violet: "#7b6cff", blue: "#4f7dff", hi: "#4d78ff" }; // Appify
const W_ = { ivory: "#F2EEE6", paper: "#FBF9F5", ink: "#121110", mute: "#7d776d", line: "rgba(18,17,16,0.12)", gold: "#B08D3C" }; // the site
const POP = "Poppins", SERIF = "Serif", SANS = "Inter";
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const watch = (sku) => staticFile(`w/${sku}.png`);
const AR = 0.59;
const sp = (f, start, cfg = { damping: 14, stiffness: 160 }) => (f < start ? 0 : spring({ frame: f - start, fps: 30, config: cfg }));

function keyed(f, keys, ease = inOut) {
  if (f <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, ...a] = keys[i], [f1, ...b] = keys[i + 1];
    if (f <= f1) {
      const p = ease(Math.min(1, (f - f0) / Math.max(1, f1 - f0)));
      return a.map((v, k) => v + (b[k] - v) * p);
    }
  }
  return keys[keys.length - 1].slice(1);
}
// Text revealed upward out of a mask, word by word.
function Reveal({ f, start, text, stagger = 3, style }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0 0.24em", ...style }}>
      {text.split(" ").map((w, i) => {
        const p = after(f, start + i * stagger, [0, 18], [0, 1], { easing: easeOut });
        return <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.1em", marginBottom: "-0.1em" }}>
          <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)`, transformOrigin: "0 100%" }}>{w}</span>
        </span>;
      })}
    </span>
  );
}
const Label = ({ children, style }) => <div style={{ fontFamily: "Mono", fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", ...style }}>{children}</div>;
const fade = (f, start, dist = 30) => { const p = after(f, start, [0, 18], [0, 1], { easing: easeOut }); return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` }; };

// ════════════════════════════════════ the website: an editorial concept (1600 × 900 per screen)
const PW = 1600, PH = 900;
const RAIL = [["SO33W700", "Full Moon"], ["SO33M100", "Mission to the Moon"], ["SO33J100", "Mission to the Sun"], ["SO33N700", "Super Blue"], ["SO33R100", "Mission to Mars"], ["SO33P700", "Pink Moon"], ["SO33L100", "Uranus"]];
const STRAPS = [
  { file: "vertech-black", chip: "#151515", bg: "#E9E5DD", name: "Vertech Black" },
  { file: "vertech-orange", chip: "#F26B1D", bg: "#F3D2BC", name: "Vertech Orange" },
  { file: "vertech-capri-blue", chip: "#4FB3E8", bg: "#CFE6F2", name: "Capri Blue" },
  { file: "vertech-white", chip: "#F2F2F0", bg: "#E4E2DC", name: "Vertech White" },
  { file: "vertech-black-and-red-stitches", chip: "#1A1A1A", ring: "#D3262B", bg: "#EBD3D0", name: "Black · Red Stitch" },
];

function Site({ f }) {
  const [scroll] = keyed(f, SCROLL);
  const [prev] = keyed(f - 1, SCROLL);
  const vel = scroll - prev;
  const skew = Math.max(-2, Math.min(2, vel * 0.03)); // the page leans into fast scrolls
  // strap state
  let k = 0; T.swaps.forEach((s, i) => { if (f >= s) k = i + 1; });
  const strap = STRAPS[k], prevStrap = STRAPS[Math.max(0, k - 1)];
  const lastSwap = k > 0 ? T.swaps[k - 1] : 0;
  const wipe = k === 0 ? 1 : interpolate(f - lastSwap, [0, 8], [0, 1], { ...clamp, easing: easeOut });
  const railX = interpolate(f, [T.rail0, T.rail1], [0, -1180], { ...clamp, easing: Easing.bezier(0.45, 0, 0.25, 1) });
  const ring = (f * 0.25) % 360;
  return (
    <div style={{ width: PW, height: PH, position: "relative", overflow: "hidden", background: W_.ivory, fontFamily: SANS, color: W_.ink }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -scroll, transform: `skewY(${skew}deg)`, transformOrigin: `50% ${scroll + PH / 2}px` }}>
        {/* ─── 1. hero */}
        <section style={{ position: "absolute", top: 0, left: 0, width: PW, height: 900, overflow: "hidden", background: `radial-gradient(ellipse at 70% 45%, #fffdf8 0%, ${W_.ivory} 60%)` }}>
          {/* rotating tachymeter ring */}
          <svg width="900" height="900" viewBox="-450 -450 900 900" style={{ position: "absolute", left: 1190 - 450, top: 450 - 450 + scroll * 0.2, transform: `rotate(${ring}deg)` }}>
            <circle r="360" fill="none" stroke={W_.ink} strokeOpacity="0.12" strokeWidth="1.5" />
            <circle r="410" fill="none" stroke={W_.gold} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 10" />
            {Array.from({ length: 60 }, (_, i) => { const a = (i / 60) * Math.PI * 2, r0 = i % 5 ? 344 : 330; return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * 360} y2={Math.sin(a) * 360} stroke={W_.ink} strokeOpacity={i % 5 ? 0.2 : 0.5} strokeWidth={i % 5 ? 1 : 2} />; })}
            {["60", "70", "80", "100", "120", "150", "200", "300", "500"].map((t, i) => { const a = -Math.PI / 2 + (i / 9) * Math.PI * 2; return <text key={t} x={Math.cos(a) * 385} y={Math.sin(a) * 385 + 5} fill={W_.ink} fillOpacity="0.35" fontSize="14" fontFamily="Mono" textAnchor="middle">{t}</text>; })}
          </svg>
          <Img src={watch("SO33M100")} style={{ position: "absolute", left: 1190 - 430 * AR, top: 20 + scroll * 0.45, height: 860, transform: `rotate(${-14 + Math.sin(f / 40) * 2}deg) translateY(${Math.sin(f / 30) * 8}px)`, filter: "drop-shadow(0 40px 50px rgba(60,45,20,0.28))" }} />
          {/* nav */}
          <div style={{ position: "absolute", left: 80, right: 80, top: 34, display: "flex", justifyContent: "space-between", alignItems: "center", ...fade(f, -14, 10) }}>
            <span style={{ fontFamily: SERIF, fontSize: 34, letterSpacing: "0.06em" }}>WTC</span>
            <span style={{ display: "flex", gap: 42, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase" }}>{["Collection", "Strap Studio", "Journal", "About"].map((n) => <span key={n}>{n}</span>)}</span>
            <span style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase" }}>Bag (0)</span>
          </div>
          <div style={{ position: "absolute", left: 80, top: 190 }}>
            <Label style={{ color: W_.gold, ...fade(f, -14, 10) }}>Omega × Swatch · Bioceramic</Label>
            <div style={{ marginTop: 26, fontFamily: SERIF, fontSize: 210, lineHeight: 0.86, letterSpacing: "-0.035em" }}>
              <div><Reveal f={f} start={-16} text="Time," /></div>
              <div style={{ fontStyle: "italic", marginLeft: 120 }}><Reveal f={f} start={-10} text="curated." /></div>
            </div>
            <div style={{ marginTop: 40, width: 420, fontSize: 17, lineHeight: 1.65, color: W_.mute, ...fade(f, -6) }}>Every watch sourced, checked in hand and shipped complete — with everything it came with.</div>
            <div style={{ marginTop: 34, display: "inline-flex", alignItems: "center", gap: 16, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", ...fade(f, -2) }}>
              <span style={{ borderBottom: `1.5px solid ${W_.ink}`, paddingBottom: 6 }}>Explore the collection</span><span style={{ transform: `translateX(${Math.sin(f / 6) * 4}px)` }}>→</span>
            </div>
          </div>
          {/* marquee */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: W_.ink, color: W_.ivory, overflow: "hidden", display: "flex", alignItems: "center" }}>
            <div style={{ whiteSpace: "nowrap", fontFamily: SERIF, fontSize: 30, fontStyle: "italic", transform: `translateX(${-(f * 4) % 1200}px)` }}>
              {Array.from({ length: 6 }, () => "Mission to the Moon  ✦  Full Moon  ✦  Super Blue  ✦  Mission to Mars  ✦  ").join("")}
            </div>
          </div>
        </section>
        {/* ─── 2. the collection: a rail that runs sideways */}
        <section style={{ position: "absolute", top: 900, left: 0, width: PW, height: 900, overflow: "hidden", background: W_.paper }}>
          <div style={{ position: "absolute", left: 80, top: 70, display: "flex", alignItems: "baseline", gap: 30 }}>
            <span style={{ fontFamily: SERIF, fontSize: 120, letterSpacing: "-0.03em", lineHeight: 1 }}><Reveal f={f} start={ARRIVE.rail - 6} text="The Collection" /></span>
            <Label style={{ color: W_.mute, ...fade(f, ARRIVE.rail) }}>32 pieces · 2026</Label>
          </div>
          <div style={{ position: "absolute", left: 80, top: 250, display: "flex", gap: 34, transform: `translateX(${railX}px)` }}>
            {RAIL.map(([sku, name], i) => {
              const p = after(f, ARRIVE.rail + i * 3, [0, 20], [0, 1], { easing: easeOut });
              const cxCard = 80 + railX + i * (380 + 34) + 190;
              const focus = Math.max(0, 1 - Math.abs(cxCard - 800) / 700);
              return (
                <div key={sku} style={{ position: "relative", width: 380, height: 560, flex: "none", borderRadius: 4, background: i % 2 ? "#ECE7DE" : "#F4F0E9", overflow: "hidden",
                  opacity: p, transform: `translateY(${(1 - p) * 120 - focus * 14}px)` }}>
                  <Label style={{ position: "absolute", left: 22, top: 22, fontSize: 11, color: W_.mute }}>No. {String(i + 1).padStart(2, "0")}</Label>
                  <Img src={watch(sku)} style={{ position: "absolute", height: 430, left: 190 - 215 * AR, top: 30, transform: `rotate(${(cxCard - 800) * -0.012}deg) scale(${0.92 + focus * 0.1})`, filter: "drop-shadow(0 24px 24px rgba(60,45,20,0.22))" }} />
                  <div style={{ position: "absolute", left: 22, right: 22, bottom: 24, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontFamily: SERIF, fontSize: 30 }}>{name}</span><span style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: W_.mute }}>View →</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* rail progress */}
          <div style={{ position: "absolute", left: 80, right: 80, bottom: 46, height: 2, background: W_.line }}><div style={{ width: `${18 + (-railX / 1180) * 82}%`, height: 2, background: W_.ink }} /></div>
        </section>
        {/* ─── 3. the detail: a dial macro through an opening circle */}
        <section style={{ position: "absolute", top: 1800, left: 0, width: PW, height: 900, overflow: "hidden", background: W_.ink, color: W_.ivory }}>
          {(() => {
            const r = interpolate(sp(f, ARRIVE.detail, { damping: 20, stiffness: 70 }), [0, 1], [0, 360]);
            const zoom = interpolate(f, [ARRIVE.detail, 240], [2.6, 3.0], clamp);
            return (
              <div style={{ position: "absolute", left: 1060 - 380, top: 450 - 380, width: 760, height: 760 }}>
                <div style={{ position: "absolute", inset: 0, clipPath: `circle(${r}px at 50% 50%)`, overflow: "hidden", background: "#0d0d0f" }}>
                  <Img src={watch("SO33M100")} style={{ position: "absolute", height: 760 * zoom, left: 380 - (760 * zoom * AR) / 2, top: 380 - 760 * zoom * 0.5, transform: `rotate(${(f - ARRIVE.detail) * 0.08}deg)` }} />
                </div>
                <svg width="760" height="760" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                  <circle cx="380" cy="380" r={Math.max(1, r + 18)} fill="none" stroke={W_.gold} strokeWidth="1.5" strokeDasharray={`${2 * Math.PI * (r + 18)}`} strokeDashoffset={`${2 * Math.PI * (r + 18) * (1 - after(f, ARRIVE.detail + 6, [0, 30], [0, 1], { easing: easeOut }))}`} transform="rotate(-90 380 380)" />
                </svg>
              </div>
            );
          })()}
          <div style={{ position: "absolute", left: 80, top: 190 }}>
            <Label style={{ color: W_.gold, ...fade(f, ARRIVE.detail) }}>Checked in hand</Label>
            <div style={{ marginTop: 24, fontFamily: SERIF, fontSize: 112, lineHeight: 0.95, letterSpacing: "-0.03em" }}>
              <div><Reveal f={f} start={ARRIVE.detail + 2} text="Every piece," /></div>
              <div style={{ fontStyle: "italic", color: "#E2C469" }}><Reveal f={f} start={ARRIVE.detail + 8} text="inspected." /></div>
            </div>
            <div style={{ display: "flex", gap: 54, marginTop: 70 }}>
              {[[200, "+", "Customers"], [26, "", "In stock"], [100, "%", "Complete sets"]].map(([v, s, l], i) => (
                <div key={l} style={fade(f, ARRIVE.detail + 14 + i * 4)}>
                  <div style={{ fontFamily: SERIF, fontSize: 70 }}>{Math.round(interpolate(f, [ARRIVE.detail + 14, ARRIVE.detail + 50], [0, v], { ...clamp, easing: Easing.out(Easing.cubic) }))}{s}</div>
                  <Label style={{ fontSize: 11, color: "rgba(242,238,230,0.55)", marginTop: 6 }}>{l}</Label>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ─── 4. strap studio: the room takes the strap's colour */}
        <section style={{ position: "absolute", top: 2700, left: 0, width: PW, height: 900, overflow: "hidden", background: prevStrap.bg }}>
          <div style={{ position: "absolute", inset: 0, background: strap.bg, clipPath: `circle(${wipe * 140}% at 1060px 450px)` }} />
          <div style={{ position: "absolute", left: 1060 - 230, top: 30, width: 460, height: 840, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)", ...fade(f, ARRIVE.strap - 4, 80) }}>
            {k > 0 && <Img src={staticFile(`s/${prevStrap.file}.png`)} style={{ position: "absolute", height: 840, left: 230 - 420 * 0.558, top: 0 }} />}
            <Img src={staticFile(`s/${strap.file}.png`)} style={{ position: "absolute", height: 840, left: 230 - 420 * 0.558, top: 0, clipPath: `inset(0 0 ${(1 - wipe) * 100}% 0)`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.2))" }} />
          </div>
          <div style={{ position: "absolute", left: 80, top: 200 }}>
            <Label style={{ color: W_.mute, ...fade(f, ARRIVE.strap) }}>Strap Studio</Label>
            <div style={{ marginTop: 24, fontFamily: SERIF, fontSize: 120, lineHeight: 0.92, letterSpacing: "-0.03em" }}>
              <div><Reveal f={f} start={ARRIVE.strap + 2} text="Try any strap." /></div>
              <div style={{ fontStyle: "italic" }}><Reveal f={f} start={ARRIVE.strap + 8} text="Before you buy." /></div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 60 }}>
              {STRAPS.map((s, j) => {
                const p = after(f, ARRIVE.strap + 12 + j * 2, [0, 12], [0, 1], { easing: easeOut });
                return <div key={j} style={{ width: 54, height: 54, borderRadius: 99, background: s.chip, transform: `scale(${(0.4 + 0.6 * p) * (j === k ? 1.12 : 1)})`, opacity: p,
                  boxShadow: `0 0 0 ${s.ring ? 4 : 1}px ${s.ring || "rgba(0,0,0,0.15)"}${j === k ? `, 0 0 0 9px ${strap.bg}, 0 0 0 11px ${W_.ink}` : ""}` }} />;
              })}
            </div>
            <div style={{ marginTop: 26, fontFamily: SERIF, fontStyle: "italic", fontSize: 34, ...fade(f, ARRIVE.strap + 18) }}>{strap.name}</div>
          </div>
        </section>
        {/* ─── 5. finale */}
        <section style={{ position: "absolute", top: 3600, left: 0, width: PW, height: 900, overflow: "hidden", background: W_.ivory, textAlign: "center" }}>
          <Label style={{ marginTop: 200, color: W_.gold, ...fade(f, ARRIVE.finale) }}>Watch Trade Chronicles</Label>
          <div style={{ marginTop: 26, fontFamily: SERIF, fontSize: 250, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            <Reveal f={f} start={ARRIVE.finale + 2} text="Find" style={{ justifyContent: "center" }} />{" "}
            <span style={{ fontStyle: "italic" }}><Reveal f={f} start={ARRIVE.finale + 7} text="yours." /></span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 18, marginTop: 50, padding: "24px 46px", borderRadius: 999, background: f >= T.ctaClick ? W_.gold : W_.ink, color: W_.ivory, fontSize: 16, letterSpacing: "0.22em", textTransform: "uppercase",
            transform: `scale(${(f >= T.ctaClick && f < T.ctaClick + 4 ? 0.95 : 1) * (0.8 + 0.2 * sp(f, ARRIVE.finale + 14))})`, opacity: sp(f, ARRIVE.finale + 14) }}>Shop the collection <span>→</span></div>
          <div style={{ position: "absolute", left: 80, right: 80, bottom: 40, display: "flex", justifyContent: "space-between", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: W_.mute, borderTop: `1px solid ${W_.line}`, paddingTop: 22 }}>
            <span>© Watch Trade Chronicles</span><span>Instagram · WhatsApp · Journal</span><span>watchtradechronicles.com</span>
          </div>
        </section>
      </div>
      {/* scroll progress + a cursor that only shows where something is clicked */}
      <div style={{ position: "absolute", right: 14, top: 120, bottom: 120, width: 2, background: "rgba(18,17,16,0.1)" }}><div style={{ position: "absolute", left: 0, top: `${(scroll / 3600) * 80}%`, width: 2, height: "20%", background: W_.gold }} /></div>
      <Cursor f={f} />
    </div>
  );
}

const CURSOR = [[0, 1400, 760], [40, 300, 720], [60, 330, 640], [240, 330, 640], [T.swaps[0] - 2, 80 + 70 + 22, 200 + 380], [T.swaps[1] - 2, 80 + 2 * 70 + 27, 200 + 380], [T.swaps[2] - 2, 80 + 3 * 70 + 27, 200 + 380], [T.swaps[3] - 2, 80 + 4 * 70 + 27, 200 + 380], [340, 900, 640], [T.ctaClick - 2, 830, 610], [450, 840, 615]];
const CLICKS = [...T.swaps, T.ctaClick];
function Cursor({ f }) {
  const [x, y] = keyed(f, CURSOR, Easing.bezier(0.45, 0, 0.2, 1));
  const press = CLICKS.some((c) => f >= c && f < c + 4);
  const show = interpolate(f, [0, 6, 64, 70, 250, 256], [1, 1, 1, 0, 0, 1], clamp);
  return (
    <>
      {CLICKS.map((c) => f >= c && f < c + 16 && <div key={c} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 99, border: `2px solid ${W_.gold}`, transform: `scale(${interpolate(f - c, [0, 16], [0.3, 1.6], clamp)})`, opacity: interpolate(f - c, [0, 16], [1, 0], clamp) }} />)}
      <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: "absolute", left: x - 4, top: y - 2, opacity: show, transform: `scale(${press ? 0.85 : 1})`, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}>
        <path d="M4 2l15 11-7 1-4 7z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </>
  );
}

// ════════════════════════════════════ the studio
const VX = 540, HORIZON = 1440;
function Studio({ f }) {
  const t = f / 30;
  const dust = Array.from({ length: 70 }, (_, i) => {
    const x = (random(`dx${i}`) * 1180 + t * (6 + random(`dv${i}`) * 14)) % 1180 - 50;
    const y = 200 + random(`dy${i}`) * 1250 - t * (4 + random(`du${i}`) * 8);
    const r = 0.8 + random(`dr${i}`) * 2.2;
    return <circle key={i} cx={x} cy={((y % 1300) + 1300) % 1300 + 150} r={r} fill="#fff" opacity={0.08 + 0.25 * random(`do${i}`) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />;
  });
  const lines = [];
  for (let i = -14; i <= 14; i++) lines.push(<line key={`v${i}`} x1={VX + i * 18} y1={HORIZON} x2={VX + i * 260} y2={1920} stroke="#9a8cff" strokeOpacity={0.16} strokeWidth="1.2" />);
  for (let j = 1; j < 12; j++) { const y = HORIZON + Math.pow(j / 12, 2.2) * 480 + ((t * 24) % 1) ; lines.push(<line key={`h${j}`} x1={0} y1={y} x2={1080} y2={y} stroke="#9a8cff" strokeOpacity={0.05 + j * 0.012} strokeWidth="1" />); }
  return (
    <AbsoluteFill style={{ background: "#07060f", overflow: "hidden" }}>
      {/* light: a violet key and a warm rim, drifting */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${45 + Math.sin(t * 0.5) * 8}% ${40 + Math.cos(t * 0.4) * 4}%, rgba(110,92,255,0.55) 0%, rgba(60,40,160,0.25) 28%, transparent 55%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${82 - Math.sin(t * 0.4) * 6}% ${24 + Math.sin(t * 0.3) * 5}%, rgba(255,160,90,0.35) 0%, transparent 34%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${12 + Math.cos(t * 0.35) * 5}% ${70}%, rgba(77,120,255,0.28) 0%, transparent 32%)` }} />
      {/* a big soft orb behind the screen */}
      <div style={{ position: "absolute", left: 540 - 520, top: 900 - 520, width: 1040, height: 1040, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.10), rgba(123,108,255,0.10) 40%, transparent 70%)", transform: `scale(${1 + Math.sin(t * 0.8) * 0.02})` }} />
      {/* floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: HORIZON, bottom: 0, background: "linear-gradient(180deg, #120d2c 0%, #07060f 100%)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{lines}</svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: HORIZON - 1, height: 2, background: "linear-gradient(90deg, transparent, rgba(180,170,255,0.6), transparent)" }} />
      {/* the screen's light spilling on the floor */}
      <div style={{ position: "absolute", left: 540 - 560, top: HORIZON - 40, width: 1120, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,238,230,0.22), transparent 65%)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{dust}</svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}

// ════════════════════════════════════ the monitor (studio-display style)
const MW = 1030, BZ = 12, SW = MW - 2 * BZ, SH = SW * (PH / PW), MH = SH + 2 * BZ;
const MX = (1080 - MW) / 2, MY = 760;
function Monitor({ f }) {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
      {/* stand */}
      <div style={{ position: "absolute", left: 540 - 150, top: MY + MH - 20, width: 300, height: 200, background: "linear-gradient(90deg,#7e8086 0%,#d9dade 40%,#c4c6ca 62%,#7a7c81 100%)", clipPath: "polygon(12% 0, 88% 0, 100% 100%, 0 100%)" }} />
      <div style={{ position: "absolute", left: 540 - 250, top: MY + MH + 172, width: 520, height: 30, borderRadius: "14px 14px 24px 24px", background: "linear-gradient(180deg,#e2e3e6,#9c9ea3)", boxShadow: "0 30px 50px rgba(0,0,0,0.6)" }} />
      {/* body */}
      <div style={{ position: "absolute", left: MX - 4, top: MY - 4, width: MW + 8, height: MH + 8, borderRadius: 26, background: "linear-gradient(135deg,#f0f1f3 0%,#a9abb0 40%,#d7d8dc 70%,#8d8f94 100%)", boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 120px rgba(123,108,255,0.25)" }} />
      <div style={{ position: "absolute", left: MX, top: MY, width: MW, height: MH, borderRadius: 22, background: "#0a0a0b" }}>
        <div style={{ position: "absolute", left: BZ, top: BZ, width: SW, height: SH, borderRadius: 6, overflow: "hidden", background: "#000" }}>
          <div style={{ width: PW, height: PH, transform: `scale(${SW / PW})`, transformOrigin: "0 0" }}><Site f={f} /></div>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0.0) ${20 + (f * 0.1) % 30}%, rgba(255,255,255,0.10) ${32 + (f * 0.1) % 30}%, rgba(255,255,255,0.0) ${44 + (f * 0.1) % 30}%)` }} />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════ captions
function Caption({ f, cap }) {
  if (f < cap.from - 2 || f > cap.to + 2) return null; // the first caption is already up on frame 0 (thumbnail)
  const exit = interpolate(f, [cap.to - 6, cap.to], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, opacity: 1 - exit, transform: `translateY(${-exit * 30}px)` }}>
      {cap.lines.map((line, i) => {
        const s = sp(f, cap.from + i * 6, { damping: 12, stiffness: 200 });
        const parts = line.split("^");
        return (
          <div key={i} style={{ marginTop: i ? -14 : 0, transform: `scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 30}px)`, opacity: Math.min(1, s * 1.6), zIndex: i,
            background: "rgba(16,16,20,0.9)", borderRadius: 22, padding: "10px 30px 16px", fontFamily: POP, fontWeight: 700, fontSize: 88, lineHeight: 1.12, letterSpacing: "-0.02em", color: "#fff", whiteSpace: "nowrap" }}>
            {parts.map((p, j) => j % 2 === 1 ? <Hi key={j} f={f} start={cap.from + i * 6 + 9}>{p}</Hi> : <span key={j}>{p}</span>)}
          </div>
        );
      })}
    </div>
  );
}
function Hi({ f, start, children }) {
  const p = after(f, start, [0, 9], [0, 1], { easing: easeOut });
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 12px", margin: "0 -4px" }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: 10, bottom: 6, borderRadius: 14, background: `linear-gradient(135deg, ${A.hi}, ${A.violet})`, transform: `scaleX(${p})`, transformOrigin: "0 50%" }} />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
}

// ════════════════════════════════════ Appify end card
function Star({ size, color = A.violet, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={style}><path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={color} /></svg>;
}
function EndCard({ f }) {
  const t = f - T.endCard;
  if (t < 0) return null;
  const logo = sp(f, T.endCard + 8, { damping: 11, stiffness: 170 });
  const star = sp(f, T.endCard + 16, { damping: 8, stiffness: 160 });
  const l2 = after(f, T.endCard + 20, [0, 14], [0, 1], { easing: easeOut });
  const pills = ["Websites", "Apps", "Motion ads"];
  const cta = sp(f, T.endCard + 40, { damping: 12, stiffness: 180 });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block", fontFamily: POP, fontWeight: 700, fontSize: 190, letterSpacing: "-0.035em", color: "#fff", transform: `scale(${0.6 + 0.4 * logo})`, opacity: Math.min(1, logo * 1.5) }}>
          appify
          <Star size={60} style={{ position: "absolute", left: 300, top: 6, transform: `scale(${star}) rotate(${(1 - star) * 90}deg)` }} />
        </div>
        <div style={{ marginTop: 4, fontFamily: POP, fontWeight: 600, fontSize: 52, color: "#fff", opacity: l2, transform: `translateY(${(1 - l2) * 20}px)` }}>Ideas, <span style={{ color: A.violet }}>appified.</span></div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 50 }}>
          {pills.map((p, i) => {
            const s = sp(f, T.endCard + 26 + i * 4, { damping: 12, stiffness: 200 });
            return <div key={p} style={{ padding: "16px 30px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.06)", color: "#fff", fontFamily: POP, fontWeight: 600, fontSize: 38, transform: `scale(${s})` }}>{p}</div>;
          })}
        </div>
        <div style={{ display: "inline-block", marginTop: 56, padding: "24px 52px", borderRadius: 999, background: `linear-gradient(135deg, ${A.hi}, ${A.violet})`, color: "#fff", fontFamily: POP, fontWeight: 700, fontSize: 52, transform: `scale(${cta})`, boxShadow: "0 20px 60px rgba(91,108,255,0.45)" }}>
          DM “SCALE”
        </div>
        <div style={{ marginTop: 30, fontFamily: POP, fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.75)", opacity: after(f, T.endCard + 48, [0, 10], [0, 1]) }}>@appifylb</div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════ assembly
export const Main = () => {
  useFonts([
    [POP, "poppins-latin-700-normal.woff2", { weight: "700" }],
    [POP, "poppins-latin-600-normal.woff2", { weight: "600" }],
    [SERIF, "instrument-serif-latin-400-normal.woff2", { style: "normal" }],
    [SERIF, "instrument-serif-latin-400-italic.woff2", { style: "italic" }],
    [SANS, "inter-latin-400-normal.woff2", { weight: "400" }],
    [SANS, "inter-latin-600-normal.woff2", { weight: "600" }],
    ["Mono", "GeistMono-500.ttf"],
  ]);
  const f = useCurrentFrame();
  const t = f / 30;
  const intro = sp(f, -8, { damping: 18, stiffness: 50 });
  const endP = interpolate(f, [T.endCard, T.endCard + 22], [0, 1], { ...clamp, easing: inOut });
  // camera: slow orbit around the monitor, leaning in on the details
  const yaw = Math.sin(t * 0.45) * 4 * (1 - endP);
  const pitch = 3 + Math.sin(t * 0.3) * 1.5;
  const lean = interpolate(f, [86, 100, 150, 160, 178, 192, 232, 240], [0, 0.03, 0.03, 0, 0, 0.035, 0.035, 0], clamp);
  const scale = (0.95 + 0.04 * intro + interpolate(f, [0, T.endCard], [0, 0.02], clamp) + lean) * (1 - endP * 0.48);
  const camY = -endP * 560 + Math.sin(t * 0.7) * 6;
  return (
    <AbsoluteFill style={{ background: "#07060f" }}>
      <Audio src={staticFile("sound.wav")} />
      <Studio f={f} />
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: "50% 45%" }}>
        <AbsoluteFill style={{ transform: `translateY(${camY}px) scale(${scale}) rotateY(${yaw}deg) rotateX(${pitch}deg)`, transformOrigin: `540px ${MY + MH / 2}px`, transformStyle: "preserve-3d" }}>
          <Monitor f={f} />
        </AbsoluteFill>
      </AbsoluteFill>
      {CAPTIONS.map((c, i) => <Caption key={i} f={f} cap={c} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1700, textAlign: "center", opacity: interpolate(f, [-1, 0, T.endCard - 6, T.endCard], [1, 1, 1, 0], clamp) }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 30px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.16)", color: "#fff", fontFamily: POP, fontWeight: 600, fontSize: 38 }}>
          <Star size={28} /> @appifylb
        </div>
        <div style={{ marginTop: 20, fontFamily: POP, fontWeight: 600, fontSize: 24, letterSpacing: "0.34em", color: "rgba(255,255,255,0.55)" }}>WEBSITE BY APPIFY</div>
      </div>
      <EndCard f={f} />
      <Grain f={f} opacity={0.05} />
    </AbsoluteFill>
  );
};
