// 60 s cut of "Creatine: Facts vs Myths" in the Appify mascot format (timing from src/myths60.json, sound/build_myths60*.py); adds the bonus brain study, a pros-vs-cons tick list and a follow + download sign-off: the motion-graphics scene owns the top of the frame
// (kinetic type, comic fact cards from cartoon/Inserts.jsx, bursts, title slams) and the two mascots stand in the
// bottom band with karaoke captions, like Appify's Dev reels. Karim and Sami are sporty versions of Dev's rig
// (cartoon/SportDev.jsx). Same voices, timing and sound as the cartoon cut (src/myths.json, sound/build_myths*.py).
import { AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain, shake } from "./fx.jsx";
import { B, D, UI } from "./Main.jsx";
import M from "./myths60.json";
import { SportDev } from "./cartoon/SportDev.jsx";
import { INSERTS } from "./cartoon/Inserts.jsx";

export const MM60 = { FPS: 30, DURATION: M.DURATION };
const L = M.lines, END = M.END, LAST = L.find((l) => l.spk === "B");   // the finale starts on "Train smart"
const FOLLOW = L.find((l) => l.marks.follow != null), DL = L.find((l) => l.marks.download != null);
const sp = (f, at, d = 12, s = 220) => spring({ frame: f - at, fps: 30, config: { damping: d, stiffness: s } });
const env = (f, a, b, r = 6) => { r = Math.min(r, (b - a) / 2 - 0.01); return interpolate(f, [a, a + r, b - r, b], [0, 1, 1, 0], clamp); };
const INK = "#07071A", PAPER = "#F2F0EA", RED = "#FF4D6A", GOLD = "#FFC94A", GRN = "#2FCB86";
const COL = { K: B.primary, S: "#14B8A6" }, NAME = { K: "Karim", S: "Sam" };
// the mascots: Dev rig at width 360 (711 px tall); head centre in screen px
const W = 360, POS = { K: [10, 1075], S: [710, 1075] }, HEAD = { K: [190, 1307], S: [890, 1307] };
const KINETIC = { 8: ["No way!", "How much?"] };
// face presets for the rig
const FACE = {
  neutral: { brow: 6, lid: 0.1, smile: 0.7, shock: 0, happy: 0, sweat: 0, tilt: 0 },
  listen: { brow: 10, lid: 0.1, smile: 0.4, shock: 0, happy: 0, sweat: 0, tilt: -2 },
  panic: { brow: 26, lid: 0, smile: 0, shock: 0.85, happy: 0, sweat: 1, tilt: 0 },
  shock: { brow: 26, lid: 0, smile: 0, shock: 1, happy: 0, sweat: 0, tilt: -3 },
  confused: { brow: 24, lid: 0.15, smile: 0.15, shock: 0, happy: 0, sweat: 0, tilt: 7 },
  suspicious: { brow: 0, lid: 0.55, smile: 0.1, shock: 0, happy: 0, sweat: 0, tilt: -4 },
  worried: { brow: 22, lid: 0.05, smile: 0, shock: 0.2, happy: 0, sweat: 1, tilt: 3 },
  happy: { brow: 14, lid: 0, smile: 1, shock: 0, happy: 1, sweat: 0, tilt: 3 },
  smug: { brow: 16, lid: 0.45, smile: 0.9, shock: 0, happy: 0, sweat: 0, tilt: 5 },
  smirk: { brow: 14, lid: 0.35, smile: 0.7, shock: 0, happy: 0, sweat: 0, tilt: -4 },
  laugh: { brow: 12, lid: 0, smile: 1, shock: 0, happy: 1, sweat: 0, tilt: -6 },
  explain: { brow: 12, lid: 0.08, smile: 0.75, shock: 0, happy: 0, sweat: 0, tilt: -2 },
  calm: { brow: 6, lid: 0.25, smile: 0.8, shock: 0, happy: 0, sweat: 0, tilt: -2 },
  excited: { brow: 22, lid: 0, smile: 1, shock: 0, happy: 0, sweat: 0, tilt: 3 },
};
const lineAt = (f) => { let k = -1; for (let i = 0; i < L.length; i++) if (L[i].at - 4 <= f) k = i; return k; };
const holdAt = (f) => L.find((l) => l.hold && f >= l.hold.at && f < l.hold.at + l.hold.len)?.hold;
const sceneTitle = (f) => Object.values(M.scenes).find((s) => s.title != null && f >= s.title && f < s.start + 4);
const TAGS = { truth: ["The truth", "It works"], verdict: ["The verdict", "Pros vs cons"] };
const sceneOf = (f) => { let cur = null; for (const [k, s] of Object.entries(M.scenes)) if (f >= (s.title ?? s.start) - 2) cur = s.tag ? s : TAGS[k] ? { ...s, tag: TAGS[k][0], name: TAGS[k][1] } : s; return cur; };

