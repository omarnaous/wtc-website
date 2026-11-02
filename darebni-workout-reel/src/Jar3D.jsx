// A 3D creatine tub (three.js via @remotion/three): a lathe-modelled glossy ink body, a violet wrap label drawn on a
// canvas (generic "CREATINE MONOHYDRATE", no real brand), a satin violet lid with grip ridges, and white powder that
// bursts out when the lid pops. Everything is a pure function of the frame.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { continueRender, delayRender, random } from "remotion";

export const PXU = 398;
export const toWorld = (x, y) => [(x - 540) / PXU, (960 - y) / PXU];

// tub profile (radius, y): rounded base, straight wall, small shoulder, neck under the lid
const PROFILE = (() => {
  const p = [[0.0001, -1.1], [0.78, -1.1], [0.9, -1.07], [0.96, -1.0], [0.98, -0.9], [0.98, 0.78], [0.96, 0.86], [0.9, 0.9], [0.88, 0.95], [0.88, 1.0], [0.0001, 1.0]];
  return p.map(([r, y]) => new THREE.Vector2(r, y));
})();

function useLabel() {
  // ThreeCanvas only draws on frame changes, so once the label exists draw once more before releasing the frame
  const { gl, scene, camera } = useThree();
  const [tex, setTex] = useState(null);
  const [h] = useState(() => delayRender("jar label"));
  useEffect(() => { if (tex) requestAnimationFrame(() => { gl.render(scene, camera); continueRender(h); }); }, [tex]);
  useEffect(() => {
    Promise.all([document.fonts.load('800 200px "Cond"'), document.fonts.load('600 60px "Barlow"')]).finally(() => {
      // 4096 x 860 keeps the wrap's real aspect (circumference 6.2 : height 1.3), so type isn't stretched
      const W = 4096, H = 860, c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#6A5EF0"); gr.addColorStop(1, "#3E33B8");
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = "#F2F0EA"; g.fillRect(0, 34, W, 10); g.fillRect(0, H - 44, W, 10);
      const panel = (cx, fn) => { g.save(); g.translate(cx, 0); fn(); g.restore(); };
      // front (centre of the canvas faces the camera at spin 0)
      panel(W / 2, () => {
        g.textAlign = "center"; g.fillStyle = "#F2F0EA";
        g.font = '800 300px "Cond"'; g.fillText("CREATINE", 0, 420);
        g.font = '800 110px "Cond"'; g.fillStyle = "#B8B0FF"; g.fillText("MONOHYDRATE", 0, 560);
        g.font = '600 56px "Barlow"'; g.fillStyle = "rgba(242,240,234,.85)"; g.fillText("3–5 g a day  ·  unflavoured", 0, 700);
      });
      // left of front
      panel(W / 2 - 1250, () => {
        g.textAlign = "center"; g.fillStyle = "#F2F0EA"; g.font = '800 120px "Cond"';
        ["SCOOP.", "SHAKE.", "LIFT."].forEach((l, i) => g.fillText(l, 0, 330 + i * 130));
      });
      // right of front
      panel(W / 2 + 1250, () => {
        g.textAlign = "center"; g.fillStyle = "#F2F0EA"; g.font = '800 110px "Cond"'; g.fillText("SCIENCE SAYS", 0, 330);
        g.font = '600 56px "Barlow"'; g.fillStyle = "rgba(242,240,234,.85)";
        ["22 studies reviewed", "safe up to 30 g/day", "for 5 years (ISSN 2017)"].forEach((l, i) => g.fillText(l, 0, 450 + i * 80));
      });
      // back
      panel(120, () => { g.textAlign = "left"; g.fillStyle = "rgba(242,240,234,.5)"; g.font = '800 90px "Cond"'; g.fillText("STORY TIME", 0, 480); });
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping;
      setTex(t);
    });
  }, []);
  return tex;
}

export function Env() {
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

// lid ridges: a CylinderGeometry whose radius wobbles with angle
function useLidGeo() {
  return useMemo(() => {
    const g = new THREE.CylinderGeometry(1.0, 1.0, 0.36, 240, 1, false);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      if (r > 0.99) { const a = Math.atan2(z, x), k = 1 + 0.012 * Math.cos(a * 90); p.setX(i, x * k); p.setZ(i, z * k); }
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

const N = 520;
function Powder({ t }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    for (let i = 0; i < N; i++) {
      const a = random(`a${i}`) * Math.PI * 2, sp = 0.6 + random(`s${i}`) * 1.6, up = 2.2 + random(`u${i}`) * 2.4;
      const tt = Math.max(0, t - random(`d${i}`) * 0.12);
      const x = Math.cos(a) * sp * tt * 0.9, z = Math.sin(a) * sp * tt * 0.9, y = 1.0 + up * tt - 4.9 * tt * tt;
      const s = t <= 0 ? 0 : (0.025 + random(`r${i}`) * 0.045) * Math.max(0, 1 - tt / 1.8);
      dummy.position.set(x, y, z); dummy.scale.setScalar(s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [t]);
  return (
    <instancedMesh ref={ref} args={[null, null, N]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshStandardMaterial color="#F7F6FF" roughness={0.9} emissive="#8B80FF" emissiveIntensity={0.15} />
    </instancedMesh>
  );
}

// pos: stage px of the jar centre; s: scale (1 = about 780 px tall); spin: radians; lid: 0 closed -> 1 popped; burst: seconds since pop
export function Jar({ pos = [540, 960], s = 1, spin = 0, tilt = 0.12, lid = 0, burst = -1 }) {
  const label = useLabel();
  const body = useMemo(() => new THREE.LatheGeometry(PROFILE, 160), []);
  const wrap = useMemo(() => new THREE.CylinderGeometry(0.986, 0.986, 1.3, 200, 1, true, Math.PI, Math.PI * 2), []);
  const lidGeo = useLidGeo();
  const [x, y] = toWorld(pos[0], pos[1]);
  const lidY = 1.17 + lid * 6, lidRot = lid * 1.6, lidX = lid * 3.5;
  return (
    <group position={[x, y, 0]} scale={s} rotation={[tilt, 0, 0]}>
      <group rotation={[0, spin, 0]}>
        <mesh geometry={body}><meshPhysicalMaterial color="#14122E" roughness={0.28} clearcoat={1} clearcoatRoughness={0.08} metalness={0.1} /></mesh>
        {label && <mesh geometry={wrap} position={[0, -0.1, 0]}><meshPhysicalMaterial map={label} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.15} /></mesh>}
        {/* powder surface visible once the lid is off */}
        <mesh position={[0, 0.96, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.86, 64]} /><meshStandardMaterial color="#F4F3FA" roughness={1} /></mesh>
      </group>
      <group position={[lidX, lidY, 0]} rotation={[0, spin * 0.6, -lidRot]}>
        <mesh geometry={lidGeo}><meshPhysicalMaterial color="#7A6CFF" roughness={0.32} metalness={0.55} clearcoat={0.8} clearcoatRoughness={0.2} /></mesh>
      </group>
      {burst >= 0 && <Powder t={burst} />}
    </group>
  );
}
