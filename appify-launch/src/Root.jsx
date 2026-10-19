import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { Thumb } from "./Thumb.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  <>
    <Composition id="Launch" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Launch-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  </>
);
