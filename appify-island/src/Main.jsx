// Appify, Apple-style: an iPhone rises, its Dynamic Island becomes a Live Activity for each thing Appify sells, the lock
// screen shows the real number in clock-sized type, and the island's spark flies out to become the wordmark's i-dot.
// Every word and number is from appify-lb.com (appify-web/migrations/0002_seed.sql).
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Audio, staticFile } from "remotion";
import { useFonts, fonts, aspring, chain, clamp, type, Wallpaper, Lines, Hello, HELLO_D } from "./apple.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { DURATION, SC, SPARK, EXIT, FLY, LAND, LINE, URL } from "./timing.js";

const YELLOW = "#FFD23F";
const io = Easing.bezier(0.65, 0, 0.35, 1);
const WALLS = [
  ["#06173F", "#2F6BFF", "#74C6FF"], // websites
  ["#14063F", "#5B2BFF", "#B28CFF"], // animated sites (Appify UV)
  ["#032A2E", "#14B8A6", "#5EEAD4"], // apps
  ["#3A2A04", "#F5A524", "#FFD23F"], // under 7 days (Appify yellow)
];
const NEXT = [...SC.slice(1), SPARK];

// ── phone geometry (px in the 1080 x 1920 frame) ──────────────────────────────────────────────────
const PW = 720, PH = 1560, PX = (1080 - PW) / 2, PY = 180, IN = 18, SW = PW - 2 * IN, SH = PH - 2 * IN;
const push = (f) => 0.98 + 0.03 * Math.min(f, FLY) / FLY;           // slow push-in, frozen once the spark leaves
const drift = (f) => interpolate(f, [SPARK - 24, SPARK], [1, 0], clamp); // face the camera before the spark leaves

// 0..1 for scene i's content: springs in after `inAt`, dissolves just before the next scene
const vis = (f, i, inAt = 8, outBy = 5) => Math.min(aspring(f, SC[i] + inAt, 1, 0.35), 1 - interpolate(f, [NEXT[i] - outBy, NEXT[i]], [0, 1], clamp));

// ── iOS-style rolling digits (numericText): each digit is a strip that springs to its new value ───
function Digit({ f, keys, size }) {
  const v = chain(f, keys, 1, 0.55), vel = Math.abs(v - chain(f - 1, keys, 1, 0.55)), base = Math.floor(v), H = size * 1.0;
  return (
    <span style={{ display: "inline-block", position: "relative", width: "0.6em", height: H, overflow: "hidden", verticalAlign: "top",
      WebkitMaskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)" }}>
      {[-1, 0, 1, 2].map((d) => {
        const n = base + d;
        return <span key={d} style={{ position: "absolute", left: 0, right: 0, textAlign: "center", top: (n - v) * H, height: H, lineHeight: `${H}px`,
          filter: `blur(${Math.min(5, vel * 14)}px)` }}>{((n % 10) + 10) % 10}</span>;
      })}
    </span>
  );
}

// A line that rises out of its clip when its scene ends and in from below when it starts.
function Swap({ f, inAt, outAt, h, children, top }) {
  const pin = aspring(f, inAt, 1, 0.55), pout = aspring(f, outAt, 1, 0.5);
  if (f < inAt || pout > 0.999) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: h, overflow: "hidden" }}>
      <div style={{ transform: `translateY(${(1 - pin) * 105 - pout * 105}%)`, filter: `blur(${(1 - pin) * 6 + pout * 6}px)` }}>{children}</div>
    </div>
  );
}

const Label = ({ f, i, text }) => {
  const v = vis(f, i, 4, 6);
  return v > 0.001 && <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", ...type(44), fontWeight: 600, color: "rgba(255,255,255,.88)",
    opacity: v, filter: `blur(${(1 - v) * 6}px)` }}>{text}</div>;
};

// ── the Dynamic Island ────────────────────────────────────────────────────────────────────────────
const ISL = { rest: [220, 64], compact: [330, 64] };
const wKeys = [[0, 220], [14, 330], [SC[0], 640], [SC[1], 600], [SC[1] + 6, 640], [SC[2], 560], [SC[3], 640], [SPARK, 330]];
const hKeys = [[0, 64], [16, 64], [SC[0] + 2, 200], [SC[1] + 2, 186], [SC[1] + 8, 200], [SC[2] + 2, 210], [SC[3] + 2, 184], [SPARK + 2, 64]];

