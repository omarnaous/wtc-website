// The 3D pieces: cup, liquid (coffee + milk swirl + latte-art smiley), ice, droplets, straw, donuts, the $1 bill.
// Everything takes the current frame as a prop; nothing animates on its own clock.
import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, random, staticFile } from "remotion";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const COL = { orange: "#FF671F", pink: "#E8178A", coffee: "#4A2412", milk: "#F6E4CC", foam: "#FFF9F1", dough: "#E2A25E" };
// cup geometry: inner liquid radius at height y (object space)
export const BOTTOM = -1.26, TOP = 0.84;
export const rAt = (y) => 0.74 + 0.27 * ((y - BOTTOM) / (TOP - BOTTOM));

export function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    gl.toneMappingExposure = 1.05;
  }, []);
  return null;
}

// the camera rig: position + look-at per frame
export function CameraRig({ pos, look, fov }) {
  const { camera } = useThree();
  camera.position.set(...pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(...look);
  return null;
}

// one font, loaded straight into the page, before any canvas texture draws text with it
export function useFace(family, file, desc) {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender(`face ${family}`));
  useEffect(() => {
    new FontFace(family, `url(${staticFile(file)})`, desc).load().then((ff) => { document.fonts.add(ff); setOk(true); continueRender(h); })
      .catch(() => { setOk(true); continueRender(h); });
  }, []);
  return ok;
}

