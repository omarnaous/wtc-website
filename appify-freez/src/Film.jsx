// Freez Mix spec film, 22 s, 16:9 (raw; it goes into the browser-window frame later). Every image is Freez's own
// product art from freezmix.com. One idea: everything is POURED in. A liquid surface rises up the screen to bring in
// each flavour, the orbit, the studio, the wall, and fills the screen behind the logo.
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FPS, S, T, FLAVOR_AT } from "./timing.js";
import { FLAVORS } from "./flavors.js";
import { useFonts, clamp, easeOut, easeIn, after, shake, Flash, Burst, Streak, Grain, Vignette, TAU } from "./fx.jsx";

const C = { ink: "#0B1415", deep: "#061213", chalk: "#F5F7F4", teal: "#1ECECB", tealD: "#0E8F8C", pink: "#F05E9F" };
const DISPLAY = "Grotesk", SERIF = "Serif";
const inOut = Easing.inOut(Easing.cubic);
const img = (n) => staticFile(`freez/${n}`);
const BOTTLE = 1518 / 390;      // bottle art h / w
const HERO = 529 / 400;         // hero shot h / w
const fg = (fl) => (fl.dark ? C.ink : C.chalk);

const useLayout = () => {
  const { width: W, height: H } = useVideoConfig();
  const u = Math.min(W, H) / 1080;
  return { W, H, u, cx: W / 2, cy: H / 2 };
};
const Mono = ({ children, style }) => <div style={{ fontFamily: "Mono", textTransform: "uppercase", letterSpacing: "0.28em", ...style }}>{children}</div>;
// text that rises out of a mask, word by word
function Rise({ f, start, text, style, stagger = 3 }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0 0.26em", ...style }}>
      {text.split(" ").map((w, i) => {
        const p = after(f, start + i * stagger, [0, 14], [0, 1], { easing: easeOut });
        return <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.1em", lineHeight: 1.05 }}><span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{w}</span></span>;
      })}
    </span>
  );
}

