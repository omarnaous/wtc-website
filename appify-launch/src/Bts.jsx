// "How we made it": Dev, the Appify mascot, talks the viewer through the Roadster-trend reel. It plays first, then the
// Claude chat where the prompt types out and is cut off behind a blur ("full prompt in your DMs"), the reply with the
// finished reel, and the call to action: comment PROMPT and we DM you how to do it.
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FPS, VO, CHAT, TYPE, TYPE_END, LOCK, REPLY, CTA, COMMENT, OURS, NAH } from "./bts-timing.js";
import { useFonts, clamp, easeOut, Grain } from "./fx.jsx";
import { Dev } from "./Dev.jsx";
import { WORDMARK } from "./brand.js";

const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", paper: "#F3F1FA", pink: "#ff2d6f", yellow: "#FFD23F" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 13, stiffness = 210) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const life = (f, a, b, d = 8) => interpolate(f, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);
export const PROMPT = "Make a 9:16 reel for Appify. Nighttime engineering test: a phone running our Darebni AI app rides a giant curved steel track with pink-lit edges, fires three rocket thrusters";

const Grid = ({ f }) => <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: `540px ${f * 0.6}px` }} />;

// the reel itself in a rounded 9:16 card
function Clip({ from, start, len, w, x, y, p = 1, rot = 0 }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: (w * 16) / 9, borderRadius: 34, overflow: "hidden", border: "4px solid rgba(255,255,255,.14)", boxShadow: "0 40px 100px rgba(0,0,0,.6)", opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 60}px) scale(${interpolate(p, [0, 1], [0.92, 1])}) rotate(${rot}deg)` }}>
      <Sequence from={start} durationInFrames={len} layout="none"><OffthreadVideo src={staticFile("launch.mp4")} startFrom={from} muted style={{ width: "100%", height: "100%" }} /></Sequence>
    </div>
  );
}

function Chat({ f }) {
  const inP = sp(f, CHAT - 4), out = interpolate(f, [CTA - 8, CTA + 4], [0, 1], clamp);
  if (f < CHAT - 6 || out >= 1) return null;
  const n = Math.floor(interpolate(f, [TYPE, TYPE_END], [0, PROMPT.length], clamp));
  const caret = f < LOCK && Math.floor(f / 8) % 2 === 0;
  const lock = sp(f, LOCK, 12, 240), reply = sp(f, REPLY);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 160, opacity: Math.min(1, inP * 1.5) * (1 - out), transform: `translateY(${(1 - inP) * 70 - out * 40}px)` }}>
      <div style={{ ...M, fontSize: 26, color: "rgba(255,255,255,.6)", marginBottom: 18 }}>Made with <span style={{ color: "#fff" }}>Claude</span></div>
      {/* the user message: our prompt */}
      <div style={{ position: "relative", background: "#fff", borderRadius: 30, padding: "34px 38px 40px", boxShadow: "0 30px 80px rgba(0,0,0,.5)", overflow: "hidden" }}>
        <div style={{ ...UI, fontWeight: 400, fontSize: 38, lineHeight: 1.36, color: "#1b1a22", minHeight: 210 }}>
          {PROMPT.slice(0, n)}{caret && <span style={{ display: "inline-block", width: 4, height: 40, background: C.uv, verticalAlign: "-6px", marginLeft: 3 }} />}
          {/* the rest stays a secret */}
          <div style={{ marginTop: 14, filter: "blur(9px)", opacity: lock, color: "#1b1a22" }}>launches off the top, flies clear, lands upright on its thrusters in thick smoke, camera low, then the end card with</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 190, background: "linear-gradient(180deg, rgba(255,255,255,0), #fff 70%)", opacity: lock }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity: Math.min(1, lock * 2), transform: `scale(${interpolate(lock, [0, 1], [0.6, 1])})` }}>
          <div style={{ ...UI, fontSize: 32, color: "#fff", background: C.ink, padding: "16px 30px", borderRadius: 999 }}>🔒 Full prompt in your DMs</div>
        </div>
      </div>
      {/* Claude's reply: the finished reel */}
      <div style={{ display: "flex", gap: 22, marginTop: 28, alignItems: "flex-start", opacity: Math.min(1, reply * 1.5), transform: `translateY(${(1 - reply) * 40}px)` }}>
        <div style={{ ...UI, fontWeight: 400, fontSize: 34, color: "rgba(255,255,255,.85)", lineHeight: 1.35, width: 380, paddingTop: 10 }}>Here's your reel: 13 s, 9:16, with sound.</div>
        <div style={{ position: "relative", width: 230, height: 409 }}>
          <Clip from={150} start={REPLY} len={CTA - REPLY + 6} w={230} x={0} y={0} />
        </div>
      </div>
    </div>
  );
}

function Cta({ f }) {
  if (f < CTA - 4) return null;
  const a = sp(f, CTA), b = sp(f, CTA + 10), c = sp(f, COMMENT + 26);
  const word = "PROMPT", n = Math.floor(interpolate(f, [COMMENT, COMMENT + 18], [0, word.length], clamp));
  const sent = sp(f, COMMENT + 22, 10, 260);
  const up = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)` });
  const wm = 230, wmh = (wm * 1167) / 3224;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 230, textAlign: "center" }}>
      <div style={{ ...D, fontSize: 96, color: "#fff", ...up(a) }}>Join the<br />Roadster trend</div>
      {/* an Instagram-style comment box with PROMPT typed in */}
      <div style={{ ...up(b), marginTop: 56, display: "flex", alignItems: "center", gap: 22, background: "rgba(255,255,255,.08)", border: "2px solid rgba(255,255,255,.16)", borderRadius: 999, padding: "20px 22px 20px 26px", textAlign: "left" }}>
        <div style={{ width: 70, height: 70, borderRadius: 99, background: `linear-gradient(135deg, ${C.iris}, ${C.uv})`, flex: "none" }} />
        <div style={{ ...UI, fontSize: 52, color: n ? "#fff" : "rgba(255,255,255,.4)", flex: 1, letterSpacing: "0.04em" }}>
          {n ? word.slice(0, n) : "Add a comment…"}{f < COMMENT + 22 && Math.floor(f / 8) % 2 === 0 && <span style={{ display: "inline-block", width: 4, height: 50, background: "#fff", verticalAlign: "-8px", marginLeft: 4 }} />}
        </div>
        <div style={{ ...UI, fontSize: 36, color: "#fff", background: C.uv, borderRadius: 999, padding: "16px 30px", transform: `scale(${1 + 0.18 * Math.sin(Math.PI * Math.min(1, sent))})` }}>Post</div>
      </div>
      <div style={{ ...UI, fontWeight: 400, fontSize: 44, color: "rgba(255,255,255,.85)", marginTop: 44, lineHeight: 1.3, ...up(c) }}>Comment <span style={{ color: C.yellow, fontWeight: 600 }}>PROMPT</span> and we'll DM you<br />how to make yours</div>
      <svg width={wm} height={wmh} viewBox={WORDMARK.viewBox} style={{ marginTop: 50, ...up(sp(f, COMMENT + 36)) }}>
        <path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={C.yellow} />
      </svg>
    </div>
  );
}