const Spark = ({ x, y, r, rot = 0, o = 1, glow = 0 }) => (
  <svg style={{ position: "absolute", left: x - r * 2, top: y - r * 2, width: r * 4, height: r * 4, overflow: "visible", opacity: o }} viewBox={`${-r * 2} ${-r * 2} ${r * 4} ${r * 4}`}>
    {glow > 0 && <circle r={r * 1.6} fill={YELLOW} opacity={0.35 * glow} style={{ filter: `blur(${r * 0.8}px)` }} />}
    <path d={sparkPath(0, 0, r)} fill={YELLOW} transform={`rotate(${rot})`} />
  </svg>
);

function Island({ f }) {
  const w = chain(f, wKeys, 0.86, 0.45), h = chain(f, hKeys, 0.9, 0.5), r = Math.min(h / 2, 56);
  const compact = Math.min(aspring(f, 18, 1, 0.35), 1 - interpolate(f, [SC[0] - 4, SC[0] + 2], [0, 1], clamp))
    + Math.min(aspring(f, SPARK + 6, 1, 0.35), 1) * (f < FLY ? 1 : 0);
  const box = (bw, bh, o, children) => o > 0.001 && (
    <div style={{ position: "absolute", left: (w - bw) / 2, top: 0, width: bw, height: bh, opacity: o, transform: `scale(${0.92 + 0.08 * o})`, filter: `blur(${(1 - o) * 6}px)` }}>{children}</div>
  );
  const icon = (bg, glyph) => (
    <div style={{ position: "absolute", left: 36, top: 45, width: 110, height: 110, borderRadius: 30, background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)" }}>{glyph}</div>
  );
  const fill1 = interpolate(f, [SC[0] + 14, SC[0] + 62], [0.04, 1], { ...clamp, easing: io });
  const ring = interpolate(f, [SC[3] + 8, SC[3] + 46], [0, 1], { ...clamp, easing: io });
  const check = interpolate(f, [SC[3] + 46, SC[3] + 54], [0, 1], { ...clamp, easing: io });
  return (
    <div style={{ position: "absolute", left: SW / 2 - w / 2, top: 22, width: w, height: h, borderRadius: r, background: "#000", overflow: "hidden",
      boxShadow: h > 100 ? "0 20px 50px rgba(0,0,0,.45)" : "none" }}>
      {/* compact: the spark leading, the wordmark trailing */}
      {box(330, 64, compact, <>
        <Spark x={40} y={32} r={18} rot={interpolate(f, [14, 40], [-90, 0], { ...clamp, easing: io })} />
        <svg viewBox={WORDMARK.viewBox} width={92} height={92 * 1167 / 3224} style={{ position: "absolute", right: 26, top: 32 - 92 * 1167 / 3224 / 2 }}>
          <path d={WORDMARK.letters} fill="#fff" /><path d={WORDMARK.spark} fill={YELLOW} /></svg>
      </>)}
      {/* websites: a page being built */}
      {box(640, 200, vis(f, 0), <>
        {icon("linear-gradient(160deg,#74C6FF,#2F6BFF)", <svg width={62} height={50} viewBox="0 0 62 50"><rect x={2} y={2} width={58} height={46} rx={9} fill="none" stroke="#fff" strokeWidth={4} />
          <line x1={2} y1={15} x2={60} y2={15} stroke="#fff" strokeWidth={4} /><circle cx={11} cy={8.5} r={2.4} fill="#fff" /><circle cx={19} cy={8.5} r={2.4} fill="#fff" /></svg>)}
        <div style={{ position: "absolute", left: 176, top: 62, width: 300 }}><Lines n={2} w={[1, 0.62]} h={12} gap={14} color="rgba(255,255,255,.28)" /></div>
        <div style={{ position: "absolute", left: 176, top: 128, width: 420, height: 10, borderRadius: 5, background: "rgba(255,255,255,.14)" }}>
          <div style={{ width: `${fill1 * 100}%`, height: 10, borderRadius: 5, background: "#74C6FF" }} /></div>
      </>)}
      {/* animated sites: play + a moving equaliser */}
      {box(640, 200, vis(f, 1), <>
        {icon("linear-gradient(160deg,#B28CFF,#5B2BFF)", <svg width={44} height={50} viewBox="0 0 44 50"><path d="M6 4 L40 25 L6 46 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth={4} /></svg>)}
        {Array.from({ length: 14 }, (_, i) => {
          const hh = 18 + 52 * Math.abs(Math.sin(f * 0.21 + i * 0.75)) * Math.abs(Math.sin(f * 0.07 + i * 0.3));
          return <i key={i} style={{ position: "absolute", left: 180 + i * 30, top: 100 - hh / 2, width: 14, height: hh, borderRadius: 7, background: i % 3 ? "rgba(255,255,255,.8)" : "#B28CFF" }} />;
        })}
      </>)}
      {/* apps: two app icons, one per platform */}
      {box(640, 210, vis(f, 2), <>
        {[0, 1].map((k) => {
          const q = aspring(f, SC[2] + 8 + k * 6, 1, 0.4);
          return <div key={k} style={{ position: "absolute", left: 182 + k * 156, top: 42, width: 120, height: 120, borderRadius: 32,
            background: k ? "linear-gradient(160deg,#A3E635,#14B8A6)" : "linear-gradient(160deg,#5EEAD4,#0E7490)", opacity: q, transform: `scale(${0.8 + 0.2 * q})`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {k ? <i style={{ width: 44, height: 44, borderRadius: 22, background: "#fff" }} /> : <i style={{ width: 44, height: 44, borderRadius: 13, background: "#fff" }} />}
          </div>;
        })}
      </>)}
      {/* under 7 days: a ring that closes, then 7 day-dots */}
      {box(640, 184, vis(f, 3), <>
        <svg width={110} height={110} viewBox="0 0 110 110" style={{ position: "absolute", left: 36, top: 37 }}>
          <circle cx={55} cy={55} r={47} fill="none" stroke="rgba(255,210,63,.2)" strokeWidth={11} />
          <circle cx={55} cy={55} r={47} fill="none" stroke={YELLOW} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 55 55)" />
          <path d="M37 56 L50 69 L74 43" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
        </svg>
        {Array.from({ length: 7 }, (_, i) => {
          const on = aspring(f, SC[3] + 10 + i * 5, 1, 0.3);
          return <i key={i} style={{ position: "absolute", left: 186 + i * 58, top: 77, width: 30, height: 30, borderRadius: 15, background: `rgba(255,210,63,${0.18 + 0.82 * on})`,
            transform: `scale(${0.8 + 0.2 * on})` }} />;
        })}
      </>)}
    </div>
  );
}

// ── the lock screen ───────────────────────────────────────────────────────────────────────────────
function Screen({ f }) {
  const BIG = { ...type(230), fontWeight: 700, letterSpacing: "-0.045em", color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" };
  const shine = (at) => interpolate(f, [at, at + 26], [-0.6, 1.6], { ...clamp, easing: io });
  return (
    <div style={{ position: "absolute", left: IN, top: IN, width: SW, height: SH, borderRadius: 100, overflow: "hidden", background: "#000" }}>
      {WALLS.map(([base, a, b], i) => {
        // each wallpaper stays under the next one until that one is fully in, then leaves; the last one stays to the end
        const o = i === 3 ? interpolate(f, [SC[i] - 6, SC[i] + 10], [0, 1], { ...clamp, easing: io })
          : interpolate(f, [SC[i] - 6, SC[i] + 10, NEXT[i] + 10, NEXT[i] + 11], [0, 1, 1, 0], { ...clamp, easing: io });
        return <Wallpaper key={i} base={base} a={a} b={b} drift={(f - SC[i]) / 60} opacity={o} />;
      })}
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,.25), transparent 40%, transparent 70%, rgba(0,0,0,.35))" }} />
      {/* hello, written on the lock screen while the phone rises */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: 1 - interpolate(f, [SC[0] - 8, SC[0]], [0, 1], clamp) }}>
        <Hello f={f} at={8} d={HELLO_D} width={540} stroke={11} dur={32} />
      </div>
      <Label f={f} i={0} text="Websites, paid once" />
      <Label f={f} i={1} text="Fully animated sites from" />
      <Label f={f} i={2} text="Apps for" />
      <Label f={f} i={3} text="Delivered in under" />
      {/* $360 -> $500: the digits roll like the lock-screen clock */}
      <Swap f={f} inAt={SC[0] + 4} outAt={SC[2]} h={240} top={392}>
        <div style={{ ...BIG, textAlign: "center", whiteSpace: "nowrap" }}>
          <span style={{ display: "inline-block", width: "0.6em" }}>$</span>
          <Digit f={f} size={230} keys={[[0, 3], [SC[1], 5]]} />
          <Digit f={f} size={230} keys={[[0, 6], [SC[1] + 3, 10]]} />
          <Digit f={f} size={230} keys={[[0, 0], [SC[1] + 6, 0]]} />
        </div>
      </Swap>
      <Swap f={f} inAt={SC[0] + 10} outAt={SC[1]} h={64} top={640}>
        <div style={{ ...type(46), color: "rgba(255,255,255,.75)", textAlign: "center" }}>$0 a month.</div>
      </Swap>
      <Swap f={f} inAt={SC[2] + 2} outAt={SC[3]} h={350} top={400}>
        <div style={{ ...BIG, fontSize: 158, textAlign: "center", lineHeight: 1.08 }}>iOS<br />Android</div>
      </Swap>
      <Swap f={f} inAt={SC[3] + 2} outAt={9999} h={420} top={392}>
        <div style={{ ...BIG, fontSize: 300, textAlign: "center" }}>7</div>
        <div style={{ ...type(96), fontWeight: 700, letterSpacing: "-0.03em", color: "rgba(255,255,255,.9)", textAlign: "center", marginTop: -6 }}>days</div>
      </Swap>
      {/* glass highlight sweeping across on each change */}
      {SC.map((at) => (
        <AbsoluteFill key={at} style={{ background: `linear-gradient(115deg, transparent ${shine(at) * 100 - 18}%, rgba(255,255,255,.13) ${shine(at) * 100}%, transparent ${shine(at) * 100 + 18}%)`, mixBlendMode: "screen" }} />
      ))}
      <Island f={f} />
    </div>
  );
}

function Phone({ f }) {
  const rise = aspring(f + 8, 0, 1, 0.9), out = aspring(f, EXIT, 1, 0.7), d = drift(f);
  const ty = (1 - rise) * 1300 + out * 1950, rx = 16 * (1 - rise) - 10 * out, ry = -8 * (1 - rise) + 2.5 * Math.sin(f / 70) * d * rise;
  return (
    <AbsoluteFill style={{ perspective: 2600 }}>
      <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH, transformStyle: "preserve-3d",
        transform: `translateY(${ty}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${push(f)})`, opacity: 1 - out, filter: `blur(${out * 8}px)` }}>
        {/* side buttons */}
        {[[-5, 300, 110], [-5, 440, 110], [-5, 210, 56], [PW - 1, 380, 170]].map(([x, y, h], i) => (
          <i key={i} style={{ position: "absolute", left: x, top: y, width: 6, height: h, borderRadius: 3, background: "linear-gradient(90deg,#2c2c2e,#8e8e93,#3a3a3c)" }} />
        ))}
        {/* titanium frame + black bezel */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 118, background: "linear-gradient(135deg,#9a9aa0,#3a3a3e 30%,#1c1c1e 55%,#77777d 80%,#2c2c2e)",
          boxShadow: "0 60px 140px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08)" }} />
        <div style={{ position: "absolute", inset: 5, borderRadius: 113, background: "#050505" }} />
        <Screen f={f} />
      </div>
    </AbsoluteFill>
  );
}

