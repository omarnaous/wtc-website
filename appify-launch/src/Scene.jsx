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
import { RIDE, IGNITE, LAUNCH, HOVER, CLOSE, DURATION } from "./timing.js";

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

// the landing spot, clear of the track, and where the camera ends up looking at it
export const PAD = V(6, 0, 2.2);
const REST = PH / 2 + 0.01;
export const CAM_END = V(6.85, 0.98, 7.12);
// where the phone is, how it's turned, and how hard the thrusters burn, at frame f
export function phoneAt(f) {
  const ride = interpolate(f, [RIDE, LAUNCH], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 0.9, 0.45) });
  const s = 0.8 + ride * (L - 0.8 - PH / 2);
  const on = track(s);
  const basis = (t, n) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(1, 0, 0), t, n));
  const lift = 0.06 + PD / 2;
  if (f <= LAUNCH) return { p: on.p.clone().addScaledVector(on.n, lift), q: basis(on.t, on.n), thrust: interpolate(f, [IGNITE, IGNITE + 6], [0, 1], clamp), up: on.t };
  // after launch: up off the track, across to the landing spot, then straight down on the thrusters
  const A = track(L - PH / 2).p.clone().addScaledVector(V(0, 0, 1), lift);
  const H = PAD.clone().add(V(0, 6.2, 0)), G = PAD.clone().add(V(0, REST, 0));
  let p;
  if (f <= HOVER) p = new THREE.CubicBezierCurve3(A, A.clone().add(V(0, 3.2, 0.6)), H.clone().add(V(-2.2, 1.4, -1.6)), H).getPoint(smooth(LAUNCH, HOVER, f));
  else p = H.clone().lerp(G, interpolate(f, [HOVER, CLOSE], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0.35, 0.25, 1) }));
  if (f > CLOSE) p.y -= 0.035 * Math.exp(-(f - CLOSE) / 4) * Math.sin((f - CLOSE) / 1.3);     // settles on its base
  // upright, screen turned to where the camera ends up, banking into the turn and swaying as the burn holds it
  const fly = interpolate(f, [LAUNCH, HOVER], [0, 1], clamp);
  const turn = interpolate(f, [LAUNCH, HOVER + 20], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const yaw = Math.atan2(CAM_END.x - PAD.x, CAM_END.z - PAD.z) * turn;
  const sway = f < CLOSE ? interpolate(f, [HOVER, CLOSE], [1, 0], clamp) : 0;
  const bank = -0.32 * Math.sin(Math.PI * fly) + 0.05 * Math.sin(f / 6) * sway;
  const pitch = 0.12 * Math.sin(Math.PI * fly) + 0.03 * Math.cos(f / 7) * sway;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, bank, "YXZ"));
  const thrust = interpolate(f, [LAUNCH, HOVER, CLOSE - 3, CLOSE + 4], [1, 0.95, 0.85, 0], clamp);
  return { p, q, thrust, up: V(0, 1, 0).applyQuaternion(q) };
}
const NOZZLES = [-0.22, 0, 0.22];

