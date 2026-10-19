// "Launch day" (3D). The test-track trend with an app instead of a car: a phone running Darebni AI (built by Appify)
// rides a steel track at night, fires its thrusters, launches through the smoke and flies to the camera.
// Hook caption -> ride -> ignition -> launch -> close-up with a chip -> end card.
import { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { FPS, HOOK, IGNITE, LAUNCH, CLOSE, END } from "./timing.js";
import { useFonts, clamp, easeOut, shake, Flash, Grain, Vignette } from "./fx.jsx";
import { World } from "./Scene.jsx";
import { WORDMARK } from "./brand.js";

const C = { uv: "#5B2BFF", iris: "#8F72FF", paper: "#F3F1FA", pink: "#ff2d6f", yellow: "#FFD23F" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };
const sp = (f, at, damping = 14, stiffness = 200) => spring({ frame: f - at, fps: FPS, config: { damping, stiffness } });
// in at `a`, out at `b`
const life = (f, a, b, d = 8) => interpolate(f, [a, a + d, b - d, b], [0, 1, 1, 0], clamp);

function Hook({ f }) {
  const o = life(f, HOOK, IGNITE + 14, 10), p = sp(f, HOOK);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 300, textAlign: "center", opacity: o, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ ...M, fontSize: 30, color: C.pink, marginBottom: 26 }}>● Test 01 · night run</div>
      <div style={{ ...D, fontSize: 104, color: "#fff", textShadow: "0 4px 40px rgba(0,0,0,.8)" }}>POV: your app's<br />launch day</div>
    </div>
  );
}

// a test-rig HUD in the corners while the phone rides, counting to ignition
function Hud({ f }) {
  const o = life(f, HOOK, LAUNCH + 20, 10);
  const t = Math.max(0, (IGNITE - f) / FPS);
  const label = f < IGNITE ? `T-${t.toFixed(2)}` : "IGNITION";
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 330, display: "flex", justifyContent: "space-between", opacity: o * 0.9, ...M, fontSize: 28, color: "rgba(255,255,255,.85)" }}>
      <span><span style={{ color: C.pink }}>●</span> REC</span>
      <span style={{ color: f >= IGNITE ? C.yellow : "rgba(255,255,255,.85)" }}>{label}</span>
    </div>
  );
}

function Chip({ f }) {
  const o = life(f, CLOSE - 12, END + 4, 8), p = sp(f, CLOSE - 12);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ ...UI, fontSize: 38, color: "#fff", padding: "20px 34px", borderRadius: 999, background: "rgba(16,14,26,.72)", border: "1px solid rgba(255,255,255,.18)", transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})` }}>
        Darebni AI <span style={{ color: "rgba(255,255,255,.55)", fontWeight: 400 }}>· an app we built</span>
      </div>
    </div>
  );
}

function EndCard({ f }) {
  if (f < END - 6) return null;
  const bg = interpolate(f, [END - 6, END + 10], [0, 0.82], clamp);
  const a = sp(f, END + 4), b = sp(f, END + 14), c = sp(f, END + 24), d = sp(f, END + 34);
  const up = (p) => ({ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px)` });
  const wm = 380, wmh = (wm * 1167) / 3224;
  return (
    <AbsoluteFill style={{ background: `rgba(4,3,9,${bg})`, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ ...D, fontSize: 132, color: "#fff", ...up(a) }}>Your app,<br />launched.</div>
      <div style={{ ...UI, fontSize: 44, color: "rgba(255,255,255,.75)", fontWeight: 400, marginTop: 40, ...up(b) }}>iOS + Android · from $999</div>
      <div style={{ ...up(c), marginTop: 70, padding: "26px 48px", borderRadius: 999, background: C.uv, ...UI, fontSize: 42, color: "#fff", boxShadow: `0 0 60px ${C.uv}aa` }}>DM us · appify-lb.com</div>
      <svg width={wm} height={wmh} viewBox={WORDMARK.viewBox} style={{ marginTop: 120, ...up(d) }}>
        <path d={WORDMARK.letters} fill="#fff" />
        <path d={WORDMARK.spark} fill={C.yellow} />
      </svg>
    </AbsoluteFill>
  );
}

function useImage(file) {
  const [handle] = useState(() => delayRender(file));
  const [img, setImg] = useState(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => { setImg(im); continueRender(handle); };
    im.onerror = () => continueRender(handle);
    im.src = staticFile(file);
  }, []);
  return img;
}

export const Main = ({ music = true }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const screen = useImage("screens/home.jpg");
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  // the rig shakes on ignition, harder on launch
  const s1 = shake(f, IGNITE, 10, 10), s2 = shake(f, LAUNCH, 26, 9);
  const sh = [s1[0] + s2[0], s1[1] + s2[1]];
  return (
    <AbsoluteFill style={{ background: "#040309" }}>
      <AbsoluteFill style={{ transform: `translate(${sh[0]}px, ${sh[1]}px) scale(1.03)` }}>
        {screen && <ThreeCanvas width={W} height={H} camera={{ fov: 50, position: [5.5, 1.2, 15], near: 0.1, far: 120 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
          <World f={f} img={screen} />
        </ThreeCanvas>}
      </AbsoluteFill>
      <Flash f={f} start={LAUNCH} peak={0.2} color="#ffb070" />
      <Vignette strength={0.6} />
      <Hook f={f} />
      <Hud f={f} />
      <Chip f={f} />
      <EndCard f={f} />
      <Grain f={f} opacity={0.06} />
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
    </AbsoluteFill>
  );
};
