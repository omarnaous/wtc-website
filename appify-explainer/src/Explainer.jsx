// "What if your brand... stopped the scroll?" A 15 s product explainer for Appify in the clean, light UI style of
// AI-workspace ads: a line types and collapses into a dotted leader, the answer lands on the drop, then requests are
// typed into an Appify bar and each one pops out the thing Appify builds (store, ad, app, dashboard). Ends on the
// wordmark, the tagline and the real starting price.
// Drawn on a fixed 1920 x 1080 stage; the reel scales it onto a laptop screen.
import { AbsoluteFill, interpolate, spring } from "remotion";
import { TYPE1, COLLAPSE, SLAM, BAR, PROMPTS, promptAt, enterAt, CHAR, LOGO, PRICE } from "./timing.js";
import { clamp, easeOut, easeIn, Burst } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

export const C = { paper: "#F7F6FB", ink: "#0A0913", ink2: "#3B3650", mute: "#8A84A3", rule: "#E6E2F3", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", green: "#16B67A", yellow: "#FFC83D", pink: "#FF6FA5" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const UI4 = { fontFamily: "UI4", fontWeight: 400 };
const MONO = { fontFamily: "Mono", letterSpacing: "0.12em", textTransform: "uppercase" };
const sp = (f, at, damping = 13, stiffness = 220) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const Spark = ({ size, color = C.uv, style }) => <svg width={size} height={size} viewBox="0 0 100 100" style={style}><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;
const typed = (txt, f, start, per) => txt.slice(0, Math.max(0, Math.floor((f - start) / per)));
const Caret = ({ f, on, h = 0.9 }) => <span style={{ display: "inline-block", width: "0.06em", height: `${h}em`, marginLeft: "0.04em", verticalAlign: "-0.1em", background: C.uv, opacity: on || Math.floor(f / 8) % 2 === 0 ? 1 : 0 }} />;

// ── 1-2 · "What if your brand" → dotted leader → "stopped the scroll?" ─────────────────────────────────────
function Headline({ f }) {
  if (f > BAR + 10) return null;
  const LINE = "What if your brand";
  const per = 2.2, done = TYPE1 + LINE.length * per;
  const col = interpolate(f, [COLLAPSE, COLLAPSE + 14], [0, 1], { ...clamp, easing: easeIn });
  const dots = interpolate(f, [COLLAPSE + 4, SLAM - 2], [0, 1], { ...clamp, easing: easeOut });
  const slam = sp(f, SLAM, 9, 300);
  const leave = interpolate(f, [BAR - 14, BAR + 6], [0, 1], { ...clamp, easing: easeIn });
  return (
    <AbsoluteFill style={{ opacity: 1 - leave, transform: `translateY(${-120 * leave}px)` }}>
      {f < SLAM + 4 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", ...D, fontSize: 124, color: C.ink, opacity: 1 - col, transform: `scaleX(${1 - 0.7 * col})`, filter: `blur(${col * 8}px)` }}>
          {typed(LINE, f, TYPE1, per)}<Caret f={f} on={f < done} />
        </div>
      )}
      {f >= COLLAPSE + 4 && f < SLAM + 6 && (
        <div style={{ position: "absolute", left: 960 - 380 * dots, width: 760 * dots, top: 528, height: 12, opacity: f < SLAM ? 1 : interpolate(f, [SLAM, SLAM + 6], [1, 0], clamp), backgroundImage: `radial-gradient(circle, ${C.ink} 4px, transparent 5px)`, backgroundSize: "26px 12px", backgroundRepeat: "repeat-x" }} />
      )}
      {f >= SLAM && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 462, textAlign: "center", ...D, fontSize: 134, color: C.ink, opacity: Math.min(1, slam * 2.5), transform: `scale(${interpolate(Math.min(slam, 1.15), [0, 1], [1.5, 1])})` }}>
          stopped <span style={{ background: `linear-gradient(100deg, ${C.uv}, ${C.iris} 55%, ${C.sky})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>the scroll?</span>
        </div>
      )}
    </AbsoluteFill>
  );
}

// ── 3 · the Appify bar: requests typed in, each pops a card ───────────────────────────────────────────────
const current = (f) => PROMPTS.reduce((k, _, i) => (f >= promptAt(i) ? i : k), -1);
function Bar({ f }) {
  if (f < BAR || f > LOGO + 12) return null;
  const p = sp(f, BAR, 13, 200), out = interpolate(f, [LOGO - 6, LOGO + 8], [0, 1], { ...clamp, easing: easeIn });
  const i = current(f);
  const txt = i < 0 ? "" : typed(PROMPTS[i], f, promptAt(i), CHAR);
  const typing = i >= 0 && f < enterAt(i);
  const hit = i >= 0 ? interpolate(f - enterAt(i), [0, 2, 8], [0, 1, 0], clamp) : 0;
  return (
    <div style={{ position: "absolute", left: 460, width: 1000, top: 150, height: 104, borderRadius: 52, background: "#fff", border: `2px solid ${typing ? C.iris : C.rule}`, boxShadow: `0 24px 60px -24px rgba(91,43,255,${0.35 + 0.3 * hit}), 0 2px 0 rgba(10,9,19,.04)`, display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 30px", opacity: Math.min(1, p * 2) * (1 - out), transform: `translateY(${(1 - Math.min(1, p)) * 30 - 40 * out}px) scale(${0.94 + 0.06 * Math.min(1, p) - 0.015 * hit})` }}>
      <Spark size={40} />
      <div style={{ flex: 1, ...UI4, fontSize: 40, color: txt ? C.ink : C.mute, whiteSpace: "nowrap", overflow: "hidden" }}>
        {txt || "Ask Appify to build anything…"}{i >= 0 && <Caret f={f} on={typing} h={0.95} />}
      </div>
      <div style={{ width: 68, height: 68, borderRadius: 34, display: "grid", placeItems: "center", background: hit > 0.1 || typing ? C.uv : C.rule, color: "#fff", ...UI, fontSize: 34, transform: `scale(${1 + 0.15 * hit})` }}>↑</div>
    </div>
  );
}

const Card = ({ f, i, children }) => {
  const a = enterAt(i), next = i < PROMPTS.length - 1 ? enterAt(i + 1) : LOGO;
  if (f < a || f > next + 10) return null;
  const p = sp(f, a, 12, 210), out = interpolate(f, [next - 2, next + 8], [0, 1], { ...clamp, easing: easeIn });
  return (
    <div style={{ position: "absolute", left: 460, width: 1000, top: 300, height: 600, borderRadius: 32, background: "#fff", border: `2px solid ${C.rule}`, boxShadow: "0 40px 90px -40px rgba(10,9,19,.35)", overflow: "hidden", opacity: Math.min(1, p * 2) * (1 - out), transform: `translateY(${(1 - Math.min(1, p)) * 60 + 50 * out}px) scale(${0.96 + 0.04 * Math.min(1, p) - 0.04 * out})` }}>
      {children(f - a)}
    </div>
  );
};
const Pill = ({ children, color = C.green, style }) => <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 99, background: `${color}1A`, color, ...UI, fontSize: 24, ...style }}><span style={{ width: 12, height: 12, borderRadius: 6, background: color }} />{children}</div>;
const Head = ({ title, right }) => (
  <div style={{ height: 92, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", borderBottom: `2px solid ${C.rule}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, ...UI, fontSize: 30, color: C.ink }}><Spark size={28} />{title}</div>{right}
  </div>
);