// timelines: expressions, actions and emotes per character
const TL = (() => {
  const ev = { K: [[0, "neutral"]], S: [[0, "listen"]] }, act = { K: [], S: [] }, emo = { K: [], S: [] };
  for (const l of L) {
    const end = l.at + l.dur;
    for (const s of l.spk === "B" ? ["K", "S"] : [l.spk]) ev[s].push([l.at - 4, l.expr]);
    if (l.spk === "K") {
      ev.S.push([l.at + 6, ["panic", "shock", "worried"].includes(l.expr) ? "smirk" : "listen"]);
      if (["panic", "shock"].includes(l.expr)) { act.K.push(["jump", l.at - 2, l.at + 12]); emo.K.push(["!", l.at, l.at + 40]); }
      if (l.expr === "confused") emo.K.push(["?", l.at, end]);
      if (l.expr === "worried") emo.K.push(["sweat", l.at, end]);
      if (l.expr === "happy" || l.expr === "smug") emo.K.push(["spark", l.at + 4, l.at + 44]);
      if (l.marks.flex != null) act.K.push(["wave", l.at + l.marks.flex - 4, end + 10]);
    }
    if (l.spk === "S") {
      ev.K.push([l.at + 6, l.expr === "laugh" ? "suspicious" : "listen"]);
      for (const v of Object.values(l.marks)) { ev.K.push([l.at + v, "shock"], [l.at + v + 30, "listen"]); emo.K.push(["!", l.at + v, l.at + v + 26]); }
      if (l.insert && l.cam === "two") act.S.push(["point", l.at + 4, end]);
      if (l.expr === "laugh") emo.S.push(["HA!", l.at + 6, end + 6]);
      if (l.text === "Exactly.") act.S.push(["thumbs", l.at - 2, end + 24]);
    }
  }
  ev.K.push([END, "happy"]); ev.S.push([END, "excited"]);
  act.K.push(["thumbs", LAST.at, M.DURATION]); act.S.push(["wave", LAST.at, DL.at - 2]); act.S.push(["point", DL.at - 2, M.DURATION]);
  act.K.push(["jump", LAST.at - 2, LAST.at + 12]); act.S.push(["jump", LAST.at + 2, LAST.at + 16]);
  for (const k of ["K", "S"]) ev[k].sort((a, b) => a[0] - b[0]);
  return { ev, act, emo };
})();
function faceAt(who, f) {
  const ev = TL.ev[who]; let i = 0;
  while (i + 1 < ev.length && ev[i + 1][0] <= f) i++;
  const a = FACE[i > 0 ? ev[i - 1][1] : ev[i][1]] || FACE.neutral, b = FACE[ev[i][1]] || FACE.neutral, k = Math.min(1, (f - ev[i][0]) / 7);
  return Object.fromEntries(Object.keys(b).map((x) => [x, a[x] + (b[x] - a[x]) * k]));
}
const actAt = (who, f, type) => TL.act[who].filter((x) => x[0] === type).reduce((v, [, a, b]) => Math.max(v, env(f, a, b)), 0);
function mouthAt(who, f) {
  for (const l of L) { if (!(l.spk === who || l.spk === "B")) continue; const k = f - l.at; if (k >= 0 && k < l.mouth.length) return l.mouth[k]; }
  return 0;
}

