// The 3D shot: a latex balloon (lathe-modelled, clearcoat, studio reflections) with the appify logo printed on it,
// a chrome needle, a string, then 3D confetti that catches the light, latex shreds, and the extruded appify logo
// whose i-dot is a gold spark that falls into place.
import { useLayoutEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { random, spring, interpolate, Easing } from "remotion";
import { FPS, PUMPS, POP, LINE1, END, LAND, KNOT, S0, S1, NEEDLE0 } from "./timing.js";
import { WORDMARK, WSPARK, sparkPath } from "./brand.js";

export const PXU = 398;                                   // stage px per world unit (camera z 9, fov 30, 1920 px tall)
export const toWorld = (x, y) => [(x - 540) / PXU, (960 - y) / PXU];
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const UV = new THREE.Color("#5B2BFF"), IRIS = new THREE.Color("#8F72FF");

// balloon profile (radius, y) from the knot to the crown; max radius ~1
const PROFILE = (() => {
  const pts = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI;
    const ss = (x, e0, e1) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    const r = Math.sin(a) * (0.8 + 0.2 * ss(a, 0, 1.3)) + (i === 0 ? 0.05 : 0);
    const y = -Math.cos(a) * 1.1 - 0.12 * (1 - ss(a, 0, 0.9));
    pts.push(new THREE.Vector2(Math.max(0.0001, r), y));
  }
  return pts;
})();
const Y_MIN = PROFILE[0].y, Y_MAX = PROFILE[PROFILE.length - 1].y;
const STEP = (S1 - S0) / PUMPS.length;
// world scale: the 2D design's width in px (100 * s) over the lathe's diameter
export function scaleAt(f) {
  let s = S0;
  for (const p of PUMPS) if (f >= p) s += STEP * spring({ frame: f - p, fps: FPS, config: { damping: 7, stiffness: 260 } });
  return (100 * s) / PXU / 2;
}
function wobbleAt(f) {
  let w = 0;
  for (const p of PUMPS) if (f >= p) w += Math.exp(-(f - p) / 6) * Math.sin((f - p) / 1.6) * 0.045;
  return w;
}
const KNOT_Y = toWorld(540, KNOT)[1];
const balloonTop = (f) => KNOT_Y + (Y_MAX - Y_MIN) * scaleAt(f);
export const needleTip = (f) => { const y0 = toWorld(540, NEEDLE0)[1], y1 = balloonTop(POP); return y0 + (y1 - y0) * Math.pow(Math.min(1, f / POP), 1.8); };
export const popCentre = () => [0, KNOT_Y + (-Y_MIN + 0.1) * scaleAt(POP), 0];

function useLogoTexture() {
  return useMemo(() => {
    const W = 2048, H = 1024, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, "#4E22F0"); grad.addColorStop(1, "#3412C2");
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    // the wordmark, centred on the front of the balloon (u = 0.5), a little above the equator
    const wmW = 400, s = wmW / 3224;
    g.save(); g.translate(W / 2 - wmW / 2 + 20 * s, H * 0.42 - (1167 * s) / 2 + 917 * s); g.scale(s, s);
    g.fillStyle = "#FFFFFF"; g.fill(new Path2D(WORDMARK.letters));
    g.fillStyle = "#FFD23F"; g.fill(new Path2D(WORDMARK.spark));
    g.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, []);
}

function Env() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.95;
    return () => pm.dispose();
  }, [gl, scene]);
  return null;
}

function Balloon({ f }) {
  const map = useLogoTexture();
  const geo = useMemo(() => new THREE.LatheGeometry(PROFILE, 160, Math.PI), []);
  const s = scaleAt(Math.min(f, POP)), wob = wobbleAt(f), thin = interpolate(s, [scaleAt(0), (100 * S1) / PXU / 2], [0, 1], clamp);
  const trem = f > POP - 26 && f < POP ? (f - (POP - 26)) / 26 : 0;
  const y = KNOT_Y - Y_MIN * s * (1 - wob);
  return (
    <group position={[Math.sin(f * 2.9) * 0.01 * trem, y + Math.cos(f * 3.3) * 0.008 * trem, 0]} rotation={[0.04, Math.sin(f / 40) * 0.12, Math.sin(f / 33) * 0.03]}>
      <mesh geometry={geo} scale={[s * (1 + wob), s * (1 - wob), s * (1 + wob)]}>
        <meshPhysicalMaterial map={map} roughness={0.22 - 0.08 * thin} clearcoat={1} clearcoatRoughness={0.06} sheen={0.25} sheenColor={IRIS} sheenRoughness={0.5}
          emissive={UV} emissiveIntensity={0.04 + 0.1 * thin} />
      </mesh>
      <mesh position={[0, Y_MIN * s * (1 - wob) - 0.03, 0]}>
        <coneGeometry args={[0.06, 0.09, 24]} />
        <meshPhysicalMaterial color="#2A0FA0" roughness={0.35} clearcoat={1} />
      </mesh>
    </group>
  );
}

