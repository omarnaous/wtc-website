// No Planz logo reveal. The one idea: a crowd of people (dots) wander with no plan and keep connecting; three of them
// find each other, the route through them becomes the Z, and it slides into place as the last letter of the word.
import { AbsoluteFill, Audio, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "./timing.js";
import { useFonts, clamp, easeOut, easeIn, shake, Grain } from "./fx.jsx";
import { C, WAVE, route } from "./Logo.jsx";
import { WORD } from "./brand.js";

const lerp = (a, b, t) => a + (b - a) * t;
const sp = (f, at, fps, d = 12, s = 200) => spring({ frame: f - at, fps, config: { damping: d, stiffness: s } });
// a dot's unplanned wander: two slow sines per axis, seeded, so every render is the same
function wanderAt(f, seed, ax, ay) {
  const r = (k) => random(`${seed}${k}`);
  return [ax * (Math.sin(f / (13 + 6 * r(1)) + 6 * r(2)) * 0.7 + Math.sin(f / (5 + 3 * r(3)) + 6 * r(4)) * 0.3),
          ay * (Math.sin(f / (11 + 6 * r(5)) + 6 * r(6)) * 0.7 + Math.sin(f / (4 + 3 * r(7)) + 6 * r(8)) * 0.3)];
}

export const Reveal = ({ tagline = "meet people. no plans needed." }) => {
  useFonts([["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const u = Math.min(W, H) / 1080;

  // final layout: the word centred, its z where the mark ends up
  const s = (Math.min(W, 1080) * 0.76) / WORD.width, ox = (W - WORD.width * s) / 2, by = H * 0.5 + (WORD.xHeight * s) / 2;
  const z = WORD.z;
  const fin = { x0: ox + z.x0 * s, y0: by + z.top * s, x1: ox + z.x1 * s, y1: by + z.bot * s, sw: z.sw * s, r: z.r * s };
  // the big mark, centred
  const cx = W / 2, cy = H * 0.47, hw = 190 * u, hh = 165 * u;
  const big = { x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh, sw: 58 * u, r: 50 * u };
  const m = f < T.morph ? 0 : interpolate(sp(f, T.morph, fps, 15, 140), [0, 1], [0, 1]);
  const R = Object.fromEntries(Object.keys(big).map((k) => [k, lerp(big[k], fin[k], m)]));

  // the crowd before the route exists: pop in, wander, connect, freeze; the three who meet dash onto the route
  const dash = f < T.dash ? 0 : interpolate(f, [T.dash, T.draw + 4], [0, 1], { ...clamp, easing: easeIn });
  const away = f < T.dash ? 0 : interpolate(f, [T.dash, T.hit], [0, 1], { ...clamp, easing: easeIn });
  const ends = { a: [R.x0, R.y0], m: [(R.x0 + R.x1) / 2, (R.y0 + R.y1) / 2], b: [R.x1, R.y1] };
  const PEOPLE = [
    { id: "a", home: [0.3, 0.38], c: C.coral, at: T.popA, k: 1 }, { id: "m", home: [0.52, 0.52], c: C.violet, at: T.popA + 3, k: 0.88 },
    { id: "b", home: [0.7, 0.6], c: C.lime, at: T.popB, k: 1 },
    { id: "e1", home: [0.2, 0.62], c: C.paper, at: 2, k: 0.6 }, { id: "e2", home: [0.78, 0.33], c: C.coral, at: 6, k: 0.62 },
    { id: "e3", home: [0.48, 0.24], c: C.lime, at: 8, k: 0.55 }, { id: "e4", home: [0.36, 0.76], c: C.violet, at: 12, k: 0.58 },
    { id: "e5", home: [0.82, 0.74], c: C.paper, at: 14, k: 0.5 }, { id: "e6", home: [0.14, 0.4], c: C.lime, at: 16, k: 0.5 },
  ];
  const dots = PEOPLE.map((p) => {
    const [wx, wy] = wanderAt(Math.min(f, T.spot), p.id, 130 * u, 100 * u);
    const w = [W * p.home[0] + wx, H * p.home[1] + wy];
    const key = p.id.length === 1;
    const at = key ? [lerp(w[0], ends[p.id][0], dash), lerp(w[1], ends[p.id][1], dash)]
                   : [lerp(w[0], W / 2 + (w[0] - W / 2) * 1.8, away), lerp(w[1], H / 2 + (w[1] - H / 2) * 1.8, away)];
    const pop = sp(f, p.at, fps, 9, 260) * (key ? 1 : 1 - away);
    return { ...p, x: at[0], y: at[1], pop, key };
  });
  const D = Object.fromEntries(dots.map((d) => [d.id, d]));
  const spot = f >= T.spot && f < T.dash ? 1 + 0.18 * Math.exp(-(f - T.spot) / 3) * Math.cos((f - T.spot) * 1.4) : 1;
  const hitPop = f < T.hit ? 1 : 1 + 0.35 * Math.exp(-(f - T.hit) / 4);
  // the network: a line between any two people who wander close, brighter the closer they are
  const net = [];
  if (f >= T.wander && f < T.dash + 6) for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
    const p = dots[i], q = dots[j], d = Math.hypot(p.x - q.x, p.y - q.y), lim = 430 * u;
    const trio = p.key && q.key;
    const o = Math.max(0, 1 - d / lim) * Math.min(p.pop, q.pop) * interpolate(f, [T.wander, T.wander + 8], [0, 1], clamp)
      * (f < T.spot ? 1 : trio ? 1.6 : interpolate(f, [T.spot, T.spot + 6], [1, 0.25], clamp)) * (f < T.dash ? 1 : interpolate(f, [T.dash, T.dash + 6], [1, 0], clamp));
    if (o > 0.02) net.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y, o: Math.min(0.9, o), trio });
  }

  // the route draws between the dots, then the hit
  const draw = interpolate(f, [T.draw, T.hit], [0, 1], { ...clamp, easing: easeOut });
  const len = (R.x1 - R.x0) * 2 + Math.hypot(R.x1 - R.x0, R.y1 - R.y0) * (1 + WAVE * 0.9);
  const [sx, sy] = shake(f, T.hit, 14 * u, 4);
  const flash = f < T.hit ? 0 : interpolate(f - T.hit, [0, 2, 10], [0.35, 0.15, 0], clamp);
  const ring = f < T.hit ? 0 : (f - T.hit) / 26;
  const push = interpolate(f, [T.hit, T.end], [1, 1.035], clamp);

  // the crowd at the hit: little dots in the brand colours flying out from the centre and fading
  const crowd = f < T.hit ? [] : Array.from({ length: 26 }, (_, i) => {
    const a = random(`c${i}`) * Math.PI * 2, v = (6 + random(`v${i}`) * 9) * u, t = f - T.hit;
    const d = v * t * Math.exp(-t / 22) * 2.2;
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: (6 + random(`r${i}`) * 9) * u * Math.max(0, 1 - t / 40), c: [C.coral, C.lime, C.violet, C.paper][i % 4] };
  });

  const tag = interpolate(f, [T.tag, T.tag + 14], [0, 1], { ...clamp, easing: easeOut });
  const breathe = f > T.tag ? Math.sin((f - T.tag) / 9) * 2 * u : 0;

  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 47%, rgba(123,92,255,${0.18 + 0.35 * flash}), transparent 60%)` }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${push})` }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {net.map((l, i) => <line key={i} {...l} o={undefined} stroke={l.trio ? C.paper : C.violet} strokeWidth={(l.trio ? 4 : 3) * u} strokeLinecap="round" strokeDasharray={l.trio && f >= T.spot ? `${4 * u} ${14 * u}` : "none"} strokeDashoffset={-(f - T.spot) * 4 * u} opacity={l.o} />)}
          {f >= T.hit && ring < 1 && <circle cx={cx} cy={cy} r={(230 + 460 * ring) * u} fill="none" stroke={C.paper} strokeWidth={(10 * (1 - ring)) * u} opacity={0.5 * (1 - ring)} />}
          {crowd.map((p, i) => p.r > 0 && <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.c} />)}
          {/* "no plan" */}
          <g transform={`translate(${ox} ${by + breathe}) scale(${s})`}>
            {WORD.letters.map((l, i) => {
              const k = f < T.word + i * 3 ? 0 : Math.min(1.2, sp(f, T.word + i * 3, fps, 10, 260));
              return <path key={i} d={l.d} fill={C.paper} opacity={Math.min(1, k * 2)} transform={`translate(${l.x + l.w / 2} ${-WORD.xHeight / 2}) scale(${k}) translate(${-l.x - l.w / 2} ${WORD.xHeight / 2})`} />;
            })}
          </g>
          {/* the route, then the two dots on top */}
          <g transform={`translate(0 ${m > 0 ? breathe : 0})`}>
            {f >= T.draw && <path d={route(R.x0, R.y0, R.x1, R.y1, WAVE)} fill="none" stroke={C.paper} strokeWidth={R.sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />}
            {dots.map((d) => d.pop > 0.01 && <circle key={d.id} cx={d.x} cy={d.y} r={(d.id === "m" ? R.r * 0.86 : R.r) * (d.key ? 1 : d.k) * d.pop * (d.key ? spot * hitPop : 1)} fill={d.c} stroke={d.id === "m" && f >= T.draw ? C.night : "none"} strokeWidth={R.r * 0.26} />)}
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: by + 90 * u, textAlign: "center", fontFamily: "Mono", fontSize: 30 * u, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,246,234,.75)", opacity: tag, transform: `translateY(${(1 - tag) * 20 * u}px)` }}>{tagline}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: C.paper, opacity: flash * 0.18, mixBlendMode: "screen" }} />
      <Grain f={f} opacity={0.05} />
      <Audio src={staticFile("sound.wav")} />
    </AbsoluteFill>
  );
};
