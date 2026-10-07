// Motion-graphics showcase: a plain photo gets scrolled past, then the WTC launch film plays in full
// in a screen frame while labels name each technique; Dev narrates and closes on the offer.
import { AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, TECH, DATA, CUT, filmFrame, filmClock } from "./timing.js";
import { C, DISPLAY, MONO, Words } from "./ui.jsx";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Grain, Vignette } from "./fx.jsx";
import { random } from "remotion";
import { WORDMARK, sparkPath } from "./brand.js";
import { Sneaker } from "./products.jsx";
import { Presenter } from "./Presenter.jsx";

const SX = 30, SY = 420, SW = 1020, SH = Math.round(1020 * 9 / 16); // the screen the film plays in

function Hook({ f }) {
  const inP = spring({ frame: f - 4, fps: 30, config: { damping: 14 } });
  const away = interpolate(f, [T.swipe, T.swipe + 14], [0, 1], { ...clamp, easing: easeIn });
  const gone = interpolate(f, [T.swipe + 12, T.swipe + 18], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div style={{ opacity: interpolate(f, [T.show - 18, T.show - 13], [1, 0], clamp) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 226, textAlign: "center", ...MONO, fontSize: 34, color: C.uv, letterSpacing: "0.3em" }}>POV</div>
        <Words text="Another product photo." y={286} size={80} color={C.ink} start={4} />
        <Words text="Zero reactions." y={384} size={100} color={C.alert} start={34} />
      </div>
      {/* a plain feed post */}
      <div style={{ position: "absolute", left: 230, top: 510, width: 620, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 30px 60px rgba(10,9,19,.18)", border: "2px solid rgba(10,9,19,.08)", opacity: Math.min(1, inP * 1.5) * (1 - away), transform: `translateY(${(1 - inP) * 80 - away * 900}px) rotate(${away * -6}deg)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px" }}>
          <div style={{ width: 46, height: 46, borderRadius: 99, background: "#ddd" }} />
          <div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 24, color: "#111" }}>your.store</div>
        </div>
        <Img src={staticFile("still.jpg")} style={{ width: 620, height: 470, objectFit: "cover", filter: "saturate(.75)" }} />
        <div style={{ padding: "16px 22px 22px", fontFamily: "UI", fontSize: 24, color: "#222" }}>♡ 3 likes · New watch in stock 🔥 DM for price</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...MONO, fontSize: 48, color: C.alert, opacity: gone * interpolate(f, [T.turn - 4, T.turn], [1, 0], clamp) }}>GOOD LUCK WITH THAT.</div>
    </AbsoluteFill>
  );
}

