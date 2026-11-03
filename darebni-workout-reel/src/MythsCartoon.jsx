// "Creatine: Facts vs Myths", a cartoon story: Karim believes every gym myth, Sami checks the science.
// The user's script, voiced line by line (sound/build_myths.py -> src/myths.json: start frames, caption chunks, keyword
// marks and a per-frame mouth envelope for lip sync). A cartoon gym set (cartoon/Gym.jsx), the two characters
// (cartoon/Toon.jsx) with a spring camera that cuts between a two-shot and close-ups, freeze-frame character intros,
// a title slam per myth, comic insert cards with the cited facts (cartoon/Inserts.jsx), speech bubbles and an end card.
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain, shake } from "./fx.jsx";
import { B, D, UI } from "./Main.jsx";
import M from "./myths.json";
import { Toon, blendExpr, blinkAt } from "./cartoon/Toon.jsx";
import { Gym } from "./cartoon/Gym.jsx";
import { INSERTS } from "./cartoon/Inserts.jsx";

export const MC = { FPS: 30, DURATION: M.DURATION };
const L = M.lines, END = M.END, LAST = L[L.length - 1];
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const INK = "#07071A", PAPER = "#F2F0EA", RED = "#FF4D6A", GOLD = "#FFC94A";
const COL = { K: B.primary, S: "#14B8A6" };
const NAME = { K: "Karim", S: "Sami" };

// placement on the stage: box 700 x 1100 scaled 0.66, head centre in stage px
const SC = 0.66, POS = { K: [290, 880], S: [790, 880] };
const HEAD = { K: [290, 1078], S: [790, 1078] };
const SHOT = {
  two: { focus: [540, 1180], to: [540, 1270], s: 0.95 },
  K: { focus: HEAD.K, to: [430, 1210], s: 1.55 },
  S: { focus: HEAD.S, to: [650, 1210], s: 1.55 },
  freeze: { focus: HEAD.K, to: [470, 1170], s: 1.85 },
  holdK: { focus: HEAD.K, to: [540, 1120], s: 2.2, rot: -4 },
  holdS: { focus: HEAD.S, to: [540, 1120], s: 2.2, rot: 4 },
};
const lineAt = (f) => { let k = -1; for (let i = 0; i < L.length; i++) if (L[i].at - 4 <= f) k = i; return k; };
const holdAt = (f) => L.find((l) => l.hold && f >= l.hold.at && f < l.hold.at + l.hold.len)?.hold;
const sceneTitle = (f) => Object.values(M.scenes).find((s) => s.title != null && f >= s.title && f < s.start + 4);
const sceneOf = (f) => { let cur = null; for (const [k, s] of Object.entries(M.scenes)) if (f >= (s.title ?? s.start) - 2) cur = { key: k, ...s }; return cur; };

