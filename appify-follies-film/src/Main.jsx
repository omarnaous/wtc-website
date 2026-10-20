// "Échappée": the lookbook stepping into the Follies d'Après-Midi desert film. All picture is the brand's own: the
// hero film and the lookbook (cut out of the studio backdrop), set in the house typefaces (Giaza, Bodoni).
import { AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { FPS, BEAT, BAR, DROP, LOOKS, LINEUP, TURN, END, END_TEXT, DURATION } from "./timing.js";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { WORDMARK } from "./brand.js";

const C = { cream: "#F2EDE6", ink: "#0C0B0A", orange: "#F27043", sand: "#C9A274" };
const G = { fontFamily: "Giaza", lineHeight: 0.86 };
const BO = { fontFamily: "Bodoni", fontStyle: "italic" };
const CAPS = { fontFamily: "UI", fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase" };
const silk = Easing.bezier(0.19, 1, 0.22, 1), cut = Easing.bezier(0.76, 0, 0.24, 1);
const sp = (f, at, d = 16, s = 160) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: s } });

// the desert film, framed for 9:16: woman and tree centred, a slow push across the whole piece
function Film({ f, focus = 0.6, zoom = 1, y = 0, dim = 0 }) {
  const H = 1920 * zoom, W = (H * 1440) / 1080;
  const push = 1 + 0.06 * (f / DURATION);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.sand }}>
      <div style={{ position: "absolute", left: 540 - W * focus, top: 1920 - H + y, width: W, height: H, transform: `scale(${push})`, transformOrigin: `${focus * 100}% 90%` }}>
        <OffthreadVideo src={staticFile("film.mp4")} muted style={{ width: "100%", height: "100%" }} />
      </div>
      {dim > 0 && <AbsoluteFill style={{ background: C.ink, opacity: dim }} />}
    </AbsoluteFill>
  );
}

// a giant word, rising out of a mask letter by letter
function Word({ text, f, at, color, italic, size = 300, top = 300 }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", ...(italic ? { ...BO, fontStyle: "italic" } : G), fontSize: size, color, letterSpacing: italic ? "-0.02em" : "0.01em", whiteSpace: "nowrap" }}>
      {text.split("").map((ch, i) => {
        const t = interpolate(f - at - i * 1.6, [0, 16], [1, 0], { ...clamp, easing: silk });
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingTop: "0.12em", paddingBottom: "0.08em" }}>
            <span style={{ display: "block", whiteSpace: "pre", transform: `translateY(${t * 110}%)` }}>{ch}</span>
          </span>
        );
      })}
    </div>
  );
}

// a lookbook cut-out; `angle` picks front / side / back
const Model = ({ shot, h, x = 540, bottom = 0, style }) => (
  <Img src={staticFile(`cut/${shot}.png`)} style={{ position: "absolute", height: h, left: x, bottom, transform: "translateX(-50%)", ...style }} />
);

// the shutter between looks: three bands slam across, the next look is behind them
function Shutter({ f, at }) {
  const t = f - at;
  if (t < -6 || t > 8) return null;
  return (
    <>
      {[0, 1, 2].map((k) => {
        const p = interpolate(t, [-6 + k, -1 + k, 2 + k, 7 + k], [0, 1, 1, 0], { ...clamp, easing: cut });
        const fromLeft = k % 2 === 0;
        return <div key={k} style={{ position: "absolute", top: (1920 / 3) * k, height: 1920 / 3 + 1, left: 0, width: 1080, background: k === 1 ? C.orange : C.ink, transform: `translateX(${(fromLeft ? -1 : 1) * (1 - p) * 1080}px)` }} />;
      })}
    </>
  );
}

function Look({ f, look, i }) {
  const t = f - look.at;
  if (t < 0 || t >= BAR) return null;
  const beat = Math.min(3, Math.floor(t / BEAT));
  const shot = look.shots[[0, 1, 2, 0][beat]];
  const land = sp(f, look.at, 14, 180);
  const bg = look.bg === "film" ? <Film f={f} focus={0.56} /> : look.bg === "film2" ? <Film f={f} focus={0.74} zoom={1.15} y={60} />
    : <AbsoluteFill style={{ background: look.bg === "orange" ? C.orange : C.ink }} />;
  const desert = look.bg.startsWith("film");
  return (
    <AbsoluteFill>
      {bg}
      <Word text={look.word} f={f} at={look.at + 2} color={look.ink} italic={look.italic} size={look.word.length > 6 ? 250 : 300} top={360} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1920, transform: `translateY(${(1 - land) * 80}px) scale(${1.04 - 0.04 * land})`, transformOrigin: "50% 100%" }}>
        {desert && <div style={{ position: "absolute", left: 540 - 330, bottom: 18, width: 660, height: 70, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,25,10,.45), rgba(40,25,10,0))" }} />}
        <Model shot={shot} h={1560} bottom={-40} style={desert ? { filter: "sepia(0.18) saturate(1.05) contrast(1.03)" } : {}} />
      </div>
      {/* slate: look number, top-left; brand, top-right */}
      <div style={{ position: "absolute", left: 70, top: 200, ...CAPS, fontSize: 24, color: look.bg === "orange" ? C.ink : C.cream, opacity: interpolate(t, [4, 12], [0, 1], clamp) }}>Look {String(i + 1).padStart(2, "0")}<span style={{ opacity: 0.5 }}> / 04</span></div>
      <div style={{ position: "absolute", right: 70, top: 200, ...CAPS, fontSize: 24, color: look.bg === "orange" ? C.ink : C.cream, opacity: interpolate(t, [4, 12], [0, 1], clamp) }}>Échappée 4 à 7</div>
    </AbsoluteFill>
  );
}

