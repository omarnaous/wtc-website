// Appify — website showcase Reel. A laptop on a desk by a window; the WTC shop scrolls section by section,
// every section revealing as it arrives; captions in boxed type with one highlighted word; Appify end card.
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { SCROLL, ARRIVE, T, CAPTIONS } from "./timing.js";
import { useFonts, clamp, easeOut, after } from "./fx.jsx";

const C = { ink: "#09090a", line: "#26262c", chalk: "#f4f3f0", mute: "#8d8d95", gold: "#c9a227", goldSoft: "#e2c469" };
const A = { navy: "#120c3a", violet: "#7b6cff", blue: "#4f7dff", hi: "#4d78ff" }; // Appify
const POP = "Poppins", DISPLAY = "Grotesk", SERIF = "Serif", SANS = "Inter";
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const watch = (sku) => staticFile(`w/${sku}.png`);
const AR = 0.59;
const sp = (f, start, cfg = { damping: 14, stiffness: 160 }) => (f < start ? 0 : spring({ frame: f - start, fps: 30, config: cfg }));

// piecewise keyframes with eased segments
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

// ════════════════════════════════════ the website (1280 × 800, as on a laptop)
const PW = 1280, PH = 800, CHROME = 40, NAV = 56, VIEW = PH - CHROME;
const BEST = [
  { sku: "SO33W700", name: "Mission to the Moonphase", sub: "Full Moon" },
  { sku: "SO33M100", name: "Mission to the Moon", sub: "Omega × Swatch" },
  { sku: "SO33B700", name: "Mission to the Moonphase", sub: "New Moon" },
  { sku: "SO33N700", name: "Super Blue Moonphase", sub: "Omega × Swatch" },
];
const ALL8 = ["SO33M100", "SO33R100", "SO33J100", "SO33L100", "SO33P100", "SO33C100", "SO33G100", "SO33M700"];
const MOON4 = ["SO33W700", "SO33B700", "SO33N700", "SO33P700"];
const STRAPS = [
  { file: "vertech-black", chip: "#151515" },
  { file: "vertech-orange", chip: "#F26B1D" },
  { file: "vertech-capri-blue", chip: "#4FB3E8" },
  { file: "vertech-white", chip: "#F2F2F0" },
  { file: "vertech-black-and-red-stitches", chip: "#1A1A1A", ring: "#D3262B" },
];
const CARD_W = 260, CARD_GAP = 24, CARD_X0 = (PW - (4 * CARD_W + 3 * CARD_GAP)) / 2, CARD_TOP = 760 + 200, CARD_H = 440;
const GRID_TOP = 2360 + 200, G_W = 250, G_H = 250, G_GAP = 16, G_X0 = (PW - (4 * G_W + 3 * G_GAP)) / 2;
const CHIPS = [["All", 64], ["Moonphase", 126], ["Missions", 112], ["Earthphase", 128]];
const chipX = (i) => 110 + CHIPS.slice(0, i).reduce((s, c) => s + c[1] + 10, 0);

// Cursor path in viewport coords (x, y from the top of the browser window).
const CURSOR = [
  [0, 980, 640], [44, 700, 560], [62, 560, 600], [96, 720, 520],
  [T.cardHover, CARD_X0 + 1 * (CARD_W + CARD_GAP) + 150, CARD_TOP + CARD_H - 40 - 760 + CHROME + 6],
  [T.cardClick + 14, CARD_X0 + 1 * (CARD_W + CARD_GAP) + 160, CARD_TOP + CARD_H - 40 - 760 + CHROME + 10],
  [172, 96 + 1 * 56 + 22, 540 + CHROME + 22], [T.swaps[1] - 2, 96 + 2 * 56 + 22, 540 + CHROME + 22],
  [T.swaps[2] - 2, 96 + 3 * 56 + 22, 540 + CHROME + 22], [T.swaps[3] - 2, 96 + 4 * 56 + 22, 540 + CHROME + 22],
  [270, 600, 300], [T.chipClick - 2, chipX(1) + 60, 150 + CHROME + 18], [330, 760, 520], [356, 640, 470 + CHROME], [450, 660, 480 + CHROME],
];
const CLICKS = [T.cardClick, ...T.swaps.slice(1), T.chipClick, 358];

