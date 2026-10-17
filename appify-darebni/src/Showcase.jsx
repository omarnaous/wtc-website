// Darebni AI, the app Appify built: a 9:16 showcase made only from the real app screens (from darebniai.com) and the
// app's own words. One idea: the phone never leaves the centre; each bar the screen inside it pushes to the next
// feature while a glowing frame lands on the part of the screen that feature is about. It ends with the screens fanned
// out, "Now on the App Store", and "Designed & built by Appify".
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { ICON, NAME, TAG, PHONE, FEATS, FEAT_LEN, END } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, Burst, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";

const W = 1080, H = 1920;
const C = { ink: "#05061A", uv: "#5B2BFF", iris: "#8F72FF", lilac: "#BDB2FF", sky: "#74C6FF", soft: "#C9C4DD", mute: "#8A84A3" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 13, stiffness = 210) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const grad = { background: `linear-gradient(100deg, ${C.lilac}, ${C.iris} 45%, ${C.sky})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
const Spark = ({ size, color = C.iris }) => <svg width={size} height={size} viewBox="0 0 100 100"><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;

// Screen images are 780 x 1694. `box` is the part of the screen each feature is about, in those pixels.
const SCREEN = { w: 780, h: 1694 };
export const FEATURES = [
  { img: "onboarding", tag: "It starts with you", title: ["A few details,", "then it plans."], box: [36, 210, 708, 190] },
  { img: "home", tag: "AI programming", title: ["Today's session,", "already programmed."], box: [36, 250, 708, 380] },
  { img: "logging", tag: "Live tracker", title: ["Log a set.", "Tap. Rest. Next."], box: [40, 800, 700, 90] },
  { img: "builder", tag: "Workout builder", title: ["Build your own", "workouts, free."], box: [36, 1490, 708, 110] },
  { img: "analytics", tag: "AI analytics", title: ["What's actually", "working."], box: [36, 560, 708, 360] },
  { img: "pinned", tag: "Pinned lifts", title: ["Your lifts, charted", "over months."], box: [36, 380, 708, 330] },
  { img: "explore", tag: "Exercise library", title: ["1,323 exercises.", "70 workouts."], box: [36, 255, 708, 265] },
];

function Backdrop({ f, glow = 1 }) {
  return (
    <>
      <AbsoluteFill style={{ background: C.ink }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${f * 0.5}px`, WebkitMaskImage: "radial-gradient(ellipse 85% 60% at 50% 55%, #000 25%, transparent 75%)", maskImage: "radial-gradient(ellipse 85% 60% at 50% 55%, #000 25%, transparent 75%)" }} />
      <AbsoluteFill style={{ opacity: glow, background: "radial-gradient(ellipse 60% 40% at 50% 66%, rgba(91,43,255,.55), transparent 70%), radial-gradient(ellipse 50% 25% at 50% 8%, rgba(116,198,255,.14), transparent 70%)" }} />
    </>
  );
}