// expression timeline for each character: [frame, expr]
const EV = (() => {
  const ev = { K: [[0, "neutral"]], S: [[0, "listen"]] };
  for (const l of L) {
    const spk = l.spk === "B" ? ["K", "S"] : [l.spk];
    for (const s of spk) ev[s].push([l.at - 4, l.expr]);
    if (l.spk === "K") ev.S.push([l.at + 6, ["panic", "shock", "worried"].includes(l.expr) ? "smirk" : "listen"]);
    if (l.spk === "S") {
      ev.K.push([l.at + 6, l.expr === "laugh" ? "suspicious" : "listen"]);
      for (const v of Object.values(l.marks)) ev.K.push([l.at + v, "shock"], [l.at + v + 34, "listen"]);
    }
  }
  ev.K.push([END, "happy"]); ev.S.push([END, "excited"]);
  for (const k of ["K", "S"]) ev[k].sort((a, b) => a[0] - b[0]);
  return ev;
})();
function exprAt(who, f) {
  const ev = EV[who]; let i = 0;
  while (i + 1 < ev.length && ev[i + 1][0] <= f) i++;
  const prev = i > 0 ? ev[i - 1][1] : ev[i][1];
  return blendExpr(prev, ev[i][1], (f - ev[i][0]) / 7);
}
function mouthAt(who, f) {
  for (const l of L) {
    if (!(l.spk === who || l.spk === "B")) continue;
    const k = f - l.at;
    if (k >= 0 && k < l.mouth.length) return l.mouth[k];
  }
  return 0;
}
function cameraAt(f) {
  const h = holdAt(f);
  if (h) { const S = SHOT[h.who === "K" ? "holdK" : "holdS"], k = sp(f, h.at, 13, 260); return { ...blendShot(SHOT.two, S, k) }; }
  if (sceneTitle(f) || f >= END - 20) return blendShot(SHOT.two, SHOT.two, 1);
  const i = lineAt(f); if (i < 0) return SHOT.two;
  const cur = SHOT[L[i].cam], prev = i > 0 ? SHOT[L[i - 1].cam] : SHOT.two;
  // after a hold, start from the hold shot
  const from = i > 0 && L[i - 1].hold ? SHOT[L[i - 1].hold.who === "K" ? "holdK" : "holdS"] : prev;
  return blendShot(from, cur, sp(f, L[i].at - 4, 14, 200));
}
function blendShot(a, b, k) {
  const m = (x, y) => x + (y - x) * Math.min(1.1, k);
  return { focus: [m(a.focus[0], b.focus[0]), m(a.focus[1], b.focus[1])], to: [m(a.to[0], b.to[0]), m(a.to[1], b.to[1])], s: m(a.s, b.s), rot: m(a.rot || 0, b.rot || 0) };
}
const toScreen = (cam, [x, y]) => [cam.to[0] + (x - cam.focus[0]) * cam.s, cam.to[1] + (y - cam.focus[1]) * cam.s];

function Character({ who, f }) {
  const e = exprAt(who, f), m = mouthAt(who, f);
  const arms = e.arms.map(([a, b], i) => [a + Math.sin(f / 6 + i) * 7 * m, b + Math.sin(f / 5 + i * 2) * 12 * m]);
  const [x, y] = POS[who], bob = -m * 10 + Math.sin(f / 25 + (who === "K" ? 0 : 2)) * 4;
  return (
    <div style={{ position: "absolute", left: x - 350 * SC, top: y + bob, width: 700, height: 1100, transform: `scale(${SC})`, transformOrigin: "0 0" }}>
      <Toon who={who === "K" ? "karim" : "sami"} e={{ ...e, arms }} mouth={m} blink={blinkAt(f, who === "K" ? 0 : 47)} gaze={who === "K" ? 0.6 : -0.6} f={f} />
    </div>
  );
}

function Bubble({ f, cam }) {
  const i = lineAt(f); if (i < 0) return null;
  const l = L[i]; if (l.spk === "B" || f < l.at || f > l.at + l.dur + 4) return null;
  const k = f - l.at; let ch = l.chunks[0];
  for (const c of l.chunks) if (c.t <= k) ch = c;
  const head = toScreen(cam, HEAD[l.spk]), p = sp(f, l.at, 11, 300), cp = sp(f, l.at + ch.t, 14, 400);
  const left = l.spk === "K" ? 60 : 160, tail = Math.min(940, Math.max(120, head[0]));
  return (
    <div style={{ position: "absolute", left, width: 860, top: 800, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: `${tail - left}px 100%`, opacity: Math.min(1, p * 3) }}>
      <div style={{ position: "relative", background: PAPER, border: `6px solid ${INK}`, borderRadius: 34, boxShadow: `10px 10px 0 ${INK}`, padding: "30px 36px 26px" }}>
        <div style={{ position: "absolute", top: -30, left: 30, padding: "6px 18px", borderRadius: 12, background: COL[l.spk], border: `5px solid ${INK}`, ...D, fontSize: 34, color: PAPER, letterSpacing: "0.06em" }}>{NAME[l.spk]}</div>
        <div style={{ ...UI, fontSize: 52, lineHeight: 1.12, color: INK, minHeight: 58, opacity: 0.4 + 0.6 * cp, transform: `translateY(${(1 - cp) * 8}px)` }}>{ch.text}</div>
        <svg width="70" height="56" viewBox="0 0 70 56" style={{ position: "absolute", bottom: -50, left: tail - left - 35 }}>
          <path d="M6,0 L64,0 L30,52 Z" fill={PAPER} stroke={INK} strokeWidth="6" strokeLinejoin="round" /><rect x="3" y="-8" width="64" height="12" fill={PAPER} />
        </svg>
      </div>
    </div>
  );
}