function StringLine({ f }) {
  const geo = useMemo(() => {
    const sway = Math.sin(f / 14) * 0.1;
    const pts = [new THREE.Vector3(0, KNOT_Y - 0.05, 0), new THREE.Vector3(0.06, KNOT_Y - 0.35, 0.02), new THREE.Vector3(sway - 0.06, KNOT_Y - 0.6, 0), new THREE.Vector3(sway, KNOT_Y - 0.95, -0.02)];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.005, 6, false);
  }, [f]);
  return <mesh geometry={geo}><meshStandardMaterial color="#E8E4F5" roughness={0.6} /></mesh>;
}

function Needle({ f }) {
  const tip = f < POP ? needleTip(f) : needleTip(POP) + interpolate(f - POP, [0, 8], [0, 0.1], clamp);
  const len = 0.62;
  return (
    <group position={[0, tip, 0.0]}>
      <mesh position={[0, 0.04, 0]}><coneGeometry args={[0.012, 0.08, 24]} /><meshStandardMaterial color="#F4F4FA" metalness={1} roughness={0.12} /></mesh>
      <mesh position={[0, 0.08 + len / 2, 0]}><cylinderGeometry args={[0.012, 0.012, len, 24]} /><meshStandardMaterial color="#F4F4FA" metalness={1} roughness={0.12} /></mesh>
      <mesh position={[0, 0.08 + len + 0.08, 0]}><cylinderGeometry args={[0.06, 0.03, 0.16, 32]} /><meshStandardMaterial color="#9A99A8" metalness={1} roughness={0.25} /></mesh>
      <mesh position={[0, 0.08 + len + 0.16 + 2, 0]}><cylinderGeometry args={[0.09, 0.09, 4, 32]} /><meshStandardMaterial color="#3A3944" metalness={0.9} roughness={0.35} /></mesh>
    </group>
  );
}

