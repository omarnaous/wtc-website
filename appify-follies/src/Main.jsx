// Website launch film for folliesdapresmidi.com (built by Appify). The camera rides the house's lift: each floor
// is a section of the real site, shown on a phone, with the lift doors closing over the screen between floors.
import { AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FPS, FLOORS, SHRINK, DOOR_CLOSE, DOOR_OPEN, END, CREDIT, SLIDES, MAISON_STEPS, LOOK0, EIGHTH } from "./timing.js";
import { useFonts, clamp, easeOut, Grain } from "./fx.jsx";
import { WORDMARK } from "./brand.js";

const C = { cream: "#F2EDE6", door: "#E7DFD3", ink: "#0C0B0A", orange: "#F27043", mute: "rgba(12,11,10,.55)" };
const G = { fontFamily: "Giaza", fontWeight: 400, lineHeight: 0.95 };
const BO = { fontFamily: "Bodoni", fontStyle: "italic" };
const FIG = { fontFamily: "Figures" };
const CAPS = { fontFamily: "UI", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" };
const sp = (f, at, damping = 18, stiffness = 120) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const floorAt = (f) => FLOORS.reduce((cur, fl) => (f >= fl.start ? fl : cur), FLOORS[0]);

// phone rect (full bleed when b = 1)
const PH = 1340, PW = Math.round((PH * 1170) / 2532), PX = (1080 - PW) / 2, PY = 392;
function rectAt(b) {
  const l = (a, z) => a + (z - a) * b;
  return { x: l(PX, 0), y: l(PY, 0), w: l(PW, 1080), h: l(PH, 1920), r: l(58, 0), bezel: l(13, 0) };
}
function bleedAt(f) {
  if (f < SHRINK[1]) return 1 - interpolate(f, SHRINK, [0, 1], { ...clamp, easing: ease });
  const lb = FLOORS[4];
  if (f >= lb.start && f < lb.end) return Math.min(interpolate(f, [lb.start, lb.start + 16], [0, 1], { ...clamp, easing: ease }), interpolate(f, [lb.end - 16, lb.end - 4], [1, 0], { ...clamp, easing: ease }));
  return 0;
}
// how far the lift doors are closed (0 open .. 1 shut)
function doorsAt(f) {
  if (f >= END) return f < END + 2 ? 1 : 0;
  const fl = floorAt(f);
  const opening = fl.start === 0 ? 0 : 1 - interpolate(f, [fl.start, fl.start + DOOR_OPEN], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const closing = interpolate(f, [fl.end - DOOR_CLOSE, fl.end], [0, 1], { ...clamp, easing: Easing.bezier(0.6, 0, 0.9, 0.6) });
  return Math.max(opening, closing);
}

// the number on the closed doors: the floor we are arriving at
function doorNumber(f) {
  const i = FLOORS.indexOf(floorAt(f));
  const fl = FLOORS[i];
  if (f >= fl.end - DOOR_CLOSE) return FLOORS[i + 1] ? FLOORS[i + 1].n : "";
  return fl.n;
}
// a site screenshot (1170 x 2532) filling the screen width
const Shot = ({ src, style }) => <Img src={staticFile(`site/${src}.png`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", ...style }} />;

// a carousel step: the screen cross-fades while the shelf of cards slides one card to the left
const SHELF = { boutique: [0.337, 0.847], accessories: [0.364, 0.873] };
function Carousel({ f, k, w, h }) {
  const steps = SLIDES[k];
  let i = 0; steps.forEach((s) => { if (f >= s) i++; });
  const last = steps[i - 1];
  const t = last === undefined ? 1 : interpolate(f, [last, last + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.1, 1) });
  const [a, b] = SHELF[k];
  const sh = (w * 2532) / 1170;
  const clip = `inset(${a * sh}px 0 ${h - b * sh}px 0)`;
  return (
    <>
      <Shot src={`c-${k}-${Math.max(0, i - 1)}`} />
      <div style={{ position: "absolute", inset: 0, opacity: t }}><Shot src={`c-${k}-${i}`} /></div>
      {t < 1 && i > 0 && (
        <div style={{ position: "absolute", inset: 0, clipPath: clip, background: C.cream }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-t * w * 0.77}px)` }}><Shot src={`c-${k}-${i - 1}`} /></div>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - t) * w * 0.77}px)` }}><Shot src={`c-${k}-${i}`} /></div>
        </div>
      )}
    </>
  );
}

