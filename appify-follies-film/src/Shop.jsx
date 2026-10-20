// "Follies d'Après-Midi — the boutique, online": a fast lookbook rush, the live site in a browser window (as in the
// other concept reels) with a chip per feature, then Dev with the house's orange bags beside every e-commerce
// feature the site has, the appify logo and the DM. Pictures and screens are the brand's own (lookbook, live site).
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { FPS, BEAT, EIGHTH, RUSH, TRIPTYCH, PUNCH, SITE, END, SHOTS, FEATURES, FEAT0, DURATION } from "./shop-timing.js";
import { useFonts, clamp, shake, Grain } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DevBags } from "./DevBags.jsx";

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
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", ...G, fontSize: 300, color: fg, transform: `scale(${punch})` }}>{WORDS[Math.floor(k / 2) % 4]}</div>
      <Img src={staticFile(`cut/${shot}.png`)} style={{ position: "absolute", left: "50%", bottom: -30, height: 1580, transform: `translateX(-50%) scale(${punch})`, transformOrigin: "50% 100%" }} />
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
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...G, fontSize: 210, color: C.paper, textShadow: "0 10px 50px rgba(0,0,0,.5)", ...pop(sp(f, TRIPTYCH + b * BEAT, 9, 320), 1.6) }}>{WORDS[look]}</div>
      <div style={{ position: "absolute", left: 70, top: 300, ...M, fontSize: 26, color: C.paper, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>Look {id2(look + 1)} / 04</div>
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
      <div style={{ position: "absolute", left: 70, bottom: 360, ...BO, fontSize: 90, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.5)" }}>Épicée. Libre.</div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
}
function Hook({ f }) {
  if (f >= TRIPTYCH - 2) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 300, ...caption }}>
      <div style={{ ...D, fontSize: 84, ...pop(sp(f, -4, 11, 300), 1.3) }}>POV: a Beirut label</div>
      <div style={{ ...D, fontSize: 84, marginTop: 8, color: C.orange, textShadow: "0 4px 24px rgba(0,0,0,.5)", ...pop(sp(f, 8, 10, 300), 1.5) }}>goes online</div>
    </div>
  );
}

// ── 2 · the live site in a browser window ────────────────────────────────────────────────────────────────────
const PW = 1440;                                  // css width of the captures (page.jpg is 1.25x)
function Screen({ f, w, h }) {
  const shot = SHOTS.filter(([a]) => f >= a).pop();
  const [a, kind, y0, y1] = shot;
  const next = SHOTS[SHOTS.indexOf(shot) + 1];
  const b = next ? next[0] : END;
  const k = w / PW;
  if (kind === "page") {
    const y = interpolate(f, [a + 4, b - 4], [y0, y1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.25, 1) });
    return (
      <>
        <Img src={staticFile("site/page.jpg")} style={{ position: "absolute", left: 0, top: -y * k, width: w }} />
        <Img src={staticFile("site/header.jpg")} style={{ position: "absolute", left: 0, top: 0, width: w, height: 66 * k }} />
      </>
    );
  }
  // the 1440x900 captures cover the taller window: fit the height, slide to the part that matters
  const bw = (h * PW) / 900, left = -(bw - w) * { hero: 0.5, product: 0.88, added: 0.88, bag: 1 }[kind];
  const file = { product: "product", added: "bag", bag: "bagopen" }[kind];
  return (
    <div style={{ position: "absolute", left, top: 0, width: bw, height: h }}>
      {kind === "hero" ? (
        <>
          <Sequence from={a} layout="none"><OffthreadVideo src={staticFile("film.mp4")} muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /></Sequence>
          <Img src={staticFile("site/chrome.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        </>
      ) : <Img src={staticFile(`site/${file}.jpg`)} style={{ width: "100%", height: "100%" }} />}
    </div>
  );
}
function Browser({ f, w, h, z, fx = 0.5, fy = 0.4, style }) {
  return (
    <div style={{ width: w, borderRadius: 26, overflow: "hidden", background: "#1B1714", boxShadow: "0 50px 120px rgba(0,0,0,.6), 0 0 0 2px rgba(242,112,67,.35)", ...style }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <i key={c} style={{ width: 14, height: 14, borderRadius: 99, background: c }} />)}
        <div style={{ marginLeft: 16, padding: "6px 16px", borderRadius: 10, background: "rgba(255,255,255,.08)", ...UI, fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,.8)" }}>folliesdapresmidi.com</div>
      </div>
      <div style={{ width: w, height: h, overflow: "hidden", position: "relative", background: C.paper }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${fx * 100}% ${fy * 100}%`, transform: `scale(${z})` }}><Screen f={f} w={w} h={h} /></div>
      </div>
    </div>
  );
}
function Site({ f }) {
  const shot = SHOTS.filter(([a]) => f >= a).pop(), ts = f - shot[0];
  const z = 1.04 + 0.08 * interpolate(ts, [0, 60], [0, 1], clamp) + 0.1 * Math.exp(-ts / 5);
  const focus = { hero: [0.5, 0.5], page: [0.5, 0.35], product: [0.6, 0.4], added: [0.62, 0.6], bag: [0.6, 0.3] }[shot[1]];
  const [sx, sy] = shake(f, SITE, 18, 5);
  const chip = SHOTS.filter(([a]) => f >= a + 4 && f < a + 50).pop();
  const enter = sp(f, SITE, 13, 160);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ transform: "scale(1.35)", filter: "blur(30px) saturate(1.2) brightness(.6)" }}>
        <Img src={staticFile(`look/${id2(1 + (Math.floor((f - SITE) / 60) * 3) % 12)}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.05), rgba(0,0,0,.55))" }} />
      <div style={{ position: "absolute", left: 40, right: 40, top: 300, ...caption }}>
        <div style={{ ...D, fontSize: 76, ...pop(sp(f, SITE + 2, 11, 300), 1.3) }}>Their new boutique</div>
        <div style={{ ...D, fontSize: 76, color: C.orange, marginTop: 8, textShadow: "0 4px 24px rgba(0,0,0,.5)", ...pop(sp(f, SITE + 10, 10, 300), 1.5) }}>built by Appify</div>
      </div>
      <div style={{ position: "absolute", left: 14, top: 500, transform: `translate(${sx}px, ${sy + (1 - enter) * 600}px) scale(${0.9 + 0.1 * enter})` }}>
        <Browser f={f} w={1052} h={1010} z={z} fx={focus[0]} fy={focus[1]} />
      </div>
      {chip && (
        <div key={chip[0]} style={{ position: "absolute", left: 0, right: 0, top: 1610, display: "flex", justifyContent: "center", opacity: interpolate(f - chip[0], [4, 8, 46, 50], [0, 1, 1, 0], clamp) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 28px 16px 20px", borderRadius: 99, background: "rgba(12,11,10,.65)", border: "2px solid rgba(242,112,67,.6)", ...UI, fontSize: 38, color: "#fff", transform: `translateY(${(1 - Math.min(1, sp(f, chip[0] + 4, 12, 260))) * 30}px)` }}>
            <Spark size={34} />{chip[4]}
          </div>
        </div>
      )}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [SITE, SITE + 6], [0.9, 0], clamp) }} />
    </AbsoluteFill>
  );
}

