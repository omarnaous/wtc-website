// Appify price list, one Story per plan. The one idea: the price is a receipt. A question, a beat of silence, the
// price slams in, then Appify's printer prints exactly what you get, line by line, and stamps it. The end card
// keeps the price on screen with "Book a call", so the last frame works as a screenshot.
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { Q1, Q2, HUSH, ROLL, PRICE, RISE, PRINT, lineAt, TOTAL, STAMP, END } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, sparkPath } from "./brand.js";
import { Dev } from "./Dev.jsx";

const W = 1080, H = 1920;
const C = { ink: "#0A0913", ink2: "#17142B", paper: "#F3F1FA", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", mute: "#8A84A3", rule: "#CFCAE0" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 0.95 };
const M = { fontFamily: "Mono", letterSpacing: "0.14em", textTransform: "uppercase" };
const sp = (f, at, damping = 11, stiffness = 240) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const Wordmark = ({ width, fill = "#fff", spark = C.iris }) => (
  <svg viewBox={WORDMARK.viewBox} width={width} height={(width * 1167) / 3224}><path d={WORDMARK.letters} fill={fill} /><path d={WORDMARK.spark} fill={spark} /></svg>
);
const Spark = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 100 100"><path d={sparkPath(50, 50, 48, 0.22)} fill={color} /></svg>;

// receipt geometry: the printer slot sits low; paper rises out of it, so it reads top to bottom as it prints
const SLOT_Y = 1590, PAPER_X = 110, PAPER_W = 860;
const HEAD_H = 150, LINE_H = 104, TOTAL_H = 230, TEAR = 28;

function Background({ f, accent }) {
  return (
    <>
      <AbsoluteFill style={{ background: C.ink }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "72px 72px", backgroundPosition: `36px ${f * 0.7}px` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${accent}38, transparent 55%), radial-gradient(circle at 50% 95%, rgba(91,43,255,.35), transparent 50%)` }} />
    </>
  );
}

function Header({ f, plan }) {
  const p = sp(f, 0, 14, 200);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 236, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * -30}px)` }}>
      <div style={{ ...M, fontSize: 26, color: plan.accent, padding: "12px 22px", borderRadius: 99, border: `3px solid ${plan.accent}88` }}>price list · {plan.n}/4</div>
      <Wordmark width={190} />
    </div>
  );
}

function Question({ f, plan }) {
  if (f > PRICE + 2) return null;
  const out = interpolate(f, [HUSH, PRICE - 4], [0, 1], { ...clamp, easing: easeIn });
  const line = (txt, at, color) => {
    const p = sp(f, at, 10, 280);
    return <div style={{ ...D, fontSize: 124, color, opacity: Math.min(1, p * 2.5), transform: `scale(${interpolate(Math.min(p, 1.2), [0, 1], [1.5, 1])})` }}>{txt}</div>;
  };
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 700, textAlign: "center", opacity: 1 - out, transform: `translateY(${-90 * out}px) scale(${1 - 0.12 * out})`, filter: `blur(${out * 10}px)` }}>
      {line(plan.question[0], Q1, "#fff")}
      <div style={{ height: 14 }} />
      {line(plan.question[1], Q2, plan.accent)}
    </div>
  );
}

// the price: rolls up from $0 during the quiet beat, slams in on the drop, then rises to make room for the receipt
function Price({ f, plan }) {
  if (f < ROLL) return null;
  const roll = interpolate(f, [ROLL, PRICE], [0, plan.price], { ...clamp, easing: easeOut });
  const slam = sp(f, PRICE, 9, 320);
  const pre = f < PRICE;
  const up = sp(f, RISE, 15, 140);
  const scale = (pre ? interpolate(f, [ROLL, PRICE], [0.55, 0.8], clamp) : interpolate(slam, [0, 1], [1.35, 1])) * interpolate(up, [0, 1], [1, 0.55]);
  const top = interpolate(up, [0, 1], [610, 352]);
  const nameP = sp(f, PRICE + 6, 12, 220);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "grid", justifyItems: "center", transform: `scale(${scale})`, transformOrigin: "50% 0", opacity: pre ? interpolate(f, [ROLL, ROLL + 4], [0, 0.55], clamp) : 1 }}>
      {plan.from && <div style={{ ...M, fontSize: 46, color: plan.accent, marginBottom: 6, opacity: pre ? 0 : Math.min(1, slam * 2) }}>starting from</div>}
      <div style={{ ...D, fontSize: 330, color: "#fff", fontVariantNumeric: "tabular-nums", textShadow: pre ? "none" : `0 0 80px ${plan.accent}66` }}>{money(pre ? roll : plan.price)}</div>
      <div style={{ marginTop: 26, padding: "16px 34px", borderRadius: 99, background: C.ink2, border: `3px solid ${plan.accent}`, fontFamily: "UI", fontWeight: 600, fontSize: 44, color: "#fff", opacity: Math.min(1, nameP * 2), transform: `translateY(${(1 - Math.min(1, nameP)) * 30}px)` }}>{plan.name}</div>
    </div>
  );
}

