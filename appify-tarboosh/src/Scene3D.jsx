// The 3D product: a golden biscuit base, a marshmallow dome, a milk-chocolate shell (one smooth mesh until it cracks,
// then a set of brick-pattern shards) and a crinkled red foil wrapper split into petals that fold open from the base.
// Everything is a pure function of the product time `p` (see pt() in timing.js), so slow motion and the rewind are free.
import { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { random, interpolate, Easing } from "remotion";
import { PEEL0, PEEL_GAP, PEEL_LEN, PETALS, GLINT, CRACK, BURST, SHOULD, FPS } from "./timing.js";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const HALF = Math.PI / 2;
const Y0 = 0.17;                                   // where the dome meets the biscuit
const dome = (R, Hd, n = 44, skirt = []) => [
  ...skirt.map(([r, y]) => new THREE.Vector2(r, y)),
  ...Array.from({ length: n + 1 }, (_, i) => { const a = (HALF * i) / n; return new THREE.Vector2(Math.max(1e-4, R * Math.cos(a)), Y0 + Hd * Math.sin(a)); }),
];
const CHOC = { R: 1.0, H: 1.02 };
const CHOC_PROFILE = dome(CHOC.R, CHOC.H, 44, [[0.0001, 0.12], [0.97, 0.12], [0.995, 0.15]]);
const MALLOW_PROFILE = dome(0.95, 0.96, 44, [[0.0001, Y0], [0.95, Y0 - 0.001]]);
const BISCUIT_PROFILE = [[0.0001, -0.02], [0.92, -0.02], [0.975, 0.0], [1.0, 0.05], [1.0, 0.12], [0.98, 0.17], [0.0001, 0.17]].map(([r, y]) => new THREE.Vector2(r, y));
const FOIL_PROFILE = dome(1.07, 1.1, 46, [[0.62, -0.05], [0.95, -0.045], [1.055, -0.025], [1.075, 0.04], [1.075, 0.12]]);
const FOIL_HINGE = { r: 1.07, y: -0.03 };

// tiny deterministic hash for vertex jitter
const hash = (a, b) => random(`h${a}_${b}`);
function noiseTex(size, draw) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"); draw(g, size);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}
function speckle(g, s, base, dots, n, rMax, seed) {
  g.fillStyle = base; g.fillRect(0, 0, s, s);
  for (let i = 0; i < n; i++) {
    g.fillStyle = dots[Math.floor(random(`${seed}c${i}`) * dots.length)];
    g.globalAlpha = 0.25 + random(`${seed}a${i}`) * 0.6;
    g.beginPath(); g.arc(random(`${seed}x${i}`) * s, random(`${seed}y${i}`) * s, 0.5 + random(`${seed}r${i}`) * rMax, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

// ── the foil: printed red metallic, crinkled harder toward the gathered top ───────────────────────────
function useFoilTexture() {
  return useMemo(() => {
    const W = 2048, H = 1024, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#E0283A"); gr.addColorStop(1, "#B10F22");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // print: a gold band, the name three times around, thin pinstripes
    const vy = (v) => H * (1 - v);
    g.fillStyle = "#F2C14E"; g.fillRect(0, vy(0.16), W, 10); g.fillRect(0, vy(0.47), W, 8);
    g.fillStyle = "rgba(255,255,255,.08)"; for (let x = 0; x < W; x += 28) g.fillRect(x, 0, 3, H);
    g.font = "600 104px Display"; g.textAlign = "center"; g.textBaseline = "middle";
    for (let k = 0; k < 3; k++) for (const dx of [-W, 0, W]) {
      const x = (k / 3) * W + dx;
      g.fillStyle = "#FFFFFF"; g.fillText("TARBOOSH", x, vy(0.31));
      g.fillStyle = "#F2C14E"; g.font = "600 34px Mono"; g.fillText("CHOCOLATE · MARSHMALLOW", x, vy(0.215)); g.font = "600 104px Display";
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, []);
}
// one geometry per petal, crinkled with a noise that matches across petal seams, UVs remapped to the full wrap
function useFoilPetals() {
  return useMemo(() => {
    const SEG = 18, TOTAL = SEG * PETALS, n = FOIL_PROFILE.length;
    return Array.from({ length: PETALS }, (_, i) => {
      const phiLen = (Math.PI * 2) / PETALS, phi0 = i * phiLen;
      const g = new THREE.LatheGeometry(FOIL_PROFILE, SEG, phi0, phiLen);
      const pos = g.attributes.position, uv = g.attributes.uv;
      for (let k = 0; k < pos.count; k++) {
        const seg = Math.floor(k / n), row = k % n;          // lathe vertex order: phi-major
        const j = (i * SEG + seg) % TOTAL, h = row / (n - 1);
        const amp = 0.006 + 0.05 * Math.pow(h, 3.2) + 0.012 * (row < 6 ? 1 : 0);
        const d = (hash(j, row) - 0.5) * 0.8 * amp + (Math.sin(j * 0.9 + row * 0.45) + Math.sin(j * 0.37 - row * 0.8 + 1.3)) * amp * 0.7;
        const x = pos.getX(k), z = pos.getZ(k), r = Math.hypot(x, z);
        if (r > 1e-3) { pos.setX(k, x * (1 + d / r)); pos.setZ(k, z * (1 + d / r)); }
        pos.setY(k, pos.getY(k) + (hash(row, j) - 0.5) * amp * 0.6);
        uv.setX(k, (phi0 + uv.getX(k) * phiLen) / (Math.PI * 2));
      }
      g.computeVertexNormals();
      return { g, phiC: phi0 + phiLen / 2 };
    });
  }, []);
}
// peel order: back petals first, the one facing the camera last (the reveal)
const ORDER = (() => {
  const idx = Array.from({ length: PETALS }, (_, i) => i);
  const facing = (i) => Math.cos(((i + 0.5) / PETALS) * Math.PI * 2);
  return idx.sort((a, b) => facing(a) - facing(b));
})();
const peelStart = (i) => PEEL0 + ORDER.indexOf(i) * PEEL_GAP;
export const peelAt = (p, i) => interpolate(p, [peelStart(i), peelStart(i) + PEEL_LEN], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
// each petal folds open from the base, then tears off and tumbles away out of frame
function Foil({ p, map, petals }) {
  const q = useMemo(() => new THREE.Quaternion(), []);
  return petals.map(({ g, phiC }, i) => {
    const o = peelAt(p, i), fly = Math.max(0, p - peelStart(i) - PEEL_LEN * 0.7);
    if (fly > 50) return null;
    const hx = Math.sin(phiC) * FOIL_HINGE.r, hz = Math.cos(phiC) * FOIL_HINGE.r;
    const axis = new THREE.Vector3(Math.cos(phiC), 0, -Math.sin(phiC));
    const quat = q.clone().setFromAxisAngle(axis, o * 1.3 + fly * (0.07 + random(`fs${i}`) * 0.05));
    const out = fly * (0.07 + random(`fv${i}`) * 0.03), up = fly * 0.035 - 0.0032 * fly * fly;
    return (
      <group key={i} position={[hx + Math.sin(phiC) * out, FOIL_HINGE.y + up, hz + Math.cos(phiC) * out]} quaternion={quat} scale={1 - 0.25 * Math.min(1, fly / 20)}>
        <mesh geometry={g} position={[-hx, -FOIL_HINGE.y, -hz]}>
          <meshStandardMaterial map={map} metalness={0.82} roughness={0.3} flatShading side={THREE.DoubleSide} envMapIntensity={1.3} />
        </mesh>
      </group>
    );
  });
}

// ── the chocolate shell: smooth until the crack, then brick-pattern shards ────────────────────────────
const BANDS = [[0, 0.42, 9], [0.42, 0.82, 8], [0.82, 1.2, 6], [1.2, HALF, 1]];   // [a0, a1, pieces]
const shellPt = (a, r = CHOC.R, h = CHOC.H) => new THREE.Vector2(Math.max(1e-4, r * Math.cos(a)), Y0 + h * Math.sin(a));
function useShards() {
  return useMemo(() => {
    const out = [];
    BANDS.forEach(([a0, a1, n], b) => {
      const pts = Array.from({ length: 9 }, (_, i) => shellPt(a0 + ((a1 - a0) * i) / 8));
      if (b === 0) pts.unshift(new THREE.Vector2(0.97, 0.12), new THREE.Vector2(0.995, 0.15));
      const off = random(`bo${b}`) * Math.PI * 2, len = (Math.PI * 2) / n;
      for (let k = 0; k < n; k++) {
        const jit = n > 1 ? (random(`bj${b}${k}`) - 0.5) * len * 0.6 : 0;
        const phi0 = off + k * len + jit, phiLen = len + (n > 1 ? (random(`bj${b}${(k + 1) % n}`) - 0.5) * len * 0.6 - jit : 0);
        const g = new THREE.LatheGeometry(pts, Math.max(4, Math.round(24 / n)), phi0, phiLen);
        const am = (a0 + a1) / 2, pm = phi0 + phiLen / 2, rr = CHOC.R * Math.cos(am);
        const c = new THREE.Vector3(Math.sin(pm) * rr, Y0 + CHOC.H * Math.sin(am), Math.cos(pm) * rr);
        const dir = c.clone().sub(new THREE.Vector3(0, 0.35, 0)).normalize();
        out.push({ g, c, dir, id: `${b}_${k}`, top: b === 3 });
      }
    });
    return out;
  }, []);
}
// where the crack starts: top, a little toward the camera
const CRACK_O = new THREE.Vector3(0.15, 1.1, 0.5);
function Shell({ p, shards, chocTex }) {
  const whole = useMemo(() => new THREE.LatheGeometry(CHOC_PROFILE, 160), []);
  if (p < CRACK) {
    return (
      <mesh geometry={whole}>
        <meshPhysicalMaterial color="#3A1A0A" roughness={0.36} clearcoat={0.45} clearcoatRoughness={0.25} bumpMap={chocTex} bumpScale={0.5} sheen={0.25} sheenColor="#B0703F" envMapIntensity={0.45} />
      </mesh>
    );
  }
  const t = p - BURST;
  const inner = t < 0 && <mesh key="inner" geometry={whole} scale={0.985}><meshStandardMaterial color="#1E0C04" roughness={0.8} /></mesh>;
  return [inner, ...shards.map((s) => {
    const r = (k) => random(`${s.id}${k}`);
    const dist = s.c.distanceTo(CRACK_O);
    const seam = interpolate(p - CRACK - dist * 3.2, [0, 2], [0, 1], clamp);       // the crack runs across the dome
    const tremble = t < 0 ? (r("tr") - 0.5) * 0.004 * Math.sin(p * 3.1 + r("ph") * 6) : 0;
    let d = 0.005 * seam + tremble, rx = 0, ry = 0, rz = 0, up = 0;
    if (t >= 0) {
      const v = (s.top ? 0.11 : 0.06 + r("v") * 0.07);
      d += v * t;
      up = (s.top ? 0.035 : 0.012) * t - 0.0009 * t * t;
      rx = (r("rx") - 0.5) * 0.16 * t; ry = (r("ry") - 0.5) * 0.12 * t; rz = (r("rz") - 0.5) * 0.16 * t;
    }
    const pos = s.c.clone().addScaledVector(s.dir, d); pos.y += up;
    return (
      <group key={s.id} position={pos} rotation={[rx, ry, rz]}>
        <group position={[-s.c.x, -s.c.y, -s.c.z]}>
          <mesh geometry={s.g}><meshPhysicalMaterial color="#3A1A0A" roughness={0.36} clearcoat={0.45} clearcoatRoughness={0.25} bumpMap={chocTex} bumpScale={0.5} envMapIntensity={0.45} /></mesh>
          <mesh geometry={s.g} scale={0.955}><meshStandardMaterial color="#5C3015" roughness={0.7} side={THREE.BackSide} /></mesh>
        </group>
      </group>
    );
  })];
}
// chocolate crumbs from the burst
function Crumbs({ p }) {
  const ref = useRef();
  const m = useMemo(() => new THREE.Object3D(), []);
  const N = 140;
  useLayoutEffect(() => {
    const t = p - BURST;
    let n = 0;
    if (t >= 0) for (let i = 0; i < N; i++) {
      const r = (k) => random(`cr${k}${i}`);
      const th = r("a") * Math.PI * 2, ph = Math.acos(1 - r("b") * 1.4);
      const dir = [Math.sin(ph) * Math.cos(th), Math.cos(ph) * 0.9, Math.sin(ph) * Math.sin(th)];
      const v = 0.04 + r("v") * 0.12, o = [dir[0] * 0.8, 0.5 + dir[1] * 0.8, dir[2] * 0.8];
      m.position.set(o[0] + dir[0] * v * t, o[1] + dir[1] * v * t - 0.0012 * t * t, o[2] + dir[2] * v * t);
      m.rotation.set(r("x") * 6 + t * 0.2, r("y") * 6 + t * 0.15, 0);
      m.scale.setScalar(0.018 + r("s") * 0.04); m.updateMatrix();
      ref.current.setMatrixAt(n++, m.matrix);
    }
    ref.current.count = n; ref.current.instanceMatrix.needsUpdate = true;
  }, [p]);
  return <instancedMesh ref={ref} args={[null, null, N]} frustumCulled={false}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#4A220F" roughness={0.45} flatShading /></instancedMesh>;
}

// the marshmallow: compressed by the shell at the crack, then it puffs up and jiggles in slow motion
export function mallowSquash(p) {
  if (p < CRACK) return 0;
  if (p < BURST) return -0.025 * interpolate(p, [CRACK, CRACK + 3], [0, 1], clamp);
  const t = p - BURST;
  return 0.16 * Math.exp(-t / 9) * Math.sin(t / 1.5 + 0.2) + 0.03 * Math.exp(-t / 14);
}
function Mallow({ p, foamTex }) {
  const geo = useMemo(() => new THREE.LatheGeometry(MALLOW_PROFILE, 140).translate(0, -Y0, 0), []);   // pivot on the base
  const s = mallowSquash(p);
  return (
    <mesh geometry={geo} position={[0, Y0, 0]} scale={[1 - s * 0.5, 1 + s, 1 - s * 0.5]}>
      <meshPhysicalMaterial color="#D2BCA2" roughness={0.85} sheen={0.6} sheenColor="#FFF4E6" sheenRoughness={0.8} bumpMap={foamTex} bumpScale={2.4} emissive="#FFE2C6" emissiveIntensity={0.015} />
    </mesh>
  );
}

function Biscuit({ crumbTex }) {
  const geo = useMemo(() => new THREE.LatheGeometry(BISCUIT_PROFILE, 120), []);
  return <mesh geometry={geo}><meshStandardMaterial color="#D39A55" map={crumbTex} roughness={0.85} bumpMap={crumbTex} bumpScale={2} /></mesh>;
}

function Env() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.6;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0;
    return () => pm.dispose();
  }, [gl, scene]);
  return null;
}

// camera distance / height as a function of product time (so the rewind flies the camera back too)
const camAt = (p) => ({
  d: interpolate(p, [0, 40, 112, 160, 166, 169, BURST, BURST + 24], [9.4, 10.2, 10.8, 8.9, 8.7, 7.9, 7.7, 9.4], clamp),
  y: interpolate(p, [0, 112, 166, 169, BURST + 24], [2.4, 3.0, 2.2, 1.9, 2.4], clamp),
  t: interpolate(p, [0, 112, 160, 169, BURST + 24], [1.15, 1.05, 0.75, 0.62, 0.75], clamp),   // look-at height
});
// zoom < 1 brings the camera closer (the landscape window in the Day-series cut); look overrides the look-at height
export function World({ f, p, shake = [0, 0], zoom = 1, look = null }) {
  const { camera } = useThree();
  const end = f >= SHOULD ? 1 : 0;
  const whip = end ? interpolate(f - SHOULD, [0, 16], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.9, 0.3, 1) }) : 0;
  const c = camAt(p);
  const d = (end ? 10.6 - (f - SHOULD) * 0.008 : c.d) * zoom, cy = (end ? 2.6 : c.y) * zoom;
  const orbit = end ? Math.sin((f - SHOULD) / 60) * 0.12 : 0;
  useLayoutEffect(() => {
    camera.position.set(Math.sin(orbit) * d + shake[0] * 0.003, cy + shake[1] * 0.003, Math.cos(orbit) * d);
    camera.lookAt(0, look ?? (end ? 0.95 : c.t), 0); camera.updateProjectionMatrix();
  }, [f]);
  const foilMap = useFoilTexture(), petals = useFoilPetals(), shards = useShards();
  const chocTex = useMemo(() => noiseTex(512, (g, s) => speckle(g, s, "#808080", ["#707070", "#909090"], 3000, 2.2, "ch")), []);
  const foamTex = useMemo(() => { const t = noiseTex(512, (g, s) => speckle(g, s, "#B0B0B0", ["#8A8A8A", "#D0D0D0", "#606060"], 7000, 3.5, "fo")); t.repeat.set(3, 2); return t; }, []);
  const crumbTex = useMemo(() => noiseTex(512, (g, s) => speckle(g, s, "#E2B474", ["#B97A3A", "#F2CC8E", "#A0662E"], 6000, 3, "bi")), []);
  // the product spins slowly with product time; a fast whip on "Your ads should."
  const yaw = -0.35 + p * 0.006 + whip * Math.PI * 2;
  const glint = interpolate(p, [GLINT, GLINT + 34], [-1, 1], clamp);
  const rimCol = end ? "#8F72FF" : "#FF3347";
  return (
    <>
      <Env />
      <ambientLight intensity={0.08} />
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#FFE6CC" />
      <directionalLight position={[4.5, 3, -5]} intensity={4.2} color={rimCol} />
      <directionalLight position={[-5, 1, -4]} intensity={2.2} color={end ? "#74C6FF" : "#FF8A3D"} />
      <directionalLight position={[3, -1, 4]} intensity={0.5} color="#8F72FF" />
      {p > GLINT - 2 && p < GLINT + 40 && <pointLight position={[glint * 3.2, 2.2, 2.6]} intensity={28 * Math.sin(((glint + 1) / 2) * Math.PI)} distance={8} color="#FFF1DE" />}
      {p >= BURST && p < BURST + 30 && <pointLight position={[0, 0.8, 1.8]} intensity={6 * Math.exp(-(p - BURST) / 6)} distance={5} color="#FFD9A8" />}
      <group rotation={[0, yaw, 0]} position={[0, end ? -0.15 : 0, 0]}>
        <Biscuit crumbTex={crumbTex} />
        <Mallow p={p} foamTex={foamTex} />
        <Shell p={p} shards={shards} chocTex={chocTex} />
        <Crumbs p={p} />
        <Foil p={p} map={foilMap} petals={petals} />
      </group>
    </>
  );
}