function Screen({ f, w, h }) {
  const fl = floorAt(f >= END ? END - 1 : f);
  if (fl.key === "hero") {
    // the hero film, covering the screen, with the site's header over it
    const vw = (h * 1440) / 1080, x = -(vw * 0.6 - w / 2);
    return (
      <>
        <OffthreadVideo src={staticFile("film.mp4")} muted style={{ position: "absolute", left: x, top: 0, height: h, width: vw }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,0) 30%)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: w, height: (w * 132) / 1170, overflow: "hidden", opacity: interpolate(f, [SHRINK[0] + 10, SHRINK[1]], [0, 1], clamp) }}>
          <Shot src="m-top" />
        </div>
      </>
    );
  }
  if (fl.key === "maison") {
    let i = 1; MAISON_STEPS.forEach((s, k) => { if (f >= s) i = k + 1; });
    return <Shot src={`floor-${i}`} />;
  }
  if (fl.key === "boutique" || fl.key === "accessories") return <Carousel f={f} k={fl.key} w={w} h={h} />;
  if (fl.key === "lookbook") {
    const k = Math.min(11, Math.max(0, Math.floor((f - LOOK0) / EIGHTH)));
    const into = f - (LOOK0 + k * EIGHTH);
    const s = 1.06 - 0.04 * Math.min(1, into / EIGHTH);
    return (
      <>
        <Img src={staticFile(`look/${String(k + 1).padStart(2, "0")}.jpg`)} style={{ position: "absolute", left: "50%", top: "50%", height: Math.max(h, (w * 1750) / 1400), transform: `translate(-50%, -50%) scale(${s})` }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,0) 20%, rgba(0,0,0,0) 50%, rgba(0,0,0,.45) 80%, rgba(0,0,0,.3))" }} />
        <div style={{ position: "absolute", left: w * 0.075, top: h * 0.6, ...CAPS, fontSize: w * 0.026, color: "#fff" }}>Floor 05</div>
        <div style={{ position: "absolute", left: w * 0.075, top: h * 0.615, ...G, fontSize: w * 0.11, color: "#fff", marginTop: w * 0.03 }}>The lookbook</div>
        <div style={{ position: "absolute", left: w * 0.075, right: w * 0.075, top: h * 0.72, display: "flex", alignItems: "baseline", gap: w * 0.025, color: "#fff" }}>
          <span style={{ ...FIG, fontSize: w * 0.09 }}>{String(k + 1).padStart(2, "0")}</span>
          <span style={{ ...FIG, fontSize: w * 0.035, opacity: 0.7 }}>/ 12</span>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,.3)", marginLeft: w * 0.03, alignSelf: "center" }}>
            <div style={{ width: `${((k + 1) / 12) * 100}%`, height: "100%", background: C.orange }} />
          </div>
        </div>
      </>
    );
  }
  // where to find us: a slow scroll down the pop-ups, the orange header fixed on top
  const sh = (w * 16773) / 1170, top = ((4019 - 44) * 3 * w) / 1170;
  const scroll = interpolate(f, [fl.start + 16, fl.end - 14], [0, (420 * 3 * w) / 1170], { ...clamp, easing: ease });
  return (
    <>
      <Img src={staticFile("site/m-full.png")} style={{ position: "absolute", left: 0, top: -top - scroll, width: w, height: sh }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: (w * 132) / 1170, overflow: "hidden" }}><Shot src="c-boutique-0" /></div>
    </>
  );
}

// the lift doors: two cream panels meeting in the middle
function Doors({ c, w, h, n }) {
  if (c <= 0.001) return null;
  const half = w / 2;
  const shut = interpolate(c, [0.75, 1], [0, 1], clamp);
  const panel = (side) => (
    <div style={{ position: "absolute", top: 0, height: h, width: half + 1, [side]: -half * (1 - c), background: `linear-gradient(${side === "left" ? 90 : 270}deg, #DDD3C5, ${C.door} 30%, ${C.door})`, boxShadow: c < 1 ? "0 0 30px rgba(0,0,0,.25)" : "none", [side === "left" ? "borderRight" : "borderLeft"]: "1px solid rgba(12,11,10,.18)" }} />
  );
  return (
    <>
      {panel("left")}{panel("right")}
      <div style={{ position: "absolute", left: w / 2 - 1, top: 0, width: 2, height: h, background: "linear-gradient(180deg, rgba(176,138,74,0), rgba(176,138,74,.7) 30%, rgba(176,138,74,.7) 70%, rgba(176,138,74,0))", opacity: shut }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.42, textAlign: "center", opacity: shut }}>
        <div style={{ ...CAPS, fontSize: w * 0.03, color: C.mute }}>Floor</div>
        <div style={{ ...FIG, fontSize: w * 0.22, color: C.ink, lineHeight: 1.1 }}>{n}</div>
      </div>
    </>
  );
}