function Lineup({ f }) {
  const t = f - LINEUP;
  if (t < 0 || t >= END - LINEUP) return null;
  const xs = [190, 420, 660, 890];
  return (
    <AbsoluteFill>
      <Film f={f} focus={0.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", color: C.cream }}>
        <div style={{ ...CAPS, fontSize: 24, opacity: interpolate(t, [0, 10], [0, 1], clamp) }}>Follies d'après-midi</div>
      </div>
      <Word text="The lookbook" f={f} at={LINEUP + 4} color={C.cream} italic size={170} top={360} />
      {LOOKS.map((lk, k) => {
        const p = sp(f, LINEUP + k * BEAT, 15, 150);
        const back = f >= TURN + k * 4;
        const walk = interpolate(f, [TURN + 20, END], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
        return (
          <div key={k} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: Math.min(1, p * 2) * (1 - walk), transform: `translateX(${(1 - p) * 260}px) translateY(${-walk * 40}px) scale(${1 - walk * 0.08})`, transformOrigin: `${xs[k]}px 1880px` }}>
            <div style={{ position: "absolute", left: xs[k] - 120, bottom: 22, width: 240, height: 36, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,25,10,.4), rgba(40,25,10,0))" }} />
            <Model shot={back ? lk.shots[2] : lk.shots[0]} h={980} x={xs[k]} bottom={10} style={{ filter: "sepia(0.2) saturate(1.05)" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function Intro({ f }) {
  if (f >= DROP) return null;
  const up = (at) => ({ opacity: interpolate(f, [at, at + 16], [0, 1], clamp), transform: `translateY(${interpolate(f, [at, at + 24], [20, 0], { ...clamp, easing: silk })}px)` });
  return (
    <AbsoluteFill>
      <Film f={f} focus={0.6} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,0) 40%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", color: C.cream }}>
        <Img src={staticFile("wordmark.png")} style={{ width: 640, ...up(6) }} />
        <div style={{ ...CAPS, fontSize: 26, marginTop: 50, ...up(22) }}>Échappée 4 à 7</div>
      </div>
    </AbsoluteFill>
  );
}

function End({ f }) {
  if (f < END) return null;
  const t = f - END;
  const up = (at) => ({ opacity: interpolate(f, [at, at + 18], [0, 1], clamp), transform: `translateY(${interpolate(f, [at, at + 30], [24, 0], { ...clamp, easing: silk })}px)` });
  const wm = 170, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill>
      <Film f={f} focus={0.6} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.28), rgba(0,0,0,0) 55%)", opacity: interpolate(t, [0, 20], [0, 1], clamp) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", color: C.cream }}>
        <Img src={staticFile("wordmark.png")} style={{ width: 760, ...up(END_TEXT[0]) }} />
        <div style={{ ...BO, fontSize: 92, marginTop: 40, ...up(END_TEXT[1]) }}>Épicée. Libre.</div>
        <div style={{ ...CAPS, fontSize: 30, marginTop: 70, letterSpacing: "0.22em", ...up(END_TEXT[2]) }}>folliesdapresmidi.com</div>
        <div style={{ ...CAPS, fontSize: 18, marginTop: 20, opacity: 0.75, ...up(END_TEXT[2] + 6) }}>Designed & produced in Lebanon</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, ...up(END_TEXT[3]) }}>
        <span style={{ ...CAPS, fontSize: 16, color: C.cream, opacity: 0.75 }}>Website by</span>
        <svg width={wm} height={wmh} viewBox={WORDMARK.viewBox}><path d={WORDMARK.letters} fill={C.cream} /><path d={WORDMARK.spark} fill={C.orange} /></svg>
      </div>
    </AbsoluteFill>
  );
}

export const Main = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Giaza", "fonts/Giaza.otf"], ["Bodoni", "fonts/BodoniFLF-Italic.ttf", { style: "italic" }], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Intro f={f} />
      {LOOKS.map((lk, i) => <Look key={i} f={f} look={lk} i={i} />)}
      <Lineup f={f} />
      <End f={f} />
      {[...LOOKS.map((l) => l.at), LINEUP].map((a) => <Shutter key={a} f={f} at={a} />)}
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(12,11,10,.35))" }} />
      <Grain f={f} opacity={0.07} />
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
    </AbsoluteFill>
  );
};
