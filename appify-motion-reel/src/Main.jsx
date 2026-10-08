// Motion-graphics showcase: a plain photo gets one like (mom) and gets scrolled past, Dev takes emotional damage,
// then the Watch Trade Chronicles launch ad plays in a screen frame; the twist, the Wyzowl study, the refund, the offer.
import { AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T, TECH, DATA, CUT, DAMAGE, filmFrame, filmClock, wordAt } from "./timing.js";
import { C, DISPLAY, MONO, Words } from "./ui.jsx";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Grain, Vignette } from "./fx.jsx";
import { random } from "remotion";
import { WORDMARK, sparkPath } from "./brand.js";
import { Sneaker } from "./products.jsx";
import { Presenter } from "./Presenter.jsx";

const APPIFY_AT = wordAt("appify", T.why ?? T.talk);
const SX = 30, SY = 420, SW = 1020, SH = Math.round(1020 * 9 / 16); // the screen the film plays in

function Hook({ f }) {
  const inP = spring({ frame: f - 4, fps: 30, config: { damping: 14 } });
  const mom = wordAt("mom", T.hook);
  const fly = T.fly ?? wordAt("scrolled", T.swipe) - 6;
  const away = interpolate(f, [fly, fly + 14], [0, 1], { ...clamp, easing: easeIn });
  const gone = interpolate(f, [fly + 12, fly + 18], [0, 1], clamp);
  const heart = spring({ frame: f - mom, fps: 30, config: { damping: 8, stiffness: 260 } });
  return (
    <AbsoluteFill>
      <div style={{ opacity: interpolate(f, [T.show - 18, T.show - 13], [1, 0], clamp) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 226, textAlign: "center", ...MONO, fontSize: 34, color: C.uv, letterSpacing: "0.3em" }}>POV</div>
        <Words text="Another product photo." y={286} size={80} color={C.ink} start={4} />
        <Words text="1 like (Mom)." y={384} size={100} color={C.alert} start={wordAt("only", T.hook) - 2} />
      </div>
      {/* a plain feed post */}
      <div style={{ position: "absolute", left: 230, top: 510, width: 620, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 30px 60px rgba(10,9,19,.18)", border: "2px solid rgba(10,9,19,.08)", opacity: Math.min(1, inP * 1.5) * (1 - away), transform: `translateY(${(1 - inP) * 80 - away * 900}px) rotate(${away * -6}deg)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px" }}>
          <div style={{ width: 46, height: 46, borderRadius: 99, background: "#ddd" }} />
          <div style={{ fontFamily: "UI", fontWeight: 600, fontSize: 24, color: "#111" }}>your.store</div>
        </div>
        <Img src={staticFile("still.jpg")} style={{ width: 620, height: 470, objectFit: "cover", filter: "saturate(.75)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px 22px", fontFamily: "UI", fontSize: 24, color: "#222" }}>
          <span style={{ display: "inline-block", fontSize: 34, color: f >= mom ? C.alert : "#222", transform: `scale(${f >= mom ? interpolate(heart, [0, 1], [1.8, 1]) : 1})` }}>{f >= mom ? "♥" : "♡"}</span>
          <span>1 like</span>
          <span style={{ padding: "4px 12px", borderRadius: 99, background: f >= mom ? "rgba(240,56,79,.12)" : "transparent", color: f >= mom ? C.alert : "#888", fontWeight: 600 }}>liked by mom</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...MONO, fontSize: 52, color: C.alert, opacity: gone * interpolate(f, [T.show - 18, T.show - 13], [1, 0], clamp) }}>SCROLLED PAST.</div>
    </AbsoluteFill>
  );
}