const Eyebrow = ({ children, style }) => <div style={{ fontFamily: "Mono", fontSize: 12, letterSpacing: "0.28em", color: C.goldSoft, textTransform: "uppercase", ...style }}>{children}</div>;
const rise = (f, start, dist = 40) => { const p = after(f, start, [0, 16], [0, 1], { easing: easeOut }); return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` }; };

function Page({ f }) {
  const [scroll] = keyed(f, SCROLL);
  const [prev] = keyed(f - 1, SCROLL);
  const vblur = Math.min(2.5, Math.abs(scroll - prev) * 0.035);
  const [cx, cy] = keyed(f, CURSOR, Easing.bezier(0.45, 0, 0.2, 1));
  const added = f >= T.cardClick;
  const badge = sp(f, T.cardClick, { damping: 8, stiffness: 220 });
  const toast = sp(f, T.cardClick + 3) * (1 - after(f, T.cardClick + 40, [0, 10], [0, 1]));
  const hover = f >= T.cardHover - 4 && f < 150;
  const pressing = CLICKS.some((c) => f >= c && f < c + 4);
  // strap studio
  let k = 0; T.swaps.forEach((s, i) => { if (f >= s) k = i + 1; });
  const strap = STRAPS[k], prevStrap = STRAPS[Math.max(0, k - 1)];
  const lastSwap = k > 0 ? T.swaps[k - 1] : 0;
  const wipe = k === 0 ? 1 : interpolate(f - lastSwap, [0, 6], [0, 1], { ...clamp, easing: easeOut });
  // grid filter
  const filtered = f >= T.chipClick;
  const out = after(f, T.chipClick, [0, 6], [0, 1]);
  return (
    <div style={{ width: PW, height: PH, background: C.ink, position: "relative", overflow: "hidden", fontFamily: SANS, color: C.chalk }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: CHROME, height: VIEW, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -scroll, filter: vblur > 0.3 ? `blur(${vblur}px)` : "none" }}>
          {/* ── hero */}
          <div style={{ position: "absolute", left: 0, top: 0, width: PW, height: 760, overflow: "hidden", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 72% 45%, #1d1b16 0%, #0b0b0c 60%)" }} />
            <Img src={watch("SO33M100")} style={{ position: "absolute", right: 70, top: -80 + scroll * 0.35, height: 980, transform: `rotate(${-10 + f * 0.04}deg) scale(${1.06 - after(f, 0, [0, 40], [0, 0.06], { easing: easeOut })})` }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #09090a 0%, rgba(9,9,10,0.9) 32%, rgba(9,9,10,0.35) 55%, transparent 72%)" }} />
            <div style={{ position: "absolute", left: 80, bottom: 70, width: 700 }}>
              <Eyebrow style={rise(f, -14, 20)}>Watch Trade Chronicles</Eyebrow>
              <div style={{ marginTop: 18, fontFamily: DISPLAY, fontWeight: 700, fontSize: 86, lineHeight: 0.96, letterSpacing: "-0.03em" }}>
                <div style={rise(f, -12, 60)}>Every watch,</div>
                <div style={{ ...rise(f, -8, 60), fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", color: C.goldSoft }}>one insider.</div>
              </div>
              <div style={{ ...rise(f, -4, 20), marginTop: 22, fontSize: 16, lineHeight: 1.6, color: C.mute, width: 440 }}>Carefully sourced watches, checked in hand and shipped complete — with everything they came with.</div>
              <div style={{ ...rise(f, 0, 20), marginTop: 30, display: "flex", gap: 12 }}>
                <div style={{ borderRadius: 999, background: f > 52 && f < 66 ? C.goldSoft : C.chalk, color: C.ink, padding: "15px 28px", fontSize: 14, fontWeight: 600 }}>Shop the collection</div>
                <div style={{ borderRadius: 999, border: `1px solid ${C.line}`, padding: "15px 28px", fontSize: 14 }}>Try the Strap Studio</div>
              </div>
              <div style={{ ...rise(f, 24, 20), marginTop: 44, paddingTop: 24, borderTop: `1px solid ${C.line}`, display: "flex", gap: 60 }}>
                {[[200, "+", "Satisfied customers"], [26, "", "Items in stock"], [100, "%", "Carefully selected"]].map(([v, s, l]) => (
                  <div key={l}><div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 30 }}>{Math.round(interpolate(f, [24, 54], [0, v], { ...clamp, easing: Easing.out(Easing.cubic) }))}{s}</div>
                    <div style={{ marginTop: 4, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.mute }}>{l}</div></div>
                ))}
              </div>
            </div>
          </div>
          {/* ── bestsellers */}
          <div style={{ position: "absolute", left: 0, top: 760, width: PW, height: 800, padding: "70px 84px 0", boxSizing: "border-box" }}>
            <Eyebrow style={rise(f, ARRIVE.best - 8, 20)}>Bestsellers</Eyebrow>
            <div style={{ ...rise(f, ARRIVE.best - 4, 30), marginTop: 14, fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, letterSpacing: "-0.03em" }}>The most wanted, <span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", color: C.goldSoft }}>ready to ship.</span></div>
          </div>
          {BEST.map((c, i) => {
            const isPick = i === 1;
            const p = after(f, ARRIVE.best - 2 + i * 4, [0, 18], [0, 1], { easing: easeOut });
            const lift = isPick && hover ? -8 : 0;
            return (
              <div key={c.sku} style={{ position: "absolute", left: CARD_X0 + i * (CARD_W + CARD_GAP), top: CARD_TOP, width: CARD_W, height: CARD_H, borderRadius: 24, overflow: "hidden",
                border: `1px solid ${isPick && hover ? C.gold : C.line}`, background: "radial-gradient(ellipse at 50% 38%, #1d1d23 0%, #111114 60%, #0b0b0d 100%)",
                opacity: p, transform: `translateY(${(1 - p) * 90 + lift}px) scale(${0.94 + 0.06 * p})`, boxShadow: isPick && hover ? "0 20px 50px rgba(201,162,39,0.18)" : "none" }}>
                <div style={{ position: "absolute", left: 16, top: 14, fontFamily: DISPLAY, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", color: C.goldSoft, border: "1px solid rgba(201,162,39,0.3)", borderRadius: 99, padding: "4px 10px" }}>No. {String(i + 1).padStart(2, "0")}</div>
                <Img src={watch(c.sku)} style={{ position: "absolute", left: (CARD_W - 250 * AR) / 2, top: 30, height: 250, transform: `scale(${isPick && hover ? 1.06 : 1}) rotate(${(isPick && hover ? -3 : 0)}deg)` }} />
                <div style={{ position: "absolute", left: 18, right: 18, top: 296 }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18 }}>{c.name}</div>
                  <div style={{ marginTop: 3, fontSize: 13, color: C.mute }}>{c.sub}</div>
                </div>
                <div style={{ position: "absolute", left: 18, right: 18, bottom: 20, height: 44, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: C.ink,
                  background: isPick && added ? C.gold : isPick && hover ? C.goldSoft : C.chalk, transform: `scale(${isPick && pressing && f < T.cardClick + 4 ? 0.94 : 1})` }}>
                  {isPick && added ? "Added to bag ✓" : "Add to bag"}
                </div>
              </div>
            );
          })}
          {/* ── strap studio */}
          <div style={{ position: "absolute", left: 0, top: 1560, width: PW, height: 800, overflow: "hidden", background: "radial-gradient(ellipse at 72% 50%, rgba(201,162,39,0.14), transparent 55%), #0c0c0e", borderTop: `1px solid ${C.line}` }}>
            <div style={{ position: "absolute", left: 96, top: 200 }}>
              <Eyebrow style={rise(f, ARRIVE.strap - 8, 20)}>Strap Studio</Eyebrow>
              <div style={{ marginTop: 16, fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, lineHeight: 0.98, letterSpacing: "-0.03em" }}>
                <div style={rise(f, ARRIVE.strap - 4, 50)}>Try it on</div>
                <div style={{ ...rise(f, ARRIVE.strap + 2, 50), fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", color: C.goldSoft }}>before you buy.</div>
              </div>
              <div style={{ ...rise(f, ARRIVE.strap + 6, 20), marginTop: 20, fontSize: 15, color: C.mute, width: 380, lineHeight: 1.6 }}>Pick a watch, tap a strap, see it on the watch.</div>
              <div style={{ position: "absolute", left: 0, top: 340, display: "flex", gap: 12 }}>
                {STRAPS.map((s, j) => {
                  const p = after(f, ARRIVE.strap + 6 + j * 2, [0, 12], [0, 1], { easing: easeOut });
                  return <div key={j} style={{ width: 44, height: 44, borderRadius: 99, background: s.chip, opacity: p, transform: `scale(${0.5 + 0.5 * p})`,
                    boxShadow: `0 0 0 ${s.ring ? 3 : 1}px ${s.ring || "rgba(255,255,255,0.2)"}${j === k ? `, 0 0 0 6px #0c0c0e, 0 0 0 8px ${C.gold}` : ""}` }} />;
                })}
              </div>
              <div style={{ position: "absolute", left: 0, top: 404, fontFamily: "Mono", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: C.mute, opacity: after(f, ARRIVE.strap + 14, [0, 10], [0, 1]) }}>{strap.file.replace("vertech-", "").replace(/-/g, " ")}</div>
            </div>
            <div style={{ position: "absolute", left: 900 - 330, top: 80, width: 660, height: 680, ...rise(f, ARRIVE.strap - 2, 80), WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)" }}>
              {k > 0 && <Img src={staticFile(`s/${prevStrap.file}.png`)} style={{ position: "absolute", height: 680, left: 330 - 340 * 0.56, top: 0 }} />}
              <Img src={staticFile(`s/${strap.file}.png`)} style={{ position: "absolute", height: 680, left: 330 - 340 * 0.56, top: 0, clipPath: `inset(0 0 ${(1 - wipe) * 100}% 0)` }} />
              {k > 0 && wipe < 1 && <div style={{ position: "absolute", left: 120, right: 120, top: wipe * 680 - 2, height: 4, background: C.goldSoft, boxShadow: `0 0 24px 6px ${C.gold}88` }} />}
            </div>
          </div>
          {/* ── the collection */}
          <div style={{ position: "absolute", left: 0, top: 2360, width: PW, height: 800, borderTop: `1px solid ${C.line}` }}>
            <div style={{ position: "absolute", left: 110, top: 60, fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, letterSpacing: "-0.03em", ...rise(f, ARRIVE.grid - 8, 30) }}>The collection <span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", color: C.goldSoft }}>— 32 watches.</span></div>
            {CHIPS.map(([label, w], i) => {
              const on = filtered ? i === 1 : i === 0;
              return <div key={label} style={{ position: "absolute", left: chipX(i), top: 150, width: w, height: 36, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600,
                background: on ? C.chalk : "transparent", color: on ? C.ink : C.mute, border: `1px solid ${on ? C.chalk : C.line}`, ...rise(f, ARRIVE.grid - 4 + i * 2, 16) }}>{label}</div>;
            })}
            <div style={{ position: "absolute", right: 110, top: 160, fontSize: 13, color: C.mute, opacity: after(f, ARRIVE.grid, [0, 10], [0, 1]) }}>{filtered ? "4 results" : "32 results"}</div>
          </div>
          {(filtered ? MOON4 : ALL8).map((sku, i) => {
            const r = Math.floor(i / 4), c = i % 4;
            const start = filtered ? T.chipClick + 6 + i * 3 : ARRIVE.grid - 4 + (r * 4 + c) * 2;
            const p = after(f, start, [0, 16], [0, 1], { easing: easeOut });
            const gone = filtered ? 0 : out;
            const big = filtered ? 1.7 : 1;
            return (
              <div key={(filtered ? "m" : "a") + sku} style={{ position: "absolute", left: G_X0 + c * (G_W + G_GAP), top: GRID_TOP + r * (G_H + G_GAP), width: G_W, height: filtered ? G_H * 2 + G_GAP : G_H, borderRadius: 20,
                background: "radial-gradient(ellipse at 50% 40%, #1d1d23, #0e0e11 70%)", border: `1px solid ${C.line}`, overflow: "hidden",
                opacity: p * (1 - gone), transform: `translateY(${(1 - p) * 60}px) scale(${(0.9 + 0.1 * p) * (1 - gone * 0.1)})` }}>
                <Img src={watch(sku)} style={{ position: "absolute", height: 200 * big, left: (G_W - 200 * big * AR) / 2, top: 14 * big }} />
                {filtered && <div style={{ position: "absolute", left: 18, bottom: 18, fontFamily: DISPLAY, fontWeight: 700, fontSize: 17 }}>{["Full Moon", "New Moon", "Super Blue", "Pink Moon"][i]}</div>}
              </div>
            );
          })}
          {/* ── checked in hand + footer */}
          <div style={{ position: "absolute", left: 0, top: 3160, width: PW, height: 640, background: "radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.16), transparent 60%), #0b0b0c", borderTop: `1px solid ${C.line}`, textAlign: "center" }}>
            <div style={{ marginTop: 70, fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, letterSpacing: "-0.03em", ...rise(f, ARRIVE.end - 6, 40) }}>Checked in hand. <span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", color: C.goldSoft }}>Shipped complete.</span></div>
            <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 34 }}>
              {[["◎", "Carefully selected"], ["✓", "Checked in hand"], ["▣", "Shipped complete"]].map(([ic, l], i) => (
                <div key={l} style={{ width: 230, padding: "22px 0", borderRadius: 20, border: `1px solid ${C.line}`, background: "#121215", ...rise(f, ARRIVE.end - 2 + i * 3, 40) }}>
                  <div style={{ fontSize: 26, color: C.goldSoft }}>{ic}</div><div style={{ marginTop: 8, fontSize: 15, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "inline-block", marginTop: 36, borderRadius: 999, background: f >= 350 ? C.goldSoft : C.gold, color: C.ink, padding: "17px 34px", fontSize: 15, fontWeight: 700,
              transform: `scale(${f >= 358 && f < 362 ? 0.94 : 1})`, ...rise(f, ARRIVE.end + 8, 20) }}>Shop the collection →</div>
            <div style={{ position: "absolute", left: 80, right: 80, bottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: C.mute, borderTop: `1px solid ${C.line}`, paddingTop: 18 }}>
              <span style={{ fontFamily: SERIF, fontSize: 24, color: C.chalk }}>WTC</span><span>Shop · Strap Studio · Collections · Contact</span><span>© Watch Trade Chronicles</span>
            </div>
          </div>
        </div>
        {/* sticky header */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: NAV, background: "rgba(9,9,10,0.94)", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px" }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, letterSpacing: "0.04em" }}>WTC</div>
          <div style={{ display: "flex", gap: 34, fontSize: 13, color: C.mute, fontWeight: 500 }}>{["Shop", "Strap Studio", "Collections", "Reviews"].map((n, i) => {
            const act = (i === 0 && scroll >= 700 && scroll < 1500) || (i === 1 && scroll >= 1500 && scroll < 2300) || (i === 2 && scroll >= 2300);
            return <span key={n} style={{ color: act ? C.chalk : C.mute }}>{n}</span>;
          })}</div>
          <div style={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.chalk} strokeWidth="1.6"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
            {badge > 0.01 && <div style={{ position: "absolute", right: -3, top: -3, width: 18, height: 18, borderRadius: 99, background: C.gold, color: C.ink, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${badge})` }}>1</div>}
          </div>
          <div style={{ position: "absolute", left: 0, bottom: -1, height: 2, width: `${(scroll / 3000) * 100}%`, background: C.gold, opacity: 0.8 }} />
        </div>
        {toast > 0.01 && (
          <div style={{ position: "absolute", right: 30, top: NAV + 16, width: 330, padding: 14, borderRadius: 16, background: "#16161a", border: `1px solid ${C.line}`, display: "flex", gap: 12, alignItems: "center", transform: `translateX(${(1 - toast) * 380}px)`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "#0d0d10", position: "relative", overflow: "hidden" }}><Img src={watch("SO33M100")} style={{ position: "absolute", height: 82, left: (48 - 82 * AR) / 2, top: -17 }} /></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Added to your bag</div><div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>Mission to the Moon</div></div>
            <div style={{ borderRadius: 99, background: C.gold, color: C.ink, padding: "8px 13px", fontSize: 12, fontWeight: 700 }}>Checkout</div>
          </div>
        )}
      </div>
      {/* browser chrome */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: CHROME, background: "#141417", borderBottom: "1px solid #222", display: "flex", alignItems: "center", padding: "0 14px" }}>
        <div style={{ display: "flex", gap: 7 }}>{["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 11, height: 11, borderRadius: 99, background: c }} />)}</div>
        <div style={{ margin: "0 auto", width: 520, height: 26, borderRadius: 8, background: "#1f1f24", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: C.chalk }}>
          <svg width="11" height="11" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke={C.mute} strokeWidth="2.4" /><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke={C.mute} strokeWidth="2.4" /></svg>
          watchtradechronicles.com
        </div>
      </div>
      {/* cursor + click ripples */}
      {CLICKS.map((c) => f >= c && f < c + 14 && (
        <div key={c} style={{ position: "absolute", left: cx - 30, top: cy - 30, width: 60, height: 60, borderRadius: 99, border: `2px solid ${C.goldSoft}`, transform: `scale(${interpolate(f - c, [0, 14], [0.3, 1.5], clamp)})`, opacity: interpolate(f - c, [0, 14], [1, 0], clamp) }} />
      ))}
      <svg width="30" height="30" viewBox="0 0 24 24" style={{ position: "absolute", left: cx - 4, top: cy - 2, transform: `scale(${pressing ? 0.85 : 1})`, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.6))" }}>
        <path d="M4 2l15 11-7 1-4 7z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ════════════════════════════════════ the room: window, city, desk (out of focus)
function Room({ f }) {
  const buildings = [];
  for (let i = 0; i < 60; i++) {
    const x = random(`bx${i}`) * 1180 - 50, w = 30 + random(`bw${i}`) * 70, h = 60 + Math.pow(random(`bh${i}`), 2.4) * 460;
    const shade = 150 + Math.floor(random(`bc${i}`) * 30);
    buildings.push(<rect key={i} x={x} y={905 - h} width={w} height={h} fill={`rgb(${shade - 12},${shade + 2},${shade + 18})`} opacity={0.55 + random(`bo${i}`) * 0.35} />);
  }
  const drift = f * 0.08;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "blur(16px)", transform: `translateX(${-drift}px) scale(1.06)` }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #b9cadb 0%, #d5e0e9 40%, #e3e9ee 52%, #c3d0dc 60%, #b2c3d2 72%)" }} />
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {buildings}
          <rect x="-50" y="905" width="1200" height="240" fill="#a9bccd" />
          <rect x="-50" y="905" width="1200" height="8" fill="#c9d6e1" />
        </svg>
        {/* window frame + plant */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 70, height: 1200, background: "#2b2d31" }} />
        <div style={{ position: "absolute", left: 0, top: 1120, width: 1080, height: 40, background: "#3a3c40" }} />
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 40 + random(`px${i}`) * 140, top: 380 + random(`py${i}`) * 420, width: 70, height: 26, borderRadius: "50%", background: i % 2 ? "#5d7a43" : "#73915a",
            transform: `rotate(${-60 + random(`pr${i}`) * 120}deg)` }} />
        ))}
        {/* desk: marble */}
        <div style={{ position: "absolute", left: -40, right: -40, top: 1150, bottom: -40, background: "linear-gradient(180deg, #d8d3cb 0%, #cfc9c0 40%, #b7b0a6 100%)" }} />
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.35 }}>
          <filter id="marble"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.018" numOctaves="4" seed="7" /><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.52  0 0 0 0 0.48  0 0 0 -1.6 1.3" /></filter>
          <rect x="0" y="1150" width="1080" height="770" filter="url(#marble)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(255,250,240,0.0) 40%, rgba(40,40,50,0.25) 100%)" }} />
    </AbsoluteFill>
  );
}