// ── 3 · Dev, the features, the logo ──────────────────────────────────────────────────────────────────────────
function End({ f }) {
  const t = f - END, devP = sp(t, 8, 13, 200), cta = sp(t, FEAT0 - END + FEATURES.length * EIGHTH + 8, 9, 260);
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, t - 110) / 4);
  const wm = 300, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #08070F, ${C.night} 55%, #1A0F0A)` }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(242,112,67,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(242,112,67,.06) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 62%, rgba(242,112,67,${0.22 + 0.05 * Math.sin(t / 6)}), transparent 55%)` }} />
      <div style={{ position: "absolute", left: 70, top: 190, display: "flex", alignItems: "center", gap: 22, ...pop(sp(t, 0, 10, 300)) }}>
        <svg viewBox={WORDMARK.viewBox} width={wm} height={wmh}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.orange} /></svg>
        <span style={{ ...M, fontSize: 22, color: C.orange }}>@appifylb</span>
      </div>
      <div style={{ position: "absolute", left: 70, top: 330 }}>
        <div style={{ ...D, fontSize: 82, color: "#fff", ...pop(sp(t, 6, 10, 300)) }}>Everything a</div>
        <div style={{ ...D, fontSize: 82, color: C.orange, marginTop: 6, ...pop(sp(t, 12, 10, 300), 1.5) }}>boutique needs</div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 560, width: 620 }}>
        {FEATURES.map((ft, i) => {
          const p = sp(f, FEAT0 + i * EIGHTH, 12, 260);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, height: 74, borderBottom: "1px solid rgba(255,255,255,.1)", ...rise(p, 24) }}>
              <div style={{ width: 40, height: 40, borderRadius: 99, background: C.orange, display: "grid", placeItems: "center", transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})` }}>
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6" fill="none" stroke={C.night} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ ...UI, fontSize: 36, color: "#fff" }}>{ft}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 70, top: 1290, transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * pulse})`, transformOrigin: "0% 50%", opacity: Math.min(1, cta * 2) }}>
        <div style={{ padding: "20px 40px", borderRadius: 28, background: C.orange, boxShadow: "0 20px 60px rgba(242,112,67,.35)" }}>
          <div style={{ ...M, fontSize: 22, color: C.night, letterSpacing: "0.2em" }}>DM</div>
          <div style={{ ...D, fontSize: 66, color: C.night, marginTop: 4 }}>“ECOMMERCE”</div>
          <div style={{ ...UI, fontSize: 26, color: C.night, marginTop: 6 }}>for a store like this</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1540, ...UI, fontWeight: 400, fontFamily: "UIR", fontSize: 24, color: "rgba(255,255,255,.6)", ...rise(sp(t, 130, 12, 220)) }}>Follies d'Après-Midi · designed & built by Appify</div>
      <div style={{ position: "absolute", left: 640, top: 760, transform: `translateY(${(1 - Math.min(1, devP)) * 800}px)` }}>
        <DevBags width={390} t={t} tilt={Math.sin(t / 9) * 2.5} bob={Math.sin(t / 6) * 3} face={{ brow: 16, lid: t % 80 > 76 ? 1 : 0.05, smile: 1, look: -6, happy: t > 30 ? 1 : 0, open: t > 14 && t < 28 ? 0.5 : 0 }} />
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