function Showcase({ f, client, film }) {
  const t = f >= T.show ? filmClock(f) : -1;          // seconds on the film's clock
  const inP = f >= T.show ? 1 : 0;                                                  // hard cut in
  const hd = spring({ frame: f - T.reveal, fps: 30, config: { damping: 13, stiffness: 180 } });  // header lands on the reveal line
  const outP = interpolate(f, [T.twist, T.twist + 8], [0, 1], { ...clamp, easing: easeIn });
  const cur = TECH.findIndex(([a, b]) => t >= a && t < b);
  const glow = 0.35 + 0.1 * Math.sin(f / 16);
  return (
    <AbsoluteFill style={{ opacity: 1 - outP, transform: `translateY(${-outP * 120}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", ...MONO, fontSize: 28, color: C.uv, letterSpacing: "0.22em", opacity: hd }}>{film.toUpperCase()} · {client}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 286, textAlign: "center", ...DISPLAY, fontSize: 78, color: C.ink, opacity: hd, transform: `translateY(${(1 - hd) * 40}px) scale(${0.9 + 0.1 * hd})` }}>Made by Appify <span style={{ color: C.uv }}>✦</span></div>
      <div style={{ position: "absolute", left: SX - 14, top: SY - 14, width: SW + 28, height: SH + 28, borderRadius: 34, background: "#14121F", border: "2px solid rgba(10,9,19,.6)", boxShadow: `0 40px 100px rgba(91,43,255,${glow * 0.7})`, transform: `scale(${0.85 + 0.15 * inP})`, opacity: Math.min(1, inP * 1.4) }}>
        <div style={{ position: "absolute", left: 14, top: 14, width: SW, height: SH, borderRadius: 22, overflow: "hidden", background: "#000" }}>
          {CUT.map(([a, b], i) => (
            <Sequence key={i} from={filmFrame(a)} durationInFrames={Math.round((b - a) * 30)} layout="none">
              <OffthreadVideo src={staticFile("wtc.mp4")} muted startFrom={Math.round(a * 30)} style={{ position: "absolute", inset: 0, width: SW, height: SH }} />
            </Sequence>
          ))}
        </div>
      </div>
      {/* film progress */}
      <div style={{ position: "absolute", left: SX, top: SY + SH + 26, width: SW, height: 6, borderRadius: 9, background: "rgba(10,9,19,.1)", opacity: inP }}>
        <div style={{ width: `${Math.max(0, Math.min(1, t / 25)) * 100}%`, height: 6, borderRadius: 9, background: C.uv }} />
      </div>
      {/* technique label */}
      {TECH.map(([a, b, label], i) => {
        if (i !== cur) return null;
        const p = spring({ frame: f - filmFrame(a), fps: 30, config: { damping: 11, stiffness: 220 } });
        const o = interpolate(t, [b - 0.25, b], [1, 0], clamp);
        return (
          <div key={label} style={{ position: "absolute", left: 0, right: 0, top: SY + SH + 64, display: "flex", justifyContent: "center", gap: 16, alignItems: "center", opacity: Math.min(1, p * 1.6) * o, transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})` }}>
            <span style={{ ...MONO, fontSize: 26, color: C.mute }}>0{i + 1}/0{TECH.length}</span>
            <span style={{ padding: "12px 28px", borderRadius: 99, background: C.uv, ...DISPLAY, fontSize: 50, color: "#fff", boxShadow: "0 14px 40px rgba(91,43,255,.45)" }}>{label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function Person({ on, k }) {
  const c = on ? C.uv : "rgba(10,9,19,.14)";
  return (
    <svg width="74" height="96" viewBox="0 0 74 96" style={{ transform: `scale(${1 + 0.18 * k}) translateY(${-8 * k}px)` }}>
      <circle cx="37" cy="22" r="17" fill={c} />
      <path d="M8,92 Q8,46 37,46 Q66,46 66,92 Z" fill={c} />
    </svg>
  );
}

// Twist: "...but my product isn't WTC" -> "Exactly." A flat grey sneaker photo turns into a motion ad.
function Twist({ f }) {
  const inP = spring({ frame: f - T.twist, fps: 30, config: { damping: 14 } });
  const out = interpolate(f, [T.conv, T.conv + 10], [0, 1], { ...clamp, easing: easeIn });
  const m = f - T.morph;
  const flip = interpolate(m, [0, 10], [0, 1], { ...clamp, easing: easeOut });
  const color = interpolate(m, [4, 14], [0, 1], clamp);
  const hero = spring({ frame: m - 6, fps: 30, config: { damping: 9, stiffness: 200 } });
  const word = (i) => spring({ frame: m - 10 - i * 4, fps: 30, config: { damping: 10, stiffness: 240 } });
  const price = interpolate(m, [16, 34], [0, 129], { ...clamp, easing: easeOut });
  const spinY = m >= 0 ? interpolate(hero, [0, 1], [-90, 0]) + Math.sin(m / 14) * 10 : 0;
  const tiltR = m >= 0 ? Math.sin(m / 10) * 4 - 6 : 0;
  const after = m >= 0;
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, inP * 1.5) * (1 - out), transform: `translateY(${(1 - inP) * 60 - out * 80}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", ...MONO, fontSize: 28, color: C.uv, letterSpacing: "0.22em" }}>{after ? "SAME PRODUCT · IN MOTION" : "YOUR PRODUCT"}</div>
      <div style={{ position: "absolute", left: 140, top: 300, width: 800, height: 800, borderRadius: 36, overflow: "hidden",
        background: after ? `linear-gradient(160deg, rgba(91,43,255,${color}) 0%, rgba(20,18,31,${color}) 70%), #EEEDF2` : "#EEEDF2",
        border: "2px solid rgba(10,9,19,.08)", boxShadow: after ? `0 40px 100px rgba(91,43,255,${0.45 * color})` : "0 24px 50px rgba(10,9,19,.12)",
        transform: `perspective(1400px) rotateY(${interpolate(flip, [0, 0.5, 1], [0, 12, 0])}deg) scale(${1 + 0.04 * Math.sin(Math.min(1, flip) * Math.PI)})` }}>
        {!after && <div style={{ position: "absolute", left: 30, top: 26, ...MONO, fontSize: 22, color: C.mute }}>IMG_0412.JPG</div>}
        <div style={{ position: "absolute", left: 0, right: 0, top: after ? 250 : 270, display: "flex", justifyContent: "center", filter: after ? "none" : "grayscale(1) contrast(.85)",
          transform: `perspective(1200px) rotateY(${spinY}deg) rotate(${tiltR}deg) scale(${after ? 0.9 + 0.2 * hero : 1})` }}>
          <Sneaker size={600} color={after ? C.uv : "#9C99A8"} accent="#FFFFFF" id="twist" />
        </div>
        {after && (
          <div style={{ position: "absolute", left: 60, top: 70, display: "flex", gap: 28 }}>
            {["NEW", "DROP."].map((w, i) => (
              <span key={w} style={{ display: "inline-block", ...DISPLAY, fontSize: 120, color: i ? C.iris : "#fff", transform: `scale(${interpolate(word(i), [0, 1], [1.6, 1])})`, opacity: Math.min(1, word(i) * 2) }}>{w}</span>
            ))}
          </div>
        )}
        {after && (
          <div style={{ position: "absolute", left: 60, bottom: 60, padding: "12px 28px", borderRadius: 99, background: "#fff", ...DISPLAY, fontSize: 64, color: C.ink, fontVariantNumeric: "tabular-nums", opacity: Math.min(1, color * 2) }}>${Math.round(price)}</div>
        )}
        {after && <div style={{ position: "absolute", right: 40, top: 30, ...MONO, fontSize: 20, color: "rgba(255,255,255,.75)", opacity: color }}>EXAMPLE · MADE IN THIS REEL</div>}
      </div>
      <Burst f={f} cx={540} cy={700} start={T.morph + 6} count={70} speed={30} colors={["#fff", C.iris, C.sky]} seed="morph" scale={0.9} />
      <Shockwave f={f} cx={540} cy={700} start={T.morph + 6} max={900} width={6} rgb="91,43,255" dur={22} />
    </AbsoluteFill>
  );
}