function Mascot({ who, f }) {
  const face = faceAt(who, f), m = mouthAt(who, f), open = m;
  const point = actAt(who, f, "point"), wave = actAt(who, f, "wave"), thumbs = actAt(who, f, "thumbs") * (1 - point);
  let jumpY = 0, squash = 1;
  for (const [, a, b] of TL.act[who].filter((x) => x[0] === "jump")) {
    if (f >= a && f < b) jumpY = -Math.sin(((f - a) / (b - a)) * Math.PI) * 70;
    if (f >= b && f < b + 8) squash = 1 - 0.07 * Math.sin(((f - b) / 8) * Math.PI);
  }
  const blink = ((f + (who === "K" ? 0 : 41)) % 97) < 3 ? [0.6, 1, 0.6][(f + (who === "K" ? 0 : 41)) % 97] : 0;
  const talking = m > 0.08, bob = talking ? -m * 3 - Math.abs(Math.sin(f / 4)) * 2 : Math.sin(f / 22 + (who === "K" ? 0 : 2)) * 1.2;
  const [x, y] = POS[who];
  return (
    <div style={{ position: "absolute", left: x, top: y + jumpY, transform: `scaleY(${squash})`, transformOrigin: "50% 100%" }}>
      <SportDev who={who === "K" ? "karim" : "sami"} flip={who === "S"} width={W} point={point} wave={wave} waveAng={who === "K" ? 0 : Math.sin(f / 2.2) * 22} thumbs={thumbs}
        tilt={face.tilt + (talking ? Math.sin(f / 9) * 0.8 * m : 0)} bob={bob} open={open} brow={face.brow} smile={face.smile} shock={face.shock}
        happy={face.happy} sweat={face.sweat} lid={Math.max(face.lid * (1 - face.happy), blink * (1 - face.happy))} look={8} />
    </div>
  );
}

const FIRST = { K: L.find((l) => l.spk === "K"), S: L.find((l) => l.spk === "S") };
const ROLE = { K: "Believes every gym myth", S: "Actually reads the studies" };
function NameTags({ f }) {
  return ["K", "S"].map((who) => {
    const l = FIRST[who], a = l.at, b = a + Math.max(70, l.dur + 10);
    if (f < a - 2 || f > b + 6) return null;
    const p = sp(f, a, 11, 260), o = interpolate(f, [b - 6, b + 6], [1, 0], clamp), K = who === "K";
    return (
      <div key={who} style={{ position: "absolute", top: 1085, [K ? "left" : "right"]: K ? 230 : 230, textAlign: K ? "left" : "right", opacity: o, transform: `scale(${0.5 + 0.5 * Math.min(1, p)}) rotate(${K ? -4 : 4}deg)`, transformOrigin: K ? "0% 50%" : "100% 50%" }}>
        <div style={{ display: "inline-block", padding: "6px 18px", background: GOLD, border: `5px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}`, ...D, fontSize: 56, color: INK }}>{NAME[who]}</div>
        <div style={{ ...D, fontSize: 30, color: PAPER, marginTop: 8, textShadow: `3px 3px 0 ${INK}`, maxWidth: 300 }}>{ROLE[who]}</div>
      </div>
    );
  });
}
function Emotes({ f }) {
  return ["K", "S"].flatMap((who) => TL.emo[who].filter(([, a, b]) => f >= a && f < b).map(([k, a, b], i) => {
    const p = env(f, a, b, 5), s = Math.min(1, sp(f, a, 9, 300) * 1.1), [hx] = HEAD[who], bob = Math.sin(f / 4) * 5;
    const x = who === "K" ? hx + 90 : hx - 180;
    if (k === "sweat") return null;
    const bg = k === "!" ? RED : k === "?" ? "#4AA8FF" : k === "HA!" ? GOLD : B.lo;
    return (
      <div key={who + i + k} style={{ position: "absolute", left: x, top: 1080 + bob, width: 90, height: 90, borderRadius: 45, background: bg, border: `5px solid ${INK}`, boxShadow: `0 6px 0 ${INK}`,
        display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: k === "HA!" ? 38 : 60, color: k === "HA!" ? INK : "#fff", transform: `scale(${s})`, opacity: p }}>
        {k === "spark" ? <svg width="50" height="50" viewBox="-25 -25 50 50"><path d="M0,-22 C5,-5 5,-5 22,0 C5,5 5,5 0,22 C-5,5 -5,5 -22,0 C-5,-5 -5,-5 0,-22 Z" fill="#fff" /></svg> : k}
      </div>
    );
  }));
}