function Receipt({ f, plan }) {
  if (f < RISE) return null;
  const n = plan.lines.length;
  const full = HEAD_H + n * LINE_H + TOTAL_H + TEAR;
  // how much paper is out of the slot: the header, then one line at a time, then the total
  const grow = (at, amount, dur = 9) => interpolate(f, [at, at + dur], [0, amount], { ...clamp, easing: easeOut });
  let out = grow(PRINT, HEAD_H + TEAR, 14);
  plan.lines.forEach((_, i) => { out += grow(lineAt(i), LINE_H); });
  out += grow(TOTAL, TOTAL_H, 12);
  const slot = sp(f, RISE + 4, 14, 200);
  const stampP = sp(f, STAMP, 8, 380);
  const [sx, sy] = shake(f, STAMP, 10, 3.5);
  return (
    <>
      {/* paper: content laid out top to bottom, only the part already printed is out of the slot */}
      <div style={{ position: "absolute", left: PAPER_X, width: PAPER_W, top: SLOT_Y - out, height: out, overflow: "hidden", transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: full, background: C.paper, clipPath: `polygon(${Array.from({ length: 27 }, (_, k) => `${(k / 26) * 100}% ${k % 2 ? 0 : TEAR * 0.7}px`).join(",")}, 100% 100%, 0 100%)`, boxShadow: "0 30px 60px rgba(0,0,0,.4)" }}>
          <div style={{ height: HEAD_H, paddingTop: TEAR + 14, display: "grid", justifyItems: "center", gap: 12 }}>
            <Wordmark width={200} fill={C.ink} spark={C.uv} />
            <div style={{ width: PAPER_W - 80, borderTop: `3px dashed ${C.rule}` }} />
          </div>
          {plan.lines.map(([txt, yes], i) => {
            const tick = sp(f, lineAt(i) + 5, 9, 320);
            return (
              <div key={i} style={{ height: LINE_H, display: "flex", alignItems: "center", gap: 26, padding: "0 50px", fontFamily: "Mono", fontSize: 44, color: yes ? C.ink : C.mute }}>
                <div style={{ width: 58, height: 58, flex: "none", borderRadius: 29, display: "grid", placeItems: "center", background: yes ? C.uv : "transparent", border: yes ? "none" : `3px solid ${C.rule}`, color: "#fff", fontFamily: "UI", fontWeight: 600, fontSize: 34, transform: `scale(${Math.min(1.15, tick)})` }}>{yes ? "✓" : <span style={{ color: C.mute }}>–</span>}</div>
                <span style={{ textDecoration: yes ? "none" : "line-through", textDecorationThickness: 3 }}>{txt}</span>
              </div>
            );
          })}
          <div style={{ height: TOTAL_H, padding: "20px 50px 0" }}>
            <div style={{ borderTop: `3px dashed ${C.rule}`, marginBottom: 26 }} />
            <div style={{ display: "grid", justifyItems: "end", gap: 10 }}>
              <div style={{ ...M, fontSize: 26, color: C.mute }}>{plan.totalLabel}</div>
              <div style={{ ...D, fontSize: 124, color: C.ink }}>{money(plan.price)}</div>
            </div>
          </div>
        </div>
        {/* the stamp, on the paper */}
        {f >= STAMP && (
          <div style={{ position: "absolute", left: 44, top: HEAD_H + n * LINE_H + TEAR + 74, transform: `rotate(-9deg) scale(${interpolate(stampP, [0, 1], [2.4, 1])})`, transformOrigin: "30% 50%", opacity: Math.min(1, stampP * 3), padding: "12px 22px", border: `7px solid ${C.uv}`, borderRadius: 16, ...D, fontSize: plan.stamp.length > 9 ? 40 : 52, letterSpacing: "0.02em", color: C.uv, mixBlendMode: "multiply" }}>{plan.stamp}</div>
        )}
      </div>
      {/* the printer slot, over the paper's bottom edge */}
      <div style={{ position: "absolute", left: 100, width: 880, top: SLOT_Y - 10, height: 46, borderRadius: 23, background: "#05040A", boxShadow: `inset 0 6px 14px rgba(0,0,0,.9), 0 0 0 3px ${plan.accent}55, 0 0 50px ${plan.accent}33`, transform: `scaleX(${Math.min(1, slot)})` }} />
    </>
  );
}

function Story({ f, plan }) {
  const [sx, sy] = shake(f, PRICE, 26, 5);
  return (
    <AbsoluteFill>
      <Background f={f} accent={plan.accent} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <Header f={f} plan={plan} />
        <Question f={f} plan={plan} />
        <Price f={f} plan={plan} />
        <Receipt f={f} plan={plan} />
      </AbsoluteFill>
      <Shockwave f={f} cx={W / 2} cy={790} start={PRICE} max={900} width={10} rgb="143,114,255" />
      <Burst f={f} cx={W / 2} cy={790} start={PRICE} count={80} speed={44} seed={plan.id} colors={["#fff", plan.accent, C.iris]} />
      <Burst f={f} cx={300} cy={SLOT_Y - 150} start={STAMP} count={30} speed={20} seed={plan.id + "s"} colors={[C.uv, plan.accent]} />
      <Flash f={f} start={PRICE} peak={0.35} />
    </AbsoluteFill>
  );
}

