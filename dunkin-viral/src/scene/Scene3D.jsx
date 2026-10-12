// The 3D layer: one scene, a camera that moves on the beat (eases inside a section, hard cuts between days).
import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring } from "remotion";
import { T, BEAT } from "../timing.js";
import { clamp, easeOut, easeIn } from "../fx.jsx";
import { Env, CameraRig, Cup, Liquid, Droplets, Ice, Straw, Donut, Bill, useFace, BOTTOM, TOP, COL } from "./three-bits.jsx";

const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sp = (f, at, damping = 11, stiffness = 170) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });

// week: one camera + cup angle per day (hard cuts)
export const DAYS = [
  { pos: [0, 0.3, 6.6], rot: 0.0, tilt: 0.0 },
  { pos: [-2.8, -0.6, 5.6], rot: -0.5, tilt: 0.12 },
  { pos: [0, 3.4, 5.2], rot: 0.35, tilt: 0.0 },
  { pos: [2.9, 0.8, 5.4], rot: 0.55, tilt: -0.1 },
  { pos: [0, -1.4, 5.8], rot: -0.2, tilt: 0.0 },
  { pos: [-2.2, 1.6, 5.0], rot: -0.4, tilt: 0.08 },
  { pos: [0, 0.4, 5.0], rot: 0.15, tilt: 0.0 },
];

function camera(f, tall) {
  // a 9:16 frame is narrow, so every shot dollies back along its own line of sight (4:5 needs less)
  const k = tall ? 1.6 : 1.15;
  const S = (pos, look, fov = 34) => ({ pos: pos.map((v, i) => look[i] + (v - look[i]) * k), look, fov });
  const seg = (a, b, A, B) => { const t = ease(interpolate(f, [a, b], [0, 1], clamp)); return { pos: lerp3(A.pos, B.pos, t), look: lerp3(A.look, B.look, t), fov: lerp(A.fov, B.fov, t) }; };
  if (f < T.smash) return S([0, 0.25, 8.2 - f * 0.008], [0, 0.2, 0]);
  if (f < T.pour) { const o = (f - T.smash) / 60; return S([Math.sin(o * 0.9) * 1.6, lerp(-0.1, 0.4, o), 6.9 - o * 0.5], [0, -0.1, 0]); }
  if (f < T.straw) return seg(T.pour, T.pour + 18, S([1.2, 0.4, 6.4], [0, -0.1, 0]), S([0.4, 2.7, 4.7], [0, 0.15, 0], 38));
  if (f < T.week) return seg(T.straw, T.price + 6, S([0.4, 2.7, 4.7], [0, 0.15, 0], 38), S([0.2, 0.5, 6.1], [0, 0.25, 0]));
  if (f < T.every) { const d = DAYS[Math.min(6, Math.floor((f - T.week) / BEAT))]; const t = ((f - T.week) % BEAT) / BEAT; return S(d.pos.map((v, i) => (i === 2 ? v - t * 0.35 : v)), [0, 0.2, 0]); }
  if (f < T.drop) { const i = Math.floor((f - T.every) / BEAT), t = ((f - T.every) % BEAT) / BEAT; const z = [6.6, 5.6, 4.6][i] - easeOut(Math.min(1, t * 3)) * 0.4; return S([0, 0.5, z], [0, 0.25, 0]); }
  if (f < T.finale) { const t = interpolate(f, [T.drop, T.finale], [0, 1], clamp); return S([0.001, 6.6 - t * 0.6, 0.02], [0, 0.7, 0], 34); }
  const t = interpolate(f, [T.finale, T.finale + 40], [0, 1], { ...clamp, easing: easeOut });
  const orb = (f - T.finale) / 220;
  const end = S([Math.sin(orb) * 2.2, 0.6, Math.cos(orb) * 7.6], [0, -0.75, 0]);   // cup sits high: room for the end card
  const topv = S([0.001, 6.0, 0.02], [0, 0.7, 0]);
  return { pos: lerp3(topv.pos, end.pos, t), look: lerp3(topv.look, end.look, t), fov: 34 };
}