function Insert({ f }) {
  if (sceneTitle(f) || holdAt(f)) return null;
  const i = lineAt(f); if (i < 0) return null;
  const name = L[i].insert; if (!name) return null;
  let s = i; while (s > 0 && L[s - 1].insert === name) s--;
  let e = i; while (e + 1 < L.length && L[e + 1].insert === name) e++;
  const start = L[s].at, stop = e + 1 < L.length ? L[e + 1].at - 4 : END;
  const marks = {}; for (let j = s; j <= e; j++) for (const [k, v] of Object.entries(L[j].marks)) marks[k] = L[j].at + v;
  const C = INSERTS[name]; if (!C) return null;
  const out = interpolate(f, [stop - 6, stop], [1, 0], clamp);
  return <div style={{ position: "absolute", left: 70, top: 300, width: 940, height: 500, opacity: out, transform: `translateY(${(1 - out) * -30}px)` }}><C t={f - start} f={f} m={marks} L={L[i]} /></div>;
}

function Header({ f }) {
  const sc = sceneOf(f), tag = sc?.tag ? `${sc.tag} · ${sc.name}` : "Story time";
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 226, display: "flex", alignItems: "center", gap: 14 }}>
      <Img src={staticFile("darebni-icon.png")} style={{ width: 58, height: 58, borderRadius: 15, border: `3px solid ${INK}` }} />
      <div style={{ ...D, fontSize: 38, color: PAPER, textShadow: `3px 3px 0 ${INK}` }}>Creatine: <span style={{ color: GOLD }}>facts</span> vs <span style={{ color: RED }}>myths</span></div>
      <div style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 12, background: PAPER, border: `4px solid ${INK}`, ...D, fontSize: 26, color: INK, letterSpacing: "0.04em" }}>{tag}</div>
    </div>
  );
}

function TitleSlam({ f }) {
  const s = sceneTitle(f); if (!s) return null;
  const t = f - s.title, p = sp(f, s.title + 2, 9, 320), o = interpolate(f, [s.title, s.title + 4, s.start - 2, s.start + 4], [0, 1, 1, 0], clamp);
  const myth = s.tag.startsWith("Myth"), col = myth ? RED : s.tag === "Surprise" ? "#2FCB86" : GOLD;
  const [sx, sy] = shake(f, s.title + 3, 20, 4);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(7,7,26,.55), rgba(7,7,26,.92))" }} />
      {/* speed lines */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return <line key={i} x1={540 + Math.cos(a) * (260 + t * 30)} y1={760 + Math.sin(a) * (260 + t * 30)} x2={540 + Math.cos(a) * 1400} y2={760 + Math.sin(a) * 1400} stroke={col} strokeWidth="6" />; })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ display: "inline-block", padding: "16px 40px", border: `10px solid ${col}`, borderRadius: 24, background: "rgba(7,7,26,.6)", ...D, fontSize: 150, color: col,
          transform: `rotate(-6deg) scale(${interpolate(p, [0, 1], [2.6, 1])})`, opacity: Math.min(1, p * 3) }}>{s.tag}</div>
        <div style={{ ...D, fontSize: 92, color: PAPER, marginTop: 40, textShadow: `6px 6px 0 ${INK}`, opacity: interpolate(t, [8, 14], [0, 1], clamp), transform: `translateY(${interpolate(t, [8, 16], [30, 0], clamp)}px)` }}>“{s.name}”</div>
      </div>
    </AbsoluteFill>
  );
}

