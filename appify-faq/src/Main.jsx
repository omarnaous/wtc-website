// Appify FAQ, one Instagram Story per question (1080 x 1920), for a "Q&A" highlight. The one idea: it plays like
// Instagram's own "Ask me a question" sticker. The question types itself into an "Ask Appify" sticker, Dev looks up at
// it and thinks, the sticker lifts out of the way and the answer lands on the beat in one word or number, then the
// detail. Everything stays inside the Story safe area (the top bar and the reply bar never cover it).
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { STICKER, TYPE, CPF, LIFT, ANSWER, LINES, OUTRO } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, Burst, Flash, Grain, Vignette, shake } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";
import { FAQS } from "./faqs.js";

const W = 1080, H = 1920;
const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", lilac: "#C9B8FF", soft: "#D6D1EA", mute: "#8A84A3" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.98 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 13, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const grad = { background: `linear-gradient(100deg, ${C.lilac}, ${C.iris} 40%, ${C.sky})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
const Spark = ({ size, color = C.iris }) => <svg width={size} height={size} viewBox="0 0 100 100"><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const Wordmark = ({ width, fill = "#fff" }) => (
  <svg viewBox={WORDMARK.viewBox} width={width} height={(width * 1167) / 3224}><path d={WORDMARK.letters} fill={fill} /><path d={WORDMARK.spark} fill={C.iris} /></svg>
);
const SAFE_TOP = 250, SAFE_BOTTOM = 1600;

function Backdrop({ f, hit }) {
  const flare = interpolate(f, [ANSWER, ANSWER + 4, ANSWER + 40], [0, 1, 0.35], clamp);
  return (
    <>
      <AbsoluteFill style={{ background: C.ink }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${f * 0.5}px`, WebkitMaskImage: "radial-gradient(ellipse 85% 60% at 50% 45%, #000 25%, transparent 75%)", maskImage: "radial-gradient(ellipse 85% 60% at 50% 45%, #000 25%, transparent 75%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 40% at 50% ${hit ? 44 : 40}%, rgba(91,43,255,${0.42 + 0.25 * flare}), transparent 70%), radial-gradient(ellipse 50% 22% at 80% 92%, rgba(116,198,255,.12), transparent 70%)` }} />
    </>
  );
}

