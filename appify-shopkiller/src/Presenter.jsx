// Dev + karaoke captions, driven by the voice-over envelope and word timings in vo.json.
import { interpolate, random, useCurrentFrame } from "remotion";
import { Dev } from "./Dev.jsx";
import VO from "./vo.json";
import { clamp } from "./fx.jsx";

// expression keyframes by global frame
const MOODS = [
  [0, { brow: 0, lid: 0.5, smile: 0, look: 6 }],      // unimpressed at the bills
  [268, { brow: 18, lid: 0.12, smile: 0.4, look: 4 }], // curious: what if...
  [330, { brow: 20, lid: 0.18, smile: 1, look: 7 }],   // persuading
  [780, { brow: 10, lid: 0.05, smile: 1, look: 6 }],   // friendly close
];
const POINTS = [[150, 215], [346, 384], [482, 515], [617, 652], [690, 760], [840, 892]];

function mood(f) {
  let i = 0;
  while (i < MOODS.length - 1 && f >= MOODS[i + 1][0]) i++;
  const [t0, a] = MOODS[i];
  const next = MOODS[i + 1];
  if (!next || f < next[0] - 8) return a;
  const p = interpolate(f, [next[0] - 8, next[0]], [0, 1], clamp);
  return Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (next[1][k] - a[k]) * p]));
}

// split each spoken line into caption chunks of up to 4 words, breaking at punctuation
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

export function Presenter() {
  const f = useCurrentFrame();
  const m = VO.mouth;
  const open = Math.max(m[f] ?? 0, ((m[f - 1] ?? 0) + (m[f + 1] ?? 0)) / 2) ;
  const talking = open > 0.08;
  // blink every ~3 s, 3 frames
  const blinkAt = f % 97;
  const blink = blinkAt < 3 ? [0.6, 1, 0.6][blinkAt] : 0;
  const face = mood(f);
  const pointP = POINTS.reduce((v, [a, b]) => Math.max(v, interpolate(f, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp)), 0);
  const tilt = talking ? Math.sin(f / 3.2) * 2.2 * open + (random(`t${Math.floor(f / 9)}`) - 0.5) * 1.5 : Math.sin(f / 24) * 0.8;
  const bob = Math.sin(f / 14) * 3 - open * 3;

  const chunk = CHUNKS.find((c) => f >= c[0].start - 2 && f < c[c.length - 1].end + 10) ;
  return (
    <>
      <div style={{ position: "absolute", left: 4, top: 1268 }}>
        <Dev width={290} point={pointP} tilt={tilt} bob={bob} open={open} {...face} lid={Math.max(face.lid, blink)} smile={face.smile} />
      </div>
      {chunk && (
        <div style={{ position: "absolute", left: 300, right: 120, top: 1330, display: "flex", justifyContent: "flex-start" }}>
          <div style={{ padding: "20px 26px", background: "#FFFFFF", border: "4px solid #0A0913", borderRadius: 10, boxShadow: "0 8px 0 #0A0913", fontFamily: "Mono", fontSize: 44, lineHeight: 1.2, letterSpacing: "-0.01em", maxWidth: 640, transform: `translateY(${interpolate(f - chunk[0].start, [-2, 3], [14, 0], clamp)}px)`, opacity: interpolate(f - chunk[0].start, [-2, 2], [0, 1], clamp) }}>
            {chunk.map((w, i) => (
              <span key={i} style={{ color: f >= w.start ? "#0A0913" : "rgba(10,9,19,.35)", fontWeight: 600 }}>{w.w}{i < chunk.length - 1 ? " " : ""}</span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