// Meme crash-zoom on Dev's face in three snaps (dun, dun, DUNNN), then EMOTIONAL DAMAGE slams in.
const FACE = [140, 1400], AIM = [540, 700], ZS = [1, 1.9, 2.8, 4];
function damageZoom(f) {
  const m = f - T.damage;
  if (m < 0 || m >= DAMAGE + 2) return { s: 1, d: 0 };
  const step = (k) => interpolate(m, [k * 8, k * 8 + 3], [0, 1], { ...clamp, easing: easeOut });
  let s = ZS[0] + (ZS[1] - ZS[0]) * step(0) + (ZS[2] - ZS[1]) * step(1) + (ZS[3] - ZS[2]) * step(2);
  const back = interpolate(m, [DAMAGE - 4, DAMAGE], [0, 1], { ...clamp, easing: easeIn });
  s = s + (1 - s) * back;
  return { s, d: 1 - back };
}
function zoomStyle(f) {
  const { s, d } = damageZoom(f);
  if (s === 1) return {};
  const u = (s - 1) / (ZS[3] - 1);
  const cx = FACE[0] + (AIM[0] - FACE[0]) * u, cy = FACE[1] + (AIM[1] - FACE[1]) * u;
  const [jx, jy] = shake(f, T.damage + 16, 10, 6);
  return { transformOrigin: "0 0", transform: `translate(${cx + jx}px, ${cy + jy}px) scale(${s}) translate(${-FACE[0]}px, ${-FACE[1]}px)`, filter: `saturate(${1 - 0.7 * d}) contrast(${1 + 0.25 * d})` };
}
function Damage({ f }) {
  const m = f - T.damage;
  if (m < 0 || m >= DAMAGE + 2) return null;
  const { d } = damageZoom(f);
  const slam = spring({ frame: m - 16, fps: 30, config: { damping: 9, stiffness: 300 } });
  const flash = [0, 8, 16].reduce((v, k) => Math.max(v, interpolate(m, [k, k + 4], [0.35, 0], clamp) * (m >= k ? 1 : 0)), 0);
  const word = { ...DISPLAY, fontSize: 158, letterSpacing: "-0.02em", color: "#fff", WebkitTextStroke: "14px #0A0913", paintOrder: "stroke fill", textShadow: "0 10px 0 #0A0913" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, transparent 30%, rgba(200,10,30,${0.55 * d}) 80%, rgba(90,0,10,${0.8 * d}) 100%)` }} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      {m >= 16 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", lineHeight: 0.95, opacity: d, transform: `scale(${interpolate(slam, [0, 1], [2.2, 1])}) rotate(-4deg)` }}>
          <div style={word}>EMOTIONAL</div>
          <div style={{ ...word, color: "#FF2D46" }}>DAMAGE</div>
        </div>
      )}
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
      <div style={{ position: "absolute", left: 0, right: 0, top: 238, textAlign: "center", ...MONO, fontSize: 24, color: C.uv, letterSpacing: "0.14em", opacity: hd }}>{film.toUpperCase()} · {client.toUpperCase()}</div>
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
      {/* what we make: one chip per service as Dev says it */}
      {f >= T.why - 4 && f < T.reveal && (
        <div style={{ position: "absolute", left: 0, right: 0, top: SY + SH + 50, opacity: interpolate(f, [T.why - 4, T.why + 4, T.reveal - 6, T.reveal], [0, 1, 1, 0], clamp) }}>
          <div style={{ textAlign: "center", ...MONO, fontSize: 24, color: C.mute, letterSpacing: "0.2em" }}>WHAT WE MAKE</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 16 }}>
            {[["product", "Product ads"], ["launch", "Launch ads"], ["logo", "Logo reveals"]].map(([w, label]) => {
              const p = spring({ frame: f - wordAt(w, T.svc) + 2, fps: 30, config: { damping: 10, stiffness: 260 } });
              return <span key={w} style={{ display: "inline-block", padding: "12px 24px", borderRadius: 99, background: C.uv, ...DISPLAY, fontSize: 42, color: "#fff", boxShadow: "0 14px 40px rgba(91,43,255,.4)", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 30}px) scale(${interpolate(p, [0, 1], [1.4, 1])})` }}>{label}</span>;
            })}
          </div>
        </div>
      )}
      {/* "...here at Appify": the wordmark pops in next to Dev */}
      {f >= APPIFY_AT - 2 && f < T.badgeEnd && (() => {
        const p = spring({ frame: f - APPIFY_AT + 2, fps: 30, config: { damping: 9, stiffness: 260 } });
        const o = interpolate(f, [T.badgeEnd - 10, T.badgeEnd], [1, 0], clamp);
        const w = 250, h = w * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
        return (
          <div style={{ position: "absolute", left: 330, top: 1196, padding: "14px 26px", borderRadius: 22, background: "#fff", border: "4px solid #0A0913", boxShadow: "0 8px 0 #0A0913", opacity: Math.min(1, p * 2) * o, transform: `rotate(${interpolate(p, [0, 1], [-14, -3])}deg) scale(${interpolate(p, [0, 1], [1.8, 1])})`, transformOrigin: "0 100%" }}>
            <svg viewBox={WORDMARK.viewBox} width={w} height={h} style={{ display: "block" }}><path d={WORDMARK.letters} fill={C.ink} /><path d={WORDMARK.spark} fill={C.uv} /></svg>
          </div>
        );
      })()}
      {TECH.map(([a, b, label], i) => {
        if (i !== cur || (f >= T.why - 6 && f < T.reveal)) return null;
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

// Twist: "you don't need to sell watches... zero to a hundred, real quick." A flat grey sneaker photo turns into a motion ad.
function Twist({ f }) {
  const inP = spring({ frame: f - T.twist, fps: 30, config: { damping: 14 } });
  const out = interpolate(f, [T.twistEnd, T.twistEnd + 10], [0, 1], { ...clamp, easing: easeIn });
  const m = f - T.morph;
  const flip = interpolate(m, [0, 10], [0, 1], { ...clamp, easing: easeOut });
  const color = interpolate(m, [4, 14], [0, 1], clamp);
  const hero = spring({ frame: m - 6, fps: 30, config: { damping: 9, stiffness: 200 } });
  const word = (i) => spring({ frame: m - 10 - i * 4, fps: 30, config: { damping: 10, stiffness: 240 } });
  const price = interpolate(m, [16, 34], [0, 129], { ...clamp, easing: easeOut });
  const level = interpolate(m, [8, 34], [0, 100], { ...clamp, easing: easeOut });   // "from zero to a hundred... real quick"
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
        {after && (
          <div style={{ position: "absolute", right: 60, bottom: 56, textAlign: "right", opacity: Math.min(1, color * 2) }}>
            <div style={{ ...MONO, fontSize: 22, color: "rgba(255,255,255,.75)", letterSpacing: "0.18em" }}>GRAPHICS LEVEL</div>
            <div style={{ ...DISPLAY, fontSize: 84, color: "#fff", fontVariantNumeric: "tabular-nums", transform: `scale(${1 + 0.15 * Math.max(0, 1 - Math.abs(m - 34) / 6)})`, transformOrigin: "100% 50%" }}>{Math.round(level)}</div>
          </div>
        )}
      </div>
      <Burst f={f} cx={540} cy={700} start={T.morph + 6} count={70} speed={30} colors={["#fff", C.iris, C.sky]} seed="morph" scale={0.9} />
      <Shockwave f={f} cx={540} cy={700} start={T.morph + 6} max={900} width={6} rgb="91,43,255" dur={22} />
    </AbsoluteFill>
  );
}

// Proof: "don't take my word for it" - the Wyzowl report slides in, a magnifier scans it, the line gets highlighted,
// 85% pops off the page, the crowd lights up and the page gets a SOURCE stamp.
const PG = { x: 110, y: 230, w: 860, h: 600 };
function Lens({ x, y, o }) {
  return (
    <svg width="260" height="260" viewBox="0 0 260 260" style={{ position: "absolute", left: x - 100, top: y - 100, opacity: o, overflow: "visible" }}>
      <path d="M168,168 L238,238" stroke="#0A0913" strokeWidth="30" strokeLinecap="round" />
      <circle cx="100" cy="100" r="86" fill="rgba(116,198,255,.22)" stroke="#0A0913" strokeWidth="16" />
      <path d="M48,76 Q62,46 94,38" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
function Proof({ f }) {
  const P1 = DATA.people;
  const head = spring({ frame: f - T.conv - 2, fps: 30, config: { damping: 13 } });
  const out = interpolate(f, [T.cta, T.cta + 12], [0, 1], { ...clamp, easing: easeIn });
  const rep = wordAt("found", T.study);
  const lt = [T.conv + 4, wordAt("study", T.conv), T.study, P1.at - 6, P1.at + 12];
  const lx = interpolate(f, lt, [1250, 330, 760, 330, 1300], { ...clamp, easing: easeOut });
  const ly = interpolate(f, lt, [700, 400, 420, 620, 420], { ...clamp, easing: easeOut });
  const hl = interpolate(f, [P1.at - 4, P1.at + 8], [0, 100], { ...clamp, easing: easeOut });
  const pop = spring({ frame: f - P1.at - 4, fps: 30, config: { damping: 9, stiffness: 200 } });
  const n = interpolate(f, [P1.at, P1.at + 20], [0, P1.pct], { ...clamp, easing: easeOut });
  const crowd = spring({ frame: f - P1.at - 6, fps: 30, config: { damping: 13 } });
  const litP = interpolate(f, [P1.at + 8, P1.at + 26], [0, 1], { ...clamp, easing: easeOut });
  const lit = Math.round(litP * (P1.pct / 100) * 20);
  const st = spring({ frame: f - P1.at - 28, fps: 30, config: { damping: 9, stiffness: 300 } });
  const bar = (w, y) => <div style={{ position: "absolute", left: 50, top: y, width: w, height: 16, borderRadius: 8, background: "rgba(10,9,19,.08)" }} />;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 80}px)` }}>
      <div style={{ position: "absolute", left: PG.x, top: PG.y, width: PG.w, height: PG.h, borderRadius: 18, background: "#fff", border: "2px solid rgba(10,9,19,.08)", boxShadow: "0 30px 70px rgba(10,9,19,.14)", opacity: Math.min(1, head * 1.5), transform: `translateY(${(1 - head) * 220}px) rotate(${interpolate(head, [0, 1], [-9, -1.5])}deg)` }}>
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 14, borderRadius: "18px 18px 0 0", background: C.uv }} />
        <div style={{ position: "absolute", left: 50, top: 46, ...MONO, fontSize: 22, color: C.mute, letterSpacing: "0.2em" }}>WYZOWL · RESEARCH REPORT</div>
        <div style={{ position: "absolute", left: 50, top: 88, width: 620, ...DISPLAY, fontSize: 56, lineHeight: 1.05, color: C.ink }}>The State of Video Marketing 2026</div>
        {bar(720, 236)}{bar(640, 266)}
        <div style={{ position: "absolute", left: 50, top: 312, width: 760, ...DISPLAY, fontSize: 40, lineHeight: 1.35, letterSpacing: "-0.02em", color: C.ink }}>
          <span style={{ backgroundImage: "linear-gradient(transparent 18%, #FFE45C 18%, #FFE45C 92%, transparent 92%)", backgroundSize: `${hl}% 100%`, backgroundRepeat: "no-repeat", WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", padding: "0 6px" }}>
            <span style={{ color: C.uv }}>85%</span> of people say a video convinced them to buy
          </span>
        </div>
        {bar(380, 446)}{bar(330, 476)}{bar(400, 506)}{bar(260, 536)}
        {/* 85% pops off the page */}
        {f >= P1.at + 4 && (
          <div style={{ position: "absolute", left: 480, top: 400, ...DISPLAY, fontSize: 190, color: C.uv, fontVariantNumeric: "tabular-nums", textShadow: "0 10px 0 rgba(91,43,255,.18)", transformOrigin: "0 0",
            transform: `translate(${(1 - pop) * -430}px, ${(1 - pop) * -88}px) scale(${interpolate(pop, [0, 1], [0.21, 1])}) rotate(${interpolate(pop, [0, 1], [0, -6])}deg)` }}>{Math.round(n)}%</div>
        )}
        {/* the source stamp */}
        {f >= P1.at + 28 && (
          <div style={{ position: "absolute", right: 34, top: 40, padding: "8px 18px", border: "5px solid #1FA971", borderRadius: 12, ...MONO, fontSize: 28, fontWeight: 600, color: "#1FA971", opacity: Math.min(1, st * 2), transform: `rotate(10deg) scale(${interpolate(st, [0, 1], [2.4, 1])})` }}>SOURCE ✓</div>
        )}
      </div>
      <Lens x={lx} y={ly} o={interpolate(f, [T.conv + 4, T.conv + 10, P1.at + 4, P1.at + 12], [0, 1, 1, 0], clamp)} />
      {/* the crowd: 85 in 100 */}
      <div style={{ position: "absolute", left: PG.x, top: 870, width: PG.w, height: 250, borderRadius: 28, background: "#fff", border: "2px solid rgba(10,9,19,.08)", boxShadow: "0 24px 60px rgba(10,9,19,.10)", opacity: Math.min(1, crowd * 1.5), transform: `translateY(${(1 - crowd) * 60}px)` }}>
        <div style={{ position: "absolute", left: 20, top: 20, width: PG.w - 40, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", rowGap: 10, justifyItems: "center" }}>
          {Array.from({ length: 20 }, (_, i) => {
            const k = i < lit ? Math.max(0, 1 - (litP * (P1.pct / 100) * 20 - i)) : 0;
            return <Person key={i} on={i < lit} k={Math.min(1, k)} />;
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1142, textAlign: "center", ...MONO, fontSize: 22, color: C.mute, opacity: crowd }}>{DATA.source.toUpperCase()}</div>
    </AbsoluteFill>
  );
}

function Shield() {
  return <svg width="46" height="54" viewBox="0 0 46 54"><path d="M23,3 L42,10 V26 Q42,42 23,51 Q4,42 4,26 V10 Z" fill="#1FA971" stroke="#0A0913" strokeWidth="4" /><path d="M14,27 L21,34 L33,20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Cta({ f, cta, url }) {
  const e = (d) => spring({ frame: f - T.cta - d, fps: 30, config: { damping: 12, stiffness: 190 } });
  const rise = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px)` });
  const q2 = spring({ frame: f - T.q2, fps: 30, config: { damping: 12, stiffness: 200 } });
  const strike = interpolate(f, [T.q2 - 6, T.q2 + 4], [0, 1], { ...clamp, easing: easeOut });
  const badge = spring({ frame: f - wordAt("full", T.refund) + 2, fps: 30, config: { damping: 9, stiffness: 260 } });
  const zero = spring({ frame: f - T.zero, fps: 30, config: { damping: 9, stiffness: 280 } });
  const box = spring({ frame: f - T.fun + 4, fps: 30, config: { damping: 10, stiffness: 220 } });
  const wmW = 360, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  const W2 = 760, H2 = Math.round(760 * 9 / 16);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", ...rise(e(4)) }}>
        <div style={{ position: "relative", display: "inline-block", ...DISPLAY, fontSize: 70, color: f >= T.q2 ? C.mute : C.ink }}>
          Photos get scrolled.
          <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 8, borderRadius: 8, background: C.alert, transform: `scaleX(${strike})`, transformOrigin: "0 50%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 316, textAlign: "center", ...DISPLAY, fontSize: 96, lineHeight: 1.05, color: C.ink, opacity: Math.min(1, q2 * 1.5), transform: `translateY(${(1 - q2) * 40}px)` }}>
        Motion gets <span style={{ color: C.uv }}>watched.</span>
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
      {/* the guarantee sticker */}
      {f >= wordAt("full", T.refund) - 2 && (
        <div style={{ position: "absolute", left: 790, top: 446, width: 250, height: 250, borderRadius: 999, background: "#fff", border: "8px solid #0A0913", boxShadow: "0 12px 0 #0A0913", display: "grid", placeItems: "center", alignContent: "center", gap: 2,
          opacity: Math.min(1, badge * 2), transform: `rotate(${interpolate(badge, [0, 1], [-30, 10])}deg) scale(${interpolate(badge, [0, 1], [2, 1])})` }}>
          <Shield />
          <div style={{ ...DISPLAY, fontSize: 64, color: C.ink }}>100%</div>
          <div style={{ ...MONO, fontSize: 24, fontWeight: 600, color: C.ink, letterSpacing: "0.16em" }}>REFUND</div>
          {f >= T.zero - 2 && (
            <div style={{ position: "absolute", left: -10, right: -10, bottom: -26, textAlign: "center", padding: "8px 0", borderRadius: 12, background: "#1FA971", border: "5px solid #0A0913", ...DISPLAY, fontSize: 34, color: "#fff", transform: `rotate(-8deg) scale(${interpolate(zero, [0, 1], [1.8, 1])})`, opacity: Math.min(1, zero * 2) }}>ZERO RISK</div>
          )}
        </div>
      )}
      <div style={{ position: "absolute", left: 60, right: 60, top: 540 + H2 + 60, display: "grid", justifyItems: "center", opacity: Math.min(1, box * 1.5), transform: `scale(${interpolate(box, [0, 1], [1.3, 1])})` }}>
        <div style={{ padding: "22px 52px", borderRadius: 30, background: C.uv, boxShadow: "0 20px 60px rgba(91,43,255,.5)", textAlign: "center" }}>
          <div style={{ ...DISPLAY, fontSize: 72, color: "#fff", whiteSpace: "nowrap" }}>COMMENT “{cta.toUpperCase()}”</div>
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

// Ad end card: what we do, the film looping, the refund sticker, and a Send Message button that gets tapped.
function Plane({ size = 54, color = "#fff" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24"><path d="M2.5,11.2 L21,3 L14.6,21 L11.3,13.4 Z M11.3,13.4 L21,3" fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" /></svg>;
}
function AdCta({ f, url }) {
  const e = (d) => spring({ frame: f - T.cta - d, fps: 30, config: { damping: 12, stiffness: 190 } });
  const rise = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px)` });
  const full = wordAt("full", T.refund);
  const badge = spring({ frame: f - full + 2, fps: 30, config: { damping: 9, stiffness: 260 } });
  const tap = wordAt("tap", T.fun);
  const btn = spring({ frame: f - tap + 6, fps: 30, config: { damping: 10, stiffness: 220 } });
  const click = tap + 16;
  const press = interpolate(f, [click - 2, click, click + 5], [1, 0.92, 1], clamp);
  const cur = interpolate(f, [tap, click - 2], [0, 1], { ...clamp, easing: easeOut });
  const ring = interpolate(f, [click, click + 18], [0, 1], clamp);
  const wmW = 360, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  const W2 = 760, H2 = Math.round(760 * 9 / 16), BY = 540 + H2 + 70;
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 218, textAlign: "center", ...MONO, fontSize: 28, color: C.uv, letterSpacing: "0.24em", ...rise(e(10)) }}>APPIFY · MOTION GRAPHICS</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 270, textAlign: "center", ...DISPLAY, fontSize: 104, lineHeight: 1.02, color: C.ink, ...rise(e(13)) }}>
        Make your product <span style={{ color: C.uv }}>move.</span>
      </div>
      <div style={{ position: "absolute", left: (1080 - W2) / 2 - 12, top: 540, width: W2 + 24, height: H2 + 24, borderRadius: 28, background: "#14121F", border: "2px solid rgba(10,9,19,.6)", boxShadow: "0 30px 80px rgba(91,43,255,.35)", ...rise(e(16)) }}>
        <div style={{ position: "absolute", left: 12, top: 12, width: W2, height: H2, borderRadius: 18, overflow: "hidden", background: "#000" }}>
          <Sequence from={T.cta} layout="none">
            <Loop durationInFrames={5 * 30} layout="none">
              <OffthreadVideo src={staticFile("wtc.mp4")} muted startFrom={9 * 30} style={{ width: W2, height: H2 }} />
            </Loop>
          </Sequence>
        </div>
      </div>
      {f >= full - 2 && (
        <div style={{ position: "absolute", left: 790, top: 446, width: 250, height: 250, borderRadius: 999, background: "#fff", border: "8px solid #0A0913", boxShadow: "0 12px 0 #0A0913", display: "grid", placeItems: "center", alignContent: "center", gap: 2,
          opacity: Math.min(1, badge * 2), transform: `rotate(${interpolate(badge, [0, 1], [-30, 10])}deg) scale(${interpolate(badge, [0, 1], [2, 1])})` }}>
          <Shield />
          <div style={{ ...DISPLAY, fontSize: 64, color: C.ink }}>100%</div>
          <div style={{ ...MONO, fontSize: 24, fontWeight: 600, color: C.ink, letterSpacing: "0.16em" }}>REFUND</div>
        </div>
      )}
      {/* the Send Message button, tapped by a cursor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: BY, display: "grid", justifyItems: "center", opacity: Math.min(1, btn * 1.5), transform: `scale(${interpolate(btn, [0, 1], [1.3, 1]) * press})` }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, padding: "26px 56px", borderRadius: 999, background: C.uv, boxShadow: "0 22px 60px rgba(91,43,255,.55)" }}>
          <Plane />
          <span style={{ ...DISPLAY, fontSize: 70, color: "#fff", whiteSpace: "nowrap" }}>Send Message</span>
          {f >= click && <div style={{ position: "absolute", inset: -6, borderRadius: 999, border: `6px solid rgba(91,43,255,${1 - ring})`, transform: `scale(${1 + ring * 0.25})` }} />}
        </div>
        <div style={{ ...MONO, fontSize: 26, color: C.mute, marginTop: 22, letterSpacing: "0.06em" }}>Full refund if you don't love it</div>
      </div>
      {f >= tap && (
        <svg width="70" height="86" viewBox="0 0 70 86" style={{ position: "absolute", left: interpolate(cur, [0, 1], [1000, 700]), top: interpolate(cur, [0, 1], [1460, BY + 60]), transform: `scale(${f >= click - 2 && f < click + 5 ? 0.88 : 1})`, opacity: interpolate(f, [tap, tap + 4], [0, 1], clamp) }}>
          <path d="M6,4 L6,66 L22,52 L33,78 L45,73 L34,48 L56,48 Z" fill="#fff" stroke="#0A0913" strokeWidth="5" strokeLinejoin="round" />
        </svg>
      )}
      <div style={{ position: "absolute", left: 330, width: 700, top: 1520, display: "grid", justifyItems: "center", gap: 14, ...rise(e(24)) }}>
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
      <AbsoluteFill style={zoomStyle(f)}>
      {/* graph paper, same as the Subscription Killer post, for a consistent feed */}
      <AbsoluteFill style={{ background: C.paper, backgroundImage: `linear-gradient(${C.gridMajor} 2px, transparent 2px), linear-gradient(90deg, ${C.gridMajor} 2px, transparent 2px), linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: "180px 180px, 180px 180px, 36px 36px, 36px 36px", backgroundPosition: `0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        {f < T.show && <Hook f={f} />}
        {T.turn != null && f >= T.show - 16 && f < T.show && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", ...DISPLAY, fontSize: 200, lineHeight: 0.95, color: C.ink, opacity: interpolate(f, [T.show - 16, T.show - 13], [0, 1], clamp), transform: `scale(${interpolate(f, [T.show - 16, T.show - 9], [1.6, 1], { ...clamp, easing: easeOut })}) rotate(-4deg)` }}>WATCH<br /><span style={{ color: C.uv }}>THIS.</span></div>
        )}
        {f >= T.show && f < T.twist + 9 && <Showcase f={f} client={props.client} film={props.film} />}
        {T.morph != null && f >= T.twist && f < T.twistEnd + 11 && <Twist f={f} />}
        {T.study != null && f >= T.conv && f < T.cta + 14 && <Proof f={f} />}
        {f >= T.cta && (T.ad ? <AdCta f={f} url={props.url} /> : <Cta f={f} cta={props.cta} url={props.url} />)}
      </AbsoluteFill>
      <Presenter />
      </AbsoluteFill>
      <Damage f={f} />
      <Shockwave f={f} cx={540} cy={760} start={T.show} max={1300} width={8} rgb="91,43,255" dur={22} />
      <Vignette strength={0.18} />
      <Grain f={f} opacity={0.05} />
    </AbsoluteFill>
  );
};