// Proof: the crowd lights up to 85% as the voice says it; source on screen.
function Proof({ f }) {
  const P1 = DATA.people;
  const head = spring({ frame: f - T.conv - 4, fps: 30, config: { damping: 13 } });
  const out = interpolate(f, [T.cta, T.cta + 12], [0, 1], { ...clamp, easing: easeIn });
  const words = ["Stop.", "Watch.", "Remember."];
  const revealed = f >= P1.at;
  const n = interpolate(f, [P1.at - 2, P1.at + 20], [0, P1.pct], { ...clamp, easing: easeOut });
  const litP = interpolate(f, [P1.at, P1.at + 18], [0, 1], { ...clamp, easing: easeOut });
  const lit = Math.round(litP * (P1.pct / 100) * 20);
  const slam = spring({ frame: f - P1.at, fps: 30, config: { damping: 8, stiffness: 280 } });
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 80}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 246, display: "flex", justifyContent: "center", gap: 20 }}>
        {words.map((w, i) => {
          const p = spring({ frame: f - T.conv - 6 - i * 12, fps: 30, config: { damping: 10, stiffness: 240 } });
          return <span key={w} style={{ ...DISPLAY, fontSize: 80, color: i === 2 ? C.uv : C.ink, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 40}px) scale(${interpolate(p, [0, 1], [1.4, 1])})`, display: "inline-block" }}>{w}</span>;
        })}
      </div>
      <div style={{ position: "absolute", left: 60, top: 420, width: 960, height: 560, borderRadius: 32, background: "#fff", border: "2px solid rgba(10,9,19,.08)", boxShadow: "0 24px 60px rgba(10,9,19,.10)", opacity: head, transform: `translateY(${(1 - head) * 40}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", ...DISPLAY, fontSize: 190, lineHeight: 1, color: revealed ? C.uv : "rgba(10,9,19,.15)", fontVariantNumeric: "tabular-nums", transform: `scale(${revealed ? 1 + 0.2 * Math.max(0, 1 - slam) : 1})` }}>{Math.round(n)}%</div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 248, textAlign: "center", ...DISPLAY, fontSize: 38, color: C.ink, opacity: revealed ? 1 : 0.25 }}>{P1.text}</div>
        <div style={{ position: "absolute", left: 40, top: 330, width: 880, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", rowGap: 12, justifyItems: "center" }}>
          {Array.from({ length: 20 }, (_, i) => {
            const k = i < lit ? Math.max(0, 1 - (litP * (P1.pct / 100) * 20 - i)) : 0;
            return <Person key={i} on={i < lit} k={Math.min(1, k)} />;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", ...MONO, fontSize: 22, color: C.mute, opacity: head }}>{DATA.source.toUpperCase()}</div>
    </AbsoluteFill>
  );
}

function Cta({ f, cta, url }) {
  const e = (d) => spring({ frame: f - T.cta - d, fps: 30, config: { damping: 12, stiffness: 190 } });
  const rise = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px)` });
  const q2 = spring({ frame: f - T.q2, fps: 30, config: { damping: 12, stiffness: 200 } });
  const strike = interpolate(f, [T.q2 - 6, T.q2 + 4], [0, 1], { ...clamp, easing: easeOut });
  const box = spring({ frame: f - T.fun + 4, fps: 30, config: { damping: 10, stiffness: 220 } });
  const wmW = 360, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  const W2 = 760, H2 = Math.round(760 * 9 / 16);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", ...rise(e(4)) }}>
        <div style={{ position: "relative", display: "inline-block", ...DISPLAY, fontSize: 70, color: f >= T.q2 ? C.mute : C.ink }}>
          Still posting product photos?
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 8, borderRadius: 8, background: C.alert, transform: `scaleX(${strike})`, transformOrigin: "0 50%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 320, textAlign: "center", ...DISPLAY, fontSize: 84, lineHeight: 1.05, color: C.ink, opacity: Math.min(1, q2 * 1.5), transform: `translateY(${(1 - q2) * 40}px)` }}>
        Or making people <span style={{ color: C.uv }}>stop scrolling?</span>
      </div>
      {/* the film keeps playing, small */}
      <div style={{ position: "absolute", left: (1080 - W2) / 2 - 12, top: 540, width: W2 + 24, height: H2 + 24, borderRadius: 28, background: "#14121F", border: "2px solid rgba(10,9,19,.6)", boxShadow: "0 30px 80px rgba(91,43,255,.35)", ...rise(e(10)) }}>
        <div style={{ position: "absolute", left: 12, top: 12, width: W2, height: H2, borderRadius: 18, overflow: "hidden", background: "#000" }}>
          <Sequence from={T.cta} layout="none">
            <Loop durationInFrames={5 * 30} layout="none">
              <OffthreadVideo src={staticFile("wtc.mp4")} muted startFrom={9 * 30} style={{ width: W2, height: H2 }} />
            </Loop>
          </Sequence>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 540 + H2 + 60, display: "grid", justifyItems: "center", opacity: Math.min(1, box * 1.5), transform: `scale(${interpolate(box, [0, 1], [1.3, 1])})` }}>
        <div style={{ padding: "22px 52px", borderRadius: 30, background: C.uv, boxShadow: "0 20px 60px rgba(91,43,255,.5)", textAlign: "center" }}>
          <div style={{ ...DISPLAY, fontSize: 76, color: "#fff" }}>DM “{cta.toUpperCase()}”</div>
          <div style={{ ...DISPLAY, fontSize: 32, color: "rgba(255,255,255,.9)", marginTop: 8, whiteSpace: "nowrap" }}>Limited-time offer on motion graphics packages</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 330, width: 700, top: 1520, display: "grid", justifyItems: "center", gap: 14, ...rise(e(30)) }}>
        <svg viewBox={WORDMARK.viewBox} width={wmW} height={wmH}><path d={WORDMARK.letters} fill={C.ink} /><path d={WORDMARK.spark} fill={C.uv} /></svg>
        <div style={{ ...MONO, fontSize: 30, color: C.ink, letterSpacing: "0.18em" }}>{url}</div>
      </div>
    </>
  );
}

export const Main = (props) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-400.ttf", { weight: "400" }], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const [sx, sy] = shake(f, T.show, 14, 4);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {/* graph paper, same as the Subscription Killer post, for a consistent feed */}
      <AbsoluteFill style={{ background: C.paper, backgroundImage: `linear-gradient(${C.gridMajor} 2px, transparent 2px), linear-gradient(90deg, ${C.gridMajor} 2px, transparent 2px), linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: "180px 180px, 180px 180px, 36px 36px, 36px 36px", backgroundPosition: `0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {f < T.show && <Hook f={f} />}
        {f >= T.show - 14 && f < T.show && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...DISPLAY, fontSize: 170, color: C.uv, opacity: interpolate(f, [T.show - 14, T.show - 11], [0, 1], clamp), transform: `scale(${interpolate(f, [T.show - 14, T.show - 7], [1.6, 1], { ...clamp, easing: easeOut })}) rotate(-4deg)` }}>THIS?</div>
        )}
        {f >= T.show && f < T.twist + 9 && <Showcase f={f} client={props.client} film={props.film} />}
        {f >= T.twist && f < T.conv + 11 && <Twist f={f} />}
        {f >= T.conv && f < T.cta + 14 && <Proof f={f} />}
        {f >= T.cta && <Cta f={f} cta={props.cta} url={props.url} />}
      </AbsoluteFill>
      <Presenter />
      <Shockwave f={f} cx={540} cy={760} start={T.show} max={1300} width={8} rgb="91,43,255" dur={22} />
      <Vignette strength={0.18} />
      <Grain f={f} opacity={0.05} />
    </AbsoluteFill>
  );
};
