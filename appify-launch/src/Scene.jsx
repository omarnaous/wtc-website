// The 3D shot: a night engineering test. A grey steel track runs along the ground and curves up into a vertical
// ramp, its edges lit pink-red, held up by a steel lattice tower. A phone (showing Darebni AI, an app Appify built)
// rides it, fires three thrusters near the top, launches through billowing smoke and flies to the camera.
// Everything is a pure function of the frame, so parallel rendering is safe.
import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { interpolate, random, Easing } from "remotion";
import { RIDE, IGNITE, LAUNCH, CLOSE } from "./timing.js";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const smooth = (a, b, f) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ── the track: straight along the ground toward the tower, a quarter circle up, then a vertical run ─────────────
const Y0 = 0.35, R = 5.2, LS = 7, LV = 4.5, HALF = 0.62;
const LA = (R * Math.PI) / 2, L = LS + LA + LV;
// position, tangent and the surface normal (pointing away from the track) at distance s along it
export function track(s) {
  if (s <= LS) return { p: V(0, Y0, LS - s), t: V(0, 0, -1), n: V(0, 1, 0) };
  if (s <= LS + LA) {
    const a = (s - LS) / R;
    return { p: V(0, Y0 + R - R * Math.cos(a), -R * Math.sin(a)), t: V(0, Math.sin(a), -Math.cos(a)), n: V(0, Math.cos(a), Math.sin(a)) };
  }
  return { p: V(0, Y0 + R + (s - LS - LA), -R), t: V(0, 1, 0), n: V(0, 0, 1) };
}
export const TRACK_LEN = L;

function useNight() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.18;
    scene.background = new THREE.Color("#040309");
    scene.fog = new THREE.Fog("#040309", 14, 42);
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
  }, [gl, scene]);
}

function trackGeometry() {
  // a box-section ribbon: top face, bottom face and two sides, sampled along the path
  const N = 220, T = 0.12, pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const { p, n } = track((i / N) * L);
    for (const [x, d] of [[-HALF, 0], [HALF, 0], [-HALF, -T], [HALF, -T]]) { const q = p.clone().addScaledVector(n, d); pos.push(x, q.y, q.z); }
  }
  for (let i = 0; i < N; i++) {
    const a = i * 4, b = a + 4;
    const quad = (p0, p1, p2, p3) => idx.push(p0, p1, p2, p2, p1, p3);
    quad(a + 0, a + 1, b + 0, b + 1); quad(a + 3, a + 2, b + 3, b + 2); quad(a + 2, a + 0, b + 2, b + 0); quad(a + 1, a + 3, b + 1, b + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const railCurve = (x) => new THREE.CatmullRomCurve3(Array.from({ length: 120 }, (_, i) => { const { p, n } = track((i / 119) * L); return V(x, p.y + n.y * 0.03, p.z + n.z * 0.03); }));

function Track() {
  const geo = useMemo(trackGeometry, []);
  const rails = useMemo(() => [-HALF - 0.02, HALF + 0.02].map((x) => railCurve(x)), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7d818c", metalness: 0.85, roughness: 0.38 }), []);
  const deck = useMemo(() => new THREE.MeshStandardMaterial({ color: "#6a6e78", metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide }), []);
  // the lattice: columns under the curve, and a four-post tower behind the vertical run, braced every metre
  const beams = useMemo(() => {
    const out = [];
    const beam = (a, b, w = 0.07) => out.push({ a, b, w });
    for (let k = 1; k <= 6; k++) { const { p } = track(LS + (k / 7) * LA); for (const x of [-0.72, 0.72]) beam(V(x, 0, p.z), V(x, p.y - 0.1, p.z), 0.08); beam(V(-0.72, p.y - 0.4, p.z), V(0.72, p.y - 0.4, p.z), 0.05); }
    for (let z = 1; z < LS; z += 1.75) for (const x of [-0.6, 0.6]) beam(V(x, 0, z), V(x, Y0 - 0.12, z), 0.06);
    const top = Y0 + R + LV, zs = [-R - 0.35, -R - 1.4];
    for (const x of [-0.8, 0.8]) for (const z of zs) beam(V(x, 0, z), V(x, top + 0.3, z), 0.1);
    for (let y = 0.8; y < top; y += 1.0) {
      for (const z of zs) beam(V(-0.8, y, z), V(0.8, y, z), 0.05);
      for (const x of [-0.8, 0.8]) { beam(V(x, y, zs[0]), V(x, y, zs[1]), 0.05); beam(V(x, y, zs[0]), V(x, y + 1, zs[1]), 0.035); }
      beam(V(-0.8, y, zs[1]), V(0.8, y + 1, zs[1]), 0.035);
    }
    return out;
  }, []);
  return (
    <group>
      <mesh geometry={geo} material={deck} />
      {rails.map((c, k) => (
        <group key={k}>
          <mesh><tubeGeometry args={[c, 400, 0.028, 8, false]} /><meshStandardMaterial color="#ff3b6b" emissive="#ff2d6f" emissiveIntensity={4} toneMapped={false} /></mesh>
          <mesh><tubeGeometry args={[c, 400, 0.11, 8, false]} /><meshBasicMaterial color="#ff2d6f" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
        </group>
      ))}
      {beams.map(({ a, b, w }, i) => {
        const mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b);
        const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
        return <mesh key={i} position={mid} quaternion={q} material={steel}><boxGeometry args={[w, len, w]} /></mesh>;
      })}
      {/* the rail lights spill pink onto the deck and the ground */}
      {[0.15, 0.45, 0.62, 0.78, 0.92].map((u, k) => { const { p, n } = track(u * L); return <pointLight key={k} position={[0, p.y + n.y * 0.8, p.z + n.z * 0.8]} color="#ff2d6f" intensity={2.2} distance={5} decay={1.8} />; })}
    </group>
  );
}

// ── the phone and its thrusters ───────────────────────────────────────────────────────────────────────────────
const PW = 0.9, PH = PW * 2.05, PD = 0.075;
// the screen image is loaded before the canvas mounts (see Main.jsx), so the first draw already has it
function useScreen(img) {
  return useMemo(() => { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; return t; }, [img]);
}

// where the phone is, how it's turned, and how hard the thrusters burn, at frame f
export function phoneAt(f, cam) {
  const ride = interpolate(f, [RIDE, LAUNCH], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.9, 0.45) });
  const s = 0.8 + ride * (L - 0.8 - PH / 2);
  const on = track(s);
  const basis = (t, n) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(1, 0, 0), t, n));
  const lift = 0.06 + PD / 2;
  if (f <= LAUNCH) return { p: on.p.clone().addScaledVector(on.n, lift), q: basis(on.t, on.n), thrust: interpolate(f, [IGNITE, IGNITE + 6], [0, 1], clamp), up: on.t };
  // after launch: up and over to the camera, turning its screen to face it
  const A = track(L - PH / 2).p.clone().addScaledVector(V(0, 0, 1), lift);
  const B = cam.pos.clone().addScaledVector(cam.dir, 3.6).add(V(0, 0.22, 0));
  const u = smooth(LAUNCH, CLOSE, f);
  const c1 = A.clone().add(V(0, 4.5, 0)), c2 = B.clone().add(V(0, 1.6, -1.2));
  const p = new THREE.CubicBezierCurve3(A, c1, c2, B).getPoint(u);
  const qA = basis(V(0, 1, 0), V(0, 0, 1));
  const fz = cam.pos.clone().sub(B).normalize(), fx = V(0, 1, 0).cross(fz).normalize(), fy = fz.clone().cross(fx);
  const face = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(fx, fy, fz));   // screen to the camera
  const q = qA.clone().slerp(face, u);
  const bob = f > CLOSE ? Math.sin((f - CLOSE) / 9) * 0.03 : 0;
  p.y += bob;
  const thrust = interpolate(f, [LAUNCH, CLOSE - 30, CLOSE], [1, 0.8, 0.25], clamp);
  return { p, q, thrust, up: V(0, 1, 0).applyQuaternion(q) };
}
const NOZZLES = [-0.22, 0, 0.22];