// ── confetti: instanced rectangles and stars with flutter ───────────────────────────────────────────
const COLORS = ["#5B2BFF", "#8F72FF", "#74C6FF", "#F3F1FA", "#FFD23F", "#8F72FF", "#5B2BFF", "#F0384F"].map((c) => new THREE.Color(c));
const sparkShape = (() => { const d = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${sparkPath(0, 0, 0.045, 0.22)}"/></svg>`); return SVGLoader.createShapes(d.paths[0]); })();
function pieceAt(i, seed, f, start, origin, burst) {
  const r = (k) => random(`${seed}${k}${i}`);
  const t = f - start;
  if (t < 0) return null;
  const th = r("a") * Math.PI * 2, ph = Math.acos(2 * r("b") - 1);
  const dir = burst ? [Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th) * 0.9 + 0.25, Math.cos(ph) * 0.8] : [0, 0, 0];
  const v = burst ? 0.05 + r("v") * 0.2 : 0;
  const tau = 6 + r("t") * 9, term = (0.006 + r("g") * 0.012);
  const k = 1 - Math.exp(-t / tau);
  const o = [origin[0] + (r("x") - 0.5) * origin[3], origin[1] + (r("y") - 0.5) * origin[4], origin[2] + (r("z") - 0.5) * origin[5]];
  const x = o[0] + dir[0] * v * tau * k + Math.sin(t / (8 + r("s") * 10) + r("p") * 6) * 0.06 * Math.min(1, t / 20);
  const y = o[1] + dir[1] * v * tau * k - term * (t - tau * k);
  const z = o[2] + dir[2] * v * tau * k;
  return { x, y, z, rx: r("rx") * 6 + t * (0.15 + r("w") * 0.3), ry: r("ry") * 6 + t * (0.1 + r("u") * 0.25), rz: r("rz") * 6, s: 0.6 + r("z2") * 0.8, c: COLORS[Math.floor(r("c") * COLORS.length)], star: r("k") < 0.2 };
}
function Confetti({ f, start, seed, count, origin, burst = true }) {
  const rect = useRef(), star = useRef();
  const m = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    let a = 0, b = 0;
    for (let i = 0; i < count; i++) {
      const p = pieceAt(i, seed, f, start, origin, burst);
      if (!p || p.y < -3.2) continue;
      m.position.set(p.x, p.y, p.z); m.rotation.set(p.rx, p.ry, p.rz); m.scale.setScalar(p.s); m.updateMatrix();
      const target = p.star ? star.current : rect.current, idx = p.star ? b++ : a++;
      target.setMatrixAt(idx, m.matrix); target.setColorAt(idx, p.c);
    }
    rect.current.count = a; star.current.count = b;
    rect.current.instanceMatrix.needsUpdate = true; star.current.instanceMatrix.needsUpdate = true;
    if (rect.current.instanceColor) rect.current.instanceColor.needsUpdate = true;
    if (star.current.instanceColor) star.current.instanceColor.needsUpdate = true;
  }, [f]);
  return (
    <>
      <instancedMesh ref={rect} args={[null, null, count]} frustumCulled={false}>
        <planeGeometry args={[0.085, 0.05]} />
        <meshStandardMaterial side={THREE.DoubleSide} metalness={0.35} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={star} args={[null, null, count]} frustumCulled={false}>
        <shapeGeometry args={[sparkShape, 4]} />
        <meshStandardMaterial side={THREE.DoubleSide} metalness={0.6} roughness={0.25} />
      </instancedMesh>
    </>
  );
}
// latex shreds snapping outward
function Shreds({ f }) {
  const t = f - POP;
  if (t < 0 || t > 22) return null;
  const c = popCentre();
  return Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + random(`sa${i}`) * 0.4, d = (1 - Math.exp(-t / 4)) * (0.7 + random(`sd${i}`) * 0.8);
    const s = Math.max(0, 1 - t / 20) * (0.18 + random(`ss${i}`) * 0.2);
    return (
      <mesh key={i} position={[c[0] + Math.cos(a) * d * 1.2, c[1] + Math.sin(a) * d, c[2] + (random(`sz${i}`) - 0.5) * d]} rotation={[t * 0.4 + i, t * 0.5, a]} scale={[s, s * 0.7, s]}>
        <sphereGeometry args={[1, 12, 8, 0, 1.4, 0, 1.2]} />
        <meshPhysicalMaterial color={i % 2 ? "#5B2BFF" : "#7B55FF"} side={THREE.DoubleSide} clearcoat={1} roughness={0.25} />
      </mesh>
    );
  });
}

