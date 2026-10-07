// Dev + karaoke captions. Dev reacts to what happens on screen: waves, points, flinches, jumps,
// laughs, winks, gives thumbs-up, and pops emotes above his head.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Dev } from "./Dev.jsx";
import VO from "./vo.json";
import { clamp } from "./fx.jsx";
import { sparkPath } from "./brand.js";
import { warp, T, DATA } from "./timing.js";

const MOODS0 = [
  [0, { brow: 2, lid: 0.35, smile: 0.2, look: 6 }],         // unimpressed at the plain photo
  [T.turn, { brow: 20, lid: 0.1, smile: 1, look: 7 }],      // watch this!
  [T.show + 10, { brow: 14, lid: 0.12, smile: 1, look: 8 }],// proud, watching the film
  [T.cta, { brow: 12, lid: 0.05, smile: 1, look: 6 }],      // friendly close
];
// [type, start, end]
const ACTS0 = [
  ["point", 20, T.swipe], ["shock", T.swipe + 6, T.turn - 1], ["jump", T.turn, T.turn + 16], ["happy", T.turn, T.turn + 20],
  ["point", T.show + 8, T.show + 80], ["thumbs", T.show + 200, T.show + 250], ["happy", T.show + 330, T.show + 360],
  ["point", T.show + 480, T.show + 560], ["thumbs", T.show + 640, T.show + 700],
  ["point", DATA.people.at - 4, DATA.people.at + 40], ["thumbs", DATA.marketers.at, DATA.marketers.at + 50], ["happy", DATA.marketers.at + 28, DATA.marketers.at + 56],
  ["wave", T.cta + 2, T.cta + 30], ["point", T.cta + 44, T.end - 10], ["wink", T.cta + 90, T.cta + 110],
];
const EMOTES0 = [["?", 30, T.swipe], ["!", T.turn, T.turn + 30], ["spark", T.show + 330, T.show + 370], ["spark", T.cta + 44, T.end - 10]];

const MOODS = MOODS0.map(([f, m]) => [warp(f), m]);
const ACTS = ACTS0.map(([t, a, b]) => [t, warp(a), Math.max(warp(a) + 8, warp(b))]);
const EMOTES = EMOTES0.map(([k, a, b]) => [k, warp(a), Math.max(warp(a) + 8, warp(b))]);

const env = (f, a, b, r = 6) => { r = Math.min(r, (b - a) / 2 - 0.01); return interpolate(f, [a, a + r, b - r, b], [0, 1, 1, 0], clamp); };
const act = (f, type) => ACTS.filter((x) => x[0] === type).reduce((v, [, a, b]) => Math.max(v, env(f, a, b)), 0);

function mood(f) {
  let i = 0;
  while (i < MOODS.length - 1 && f >= MOODS[i + 1][0]) i++;
  const a = MOODS[i][1], next = MOODS[i + 1];
  if (!next || f < next[0] - 8) return a;
  const p = interpolate(f, [next[0] - 8, next[0]], [0, 1], clamp);
  return Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (next[1][k] - a[k]) * p]));
}

