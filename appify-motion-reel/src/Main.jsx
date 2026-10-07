// Motion-graphics showcase: a plain photo gets scrolled past, then the WTC launch film plays in full
// in a screen frame while labels name each technique; Dev narrates and closes on the offer.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, TECH } from "./timing.js";
import { C, DISPLAY, MONO, Words } from "./ui.jsx";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Presenter } from "./Presenter.jsx";

const SX = 30, SY = 420, SW = 1020, SH = Math.round(1020 * 9 / 16); // the screen the film plays in

function Hook({ f }) {
  const inP = spring({ frame: f - 4, fps: 30, config: { damping: 14 } });
  const away = interpolate(f, [T.swipe, T.swipe + 14], [0, 1], { ...clamp, easing: easeIn });
  const gone = interpolate(f, [T.swipe + 12, T.swipe + 18], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Words text="Still posting" y={250} size={96} color={C.paper} start={2} />
      <Words text="plain photos?" y={360} size={110} color={C.iris} start={8} />
      {/* a plain feed post */}
      <div style={{ position: "absolute", left: 230, top: 510, width: 620, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,.45)", opacity: Math.min(1, inP * 1.5) * (1 - away), transform: `translateY(${(1 - inP) * 80 - away * 900}px) rotate(${away * -6}deg)` }}>
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
  const outP = interpolate(f, [T.cta, T.cta + 14], [0, 1], { ...clamp, easing: easeIn });
  const cur = TECH.findIndex(([a, b]) => t >= a && t < b);
  const glow = 0.35 + 0.1 * Math.sin(f / 16);
  return (
    <AbsoluteFill style={{ opacity: 1 - outP, transform: `translateY(${-outP * 120}px) scale(${1 - outP * 0.1})`, transformOrigin: "50% 40%" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", ...MONO, fontSize: 28, color: C.iris, letterSpacing: "0.22em", opacity: inP }}>{film.toUpperCase()} · {client}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 286, textAlign: "center", ...DISPLAY, fontSize: 78, color: "#fff", opacity: inP, transform: `translateY(${(1 - inP) * 40}px)` }}>Made by Appify <span style={{ color: C.iris }}>✦</span></div>
      <div style={{ position: "absolute", left: SX - 14, top: SY - 14, width: SW + 28, height: SH + 28, borderRadius: 34, background: "#14121F", border: "2px solid rgba(205,190,255,.25)", boxShadow: `0 40px 120px rgba(91,43,255,${glow})`, transform: `scale(${0.85 + 0.15 * inP})`, opacity: Math.min(1, inP * 1.4) }}>
        <div style={{ position: "absolute", left: 14, top: 14, width: SW, height: SH, borderRadius: 22, overflow: "hidden", background: "#000" }}>
          <Sequence from={T.show} layout="none">
            <OffthreadVideo src={staticFile("wtc.mp4")} muted style={{ width: SW, height: SH }} />
          </Sequence>
        </div>
      </div>
      {/* film progress */}
      <div style={{ position: "absolute", left: SX, top: SY + SH + 26, width: SW, height: 6, borderRadius: 9, background: "rgba(243,241,250,.12)", opacity: inP }}>
        <div style={{ width: `${Math.max(0, Math.min(1, t / 25)) * 100}%`, height: 6, borderRadius: 9, background: C.iris }} />
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

function Cta({ f, cta, url }) {
  const e = (d) => spring({ frame: f - T.cta - d, fps: 30, config: { damping: 12, stiffness: 190 } });
  const rise = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px)` });
  const wmW = 300, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "grid", justifyItems: "center", textAlign: "center" }}>
      <div style={{ ...DISPLAY, fontSize: 100, color: "#fff", ...rise(e(4)) }}>Want an ad</div>
      <div style={{ ...DISPLAY, fontSize: 100, color: C.iris, marginTop: 6, ...rise(e(10)) }}>like this?</div>
      <div style={{ marginTop: 48, padding: "24px 40px", borderRadius: 28, background: C.uv, boxShadow: "0 20px 60px rgba(91,43,255,.5)", ...rise(e(22)) }}>
        <div style={{ ...DISPLAY, fontSize: 56, color: "#fff" }}>DM us “{cta}”</div>
        <div style={{ ...DISPLAY, fontSize: 38, color: "rgba(255,255,255,.85)", marginTop: 10 }}>for a free sample</div>
      </div>
      <div style={{ ...MONO, fontSize: 26, color: C.mute, marginTop: 30, ...rise(e(30)) }}>LOGO REVEALS · PRODUCT ADS · LAUNCH FILMS · REELS</div>
      <div style={{ display: "grid", justifyItems: "center", gap: 12, marginTop: 50, ...rise(e(38)) }}>
        <svg viewBox={WORDMARK.viewBox} width={wmW} height={wmH}><path d={WORDMARK.letters} fill={C.paper} /><path d={WORDMARK.spark} fill={C.iris} /></svg>
        <div style={{ ...MONO, fontSize: 28, color: C.paper, letterSpacing: "0.18em" }}>{url}</div>
      </div>
    </div>
  );
}

export const Main = (props) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-400.ttf", { weight: "400" }], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  const [sx, sy] = shake(f, T.turn, 14, 4);
  const glow = 0.4 + 0.1 * Math.sin(f / 20);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 36%, rgba(91,43,255,${glow}), transparent 62%)` }} />
      <AbsoluteFill style={{ opacity: 0.08, backgroundImage: "linear-gradient(rgba(205,190,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(205,190,255,.6) 1px, transparent 1px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${-f * 0.4}px` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {f < T.turn + 2 && <Hook f={f} />}
        {f >= T.turn && f < T.turn + 20 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", ...DISPLAY, fontSize: 150, color: "#fff", opacity: interpolate(f, [T.turn, T.turn + 3, T.turn + 14, T.turn + 20], [0, 1, 1, 0], clamp), transform: `scale(${interpolate(f, [T.turn, T.turn + 6], [1.4, 1], { ...clamp, easing: easeOut })})` }}>Watch this.</div>
        )}
        {f >= T.turn + 8 && f < T.cta + 16 && <Showcase f={f} client={props.client} film={props.film} />}
        {f >= T.cta && <Cta f={f} cta={props.cta} url={props.url} />}
      </AbsoluteFill>
      <Presenter />
      <Shockwave f={f} cx={540} cy={760} start={T.turn} max={1300} width={8} rgb="143,114,255" dur={22} />
      <Flash f={f} start={T.turn} peak={0.3} />
      <Vignette strength={0.35} />
      <Grain f={f} opacity={0.05} />
    </AbsoluteFill>
  );
};
