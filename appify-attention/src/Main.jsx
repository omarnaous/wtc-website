// "The Press". A hydraulic press creeps down on a jelly Appify spark while a HUD counts the frames to impact. It pops at
// exactly 7.0 s. "You just watched a jelly star get crushed for 7 seconds." / "Imagine that was your brand."
// Then every drop flies back, the spark re-forms and lands as the i-dot of the appify wordmark.
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { FPS, HOOK_OUT, CONTACT, IMPACT, LINE1, LINE2, END, LAND, PRESS, FLOOR, R, CX } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { WORDMARK, WSPARK, sparkPath } from "./brand.js";
import DROPS from "./drops.json";

export const C = { ink: "#0A0913", uv: "#5B2BFF", iris: "#8F72FF", sky: "#74C6FF", alert: "#F0384F", hazard: "#FFD23F", paper: "#F3F1FA" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 12, stiffness = 220) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
const pop = (p, k = 1.4) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})` });
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const ease = (a, b) => Easing.bezier(...a, ...b);

// press head bottom edge at frame f: piecewise, each segment eased (slow in/out, a hard push for the crush)
export function headY(f) {
  for (let k = 0; k < PRESS.length - 1; k++) {
    const [a, ya] = PRESS[k], [b, yb] = PRESS[k + 1];
    if (f <= b) return interpolate(f, [a, b], [ya, yb], { ...clamp, easing: b === IMPACT ? Easing.bezier(0.5, 0, 0.9, 0.6) : b === IMPACT + 4 ? Easing.in(Easing.quad) : inOut });
  }
  return PRESS[PRESS.length - 1][1];
}
const H0 = 2 * R;   // spark height at rest

function Stage({ W, H, children }) {
  const k = Math.min(W / 1080, H / 1920);
  return <div style={{ position: "absolute", left: (W - 1080 * k) / 2, top: (H - 1920 * k) / 2, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>;
}

// glossy jelly star; sx/sy squash it from its bottom centre, k = how "inflated" the star is
export function Jelly({ cx, bottom, r, sx = 1, sy = 1, k = 0.22, id = "j", glow = 1 }) {
  const w = 2 * r * sx, h = 2 * r * sy;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${2 * r} ${2 * r}`} preserveAspectRatio="none" style={{ position: "absolute", left: cx - w / 2, top: bottom - h, overflow: "visible" }}>
      <defs>
        <radialGradient id={id + "b"} cx="38%" cy="30%" r="80%"><stop offset="0" stopColor="#D9CCFF" /><stop offset=".28" stopColor={C.iris} /><stop offset=".62" stopColor={C.uv} /><stop offset="1" stopColor="#24107A" /></radialGradient>
        <radialGradient id={id + "g"} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={C.uv} stopOpacity={0.55 * glow} /><stop offset="1" stopColor={C.uv} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={r} cy={r} rx={r * 1.9} ry={r * 1.9} fill={`url(#${id}g)`} />
      <path d={sparkPath(r, r, r * 0.98, k)} fill={`url(#${id}b)`} stroke="rgba(255,255,255,.28)" strokeWidth={r * 0.02} />
      <path d={sparkPath(r * 1.04, r * 1.06, r * 0.6, k)} fill="#B9A6FF" opacity=".18" />
      <ellipse cx={r * 0.82} cy={r * 0.58} rx={r * 0.13} ry={r * 0.05} fill="#fff" opacity=".85" transform={`rotate(-38 ${r * 0.82} ${r * 0.58})`} />
      <circle cx={r * 0.9} cy={r * 0.72} r={r * 0.025} fill="#fff" opacity=".7" />
    </svg>
  );
}