// ── shaders ───────────────────────────────────────────────────────────────────────────────────────
const NOISE = `
float hash(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }
`;
const LIQ_V = `varying vec3 vPos; varying vec3 vN; varying vec3 vV;
void main(){ vPos = position; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`;
const LIQ_F = `uniform float uFillY; uniform float uMilk; uniform float uTime; uniform vec3 uCoffee; uniform vec3 uMilkC; uniform float uTop;
varying vec3 vPos; varying vec3 vN; varying vec3 vV;
${NOISE}
void main(){
  if (uTop < 0.5 && vPos.y > uFillY) discard;
  float a = atan(vPos.z, vPos.x);
  float tw = vPos.y*2.2 + uTime*0.35;
  vec3 p = vec3(cos(a+tw)*1.4, vPos.y*1.6 - uTime*0.12, sin(a+tw)*1.4);
  float n = fbm(p*1.6 + vec3(0.0, uTime*0.05, 0.0));
  float h = clamp((vPos.y + 1.26)/2.1, 0.0, 1.0);
  float m = smoothstep(0.4, 0.68, n + uMilk*0.45 - 0.28 + (h - 0.45)*0.7*uMilk) * uMilk;
  vec3 latte = mix(uCoffee, uMilkC, 0.5);
  vec3 col = mix(mix(uCoffee, latte, uMilk*0.55), uMilkC, m);
  col = mix(col, uMilkC*1.05, smoothstep(0.7, 1.0, h)*uMilk*0.7);
  col *= 0.92 + 0.16*h;
  vec3 L = normalize(vec3(0.5, 0.8, 0.6));
  float dif = 0.55 + 0.45*max(dot(vN, L), 0.0);
  float rim = pow(1.0 - max(dot(vN, vV), 0.0), 3.0);
  float spec = pow(max(dot(reflect(-L, vN), vV), 0.0), 40.0);
  gl_FragColor = vec4(col*dif + rim*0.18 + spec*0.25, 1.0);
}`;
// the top surface, seen from above: swirl + latte-art smiley (uSmile: 0 none, 0..0.33 eyes, ..1 mouth)
const TOP_V = `varying vec2 vUv; varying vec3 vPos; void main(){ vUv = uv; vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const TOP_F = `uniform float uMilk; uniform float uTime; uniform float uSmile; uniform float uR; uniform vec3 uCoffee; uniform vec3 uMilkC; uniform vec3 uFoam;
varying vec2 vUv; varying vec3 vPos;
${NOISE}
float seg(vec2 p, float r0, float r1){ return 0.0; }
void main(){
  vec2 q = (vUv - 0.5)*2.0; q.y = -q.y;          // -1..1 across the disc; flipped so the smile faces a camera above, front-side down
  float rr = length(q), ang = atan(q.y, q.x);
  float sw = fbm(vec3(cos(ang + rr*3.0 - uTime*0.4)*rr*2.2, sin(ang + rr*3.0 - uTime*0.4)*rr*2.2, uTime*0.06));
  float m = smoothstep(0.35, 0.75, sw + uMilk*0.5 - 0.32) * uMilk;
  vec3 col = mix(uCoffee*1.15, uMilkC, m*0.8 + uMilk*0.1);
  col = mix(col, mix(uCoffee, uMilkC, 0.62), clamp(uSmile*2.5, 0.0, 0.85));
  col = mix(col, uMilkC*0.92, smoothstep(0.75, 1.0, rr)*uMilk);   // crema ring at the edge
  // smiley in foam
  float e = clamp(uSmile*3.0, 0.0, 1.0), mo = clamp((uSmile - 0.33)/0.67, 0.0, 1.0);
  float eyeR = 0.12*e;
  float eyes = min(length(q - vec2(-0.32, 0.24)) - eyeR, length(q - vec2(0.32, 0.24)) - eyeR);
  float arcR = 0.5, th = 0.11;
  float d = abs(length(q - vec2(0.0, 0.08)) - arcR) - th*0.5;
  float aa = atan(q.y - 0.08, q.x);              // the mouth: bottom arc from -160deg to -20deg, drawn left to right
  float a0 = radians(-160.0), a1 = mix(a0, radians(-20.0), mo);
  float onArc = step(a0, aa)*step(aa, a1)*step(0.001, mo);
  float ends = min(length(q - vec2(0.0,0.08) - arcR*vec2(cos(a0), sin(a0))) - th*0.5, length(q - vec2(0.0,0.08) - arcR*vec2(cos(a1), sin(a1))) - th*0.5);
  float mouth = min(mix(1.0, d, onArc), mo > 0.001 ? ends : 1.0);
  float s = min(eyes, mouth);
  float wob = (fbm(vec3(q*6.0, 1.0)) - 0.5)*0.03;
  col = mix(col, uFoam, 1.0 - smoothstep(0.0, 0.018, s + wob));
  gl_FragColor = vec4(col, 1.0);
}`;

export function Liquid({ f, fill, milk, smile }) {
  const geo = useMemo(() => {
    const p = [new THREE.Vector2(0, BOTTOM)];
    for (let i = 0; i <= 24; i++) { const y = BOTTOM + (TOP - BOTTOM) * (i / 24); p.push(new THREE.Vector2(rAt(y), y)); }
    return new THREE.LatheGeometry(p, 96);
  }, []);
  const side = useMemo(() => new THREE.ShaderMaterial({ vertexShader: LIQ_V, fragmentShader: LIQ_F, uniforms: {
    uFillY: { value: 0 }, uMilk: { value: 0 }, uTime: { value: 0 }, uTop: { value: 0 }, uCoffee: { value: new THREE.Color(COL.coffee) }, uMilkC: { value: new THREE.Color(COL.milk) } } }), []);
  const top = useMemo(() => new THREE.ShaderMaterial({ vertexShader: TOP_V, fragmentShader: TOP_F, uniforms: {
    uMilk: { value: 0 }, uTime: { value: 0 }, uSmile: { value: 0 }, uR: { value: 1 }, uCoffee: { value: new THREE.Color(COL.coffee) }, uMilkC: { value: new THREE.Color(COL.milk) }, uFoam: { value: new THREE.Color(COL.foam) } } }), []);
  const fillY = BOTTOM + (TOP - BOTTOM) * fill;
  side.uniforms.uFillY.value = fillY; side.uniforms.uMilk.value = milk; side.uniforms.uTime.value = f / 30;
  top.uniforms.uMilk.value = milk; top.uniforms.uTime.value = f / 30; top.uniforms.uSmile.value = smile;
  if (fill <= 0.002) return null;
  const r = rAt(fillY);
  return (
    <group>
      <mesh geometry={geo} material={side} />
      <mesh position={[0, fillY, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[r, r, 1]} material={top}><circleGeometry args={[1, 96]} /></mesh>
    </group>
  );
}

// the clear cup + its vertical "$1 A DAY" print
export function Cup({ printReady }) {
  const shell = useMemo(() => {
    const p = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; p.push(new THREE.Vector2(0.775 + 0.33 * t, -1.32 + 2.66 * t)); }
    p.unshift(new THREE.Vector2(0, -1.32));
    return new THREE.LatheGeometry(p, 128);
  }, []);
  const rim = useMemo(() => new THREE.TorusGeometry(1.105, 0.022, 12, 128), []);
  const print = useMemo(() => {
    if (!printReady) return null;
    const c = document.createElement("canvas"); c.width = 2048; c.height = 1024;
    const x = c.getContext("2d");
    x.clearRect(0, 0, 2048, 1024);
    // vertical lettering, the way Dunkin' cups carry their name
    x.save(); x.translate(1024 + 40, 512); x.rotate(-Math.PI / 2);
    x.font = "800 250px Print"; x.textAlign = "center"; x.textBaseline = "middle";
    x.lineJoin = "round"; x.lineWidth = 26; x.strokeStyle = "#ffffff"; x.strokeText("$1 A DAY", 0, 0);
    x.fillStyle = COL.orange; x.fillText("$1 A DAY", 0, 0);
    x.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  }, [printReady]);
  return (
    <group>
      <mesh geometry={shell}><meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0.03} metalness={0} clearcoat={1} clearcoatRoughness={0.02} side={THREE.DoubleSide} depthWrite={false} envMapIntensity={1.4} /></mesh>
      {print && <mesh geometry={shell} scale={[1.004, 1, 1.004]}><meshStandardMaterial map={print} transparent alphaTest={0.02} roughness={0.35} depthWrite={false} /></mesh>}
      <mesh geometry={rim} position={[0, 1.34, 0]} rotation={[Math.PI / 2, 0, 0]}><meshPhysicalMaterial color="#ffffff" transparent opacity={0.55} roughness={0.05} clearcoat={1} /></mesh>
    </group>
  );
}

// condensation: little drops all over the cup's outside
export function Droplets({ amount }) {
  const n = 170;
  const mesh = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 10, 8);
    const m = new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.0, roughness: 0.02, clearcoat: 1, envMapIntensity: 2 });
    const im = new THREE.InstancedMesh(g, m, n); const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const y = -1.2 + random(`dy${i}`) * 2.3, a = random(`da${i}`) * Math.PI * 2, r = 0.775 + 0.33 * ((y + 1.32) / 2.66) + 0.01;
      const s = 0.012 + Math.pow(random(`ds${i}`), 3) * 0.035;
      o.position.set(Math.cos(a) * r, y, Math.sin(a) * r); o.scale.set(s, s * 1.25, s * 0.6); o.lookAt(0, y, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    return im;
  }, []);
  mesh.material.opacity = 0.75 * amount; mesh.visible = amount > 0.01;
  return <primitive object={mesh} />;
}

const ICE = new RoundedBoxGeometry(0.5, 0.5, 0.5, 4, 0.1);
export function Ice({ pos, rot }) {
  return <mesh geometry={ICE} position={pos} rotation={rot}><meshPhysicalMaterial color="#EAF6FF" transmission={0.96} roughness={0.06} thickness={0.35} ior={1.31} clearcoat={1} envMapIntensity={1.8} attenuationColor="#D8EEFF" attenuationDistance={1.5} /></mesh>;
}

export function Straw({ y = 0, tilt = 0.14 }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 64; c.height = 512; const x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, 64, 512);
    x.fillStyle = COL.pink; for (let i = 0; i < 16; i++) { x.save(); x.translate(0, i * 32); x.transform(1, 0.5, 0, 1, 0, 0); x.fillRect(0, 0, 64, 14); x.restore(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t;
  }, []);
  return (
    <mesh position={[0.32, 0.9 + y, -0.1]} rotation={[0, 0, -tilt]}>
      <cylinderGeometry args={[0.065, 0.065, 3.4, 24, 1, true]} /><meshPhysicalMaterial map={tex} roughness={0.25} clearcoat={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

// a ring donut: dough, dripping icing on the top half, sprinkles
export function Donut({ icing = COL.pink, seed = "d", position, rotation, scale = 1 }) {
  const { dough, ice, spr } = useMemo(() => {
    const R = 0.5, r = 0.25;
    const dough = new THREE.TorusGeometry(R, r, 32, 72);
    const ice = new THREE.TorusGeometry(R, r + 0.03, 32, 72);
    const p = ice.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const a = Math.atan2(v.y, v.x), edge = -0.02 + 0.07 * Math.sin(a * 7 + random(seed) * 6) + 0.04 * Math.sin(a * 13);
      if (v.z < edge) { // below the drip line: tuck the icing inside the dough
        const c = new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0); const d = v.clone().sub(c).setLength(r - 0.02); v.copy(c.add(d)); p.setXYZ(i, v.x, v.y, v.z);
      }
    }
    ice.computeVertexNormals();
    const n = 46, cg = new THREE.CapsuleGeometry(0.018, 0.07, 4, 8);
    const spr = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ roughness: 0.4 }), n);
    const o = new THREE.Object3D(), cols = ["#ffffff", "#FFD23F", "#4CC9F0", COL.orange, "#7BE07B", "#ffffff"].map((c) => new THREE.Color(c));
    for (let i = 0; i < n; i++) {
      const a = random(`${seed}a${i}`) * Math.PI * 2, b = (0.15 + random(`${seed}b${i}`) * 0.7) * Math.PI / 2;
      const c = new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0);
      const out = new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(a) * Math.cos(b), Math.sin(b));
      o.position.copy(c.clone().add(out.multiplyScalar(r + 0.045)));
      o.rotation.set(random(`${seed}x${i}`) * 3, random(`${seed}y${i}`) * 3, random(`${seed}z${i}`) * 3); o.updateMatrix();
      spr.setMatrixAt(i, o.matrix); spr.setColorAt(i, cols[i % cols.length]);
    }
    return { dough, ice, spr };
  }, []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={dough}><meshStandardMaterial color={COL.dough} roughness={0.7} /></mesh>
      <mesh geometry={ice}><meshPhysicalMaterial color={icing} roughness={0.22} clearcoat={0.8} clearcoatRoughness={0.2} /></mesh>
      <primitive object={spr} />
    </group>
  );
}

// a stylised $1 bill: a canvas texture on a plane that flutters
export function Bill({ f, ready, position, rotation, scale = 1 }) {
  const { geo, tex } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.35, 1, 40, 12);
    if (!ready) return { geo, tex: null };
    const c = document.createElement("canvas"); c.width = 1410; c.height = 600; const x = c.getContext("2d");
    const ink = "#2F5F3A";
    x.fillStyle = "#DDE8D0"; x.fillRect(0, 0, 1410, 600);
    const g = x.createRadialGradient(705, 300, 50, 705, 300, 760); g.addColorStop(0, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(60,100,60,.18)"); x.fillStyle = g; x.fillRect(0, 0, 1410, 600);
    x.strokeStyle = ink; x.lineWidth = 14; x.strokeRect(30, 30, 1350, 540); x.lineWidth = 4; x.setLineDash([16, 10]); x.strokeRect(58, 58, 1294, 484); x.setLineDash([]);
    for (let i = 0; i < 60; i++) { x.strokeStyle = "rgba(47,95,58,.12)"; x.lineWidth = 2; x.beginPath(); x.arc(705, 300, 90 + i * 9, 0, Math.PI * 2); x.stroke(); }
    x.fillStyle = "#EEF4E6"; x.beginPath(); x.ellipse(705, 300, 190, 200, 0, 0, Math.PI * 2); x.fill(); x.lineWidth = 12; x.strokeStyle = ink; x.stroke();
    x.fillStyle = ink; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = "800 230px Print"; x.fillText("$1", 705, 318);
    x.font = "800 140px Print"; [[140, 150], [1270, 150], [140, 460], [1270, 460]].forEach(([a, b]) => x.fillText("1", a, b));
    x.font = "700 54px Print"; x.fillText("ONE  DOLLAR", 705, 520);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    return { geo, tex };
  }, [ready]);
  const p = geo.attributes.position, t = f / 30;
  for (let i = 0; i < p.count; i++) {
    const xx = (i % 41) / 40 * 2.35 - 1.175, yy = 0.5 - Math.floor(i / 41) / 12;
    p.setZ(i, Math.sin(xx * 2.2 + t * 4.5) * 0.16 + Math.sin(yy * 3 + t * 3.1) * 0.05 + xx * xx * 0.05);
  }
  p.needsUpdate = true; geo.computeVertexNormals();
  if (!tex) return null;
  return <mesh geometry={geo} position={position} rotation={rotation} scale={scale}><meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} /></mesh>;
}