// karaoke captions: the current chunk, words lighting up as they're spoken, in a box pointing at the speaker
function Captions({ f }) {
  const i = lineAt(f); if (i < 0 || holdAt(f)) return null;
  const l = L[i]; if (l.spk === "B" || f < l.at - 2 || f > l.at + l.dur + 6) return null;
  const k = f - l.at; let ci = 0;
  l.chunks.forEach((c, j) => { if (c.t <= k) ci = j; });
  const ch = l.chunks[ci], next = l.chunks[ci + 1]?.t ?? l.dur, words = ch.text.split(" ");
  const st = sp(f, l.at + ch.t, 9, 260), left = l.spk === "K" ? 50 : 230, tail = HEAD[l.spk][0];
  return (
    <div style={{ position: "absolute", left, width: 800, top: 955, display: "flex", justifyContent: l.spk === "K" ? "flex-start" : "flex-end" }}>
      <div style={{ position: "relative", padding: "18px 26px", background: "#fff", border: `5px solid ${INK}`, borderRadius: 14, boxShadow: `0 8px 0 ${INK}`, maxWidth: 800,
        transform: `rotate(${interpolate(st, [0, 1], [l.spk === "K" ? -3 : 3, 0])}deg) translateY(${(1 - Math.min(1, st)) * 12}px)` }}>
        <div style={{ position: "absolute", top: -26, [l.spk === "K" ? "left" : "right"]: 20, padding: "4px 14px", borderRadius: 10, background: COL[l.spk], border: `4px solid ${INK}`, ...D, fontSize: 28, color: PAPER, letterSpacing: "0.06em" }}>{NAME[l.spk]}</div>
        <div style={{ ...UI, fontSize: 46, lineHeight: 1.18, color: INK }}>
          {words.map((w, j) => {
            const wt = ch.t + ((next - ch.t) * j) / words.length, on = k >= wt;
            const pop = on ? interpolate(k - wt, [0, 3, 6], [1, 1.12, 1], clamp) : 1;
            return <span key={j} style={{ display: "inline-block", marginRight: j < words.length - 1 ? "0.32em" : 0, color: on ? INK : "rgba(7,7,26,.28)", transform: `scale(${pop})` }}>{w}</span>;
          })}
        </div>
        <svg width="46" height="34" viewBox="0 0 46 34" style={{ position: "absolute", bottom: -32, left: Math.min(700, Math.max(10, tail - left - 23 - (l.spk === "K" ? 0 : 0))) }}>
          <path d="M4,0 L42,0 L18,32 Z" fill="#fff" stroke={INK} strokeWidth="5" strokeLinejoin="round" /><rect x="2" y="-6" width="42" height="9" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

// the scene layer: insert cards with a burst when they land, or kinetic type for lines without a card
function Burst({ f, at, x = 540, y = 620, col = GOLD }) {
  const t = f - at; if (t < 0 || t > 18) return null;
  const k = t / 18;
  return (
    <svg width="1080" height="1100" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2 + random(`b${at}${i}`) * 0.3, r0 = 120 + k * 260, r1 = r0 + 60 * (1 - k);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={col} strokeWidth={10 * (1 - k)} strokeLinecap="round" />; })}
      {Array.from({ length: 10 }, (_, i) => { const a = random(`c${at}${i}`) * Math.PI * 2, r = 80 + k * (200 + random(`d${at}${i}`) * 200);
        return <path key={i} d="M0,-14 C3,-3 3,-3 14,0 C3,3 3,3 0,14 C-3,3 -3,3 -14,0 C-3,-3 -3,-3 0,-14 Z" fill={i % 2 ? PAPER : B.lo} transform={`translate(${x + Math.cos(a) * r} ${y + Math.sin(a) * r}) scale(${1 - k})`} />; })}
    </svg>
  );
}
function Scene({ f }) {
  if (sceneTitle(f) || holdAt(f) || f >= LAST.at - 4) return null;
  const i = lineAt(f); if (i < 0) return null;
  const l = L[i], name = l.insert;
  if (name && INSERTS[name]) {
    let s = i; while (s > 0 && L[s - 1].insert === name) s--;
    let e = i; while (e + 1 < L.length && L[e + 1].insert === name) e++;
    const start = L[s].at, stop = e + 1 < L.length ? L[e + 1].at - 4 : END;
    const marks = {}; for (let j = s; j <= e; j++) for (const [k, v] of Object.entries(L[j].marks)) marks[k] = L[j].at + v;
    // the hook: Karim's line opens on kinetic type until his first claim pops
    if (name === "claims" && f < marks.bald - 2) {
      const a = l.at, [sx, sy] = shake(f, a + 2, 14, 4);
      return (
        <div style={{ position: "absolute", left: 60, right: 60, top: 440, textAlign: "center", transform: `translate(${sx}px, ${sy}px)`, opacity: interpolate(f, [marks.bald - 8, marks.bald - 2], [1, 0], clamp) }}>
          {["I'm done", "with creatine!"].map((w, j) => { const p = sp(f, a + j * 10, 9, 300);
            return <div key={j} style={{ ...D, fontSize: j ? 130 : 110, color: j ? GOLD : PAPER, textShadow: `8px 8px 0 ${INK}`, transform: `scale(${interpolate(p, [0, 1], [1.8, 1])}) rotate(-4deg)`, opacity: Math.min(1, p * 3) }}>{w}</div>; })}
        </div>
      );
    }
    const C = INSERTS[name], out = interpolate(f, [stop - 6, stop], [1, 0], clamp), inn = sp(f, start, 13, 200);
    return (
      <>
        <Burst f={f} at={start} />
        {Object.values(marks).map((v) => <Burst key={v} f={f} at={v} col={B.lo} y={560} />)}
        <div style={{ position: "absolute", left: 70, top: 350, width: 940, height: 500, opacity: out, transform: `translateY(${(1 - Math.min(1, inn)) * 80 + (1 - out) * -30}px) scale(${1.04})` }}>
          <C t={f - start} f={f} m={marks} L={l} />
        </div>
      </>
    );
  }
  const kin = KINETIC[i]; if (!kin) return null;
  const a = l.at, K = l.spk === "K", [sx, sy] = K ? shake(f, a + 2, 14, 4) : [0, 0], out = interpolate(f, [a + l.dur + 2, a + l.dur + 8], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 440, textAlign: "center", opacity: out, transform: `translate(${sx}px, ${sy}px)` }}>
      {kin.map((w, j) => {
        const p = sp(f, a + j * 9, 9, 300);
        return <div key={j} style={{ ...D, fontSize: j ? 130 : 110, color: j ? (K ? GOLD : "#5EEAD4") : PAPER, textShadow: `8px 8px 0 ${INK}`, transform: `scale(${interpolate(p, [0, 1], [1.8, 1])}) rotate(${K ? -4 : 3}deg)`, opacity: Math.min(1, p * 3) }}>{w}</div>;
      })}
    </div>
  );
}