function EndCard({ f, plan }) {
  const t = f - END;
  const pr = sp(t, 2, 10, 300), cta = sp(t, 10, 9, 260), dev = sp(t, 6, 13, 160), nx = sp(t, 22, 12, 220);
  const pulse = 1 + 0.025 * Math.sin((t / 15) * Math.PI);
  return (
    <AbsoluteFill>
      <Background f={f} accent={plan.accent} />
      <Header f={300} plan={plan} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "grid", justifyItems: "center", textAlign: "center" }}>
        <div style={{ ...M, fontSize: 32, color: plan.accent, opacity: Math.min(1, pr * 2) }}>{plan.name}</div>
        <div style={{ ...D, fontSize: 250, color: "#fff", marginTop: 22, transform: `scale(${interpolate(Math.min(pr, 1.1), [0, 1], [1.4, 1])})`, opacity: Math.min(1, pr * 2.5) }}>
          {plan.from && <span style={{ fontSize: 80, color: plan.accent, letterSpacing: "-0.02em", marginRight: 18 }}>from</span>}{money(plan.price)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "grid", justifyItems: "center", opacity: Math.min(1, cta * 2), transform: `scale(${interpolate(Math.min(cta, 1.1), [0, 1], [1.5, 1]) * pulse})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "34px 40px 34px 60px", borderRadius: 999, background: "linear-gradient(110deg, #4A1FF0, #5B2BFF 40%, #7B57FF)", boxShadow: "0 24px 70px rgba(91,43,255,.7), inset 0 2px 0 rgba(255,255,255,.3)" }}>
          <span style={{ ...D, fontSize: 84, color: "#fff", letterSpacing: "-0.03em" }}>Book a call</span>
          <span style={{ width: 92, height: 92, borderRadius: 46, background: "#fff", display: "grid", placeItems: "center", color: C.uv, fontFamily: "UI", fontWeight: 600, fontSize: 54 }}>→</span>
        </div>
        <div style={{ ...M, fontSize: 32, color: "rgba(255,255,255,.75)", marginTop: 34 }}>appify-lb.com</div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 1090, transform: `translateY(${(1 - Math.min(1, dev)) * 600}px)` }}>
        <Dev width={250} thumbs={1} brow={16} lid={0.08} smile={1} look={6} happy={1} tilt={Math.sin(t / 8) * 2} />
      </div>
      <div style={{ position: "absolute", right: 80, top: 1290, width: 560, display: "grid", justifyItems: "end", gap: 18, opacity: Math.min(1, nx * 2), transform: `translateX(${(1 - Math.min(1, nx)) * 60}px)` }}>
        {plan.next ? (
          <>
            <div style={{ ...M, fontSize: 24, color: C.mute }}>next on the price list</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 26px", borderRadius: 22, background: C.ink2, border: "3px solid rgba(143,114,255,.4)", fontFamily: "UI", fontWeight: 600, fontSize: 36, color: "#fff", textAlign: "right" }}>{plan.next} <Spark size={30} color={C.iris} /></div>
          </>
        ) : (
          <>
            <div style={{ ...M, fontSize: 24, color: C.mute }}>that's the full price list</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 26px", borderRadius: 22, background: C.ink2, border: "3px solid rgba(143,114,255,.4)", fontFamily: "UI", fontWeight: 600, fontSize: 36, color: "#fff" }}>Ideas, appified. <Spark size={30} color={C.iris} /></div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
}

export const Main = ({ plan, music = true }) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }]]);
  const f = useCurrentFrame();
  // spark cut into the end card: the end card is revealed through a spark growing from the centre
  const inCut = f >= END && f < END + 9;
  const p = interpolate(f, [END, END + 9], [0, 1], { ...clamp, easing: easeIn });
  const R = Math.max(1, p * Math.hypot(W, H) * 1.25);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile(`${plan.id}${music ? "" : "-sfx"}.wav`)} />
      {f < END + 9 && <Story f={Math.min(f, END + 8)} plan={plan} />}
      {f >= END && (
        <AbsoluteFill style={inCut ? { clipPath: `path('${sparkPath(W / 2, H * 0.48, R, 0.3)}')` } : undefined}><EndCard f={f} plan={plan} /></AbsoluteFill>
      )}
      {inCut && <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><path d={sparkPath(W / 2, H * 0.48, R, 0.3)} fill="none" stroke={plan.accent} strokeWidth={14 * (1 - p)} /></svg>}
      {f >= END && f < END + 4 && <Flash f={f} start={END} peak={0.2} />}
      <Vignette strength={0.2} />
      <Grain f={f} opacity={0.035} />
    </AbsoluteFill>
  );
};
