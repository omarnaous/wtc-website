// Launch reel for the new folliesdapresmidi.com: the site's hero film, then the launch card with the site on a
// laptop and a phone.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import { HeroFilm } from "./fdm/HeroFilm.jsx";
import { Wipe, Grain, INK, BONE, CHILI, SERIF, SANS } from "./fdm/atoms.jsx";
import { useSiteFonts } from "./fonts.js";
import { FPS, FILM_CUT, STAGE, STAGE_LEN, S, DEVICE_FILM_LEN } from "./timing.js";
import { WORDMARK } from "./brand.js";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const silk = Easing.bezier(0.19, 1, 0.22, 1);       // the film's own ease
const inout = Easing.bezier(0.76, 0, 0.24, 1);
const sp = (f, at, damping = 22, stiffness = 90, mass = 1.1) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass } });
const LABEL = { fontFamily: SANS, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase" };

// the text rises out of a mask, glyph by glyph, like the film's titles
function Chars({ text, f, at, stagger = 2, dur = 30, style }) {
  return (
    <span style={{ display: "inline-flex", overflow: "hidden", paddingTop: "0.18em", marginTop: "-0.18em", paddingBottom: "0.22em", marginBottom: "-0.22em", ...style }}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{ display: "block", whiteSpace: "pre", transform: `translateY(${interpolate(f - at - i * stagger, [0, dur], [115, 0], { ...clamp, easing: silk })}%)` }}>{ch}</span>
      ))}
    </span>
  );
}