const CHUNKS = (() => {
  const out = []; let cur = [];
  VO.words.forEach((w, i) => {
    const prev = VO.words[i - 1];
    if (cur.length && (cur.length >= 4 || w.line !== prev.line || /[.?!,]$/.test(prev.w))) { out.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) out.push(cur);
  return out;
})();

function Emote({ kind, p, f }) {
  const s = Math.min(1, p * 1.4);
  const bob = Math.sin(f / 4) * 4;
  const common = { position: "absolute", transform: `scale(${s}) translateY(${bob}px)`, transformOrigin: "50% 100%" };
  if (kind === "sweat") return <svg style={{ ...common, left: 208, top: 1276 + (1 - p) * -10 }} width="34" height="48" viewBox="0 0 34 48"><path d="M17,2 Q32,26 30,34 A13,13 0 0 1 4,34 Q2,26 17,2 Z" fill="#7CC8FF" stroke="#0A0913" strokeWidth="4" /></svg>;
  if (kind === "spark") return (
    <svg style={{ ...common, left: 114, top: 1106 }} width="220" height="160" viewBox="0 0 220 160">
      {[[40, 90, 22], [110, 40, 30], [180, 96, 18]].map(([x, y, r], i) => <path key={i} d={sparkPath(x, y + Math.sin(f / 5 + i) * 6, r, 0.22)} fill="#8F72FF" stroke="#0A0913" strokeWidth="4" />)}
    </svg>
  );
  const bg = kind === "$" ? "#1FA971" : kind === "?" ? "#74C6FF" : "#FF6A3D";
  return (
    <div style={{ ...common, left: 200, top: 1132, width: 84, height: 84, borderRadius: 99, background: bg, border: "5px solid #0A0913", display: "grid", placeItems: "center", fontFamily: "Display", fontWeight: 600, fontSize: 54, color: "#fff", boxShadow: "0 6px 0 #0A0913" }}>{kind}</div>
  );
}

export function Presenter() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = VO.mouth;
  const open = Math.max(m[f] ?? 0, ((m[f - 1] ?? 0) + (m[f + 1] ?? 0)) / 2);
  const talking = open > 0.08;
  const blinkAt = f % 97;
  const blink = blinkAt < 3 ? [0.6, 1, 0.6][blinkAt] : 0;
  const face = mood(f);

  const wave = act(f, "wave"), point = act(f, "point"), thumbs = act(f, "thumbs");
  const shock = act(f, "shock"), happy = act(f, "happy"), wink = act(f, "wink"), lean = act(f, "lean");
  // jumps: arc up, squash on landing
  let jumpY = 0, squash = 1;
  ACTS.filter((x) => x[0] === "jump").forEach(([, a, b]) => {
    if (f >= a && f < b) { const p = (f - a) / (b - a); jumpY = -Math.sin(p * Math.PI) * 90; }
    if (f >= b && f < b + 8) squash = 1 - 0.08 * Math.sin(((f - b) / 8) * Math.PI);
  });
  const waveAng = Math.sin(f / 2.2) * 22;
  // head stays nearly still: a slow, tiny sway while talking and a gentle lean; no side-to-side shakes
  const tilt = lean * -3 + (talking ? Math.sin(f / 9) * 0.5 * open : 0);
  const bob = talking ? -open * 2 - Math.abs(Math.sin(f / 4)) * 2 : Math.sin(f / 22) * 0.8; // gentle breathing when idle
  const flinch = shock * -8; // small jolt backwards
  const scale = 1 + lean * 0.06;

  const chunk = CHUNKS.find((c) => f >= c[0].start - 2 && f < c[c.length - 1].end + 10);
  return (
    <>
      <div style={{ position: "absolute", left: 6 + flinch, top: 1228 + jumpY, transform: `scale(${scale}, ${scale * squash})`, transformOrigin: "50% 100%" }}>
        <Dev width={280} point={point} wave={wave} waveAng={waveAng} thumbs={thumbs} tilt={tilt} bob={bob} open={open}
          {...face} smile={Math.max(face.smile, happy)} lid={Math.max(face.lid * (1 - happy), blink * (1 - happy))} shock={shock} happy={happy} wink={wink} />
      </div>
      {EMOTES.map(([k, a, b], i) => (f >= a && f < b ? <Emote key={i} kind={k} p={env(f, a, b, 5)} f={f} /> : null))}
      {chunk && (
        <div style={{ position: "absolute", left: 300, right: 110, top: 1330, display: "flex" }}>
          <div style={{ padding: "20px 26px", background: "#FFFFFF", border: "4px solid #0A0913", borderRadius: 10, boxShadow: "0 8px 0 #0A0913", fontFamily: "Mono", fontSize: 44, lineHeight: 1.2, letterSpacing: "-0.01em", maxWidth: 660, transform: `translateY(${interpolate(f - chunk[0].start, [-2, 3], [14, 0], clamp)}px) rotate(${interpolate(spring({ frame: f - chunk[0].start, fps, config: { damping: 8 } }), [0, 1], [-3, 0])}deg)`, opacity: interpolate(f - chunk[0].start, [-2, 2], [0, 1], clamp) }}>
            {chunk.map((w, i) => {
              const on = f >= w.start;
              const pop = on ? interpolate(f - w.start, [0, 3, 6], [1, 1.12, 1], clamp) : 1;
              return <span key={i} style={{ display: "inline-block", marginRight: i < chunk.length - 1 ? "0.5em" : 0, color: on ? "#0A0913" : "rgba(10,9,19,.3)", fontWeight: 600, transform: `scale(${pop})` }}>{w.w}</span>;
            })}
          </div>
        </div>
      )}
    </>
  );
}
