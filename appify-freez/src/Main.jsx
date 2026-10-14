// Freez Mix spec ad (raw, 16:9, to be framed later). All product art is Freez's own, scraped from freezmix.com.
// "Choose your mix": the cap pops and the logo lands, then each flavour floods the screen in its label colour with its
// husband & wife bottles clinking together. A white quiet beat counts to 13; the drop lines up all 26 bottles.
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FPS, DURATION, POP, LOGO, WORDS, PARADE, GAP, COUNT_END, DROP, TOGETHER, END_LOGO, CREDIT } from "./timing.js";
import { SLOTS, LINEUP } from "./flavors.js";
import { useFonts, clamp, easeOut, shake } from "./fx.jsx";

const INK = "#141414";
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 0.92 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const img = (n) => staticFile(`freez/${n}`);
const BOTTLE = 1518 / 390;   // bottle art aspect (h / w)

// 16:9 design space (1920x1080), fit into any frame
function Stage({ W, H, children }) {
  const k = Math.min(W / 1920, H / 1080);
  return <div style={{ position: "absolute", left: (W - 1920 * k) / 2, top: (H - 1080 * k) / 2, width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}
// rising fizz: deterministic bubbles; `burst` adds a dense plume from a point
function Fizz({ f, count = 40, seed = "z", color = "rgba(255,255,255,.55)", burst = null }) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = (k) => random(`${seed}${k}${i}`);
    const speed = 3 + r("v") * 7, size = 6 + r("s") * 22, period = 1080 / speed + 40;
    const t = (f + r("o") * period) % period;
    let x = r("x") * 1920 + Math.sin((f + r("p") * 90) / (10 + r("w") * 12)) * 14, y = 1110 - t * speed;
    let o = 1;
    if (burst) {
      const bt = f - burst.at;
      if (bt < 0 || bt > 50) continue;
      const a = -Math.PI / 2 + (r("a") - 0.5) * 1.4, v = 14 + r("b") * 30;
      x = burst.x + Math.cos(a) * v * bt * 0.9 + Math.sin(bt / 3 + i) * 6; y = burst.y + Math.sin(a) * v * bt - 0.0 * bt * bt;
      o = 1 - bt / 50;
    }
    out.push(<i key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: 99, border: `${Math.max(2, size / 7)}px solid ${color}`, opacity: o, boxShadow: "inset -2px -3px 0 rgba(255,255,255,.25)" }} />);
  }
  return <>{out}</>;
}
// Freez's own halftone graphic (from their site), multiplied over the colour
// (pushed toward the edge so its line marks never cross the type)
const Halftone = ({ f, opacity = 0.18, flip = false, push = 0 }) => (
  <Img src={img("halftone.png")} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity, mixBlendMode: "multiply", transform: `${flip ? "scaleX(-1) " : ""}translateX(${push + Math.sin(f / 50) * 20}px) scale(1.05)` }} />
);

