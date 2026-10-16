import { AbsoluteFill, Audio, Composition, staticFile, useCurrentFrame } from "remotion";
import { useFonts } from "./fx.jsx";
import { FPS, DURATION } from "./timing.js";
import { Explainer } from "./Explainer.jsx";
import { Reel } from "./Reel.jsx";

const FONTS = [["Display", "Sora-600.ttf", { weight: "600" }], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI4", "Geist-400.ttf", { weight: "400" }], ["Mono", "GeistMono-500.ttf"]];

// The explainer on its own (16:9, to play full screen on a laptop and film it), and the finished reel (9:16, the
// explainer on a laptop with the caption). Each with music and an effects-only cut for posting with a trending track.
const Piece = ({ kind, music }) => {
  useFonts(FONTS);
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Audio src={staticFile(music ? "sound.wav" : "sound-sfx.wav")} />
      {kind === "reel" ? <Reel f={f} /> : <Explainer f={f} />}
    </AbsoluteFill>
  );
};

export const Root = () => (
  <>
    <Composition id="Reel" component={Piece} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ kind: "reel", music: true }} />
    <Composition id="Reel-NoMusic" component={Piece} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ kind: "reel", music: false }} />
    <Composition id="Explainer" component={Piece} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ kind: "explainer", music: true }} />
    <Composition id="Explainer-NoMusic" component={Piece} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ kind: "explainer", music: false }} />
  </>
);