function Drop({ x, y, r, flat = 0, id }) {
  const rx = r * (1 + flat * 0.7), ry = r * (1 - flat * 0.55);
  return (
    <svg width={rx * 2} height={ry * 2} style={{ position: "absolute", left: x - rx, top: y - ry * (flat ? 2 : 1), overflow: "visible" }}>
      <defs><radialGradient id={id} cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#D9CCFF" /><stop offset=".4" stopColor={C.iris} /><stop offset="1" stopColor="#2E1690" /></radialGradient></defs>
      <ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={`url(#${id})`} />
      <ellipse cx={rx * 0.7} cy={ry * 0.55} rx={rx * 0.22} ry={ry * 0.14} fill="#fff" opacity=".8" />
    </svg>
  );
}
// where drop d is at frame f (after the pop): flight, then stuck to the plate (or fallen off screen)
function dropAt(d, f) {
  const t = f - IMPACT, g = DROPS.g;
  if (d.land !== null && f >= d.land) return { x: d.xl, y: FLOOR, flat: Math.min(1, (f - d.land) / 4) };
  return { x: d.x0 + d.vx * t, y: Math.min(2300, d.y0 + d.vy * t + 0.5 * g * t * t), flat: 0 };
}

const steel = "linear-gradient(90deg, #1B1A22 0%, #6E6D7C 18%, #2C2B35 38%, #B9B8C8 55%, #3A3944 72%, #15141B 100%)";
function Press({ y }) {
  return (
    <>
      {/* frame: two columns and the crown */}
      {[150, 860].map((x) => <div key={x} style={{ position: "absolute", left: x, top: 0, width: 70, height: FLOOR, background: steel, opacity: 0.55 }} />)}
      <div style={{ position: "absolute", left: CX - 60, top: -20, width: 120, height: y - 100, background: steel }} />
      <div style={{ position: "absolute", left: CX - 250, top: y - 120, width: 500, height: 120, borderRadius: "10px 10px 6px 6px", background: "linear-gradient(180deg, #4A4956, #23222B 55%, #121118)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.18), 0 30px 60px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, height: 26, background: `repeating-linear-gradient(-45deg, ${C.hazard} 0 22px, #141218 22px 44px)`, opacity: 0.9 }} />
        {[40, 460].map((x) => <i key={x} style={{ position: "absolute", left: x - 9, top: 22, width: 18, height: 18, borderRadius: 99, background: "radial-gradient(circle at 35% 35%, #CFCFDA, #3A3944)" }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: "linear-gradient(90deg, #555463, #D6D5E2, #555463)" }} />
      </div>
    </>
  );
}

// the whole press shot at frame f (also used for the thumbnail)
export function PressShot({ f, hud = true }) {
  const y = headY(f);
  const breathe = 1 + 0.018 * Math.sin(f / 8);
  const brace = 1 - 0.05 * interpolate(f, [140, 156, 176, 186], [0, 1, 1, 0], clamp);     // flinches as the press creeps closer
  const rest = H0 * breathe * brace;
  const h = f < IMPACT ? Math.min(rest, FLOOR - y) : 0;
  const sy = h / H0, sx = Math.pow(Math.max(0.2, sy), -0.62), k = interpolate(sy, [0.3, 1], [0.56, 0.22], clamp);
  const strain = f >= CONTACT && f < IMPACT ? (f - CONTACT) / (IMPACT - CONTACT) : 0;
  const [tx, ty] = f >= CONTACT && f < IMPACT ? [Math.sin(f * 2.7) * 3 * strain, Math.cos(f * 3.1) * 2 * strain] : [0, 0];
  const left = Math.max(0, IMPACT - f), danger = left <= 30;
  const force = f < CONTACT ? 0 : f < IMPACT ? 40 * Math.pow(strain, 1.6) : 40;
  const tc = (n) => String(n).padStart(2, "0");
  const sec = Math.floor(f / FPS), fr = f % FPS;
  return (
    <>
      <AbsoluteFill style={{ background: C.ink }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.06) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.06) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px", backgroundPosition: "540px 0" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 30% at 50% 58%, rgba(91,43,255,${0.38 + 0.12 * strain}), transparent 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 40% 18% at 50% 0%, rgba(220,215,255,.14), transparent 70%)" }} />
      {/* plate */}
      <div style={{ position: "absolute", left: 120, top: FLOOR, width: 840, height: 64, background: "linear-gradient(180deg, #6E6D7C, #2A2933 30%, #16151C)", borderRadius: 6, boxShadow: "0 40px 80px rgba(0,0,0,.6)" }} />
      <div style={{ position: "absolute", left: 120, top: FLOOR, width: 840, height: 3, background: "rgba(255,255,255,.35)" }} />
      <div style={{ position: "absolute", left: CX - R * sx * 1.1, top: FLOOR - 16, width: R * sx * 2.2, height: 32, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,.6), transparent 70%)", opacity: f < IMPACT ? 1 : 0 }} />
      {f < IMPACT && <div style={{ position: "absolute", left: tx, top: ty, width: 1080, height: 1920 }}><Jelly cx={CX} bottom={FLOOR} r={R} sx={sx} sy={sy} k={k} glow={1 + strain} /></div>}
      {f >= IMPACT && DROPS.drops.map((d, n) => { const p = dropAt(d, f); return p.y < 2200 && <Drop key={n} id={`d${n}`} x={p.x} y={p.y} r={d.r} flat={p.flat} />; })}
      <Press y={y} />
      {hud && (
        <>
          {/* camera HUD */}
          {[[60, 200, "0 0"], [960, 200, "90"], [60, 1640, "-90"], [960, 1640, "180"]].map(([x, yy, rot], n) => (
            <svg key={n} width="60" height="60" style={{ position: "absolute", left: x, top: yy, transform: `rotate(${rot === "0 0" ? 0 : rot}deg)` }}><path d="M4 56 V4 H56" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="4" /></svg>
          ))}
          <div style={{ position: "absolute", left: 76, top: 278, display: "flex", alignItems: "center", gap: 12, ...M, fontSize: 26, color: "#fff" }}>
            <i style={{ width: 16, height: 16, borderRadius: 99, background: C.alert, opacity: Math.floor(f / 12) % 2 ? 1 : 0.3 }} />REC 00:00:{tc(sec)}:{tc(fr)}
          </div>
          <div style={{ position: "absolute", right: 76, top: 278, ...M, fontSize: 24, color: "rgba(255,255,255,.7)" }}>40T · 120FPS</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR + 96, textAlign: "center" }}>
            <div style={{ ...M, fontSize: 28, color: "rgba(255,255,255,.75)" }}>{f < IMPACT ? "Frames to impact" : "Impact"}</div>
            <div style={{ fontFamily: "Mono", fontSize: 150, color: danger ? C.alert : "#fff", marginTop: 8, transform: `scale(${danger && f < IMPACT ? 1 + 0.04 * Math.abs(Math.sin(f / 2)) : 1})`, textShadow: danger ? "0 0 40px rgba(240,56,79,.5)" : "none" }}>{String(left).padStart(3, "0")}</div>
          </div>
          <div style={{ position: "absolute", left: 76, top: 1580, ...M, fontSize: 24, color: "rgba(255,255,255,.7)", opacity: f > HOOK_OUT ? 1 : 0 }}>Force {force.toFixed(1)} t</div>
          <div style={{ position: "absolute", right: 76, top: 1580, ...M, fontSize: 24, color: "rgba(255,255,255,.7)", opacity: f > HOOK_OUT ? 1 : 0 }}>Subject: jelly ✦</div>
        </>
      )}
    </>
  );
}

