import { Composition } from "remotion";
import { Intro } from "./Intro.jsx";
import { FPS, DURATION } from "./timing.js";

// The website hero intro (16:9). "Intro" has music; "Intro-NoMusic" is effects only.
export const Root = () => (
  <>
    <Composition id="Intro" component={Intro} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ music: true }} />
    <Composition id="Intro-NoMusic" component={Intro} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} defaultProps={{ music: false }} />
  </>
);