function Backdrop({ f }) {
  const g = 0.35 + 0.1 * Math.sin(f / 50);
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0E0C26 0%, #1A1548 60%, #0E0C26 100%)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + 12 * Math.sin(f / 90)}% 38%, rgba(91,78,229,${g}), transparent 60%)` }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(139,128,255,.08) 2px, transparent 2px)", backgroundSize: "72px 72px", backgroundPosition: `0 ${f * 0.6}px` }} />
      {/* giant outline word drifting behind the scene */}
      <div style={{ position: "absolute", top: 640, left: -((f * 3) % 1400), whiteSpace: "nowrap", ...D, fontSize: 300, color: "transparent", WebkitTextStroke: "3px rgba(139,128,255,.13)" }}>CREATINE · FACTS · MYTHS · CREATINE · FACTS · MYTHS ·</div>
      {Array.from({ length: 22 }, (_, i) => {
        const x = random(`px${i}`) * 1080, y = (random(`py${i}`) * 1100 + 1100 - (f * (0.6 + random(`ps${i}`)) % 1100)) % 1100 + 200, s = 6 + random(`pr${i}`) * 10;
        return <svg key={i} width={s * 2} height={s * 2} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x, top: y, opacity: 0.35 }}><path d="M0,-1 C.2,-.2 .2,-.2 1,0 C.2,.2 .2,.2 0,1 C-.2,.2 -.2,.2 -1,0 C-.2,-.2 -.2,-.2 0,-1 Z" fill="#B8B0FF" /></svg>;
      })}
      {/* the stage the mascots stand on */}
      <div style={{ position: "absolute", left: -40, right: -40, top: 1716, height: 260, background: "linear-gradient(180deg, #2A2363, #0C0A22)", borderTop: `6px solid ${INK}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1716, height: 8, background: B.lo, boxShadow: `0 0 40px ${B.lo}`, opacity: 0.8 }} />
    </>
  );
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
  const col = s.tag.startsWith("Myth") ? RED : s.tag === "Surprise" ? GRN : GOLD, [sx, sy] = shake(f, s.title + 3, 20, 4);
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 38%, rgba(7,7,26,.4), rgba(7,7,26,.88))" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return <line key={i} x1={540 + Math.cos(a) * (240 + t * 30)} y1={640 + Math.sin(a) * (240 + t * 30)} x2={540 + Math.cos(a) * 1400} y2={640 + Math.sin(a) * 1400} stroke={col} strokeWidth="6" />; })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ display: "inline-block", padding: "16px 40px", border: `10px solid ${col}`, borderRadius: 24, background: "rgba(7,7,26,.6)", ...D, fontSize: 150, color: col, transform: `rotate(-6deg) scale(${interpolate(p, [0, 1], [2.6, 1])})`, opacity: Math.min(1, p * 3) }}>{s.tag}</div>
        <div style={{ ...D, fontSize: 88, color: PAPER, marginTop: 40, textShadow: `6px 6px 0 ${INK}`, opacity: interpolate(t, [8, 14], [0, 1], clamp) }}>“{s.name}”</div>
      </div>
    </AbsoluteFill>
  );
}

function HoldCard({ f }) {
  const h = holdAt(f); if (!h) return null;
  const p = sp(f, h.at + 4, 12, 260), r = sp(f, h.at + 12, 12, 220), K = h.who === "K";
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 520, textAlign: K ? "left" : "right" }}>
      <div style={{ display: "inline-block", padding: "10px 34px", background: GOLD, border: `6px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, transform: `rotate(${K ? -3 : 3}deg) translateX(${(1 - p) * (K ? -800 : 800)}px)` }}>
        <span style={{ ...D, fontSize: 130, color: INK }}>{h.name}</span>
      </div>
      <div style={{ ...D, fontSize: 60, color: PAPER, marginTop: 30, textShadow: `5px 5px 0 ${INK}`, opacity: Math.min(1, r * 2), transform: `translateY(${(1 - Math.min(1, r)) * 30}px)` }}>{h.role}</div>
    </div>
  );
}