// Instagram's question sticker, in Appify colours: a gradient header, the question typed in black underneath.
function Sticker({ f, q }) {
  const pop = sp(f, STICKER, 11, 260);
  const typed = Math.max(0, Math.min(q.length, Math.floor((f - TYPE) * CPF)));
  const caret = f >= TYPE && typed < q.length ? true : Math.floor(f / 10) % 2 === 0 && f < LIFT;
  const lift = interpolate(f, [LIFT, LIFT + 18], [0, 1], { ...clamp, easing: easeOut });
  const y = interpolate(lift, [0, 1], [640, 360]), s = interpolate(lift, [0, 1], [1, 0.72]);
  return (
    <div style={{ position: "absolute", left: 110, width: 860, top: y, transform: `scale(${s * interpolate(Math.min(pop, 1.1), [0, 1], [0.5, 1])})`, transformOrigin: "50% 0", opacity: Math.min(1, pop * 2) }}>
      <div style={{ borderRadius: 44, overflow: "hidden", background: "#fff", boxShadow: "0 40px 100px -20px rgba(91,43,255,.65), 0 0 0 2px rgba(255,255,255,.2)" }}>
        <div style={{ padding: "30px 40px", background: `linear-gradient(110deg, ${C.uv}, #7B57FF 55%, ${C.sky})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <Spark size={34} color="#fff" /><span style={{ ...UI, fontSize: 38, color: "#fff", letterSpacing: "-0.01em" }}>Ask Appify a question</span>
        </div>
        <div style={{ padding: "44px 50px 52px", minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <span style={{ ...D, fontSize: 66, color: C.ink, letterSpacing: "-0.03em", lineHeight: 1.08 }}>
            {q.slice(0, typed)}<span style={{ opacity: caret ? 1 : 0, color: C.uv, fontWeight: 400 }}>|</span>
            <span style={{ visibility: "hidden" }}>{q.slice(typed)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function Answer({ f, faq }) {
  const big = sp(f, ANSWER, 9, 300), [sx, sy] = shake(f, ANSWER, 14, 5);
  const hit = f >= ANSWER;
  const bigSize = Math.min(250, Math.floor(880 / (faq.big.length * 0.6)));   // one line, never wider than the safe area
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 680, transform: `translate(${sx}px, ${sy}px)` }}>
      {hit && <div style={{ ...D, fontSize: bigSize, lineHeight: 0.9, whiteSpace: "nowrap", opacity: Math.min(1, big * 2.5), transform: `scale(${interpolate(Math.min(big, 1.15), [0, 1], [1.35, 1])})`, transformOrigin: "0 60%" }}><span style={grad}>{faq.big}</span></div>}
      <div style={{ ...M, fontSize: 28, color: C.soft, marginTop: 28, ...rise(sp(f, ANSWER + 10), 20) }}>{faq.sub}</div>
      {faq.chips && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 44 }}>
          {faq.chips.map((c, k) => { const p = sp(f, LINES[0] + k * 6, 10, 280); return <span key={c} style={{ padding: "16px 26px", borderRadius: 99, border: "2px solid rgba(143,114,255,.5)", background: "rgba(91,43,255,.16)", ...UI, fontSize: 38, color: "#fff", opacity: Math.min(1, p * 2), transform: `scale(${interpolate(Math.min(p, 1.1), [0, 1], [1.4, 1])})` }}>{c}</span>; })}
        </div>
      )}
      <div style={{ marginTop: faq.chips ? 34 : 50, display: "grid", gap: 26 }}>
        {faq.lines.map((l, k) => (
          <div key={l} style={{ display: "flex", gap: 20, alignItems: "flex-start", ...rise(sp(f, LINES[faq.chips ? k + 1 : k] ?? LINES[2], 14, 200), 30) }}>
            <span style={{ marginTop: 14, flex: "none" }}><Spark size={26} /></span>
            <span style={{ ...UI, fontWeight: 400, fontSize: 44, lineHeight: 1.3, color: "#fff", maxWidth: 640 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Main = ({ faq, index, total, music = true }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const intro = sp(f, 0, 14, 160);
  const dev = sp(f, LIFT + 4, 13, 150), thinking = f >= LIFT && f < ANSWER, got = f >= ANSWER;
  const out = sp(f, OUTRO, 13, 200);
  const last = index === total - 1;
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile(`sound/${faq.id}${music ? "" : "-sfx"}.wav`)} />
      <Backdrop f={f} hit={got} />
      {/* header: which question this is, the brand */}
      <div style={{ position: "absolute", left: 90, right: 90, top: SAFE_TOP + 10, display: "flex", justifyContent: "space-between", alignItems: "center", ...rise(intro, -20) }}>
        <div style={{ ...M, fontSize: 26, color: C.iris, display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ color: C.sky, padding: "8px 12px", border: "2px solid rgba(116,198,255,.4)", borderRadius: 10 }}>Q&amp;A {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span>
        </div>
        <Wordmark width={200} />
      </div>
      <Sticker f={f} q={faq.q} />
      {f >= ANSWER - 2 && <Answer f={f} faq={faq} />}
      {got && f < ANSWER + 4 && <Flash f={f} start={ANSWER} peak={0.22} />}
      <Burst f={f} cx={260} cy={800} start={ANSWER + 1} count={46} speed={26} seed={faq.id} colors={["#fff", C.iris, C.sky]} />
      {/* Dev, bottom right: looks up at the question and thinks, then gets it */}
      <div style={{ position: "absolute", left: 770, top: 1200, transform: `translateY(${(1 - Math.min(1, dev)) * 700}px)` }}>
        <Dev width={250} point={got ? 0 : thinking ? 0.6 : 0} thumbs={got ? Math.min(1, (f - ANSWER) / 6) : 0} brow={thinking ? 20 : 14} lid={0.06} smile={1} happy={got ? 0.9 : 0.2} shock={f >= ANSWER && f < ANSWER + 6 ? 0.5 : 0} look={thinking ? -6 : -3} tilt={(thinking ? -5 : 0) + Math.sin(f / 10) * 1.5} />
      </div>
      {/* the closing line: the next question, or the booking line on the last Story */}
      <div style={{ position: "absolute", left: 90, top: SAFE_BOTTOM - 70, display: "flex", alignItems: "center", gap: 16, ...rise(out, 24) }}>
        {last
          ? <span style={{ padding: "18px 30px", borderRadius: 99, background: C.uv, ...UI, fontSize: 34, color: "#fff", boxShadow: "0 20px 50px rgba(91,43,255,.6)" }}>Book on WhatsApp · appify-lb.com</span>
          : <span style={{ ...M, fontSize: 26, color: C.soft }}>Tap for the next question →</span>}
      </div>
      <Vignette strength={0.3} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};

// Highlight cover: Dev holding up the question sticker; Instagram crops the centre into a circle.
export const Cover = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #7B57FF, ${C.uv} 38%, #3A1BB0 75%, #22106E)` }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><circle cx={W / 2} cy={H / 2} r={420} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={3} strokeDasharray="4 14" /></svg>
      <div style={{ position: "absolute", left: 190, top: 860 }}><Dev width={700} point={1} brow={18} lid={0.05} smile={1} happy={0.6} look={7} tilt={-4} /></div>
      <div style={{ position: "absolute", left: 470, top: 640, width: 400, transform: "rotate(7deg)", borderRadius: 34, overflow: "hidden", background: "#fff", boxShadow: "0 30px 60px rgba(10,9,19,.45)" }}>
        <div style={{ padding: "18px 0", background: `linear-gradient(110deg, ${C.uv}, #7B57FF 55%, ${C.sky})`, display: "flex", justifyContent: "center" }}><Spark size={30} color="#fff" /></div>
        <div style={{ ...D, fontSize: 170, color: C.uv, textAlign: "center", padding: "18px 0 26px" }}>Q&amp;A</div>
      </div>
    </AbsoluteFill>
  );
};
export { FAQS };