function Phone({ f, cam, img }) {
  const screen = useScreen(img);
  const body = useMemo(() => new RoundedBoxGeometry(PW, PH, PD, 6, 0.09), []);
  const { p, q, thrust } = phoneAt(f, cam);
  const flick = (k) => 0.85 + 0.3 * random(`fl${k}-${f}`);
  return (
    <group position={p} quaternion={q}>
      <mesh geometry={body}><meshStandardMaterial color="#121218" metalness={0.9} roughness={0.25} /></mesh>
      {/* titanium edge */}
      <mesh scale={[1.015, 1.008, 0.6]} geometry={body}><meshStandardMaterial color="#8d8f99" metalness={1} roughness={0.2} /></mesh>
      <mesh position={[0, 0, PD / 2 + 0.002]}><planeGeometry args={[PW - 0.06, PH - 0.06]} /><meshBasicMaterial map={screen} toneMapped={false} /></mesh>
      {/* three thrusters on the back, at the bottom, firing down the phone's length */}
      {NOZZLES.map((x, k) => (
        <group key={k} position={[x, -PH / 2 + 0.05, -PD / 2 - 0.05]}>
          <mesh rotation={[0, 0, 0]}><cylinderGeometry args={[0.05, 0.075, 0.14, 16, 1, true]} /><meshStandardMaterial color="#555864" metalness={1} roughness={0.3} side={THREE.DoubleSide} /></mesh>
          {thrust > 0.01 && <>
            <mesh position={[0, -0.07 - 0.35 * thrust * flick(k), 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.065, 0.7 * thrust * flick(k), 16, 1, true]} /><meshBasicMaterial color="#ffd7a0" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, -0.07 - 0.55 * thrust * flick(k + 3), 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.11, 1.1 * thrust * flick(k + 3), 16, 1, true]} /><meshBasicMaterial color="#ff7a2a" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>
          </>}
        </group>
      ))}
      {thrust > 0.01 && <pointLight position={[0, -PH / 2 - 0.5, -0.1]} color="#ff8a3c" intensity={40 * thrust} distance={9} decay={1.5} />}
    </group>
  );
}

