// Motion-graphics showcase: a plain photo gets scrolled past, then the WTC launch film plays in full
// in a screen frame while labels name each technique; Dev narrates and closes on the offer.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, TECH, CONV } from "./timing.js";
import { C, DISPLAY, MONO, Words } from "./ui.jsx";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Grain, Vignette } from "./fx.jsx";
import { random } from "remotion";
import { WORDMARK, sparkPath } from "./brand.js";
import { Presenter } from "./Presenter.jsx";

const SX = 30, SY = 420, SW = 1020, SH = Math.round(1020 * 9 / 16); // the screen the film plays in

function Hook({ f }) {
  const inP = spring({ frame: f - 4, fps: 30, config: { damping: 14 } });
  const away = interpolate(f, [T.swipe, T.swipe + 14], [0, 1], { ...clamp, easing: easeIn });
  const gone = interpolate(f, [T.swipe + 12, T.swipe + 18], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Words text="Still posting" y={250} size={96} color={C.ink} start={2} />
      <Words text="plain photos?" y={360} size={110} color={C.uv} start={8} />
      {/* a plain feed post */}
      <div style={{ position: "absolute", left: 230, top: 510, width: 620, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 30px 60px rgba(10,9,19,.18)", border: "2px solid rgba(10,9,19,.08)", opacity: Math.min(1, inP * 1.5) * (1 - away), transform: `translateY(${(1 - inP) * 80 - away * 900}px) rotate(${away * -6}deg)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px" }}>
          <div style={{ width: 46, height: 46, borderRadius: 99, background: "#ddd" }} />
          <div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 24, color: "#111" }}>your.store</div>
        </div>
        <Img src={staticFile("still.jpg")} style={{ width: 620, height: 470, objectFit: "cover", filter: "saturate(.75)" }} />
        <div style={{ padding: "16px 22px 22px", fontFamily: "UI", fontSize: 24, color: "#222" }}>♡ 3 likes · New watch in stock 🔥 DM for price</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...MONO, fontSize: 48, color: C.alert, opacity: gone * interpolate(f, [T.turn - 4, T.turn], [1, 0], clamp) }}>SCROLLED PAST.</div>
    </AbsoluteFill>
  );
}

