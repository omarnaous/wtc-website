// Appify — website showcase Reel. A studio monitor in a designed, lit studio; on screen a high-end editorial
// concept for WTC, scrolling through motion-graphic sections; boxed captions; Appify end card.
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { SCROLL, ARRIVE, T, CAPTIONS } from "./timing.js";
import { useFonts, clamp, easeOut, after, Grain } from "./fx.jsx";

const A = { navy: "#120c3a", violet: "#7b6cff", blue: "#4f7dff", hi: "#4d78ff" }; // Appify
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

// ════════════════════════════════════ the website: the launch film, as a site you can use (1600 × 900 per screen)
const PW = 1600, PH = 900;
const L = { ink: "#09090a", line: "#26262c", chalk: "#f4f3f0", mute: "#8d8d95", gold: "#c9a227", goldSoft: "#e2c469" };
const GROT = "Grotesk";
const PLANETS = [
  { sku: "SO33J100", word: "SUN", bg: "#F2C230", fg: "#1A1300" },
  { sku: "SO33R100", word: "MARS", bg: "#D42A22", fg: "#FFF6F2" },
  { sku: "SO33N100", word: "NEPTUNE", bg: "#132D69", fg: "#EAF0FF" },
  { sku: "SO33L100", word: "URANUS", bg: "#9ED5E1", fg: "#0B2530" },
  { sku: "SO33P100", word: "VENUS", bg: "#E8B6BE", fg: "#3A1018" },
  { sku: "SO33P700", word: "PINK MOON", bg: "#E23E86", fg: "#FFF0F6" },
];
const ORBIT = ["SO33W700", "SO33R100", "SO33J100", "SO33N700", "SO33P700", "SO33L100", "SO33C100", "SO33G100", "SO33P100", "SO33B700", "SO33M700", "SO33N100"];
const WALL = ["SO33M100", "SO33R100", "SO33J100", "SO33N700", "SO33P700", "SO33L100", "SO33W700", "SO33C100", "SO33G100", "SO33P100", "SO33B700", "SO33M700", "SO33N100"];
const STRAPS = [
  { file: "vertech-black", chip: "#151515", tint: "#1b1b1f", name: "black" },
  { file: "vertech-white", chip: "#F2F2F0", tint: "#3a3a40", name: "white" },
  { file: "vertech-capri-blue", chip: "#4FB3E8", tint: "#0f3550", name: "capri blue" },
  { file: "vertech-black-and-red-stitches", chip: "#1A1A1A", ring: "#D3262B", tint: "#3a1214", name: "black · red stitch" },
  { file: "vertech-orange", chip: "#F26B1D", tint: "#5a2408", name: "orange" },
];
const shakeAt = (f, s, amp) => { const t = f - s; if (t < 0 || t > 20) return [0, 0]; const k = amp * Math.exp(-t / 4); return [(random(`x${f}`) - 0.5) * 2 * k, (random(`y${f}`) - 0.5) * 2 * k]; };