// Dev's captions, as in the other reels: the line in a bubble in chunks of up to four words, each word lighting up
// and popping as he says it
const CHUNKS = (() => {
  const out = []; let cur = [];
  VO.words.forEach((w, i) => {
    const prev = VO.words[i - 1];
    if (cur.length && (cur.length >= 4 || w.line !== prev.line || /[.?!,…]$/.test(prev.w))) { out.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) out.push(cur);
  return out;
})();
function Speech({ f }) {
  const chunk = CHUNKS.find((c) => f >= c[0].start - 2 && f < c[c.length - 1].end + 10);
  if (!chunk) return null;
  const t = f - chunk[0].start;
  return (
    <div style={{ position: "absolute", left: 400, top: 1170, width: 540, display: "flex" }}>
      <div style={{ position: "relative", padding: "22px 28px", background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 14, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: "Mono", fontSize: 44, lineHeight: 1.2, letterSpacing: "-0.01em",
        transform: `translateY(${interpolate(t, [-2, 3], [14, 0], clamp)}px) rotate(${interpolate(sp(f, chunk[0].start, 8, 200), [0, 1], [-3, 0])}deg)`, opacity: interpolate(t, [-2, 2], [0, 1], clamp) }}>
        {chunk.map((w, i) => {
          const on = f >= w.start, pop = on ? interpolate(f - w.start, [0, 3, 6], [1, 1.12, 1], clamp) : 1;
          return <span key={i} style={{ display: "inline-block", marginRight: i < chunk.length - 1 ? "0.5em" : 0, color: on ? C.ink : "rgba(10,9,19,.3)", fontWeight: 600, transform: `scale(${pop})` }}>{w.w}</span>;
        })}
        <svg width="54" height="44" style={{ position: "absolute", left: -40, bottom: 26 }}><path d="M50 4 L4 26 L50 40 Z" fill="#fff" stroke={C.ink} strokeWidth="5" strokeLinejoin="round" /><rect x="44" y="2" width="12" height="40" fill="#fff" /></svg>
      </div>
    </div>
  );
}

export const Bts = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const devIn = sp(f, -4, 12, 200);
  const clipP = sp(f, 0) * (1 - interpolate(f, [CHAT - 10, CHAT], [0, 1], clamp));
  const pointUp = interpolate(f, [CTA, CTA + 10], [0, 1], { ...clamp, easing: easeOut });
  const nah = f >= NAH.start && f < NAH.end + 20;
  const m = VO.mouth, open = Math.max(m[f] ?? 0, ((m[f - 1] ?? 0) + (m[f + 1] ?? 0)) / 2), talking = open > 0.08;
  const blink = f % 97 < 3 ? [0.6, 1, 0.6][f % 97] : 0;
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Grid f={f} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, rgba(91,43,255,.35), transparent 60%)" }} />
      {f < CHAT && <Clip from={120} start={0} len={CHAT} w={500} x={290} y={170} p={clipP} rot={-2} />}
      {f < CHAT && <div style={{ position: "absolute", left: 230, top: 140, ...M, fontSize: 26, color: "#fff", background: C.pink, padding: "10px 18px", borderRadius: 10, transform: `rotate(-6deg) scale(${sp(f, 14, 10, 300)})` }}>Our version</div>}
      <Chat f={f} />
      <Cta f={f} />
      {/* Dev, bottom left, talking */}
      <div style={{ position: "absolute", left: 50, top: 1130, transform: `translateY(${(1 - devIn) * 500}px)` }}>
        <Dev width={340} open={open} smile={1} brow={nah ? 18 : 12} lid={Math.max(0.06, blink)} wink={nah ? 1 : 0} happy={f >= COMMENT + 40 ? 1 : 0}
          point={pointUp} thumbs={f >= OURS.start + 10 && f < CHAT ? 1 : 0} look={f >= TYPE && f < CTA ? -8 : 0}
          tilt={talking ? Math.sin(f / 9) * 0.8 * open : Math.sin(f / 22) * 0.8} bob={talking ? -open * 2 - Math.abs(Math.sin(f / 4)) * 2 : Math.sin(f / 22) * 0.8} />
      </div>
      <Speech f={f} />
      <Grain f={f} opacity={0.05} />
      <Audio src={staticFile(music ? "bts.wav" : "bts-sfx.wav")} />
    </AbsoluteFill>
  );
};
