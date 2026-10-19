import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  <>
    <Composition id="Launch" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Launch-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
  </>
);