function Site({ f }) {
  const [scroll] = keyed(f, SCROLL);
  const [prev] = keyed(f - 1, SCROLL);
  const skew = Math.max(-2, Math.min(2, (scroll - prev) * 0.03));
  const [mx, my] = keyed(f, CURSOR, Easing.bezier(0.45, 0, 0.2, 1));
  // missions: which name is hovered
  let pi = -1; T.hovers.forEach((h, i) => { if (f >= h) pi = i; });
  const pl = PLANETS[Math.max(0, pi)];
  const pHit = pi < 0 ? 0 : f - T.hovers[pi];
  // strap
  let k = 0; T.swaps.forEach((s, i) => { if (f >= s) k = i + 1; });
  const strap = STRAPS[k], prevStrap = STRAPS[Math.max(0, k - 1)];
  const lastSwap = k > 0 ? T.swaps[k - 1] : 0;
  const wipe = k === 0 ? 1 : interpolate(f - lastSwap, [0, 6], [0, 1], { ...clamp, easing: easeOut });
  // hero: the hand draws the ring, the Moon lands
  const hand = interpolate(f, [-20, -6], [0, 360], { ...clamp, easing: inOut });
  const slam = f < -6 ? 0 : interpolate(spring({ frame: f + 6, fps: 30, config: { damping: 12, stiffness: 200 } }), [0, 1], [1.5, 1]);
  const [hx, hy] = shakeAt(f, -6, 14);
  // orbit: dragged by the cursor
  const drag = interpolate(f, [ARRIVE.orbit + 20, ARRIVE.orbit + 60], [0, 1], { ...clamp, easing: inOut });
  const orbitRot = (f - ARRIVE.orbit) * 0.012 + drag * 2.4;
  const cnt = Math.round(interpolate(f, [ARRIVE.orbit, ARRIVE.orbit + 34], [0, 32], { ...clamp, easing: Easing.out(Easing.cubic) }));
  // wall: the light follows the cursor
  const wallY = 3600;
  return (
    <div style={{ width: PW, height: PH, position: "relative", overflow: "hidden", background: L.ink, fontFamily: SANS, color: L.chalk }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -scroll, transform: `skewY(${skew}deg)`, transformOrigin: `50% ${scroll + PH / 2}px` }}>
        {/* ─── 1. hero: tick ring + the Moon */}
        <section style={{ position: "absolute", top: 0, left: 0, width: PW, height: 900, overflow: "hidden", background: `radial-gradient(circle at 66% 50%, rgba(201,162,39,0.30), transparent 50%), ${L.ink}` }}>
          <svg width="900" height="900" viewBox="-450 -450 900 900" style={{ position: "absolute", left: 1060 - 450, top: 0 + scroll * 0.2, transform: `rotate(${f * 0.3}deg)` }}>
            {Array.from({ length: 60 }, (_, i) => {
              if (i * 6 > hand) return null;
              const a = ((i * 6 - 90) * Math.PI) / 180, big = i % 5 === 0, r0 = big ? 340 : 360;
              return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * 380} y2={Math.sin(a) * 380} stroke={big ? L.gold : L.chalk} strokeWidth={big ? 5 : 2} strokeOpacity={big ? 0.9 : 0.45} strokeLinecap="round" />;
            })}
            <circle r="400" fill="none" stroke={L.gold} strokeOpacity="0.25" strokeWidth="1.5" />
          </svg>
          <div style={{ position: "absolute", inset: 0, transform: `translate(${hx}px, ${hy}px)` }}>
            <Img src={watch("SO33M100")} style={{ position: "absolute", left: 1060 - 520 * AR, top: -70 + scroll * 0.4, height: 1040, transform: `scale(${slam}) rotate(${(slam - 1) * -14 + Math.sin(f / 40) * 1.5}deg)`, filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.7))" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #09090a 0%, rgba(9,9,10,0.85) 30%, transparent 55%)" }} />
          <div style={{ position: "absolute", left: 80, right: 80, top: 34, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: SERIF, fontSize: 34, letterSpacing: "0.05em" }}>WTC</span>
            <span style={{ display: "flex", gap: 40, fontSize: 14, color: L.mute }}>{["Missions", "Collection", "Strap Studio", "Journal"].map((n) => <span key={n}>{n}</span>)}</span>
            <span style={{ fontSize: 14, padding: "10px 20px", borderRadius: 99, border: `1px solid ${L.line}` }}>Bag</span>
          </div>
          <div style={{ position: "absolute", left: 80, top: 250 }}>
            <Label style={{ color: L.goldSoft }}>Omega × Swatch · 32 watches</Label>
            <div style={{ marginTop: 24, fontFamily: GROT, fontWeight: 700, fontSize: 132, lineHeight: 0.92, letterSpacing: "-0.045em", textTransform: "uppercase" }}>
              <div><Reveal f={f} start={-14} text="Every watch," /></div>
            </div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 140, lineHeight: 1, color: L.goldSoft }}><Reveal f={f} start={-8} text="one insider." /></div>
            <div style={{ marginTop: 44, display: "flex", gap: 14, ...fade(f, -2) }}>
              <div style={{ padding: "20px 34px", borderRadius: 99, background: f >= 46 && f < 66 ? L.goldSoft : L.chalk, color: L.ink, fontSize: 17, fontWeight: 600 }}>Shop the collection</div>
              <div style={{ padding: "20px 34px", borderRadius: 99, border: `1px solid ${L.line}`, fontSize: 17 }}>Try the Strap Studio</div>
            </div>
          </div>
        </section>
        {/* ─── 2. missions: hover a name, the room takes its colour */}
        <section style={{ position: "absolute", top: 900, left: 0, width: PW, height: 900, overflow: "hidden", background: pi < 0 ? "#111114" : pl.bg }}>
          {pi >= 0 && <div style={{ position: "absolute", inset: 0, background: pl.bg, clipPath: `circle(${interpolate(pHit, [0, 7], [0, 160], { ...clamp, easing: easeOut })}% at ${mx}px ${my - 900 + scroll}px)` }} />}
          {pi >= 0 && (() => {
            const inP = interpolate(pHit, [0, 6], [0, 1], { ...clamp, easing: easeOut });
            const size = Math.min(1080 / (pl.word.length * 0.6), 460);
            return (
              <>
                <div style={{ position: "absolute", left: 470, right: 0, top: 450 - size * 0.55, textAlign: "center", whiteSpace: "nowrap", fontFamily: GROT, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: "-0.05em", color: pl.fg, opacity: 0.9,
                  transform: `translateX(${(1 - inP) * -200 - pHit * 2}px)`, WebkitTextStroke: pi % 2 ? `4px ${pl.fg}` : "none", ...(pi % 2 ? { color: "transparent" } : {}) }}>{pl.word}</div>
                <Img src={watch(pl.sku)} style={{ position: "absolute", height: 1100, left: 1030 - 550 * AR, top: -100, transform: `translateX(${(1 - inP) * 500}px) rotate(${(1 - inP) * 16 + pHit * 0.2}deg)`, filter: `blur(${(1 - inP) * 16}px) drop-shadow(0 30px 50px rgba(0,0,0,0.4))` }} />
              </>
            );
          })()}
          <div style={{ position: "absolute", left: 80, top: 120 }}>
            <Label style={{ color: pi < 0 ? L.goldSoft : pl.fg, opacity: 0.85 }}>The missions — hover one</Label>
            <div style={{ marginTop: 30 }}>
              {PLANETS.map((p, i) => {
                const on = i === pi;
                const r = after(f, ARRIVE.missions - 4 + i * 2, [0, 14], [0, 1], { easing: easeOut });
                return <div key={p.word} style={{ fontFamily: GROT, fontWeight: 700, fontSize: 62, lineHeight: 1.08, letterSpacing: "-0.03em", textTransform: "uppercase",
                  color: pi < 0 ? L.chalk : pl.fg, opacity: r * (pi < 0 || on ? 1 : 0.35), transform: `translateX(${(1 - r) * -60 + (on ? 24 : 0)}px)` }}>
                  {on ? "→ " : ""}{p.word}
                </div>;
              })}
            </div>
          </div>
        </section>
        {/* ─── 3. orbit: drag to spin */}
        <section style={{ position: "absolute", top: 1800, left: 0, width: PW, height: 900, overflow: "hidden", background: `radial-gradient(ellipse at 50% 45%, rgba(201,162,39,0.28), transparent 50%), ${L.ink}` }}>
          {(() => {
            const open = sp(f, ARRIVE.orbit - 6, { damping: 14, stiffness: 90 });
            const rx = 640 * open, ry = 170 * open, cxo = 800, cyo = 470;
            const items = ORBIT.map((sku, i) => { const a = orbitRot + (i / ORBIT.length) * Math.PI * 2, z = Math.sin(a); return { sku, x: cxo + Math.cos(a) * rx, y: cyo + z * ry, z, s: 0.55 + 0.45 * (z + 1) / 2 }; }).sort((a, b) => a.z - b.z);
            const draw = (it) => <Img key={it.sku} src={watch(it.sku)} style={{ position: "absolute", height: 330 * it.s, left: it.x - (330 * it.s * AR) / 2, top: it.y - 165 * it.s, filter: `brightness(${0.45 + 0.55 * it.s})` }} />;
            const land = f < ARRIVE.orbit + 34 ? 1 : interpolate(spring({ frame: f - ARRIVE.orbit - 34, fps: 30, config: { damping: 9, stiffness: 200 } }), [0, 1], [1.2, 1]);
            return (
              <>
                <svg width={PW} height="900" style={{ position: "absolute", inset: 0 }}><ellipse cx={cxo} cy={cyo} rx={Math.max(1, rx)} ry={Math.max(1, ry)} fill="none" stroke={L.gold} strokeOpacity="0.35" strokeDasharray="3 9" /></svg>
                {items.filter((i) => i.z < 0).map(draw)}
                <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", transform: `scale(${land})` }}>
                  <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 260, lineHeight: 1, letterSpacing: "-0.06em", textShadow: "0 0 40px #000" }}>{cnt}</div>
                  <Label style={{ color: L.goldSoft, textShadow: "0 0 12px #000" }}>watches · one collection</Label>
                </div>
                {items.filter((i) => i.z >= 0).map(draw)}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 54 }}>
                  <Reveal f={f} start={ARRIVE.orbit + 10} text="Checked in hand." style={{ justifyContent: "center" }} />{" "}
                  <span style={{ color: L.goldSoft }}><Reveal f={f} start={ARRIVE.orbit + 18} text="Shipped complete." /></span>
                </div>
                <Label style={{ position: "absolute", right: 80, top: 60, color: L.mute, opacity: interpolate(drag, [0, 0.2, 0.8, 1], [1, 1, 1, 0.4]) }}>← drag to spin →</Label>
              </>
            );
          })()}
        </section>
        {/* ─── 4. strap studio */}
        <section style={{ position: "absolute", top: 2700, left: 0, width: PW, height: 900, overflow: "hidden", background: L.ink }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 70% 50%, ${strap.tint}, ${L.ink} 70%)` }} />
          <div style={{ position: "absolute", left: 1120 - 250, top: 30, width: 500, height: 840, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)", transform: `scale(${k > 0 ? interpolate(f - lastSwap, [0, 2, 8], [1.03, 1.03, 1], clamp) : 1})` }}>
            {k > 0 && <Img src={staticFile(`s/${prevStrap.file}.png`)} style={{ position: "absolute", height: 840, left: 250 - 420 * 0.558, top: 0 }} />}
            <Img src={staticFile(`s/${strap.file}.png`)} style={{ position: "absolute", height: 840, left: 250 - 420 * 0.558, top: 0, clipPath: `inset(0 0 ${(1 - wipe) * 100}% 0)` }} />
            {k > 0 && wipe < 1 && <div style={{ position: "absolute", left: 40, right: 40, top: wipe * 840 - 2, height: 4, background: L.goldSoft, boxShadow: `0 0 24px 6px ${L.gold}88` }} />}
          </div>
          <div style={{ position: "absolute", left: 100, top: 230 }}>
            <Label style={{ color: L.goldSoft }}>Strap Studio</Label>
            <div style={{ marginTop: 20, fontFamily: GROT, fontWeight: 700, fontSize: 120, lineHeight: 0.95, letterSpacing: "-0.045em", textTransform: "uppercase" }}><Reveal f={f} start={ARRIVE.strap - 2} text="Try it on" /></div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 116, color: L.goldSoft, lineHeight: 1.05 }}><Reveal f={f} start={ARRIVE.strap + 4} text="before you buy." /></div>
            <div style={{ display: "flex", gap: 18, marginTop: 50 }}>
              {STRAPS.map((s, j) => <div key={j} style={{ width: 56, height: 56, borderRadius: 99, background: s.chip, boxShadow: `0 0 0 ${s.ring ? 4 : 1.5}px ${s.ring || "rgba(255,255,255,0.2)"}${j === k ? `, 0 0 0 10px ${L.ink}, 0 0 0 12px ${L.gold}` : ""}`, transform: `scale(${j === k ? 1.08 : 1})` }} />)}
            </div>
            <Label style={{ marginTop: 26, color: L.mute }}>{strap.name}</Label>
          </div>
        </section>
        {/* ─── 5. the wall: the light follows you */}
        <section style={{ position: "absolute", top: wallY, left: 0, width: PW, height: 900, overflow: "hidden", background: L.ink }}>
          <div style={{ position: "absolute", left: -120, top: -80, width: PW + 240, transform: "rotate(-6deg)", display: "flex", flexWrap: "wrap", gap: 18 }}>
            {Array.from({ length: 30 }, (_, i) => {
              const sku = WALL[i % WALL.length];
              const col = i % 10, row = Math.floor(i / 10);
              const x = col * 182 - 30, y = row * 330 + 100;
              const d = Math.hypot(x - mx, y - (my - wallY + scroll));
              const lit = Math.max(0, 1 - d / 420);
              const a = after(f, ARRIVE.wall - 6 + Math.hypot(col - 4.5, row - 1) * 1.5, [0, 12], [0, 1], { easing: easeOut });
              return <Img key={i} src={watch(sku)} style={{ width: 164, height: 278, objectFit: "contain", opacity: a, transform: `translateY(${(1 - a) * 50}px) scale(${1 + lit * 0.08})`, filter: `brightness(${0.4 + lit * 0.9})` }} />;
            })}
          </div>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle 360px at ${mx}px ${my - wallY + scroll}px, rgba(226,196,105,0.22), transparent 70%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(9,9,10,0.85) 0%, rgba(9,9,10,0.5) 34%, transparent 62%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center" }}>
            <div style={{ fontFamily: GROT, fontWeight: 700, fontSize: 110, letterSpacing: "-0.045em", textTransform: "uppercase", lineHeight: 1 }}><Reveal f={f} start={ARRIVE.wall} text="The whole collection." style={{ justifyContent: "center" }} /></div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 104, color: L.goldSoft }}><Reveal f={f} start={ARRIVE.wall + 6} text="One place." style={{ justifyContent: "center" }} /></div>
            <div style={{ display: "inline-block", marginTop: 30, padding: "22px 44px", borderRadius: 99, background: f >= T.ctaClick ? L.goldSoft : L.gold, color: L.ink, fontFamily: GROT, fontWeight: 700, fontSize: 22, letterSpacing: "0.04em", textTransform: "uppercase",
              transform: `scale(${(f >= T.ctaClick && f < T.ctaClick + 4 ? 0.94 : 1) * (0.8 + 0.2 * sp(f, ARRIVE.wall + 12))})`, opacity: sp(f, ARRIVE.wall + 12) }}>Order now →</div>
          </div>
        </section>
      </div>
      <div style={{ position: "absolute", right: 14, top: 120, bottom: 120, width: 2, background: "rgba(255,255,255,0.08)" }}><div style={{ position: "absolute", left: 0, top: `${(scroll / 3600) * 80}%`, width: 2, height: "20%", background: L.gold }} /></div>
      <Cursor f={f} x={mx} y={my} />
    </div>
  );
}

const CURSOR = [
  [0, 1300, 760], [36, 280, 640], [64, 300, 600], [76, 360, 300],
  ...[0, 1, 2, 3, 4, 5].map((i) => [T.hovers[i], 200 + i * 6, 170 + i * 67 + 34]),
  [160, 300, 500], [ARRIVE.orbit + 20, 420, 520], [ARRIVE.orbit + 60, 1180, 520], [ARRIVE.orbit + 66, 1200, 520],
  ...T.swaps.map((s, j) => [s - 2, 100 + (j + 1) * 74 + 28, 584]),
  [330, 900, 420], [344, 500, 300], [T.ctaClick - 2, 800, 610], [450, 810, 615],
];
const CLICKS = [...T.swaps, T.ctaClick];
function Cursor({ f, x, y }) {
  const press = CLICKS.some((c) => f >= c && f < c + 4);
  const grab = f >= ARRIVE.orbit + 20 && f < ARRIVE.orbit + 62;
  return (
    <>
      {CLICKS.map((c) => f >= c && f < c + 16 && <div key={c} style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 99, border: `2px solid ${L.goldSoft}`, transform: `scale(${interpolate(f - c, [0, 16], [0.3, 1.6], clamp)})`, opacity: interpolate(f - c, [0, 16], [1, 0], clamp) }} />)}
      {grab
        ? <div style={{ position: "absolute", left: x - 20, top: y - 20, width: 40, height: 40, borderRadius: 99, background: "rgba(226,196,105,0.25)", border: `2px solid ${L.goldSoft}` }} />
        : <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: "absolute", left: x - 4, top: y - 2, transform: `scale(${press ? 0.85 : 1})`, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.6))" }}><path d="M4 2l15 11-7 1-4 7z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" /></svg>}
    </>
  );
}

// ════════════════════════════════════ the desk: a real photo; the site is mapped onto its monitor
// Photo 1746 × 2576, scaled to cover 1080 × 1920 (× 0.7453), aligned left so the whole screen stays in frame.
// Screen corners found in the photo (TL 26,682 · TR 1143,738 · BR 1148,1318 · BL 104,1491) give this homography
// from the 1600 × 900 site onto the screen, in frame pixels.
const SCREEN_MATRIX = "matrix3d(0.741358231, 0.168790567, 0, 0.000259431861, 0.0704474376, 0.753864745, 0, 7.54837916e-05, 0, 0, 1, 0, 19.3788815, 508.322968, 0, 1)";
const SCR = { cx: 451, cy: 788 };
// What colour the screen is throwing onto the desk, section by section.
function spill(f) {
  let pi = -1; T.hovers.forEach((h, i) => { if (f >= h) pi = i; });
  const [y] = keyed(f, SCROLL);
  if (y < 450) return "rgba(201,162,39,0.35)";
  if (y < 1350) return pi < 0 ? "rgba(120,120,140,0.2)" : PLANETS[pi].bg;
  if (y < 2250) return "rgba(201,162,39,0.35)";
  if (y < 3150) { let k = 0; T.swaps.forEach((s, i) => { if (f >= s) k = i + 1; }); return STRAPS[k].chip; }
  return "rgba(226,196,105,0.4)";
}
function Desk({ f }) {
  const glow = spill(f);
  return (
    <AbsoluteFill>
      <Img src={staticFile("desk.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 1746 * (1920 / 2576), height: 1920 }} />
      {/* the site, on the screen */}
      <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: PH, transformOrigin: "0 0", transform: SCREEN_MATRIX, overflow: "hidden", background: "#000" }}>
        <div style={{ filter: "brightness(0.94) contrast(0.97) saturate(0.95)" }}><Site f={f} /></div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 28%, transparent 42%, transparent 75%, rgba(150,190,255,0.06) 100%)" }} />
      </div>
      {/* the screen's light on the stand and the desk */}
      <div style={{ position: "absolute", left: -140, top: 1020, width: 1100, height: 520, borderRadius: "50%", background: `radial-gradient(ellipse at 50% 30%, ${glow}, transparent 65%)`, mixBlendMode: "screen", opacity: 0.4 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 42%, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
    </AbsoluteFill>
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
    ["Grotesk", "space-grotesk-latin-700-normal.woff2", { weight: "700" }],
    [SERIF, "instrument-serif-latin-400-normal.woff2", { style: "normal" }],
    [SERIF, "instrument-serif-latin-400-italic.woff2", { style: "italic" }],
    [SANS, "inter-latin-400-normal.woff2", { weight: "400" }],
    [SANS, "inter-latin-600-normal.woff2", { weight: "600" }],
    ["Mono", "GeistMono-500.ttf"],
  ]);
  const f = useCurrentFrame();
  const t = f / 30;
  const endP = interpolate(f, [T.endCard - 2, T.endCard + 16], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 1, 0.45) });
  // a slow handheld-ish push toward the screen; then straight through it into the end card
  const push = 1.12 + interpolate(f, [0, T.endCard], [0, 0.07], clamp) + Math.sin(t * 0.6) * 0.004;
  const scale = push * (1 + endP * 2.2);
  const tx = 52 + Math.sin(t * 0.37) * 4, ty = Math.cos(t * 0.45) * 4;
  return (
    <AbsoluteFill style={{ background: "#0b0d12" }}>
      <Audio src={staticFile("sound.wav")} />
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: `${SCR.cx}px ${SCR.cy}px` }}>
        <Desk f={f} />
      </AbsoluteFill>
      <EndCardBackdrop f={f} />
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

// Navy that the camera flies into for the end card.
function EndCardBackdrop({ f }) {
  const o = interpolate(f, [T.endCard + 4, T.endCard + 16], [0, 1], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o, background: `radial-gradient(ellipse at 50% 55%, #2a1d78 0%, ${A.navy} 55%, #07051a 100%)` }} />;
}