function Finale({ f }) {
  const a = LAST.at; if (f < a - 2) return null;
  const p = sp(f, a, 10, 260), q = sp(f, a + 14, 10, 260), fo = sp(f, FOLLOW.at + 2, 10, 260), cta = sp(f, DL.at + 2, 9, 260);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
      <Burst f={f} at={a} y={160} />
      <div style={{ ...D, fontSize: 140, color: PAPER, textShadow: `8px 8px 0 ${INK}`, transform: `scale(${interpolate(p, [0, 1], [1.8, 1])}) rotate(-3deg)`, opacity: Math.min(1, p * 3) }}>Train smart.</div>
      <div style={{ ...D, fontSize: 140, color: GOLD, textShadow: `8px 8px 0 ${INK}`, transform: `scale(${interpolate(q, [0, 1], [1.8, 1])}) rotate(-3deg)`, opacity: Math.min(1, q * 3) }}>Stay informed!</div>
      <div style={{ marginTop: 36, display: "inline-flex", alignItems: "center", gap: 16, padding: "12px 28px", borderRadius: 999, background: B.primary, border: `6px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`,
        transform: `scale(${interpolate(fo, [0, 1], [1.5, 1])})`, opacity: Math.min(1, fo * 2) }}>
        <span style={{ ...D, fontSize: 44, color: PAPER }}>Follow</span><span style={{ ...D, fontSize: 44, color: GOLD }}>@darebni_ai</span>
      </div>
      <div style={{ ...D, fontSize: 40, color: PAPER, marginTop: 16, textShadow: `4px 4px 0 ${INK}`, opacity: fo }}>Tips · tricks · workouts</div>
      <div style={{ marginTop: 30, display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 34px 14px 16px", borderRadius: 26, background: PAPER, border: `6px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`,
        transform: `scale(${interpolate(cta, [0, 1], [1.4, 1]) * (1 + 0.03 * Math.max(0, Math.sin(Math.max(0, f - DL.at - 30) / 5)))})`, opacity: Math.min(1, cta * 2) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 88, height: 88, borderRadius: 20 }} />
        <div style={{ textAlign: "left" }}>
          <div style={{ ...D, fontSize: 30, color: B.primary, letterSpacing: "0.04em" }}>Download on the App Store</div>
          <div style={{ ...D, fontSize: 68, color: INK }}>Darebni AI</div>
        </div>
      </div>
    </div>
  );
}