// ── the extruded logo with the gold spark landing as the i-dot ────────────────────────────────────────
const WM_PX = 760, WM_SCALE = WM_PX / 3224 / PXU, WM_CY = 760;
function useLogoGeometry() {
  return useMemo(() => {
    const d = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${WORDMARK.letters}"/></svg>`);
    const shapes = d.paths.flatMap((p) => SVGLoader.createShapes(p));
    const g = new THREE.ExtrudeGeometry(shapes, { depth: 110, bevelEnabled: true, bevelThickness: 26, bevelSize: 14, bevelSegments: 5, curveSegments: 10 });
    g.computeBoundingBox();
    const sg = new THREE.ExtrudeGeometry(SVGLoader.createShapes(new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${sparkPath(0, 0, WSPARK.r, 0.2)}"/></svg>`).paths[0]), { depth: 70, bevelEnabled: true, bevelThickness: 22, bevelSize: 10, bevelSegments: 5, curveSegments: 12 });
    sg.center();
    return { g, sg, bb: g.boundingBox };
  }, []);
}
function Logo({ f }) {
  const { g, sg, bb } = useLogoGeometry();
  if (f < END) return null;
  const cx = (bb.min.x + bb.max.x) / 2, cy = (bb.min.y + bb.max.y) / 2;
  const p = spring({ frame: f - END - 2, fps: FPS, config: { damping: 13, stiffness: 120 } });
  const [, wy] = toWorld(540, WM_CY);
  // i-dot position in world units (SVG y is down, so flip)
  const dot = [(WSPARK.x - cx) * WM_SCALE, wy - (WSPARK.y - cy) * WM_SCALE, 0.03];
  const fall = interpolate(f, [END + 4, LAND], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1) });
  const land = f >= LAND ? f - LAND : -1;
  const sq = land >= 0 ? 1 + 0.35 * Math.exp(-land / 3) * Math.cos(land / 1.5) : 1;
  const sy = dot[1] + (1 - fall) * 3.2, sx = dot[0] + Math.sin(fall * Math.PI * 3) * 0.3 * (1 - fall);
  const turn = interpolate(p, [0, 1], [-0.7, 0]) + Math.sin(Math.max(0, f - LAND) / 30) * 0.06;
  return (
    <group position={[0, 0, 0]} rotation={[0, turn, 0]}>
      <mesh geometry={g} position={[-cx * WM_SCALE, wy + cy * WM_SCALE - (1 - Math.min(1, p)) * 0.4, -0.05]} scale={[WM_SCALE, -WM_SCALE, WM_SCALE]}>
        <meshPhysicalMaterial color="#FFFFFF" roughness={0.2} metalness={0} clearcoat={1} clearcoatRoughness={0.05} emissive="#FFFFFF" emissiveIntensity={0.42} transparent opacity={Math.min(1, p * 1.5)} />
      </mesh>
      <mesh geometry={sg} position={[sx, sy, dot[2]]} rotation={[0, (1 - fall) * 9, (1 - fall) * 3]} scale={[WM_SCALE * sq, WM_SCALE * (2 - sq), WM_SCALE]}>
        <meshStandardMaterial color="#FFB800" metalness={0.6} roughness={0.3} emissive="#FF8A00" emissiveIntensity={0.9 + (land >= 0 ? 0.8 * Math.exp(-land / 10) : 0)} />
      </mesh>
    </group>
  );
}

export function World({ f, shake = [0, 0] }) {
  const c = popCentre();
  const push = interpolate(f, [0, POP], [0, 0.6], { ...clamp, easing: Easing.bezier(0.4, 0, 0.9, 0.7) }) * (f < END ? 1 : 0);
  const { camera } = useThree();
  useLayoutEffect(() => { camera.position.set(shake[0] / PXU, 0.15 + shake[1] / PXU, 9 - push); camera.lookAt(0, 0.15 * (1 - push / 2), 0); camera.updateProjectionMatrix(); }, [f]);
  return (
    <>
      <Env />
      <ambientLight intensity={0.05} />
      <directionalLight position={[-3, 4, 5]} intensity={2.2} />
      <directionalLight position={[4, 1, -3]} intensity={2.5} color="#8F72FF" />
      <pointLight position={[0, -2, 2]} intensity={6} color="#5B2BFF" distance={8} />
      {f < POP && <Balloon f={f} />}
      {f < POP + 40 && <group position={[0, f > POP ? -0.0025 * (f - POP) ** 2 : 0, 0]}><StringLine f={Math.min(f, POP)} /></group>}
      {f < LINE1 + 4 && <Needle f={f} />}
      <Shreds f={f} />
      <Confetti f={f} start={POP} seed="c" count={420} origin={[c[0], c[1], c[2], 1.4, 1.5, 0.8]} />
      <Confetti f={f} start={END - 30} seed="r" count={140} origin={[0, 3, 0, 3.4, 0.6, 2]} burst={false} />
      {f >= END && <directionalLight position={[0, 1, 6]} intensity={1.2 * interpolate(f - END, [0, 2, 3, 4, 5, 7], [0, 0, 1, 0.45, 1, 1], clamp)} />}
      {f >= END && <spotLight position={[0, 6, 3]} angle={0.32} penumbra={0.5} intensity={120 * interpolate(f - END, [0, 2, 3, 4, 5, 7], [0, 0, 1, 0.45, 1, 1], clamp)} distance={14} decay={2} color="#F2EEFF" />}
      <Logo f={f} />
    </>
  );
}
