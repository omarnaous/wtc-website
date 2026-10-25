// No Planz logo reveal. The one idea: two dots wander with no plan, find each other, and the route between them
// becomes the Z, which then slides into place as the last letter of the word.
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

  // the two dots before the route exists: pop in, wander, freeze, dash to the ends
  const dash = f < T.dash ? 0 : interpolate(f, [T.dash, T.draw + 4], [0, 1], { ...clamp, easing: easeIn });
  const homeA = [W * 0.3, H * 0.4], homeB = [W * 0.7, H * 0.58];
  const pos = (seed, home, end, at) => {
    const tw = Math.min(f, T.spot);                               // freeze at the spot
    const [wx, wy] = wanderAt(tw, seed, 150 * u, 120 * u);
    const p = [home[0] + wx, home[1] + wy];
    return [lerp(p[0], end[0], dash), lerp(p[1], end[1], dash)];
  };
  const A = pos("a", homeA, [R.x0, R.y0]), B = pos("b", homeB, [R.x1, R.y1]);
  const popA = sp(f, T.popA, fps, 9, 260), popB = sp(f, T.popB, fps, 9, 260);
  const spot = f >= T.spot && f < T.dash ? 1 + 0.18 * Math.exp(-(f - T.spot) / 3) * Math.cos((f - T.spot) * 1.4) : 1;
  const hitPop = f < T.hit ? 1 : 1 + 0.35 * Math.exp(-(f - T.hit) / 4);
  // the unplanned trails behind the wandering dots
  const trail = (seed, home) => {
    const pts = [];
    for (let k = Math.max(T.wander, Math.min(f, T.spot) - 26); k <= Math.min(f, T.spot); k++) {
      const [wx, wy] = wanderAt(k, seed, 150 * u, 120 * u); pts.push(`${home[0] + wx},${home[1] + wy}`);
    }
    return pts.join(" ");
  };
  const trailO = interpolate(f, [T.wander, T.wander + 8, T.dash, T.dash + 8], [0, 0.45, 0.45, 0], clamp);

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
          {f < T.dash + 8 && (
            <g opacity={trailO} fill="none" strokeWidth={5 * u} strokeLinecap="round" strokeDasharray={`${2 * u} ${14 * u}`}>
              <polyline points={trail("a", homeA)} stroke={C.coral} />
              <polyline points={trail("b", homeB)} stroke={C.lime} />
            </g>
          )}
          {/* they notice each other: a dashed line flickers between them */}
          {f >= T.spot && f < T.dash + 2 && <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={C.paper} strokeWidth={4 * u} strokeLinecap="round" strokeDasharray={`${4 * u} ${16 * u}`} strokeDashoffset={-(f - T.spot) * 4 * u} opacity={interpolate(f, [T.spot, T.spot + 3, T.dash - 2, T.dash + 2], [0, 0.7, 0.7, 0], clamp) * (f % 4 < 2 && f < T.spot + 6 ? 0.4 : 1)} />}
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
            {f >= T.popA && <circle cx={A[0]} cy={A[1]} r={R.r * popA * spot * hitPop} fill={C.coral} />}
            {f >= T.popB && <circle cx={B[0]} cy={B[1]} r={R.r * popB * spot * hitPop} fill={C.lime} />}
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
