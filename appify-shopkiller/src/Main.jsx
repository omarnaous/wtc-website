import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SCENES, RIP, WIPE, CUT } from "./timing.js";
import { C } from "./ui.jsx";
import { useFonts, clamp, easeOut, Grain, Vignette, Flash } from "./fx.jsx";
import { Receipt, Cost, Turn, Reveal, Features, Compare, Offer } from "./scenes.jsx";
import { Presenter } from "./Presenter.jsx";

// Graph paper = the old way (bills, receipts, cost). Ink = the new way.
function PaperLayer({ f, style }) {
  return (
    <AbsoluteFill style={{ background: C.paper, backgroundImage: `linear-gradient(${C.gridMajor} 2px, transparent 2px), linear-gradient(90deg, ${C.gridMajor} 2px, transparent 2px), linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`, backgroundSize: "180px 180px, 180px 180px, 36px 36px, 36px 36px", backgroundPosition: `0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px, 0 ${f * 0.8}px`, ...style }} />
  );
}
function InkLayer({ f }) {
  const glow = 0.45 + 0.1 * Math.sin(f / 20);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, rgba(91,43,255,${glow}), transparent 60%)` }} />
      <AbsoluteFill style={{ opacity: 0.1, backgroundImage: "linear-gradient(rgba(205,190,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(205,190,255,.6) 1px, transparent 1px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${-f * 0.5}px`, maskImage: "radial-gradient(circle at 50% 50%, #000, transparent 70%)", WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000, transparent 70%)" }} />
    </AbsoluteFill>
  );
}
// jagged tear line across the screen at y=960
const TEAR = Array.from({ length: 19 }, (_, i) => `${(i / 18) * 100}% ${50 + (i % 2 ? 1.6 : -1.6) + ((i * 37) % 5) * 0.4}%`).join(", ");

export const Main = (props) => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"]]);
  const f = useCurrentFrame();
  const rip = interpolate(f, [RIP, RIP + 22], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1) });
  const wipe = interpolate(f, [WIPE, WIPE + 14], [0, 1], { ...clamp, easing: easeOut });
  const paperBefore = f < RIP + 23;
  const paperAfter = f >= WIPE && f < CUT;
  const seq = (k) => ({ from: SCENES[k][0], durationInFrames: SCENES[k][1] });

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <Audio src={staticFile("sound.wav")} />
      <InkLayer f={f} />
      {paperBefore && (rip === 0 ? <PaperLayer f={f} /> : (
        <>
          <PaperLayer f={f} style={{ clipPath: `polygon(0 0, 100% 0, ${TEAR.split(", ").reverse().join(", ")})`, transform: `translateY(${-rip * 1100}px) rotate(${-rip * 4}deg)` }} />
          <PaperLayer f={f} style={{ clipPath: `polygon(${TEAR}, 100% 100%, 0 100%)`, transform: `translateY(${rip * 1100}px) rotate(${rip * 3}deg)` }} />
        </>
      ))}
      {paperAfter && <PaperLayer f={f} style={{ transform: `translateY(${(1 - wipe) * 1920}px)`, boxShadow: "0 -40px 80px rgba(0,0,0,.4)" }} />}

      {/* scenes scaled into the top 80% so Dev and his captions own the bottom band */}
      <AbsoluteFill style={{ transform: "scale(0.8)", transformOrigin: "50% 250px" }}>
      <Sequence {...seq("receipt")}><Receipt {...props} /></Sequence>
      <Sequence {...seq("cost")}><Cost {...props} /></Sequence>
      <Sequence {...seq("turn")}><Turn /></Sequence>
      <Sequence {...seq("reveal")}><Reveal {...props} /></Sequence>
      <Sequence {...seq("features")}><Features {...props} /></Sequence>
      <Sequence {...seq("compare")}><Compare {...props} /></Sequence>
      <Sequence {...seq("offer")}><Offer {...props} /></Sequence>
      </AbsoluteFill>
      <Presenter />

      <Flash f={f} start={CUT} peak={0.4} />
      <Vignette strength={0.35} />
      <Grain f={f} opacity={0.05} />
    </AbsoluteFill>
  );
};