// ── smoke: soft sprites born at the nozzles, pushed back down the track, then billowing out and up ───────────────
function useSoftTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.45, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
}
const PUFFS = 420, LIFE = 120;
function Smoke({ f, cam }) {
  const tex = useSoftTexture();
  const sprites = useMemo(() => Array.from({ length: PUFFS }, () => new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }))), [tex]);
  const group = useMemo(() => { const g = new THREE.Group(); sprites.forEach((s) => g.add(s)); return g; }, [sprites]);
  useLayoutEffect(() => {
    sprites.forEach((s, i) => {
      const born = IGNITE + i * 0.42;                      // ~2.4 puffs a frame for about 6 s
      const age = f - born;
      if (age < 0 || age > LIFE) { s.visible = false; return; }
      s.visible = true;
      const src = phoneAt(born, cam);
      const nozzle = src.p.clone().addScaledVector(src.up, -PH / 2 - 0.25);
      const r = (k) => random(`s${i}-${k}`) * 2 - 1;
      // exhaust goes back along the phone, slows down, spreads, and the warm cloud rises
      const push = 3.2 * src.thrust * (1 - Math.exp(-age / 14));
      const pos = nozzle.clone().addScaledVector(src.up, -push);
      pos.x += r(1) * (0.15 + age * 0.03); pos.z += r(2) * (0.15 + age * 0.025);
      pos.y += age * 0.012 + r(3) * 0.1;
      if (pos.y < 0.25) { const over = 0.25 - pos.y; pos.y = 0.25 + over * 0.2; pos.x += r(4) * over * 1.6; pos.z += Math.abs(r(5)) * over * 0.8; }   // it spreads along the ground
      s.position.copy(pos);
      const size = 0.35 + age * 0.03 + Math.abs(r(6)) * 0.4;
      s.scale.set(size, size, 1);
      s.material.rotation = r(7) * 3;
      const fade = interpolate(age, [0, 6, LIFE * 0.55, LIFE], [0, 0.55, 0.42, 0], clamp);
      s.material.opacity = fade * (0.6 + 0.4 * Math.abs(r(8)));
      // fresh smoke glows warm from the flame, older smoke cools to grey, a hint of the rail pink near the track
      const warm = Math.exp(-age / 10);
      s.material.color.setRGB(0.62 + 0.38 * warm, 0.6 + 0.2 * warm, 0.64 - 0.1 * warm);
    });
  }, [f, sprites, cam]);
  return <primitive object={group} />;
}

// ── camera: low and wide behind the start, panning with the phone as it climbs, then up to meet it ────────────
const LOOK0 = V(0, 3.2, -1);
const K0 = V(5.5, 1.2, 15), K1 = V(7.5, 2.2, 9), K2 = V(4.5, 9.6, 7.8), LOOK2 = V(0, 11.6, -1.2);
const lookAtLaunch = () => LOOK0.clone().lerp(phoneAt(LAUNCH, null).p, 0.45);
export function cameraAt(f) {
  const a = smooth(0, LAUNCH, f), b = smooth(LAUNCH - 6, CLOSE, f);
  const pos = K0.clone().lerp(K1, a).lerp(K2, b);
  const follow = f <= LAUNCH ? LOOK0.clone().lerp(phoneAt(f, null).p, interpolate(f, [0, LAUNCH], [0.72, 0.45], clamp)) : lookAtLaunch();
  const look = follow.lerp(LOOK2, b);
  // a little handheld drift
  pos.x += Math.sin(f / 23) * 0.05; pos.y += Math.cos(f / 29) * 0.04;
  return { pos, look, dir: look.clone().sub(pos).normalize() };
}

export function World({ f, img, shake = [0, 0] }) {
  useNight();
  const { camera } = useThree();
  const cam = cameraAt(f);
  useLayoutEffect(() => {
    camera.position.copy(cam.pos).add(V(shake[0] * 0.01, shake[1] * 0.01, 0));
    camera.lookAt(cam.look); camera.updateProjectionMatrix();
  });
  return (
    <>
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#3a3550", "#050308", 0.35]} />
      <directionalLight position={[8, 12, 10]} intensity={0.9} color="#d9dcff" />
      <spotLight position={[4, 16, 6]} target-position={[0, 6, -4]} angle={0.5} penumbra={0.8} intensity={60} distance={40} color="#e8e6ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}><planeGeometry args={[120, 120]} /><meshStandardMaterial color="#0c0b12" roughness={0.55} metalness={0.25} /></mesh>
      <Track />
      <Phone f={f} cam={cam} img={img} />
      <Smoke f={f} cam={cam} />
    </>
  );
}
