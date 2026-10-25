// "Follies d'Après-Midi — the boutique, online": a fast lookbook rush, the live site in a browser window (as in the
// other concept reels): one continuous desktop scroll of the homepage with a chip per section, then Dev with the house's orange bags beside every e-commerce
// feature the site has, no subscription (pay once, own it), the appify logo and the DM. Pictures and screens are the brand's own (lookbook, live site).
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { FPS, BEAT, EIGHTH, RUSH, TRIPTYCH, PUNCH, SITE, END, CHIPS, REC_FRAMES, FEATURES, FEAT0, DURATION } from "./shop-timing.js";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DevBags } from "./DevBags.jsx";
import scroll from "../public/rec/scroll.json";   // the recording's scroll positions (public/rec, see shop-timing.js)

const C = { paper: "#F2EDE6", ink: "#0C0B0A", orange: "#F27043", night: "#0A0913", iris: "#8F72FF", uv: "#5B2BFF" };
const G = { fontFamily: "Giaza", lineHeight: 0.86 };
const BO = { fontFamily: "Bodoni", fontStyle: "italic" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: s } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const caption = { ...UI, color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.6)", textAlign: "center" };
const Spark = ({ size, color = C.orange, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const id2 = (n) => String(n).padStart(2, "0");
const WORDS = ["ÉPICÉE.", "LIBRE.", "4 À 7", "BEIRUT"];
const FIELDS = [C.orange, C.ink, C.paper, C.orange, C.ink, C.paper, C.orange, C.ink];

// ── 1 · the lookbook rush ────────────────────────────────────────────────────────────────────────────────────
function Rush({ f }) {
  // bar 1: a cut-out on a colour field every 8th, the giant word behind changes every beat
  const k = Math.min(7, Math.floor((f - RUSH) / EIGHTH));
  const shot = id2([1, 4, 7, 10, 2, 5, 8, 11][k]);
  const bg = FIELDS[k], fg = bg === C.paper ? C.ink : bg === C.ink ? C.orange : C.paper;
  const t = f - RUSH - k * EIGHTH, punch = 1.08 - 0.08 * Math.min(1, t / 5);
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...G, fontSize: 300, color: fg, transform: `scale(${punch})` }}>{WORDS[Math.floor(k / 2) % 4]}</div>
      <Img src={staticFile(`cut/${shot}.png`)} style={{ position: "absolute", left: "50%", bottom: -30, height: 1420, transform: `translateX(-50%) scale(${punch})`, transformOrigin: "50% 100%" }} />
    </AbsoluteFill>
  );
}
function Triptych({ f }) {
  // bar 2: one look per beat, its three angles in three strips that slide in from alternating sides
  const b = Math.min(3, Math.floor((f - TRIPTYCH) / BEAT)), t = f - TRIPTYCH - b * BEAT;
  const look = b, W = 360;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {/* the new look's strips slide in over the last look's (the first over the rush's last look) */}
      {[[(look + 3) % 4, false], [look, true]].map(([lk, moving]) => [0, 1, 2].map((s) => {
        const p = moving ? interpolate(t - s * 1.5, [0, 7], [1, 0], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) }) : 0;
        return (
          <div key={`${lk}${s}`} style={{ position: "absolute", left: s * W, top: 0, width: W, height: 1920, overflow: "hidden", transform: `translateY(${(s % 2 ? -1 : 1) * p * 1920}px)`, borderRight: s < 2 ? `4px solid ${C.ink}` : "none", filter: moving ? "none" : "brightness(.55)" }}>
            <Img src={staticFile(`look/${id2(lk * 3 + s + 1)}.jpg`)} style={{ position: "absolute", height: 1920, left: "50%", transform: "translateX(-50%) scale(1.08)" }} />
          </div>
        );
      }))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", ...G, fontSize: 190, color: C.paper, textShadow: "0 10px 50px rgba(0,0,0,.5)", ...pop(sp(f, TRIPTYCH + b * BEAT, 9, 320), 1.6) }}>{WORDS[look]}</div>
      <div style={{ position: "absolute", left: 70, top: 1080, ...M, fontSize: 26, color: C.paper, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>Look {id2(look + 1)} / 04</div>
    </AbsoluteFill>
  );
}
function Punch({ f }) {
  // bar 3: full-bleed photos, one per 8th, each punching in; a white flash into the website
  const k = Math.min(7, Math.floor((f - PUNCH) / EIGHTH)), t = f - PUNCH - k * EIGHTH;
  const shot = id2([3, 6, 9, 12, 1, 5, 7, 10][k]);
  const z = 1.25 - 0.17 * Math.min(1, t / 6);
  const flash = interpolate(f, [SITE - 5, SITE - 1, SITE + 3], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Img src={staticFile(`look/${shot}.jpg`)} style={{ position: "absolute", height: 1920, left: "50%", top: 0, transform: `translateX(-50%) scale(${z})` }} />
      <AbsoluteFill style={{ border: `28px solid ${k % 2 ? C.orange : C.paper}` }} />
      <div style={{ position: "absolute", left: 70, bottom: 480, ...BO, fontSize: 90, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.5)" }}>Épicée. Libre.</div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
}
function Hook({ f }) {
  // on solid ink labels so it reads on every colour field and photo; sits above the heads (cut-outs start below it)
  if (f >= PUNCH - 2) return null;
  const out = interpolate(f, [PUNCH - 8, PUNCH - 2], [1, 0], clamp);
  const box = (bg, fg) => ({ display: "inline-block", padding: "10px 26px 16px", borderRadius: 18, background: bg, color: fg, ...D, fontSize: 80 });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", opacity: out }}>
      <div style={{ ...pop(sp(f, -4, 11, 300), 1.3) }}><span style={box(C.ink, "#fff")}><span style={{ color: C.orange }}>POV:</span> FDM launched</span></div>
      <div style={{ marginTop: 10, ...pop(sp(f, 8, 10, 300), 1.5) }}><span style={box(C.ink, C.orange)}>their new website</span></div>
    </div>
  );
}

// ── 2 · the live site in a browser window: one continuous desktop scroll of the homepage ─────────────────────
const rec = (f) => staticFile(`rec/${String(Math.max(1, Math.min(REC_FRAMES, f - SITE + 1))).padStart(4, "0")}.jpg`);
function Browser({ f, w }) {
  const h = (w * 900) / 1440, i = Math.max(0, Math.min(REC_FRAMES - 1, f - SITE));
  const pos = scroll.ys[i] / (scroll.H - 900), thumb = (h * 900) / scroll.H;
  return (
    <div style={{ width: w, borderRadius: 22, overflow: "hidden", background: "#1B1714", boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 2px rgba(242,112,67,.35)" }}>
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 13, height: 13, borderRadius: 99, background: c }} />)}
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "5px 40px", borderRadius: 9, background: "rgba(255,255,255,.08)", ...UI, fontWeight: 400, fontFamily: "UIR", fontSize: 18, color: "rgba(255,255,255,.85)" }}>folliesdapresmidi.com</div>
        </div>
        <div style={{ width: 66 }} />
      </div>
      <div style={{ width: w, height: h, position: "relative", overflow: "hidden" }}>
        <Img src={rec(f)} style={{ width: w, height: h, display: "block" }} />
        <div style={{ position: "absolute", right: 4, top: 4 + pos * (h - thumb - 8), width: 6, height: thumb, borderRadius: 9, background: "rgba(0,0,0,.35)" }} />
      </div>
    </div>
  );
}
function Site({ f }) {
  const t = f - SITE, enter = sp(t, 0, 14, 170);
  const chip = CHIPS.filter(([a]) => t >= a).pop();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ transform: "scale(1.3)", filter: "blur(34px) saturate(1.2) brightness(.55)" }}>
        <Img src={rec(f)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.1), rgba(0,0,0,.6))" }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 280, ...caption }}>
        <div style={{ ...D, fontSize: 76, ...pop(sp(t, 2, 11, 300), 1.3) }}>Their new boutique</div>
        <div style={{ ...D, fontSize: 76, color: C.orange, marginTop: 8, textShadow: "0 4px 24px rgba(0,0,0,.5)", ...pop(sp(t, 10, 10, 300), 1.5) }}>built by Appify</div>
      </div>
      <div style={{ position: "absolute", left: 16, top: 470, transform: `translateY(${(1 - enter) * 500}px) scale(${0.92 + 0.08 * enter})`, opacity: Math.min(1, enter * 2) }}>
        <Browser f={f} w={1048} />
      </div>
      {chip && (
        <div key={chip[0]} style={{ position: "absolute", left: 0, right: 0, top: 1240, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 28px 16px 20px", borderRadius: 99, background: "rgba(12,11,10,.7)", border: "2px solid rgba(242,112,67,.6)", ...UI, fontSize: 38, color: "#fff", ...pop(sp(t, chip[0], 12, 280), 1.25) }}>
            <Spark size={34} />{chip[1]}
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(t, [0, 6], [0.9, 0], clamp) }} />
    </AbsoluteFill>
  );
}