// ── the end: the spark leaves the island and lands as the i-dot ───────────────────────────────────
const WM = 640, WMH = WM * 1167 / 3224, WMX = (1080 - WM) / 2, WMY = 760, WS = WM / 3224;
const DOT = { x: WMX + (WORDMARK.spark ? 2118.5 + 20 : 0) * WS, y: WMY + (-750.89 + 917) * WS, r: 146.15 * WS };
const FROM = (() => { // the island spark's position on screen when it leaves (phone faces the camera, push frozen)
  const s = push(FLY), x = PX + IN + SW / 2 - 165 + 40, y = PY + IN + 22 + 32;
  return { x: 540 + (x - 540) * s, y: 960 + (y - 960) * s, r: 18 * s };
})();
const at = (f) => {
  const k = aspring(f, FLY, 1, 0.75);
  return { k, x: FROM.x + (DOT.x - FROM.x) * k, y: FROM.y + (DOT.y - FROM.y) * k - 260 * Math.sin(Math.PI * Math.min(1, k)), r: FROM.r + (DOT.r - FROM.r) * k, rot: 180 * k };
};

function End({ f }) {
  if (f < FLY) return null;
  const p = at(f), letters = aspring(f, LAND - 8, 1, 0.6), land = interpolate(f, [LAND, LAND + 20], [0, 1], clamp);
  const breathe = 1 + 0.015 * interpolate(f, [LAND, DURATION], [0, 1], clamp);
  const t1 = aspring(f, LINE, 1, 0.6), t2 = aspring(f, URL, 1, 0.6);
  return (
    <AbsoluteFill style={{ transform: `scale(${breathe})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${DOT.x}px ${DOT.y}px, rgba(255,210,63,${0.16 * letters}), transparent 45%)` }} />
      <svg viewBox={WORDMARK.viewBox} width={WM} height={WMH} style={{ position: "absolute", left: WMX, top: WMY, opacity: letters, filter: `blur(${(1 - letters) * 10}px)`,
        transform: `scale(${0.97 + 0.03 * letters})` }}><path d={WORDMARK.letters} fill="#fff" /></svg>
      {/* trail */}
      {[5, 4, 3, 2, 1].map((d) => { const q = at(f - d); return q.k < 0.97 && <Spark key={d} x={q.x} y={q.y} r={q.r * (1 - d * 0.08)} rot={q.rot} o={0.22 * (1 - d / 6)} />; })}
      {land > 0 && land < 1 && <div style={{ position: "absolute", left: DOT.x - 140 * land, top: DOT.y - 140 * land, width: 280 * land, height: 280 * land, borderRadius: "50%",
        border: `2px solid rgba(255,210,63,${0.6 * (1 - land)})` }} />}
      <Spark x={p.x} y={p.y} r={p.r} rot={p.rot} glow={1 - land * 0.6} />
      <div style={{ position: "absolute", top: 1070, left: 0, right: 0, textAlign: "center", ...type(56), color: "#fff", opacity: t1, transform: `translateY(${(1 - t1) * 16}px)`, filter: `blur(${(1 - t1) * 6}px)` }}>Ideas, appified.</div>
      <div style={{ position: "absolute", top: 1152, left: 0, right: 0, textAlign: "center", ...type(36), color: "rgba(255,255,255,.5)", opacity: t2, transform: `translateY(${(1 - t2) * 12}px)` }}>appify-lb.com</div>
    </AbsoluteFill>
  );
}

export function Main({ audio }) {
  useFonts(fonts);
  const f = useCurrentFrame();
  // the room takes the colour of the lock screen
  const bloom = WALLS.map(([, a], i) => interpolate(f, [SC[i] - 6, SC[i] + 12, (i === 3 ? EXIT : NEXT[i]) - 4, (i === 3 ? EXIT : NEXT[i]) + 12], [0, 1, 1, 0], clamp));
  return (
    <AbsoluteFill style={{ background: "#040405" }}>
      {WALLS.map(([, a], i) => bloom[i] > 0 && (
        <AbsoluteFill key={i} style={{ opacity: bloom[i] * 0.55, background: `radial-gradient(ellipse 60% 45% at 50% 52%, ${a}, transparent 70%)` }} />
      ))}
      <Phone f={f} />
      <End f={f} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
}