function Phone({ f }) {
  const b = bleedAt(f), R = rectAt(b);
  const out = f >= END ? interpolate(f, [END, END + 16], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.75, 0) }) : 0;
  if (out >= 1) return null;
  const sw = R.w - 2 * R.bezel, shh = R.h - 2 * R.bezel;
  return (
    <div style={{ position: "absolute", left: R.x, top: R.y - out * 160, width: R.w, height: R.h, borderRadius: R.r, background: C.ink, padding: R.bezel, opacity: 1 - out, boxShadow: b < 1 ? `0 ${50 * (1 - b)}px ${120 * (1 - b)}px rgba(12,11,10,${0.28 * (1 - b)})` : "none" }}>
      <div style={{ position: "relative", width: sw, height: shh, borderRadius: Math.max(0, R.r - R.bezel), overflow: "hidden", background: C.cream }}>
        <Screen f={f} w={sw} h={shh} />
        <Doors c={doorsAt(f)} w={sw} h={shh} n={doorNumber(f)} />
      </div>
    </div>
  );
}

// the floor indicator above the phone: a pill like the site's own, the section label and its title
function Indicator({ f }) {
  if (f < FLOORS[1].start - 4 || f >= END) return null;
  const fl = floorAt(f);
  if (fl.key === "lookbook") return null;
  const p = sp(f, fl.start, 16, 140), o = interpolate(f, [fl.end - 10, fl.end], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", opacity: o * Math.min(1, p * 1.4) }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.ink, color: "#fff", borderRadius: 999, padding: "10px 22px", ...CAPS, fontSize: 22 }}>
        <span style={{ color: C.orange, fontSize: 18 }}>▲</span> {fl.n} · {fl.label}
      </div>
      <div style={{ ...G, fontSize: 112, color: C.ink, marginTop: 22, transform: `translateY(${(1 - p) * 40}px)` }}>{fl.title}</div>
    </div>
  );
}

// a huge floor number behind the phone, tone on tone
function BigNumber({ f }) {
  if (f < FLOORS[1].start - 10 || f >= END + 10) return null;
  const fl = floorAt(f), p = sp(f, fl.start, 20, 90);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", ...FIG, fontSize: 1150, lineHeight: 1, color: "rgba(12,11,10,.055)", transform: `translateY(${(1 - p) * 120}px)`, opacity: interpolate(f, [END, END + 10], [1, 0], clamp) }}>{fl.n}</div>
  );
}

function Hook({ f }) {
  if (f > SHRINK[0] + 12) return null;
  const o = interpolate(f, [SHRINK[0] - 4, SHRINK[0] + 8], [1, 0], clamp);
  const a = sp(f, 6), b = sp(f, 20), c = sp(f, 2);
  const up = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 30}px)` });
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", textAlign: "center", color: "#fff", textShadow: "0 4px 40px rgba(0,0,0,.35)" }}>
      <Img src={staticFile("wordmark.png")} style={{ width: 420, marginTop: 230, ...up(c) }} />
      <div style={{ ...G, fontSize: 150, marginTop: 300, ...up(a) }}>Six floors,</div>
      <div style={{ ...BO, fontSize: 110, marginTop: 6, ...up(b) }}>one long afternoon.</div>
    </AbsoluteFill>
  );
}

function EndCard({ f }) {
  if (f < END) return null;
  const s = (d) => sp(f, END + 12 + d);
  const up = (p) => ({ opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 34}px)` });
  const wm = 210, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ alignItems: "center", textAlign: "center" }}>
      <div style={{ ...CAPS, fontSize: 26, color: C.orange, marginTop: 560, ...up(s(10)) }}>Now online</div>
      <Img src={staticFile("wordmark.png")} style={{ width: 760, marginTop: 40, filter: "brightness(0)", ...up(s(16)) }} />
      <div style={{ ...BO, fontSize: 76, color: C.ink, marginTop: 40, ...up(s(26)) }}>Épicée. Libre.</div>
      <div style={{ ...CAPS, fontSize: 34, color: C.ink, marginTop: 70, letterSpacing: "0.16em", ...up(s(36)) }}>folliesdapresmidi.com</div>
      <div style={{ ...CAPS, fontSize: 20, color: C.mute, marginTop: 22, ...up(s(42)) }}>Designed & produced in Lebanon</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, ...up(sp(f, CREDIT)) }}>
        <span style={{ ...CAPS, fontSize: 20, color: C.mute }}>Website by</span>
        <svg width={wm} height={wmh} viewBox={WORDMARK.viewBox}><path d={WORDMARK.letters} fill={C.ink} /><path d={WORDMARK.spark} fill={C.orange} /></svg>
      </div>
    </AbsoluteFill>
  );
}

export const Main = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Giaza", "fonts/Giaza.otf"], ["Bodoni", "fonts/BodoniFLF-Italic.ttf", { style: "italic" }], ["Bodoni", "fonts/BodoniFLF-Roman.ttf"], ["Figures", "fonts/BodoniModa-600.woff2"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <BigNumber f={f} />
      <Indicator f={f} />
      <Phone f={f} />
      <Hook f={f} />
      <EndCard f={f} />
      <Grain f={f} opacity={0.035} />
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
    </AbsoluteFill>
  );
};