function HoldCard({ f }) {
  const h = holdAt(f); if (!h) return null;
  const t = f - h.at, p = sp(f, h.at + 4, 12, 260), r = sp(f, h.at + 12, 12, 220);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1430, textAlign: h.who === "K" ? "left" : "right" }}>
      <div style={{ display: "inline-block", padding: "10px 30px", background: GOLD, border: `6px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, transform: `rotate(${h.who === "K" ? -3 : 3}deg) translateX(${(1 - p) * (h.who === "K" ? -700 : 700)}px)` }}>
        <span style={{ ...D, fontSize: 110, color: INK }}>{h.name}</span>
      </div>
      <div style={{ ...UI, fontSize: 44, color: PAPER, marginTop: 24, textShadow: `4px 4px 0 ${INK}`, opacity: Math.min(1, r * 2), transform: `translateY(${(1 - Math.min(1, r)) * 30}px)` }}>{h.role}</div>
    </div>
  );
}

function Finale({ f }) {
  const b = LAST, a = b.at;
  if (f < a - 2) return null;
  const p = sp(f, a, 10, 260), q = sp(f, a + 14, 10, 260), end = sp(f, END, 12, 200), cta = sp(f, END + 20, 9, 260);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 310, textAlign: "center" }}>
      <div style={{ ...D, fontSize: 150, color: PAPER, textShadow: `8px 8px 0 ${INK}`, transform: `scale(${interpolate(p, [0, 1], [1.8, 1])}) rotate(-3deg)`, opacity: Math.min(1, p * 3) }}>Train smart.</div>
      <div style={{ ...D, fontSize: 150, color: GOLD, textShadow: `8px 8px 0 ${INK}`, transform: `scale(${interpolate(q, [0, 1], [1.8, 1])}) rotate(-3deg)`, opacity: Math.min(1, q * 3) }}>Stay informed!</div>
      <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 34px 14px 16px", borderRadius: 26, background: PAPER, border: `6px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`,
        transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, f - END - 50) / 5)))})`, opacity: Math.min(1, cta * 2) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 88, height: 88, borderRadius: 20 }} />
        <div style={{ textAlign: "left" }}>
          <div style={{ ...D, fontSize: 30, color: B.primary, letterSpacing: "0.04em" }}>Your plan, sets & reps</div>
          <div style={{ ...D, fontSize: 68, color: INK }}>Darebni AI</div>
        </div>
      </div>
      <div style={{ ...UI, fontSize: 34, color: PAPER, marginTop: 22, textShadow: `3px 3px 0 ${INK}`, opacity: end }}>Download on the App Store</div>
    </div>
  );
}

export const MythsCartoon = ({ music = true }) => {
  const f0 = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const h = holdAt(f0), f = h ? h.at - 1 : f0;              // a hold freezes the picture (not the overlays)
  const cam = cameraAt(f0), held = !!h;
  const i = lineAt(f0), l = i >= 0 ? L[i] : null;
  // punch-in when Karim is shocked or panicking
  const punch = l && l.spk === "K" && ["shock", "panic"].includes(l.expr) ? 0.06 * Math.exp(-Math.max(0, f0 - l.at) / 8) : 0;
  const s = cam.s * (1 + punch);
  const stage = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0",
    transform: `translate(${cam.to[0]}px, ${cam.to[1]}px) rotate(${cam.rot}deg) scale(${s}) translate(${-cam.focus[0]}px, ${-cam.focus[1]}px)` };
  const bg = { ...stage, transform: `translate(${cam.to[0]}px, ${cam.to[1]}px) rotate(${cam.rot * 0.5}deg) scale(${1 + (s - 1) * 0.55}) translate(${-cam.focus[0]}px, ${-cam.focus[1]}px)` };
  const flash = h ? interpolate(f0, [h.at, h.at + 1, h.at + 8], [0, 0.9, 0], clamp) : 0;
  const holdT = h ? f0 - h.at : 0;
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: held ? "grayscale(.85) sepia(.35) contrast(1.15)" : "none" }}>
        <div style={bg}><Gym f={f} /></div>
        <div style={stage}><Character who="K" f={f} /><Character who="S" f={f} /></div>
        {held && <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 45%, rgba(7,7,26,.7))" }} />}
      </AbsoluteFill>
      {held && <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 2px, transparent 2px 5px)`, transform: `translateY(${(holdT * 3) % 5}px)` }} />}
      <Header f={f0} />
      <Insert f={f0} />
      <Bubble f={f0} cam={cam} />
      <HoldCard f={f0} />
      <TitleSlam f={f0} />
      <Finale f={f0} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Grain f={f0} opacity={0.04} />
      <Audio src={staticFile(music ? "myths.wav" : "myths-sfx.wav")} />
    </AbsoluteFill>
  );
};