// ── the through-line: a liquid surface rising up the screen ────────────────────────────────────────
function surface(W, level, f, amp, k = 1) {
  const pts = [];
  for (let x = -20; x <= W + 20; x += 24) {
    const y = level + Math.sin(x / (170 * k) + f * 0.42) * amp + Math.sin(x / (61 * k) - f * 0.7) * amp * 0.35;
    pts.push([x, y]);
  }
  return pts;
}
export function PourWipe({ dur, children, from = 1.08, to = -0.12 }) {
  const f = useCurrentFrame();
  const { W, H, u } = useLayout();
  const p = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0.05, 0.35, 1) });
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const level = H * (from + (to - from) * p), amp = 22 * u * (1 - p * 0.5);
  const pts = surface(W, level, f, amp);
  const poly = [...pts.map(([x, y]) => `${x}px ${y}px`), `${W + 20}px ${H + 20}px`, `-20px ${H + 20}px`].join(",");
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(${poly})` }}>{children}</AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={"M" + pts.map(([x, y]) => `${x},${y}`).join(" L")} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth={5 * u} />
        <path d={"M" + pts.map(([x, y]) => `${x},${y + 10 * u}`).join(" L")} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={10 * u} />
        {Array.from({ length: 26 }, (_, i) => {
          const x = random(`sx${i}`) * W, r = (3 + random(`sr${i}`) * 9) * u, y = level + Math.sin(x / 170 + f * 0.42) * amp + (8 + random(`sy${i}`) * 80) * u;
          return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="rgba(255,255,255,.7)" strokeWidth={2 * u} />;
        })}
      </svg>
    </AbsoluteFill>
  );
}
// carbonation: bubbles rising, a few big ones near the lens (blurred)
function Fizz({ f, n = 40, seed = "fz", color = "rgba(255,255,255,.55)", speed = 1 }) {
  const { W, H, u } = useLayout();
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = (k) => random(`${seed}${k}${i}`);
    const near = r("n") < 0.12, v = (2 + r("v") * 6) * u * speed * (near ? 2.2 : 1), size = (near ? 40 + r("s") * 50 : 5 + r("s") * 20) * u;
    const period = (H + 200 * u) / v, t = (f + r("o") * period) % period;
    const x = r("x") * W + Math.sin((f + r("p") * 90) / (10 + r("w") * 12)) * 12 * u, y = H + 100 * u - t * v;
    out.push(<i key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: 999, border: `${Math.max(1.5, size / 8)}px solid ${color}`, filter: near ? `blur(${6 * u}px)` : "none", opacity: near ? 0.5 : 0.9 }} />);
  }
  return <>{out}</>;
}
function Pair({ fl, h, x, y, t, inDur = 7, spread = 0.55, tilt = 1 }) {
  const { W, u } = useLayout();
  const w = h / BOTTLE, gap = w * 0.06;
  const p = inDur <= 0 ? 1 : interpolate(t, [0, inDur], [0, 1], { ...clamp, easing: easeOut });
  const meet = t - inDur, clink = meet >= 0 ? Math.exp(-meet / 4) * Math.sin(meet / 1.3) : 0;
  const off = (1 - p) * W * spread, blur = (1 - p) * 20 * u;
  const st = (left, side) => ({ position: "absolute", left, top: y - h / 2, width: w, height: h, transformOrigin: "50% 100%",
    transform: `rotate(${side * (3 + 7 * clink * tilt + (1 - p) * 14)}deg)`, filter: `blur(${blur}px) drop-shadow(0 ${30 * u}px ${40 * u}px rgba(0,0,0,.35))` });
  return (
    <>
      <Img src={img(`${fl.slug}-m.png`)} style={st(x - w - gap / 2 - off, 1)} />
      <Img src={img(`${fl.slug}-w.png`)} style={st(x + gap / 2 + off, -1)} />
      {meet >= 0 && meet < 9 && (
        <svg width={240 * u} height={240 * u} viewBox="-120 -120 240 240" style={{ position: "absolute", left: x - 120 * u, top: y - h * 0.47 - 120 * u, opacity: 1 - meet / 9 }}>
          {Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * TAU, r0 = 18 + meet * 7, r1 = r0 + 22 + (k % 2) * 14; return <line key={k} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke="#fff" strokeWidth="6" strokeLinecap="round" />; })}
        </svg>
      )}
    </>
  );
}

// ─────────────────────────────────────────── 1. open: the cap pops, Lemon & Mint pours up the screen
function Open() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy } = useLayout();
  const fl = FLAVORS[0];
  const exit = interpolate(f, [82, 90], [0, 1], { ...clamp, easing: easeIn });
  const rise = interpolate(f, [T.pour0, T.pour1 + 6], [1, 0], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.3, 1) });
  const h = H * 0.98, w = h / HERO;
  const glow = f < T.cap ? interpolate(f, [0, T.cap], [0.08, 0.22], clamp) : 0.3;
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 70%, rgba(30,206,203,${glow}), transparent 55%)` }} />
      <Fizz f={f} n={30} seed="o0" color="rgba(30,206,203,.6)" speed={0.7} />
      <Burst f={f} cx={cx} cy={H * 0.62} start={T.cap} count={140} speed={58 * u} scale={2.2 * u} colors={["#fff", C.teal, "#BFF5F3"]} gravity={-0.03} />
      <Streak f={f} start={T.cap} y={H * 0.62} color={C.teal} />
      <Flash f={f} start={T.cap} peak={0.35} />
      <Sequence from={T.pour0} layout="none">
        <PourWipe dur={T.pour1 - T.pour0}>
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at 50% 45%, #6FF0EC, ${fl.bg} 55%, ${C.tealD})`, transform: `scale(${1 + exit * 1.6})`, filter: `blur(${exit * 16}px)` }}>
            <Fizz f={f} n={46} seed="o1" />
            <Img src={img(`${fl.top}.png`)} style={{ position: "absolute", height: h, width: w, left: cx - w / 2, top: cy - h / 2 + rise * H * 0.7, transform: `rotate(${-6 + rise * 14 + Math.sin(f / 16) * 1.5}deg)`, filter: `blur(${rise * 14 * u}px) drop-shadow(0 ${30 * u}px ${50 * u}px rgba(0,0,0,.35))` }} />
            <div style={{ position: "absolute", right: cx + w * 0.42, top: cy - 120 * u, textAlign: "right", fontFamily: DISPLAY, fontWeight: 700, fontSize: 96 * u, letterSpacing: "-0.045em", color: C.ink, textTransform: "uppercase", lineHeight: 1 }}>
              <Rise f={f} start={T.w1} text="Choose" style={{ justifyContent: "flex-end" }} /><br /><Rise f={f} start={T.w1 + 4} text="your mix," style={{ justifyContent: "flex-end" }} />
            </div>
            <div style={{ position: "absolute", left: cx + w * 0.42, top: cy - 100 * u, fontFamily: SERIF, fontStyle: "italic", fontSize: 112 * u, color: C.chalk, lineHeight: 1, textShadow: "0 4px 30px rgba(0,80,80,.35)" }}>
              <Rise f={f} start={T.w2} text="choose" /><br /><Rise f={f} start={T.w2 + 4} text="your flavor." />
            </div>
            <Mono style={{ position: "absolute", left: 56 * u, bottom: 52 * u, fontSize: 22 * u, color: C.ink, opacity: 0.8 }}>Freez Mix — {fl.name}</Mono>
            <Mono style={{ position: "absolute", right: 56 * u, top: 52 * u, fontSize: 22 * u, color: C.ink, opacity: 0.8 }}>01 / 13</Mono>
          </AbsoluteFill>
        </PourWipe>
      </Sequence>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 2. flavours: one per beat, each poured in