export const MythsMascot60 = ({ music = true }) => {
  const f0 = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const h = holdAt(f0), f = h ? h.at - 1 : f0;
  // freeze-frame intro: zoom on the held mascot, desaturate
  let zoom = { s: 1, x: 0, y: 0, r: 0 };
  if (h) { const k = sp(f0, h.at, 13, 260), [hx, hy] = HEAD[h.who]; zoom = { s: 1 + 1.1 * k, x: (540 - hx) * k, y: (1250 - hy) * k, r: (h.who === "K" ? -4 : 4) * k }; }
  const i = lineAt(f0), l = i >= 0 ? L[i] : null;
  const [px, py] = l && l.spk === "K" && ["shock", "panic"].includes(l.expr) ? shake(f0, l.at, 10, 5) : [0, 0];
  const flash = h ? interpolate(f0, [h.at, h.at + 1, h.at + 8], [0, 0.9, 0], clamp) : 0;
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: h ? "grayscale(.85) sepia(.3) contrast(1.15)" : "none", transform: `translate(${zoom.x + px}px, ${zoom.y + py}px) rotate(${zoom.r}deg) scale(${zoom.s})`, transformOrigin: `${h ? HEAD[h.who][0] : 540}px ${h ? HEAD[h.who][1] : 960}px` }}>
        <Backdrop f={f} />
        {!h && <Scene f={f0} />}
        <Mascot who="K" f={f} /><Mascot who="S" f={f} />
        {!h && <Emotes f={f0} />}
        <NameTags f={f0} />
      </AbsoluteFill>
      {h && <AbsoluteFill style={{ background: "radial-gradient(circle, transparent 40%, rgba(7,7,26,.75))" }} />}
      <Header f={f0} />
      <Captions f={f0} />
      <HoldCard f={f0} />
      <TitleSlam f={f0} />
      <Finale f={f0} />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      <Grain f={f0} opacity={0.04} />
      <Audio src={staticFile(music ? "myths60.wav" : "myths60-sfx.wav")} />
    </AbsoluteFill>
  );
};
