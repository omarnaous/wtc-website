// "$1 = a smile a day": a 3D iced coffee, built live (ice, pour, milk swirl, a latte-art smiley), cut on a
// 120 BPM grid, with @dunkinleb-style sticker type in English and Arabic.
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts, Flash, Grain, Vignette } from "./fx.jsx";
import { T, BEAT } from "./timing.js";
import { Scene3D } from "./scene/Scene3D.jsx";
import { Backdrop, Front } from "./scene/Overlay.jsx";

export const Main = ({ brand, handle, logo, finePrint }) => {
  useFonts([["Display", "Baloo2.ttf", { weight: "400 800" }], ["Arabic", "BalooBhaijaan2.ttf", { weight: "400 800" }], ["Script", "Pacifico.ttf"], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const u = W / 1080, tall = H > 1600;
  // flashes on the big cuts
  const flashes = [T.smash, T.price, T.every, T.single, T.day, T.eyes, T.finale, ...Array.from({ length: 7 }, (_, i) => T.week + i * BEAT)];
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#FFC2DB" }}>
      <Audio src={staticFile("sound.wav")} />
      <Backdrop f={f} W={W} H={H} u={u} />
      <AbsoluteFill><Scene3D f={f} width={W} height={H} /></AbsoluteFill>
      <AbsoluteFill><Front f={f} W={W} H={H} u={u} tall={tall} brand={brand} handle={handle} logo={logo} finePrint={finePrint} Img={Img} staticFile={staticFile} /></AbsoluteFill>
      {flashes.map((s) => (f >= s && f < s + 6 ? <Flash key={s} f={f} start={s} peak={s === T.smash || s === T.price || s === T.finale ? 0.55 : 0.22} color="#FFF4F9" /> : null))}
      <Vignette strength={0.14} />
      <Grain f={f} opacity={0.03} />
    </AbsoluteFill>
  );
};