function Beat({ i, lf }) {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy } = useLayout();
  const fl = FLAVORS[i + 1], c = fg(fl), dir = i % 2 ? -1 : 1, outline = i % 2 === 1;
  const wordSize = Math.min((W * 0.94) / (fl.word.length * 0.62), H * 0.56);
  const drift = lf * 2.4 * u * dir;
  const pulse = interpolate(lf, [0, 3, 12], [1.06, 1.06, 1], clamp);
  const [sx, sy] = shake(lf, 0, 8 * u, 3);
  return (
    <AbsoluteFill style={{ background: fl.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 52%, rgba(255,255,255,.28), transparent 60%)" }} />
      <Fizz f={f} n={34} seed={fl.slug} color={fl.dark ? "rgba(11,20,21,.22)" : "rgba(255,255,255,.5)"} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - wordSize * 0.56, textAlign: "center", whiteSpace: "nowrap", fontFamily: DISPLAY, fontWeight: 700, fontSize: wordSize, lineHeight: 1, letterSpacing: "-0.05em",
          color: outline ? "transparent" : c, WebkitTextStroke: outline ? `${4 * u}px ${c}` : "none", opacity: 0.92, transform: `translateX(${-drift}px) scale(${pulse})` }}>{fl.word}</div>
        {fl.top ? (() => {
          const h = H * 1.02, w = h / HERO, p = interpolate(lf, [0, 7], [0, 1], { ...clamp, easing: easeOut });
          return <Img src={img(`${fl.top}.png`)} style={{ position: "absolute", height: h, width: w, left: cx - w / 2 + (1 - p) * W * 0.55 * dir, top: cy - h / 2, transform: `rotate(${(1 - p) * 18 * dir + lf * 0.2 * dir}deg)`, filter: `blur(${(1 - p) * 22 * u}px) drop-shadow(0 ${28 * u}px ${50 * u}px rgba(0,0,0,.35))` }} />;
        })() : <Pair fl={fl} h={H * 0.92} x={cx} y={cy + H * 0.03} t={lf} inDur={5} />}
      </AbsoluteFill>
      <Mono style={{ position: "absolute", left: 56 * u, bottom: 52 * u, fontSize: 22 * u, color: c, opacity: 0.85 }}>Freez Mix — {fl.name}</Mono>
      <Mono style={{ position: "absolute", right: 56 * u, top: 52 * u, fontSize: 22 * u, color: c, opacity: 0.85 }}>{String(fl.n).padStart(2, "0")} / 13</Mono>
    </AbsoluteFill>
  );
}
function Flavors() {
  const f = useCurrentFrame();
  return FLAVOR_AT.map((at, i) => {
    const len = (FLAVOR_AT[i + 1] ?? S.orbit - S.flavors) - at;
    return (
      <Sequence key={i} from={at} durationInFrames={len + T.wipe} layout="none">
        <PourWipe dur={T.wipe}><Beat i={i} lf={f - at} /></PourWipe>
      </Sequence>
    );
  });
}