function Scene({ f, W, H }) {
  const [sx, sy] = shake(f, IMPACT, 34, 5);
  const dim = interpolate(f, [LINE1 - 6, LINE1 + 4, END - 4, END + 8], [0, 1, 1, 0], clamp);
  const fade = interpolate(f, [END, END + 20], [1, 0], clamp);    // press, plate and HUD leave for the end card
  const hook = interpolate(f, [HOOK_OUT, HOOK_OUT + 10], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      {fade > 0 && f < END + 20 && (
        <AbsoluteFill style={{ opacity: f >= END ? fade : 1, filter: dim ? `blur(${dim * 16}px) brightness(${1 - dim * 0.65})` : undefined }}>
          <Stage W={W} H={H}>
            <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
              <PressShot f={Math.min(f, END)} />
            </div>
          </Stage>
        </AbsoluteFill>
      )}
      {f >= IMPACT && f < IMPACT + 5 && <Flash f={f} start={IMPACT} peak={0.55} color="#C9B8FF" />}
      <Stage W={W} H={H}>
        {hook > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", opacity: hook, ...UI, fontSize: 56, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,.6)" }}>Try not to look away.</div>}
        {f >= IMPACT && f < IMPACT + 30 && (() => { const p = interpolate(f - IMPACT, [0, 26], [0, 1], { ...clamp, easing: easeOut }); return <div style={{ position: "absolute", left: CX - 700 * p, top: FLOOR - 70 * p, width: 1400 * p, height: 140 * p, borderRadius: "50%", border: `${8 * (1 - p) + 1}px solid rgba(201,184,255,${1 - p})` }} />; })()}
        {f >= LINE1 && f < LINE2 && <Line1 t={f - LINE1} out={interpolate(f, [LINE2 - 6, LINE2], [0, 1], clamp)} />}
        {f >= LINE2 && f < END + 6 && <Line2 t={f - LINE2} out={interpolate(f, [END - 4, END + 4], [0, 1], clamp)} />}
        {f >= END && <EndCard f={f} />}
      </Stage>
    </AbsoluteFill>
  );
}

