// Motion-graphics showcase: a plain photo gets scrolled past, then the WTC launch film plays in full
// in a screen frame while labels name each technique; Dev narrates and closes on the offer.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, TECH, DATA, RATE, filmFrame } from "./timing.js";
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
  const t = ((f - T.show) / 30) * RATE;               // seconds on the film's clock
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
            <OffthreadVideo src={staticFile("wtc.mp4")} muted playbackRate={RATE} style={{ width: SW, height: SH }} />
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

// Data beat: 20 people light up to 85% as the voice says it, then a ring fills to 83%; source on screen.
function Conversion({ f }) {
  const { people: P1, marketers: P2 } = DATA;
  const head = spring({ frame: f - T.conv - 9, fps: 30, config: { damping: 13 } });
  const out = interpolate(f, [T.cta, T.cta + 12], [0, 1], { ...clamp, easing: easeIn });
  const n1 = interpolate(f, [P1.at - 4, P1.at + 26], [0, P1.pct], { ...clamp, easing: easeOut });
  const lit = Math.round((n1 / 100) * 20);
  const panel2 = spring({ frame: f - P2.at + 14, fps: 30, config: { damping: 14 } });
  const n2 = interpolate(f, [P2.at - 2, P2.at + 28], [0, P2.pct], { ...clamp, easing: easeOut });
  const R = 104, CIRC = 2 * Math.PI * R;
  const pop2 = spring({ frame: f - P2.at - 28, fps: 30, config: { damping: 7, stiffness: 260 } });
  const coins = Array.from({ length: 12 }, (_, i) => {
    const t = f - P2.at - 28 - (i % 4) * 2; if (t < 0) return null;
    const a = -Math.PI / 2 + 0.35 + (random(`ca${i}`) - 0.5) * 1.4, v = 12 + random(`cv${i}`) * 9;
    return { x: 560 + Math.cos(a) * v * t, y: 870 + Math.sin(a) * v * t + 0.8 * t * t, o: interpolate(t, [0, 3, 24, 32], [0, 1, 1, 0], clamp) };
  });
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 80}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", ...MONO, fontSize: 28, color: C.uv, letterSpacing: "0.22em", opacity: head }}>THE DATA</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 286, textAlign: "center", ...DISPLAY, fontSize: 84, color: C.ink, opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>Video <span style={{ color: C.uv }}>sells.</span></div>
      {/* 85%: a crowd lights up */}
      <div style={{ position: "absolute", left: 60, top: 410, width: 960, height: 420, borderRadius: 32, background: "#fff", border: "2px solid rgba(10,9,19,.08)", boxShadow: "0 24px 60px rgba(10,9,19,.10)", opacity: head }}>
        <div style={{ position: "absolute", left: 40, top: 26, ...DISPLAY, fontSize: 120, color: C.uv, fontVariantNumeric: "tabular-nums" }}>{Math.round(n1)}%</div>
        <div style={{ position: "absolute", left: 360, top: 50, width: 560, ...DISPLAY, fontSize: 40, lineHeight: 1.15, color: C.ink }}>{P1.text}</div>
        <div style={{ position: "absolute", left: 40, top: 196, width: 880, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", rowGap: 10, justifyItems: "center" }}>
          {Array.from({ length: 20 }, (_, i) => {
            const k = i < lit ? Math.max(0, 1 - (n1 / 100 * 20 - i)) : 0;
            return <Person key={i} on={i < lit} k={Math.min(1, k)} />;
          })}
        </div>
      </div>
      {/* coins burst from behind the ring panel as 83% lands */}
      {coins.map((c, i) => c && <div key={i} style={{ position: "absolute", left: c.x - 22, top: c.y - 22, width: 44, height: 44, borderRadius: 99, background: "radial-gradient(circle at 35% 30%, #FFE58A, #E3A91B)", border: "3px solid #B07C0C", opacity: c.o, display: "grid", placeItems: "center", ...DISPLAY, fontSize: 24, color: "#7A5306" }}>$</div>)}
      {/* 83%: a ring fills */}
      <div style={{ position: "absolute", left: 60, top: 860, width: 960, height: 280, borderRadius: 32, background: C.ink, boxShadow: "0 30px 70px rgba(91,43,255,.35)", opacity: Math.min(1, panel2 * 1.5), transform: `translateY(${(1 - panel2) * 60}px)` }}>
        <svg width="260" height="260" viewBox="-130 -130 260 260" style={{ position: "absolute", left: 40, top: 10, transform: `scale(${1 + 0.08 * Math.sin(Math.min(1, pop2) * Math.PI)})` }}>
          <circle r={R} fill="none" stroke="rgba(143,114,255,.2)" strokeWidth="24" />
          <circle r={R} fill="none" stroke="#3BE38B" strokeWidth="24" strokeLinecap="round" strokeDasharray={`${(n2 / 100) * CIRC} ${CIRC}`} transform="rotate(-90)" />
          <text y="22" textAnchor="middle" style={{ ...DISPLAY, fontSize: 70 }} fill="#fff">{Math.round(n2)}%</text>
        </svg>
        <div style={{ position: "absolute", left: 340, top: 80, width: 580, ...DISPLAY, fontSize: 42, lineHeight: 1.15, color: "#fff" }}>{P2.text}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1160, textAlign: "center", ...MONO, fontSize: 22, color: C.mute, opacity: head }}>{DATA.source.toUpperCase()}</div>
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
        <div style={{ ...DISPLAY, fontSize: 48, color: "#fff" }}>Direct message us “{cta}”</div>
        <div style={{ ...DISPLAY, fontSize: 36, color: "rgba(255,255,255,.88)", marginTop: 10 }}>Limited-time offer on motion graphics packages</div>
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
