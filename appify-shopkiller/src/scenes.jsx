import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, money, DISPLAY, MONO, Words, exitStyle, Printer, Store } from "./ui.jsx";
import { clamp, easeOut, easeIn, shake, Flash, Shockwave, Burst, Streak } from "./fx.jsx";
import { WORDMARK } from "./brand.js";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/* ── 1. Hook: the receipt that never ends ─────────────────────────────── */
export function Receipt({ monthly }) {
  const f = useCurrentFrame();
  const slot = 900, speed = 13, rowH = 64, first = 4;
  const len = Math.max(0, (f - first) * speed + 120);
  const rows = Array.from({ length: 24 }, (_, k) => k);
  const sway = Math.sin(f / 14) * 1.2;
  return (
    <AbsoluteFill style={exitStyle(f, 78, 12, -260)}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${interpolate(f, [0, 8], [1.08, 1], { ...clamp, easing: easeOut })})`, transformOrigin: "50% 25%" }}>
        <Words text="Still paying" y={300} size={96} start={-40} />
        <Words text={`$${monthly}/month`} y={410} size={168} color={C.alert} start={-40} />
        <Words text="for your store?" y={590} size={96} start={-40} />
      </div>
      <div style={{ position: "absolute", left: 230, top: slot + 40, width: 620, height: len, overflow: "hidden", transform: `rotate(${sway}deg)`, transformOrigin: "50% 0%", background: "#FFFFFF", boxShadow: "0 30px 50px rgba(10,9,19,.12)", backgroundImage: "linear-gradient(transparent 92%, rgba(10,9,19,.06) 92%)", backgroundSize: `100% ${rowH}px` }}>
        {/* newest row at the slot, older rows pushed down */}
        <div style={{ position: "absolute", left: 0, right: 0, top: len - 120, height: 120, display: "grid", placeItems: "center", ...MONO, fontSize: 26, color: C.ink }}>SUBSCRIPTION · NO END DATE</div>
        {rows.map((k) => {
          const t = first + 6 + k * (rowH / speed);
          if (f < t) return null;
          const y = (f - t) * speed;
          const m = MONTHS[k % 12], yr = 26 + Math.floor(k / 12);
          return (
            <div key={k} style={{ position: "absolute", left: 36, right: 36, top: y, height: rowH, display: "flex", alignItems: "center", justifyContent: "space-between", ...MONO, fontSize: 27, color: C.ink }}>
              <span>{m} {yr}</span><span style={{ color: C.mute }}>Monthly plan</span><span style={{ color: C.alert }}>${monthly.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      <Printer y={slot - 50} />
    </AbsoluteFill>
  );
}

/* ── 2. The cost: 3D bars, year by year ───────────────────────────────── */
export function Cost({ monthly }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const yearly = monthly * 12;
  const base = 1400, maxV = 4000, maxH = 720, x0 = 150, bw = 58, gap = 26, depth = 20;
  const hOf = (v) => (v / maxV) * maxH;
  const head = interpolate(f, [40, 52], [0, 1], { ...clamp, easing: easeOut });
  const barStart = (i) => 50 + i * 7;
  const grown = Array.from({ length: 10 }, (_, i) => spring({ frame: f - barStart(i), fps, config: { damping: 14, stiffness: 170 } }));
  const lastIdx = grown.reduce((m, g, i) => (g > 0.05 ? i : m), -1);
  const total = lastIdx < 0 ? 0 : yearly * (lastIdx + grown[lastIdx]);
  return (
    <AbsoluteFill style={exitStyle(f, 172, 8, -60)}>
      {/* Every. Single. Month. — on the beat, then shrink into a header */}
      <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(head, [0, 1], [430, 236]), transform: `scale(${interpolate(head, [0, 1], [1, 0.3])})`, transformOrigin: "50% 0%" }}>
        {["Every.", "Single.", "Month."].map((w, i) => {
          const s = spring({ frame: f - i * 15, fps, config: { damping: 11, stiffness: 240 } });
          return <div key={w} style={{ ...DISPLAY, fontSize: 210, textAlign: "center", color: i === 2 ? C.alert : C.ink, opacity: f < i * 15 ? 0 : 1, transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})`, height: 220 }}>{w}</div>;
        })}
      </div>
      {f >= 44 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center", ...DISPLAY, fontSize: 150, color: C.alert, opacity: head, fontVariantNumeric: "tabular-nums" }}>{money(total)}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 618, textAlign: "center", ...MONO, fontSize: 26, color: C.mute, opacity: head }}>SPENT ON SUBSCRIPTION FEES</div>
          <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: head }}>
            {[1000, 2000, 3000, 4000].map((v) => (
              <g key={v}><line x1={x0 - 20} x2={x0 + 10 * (bw + gap)} y1={base - hOf(v)} y2={base - hOf(v)} stroke="rgba(10,9,19,.12)" strokeDasharray="4 8" strokeWidth="2" />
                <text x={x0 - 30} y={base - hOf(v) + 8} textAnchor="end" style={{ ...MONO, fontSize: 20 }} fill={C.mute}>{v / 1000}k</text></g>
            ))}
            <line x1={x0 - 20} x2={x0 + 10 * (bw + gap)} y1={base} y2={base} stroke={C.ink} strokeWidth="3" />
            {grown.map((g, i) => {
              const v = yearly * (i + 1), h = hOf(v) * g, x = x0 + i * (bw + gap), y = base - h;
              if (g <= 0.001) return null;
              return (
                <g key={i}>
                  <path d={`M${x + bw},${y} l${depth},${-depth} v${h} l${-depth},${depth} Z`} fill="#B5182C" />
                  <path d={`M${x},${y} l${depth},${-depth} h${bw} l${-depth},${depth} Z`} fill="#FF7A88" />
                  <rect x={x} y={y} width={bw} height={h} fill={C.alert} />
                  <text x={x + bw / 2} y={base + 40} textAnchor="middle" style={{ ...MONO, fontSize: 20 }} fill={C.mute}>Y{i + 1}</text>
                  {[0, 4, 9].includes(i) && g > 0.6 && (
                    <text x={x + bw / 2 + depth / 2} y={y - depth - 16} textAnchor="middle" style={{ ...DISPLAY, fontSize: 32 }} fill={C.ink} opacity={Math.min(1, (g - 0.6) * 3)}>{money(v)}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </>
      )}
      <Words text="…and you still don't own it." y={1500} size={64} start={135} colors={{ 3: C.alert, 4: C.alert, 5: C.alert }} />
    </AbsoluteFill>
  );
}

/* ── 3. The turn ──────────────────────────────────────────────────────── */
export function Turn() {
  const f = useCurrentFrame();
  const suck = interpolate(f, [48, 60], [0, 1], { ...clamp, easing: easeIn });
  return (
    <AbsoluteFill style={{ opacity: 1 - suck, transform: `scale(${1 - suck * 0.4})`, filter: `blur(${suck * 8}px)` }}>
      <Words text="What if" y={720} size={130} color={C.paper} start={14} />
      <Words text="you paid" y={860} size={130} color={C.paper} start={20} />
      <Words text="once?" y={1000} size={200} color={C.iris} start={28} />
    </AbsoluteFill>
  );
}

/* ── 4. Reveal: 3D title slam + exploded store ────────────────────────── */
function Extruded({ text, size, front, side, layers = 14 }) {
  return (
    <div style={{ position: "relative", transformStyle: "preserve-3d", height: size * 1.02 }}>
      {Array.from({ length: layers }, (_, i) => layers - 1 - i).map((i) => (
        <div key={i} style={{ position: i ? "absolute" : "relative", inset: 0, textAlign: "center", ...DISPLAY, fontSize: size, color: i ? side : front, transform: `translateZ(${-i * 5}px)`, opacity: i ? 1 - i / (layers * 1.6) : 1 }}>{text}</div>
      ))}
    </div>
  );
}

export function Reveal({ product }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = interpolate(spring({ frame: f, fps, config: { damping: 11, stiffness: 210 } }), [0, 1], [1.5, 1]);
  const blur = interpolate(f, [0, 5], [12, 0], clamp);
  const [sx, sy] = shake(f, 0, 24, 4.5);
  const up = spring({ frame: f - 40, fps, config: { damping: 16, stiffness: 140 } });
  const titleY = interpolate(up, [0, 1], [700, 300]);
  const titleScale = interpolate(up, [0, 1], [1, 0.62]);
  const tiltX = 16 + Math.sin(f / 18) * 4, tiltY = Math.sin(f / 23) * 10;

  // exploded store
  const ex = spring({ frame: f - 55, fps, config: { damping: 15, stiffness: 120 } }) * (1 - spring({ frame: f - 116, fps, config: { damping: 16, stiffness: 130 } }));
  const appear = interpolate(f, [44, 56], [0, 1], { ...clamp, easing: easeOut });
  const rotX = 56 * ex, rotZ = -36 * ex;
  const layers = [
    { label: null, el: <div style={{ width: 640, height: 820, borderRadius: 34, background: C.ink2, boxShadow: "0 0 0 2px rgba(205,190,255,.15)" }} /> },
    { label: "Your design", el: <div style={{ width: 640, height: 820, padding: 26 }}><div style={{ height: 280, borderRadius: 24, background: `linear-gradient(130deg, ${C.uv}, ${C.sky})`, boxShadow: "0 20px 40px rgba(0,0,0,.35)" }} /></div> },
    { label: "Your code", el: <div style={{ width: 640, height: 820, padding: "330px 26px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 200, borderRadius: 20, background: "#fff", boxShadow: "0 16px 30px rgba(0,0,0,.3)", display: "grid", placeItems: "center" }}><div style={{ width: 80, height: 80, borderRadius: i % 2 ? 20 : 99, background: i % 2 ? C.sky : C.uv }} /></div>)}</div> },
    { label: "Your data", el: <div style={{ width: 640, height: 820, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 30 }}><div style={{ padding: "22px 60px", borderRadius: 99, background: C.iris, color: "#fff", ...DISPLAY, fontSize: 36, boxShadow: "0 16px 40px rgba(143,114,255,.6)" }}>Add to cart</div></div> },
  ];
  const labelY = [0, 760, 980, 1340];
  const labelX = [0, 640, 70, 90];
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: titleY, transform: `scale(${slam * titleScale})`, filter: `blur(${blur}px)`, transformOrigin: "50% 0%", perspective: 1400 }}>
        <div style={{ transformStyle: "preserve-3d", transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` }}>
          <Extruded text={product[0]} size={200} front={C.paper} side={C.uv} />
          <Extruded text={product[1]} size={200} front={C.iris} side="#2A1678" />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: interpolate(up, [0, 1], [1180, 600]), textAlign: "center", ...DISPLAY, fontSize: 46, color: "rgba(243,241,250,.75)", opacity: interpolate(f, [16, 28], [0, 1], clamp) }}>Your own store. Built by Appify.</div>

      {f >= 44 && (
        <div style={{ position: "absolute", zIndex: 1, left: 220, top: 820, width: 640, height: 820, perspective: 2200, opacity: appear, transform: `translateY(${(1 - appear) * 120}px)` }}>
          <div style={{ position: "relative", width: 640, height: 820, transformStyle: "preserve-3d", transform: `rotateX(${rotX}deg) rotateZ(${rotZ}deg)` }}>
            {layers.map((L, i) => <div key={i} style={{ position: "absolute", inset: 0, transform: `translateZ(${i * 120 * ex}px)` }}>{L.el}</div>)}
          </div>
        </div>
      )}
      {layers.map((L, i) => {
        if (!L.label) return null;
        const p = interpolate(f, [70 + i * 9, 80 + i * 9], [0, 1], { ...clamp, easing: easeOut }) * (1 - interpolate(f, [112, 120], [0, 1], clamp));
        return (
          <div key={i} style={{ position: "absolute", zIndex: 20, left: labelX[i], top: labelY[i], opacity: p, transform: `translateX(${(1 - p) * (i % 2 ? 40 : -40)}px)`, padding: "16px 26px", borderRadius: 99, background: "rgba(243,241,250,.08)", border: "2px solid rgba(205,190,255,.3)", ...DISPLAY, fontSize: 40, color: C.paper }}>{L.label}</div>
        );
      })}
      <Shockwave f={f} cx={540} cy={900} start={0} max={1500} width={10} />
      <Streak f={f} start={0} y={900} color={C.iris} />
      <Burst f={f} cx={540} cy={900} start={0} count={120} speed={46} colors={["#fff", C.iris, C.sky]} seed="rev" />
      <Flash f={f} start={0} />
    </AbsoluteFill>
  );
}

/* ── 5. Four selling points ───────────────────────────────────────────── */
const FEATS = [["Better", "design."], ["Fully", "customizable."], ["Full", "control."], ["No monthly", "fees."]];
export function Features({ monthly }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = Math.min(3, Math.floor(f / 45)), l = f - k * 45;
  const s = spring({ frame: l, fps, config: { damping: 11, stiffness: 240 } });
  const enter = spring({ frame: f, fps, config: { damping: 16 } });
  // F1: theme swaps on each beat
  const themes = [[C.uv, C.sky], [C.coral, "#FFC15E"], ["#11A37F", "#9BE15D"]];
  const th = k === 0 ? themes[Math.min(2, Math.floor(l / 15))] : themes[0];
  // F2: sliders drive radius + columns
  const sl = k === 1 ? interpolate(l, [4, 20, 30, 44], [0, 1, 1, 0.55], clamp) : k > 1 ? 0.55 : 0;
  const radius = 6 + sl * 34, cols = k === 1 && l > 24 ? 3 : 2;
  // F3: code types in
  const code = ['store.owner = "you";', "store.theme = custom();", "store.fees  = 0;"];
  const chars = k === 2 ? Math.floor(interpolate(l, [2, 34], [0, code.join("").length], clamp)) : 0;
  // F4: price tag struck out and dropped
  const strike = k === 3 ? interpolate(l, [10, 16], [0, 1], { ...clamp, easing: easeOut }) : 0;
  const drop = k === 3 ? interpolate(l, [20, 34], [0, 1], { ...clamp, easing: easeIn }) : 0;
  const zero = k === 3 ? spring({ frame: l - 30, fps, config: { damping: 9, stiffness: 220 } }) : 0;
  const [sx, sy] = k === 3 ? shake(l, 30, 10, 3) : [0, 0];
  let typed = chars;
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", ...MONO, fontSize: 26, color: C.iris }}>0{k + 1} / 04</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", transform: `scale(${interpolate(s, [0, 1], [1.35, 1])})`, opacity: Math.min(1, s * 1.5) }}>
        <div style={{ ...DISPLAY, fontSize: 120, color: C.paper }}>{FEATS[k][0]}</div>
        <div style={{ ...DISPLAY, fontSize: FEATS[k][1].length > 10 ? 120 : 150, color: C.iris, marginTop: 6 }}>{FEATS[k][1]}</div>
      </div>
      <div style={{ position: "absolute", left: 160, top: 690, transform: `translateY(${(1 - enter) * 300}px) scale(${0.92 + enter * 0.08})`, transformOrigin: "50% 0%" }}>
        <Store w={760} h={900} accent={th[0]} accent2={th[1]} radius={radius} cols={cols} />
      </div>
      {k === 1 && (
        <div style={{ position: "absolute", left: 470, top: 1230, width: 520, padding: 28, borderRadius: 26, background: C.ink2, boxShadow: "0 30px 60px rgba(0,0,0,.5)", border: "2px solid rgba(205,190,255,.18)", opacity: interpolate(l, [0, 6], [0, 1], clamp) }}>
          {[["Corner radius", sl], ["Columns", cols === 3 ? 1 : 0.5], ["Font weight", 0.3 + sl * 0.5]].map(([n, v]) => (
            <div key={n} style={{ marginBottom: 20 }}>
              <div style={{ ...MONO, fontSize: 20, color: "rgba(243,241,250,.6)", marginBottom: 10 }}>{n.toUpperCase()}</div>
              <div style={{ position: "relative", height: 8, borderRadius: 8, background: "rgba(205,190,255,.18)" }}>
                <div style={{ position: "absolute", left: 0, width: `${v * 100}%`, height: 8, borderRadius: 8, background: C.iris }} />
                <div style={{ position: "absolute", left: `calc(${v * 100}% - 14px)`, top: -10, width: 28, height: 28, borderRadius: 99, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.4)" }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {k === 2 && (
        <div style={{ position: "absolute", left: 90, top: 1150, width: 900, padding: "30px 36px", borderRadius: 26, background: "#0D0B1A", boxShadow: "0 30px 60px rgba(0,0,0,.55)", border: "2px solid rgba(205,190,255,.18)", ...MONO, fontSize: 34, letterSpacing: 0, lineHeight: 1.7 }}>
          {code.map((line, i) => { const show = line.slice(0, Math.max(0, typed)); typed -= line.length; return <div key={i} style={{ color: i === 2 ? C.sky : C.paper, minHeight: 58 }}>{show}{show.length > 0 && show.length < line.length ? <span style={{ color: C.iris }}>▍</span> : null}</div>; })}
          <div style={{ position: "absolute", right: 26, top: -30, padding: "12px 22px", borderRadius: 99, background: "#3BE38B", color: C.ink, ...DISPLAY, fontSize: 28, transform: `scale(${spring({ frame: l - 34, fps, config: { damping: 9 } })})` }}>100% yours ✓</div>
        </div>
      )}
      {k === 3 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", transform: `translateY(${drop * 900}px) rotate(${drop * 28}deg)`, opacity: 1 - drop * 0.6 }}>
            <div style={{ position: "relative", padding: "26px 54px", borderRadius: 24, background: C.alert, ...DISPLAY, fontSize: 120, color: "#fff", boxShadow: "0 30px 60px rgba(0,0,0,.4)" }}>
              ${monthly}/mo
              <div style={{ position: "absolute", left: 20, top: "50%", height: 16, width: `calc(${strike * 100}% - 40px)`, background: C.ink, borderRadius: 8, transform: "rotate(-8deg)" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", transform: `scale(${zero})` }}>
            <div style={{ padding: "26px 54px", borderRadius: 24, background: C.paper, ...DISPLAY, fontSize: 120, color: C.uv, boxShadow: "0 30px 80px rgba(91,43,255,.6)" }}>$0/mo</div>
          </div>
          <Burst f={l} cx={540} cy={1140} start={30} count={40} speed={22} colors={["#fff", C.iris]} seed="zero" scale={0.8} />
        </>
      )}
    </AbsoluteFill>
  );
}

/* ── 6. Ten years later: the two lines ────────────────────────────────── */
export function Compare({ monthly, price }) {
  const f = useCurrentFrame();
  const yearly = monthly * 12, ten = yearly * 10, saved = ten - price;
  const x0 = 140, x1 = 940, base = 1360, top = 740, maxV = 4000;
  const X = (yr) => x0 + (yr / 10) * (x1 - x0), Y = (v) => base - (v / maxV) * (base - top);
  const draw = interpolate(f, [16, 58], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const area = interpolate(f, [58, 70], [0, 1], clamp);
  const count = interpolate(f, [62, 82], [0, saved], { ...clamp, easing: easeOut });
  const be = interpolate(f, [86, 96], [0, 1], { ...clamp, easing: easeOut });
  const breakEven = price / yearly; // years
  const yr = draw * 10;
  return (
    <AbsoluteFill>
      <Words text="10 years later" y={330} size={110} start={4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", ...MONO, fontSize: 30, color: C.mute }}>SUBSCRIPTION COST OVER TIME</div>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="rgba(91,43,255,.08)" /><line x1="0" y1="0" x2="0" y2="16" stroke="rgba(91,43,255,.35)" strokeWidth="5" /></pattern>
        </defs>
        {[0, 2, 4, 6, 8, 10].map((t) => <text key={t} x={X(t)} y={base + 44} textAnchor="middle" style={{ ...MONO, fontSize: 22 }} fill={C.mute}>{t === 0 ? "now" : `${t}y`}</text>)}
        {[1000, 2000, 3000, 4000].map((v) => <g key={v}><line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke="rgba(10,9,19,.1)" strokeDasharray="4 8" strokeWidth="2" /><text x={x0 - 16} y={Y(v) + 8} textAnchor="end" style={{ ...MONO, fontSize: 20 }} fill={C.mute}>{v / 1000}k</text></g>)}
        <line x1={x0} x2={x1} y1={base} y2={base} stroke={C.ink} strokeWidth="3" />
        <polygon points={`${X(0)},${Y(price)} ${X(10)},${Y(price)} ${X(10)},${Y(ten)} ${X(breakEven)},${Y(price)}`} fill="url(#hatch)" opacity={area} />
        <line x1={X(0)} y1={Y(0)} x2={X(yr)} y2={Y(yearly * yr)} stroke={C.alert} strokeWidth="9" strokeLinecap="round" />
        <line x1={X(0)} y1={Y(price)} x2={X(yr)} y2={Y(price)} stroke={C.uv} strokeWidth="9" strokeLinecap="round" />
        <circle cx={X(yr)} cy={Y(yearly * yr)} r={draw > 0 ? 14 : 0} fill={C.alert} />
        <circle cx={X(yr)} cy={Y(price)} r={draw > 0 ? 14 : 0} fill={C.uv} />
        {draw > 0.95 && <>
          <text x={X(10)} y={Y(ten) - 34} textAnchor="end" style={{ ...DISPLAY, fontSize: 38 }} fill={C.alert}>Shopify plan · {money(ten)}</text>
          <text x={X(10)} y={Y(price) + 60} textAnchor="end" style={{ ...DISPLAY, fontSize: 38 }} fill={C.uv}>Shopify Killer · {money(price)}</text>
        </>}
        <g opacity={be}>
          <circle cx={X(breakEven)} cy={Y(price)} r={22 * be} fill="none" stroke={C.ink} strokeWidth="4" />
          <line x1={X(breakEven)} y1={Y(price) + 26} x2={X(breakEven)} y2={base + 66} stroke={C.ink} strokeWidth="3" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: X(breakEven) - 40, top: base + 74, opacity: be, ...DISPLAY, fontSize: 34, color: C.ink, width: 520 }}>Pays for itself in 12 months</div>
      {f >= 60 && (
        <div style={{ position: "absolute", left: 520, width: 400, top: 1096, textAlign: "center", opacity: area, padding: "10px 0 14px", borderRadius: 20, background: "rgba(243,241,250,.88)" }}>
          <div style={{ ...MONO, fontSize: 28, color: C.mute }}>YOU SAVE</div>
          <div style={{ ...DISPLAY, fontSize: 110, color: C.uv, fontVariantNumeric: "tabular-nums" }}>{money(count)}</div>
        </div>
      )}
    </AbsoluteFill>
  );
}

/* ── 7. Offer: one receipt, stamped once ──────────────────────────────── */
export function Offer({ price, cta, url, monthly }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slot = 300, rows = [
    ["APPIFY · SHOPIFY KILLER", "", C.ink],
    ["Custom e-commerce site", "", C.mute],
    ["Lifetime license", `$${price.toFixed(2)}`, C.ink],
    ["Monthly fees", "$0.00", C.uv],
    ["TOTAL", `$${price.toFixed(2)}`, C.ink],
  ];
  const len = interpolate(f, [2, 30], [0, 470], { ...clamp, easing: Easing.out(Easing.quad) });
  const stamp = spring({ frame: f - 38, fps, config: { damping: 10, stiffness: 260 } });
  const [sx, sy] = shake(f, 38, 12, 3);
  const cta1 = spring({ frame: f - 52, fps, config: { damping: 13 } });
  const wm = interpolate(f, [64, 78], [0, 1], { ...clamp, easing: easeOut });
  const push = interpolate(f, [52, 120], [1, 1.03], clamp);
  const wmW = 260, wmH = wmW * (WORDMARK.bottom - WORDMARK.top + 40) / (WORDMARK.width + 40);
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${push})`, transformOrigin: "50% 40%" }}>
      <div style={{ position: "absolute", left: 210, top: slot + 40, width: 660, height: len, overflow: "hidden", background: "#FFFFFF", boxShadow: "0 40px 80px rgba(0,0,0,.5)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 470, padding: "34px 40px" }}>
          {rows.map(([a, b, col], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", ...MONO, fontSize: i === 0 ? 28 : 30, color: col, padding: "14px 0", borderTop: i === 4 ? "3px dashed rgba(10,9,19,.3)" : "none", fontWeight: i === 4 ? 600 : 400 }}>
              <span>{a}</span><span>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <Printer y={slot - 50} width={800} />
      {f >= 38 && (
        <div style={{ position: "absolute", left: 300, top: 560, transform: `rotate(-12deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`, opacity: Math.min(1, stamp * 2), padding: "14px 34px", border: `8px solid ${C.uv}`, borderRadius: 18, ...DISPLAY, fontSize: 84, color: C.uv, background: "rgba(255,255,255,.75)" }}>PAID ONCE</div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", opacity: cta1, transform: `translateY(${(1 - cta1) * 60}px)` }}>
        <div style={{ ...DISPLAY, fontSize: 70, color: C.paper }}>Yours for life.</div>
        <div style={{ ...DISPLAY, fontSize: 150, color: C.iris, marginTop: 30 }}>DM “{cta}”</div>
        <div style={{ ...DISPLAY, fontSize: 56, color: C.paper, marginTop: 18 }}>to build your store</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, display: "grid", justifyItems: "center", gap: 14, opacity: wm }}>
        <svg viewBox={WORDMARK.viewBox} width={wmW} height={wmH}><path d={WORDMARK.letters} fill={C.paper} /><path d={WORDMARK.spark} fill={C.iris} /></svg>
        <div style={{ ...MONO, fontSize: 30, color: C.paper, letterSpacing: "0.18em" }}>{url}</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1530, textAlign: "center", ...MONO, fontSize: 19, letterSpacing: "0.02em", color: "rgba(243,241,250,.45)", opacity: wm }}>
        Compares subscription fees only, based on a ${monthly}/month plan over 10 years.
      </div>
    </AbsoluteFill>
  );
}