export function Scene3D({ f, width, height }) {
  const ready = useFace("Print", "Baloo2.ttf", { weight: "400 800" });
  const tall = height > 1600;
  const cam = camera(f, tall);

  // the cup's life
  const drop = f < T.smash ? 0 : sp(f, T.smash, 9, 190);
  const cupY = f < T.smash ? 9 : lerp(5.5, 0, Math.min(1, drop)) + (drop > 1 ? (drop - 1) * -0.6 : 0);
  const squash = f >= T.smash && f < T.smash + 14 ? 1 - 0.1 * Math.sin(((f - T.smash) / 14) * Math.PI) : 1;
  let rot = 0.12 * Math.sin(f / 50), tilt = 0;
  if (f >= T.turn) rot += interpolate(f, [T.turn, T.price], [0, Math.PI], { ...clamp, easing: easeOut });
  if (f >= T.week && f < T.every) { const d = DAYS[Math.min(6, Math.floor((f - T.week) / BEAT))]; rot = Math.PI + d.rot; tilt = d.tilt; }
  if (f >= T.every && f < T.drop) rot = Math.PI + (f - T.every) * 0.16;
  if (f >= T.drop) rot = Math.PI + (f >= T.finale ? Math.sin((f - T.finale) / 60) * 0.25 : 0);
  const hit = f >= T.price ? Math.exp(-(f - T.price) / 6) : 0;   // punch on the price
  const scale = (1 + hit * 0.06) * (f >= T.every && f < T.drop ? 1 + Math.exp(-((f - T.every) % BEAT) / 3) * 0.05 : 1);

  const fill = interpolate(f, [T.pour + 2, T.full], [0, 0.86], { ...clamp, easing: easeOut });
  const milk = interpolate(f, [T.full - 4, T.full + 50], [0, 1], { ...clamp, easing: easeOut });
  const smile = f < T.eyes ? 0 : f < T.mouth ? interpolate(f, [T.eyes, T.eyes + 7], [0, 0.33], clamp) : interpolate(f, [T.mouth, T.mouth + 28], [0.33, 1], { ...clamp, easing: easeOut });
  const fillY = BOTTOM + (TOP - BOTTOM) * fill;
  const dew = interpolate(f, [T.full, T.full + 50], [0, 1], clamp);

  const ICE = [[-0.3, 0.08, T.ice1, -0.98], [0.27, -0.2, T.ice2, -0.92], [0.02, 0.3, T.ice3, -0.7]];
  const strawY = f < T.straw ? null : lerp(4.5, 0, Math.min(1.05, sp(f, T.straw, 10, 200)));
  const pourOn = f >= T.pour - 2 && f < T.full + 4;

  return (
    <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 8], fov: 34, near: 0.05, far: 100 }} gl={{ antialias: true, alpha: true, localClippingEnabled: true }}>
      <CameraRig {...cam} />
      <Env />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3.5, 6, 5]} intensity={2.4} />
      <directionalLight position={[-5, 2, -3]} intensity={1.6} color="#FF7AC2" />
      <pointLight position={[0, -3, 4]} intensity={6} color="#FFB37A" />

      {/* the $1 bill flutters down in the hook, then is flicked away on the smash */}
      {f < T.smash + 14 && (() => {
        const away = f >= T.smash ? interpolate(f, [T.smash, T.smash + 14], [0, 1], { ...clamp, easing: easeIn }) : 0;
        const y = lerp(3.4, -0.1, easeOut(Math.min(1, f / 58))) + away * 5, x = Math.sin(f / 14) * 0.6 - away * 4;
        return <Bill f={f} ready={ready} position={[x, y, 2.2]} rotation={[0.35 + Math.sin(f / 11) * 0.3, Math.sin(f / 17) * 0.5, -0.25 + Math.sin(f / 9) * 0.25 - away * 2]} scale={1.05} />;
      })()}

      {f >= T.smash && (
        <group position={[0, cupY, 0]} rotation={[tilt, rot, tilt * 0.5]} scale={[scale, scale * squash, scale]}>
          <Liquid f={f} fill={fill} milk={milk} smile={smile} />
          {ICE.map(([x, z, at, y0], i) => {
            if (f < at - 8) return null;
            const p = interpolate(f, [at - 8, at], [0, 1], { ...clamp, easing: easeIn });
            const bounce = f >= at ? Math.exp(-(f - at) / 5) * Math.abs(Math.sin((f - at) / 2.2)) * 0.18 : 0;
            const sink = interpolate(f, [T.drop - 6, T.drop], [0, 1], clamp);   // under the surface before the top-down smiley
            const y = Math.max(lerp(3.2, y0, p) + bounce, Math.min(fillY - 0.18 - i * 0.04, 0.55 - i * 0.05)) - sink * 0.75;
            return <Ice key={i} pos={[x, y, z]} rot={[p * 4 + i, p * 3 + i * 2, i * 0.7 + (f > at ? Math.sin(f / 20 + i) * 0.1 : 0)]} />;
          })}
          {pourOn && (() => { const top = 4.2, len = top - fillY; const w = 0.075 + Math.sin(f / 2) * 0.008; return (
            <mesh position={[Math.sin(f / 5) * 0.03, fillY + len / 2, 0]}><cylinderGeometry args={[w, w * 1.15, len, 16]} /><meshPhysicalMaterial color={COL.coffee} roughness={0.15} clearcoat={1} /></mesh>
          ); })()}
          {strawY !== null && f < T.drop && <Straw y={strawY + interpolate(f, [T.drop - 10, T.drop], [0, 4], { ...clamp, easing: easeIn })} />}
          <Cup printReady={ready} />
          <Droplets amount={dew} />
        </group>
      )}

      {/* donuts burst out on the price, orbit in the finale */}
      {f >= T.price && f < T.week && [0, 1, 2, 3].map((i) => {
        const t = (f - T.price) / 30, a = i * (Math.PI / 2) + 0.6;
        const r = lerp(0.3, 3.4, easeOut(Math.min(1, t)));
        return <Donut key={i} seed={`b${i}`} icing={[COL.pink, "#6B3A1E", "#FFB5D5", COL.orange][i]} position={[Math.cos(a) * r, Math.sin(a) * r * 0.9 + 0.2, -1 + i * 0.3]} rotation={[0.9 + f / 20, f / 15 + i, 0]} scale={0.95} />;
      })}
      {f >= T.finale && [0, 1, 2, 3, 4].map((i) => {
        const a = (f - T.finale) / 38 + i * (Math.PI * 2 / 5), grow = Math.min(1, sp(f, T.finale + 10 + i * 3, 12, 160));
        return <Donut key={i} seed={`f${i}`} icing={[COL.pink, "#6B3A1E", "#FFB5D5", COL.orange, "#FFFFFF"][i]} position={[Math.cos(a) * 2.3, Math.sin(a * 2) * 0.35 + 0.1, Math.sin(a) * 2.3]} rotation={[1.1 + Math.sin(f / 30 + i) * 0.3, f / 25 + i, 0]} scale={0.8 * grow} />;
      })}
    </ThreeCanvas>
  );
}