function Line1({ t, out }) {
  const o = { opacity: 1 - out, transform: `translateY(${-out * 40}px)` };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...o }}>
      <div style={{ ...UI, fontSize: 60, color: "rgba(255,255,255,.85)", ...pop(sp(t, 0, 11, 300), 1.2) }}>You just watched a</div>
      <div style={{ ...D, fontSize: 92, color: "#fff", marginTop: 16, whiteSpace: "nowrap", ...pop(sp(t, 8, 11, 300), 1.3) }}>jelly star get crushed</div>
      <div style={{ ...D, fontSize: 138, color: "#fff", marginTop: 20, whiteSpace: "nowrap", ...pop(sp(t, 18, 8, 300), 1.7) }}>for <span style={{ color: C.iris, textShadow: "0 0 60px rgba(143,114,255,.6)" }}>7</span> seconds.</div>
    </div>
  );
}
function Line2({ t, out }) {
  const o = { opacity: 1 - out, transform: `scale(${1 - out * 0.1})` };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", ...o }}>
      <div style={{ ...D, fontSize: 110, color: "#fff", ...pop(sp(t, 0, 10, 300), 1.3) }}>Imagine that</div>
      <div style={{ ...D, fontSize: 110, color: C.sky, marginTop: 14, ...pop(sp(t, 8, 9, 300), 1.6) }}>was your brand.</div>
    </div>
  );
}