// An iPhone-shaped frame; the screenshots already carry the status bar and the Dynamic Island.
const Phone = ({ w, children, style }) => {
  const bez = Math.round(w * 0.028), r = w * 0.15, ih = ((w - 2 * bez) * SCREEN.h) / SCREEN.w;
  return (
    <div style={{ position: "absolute", width: w, height: ih + 2 * bez, borderRadius: r, background: "#0B0A14", padding: bez, boxShadow: "0 60px 140px -30px rgba(91,43,255,.75), 0 0 0 2px rgba(189,178,255,.25), inset 0 0 0 2px rgba(255,255,255,.08)", ...style }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - bez, overflow: "hidden", background: "#E9E6FF" }}>{children}</div>
    </div>
  );
};
const Screen = ({ name, style }) => <Img src={staticFile(`screens/${name}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "cover", ...style }} />;

// ── the app: icon, name, what it is ─────────────────────────────────────────────────────────────────────
function Hook({ f }) {
  const ic = sp(f, ICON, 10, 260), out = interpolate(f, [FEATS[0] - 10, FEATS[0]], [0, 1], { ...clamp, easing: easeIn });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", opacity: 1 - out, transform: `translateY(${-60 * out}px)` }}>
      <Img src={staticFile("icon.png")} style={{ width: 170, height: 170, borderRadius: 40, boxShadow: "0 30px 80px rgba(91,43,255,.6), 0 0 0 2px rgba(189,178,255,.3)", opacity: Math.min(1, ic * 2), transform: `scale(${interpolate(Math.min(ic, 1.15), [0, 1], [0.4, 1])})` }} />
      <div style={{ ...D, fontSize: 132, color: "#fff", marginTop: 40, ...rise(sp(f, NAME, 12, 240), 50) }}>Darebni <span style={grad}>AI</span></div>
      <div style={{ ...UI, fontWeight: 400, fontSize: 46, color: C.soft, marginTop: 26, ...rise(sp(f, TAG), 30) }}>An AI workout coach for iPhone.</div>
      <div style={{ ...M, fontSize: 24, color: C.iris, marginTop: 34, display: "inline-flex", gap: 12, alignItems: "center", ...rise(sp(f, TAG + 10), 20) }}><Spark size={22} />Built by Appify</div>
    </div>
  );
}

// ── one feature per bar: caption on top, the screen pushes up inside the phone, a frame lands on the feature ─
function Features({ f }) {
  const k = Math.max(0, Math.min(FEATURES.length - 1, Math.floor((f - FEATS[0]) / FEAT_LEN)));
  const at = FEATS[k], ft = FEATURES[k], prev = FEATURES[k - 1];
  const phoneIn = sp(f, PHONE, 15, 120);
  const ending = interpolate(f, [END - 4, END + 16], [0, 1], { ...clamp, easing: easeOut });
  // phone geometry: centred, with a slow sway that changes direction every feature
  const PW = 580, bez = Math.round(PW * 0.028), inW = PW - 2 * bez, s = inW / SCREEN.w;
  const top = interpolate(Math.min(1, phoneIn), [0, 1], [H + 40, f < FEATS[0] ? 760 : 580]);
  const settle = interpolate(f, [FEATS[0] - 10, FEATS[0] + 8], [0, 1], { ...clamp, easing: easeOut });
  const y = f < FEATS[0] ? top : interpolate(settle, [0, 1], [760, 580]);
  const sway = Math.sin(f / 26) * 2.2 + (k % 2 ? -1 : 1) * interpolate(f, [at, at + 20], [1.6, 0], { ...clamp, easing: easeOut });
  const push = interpolate(f, [at, at + 14], [0, 1], { ...clamp, easing: easeOut });
  const box = sp(f, at + 12, 14, 200), [bx, by, bw, bh] = ft.box;
  const showFeat = f >= FEATS[0];
  return (
    <AbsoluteFill style={{ opacity: 1 - ending, transform: `scale(${1 - 0.08 * ending})` }}>
      {showFeat && (
        <div key={k} style={{ position: "absolute", left: 90, right: 90, top: 150 }}>
          <div style={{ ...M, fontSize: 24, color: C.iris, display: "flex", gap: 16, alignItems: "center", ...rise(sp(f, at + 2), 20) }}>
            <span style={{ color: C.sky, padding: "8px 12px", border: "2px solid rgba(116,198,255,.4)", borderRadius: 10 }}>0{k + 1}</span>{ft.tag}
          </div>
          <div style={{ ...D, fontSize: 84, color: "#fff", marginTop: 28, whiteSpace: "nowrap" }}>
            <div style={rise(sp(f, at + 4, 12, 220), 50)}>{ft.title[0]}</div>
            <div style={{ ...grad, ...rise(sp(f, at + 9, 12, 220), 50) }}>{ft.title[1]}</div>
          </div>
        </div>
      )}
      <Phone w={PW} style={{ left: (W - PW) / 2, top: y, transform: `rotate(${sway}deg)`, transformOrigin: "50% 80%" }}>
        {!showFeat && <Screen name="home" />}
        {showFeat && prev && push < 1 && <Screen name={prev.img} style={{ transform: `translateY(${-22 * push}%) scale(${1 - 0.06 * push})`, filter: `brightness(${1 - 0.35 * push})` }} />}
        {showFeat && <Screen name={ft.img} style={{ transform: `translateY(${prev ? (1 - push) * 100 : 0}%)`, boxShadow: "0 -30px 60px rgba(0,0,0,.25)" }} />}
        {showFeat && (
          <div style={{ position: "absolute", left: bx * s, top: by * s, width: bw * s, height: bh * s, borderRadius: 26 * s, border: `${4}px solid ${C.uv}`, boxShadow: `0 0 0 ${8 * (1 - Math.min(1, box))}px rgba(91,43,255,.25), 0 0 40px rgba(91,43,255,${0.55 * Math.min(1, box)})`, opacity: Math.min(1, box * 2), transform: `scale(${interpolate(Math.min(box, 1.1), [0, 1], [1.12, 1])})` }} />
        )}
      </Phone>
      {/* seven dots: where we are in the tour */}
      {showFeat && <div style={{ position: "absolute", left: 0, right: 0, top: 1850, display: "flex", justifyContent: "center", gap: 12 }}>
        {FEATURES.map((_, i) => <span key={i} style={{ width: i === k ? 34 : 10, height: 10, borderRadius: 5, background: i === k ? C.iris : "rgba(189,178,255,.3)" }} />)}
      </div>}
    </AbsoluteFill>
  );
}

// ── the end: the screens fanned out, on the App Store, built by Appify ──────────────────────────────────────
function EndCard({ f }) {
  const t = f - END;
  const fan = [["logging", -1], ["analytics", 1], ["home", 0]];
  const ttl = sp(t, 18, 12, 220), badge = sp(t, 30, 11, 260), by = sp(t, 44, 13, 220);
  const WW = 300, WH = (WW * 1167) / 3224;
  return (
    <AbsoluteFill>
      {fan.map(([img, side], i) => {
        const p = sp(t, 2 + i * 3, 14, 150), w = side ? 440 : 500;
        return (
          <Phone key={img} w={w} style={{ left: (W - w) / 2 + side * 290 * Math.min(1, p), top: 820 + (side ? 90 : 0) + (1 - Math.min(1, p)) * 300, transform: `rotate(${side * 9 * Math.min(1, p)}deg)`, opacity: Math.min(1, p * 2), zIndex: side ? 1 : 2 }}>
            <Screen name={img} />
          </Phone>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center" }}>
        <div style={{ ...D, fontSize: 120, color: "#fff", ...rise(ttl, 50) }}>Darebni <span style={grad}>AI</span></div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 36, padding: "20px 34px", borderRadius: 99, background: "#fff", color: C.ink, ...UI, fontSize: 38, opacity: Math.min(1, badge * 2), transform: `scale(${interpolate(Math.min(badge, 1.1), [0, 1], [1.3, 1])})` }}>
          <Img src={staticFile("icon.png")} style={{ width: 50, height: 50, borderRadius: 12 }} />Now on the App Store
        </div>
        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, ...rise(by, 30) }}>
          <span style={{ ...M, fontSize: 22, color: C.mute }}>Designed &amp; built by</span>
          <svg viewBox={WORDMARK.viewBox} width={WW} height={WH}><path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.iris} /></svg>
          <span style={{ ...M, fontSize: 22, color: "rgba(255,255,255,.7)" }}>appify-lb.com</span>
        </div>
      </div>
      <Burst f={f} cx={W / 2} cy={420} start={END + 32} count={50} speed={26} seed="store" colors={["#fff", C.iris, C.sky]} />
    </AbsoluteFill>
  );
}

export const Showcase = ({ music = true }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
      <Backdrop f={f} />
      {f < FEATS[0] && <Hook f={f} />}
      {f < END + 20 && <Features f={f} />}
      {f >= END - 4 && <EndCard f={f} />}
      <Vignette strength={0.3} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};

// The card photo: the same three screens, fanned, under the name. A still (the first card on the website).
export const Photo = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }], ["Mono", "GeistMono-500.ttf"]]);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Backdrop f={0} />
      <EndCardStill />
      <Vignette strength={0.3} />
    </AbsoluteFill>
  );
};
function EndCardStill() {
  const fan = [["logging", -1], ["analytics", 1], ["home", 0]];
  return (
    <>
      {fan.map(([img, side]) => {
        const w = side ? 440 : 500;
        return <Phone key={img} w={w} style={{ left: (W - w) / 2 + side * 290, top: 760 + (side ? 90 : 0), transform: `rotate(${side * 9}deg)`, zIndex: side ? 1 : 2 }}><Screen name={img} /></Phone>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center" }}>
        <Img src={staticFile("icon.png")} style={{ width: 150, height: 150, borderRadius: 34, boxShadow: "0 30px 80px rgba(91,43,255,.6), 0 0 0 2px rgba(189,178,255,.3)" }} />
        <div style={{ ...D, fontSize: 120, color: "#fff", marginTop: 34 }}>Darebni <span style={grad}>AI</span></div>
        <div style={{ ...UI, fontWeight: 400, fontSize: 44, color: C.soft, marginTop: 22 }}>An AI workout coach for iPhone.</div>
      </div>
    </>
  );
}