function Showcase({ f, client, film }) {
  const t = (f - T.show) / 30;                        // seconds on the film's clock
  const inP = spring({ frame: f - T.turn, fps: 30, config: { damping: 13, stiffness: 160 } });
  const outP = interpolate(f, [T.conv, T.conv + 8], [0, 1], { ...clamp, easing: easeIn });
  const cur = TECH.findIndex(([a, b]) => t >= a && t < b);
  const glow = 0.35 + 0.1 * Math.sin(f / 16);
  return (
    <AbsoluteFill style={{ opacity: 1 - outP, transform: `translateY(${-outP * 120}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", ...MONO, fontSize: 28, color: C.uv, letterSpacing: "0.22em", opacity: inP }}>{film.toUpperCase()} · {client}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 286, textAlign: "center", ...DISPLAY, fontSize: 78, color: C.ink, opacity: inP, transform: `translateY(${(1 - inP) * 40}px)` }}>Made by Appify <span style={{ color: C.uv }}>✦</span></div>
      <div style={{ position: "absolute", left: SX - 14, top: SY - 14, width: SW + 28, height: SH + 28, borderRadius: 34, background: "#14121F", border: "2px solid rgba(10,9,19,.6)", boxShadow: `0 40px 100px rgba(91,43,255,${glow * 0.7})`, transform: `scale(${0.85 + 0.15 * inP})`, opacity: Math.min(1, inP * 1.4) }}>
        <div style={{ position: "absolute", left: 14, top: 14, width: SW, height: SH, borderRadius: 22, overflow: "hidden", background: "#000" }}>
          <Sequence from={T.show} layout="none">
            <OffthreadVideo src={staticFile("wtc.mp4")} muted style={{ width: SW, height: SH }} />
          </Sequence>
        </div>
      </div>
      {/* film progress */}
      <div style={{ position: "absolute", left: SX, top: SY + SH + 26, width: SW, height: 6, borderRadius: 9, background: "rgba(10,9,19,.1)", opacity: inP }}>
        <div style={{ width: `${Math.max(0, Math.min(1, t / 25)) * 100}%`, height: 6, borderRadius: 9, background: C.uv }} />
      </div>
      {/* technique label */}
      {TECH.map(([a, b, label], i) => {
        if (i !== cur) return null;
        const p = spring({ frame: f - (T.show + a * 30), fps: 30, config: { damping: 11, stiffness: 220 } });
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

function Conversion({ f }) {
  const s0 = T.conv;
  const inA = spring({ frame: f - s0 - 9, fps: 30, config: { damping: 13 } });
  const inB = spring({ frame: f - s0 - 18, fps: 30, config: { damping: 13 } });
  const rate = interpolate(f, [s0 + 26, s0 + 70], [CONV.from, CONV.to], { ...clamp, easing: easeOut });
  const pop = spring({ frame: f - s0 - 70, fps: 30, config: { damping: 7, stiffness: 260 } });
  const out = interpolate(f, [T.cta, T.cta + 12], [0, 1], { ...clamp, easing: easeIn });
  const barMax = 420, bar = (v) => (v / CONV.to) * barMax;
  const card = (p, dx) => ({ opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * dx}px)` });
  const coins = Array.from({ length: 12 }, (_, i) => {
    const t = f - s0 - 70 - (i % 4) * 2; if (t < 0) return null;
    const a = -Math.PI / 4 + (random(`ca${i}`) - 0.5) * 1.2, v = 11 + random(`cv${i}`) * 9;
    return { x: 915 + Math.cos(a) * v * t, y: 700 + Math.sin(a) * v * t + 0.8 * t * t, o: interpolate(t, [0, 3, 24, 32], [0, 1, 1, 0], clamp) };
  });
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 80}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", ...MONO, fontSize: 28, color: C.uv, letterSpacing: "0.22em", opacity: inA }}>CONVERSION RATE</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 286, textAlign: "center", ...DISPLAY, fontSize: 76, color: C.ink, opacity: inA }}>Stop the scroll, <span style={{ color: C.uv }}>sell more.</span></div>
      {/* plain photo */}
      <div style={{ position: "absolute", left: 70, top: 440, width: 440, height: 640, borderRadius: 30, background: "#fff", border: "2px solid rgba(10,9,19,.08)", boxShadow: "0 24px 50px rgba(10,9,19,.12)", ...card(inA, -120) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center", ...MONO, fontSize: 24, color: C.mute }}>PLAIN PHOTO</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 84, textAlign: "center", ...DISPLAY, fontSize: 110, color: "rgba(10,9,19,.45)" }}>{CONV.from.toFixed(1)}%</div>
        <div style={{ position: "absolute", left: 160, bottom: 60, width: 120, height: bar(CONV.from) * inA, borderRadius: 16, background: "rgba(10,9,19,.18)" }} />
      </div>
      {/* motion ad */}
      <div style={{ position: "absolute", left: 570, top: 440, width: 440, height: 640, borderRadius: 30, background: C.ink, boxShadow: "0 30px 70px rgba(91,43,255,.45)", ...card(inB, 120) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center", ...MONO, fontSize: 24, color: C.iris }}>MOTION AD</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 84, textAlign: "center", ...DISPLAY, fontSize: 110, color: "#3BE38B", fontVariantNumeric: "tabular-nums", transform: `scale(${1 + 0.12 * Math.sin(Math.min(1, pop) * Math.PI)})` }}>{rate.toFixed(1)}%</div>
        <div style={{ position: "absolute", left: 160, bottom: 60, width: 120, height: bar(rate) * inB, borderRadius: 16, background: "linear-gradient(#3BE38B, #1FA971)" }} />
        <div style={{ position: "absolute", left: 300, top: 230, padding: "8px 18px", borderRadius: 99, background: "#3BE38B", ...DISPLAY, fontSize: 40, color: "#0B3D22", opacity: Math.min(1, pop * 2), transform: `scale(${pop}) rotate(-8deg)` }}>{Math.round(CONV.to / CONV.from)}×</div>
      </div>
      {coins.map((c, i) => c && <div key={i} style={{ position: "absolute", left: c.x - 22, top: c.y - 22, width: 44, height: 44, borderRadius: 99, background: "radial-gradient(circle at 35% 30%, #FFE58A, #E3A91B)", border: "3px solid #B07C0C", opacity: c.o, display: "grid", placeItems: "center", ...DISPLAY, fontSize: 24, color: "#7A5306" }}>$</div>)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", ...MONO, fontSize: 22, color: C.mute, opacity: inB }}>ILLUSTRATIVE EXAMPLE · RESULTS VARY</div>
    </AbsoluteFill>
  );
}

function Cta({ f, cta, url }) {
  const e = (d) => spring({ frame: f - T.cta - d, fps: 30, config: { damping: 12, stiffness: 190 } });
  const rise = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px)` });
  const wmW = 300, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "grid", justifyItems: "center", textAlign: "center" }}>
      <div style={{ ...DISPLAY, fontSize: 100, color: C.ink, ...rise(e(4)) }}>Want an ad</div>
      <div style={{ ...DISPLAY, fontSize: 100, color: C.uv, marginTop: 6, ...rise(e(10)) }}>like this?</div>
      <div style={{ marginTop: 48, padding: "24px 40px", borderRadius: 28, background: C.uv, boxShadow: "0 20px 60px rgba(91,43,255,.5)", ...rise(e(22)) }}>
        <div style={{ ...DISPLAY, fontSize: 56, color: "#fff" }}>DM us “{cta}”</div>
        <div style={{ ...DISPLAY, fontSize: 38, color: "rgba(255,255,255,.85)", marginTop: 10 }}>for a free sample</div>
      </div>
      <div style={{ ...MONO, fontSize: 26, color: C.mute, marginTop: 30, ...rise(e(30)) }}>LOGO REVEALS · PRODUCT ADS · LAUNCH FILMS · REELS</div>
      <div style={{ display: "grid", justifyItems: "center", gap: 12, marginTop: 50, ...rise(e(38)) }}>
        <svg viewBox={WORDMARK.viewBox} width={wmW} height={wmH}><path d={WORDMARK.letters} fill={C.ink} /><path d={WORDMARK.spark} fill={C.uv} /></svg>
        <div style={{ ...MONO, fontSize: 28, color: C.ink, letterSpacing: "0.18em" }}>{url}</div>
      </div>
    </div>
  );
}

export const Main = (props) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-400.ttf", { weight: "400" }], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const [sx, sy] = shake(f, T.turn, 14, 4);
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      {/* graph paper, same as the Subscription Killer post, for a consistent feed */}
      <AbsoluteFill style={{ background: C.paper, backgroundImage: `linear-gradient(${C.gridMajor} 2px, transparent 2px), linear-gradient(90deg, ${C.gridMajor} 2px, transparent 2px), linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: "180px 180px, 180px 180px, 36px 36px, 36px 36px", backgroundPosition: `0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {f < T.turn + 2 && <Hook f={f} />}
        {f >= T.turn && f < T.turn + 20 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", ...DISPLAY, fontSize: 150, color: C.ink, opacity: interpolate(f, [T.turn, T.turn + 3, T.turn + 14, T.turn + 20], [0, 1, 1, 0], clamp), transform: `scale(${interpolate(f, [T.turn, T.turn + 6], [1.4, 1], { ...clamp, easing: easeOut })})` }}>Watch this.</div>
        )}
        {f >= T.turn + 8 && f < T.conv + 9 && <Showcase f={f} client={props.client} film={props.film} />}
        {f >= T.conv && f < T.cta + 14 && <Conversion f={f} />}
        {f >= T.cta && <Cta f={f} cta={props.cta} url={props.url} />}
      </AbsoluteFill>
      <Presenter />
      <Shockwave f={f} cx={540} cy={760} start={T.turn} max={1300} width={8} rgb="91,43,255" dur={22} />
      <Vignette strength={0.18} />
      <Grain f={f} opacity={0.05} />
    </AbsoluteFill>
  );
};