// ── 3 · Dev, the features, the logo ──────────────────────────────────────────────────────────────────────────
function End({ f }) {
  const t = f - END, devP = sp(t, 8, 13, 200), OWN = FEAT0 - END + FEATURES.length * EIGHTH + 8;
  const own = sp(t, OWN, 10, 260), cta = sp(t, OWN + 20, 9, 260);
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, t - OWN - 30) / 4);
  const wm = 300, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #08070F, ${C.night} 55%, #1A0F0A)` }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(242,112,67,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(242,112,67,.06) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 38%, rgba(242,112,67,${0.22 + 0.05 * Math.sin(t / 6)}), transparent 55%)` }} />
      <div style={{ position: "absolute", left: 70, top: 250, display: "flex", alignItems: "center", gap: 22, ...pop(sp(t, 0, 10, 300)) }}>
        <svg viewBox={WORDMARK.viewBox} width={wm} height={wmh}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.orange} /></svg>
        <span style={{ ...M, fontSize: 22, color: C.orange }}>@appifylb</span>
      </div>
      <div style={{ position: "absolute", left: 70, top: 370 }}>
        <div style={{ ...D, fontSize: 74, color: "#fff", ...pop(sp(t, 6, 10, 300)) }}>Everything a</div>
        <div style={{ ...D, fontSize: 74, color: C.orange, marginTop: 6, ...pop(sp(t, 12, 10, 300), 1.5) }}>boutique needs</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 540, width: 540 }}>
        {FEATURES.map((ft, i) => {
          const p = sp(f, FEAT0 + i * EIGHTH, 12, 260);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, height: 54, borderBottom: "1px solid rgba(255,255,255,.1)", ...rise(p, 24) }}>
              <div style={{ width: 34, height: 34, borderRadius: 99, background: C.orange, display: "grid", placeItems: "center", transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})` }}>
                <svg width="19" height="19" viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={C.night} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ ...UI, fontSize: 31, color: "#fff" }}>{ft}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 70, top: 1045, ...pop(own, 1.25), transformOrigin: "0% 50%" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 16px", borderRadius: 99, border: `2px solid ${C.orange}`, ...M, fontSize: 22, color: C.orange }}><Spark size={22} />No subscription</div>
        <div style={{ ...D, fontSize: 56, color: "#fff", marginTop: 14 }}>Pay once. <span style={{ color: C.orange }}>Own it forever.</span></div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1200, transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * pulse})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
        <div style={{ padding: "18px 36px", borderRadius: 26, background: C.orange, boxShadow: "0 20px 60px rgba(242,112,67,.35)" }}>
          <div style={{ ...M, fontSize: 22, color: C.night, letterSpacing: "0.2em" }}>DM</div>
          <div style={{ ...D, fontSize: 60, color: C.night, marginTop: 4 }}>“ECOMMERCE”</div>
          <div style={{ ...UI, fontSize: 26, color: C.night, marginTop: 6 }}>for a store like this</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1400, ...UI, fontWeight: 400, fontFamily: "UIR", fontSize: 24, color: "rgba(255,255,255,.6)", ...rise(sp(t, OWN + 40, 12, 220)) }}>Follies d'Après-Midi · designed & built by Appify</div>
      <div style={{ position: "absolute", left: 610, top: 470, transform: `translateY(${(1 - Math.min(1, devP)) * 800}px)` }}>
        <DevBags width={300} t={t} tilt={Math.sin(t / 9) * 2.5} bob={Math.sin(t / 6) * 3} face={{ brow: 16, lid: t % 80 > 76 ? 1 : 0.05, smile: 1, look: -6, happy: t > 30 ? 1 : 0, open: t > 14 && t < 28 ? 0.5 : 0 }} />
      </div>
    </AbsoluteFill>
  );
}

export const Shop = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Giaza", "fonts/Giaza.otf"], ["Bodoni", "fonts/BodoniFLF-Italic.ttf", { style: "italic" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UIR", "Geist-400.ttf"], ["Mono", "GeistMono-500.ttf"], ["Display", "Sora-600.ttf", { weight: "600" }]]);
  const scene = f < TRIPTYCH ? <Rush f={f} /> : f < PUNCH ? <Triptych f={f} /> : f < SITE ? <Punch f={f} /> : f < END ? <Site f={f} /> : <End f={f} />;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {scene}
      <Hook f={f} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [END - 3, END, END + 4], [0, 0.85, 0], clamp) }} />
      <Grain f={f} opacity={0.05} />
      <Audio src={staticFile(music ? "shop.wav" : "shop-sfx.wav")} />
    </AbsoluteFill>
  );
};