// ── end card: the drops come home, the spark re-forms and lands as the i-dot ──────────────────────────
const WM_W = 760, WM_S = WM_W / 3224, WM_L = CX - WM_W / 2, WM_T = 640;
const DOT = { x: WM_L + (WSPARK.x + 20) * WM_S, y: WM_T + (WSPARK.y + 917) * WM_S, r: WSPARK.r * WM_S };
const HOME = { x: CX, y: 1180, r: 150 };
function EndCard({ f }) {
  const t = f - END;
  const arrived = DROPS.drops.filter((d, n) => t >= 30 + (n % 9)).length / DROPS.drops.length;
  const form = sp(t, 30, 9, 240);
  const fly = interpolate(f, [LAND - 14, LAND], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.6, 1) });
  const land = f >= LAND ? sp(f, LAND, 6, 380) : 0;
  const sq = f >= LAND ? 1 - 0.35 * Math.exp(-(f - LAND) / 3) * Math.cos((f - LAND) / 1.6) : 1;
  const r = interpolate(fly, [0, 1], [HOME.r * Math.min(1, form), DOT.r]);
  const cx = interpolate(fly, [0, 1], [HOME.x, DOT.x]), cy = interpolate(fly, [0, 1], [HOME.y, DOT.y]) - Math.sin(fly * Math.PI) * 220;
  const letters = sp(f, LAND - 10, 12, 200);
  const wob = f < LAND - 14 && t >= 30 ? 1 + 0.06 * Math.sin((t - 30) / 2.2) * Math.exp(-(t - 30) / 12) : 1;
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 30% at 50% ${f >= LAND ? 40 : 60}%, rgba(91,43,255,${0.3 + 0.15 * land}), transparent 70%)` }} />
      {/* drops flying home */}
      {t < 42 && DROPS.drops.map((d, n) => {
        const st = 4 + (n % 9), en = 30 + (n % 9);
        const p = interpolate(t, [st, en], [0, 1], { ...clamp, easing: inOut });
        if (p >= 1) return null;
        const a = dropAt(d, END);
        const x = interpolate(p, [0, 1], [a.x, HOME.x]), y = interpolate(p, [0, 1], [Math.min(a.y, 2000), HOME.y]) - Math.sin(p * Math.PI) * (120 + (n % 5) * 40);
        return <Drop key={n} id={`h${n}`} x={x} y={y} r={d.r * (1 - p * 0.6)} flat={a.flat * (1 - p)} />;
      })}
      {t >= 30 && <Jelly id="home" cx={cx} bottom={cy + r * sq} r={r} sx={(1 / sq) * (f < LAND ? wob : 1)} sy={sq * (f < LAND ? 1 / wob : 1)} k={0.22} glow={1.2} />}
      <svg viewBox={WORDMARK.viewBox} width={WM_W} height={WM_W * 1167 / 3224} style={{ position: "absolute", left: WM_L, top: WM_T, opacity: Math.min(1, letters * 1.5), transform: `translateY(${(1 - Math.min(1, letters)) * 60}px)` }}><path d={WORDMARK.letters} fill="#fff" /></svg>
      {f >= LAND && f < LAND + 24 && (() => { const p = interpolate(f - LAND, [0, 22], [0, 1], { ...clamp, easing: easeOut }); return <div style={{ position: "absolute", left: DOT.x - 160 * p, top: DOT.y - 160 * p, width: 320 * p, height: 320 * p, borderRadius: 999, border: `${6 * (1 - p) + 1}px solid rgba(143,114,255,${1 - p})` }} />; })()}
      <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center", ...pop(sp(f, LAND + 8, 11, 260), 1.2) }}>
        <div style={{ ...D, fontSize: 76, color: "#fff" }}>Motion that</div>
        <div style={{ ...D, fontSize: 76, color: C.sky, marginTop: 8 }}>stops the scroll.</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, display: "grid", justifyItems: "center", ...pop(sp(f, LAND + 18, 9, 260), 1.5) }}>
        <div style={{ padding: "18px 46px", borderRadius: 26, background: C.uv, textAlign: "center", boxShadow: "0 20px 60px rgba(91,43,255,.45)", transform: `scale(${1 + 0.025 * Math.sin(Math.max(0, f - LAND - 30) / 4)})` }}>
          <div style={{ ...M, fontSize: 24, color: "rgba(255,255,255,.75)" }}>DM</div>
          <div style={{ ...D, fontSize: 70, color: "#fff", marginTop: 6 }}>“MOTION”</div>
        </div>
        <div style={{ ...M, fontSize: 26, color: "rgba(255,255,255,.7)", marginTop: 26 }}>@appifylb · motion graphics & animated websites</div>
      </div>
    </>
  );
}

export const Main = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Scene f={f} W={W} H={H} />
      <Audio src={staticFile("sound.wav")} />
      <Vignette strength={0.2} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};