// store: three products, one goes into the cart
function StoreCard(t) {
  const items = [["Classic tee", "$24", `linear-gradient(135deg, ${C.iris}, ${C.uv})`], ["Canvas tote", "$18", `linear-gradient(135deg, ${C.sky}, #3E8BFF)`], ["Logo cap", "$15", `linear-gradient(135deg, ${C.yellow}, #FF8A3D)`]];
  const add = sp(t, 18, 9, 320), cart = t >= 22 ? 1 : 0;
  return (
    <>
      <Head title="Your store" right={<div style={{ display: "flex", gap: 16, alignItems: "center" }}><Pill>Live</Pill><div style={{ ...UI, fontSize: 26, color: C.ink, padding: "10px 18px", borderRadius: 99, border: `2px solid ${C.rule}`, transform: `scale(${1 + 0.18 * Math.max(0, 1 - Math.abs(t - 24) / 6)})` }}>Cart · {cart}</div></div>} />
      <div style={{ display: "flex", gap: 28, padding: "34px 40px" }}>
        {items.map(([n, pr, bg], k) => {
          const q = sp(t, 2 + k * 4, 13, 220);
          return (
            <div key={k} style={{ flex: 1, opacity: Math.min(1, q * 2), transform: `translateY(${(1 - Math.min(1, q)) * 30}px)` }}>
              <div style={{ height: 270, borderRadius: 22, background: bg, display: "grid", placeItems: "center" }}><Spark size={70} color="rgba(255,255,255,.85)" /></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, ...UI, fontSize: 28, color: C.ink }}><span>{n}</span><span>{pr}</span></div>
              <div style={{ marginTop: 16, height: 56, borderRadius: 28, display: "grid", placeItems: "center", ...UI, fontSize: 24, background: k === 0 && add > 0.5 ? C.uv : C.paper, color: k === 0 && add > 0.5 ? "#fff" : C.ink2, transform: k === 0 ? `scale(${1 - 0.06 * Math.max(0, 1 - Math.abs(t - 18) / 4)})` : "none" }}>{k === 0 && add > 0.5 ? "Added ✓" : "Add to cart"}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ad: a 9:16 preview with kinetic type, and a timeline with a moving playhead
function AdCard(t) {
  const words = ["Stop", "the", "scroll."], w = words.filter((_, k) => t >= 4 + k * 6).length;
  const head = interpolate(t, [0, 60], [0, 1], clamp);
  return (
    <>
      <Head title="Your ad · 0:15" right={<div style={{ display: "flex", gap: 10 }}>{["9:16", "4:5", "16:9"].map((x) => <div key={x} style={{ ...MONO, fontSize: 20, padding: "10px 14px", borderRadius: 12, border: `2px solid ${C.rule}`, color: C.ink2 }}>{x}</div>)}</div>} />
      <div style={{ display: "flex", gap: 36, padding: "30px 40px" }}>
        <div style={{ width: 250, height: 444, borderRadius: 30, background: `radial-gradient(circle at 50% 30%, ${C.uv}, #1A0F4A 70%)`, display: "grid", placeItems: "center", alignContent: "center", gap: 6, overflow: "hidden", position: "relative" }}>
          {words.slice(0, w).map((x, k) => <div key={k} style={{ ...D, fontSize: 58, color: k === 2 ? C.sky : "#fff", transform: `scale(${Math.min(1.2, sp(t, 4 + k * 6, 9, 320)) || 0.01})` }}>{x}</div>)}
          <div style={{ position: "absolute", bottom: 18, left: 18, right: 18, height: 6, borderRadius: 3, background: "rgba(255,255,255,.25)" }}><div style={{ width: `${head * 100}%`, height: "100%", borderRadius: 3, background: "#fff" }} /></div>
        </div>
        <div style={{ flex: 1, display: "grid", gap: 22, alignContent: "start", paddingTop: 10, position: "relative" }}>
          {[["Video", C.uv, [[0, 0.32], [0.34, 0.7], [0.72, 1]]], ["Text", C.iris, [[0.05, 0.3], [0.4, 0.62], [0.75, 0.95]]], ["Sound", C.sky, [[0, 1]]]].map(([n, col, clips], k) => (
            <div key={k}>
              <div style={{ ...MONO, fontSize: 20, color: C.mute, marginBottom: 10 }}>{n}</div>
              <div style={{ position: "relative", height: 64, borderRadius: 14, background: C.paper }}>
                {clips.map(([a, b], j) => <div key={j} style={{ position: "absolute", left: `${a * 100}%`, width: `${(b - a) * 100 - 1}%`, top: 8, bottom: 8, borderRadius: 10, background: col, opacity: k === 2 ? 0.35 : 0.9, transformOrigin: "0 50%", transform: `scaleX(${Math.min(1, sp(t, 2 + j * 3 + k * 2, 14, 200))})` }} />)}
                {k === 2 && <svg width="100%" height="64" style={{ position: "absolute", inset: 0 }}>{Array.from({ length: 90 }, (_, j) => { const hgt = 8 + 30 * Math.abs(Math.sin(j * 0.7) * Math.cos(j * 0.23)); return <rect key={j} x={`${(j / 90) * 100}%`} y={32 - hgt / 2} width="3" height={hgt} rx="1.5" fill={C.uv} opacity=".7" />; })}</svg>}
              </div>
            </div>
          ))}
          <div style={{ position: "absolute", top: 0, bottom: -10, left: `${head * 100}%`, width: 4, borderRadius: 2, background: C.ink }} />
        </div>
      </div>
    </>
  );
}

// app: the same app on iOS and Android, both stores ticked
function AppCard(t) {
  const Phone = ({ label, k }) => {
    const q = sp(t, 2 + k * 5, 12, 210);
    return (
      <div style={{ display: "grid", justifyItems: "center", gap: 18, opacity: Math.min(1, q * 2), transform: `translateY(${(1 - Math.min(1, q)) * 40}px)` }}>
        <div style={{ width: 210, height: 400, borderRadius: 40, border: `8px solid ${C.ink}`, background: C.paper, padding: 18, display: "grid", alignContent: "start", gap: 14 }}>
          <div style={{ width: 70, height: 70, borderRadius: 20, background: `linear-gradient(135deg, ${C.iris}, ${C.uv})`, display: "grid", placeItems: "center", justifySelf: "center", marginTop: 14 }}><Spark size={38} color="#fff" /></div>
          <div style={{ ...UI, fontSize: 22, color: C.ink, textAlign: "center" }}>Your app</div>
          {[0, 1, 2].map((r) => <div key={r} style={{ height: 40, borderRadius: 12, background: "#fff", border: `2px solid ${C.rule}`, opacity: t > 8 + r * 4 ? 1 : 0.2 }} />)}
        </div>
        <div style={{ ...MONO, fontSize: 20, color: C.ink2 }}>{label}</div>
      </div>
    );
  };
  return (
    <>
      <Head title="Your app" right={<Pill color={C.uv}>Admin panel</Pill>} />
      <div style={{ display: "flex", alignItems: "center", gap: 46, padding: "26px 54px" }}>
        <Phone label="iOS" k={0} /><Phone label="Android" k={1} />
        <div style={{ display: "grid", gap: 20, marginLeft: 10 }}>
          {["App Store", "Google Play"].map((s, k) => { const q = sp(t, 14 + k * 6, 9, 300); return <div key={s} style={{ opacity: Math.min(1, q * 2), transform: `scale(${Math.min(1.1, q)})`, transformOrigin: "0 50%" }}><Pill style={{ fontSize: 30, padding: "16px 24px" }}>{s} ✓</Pill></div>; })}
        </div>
      </div>
    </>
  );
}

// dashboard: clients, a bar chart growing and a line drawing (illustrative UI, no figures)
function CrmCard(t) {
  const grow = interpolate(t, [2, 22], [0, 1], { ...clamp, easing: easeOut });
  const bars = [0.42, 0.55, 0.5, 0.68, 0.74, 0.9];
  const pts = [0.25, 0.32, 0.3, 0.45, 0.52, 0.6, 0.72, 0.8];
  const line = pts.map((y, k) => `${k === 0 ? "M" : "L"}${(k / (pts.length - 1)) * 380},${150 - y * 140}`).join(" ");
  return (
    <>
      <Head title="Your dashboard" right={<Pill color={C.uv}>CRM</Pill>} />
      <div style={{ display: "flex", gap: 30, padding: "30px 40px" }}>
        <div style={{ width: 410, display: "grid", gap: 14 }}>
          {[["Clients", C.uv], ["Sales", C.green], ["Tasks", C.sky]].map(([n, col], k) => (
            <div key={n} style={{ height: 70, borderRadius: 18, background: C.paper, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", ...UI, fontSize: 28, color: C.ink, opacity: Math.min(1, sp(t, 2 + k * 3) * 2) }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: col }} />{n}
              <div style={{ marginLeft: "auto", width: 120, height: 10, borderRadius: 5, background: C.rule }}><div style={{ width: `${grow * [70, 85, 55][k]}%`, height: "100%", borderRadius: 5, background: col }} /></div>
            </div>
          ))}
          {["New lead", "Order paid", "Call booked"].map((n, k) => (
            <div key={n} style={{ height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 10px", borderBottom: `2px solid ${C.rule}`, opacity: t > 10 + k * 4 ? 1 : 0, transform: `translateX(${t > 10 + k * 4 ? 0 : 20}px)` }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: [C.iris, C.sky, C.yellow][k] }} />
              <span style={{ ...UI4, fontSize: 26, color: C.ink2 }}>{n}</span>
              <span style={{ marginLeft: "auto" }}><Pill color={[C.uv, C.green, C.sky][k]} style={{ fontSize: 20, padding: "6px 14px" }}>{["New", "Paid", "Booked"][k]}</Pill></span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, borderRadius: 22, background: C.paper, padding: 26, display: "grid", gap: 16, alignContent: "start" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200 }}>
            {bars.map((h, k) => <div key={k} style={{ flex: 1, height: `${h * 100 * Math.min(1, grow * 1.2 - k * 0.04)}%`, borderRadius: 10, background: k === bars.length - 1 ? C.uv : C.iris, opacity: k === bars.length - 1 ? 1 : 0.45 }} />)}
          </div>
          <svg width="100%" height="160" viewBox="0 0 380 160" preserveAspectRatio="none"><path d={line} fill="none" stroke={C.uv} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - grow} /></svg>
        </div>
      </div>
    </>
  );
}

// ── 4 · the wordmark, the tagline, the real starting price ───────────────────────────────────────────────
function Logo({ f }) {
  if (f < LOGO) return null;
  const t = f - LOGO;
  const rev = interpolate(t, [2, 18], [0, 1], { ...clamp, easing: easeOut });
  const spark = sp(t, 16, 8, 320);
  const tag = typed("Ideas, appified.", f, LOGO + 22, 1.6);
  const pr = sp(f, PRICE, 11, 260), roll = interpolate(f, [PRICE, PRICE + 12], [0, 360], { ...clamp, easing: easeOut });
  const dev = sp(f, PRICE + 6, 13, 160);
  const W = 860, H = (W * 1167) / 3224;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: (1920 - W) / 2, top: 250, width: W, height: H }}>
        <svg viewBox={WORDMARK.viewBox} width={W} height={H} style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - rev) * 100}% 0 0)` }}><path d={WORDMARK.letters} fill={C.ink} /></svg>
        <svg viewBox={WORDMARK.viewBox} width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={WORDMARK.spark} fill={C.uv} style={{ transformBox: "fill-box", transformOrigin: "50% 50%", transform: `scale(${Math.min(1.25, spark)}) rotate(${(1 - Math.min(1, spark)) * 90}deg)` }} />
        </svg>
      </div>
      <Burst f={f} cx={(1920 - W) / 2 + W * ((2118.5 + 20) / 3224)} cy={250 + H * ((-750 + 917) / 1167)} start={LOGO + 16} count={40} speed={26} seed="logo" colors={[C.uv, C.iris, C.sky]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 610, textAlign: "center", ...D, fontSize: 70, color: C.ink2, letterSpacing: "-0.03em" }}>{tag}{t > 22 && t < 70 && <Caret f={f} on={tag.length < 16} />}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 740, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, opacity: Math.min(1, pr * 2), transform: `translateY(${(1 - Math.min(1, pr)) * 30}px)` }}>
        <span style={{ ...MONO, fontSize: 28, color: C.mute }}>Websites from</span>
        <span style={{ ...D, fontSize: 84, color: C.uv, fontVariantNumeric: "tabular-nums" }}>${Math.round(roll)}</span>
        <span style={{ ...MONO, fontSize: 28, color: C.mute }}>· appify-lb.com</span>
      </div>
      <div style={{ position: "absolute", right: 120, top: 520, transform: `translateY(${(1 - Math.min(1, dev)) * 700}px)` }}>
        <Dev width={230} wave={1} waveAng={Math.sin(t / 3) * 16} brow={14} lid={0.06} smile={1} happy={0.6} look={-6} />
      </div>
    </AbsoluteFill>
  );
}

export function Explainer({ f }) {
  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.rule} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.rule} 1.5px, transparent 1.5px)`, backgroundSize: "80px 80px", opacity: 0.5 }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(143,114,255,.18), transparent 60%)` }} />
      <Headline f={f} />
      {/* the bar and its cards, a little larger so they read on a phone-sized laptop screen */}
      <AbsoluteFill style={{ transform: "scale(1.15)", transformOrigin: "50% 50%" }}>
        <Bar f={f} />
        <Card f={f} i={0}>{StoreCard}</Card>
        <Card f={f} i={1}>{AdCard}</Card>
        <Card f={f} i={2}>{AppCard}</Card>
        <Card f={f} i={3}>{CrmCard}</Card>
      </AbsoluteFill>
      <Logo f={f} />
    </AbsoluteFill>
  );
}