function Phone({ f, img }) {
  const screen = useScreen(img);
  const body = useMemo(() => new RoundedBoxGeometry(PW, PH, PD, 6, 0.09), []);
  const { p, q, thrust } = phoneAt(f);
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
const PUFFS = 820, RATE = 0.17;                         // ~6 puffs a frame from ignition to touchdown
const GROUND = 0.12;
const CAM_YAW = Math.atan2(CAM_END.x - PAD.x, CAM_END.z - PAD.z);   // direction from the pad to the camera
// a third of the ground smoke rolls toward the camera (kept low), the rest out to the sides and behind
const groundAngle = (i) => { const k = random(`b${i}`); return CAM_YAW + (random(`a${i}`) < 0.5 ? -1 : 1) * (k < 0.33 ? (k / 0.33) * Math.PI / 2 : Math.PI / 2 + ((k - 0.33) / 0.67) * Math.PI * 0.55); };
const toCamOf = (i) => Math.max(0, Math.cos(groundAngle(i) - CAM_YAW));
function Smoke({ f }) {
  const tex = useSoftTexture();
  const sprites = useMemo(() => Array.from({ length: PUFFS }, () => new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }))), [tex]);
  const group = useMemo(() => { const g = new THREE.Group(); sprites.forEach((s) => g.add(s)); return g; }, [sprites]);
  // updated during render, not in an effect, so the frame that gets drawn always has this frame's smoke
  {
    sprites.forEach((s, i) => {
      const born = IGNITE + i * RATE;
      const age = f - born;
      const src = phoneAt(born);
      if (age < 0 || src.thrust < 0.05) { s.visible = false; return; }
      s.visible = true;
      const r = (k) => random(`s${i}-${k}`) * 2 - 1;
      const nozzle = src.p.clone().addScaledVector(src.up, -PH / 2 - 0.1);
      // the jet carries it down the phone's axis, slowing; what would go below the ground spreads out along it
      const reach = (4.5 + 1.5 * r(1)) * src.thrust * (1 - Math.exp(-age / 9));
      const pos = nozzle.clone().addScaledVector(src.up, -reach);
      const jet = Math.min(1, age / 30);
      pos.x += r(2) * (0.06 + jet * 0.35 + age * 0.004); pos.z += r(3) * (0.06 + jet * 0.35 + age * 0.004);
      let ground = 0;
      if (pos.y < GROUND) {
        // it hits the ground and rolls out to the sides and back; very little comes toward the camera
        ground = GROUND - pos.y;
        const a = groundAngle(i), toCam = toCamOf(i);
        const spread = Math.min(ground * 1.25, 3.2) * (1 - 0.3 * toCam) + age * 0.006;
        const mound = Math.max(0, 1 - spread / 3.6) * (1 - 0.8 * toCam);   // piled up beside and behind it, hugging the ground in front
        pos.set(nozzle.x + Math.sin(a) * spread, GROUND + Math.abs(r(5)) * (0.08 + 0.6 * mound) + Math.min(age, 120) * 0.002, nozzle.z + Math.cos(a) * spread);
      } else pos.y += age * 0.006;
      s.position.copy(pos);
      const size = ground > 0 ? (0.6 + Math.min(age, 120) * 0.006 + Math.abs(r(6)) * 0.7) * (1 - 0.35 * toCamOf(i)) : 0.22 + Math.min(age, 60) * 0.012 + Math.abs(r(6)) * 0.3;
      s.scale.set(size, size * (ground > 0 ? 0.75 : 1), 1);
      s.material.rotation = r(7) * 3 + age * 0.004 * r(9);
      // air smoke thins out; smoke on the ground lingers to the end
      const life = ground > 0 ? interpolate(age, [0, 5, 160, 300], [0, 0.34, 0.26, 0.16], clamp) : interpolate(age, [0, 4, 30, 80], [0, 0.5, 0.3, 0], clamp);
      s.material.opacity = life * (0.55 + 0.45 * Math.abs(r(8))) * (ground > 0 ? 1 - 0.4 * toCamOf(i) : 1);
      const warm = Math.exp(-age / 7);                     // fresh smoke glows from the flame, then cools to white-grey
      const g = (ground > 0 ? 0.5 : 0.72) + 0.16 * r(10);
      s.material.color.setRGB(g + (1 - g) * warm, g - 0.02 + 0.12 * warm, g + 0.02 - 0.2 * warm);
    });
  }
  return <primitive object={group} />;
}

// ── camera: low and wide behind the start, panning with the phone as it climbs, following it across, then down
// to ground level for the landing, easing in on it ───────────────────────────────────────────────────────────
const LOOK0 = V(0, 3.2, -1);
const K0 = V(5.5, 1.2, 15), K1 = V(7.5, 2.2, 9), K2 = V(8.2, 3.2, 10.5);
const lookAtLaunch = () => LOOK0.clone().lerp(phoneAt(LAUNCH).p, 0.45);
export function cameraAt(f) {
  const a = smooth(0, LAUNCH, f), b = smooth(LAUNCH - 6, HOVER, f), c = smooth(HOVER - 10, CLOSE + 6, f);
  const pos = K0.clone().lerp(K1, a).lerp(K2, b).lerp(CAM_END, c);
  pos.lerp(CAM_END.clone().add(V(-0.06, 0, -0.35)), interpolate(f, [CLOSE, DURATION], [0, 1], clamp));   // slow push-in on the landed phone
  let look;
  if (f <= LAUNCH) look = LOOK0.clone().lerp(phoneAt(f).p, interpolate(f, [0, LAUNCH], [0.72, 0.45], clamp));
  else {
    const chase = phoneAt(f - 3).p.add(V(0, 0.15, 0));   // a beat behind the phone, like an operator
    look = lookAtLaunch().lerp(chase, smooth(LAUNCH, LAUNCH + 22, f));
    look.lerp(PAD.clone().add(V(0, REST + 0.39, 0)), smooth(CLOSE - 24, CLOSE + 10, f));
  }
  pos.x += Math.sin(f / 23) * 0.05; pos.y += Math.cos(f / 29) * 0.03;
  return { pos, look, dir: look.clone().sub(pos).normalize() };
}

// dark asphalt: a speckled grain texture, rough, catching the flame light at the landing spot
function Ground() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const g = c.getContext("2d"); g.fillStyle = "#3a3a40"; g.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 26000; k++) {
      const v = 30 + Math.floor(random(`g${k}`) * 70);
      g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(random(`gx${k}`) * 512, random(`gy${k}`) * 512, 1 + random(`gs${k}`) * 2, 1 + random(`gt${k}`) * 2);
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, []);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}><planeGeometry args={[120, 120]} /><meshStandardMaterial map={tex} color="#2a2a33" roughness={0.9} metalness={0.05} /></mesh>;
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
      <Ground />
      <Track />
      <Phone f={f} img={img} />
      <Smoke f={f} />
    </>
  );
}