// ── 1 · intro: the cap pops, the logo lands, "Choose your mix." ─────────────────────────────────────
function Intro({ f }) {
  const logo = sp(f, LOGO, 9, 240);
  const sq = f >= LOGO ? 1 + 0.12 * Math.exp(-(f - LOGO) / 4) * Math.cos((f - LOGO) / 1.6) : 1;
  const words = ["Choose", "your", "mix."];
  return (
    <AbsoluteFill style={{ background: "#FFFFFF", overflow: "hidden" }}>
      <Halftone f={f} opacity={0.7} push={480} />
      <Fizz f={f} count={90} seed="ib" color="rgba(30,206,203,.8)" burst={{ at: POP, x: 960, y: 980 }} />
      <Fizz f={f} count={18} seed="ia" color="rgba(20,20,20,.18)" />
      <div style={{ position: "absolute", left: 960 - 380, top: 250, width: 760, transform: `scale(${interpolate(logo, [0, 1], [0.2, 1]) * sq}, ${interpolate(logo, [0, 1], [0.2, 1]) / sq})`, opacity: Math.min(1, logo * 4), transformOrigin: "50% 80%" }}>
        <Img src={img("logo.png")} style={{ width: 760 }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", gap: 30 }}>
        {words.map((w, i) => f >= WORDS[i] && <span key={w} style={{ ...D, fontSize: 120, color: i === 2 ? "#1ECECB" : INK, display: "inline-block", ...pop(sp(f, WORDS[i], 10, 320), 1.6) }}>{w}</span>)}
      </div>
    </AbsoluteFill>
  );
}

// ── 2 · the parade: one flavour per slot ───────────────────────────────────────────────────────────
function nameLines(name) {
  const parts = name.replace(" Mix", "").split(" & ");
  return parts.length > 1 ? [parts[0], "& " + parts[1]] : [parts[0]];
}
function Pair({ s, t, h, cx, by, fast }) {
  const w = h / BOTTLE;
  const inP = sp(t, 0, fast ? 15 : 12, fast ? 520 : 230);
  const meet = fast ? 3 : 7;
  const clink = t >= meet ? Math.exp(-(t - meet) / 4) * Math.sin((t - meet) / 1.2) : 0;
  const gap = w * 0.08;
  const far = fast ? 650 : 1300, lx = interpolate(inP, [0, 1], [cx - w - gap / 2 - far, cx - w - gap / 2]), rx = interpolate(inP, [0, 1], [cx + gap / 2 + far, cx + gap / 2]);
  const bob = Math.sin(t / 8) * 6;
  return (
    <>
      <Img src={img(`${s.slug}-m.png`)} style={{ position: "absolute", left: lx, top: by - h + bob, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${4 + 6 * clink}deg)`, filter: "drop-shadow(0 30px 30px rgba(0,0,0,.28))" }} />
      <Img src={img(`${s.slug}-w.png`)} style={{ position: "absolute", left: rx, top: by - h - bob, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${-4 - 6 * clink}deg)`, filter: "drop-shadow(0 30px 30px rgba(0,0,0,.28))" }} />
      {t >= meet && t < meet + 10 && (
        <svg width="220" height="220" viewBox="-110 -110 220 220" style={{ position: "absolute", left: cx - 110, top: by - h * 0.93 - 110, opacity: 1 - (t - meet) / 10 }}>
          {Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2, r0 = 20 + (t - meet) * 6, r1 = r0 + 26; return <line key={k} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke="#fff" strokeWidth="7" strokeLinecap="round" />; })}
        </svg>
      )}
    </>
  );
}
function Slot({ s, f }) {
  const t = f - s.at, fast = s.len === 15, right = SLOTS.indexOf(s) % 2 === 1;   // which side the bottles stand on
  const fg = s.dark ? INK : "#FFFFFF";
  const lines = nameLines(s.name);
  const txt = sp(t, fast ? 1 : 3, 11, 300);
  const drift = interpolate(t, [0, s.len + 10], [40, -40]);
  return (
    <AbsoluteFill style={{ background: s.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 70% at 50% 45%, rgba(255,255,255,.22), transparent 70%)" }} />
      <Halftone f={f} opacity={0.16} flip={s.at % 2 === 1} />
      <Fizz f={f} count={36} seed={s.slug} color={s.dark ? "rgba(20,20,20,.25)" : "rgba(255,255,255,.5)"} />
      {s.top ? (
        <>
          <div style={{ position: "absolute", left: 120 + drift * 0.5, top: 330, color: fg, ...pop(txt, 1.25), transformOrigin: "0 50%" }}>
            <div style={{ ...M, fontSize: 30, opacity: 0.8, marginBottom: 18 }}>Freez Mix</div>
            {lines.map((l) => <div key={l} style={{ ...D, fontSize: 168, whiteSpace: "nowrap" }}>{l}</div>)}
          </div>
          <Hero s={s} t={t} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", ...(right ? { left: 120 } : { right: 120 }), top: lines.length > 1 ? 300 : 400, textAlign: right ? "left" : "right", color: fg, transformOrigin: right ? "0 50%" : "100% 50%", transform: `translateX(${drift * 0.5}px) scale(${interpolate(txt, [0, 1], [1.3, 1])})`, opacity: Math.min(1, txt * 3) }}>
            <div style={{ ...M, fontSize: 30, opacity: 0.8, marginBottom: 18 }}>Freez Mix</div>
            {lines.map((l) => <div key={l} style={{ ...D, fontSize: 180, whiteSpace: "nowrap" }}>{l}</div>)}
          </div>
          <Pair s={s} t={t} h={fast ? 820 : 860} cx={right ? 1450 : 470} by={1030} fast={fast} />
        </>
      )}
    </AbsoluteFill>
  );
}
// hero flavours: Freez's bottle-with-fruit shot swings in on the right
function Hero({ s, t }) {
  const p = sp(t, 0, 11, 200);
  const h = 960, w = h * 400 / 529;
  return (
    <Img src={img(`${s.top}.png`)} style={{ position: "absolute", left: 1040 + (1 - p) * 900, top: 70 + Math.sin(t / 9) * 8, width: w, height: h, transform: `rotate(${interpolate(p, [0, 1], [25, 0]) + Math.sin(t / 12) * 2}deg)`, filter: "drop-shadow(0 40px 40px rgba(0,0,0,.3))" }} />
  );
}
function Parade({ f }) {
  let i = SLOTS.findIndex((s) => f >= s.at && f < s.at + s.len);
  if (i < 0 && f >= SLOTS[0].at) i = SLOTS.length - 1;     // hold the last flavour under the white wipe
  if (i < 0) return null;
  const s = SLOTS[i], t = f - s.at;
  const R = interpolate(t, [0, 7], [0, 1300], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill>
      {i > 0 && t < 7 && <Slot s={SLOTS[i - 1]} f={f} />}
      <AbsoluteFill style={{ clipPath: t < 7 ? `circle(${R}px at 960px 600px)` : "none" }}><Slot s={s} f={f} /></AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── 3 · quiet beat: white, a counter to 13 ────────────────────────────────────────────────────────
function Count({ f }) {
  const n = Math.max(1, Math.min(13, Math.round(interpolate(f, [GAP + 3, COUNT_END], [1, 13], { ...clamp, easing: Easing.bezier(0.3, 0, 0.7, 1) }))));
  const land = f >= COUNT_END ? Math.exp(-(f - COUNT_END) / 4) : 0;
  const R = interpolate(f - GAP, [0, 8], [0, 1300], { ...clamp, easing: easeOut });
  return (
    <AbsoluteFill style={{ background: "#fff", clipPath: f - GAP < 8 ? `circle(${R}px at 960px 600px)` : "none" }}>
      <Halftone f={f} opacity={0.45} push={480} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 420, color: INK, transform: `scale(${1 + 0.12 * land})`, fontVariantNumeric: "tabular-nums" }}>{n}</div>
        <div style={{ ...D, fontSize: 140, color: INK, marginTop: 10, ...pop(sp(f, COUNT_END, 10, 300), 1.4) }}>flavors.</div>
      </div>
    </AbsoluteFill>
  );
}

// ── 4 · the drop: all 26 bottles, one line-up, the logo ──────────────────────────────────────────────
function Lineup({ f }) {
  const t = f - DROP;
  const h = 270, w = h / BOTTLE, pairW = w * 2 - 6, gap = 10;
  const total = 13 * pairW + 12 * gap, x0 = 960 - total / 2;
  const [sx, sy] = shake(f, DROP, 22, 5);
  const tog = sp(f, TOGETHER, 11, 260), lg = sp(f, END_LOGO, 10, 220), tag = sp(f, END_LOGO + 10, 12, 220), cr = sp(f, CREDIT, 12, 200);
  const breathe = 1 + 0.01 * Math.sin(Math.max(0, f - END_LOGO) / 14);
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <Halftone f={f} opacity={0.4} push={520} />
      <Fizz f={f} count={50} seed="lu" color="rgba(30,206,203,.45)" />
      <Fizz f={f} count={110} seed="ld" color="rgba(240,94,159,.7)" burst={{ at: DROP, x: 960, y: 1000 }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${breathe})` }}>
        <div style={{ position: "absolute", left: 960 - 330, top: 70, width: 660, ...pop(lg, 0.4), transformOrigin: "50% 100%" }}><Img src={img("logo.png")} style={{ width: 660 }} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: f < END_LOGO ? 230 : 425, textAlign: "center", ...pop(tog, 1.5) }}>
          {f < END_LOGO
            ? <div style={{ ...D, fontSize: 160, color: INK }}>Better <span style={{ color: "#F05E9F" }}>together.</span></div>
            : <div style={{ ...D, fontSize: 70, color: INK, ...pop(tag, 1.3) }}>Choose your mix, <span style={{ color: "#1ECECB" }}>choose your flavor!</span></div>}
        </div>
        {LINEUP.map((slug, k) => {
          const d = Math.abs(k - 6) * 1.2, p = sp(t, d, 10, 260);
          const x = x0 + k * (pairW + gap), y = 1040 - h + (1 - p) * 700, wob = Math.sin((f + k * 7) / 10) * 1.5;
          return (
            <div key={slug} style={{ position: "absolute", left: x, top: y, width: pairW, height: h }}>
              <Img src={img(`${slug}-m.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${2 + wob}deg)` }} />
              <Img src={img(`${slug}-w.png`)} style={{ position: "absolute", left: w - 6, top: 0, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${-2 - wob}deg)` }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 26, ...M, fontSize: 18, color: "rgba(20,20,20,.55)", opacity: Math.min(1, cr * 2) }}>Spec ad · unofficial · motion by Appify @appifylb</div>
      <div style={{ position: "absolute", right: 60, bottom: 26, ...M, fontSize: 18, color: "rgba(20,20,20,.55)", opacity: Math.min(1, cr * 2) }}>freezmix.com</div>
    </AbsoluteFill>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", width: 1920, height: 1080, overflow: "hidden" }}>
          {f < PARADE + 7 && <Intro f={f} />}
          {f >= PARADE && f < GAP + 8 && <Parade f={f} />}
          {f >= GAP && f < DROP && <Count f={f} />}
          {f >= DROP && <Lineup f={f} />}
        </div>
      </Stage>
      <Audio src={staticFile("sound.wav")} />
    </AbsoluteFill>
  );
};