// ─────────────────────────────────────────── 3. orbit: thirteen flavours circle a counter
function Orbit() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy } = useLayout();
  const open = spring({ frame: f - 2, fps: FPS, config: { damping: 14, stiffness: 90 } });
  const collapse = interpolate(f, [74, 90], [0, 1], { ...clamp, easing: easeIn });
  const rad = open * (1 - collapse), rx = 0.42 * W * rad, ry = 0.15 * H * rad;
  const rot = 2.2 * (1 - Math.exp(-f / 22)) + f * 0.007 + collapse * 2;
  const items = FLAVORS.map((fl, k) => {
    const a = rot + (k / 13) * TAU, z = Math.sin(a), s = 0.55 + 0.45 * ((z + 1) / 2);
    return { fl, k, x: cx + Math.cos(a) * rx, y: cy + 0.12 * H + z * ry, z, s, h: 0.46 * H * s };
  }).sort((a, b) => a.z - b.z);
  const cnt = Math.round(interpolate(f, [T.count0, T.count1], [0, 13], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const land = f < T.count1 ? interpolate(f, [T.count0, T.count1], [0.7, 1], clamp) : interpolate(spring({ frame: f - T.count1, fps: FPS, config: { damping: 9, stiffness: 200 } }), [0, 1], [1.25, 1]);
  const big = 300 * u, cIn = after(f, 4, [0, 10], [0, 1]);
  const tint = FLAVORS[cnt > 0 ? cnt - 1 : 0].bg;
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <Fizz f={f} n={36} seed="ob" color="rgba(30,206,203,.35)" />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, ${tint}66, transparent 52%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><ellipse cx={cx} cy={cy + 0.12 * H + 0.2 * H} rx={Math.max(1, rx)} ry={Math.max(1, ry)} fill="none" stroke={C.teal} strokeOpacity={0.35} strokeWidth={1.5 * u} strokeDasharray={`${3 * u} ${9 * u}`} /></svg>
      {items.map((it) => (
        <Img key={it.fl.slug} src={img(`${it.fl.slug}-${it.k % 2 ? "w" : "m"}.png`)} style={{ position: "absolute", height: it.h, width: it.h / BOTTLE, left: it.x - it.h / BOTTLE / 2, top: it.y - it.h / 2,
          filter: `brightness(${0.45 + 0.55 * it.s}) blur(${(1 - it.s) * 6 * u}px)`, opacity: 1 - collapse * 0.6, zIndex: Math.round(it.z * 100) + 100 }} />
      ))}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse ${big * 1.8}px ${big * 1.0}px at 50% 36%, rgba(6,18,19,.92) 30%, rgba(6,18,19,.5) 60%, transparent)`, opacity: cIn * (1 - collapse), zIndex: 150 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 0.2 * H - big * 0.62, textAlign: "center", opacity: cIn * (1 - collapse), transform: `scale(${land * (1 - collapse * 0.6)})`, zIndex: 160 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: big, lineHeight: 1, letterSpacing: "-0.06em", color: C.chalk, fontVariantNumeric: "tabular-nums" }}>{cnt}</div>
        <Mono style={{ fontSize: 26 * u, color: C.teal, marginTop: 4 * u }}>flavors · one mix</Mono>
      </div>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 4. mix studio: husband & wife, better together
const SWAP = [6, 7, 3, 4, 8, 5, 0, 1, 2];   // flavour indices the studio cycles through (Strawberry first)
function Studio() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy } = useLayout();
  const sw0 = 14, k = T.swaps.filter((s) => f >= sw0 + s).length;     // swaps done
  const fl = FLAVORS[SWAP[Math.min(SWAP.length - 1, k)]], prev = FLAVORS[SWAP[Math.max(0, k - 1)]];
  const ls = k > 0 ? f - (sw0 + T.swaps[k - 1]) : 99;
  const sp = interpolate(ls, [0, 5], [0, 1], { ...clamp, easing: easeOut });
  const px = cx + 0.2 * W, h = H * 0.84, py = cy + 0.02 * H;
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 70% at 70% 50%, ${fl.bg}cc, transparent 70%)` }} />
      {ls < 6 && <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 70% at 70% 50%, ${prev.bg}cc, transparent 70%)`, opacity: 1 - sp }} />}
      <Fizz f={f} n={30} seed="st" color="rgba(255,255,255,.35)" />
      <Mono style={{ position: "absolute", left: 120 * u, top: cy - 230 * u, fontSize: 24 * u, color: C.teal }}>Husband &amp; Wife</Mono>
      <div style={{ position: "absolute", left: 120 * u, top: cy - 180 * u, fontFamily: DISPLAY, fontWeight: 700, fontSize: 132 * u, letterSpacing: "-0.045em", color: C.chalk, textTransform: "uppercase", lineHeight: 1 }}>
        <Rise f={f} start={4} text="Better" />
      </div>
      <div style={{ position: "absolute", left: 120 * u, top: cy - 30 * u, fontFamily: SERIF, fontStyle: "italic", fontSize: 150 * u, color: C.teal, lineHeight: 1 }}>
        <Rise f={f} start={10} text="together." />
      </div>
      <div style={{ position: "absolute", left: 120 * u, top: cy + 200 * u, display: "flex", gap: 14 * u, opacity: after(f, 12, [0, 10], [0, 1]) }}>
        {FLAVORS.map((x, j) => { const on = x.slug === fl.slug; return <i key={x.slug} style={{ width: (on ? 34 : 24) * u, height: (on ? 34 : 24) * u, marginTop: on ? -5 * u : 0, borderRadius: 99, background: x.bg, border: `${(on ? 4 : 2) * u}px solid ${on ? "#fff" : "rgba(255,255,255,.3)"}` }} />; })}
      </div>
      <Mono style={{ position: "absolute", left: 120 * u, top: cy + 260 * u, fontSize: 22 * u, color: "rgba(245,247,244,.75)", opacity: after(f, 12, [0, 10], [0, 1]) }}>{fl.name}</Mono>
      {/* the pair: they slide together and clink, then each swap drops in the next flavour from above */}
      {k === 0 ? <Pair fl={fl} h={h} x={px} y={py} t={f - 2} inDur={T.clink - 2} spread={0.3} tilt={1.2} /> : (
        <>
          {ls < 6 && <div style={{ position: "absolute", inset: 0, transform: `translateY(${sp * H * 0.9}px)`, filter: `blur(${sp * 14 * u}px)` }}><Pair fl={prev} h={h} x={px} y={py} t={99} /></div>}
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - sp) * -H * 0.9}px)`, filter: `blur(${(1 - sp) * 14 * u}px)` }}><Pair fl={fl} h={h} x={px} y={py} t={ls < 6 ? 99 : ls} inDur={0} /></div>
        </>
      )}
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 5. wall: all 26 bottles, a light sweep, then dive in
function Wall() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy } = useLayout();
  const pull = interpolate(f, [0, 50], [1.8, 0.94], { ...clamp, easing: easeOut });
  const dive = interpolate(f, [66, 85], [0, 1], { ...clamp, easing: easeIn });
  const scale = pull * (1 + dive * 8);
  const sweep = interpolate(f, [22, 64], [-0.3, 1.3], { ...clamp, easing: inOut });
  const h = H * 0.5, w = h / BOTTLE, colW = W / 12.2;
  const cards = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 13; c++) {
    const fl = FLAVORS[c], d = Math.hypot(r - 0.5, c - 6);
    const a = after(f, d * 1.6, [0, 12], [0, 1], { easing: easeOut });
    const x = cx + (c - 6) * colW, y = cy + (r - 0.5) * h * 1.02;
    const hit = Math.max(0, 1 - Math.abs((x / W) - sweep - (y / H - 0.5) * 0.3) / 0.08);
    cards.push(<Img key={`${r}${c}`} src={img(`${fl.slug}-${r ? "w" : "m"}.png`)} style={{ position: "absolute", height: h, width: w, left: x - w / 2, top: y - h / 2, opacity: a,
      transform: `translateY(${(1 - a) * 60 * u}px)`, filter: `brightness(${0.62 + hit * 0.6})` }} />);
  }
  const textO = after(f, 18, [0, 10], [0, 1]) * (1 - dive * 3);
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${-5 + dive * 7}deg)`, transformOrigin: `${cx}px ${cy}px`, opacity: 1 - interpolate(f, [78, 86], [0, 1], clamp) }}>{cards}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(6,18,19,.85) 0%, rgba(6,18,19,.55) 32%, transparent 62%)", opacity: textO }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 120 * u, textAlign: "center", opacity: textO }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 112 * u, letterSpacing: "-0.045em", color: C.chalk, textTransform: "uppercase", lineHeight: 1 }}>
          <Rise f={f} start={18} text="Discover your favorite" style={{ justifyContent: "center" }} />
        </div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 112 * u, color: C.teal, lineHeight: 1.1 }}>
          <Rise f={f} start={28} text="flavor in a bottle." style={{ justifyContent: "center" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─────────────────────────────────────────── 6. the mark: the screen fills with Lemon & Mint, the logo lands
function Logo() {
  const f = useCurrentFrame();
  const { W, H, u, cx, cy } = useLayout();
  const hit = 6, slam = f < hit ? 0 : interpolate(spring({ frame: f - hit, fps: FPS, config: { damping: 11, stiffness: 220 } }), [0, 1], [1.6, 1]);
  const blur = after(f, hit, [0, 5], [14, 0]);
  const lw = 760 * u, lh = lw * 350 / 698;
  const breathe = 1 + 0.012 * Math.sin(Math.max(0, f - 30) / 16);
  const cta = after(f, 40, [0, 12], [0, 1], { easing: easeOut });
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <Fizz f={f} n={20} seed="lg0" color="rgba(30,206,203,.4)" />
      <PourWipe dur={hit + 2} from={1.1} to={-0.15}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 80% at 50% 42%, #7FF3EF, ${C.teal} 55%, ${C.tealD})` }}>
          <Fizz f={f} n={50} seed="lg1" />
          <Streak f={f} start={hit} y={cy - 40 * u} color="#ffffff" />
          <Burst f={f} cx={cx} cy={cy - 40 * u} start={hit} count={80} speed={40 * u} colors={["#fff", "#BFF5F3"]} />
          <div style={{ position: "absolute", left: cx - lw / 2, top: cy - lh / 2 - 90 * u, width: lw, height: lh, transform: `scale(${slam * breathe})`, filter: `blur(${blur}px)`, opacity: f < hit ? 0 : 1 }}>
            <Img src={img("logo.png")} style={{ width: lw, height: lh }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: cy + 170 * u, textAlign: "center" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64 * u, letterSpacing: "-0.04em", color: C.ink, textTransform: "uppercase" }}><Rise f={f} start={18} text="Choose your mix," /></span>{" "}
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 74 * u, color: C.chalk }}><Rise f={f} start={24} text="choose your flavor!" /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: cy + 290 * u, display: "flex", justifyContent: "center", opacity: cta, transform: `translateY(${(1 - cta) * 20 * u}px)` }}>
            <div style={{ padding: `${14 * u}px ${34 * u}px`, borderRadius: 99, background: C.ink, fontFamily: "Mono", letterSpacing: "0.2em", fontSize: 24 * u, color: C.chalk }}>FREEZMIX.COM</div>
          </div>
          <Mono style={{ position: "absolute", left: 56 * u, bottom: 46 * u, fontSize: 18 * u, color: C.ink, opacity: 0.7 * cta }}>Spec ad · unofficial · motion by Appify @appifylb</Mono>
          <Mono style={{ position: "absolute", right: 56 * u, bottom: 46 * u, fontSize: 18 * u, color: C.ink, opacity: 0.7 * cta }}>13 flavors</Mono>
        </AbsoluteFill>
      </PourWipe>
    </AbsoluteFill>
  );
}