// ════════════════════════════════════ the laptop
const SX = 46, SY = 640, SWO = 988, BEZ = 14;
const SWI = SWO - 2 * BEZ, SHI = SWI * (PH / PW), SHO = SHI + 2 * BEZ + 10;
function Laptop({ f }) {
  const keys = [];
  const rows = [14, 14, 14, 13, 12, 9];
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const w = r === 5 && i === 4 ? 300 : 66;
      const x = 70 + (r === 5 ? [0, 72, 144, 216, 288, 594, 666, 738, 810][i] : i * 72 + (r % 2) * 16);
      keys.push(<div key={`${r}-${i}`} style={{ position: "absolute", left: x, top: 34 + r * 62, width: w, height: 54, borderRadius: 9, background: "linear-gradient(#26272b,#1a1b1e)", boxShadow: "0 2px 0 #0d0d0f" }} />);
    }
  });
  return (
    <>
      {/* contact shadow on the desk */}
      <div style={{ position: "absolute", left: -60, right: -60, top: SY + SHO + 60, height: 220, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(30,26,22,0.55), transparent 65%)", filter: "blur(14px)" }} />
      {/* keyboard deck, seen at an angle */}
      <div style={{ position: "absolute", left: -90, width: 1260, top: SY + SHO - 4, height: 240, perspective: 900, perspectiveOrigin: "50% 0%" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1260, height: 520, transformOrigin: "50% 0%", transform: "rotateX(76deg)", borderRadius: "0 0 40px 40px",
          background: "linear-gradient(180deg,#9a9ca2 0%,#b7b9be 30%,#c4c6ca 100%)", boxShadow: "inset 0 2px 0 #6e7075" }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 0, height: 410 }}>{keys}</div>
          <div style={{ position: "absolute", left: 450, width: 360, top: 420, height: 90, borderRadius: 14, background: "linear-gradient(#aeb0b5,#a4a6ab)", boxShadow: "inset 0 0 0 2px #96989d" }} />
        </div>
      </div>
      {/* hinge */}
      <div style={{ position: "absolute", left: SX + 20, width: SWO - 40, top: SY + SHO - 6, height: 12, borderRadius: "0 0 8px 8px", background: "linear-gradient(#1d1e21,#55575c)" }} />
      {/* lid */}
      <div style={{ position: "absolute", left: SX, top: SY, width: SWO, height: SHO, borderRadius: 26, background: "linear-gradient(180deg,#2c2d31,#18181b)", boxShadow: "inset 0 0 0 2px #45464b, 0 30px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ position: "absolute", left: SWO / 2 - 4, top: 6, width: 8, height: 8, borderRadius: 99, background: "#0b0b0d" }} />
        <div style={{ position: "absolute", left: BEZ, top: BEZ + 6, width: SWI, height: SHI, borderRadius: 6, overflow: "hidden", background: "#000" }}>
          <div style={{ width: PW, height: PH, transform: `scale(${SWI / PW})`, transformOrigin: "0 0" }}><Page f={f} /></div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 30%, transparent 45%)" }} />
        </div>
      </div>
    </>
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
    [DISPLAY, "space-grotesk-latin-700-normal.woff2", { weight: "700" }],
    [DISPLAY, "space-grotesk-latin-500-normal.woff2", { weight: "500" }],
    [SERIF, "instrument-serif-latin-400-normal.woff2", { style: "normal" }],
    [SERIF, "instrument-serif-latin-400-italic.woff2", { style: "italic" }],
    [SANS, "inter-latin-400-normal.woff2", { weight: "400" }],
    [SANS, "inter-latin-600-normal.woff2", { weight: "600" }],
    ["Mono", "GeistMono-500.ttf"],
  ]);
  const f = useCurrentFrame();
  // camera: a slow push-in; leans in on the details; pulls back up for the end card
  const push = interpolate(f, [0, T.endCard], [1, 1.07], clamp);
  const lean = interpolate(f, [96, 112, 140, 150, 176, 190, 236, 248], [0, 0.08, 0.08, 0, 0, 0.06, 0.06, 0], clamp);
  const endP = interpolate(f, [T.endCard, T.endCard + 22], [0, 1], { ...clamp, easing: inOut });
  const camScale = (push + lean) * (1 - endP * 0.5);
  const camY = -endP * 470;
  const ox = SX + SWO / 2, oy = SY + SHO / 2;
  const intro = sp(f, 0, { damping: 18, stiffness: 60 });
  return (
    <AbsoluteFill style={{ background: "#c9d3dc" }}>
      <Audio src={staticFile("sound.wav")} />
      <Room f={f} />
      <EndCardBackdrop f={f} />
      <AbsoluteFill style={{ transform: `translateY(${camY}px) scale(${camScale * (0.94 + 0.06 * intro)})`, transformOrigin: `${ox}px ${oy}px` }}>
        <Laptop f={f} />
      </AbsoluteFill>
      {CAPTIONS.map((c, i) => <Caption key={i} f={f} cap={c} />)}
      {/* credit, like a spec ad */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1680, textAlign: "center", opacity: interpolate(f, [8, 20, T.endCard - 4, T.endCard], [0, 1, 1, 0], clamp) }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 30px", borderRadius: 999, background: "rgba(16,16,20,0.88)", color: "#fff", fontFamily: POP, fontWeight: 600, fontSize: 40 }}>
          <Star size={30} /> @appifylb
        </div>
        <div style={{ marginTop: 22, fontFamily: POP, fontWeight: 600, fontSize: 26, letterSpacing: "0.32em", color: "rgba(30,30,35,0.75)" }}>WEBSITE BY APPIFY</div>
      </div>
      <EndCard f={f} />
    </AbsoluteFill>
  );
};

// The end card's backdrop sits behind the laptop (so the laptop stays in front of it).
function EndCardBackdrop({ f }) {
  const t = f - T.endCard;
  if (t < 0) return null;
  return <AbsoluteFill style={{ opacity: interpolate(t, [0, 14], [0, 1], clamp), background: `radial-gradient(ellipse at 50% 62%, #2a1d78 0%, ${A.navy} 55%, #07051a 100%)` }} />;
}