// one page of the site in a screen: the hero (film + the site's chrome over it) and the page below, scrolling
function Page({ t, kind, w, scrollTo }) {
  const desk = kind === "d";
  const vw = desk ? 1440 : 390, vh = desk ? 900 : 849;     // css viewport the captures were taken at
  const k = w / vw;
  const below = desk ? { w: 1440, h: 2500 } : { w: 390, h: 2600 };
  const y = interpolate(t, S.scroll, [0, scrollTo], { ...clamp, easing: inout });
  return (
    <div style={{ position: "absolute", left: 0, top: -y * k, width: w }}>
      <div style={{ position: "relative", width: w, height: vh * k, background: INK, overflow: "hidden" }}>
        <OffthreadVideo src={staticFile(desk ? "hero-desk.mp4" : "hero-phone.mp4")} muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        <Img src={staticFile(`new/${kind}-chrome.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      </div>
      <Img src={staticFile(`new/${kind}-below.jpg`)} style={{ display: "block", width: w, height: below.h * k }} />
    </div>
  );
}

function Laptop({ t }) {
  const p = sp(t, S.laptop);
  const W = 900, H = 563, bez = 14;
  return (
    <div style={{ position: "absolute", left: (1080 - W) / 2 - 40, top: 610, width: W, transform: `translateY(${(1 - p) * 140}px)`, opacity: Math.min(1, p * 1.6) }}>
      <div style={{ position: "relative", width: W, height: H, background: "#0d0d0f", borderRadius: "26px 26px 6px 6px", padding: bez, boxShadow: "0 0 0 2px #2b2b2e inset" }}>
        <div style={{ position: "relative", width: W - 2 * bez, height: H - 2 * bez, overflow: "hidden", borderRadius: 6, background: INK }}>
          <Page t={t} kind="d" w={W - 2 * bez} scrollTo={1560} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,.07), rgba(255,255,255,0) 40%)" }} />
        </div>
        <div style={{ position: "absolute", left: "50%", top: 5, width: 6, height: 6, marginLeft: -3, borderRadius: 9, background: "#26262a" }} />
      </div>
      {/* the base */}
      <div style={{ position: "relative", left: -70, width: W + 140, height: 24, background: "linear-gradient(180deg, #e4e2de, #b9b6b0 60%, #8f8c86)", borderRadius: "3px 3px 22px 22px", boxShadow: "0 30px 60px rgba(12,11,10,.28)" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, width: 150, height: 9, marginLeft: -75, background: "linear-gradient(180deg, #a9a6a0, #cfccc7)", borderRadius: "0 0 10px 10px" }} />
      </div>
    </div>
  );
}

function Phone({ t }) {
  const p = sp(t, S.phone, 20, 100);
  const W = 300, H = Math.round((W * 844) / 390) + 24, bez = 11;
  return (
    <div style={{ position: "absolute", left: 700, top: 820, width: W, height: H, transform: `translateY(${(1 - p) * 220}px) rotate(${(1 - p) * 4}deg)`, opacity: Math.min(1, p * 1.6) }}>
      <div style={{ position: "absolute", inset: 0, background: "#0d0d0f", borderRadius: 52, boxShadow: "0 0 0 2px #2f2f33 inset, 0 40px 80px rgba(12,11,10,.35)" }} />
      <div style={{ position: "absolute", left: bez, top: bez, width: W - 2 * bez, height: H - 2 * bez, overflow: "hidden", borderRadius: 42, background: INK }}>
        <Page t={t} kind="m" w={W - 2 * bez} scrollTo={1640} />
        <div style={{ position: "absolute", left: "50%", top: 9, width: 86, height: 24, marginLeft: -43, borderRadius: 20, background: "#000" }} />
      </div>
    </div>
  );
}

// lives in a <Sequence from={STAGE}>, so its frame (and the device videos') starts at the cut
function Stage() {
  const t = useCurrentFrame();
  const up = (at) => ({ opacity: interpolate(t, [at, at + 18], [0, 1], clamp), transform: `translateY(${interpolate(t, [at, at + 30], [24, 0], { ...clamp, easing: silk })}px)` });
  const push = interpolate(t, [0, STAGE_LEN], [1, 1.035]);
  const wm = 200, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ background: BONE }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 45% at 50% 52%, rgba(255,255,255,.65), rgba(242,237,230,0) 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 205, textAlign: "center" }}>
        <div style={{ ...LABEL, fontSize: 24, color: CHILI, ...up(S.title - 6) }}>The new website</div>
        <div style={{ fontFamily: SERIF, fontSize: 168, lineHeight: 0.9, letterSpacing: "-0.02em", color: INK, marginTop: 26, display: "flex", justifyContent: "center" }}>
          <Chars text="Now " f={t} at={S.title} /><Chars text="online." f={t} at={S.title + 8} style={{ fontStyle: "italic" }} />
        </div>
      </div>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 60%" }}>
        <Laptop t={t} />
        <Phone t={t} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1488, textAlign: "center" }}>
        <div style={{ height: 1, width: 520, margin: "0 auto", background: "rgba(12,11,10,.25)", transform: `scaleX(${interpolate(t, [S.url - 10, S.url + 30], [0, 1], { ...clamp, easing: silk })})` }} />
        <div style={{ ...LABEL, fontSize: 34, color: INK, letterSpacing: "0.2em", marginTop: 30, ...up(S.url) }}>folliesdapresmidi.com</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 34, ...up(S.credit) }}>
          <span style={{ ...LABEL, fontSize: 18, color: "rgba(12,11,10,.5)" }}>Website by</span>
          <svg width={wm} height={wmh} viewBox={WORDMARK.viewBox} style={{ marginTop: -6 }}><path d={WORDMARK.letters} fill={INK} /><path d={WORDMARK.spark} fill={CHILI} /></svg>
        </div>
      </div>
      <Grain opacity={0.12} />
    </AbsoluteFill>
  );
}

export const Reel = ({ music = true }) => {
  const f = useCurrentFrame();
  useSiteFonts();
  return (
    <AbsoluteFill style={{ background: INK }}>
      {f < FILM_CUT + 14 && <Sequence durationInFrames={FILM_CUT + 14}><HeroFilm /></Sequence>}
      <Sequence from={STAGE}><Stage /></Sequence>
      <Wipe start={STAGE - 12} color={CHILI} side="left" enter={12} hold={2} exit={14} />
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
    </AbsoluteFill>
  );
};

// the film alone, at the site's own aspect ratios, to play inside the devices
export const HeroOnly = () => { useSiteFonts(); return <HeroFilm />; };