// the break before the mark: only bubbles in the dark
function BreakFizz() {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: C.deep }}><Fizz f={f + 40} n={26} seed="bk" color="rgba(30,206,203,.5)" /></AbsoluteFill>;
}

export const Film = () => {
  useFonts([["Grotesk", "space-grotesk-latin-700-normal.woff2", { weight: "700" }], ["Serif", "instrument-serif-latin-400-italic.woff2", { style: "italic" }], ["Mono", "GeistMono-500.ttf"], ["Inter", "inter-latin-600-normal.woff2", { weight: "600" }]]);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      <Sequence from={S.open} durationInFrames={S.flavors - S.open + T.wipe}><Open /></Sequence>
      <Sequence from={S.flavors} durationInFrames={S.orbit - S.flavors + T.wipe}><Flavors /></Sequence>
      <Sequence from={S.orbit} durationInFrames={S.studio - S.orbit + T.wipe}><PourWipe dur={T.wipe + 4}><Orbit /></PourWipe></Sequence>
      <Sequence from={S.studio} durationInFrames={S.wall - S.studio + T.wipe}><PourWipe dur={T.wipe + 4}><Studio /></PourWipe></Sequence>
      <Sequence from={S.wall} durationInFrames={T.brk - S.wall}><PourWipe dur={T.wipe + 4}><Wall /></PourWipe></Sequence>
      <Sequence from={T.brk} durationInFrames={S.logo - T.brk + 2}><BreakFizz /></Sequence>
      <Sequence from={S.logo}><Logo /></Sequence>
      <Audio src={staticFile("sound.wav")} />
      <Vignette strength={0.3} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};
