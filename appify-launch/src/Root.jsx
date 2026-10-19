import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { Thumb } from "./Thumb.jsx";
import { Thumb2 } from "./Thumb2.jsx";
import { Bts, BtsV2, BTS_DURATIONS } from "./Bts.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  <>
    <Composition id="Launch" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Launch-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="HowWeMadeIt" component={Bts} durationInFrames={BTS_DURATIONS.v1} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="HowWeMadeIt-NoMusic" component={Bts} durationInFrames={BTS_DURATIONS.v1} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="HowWeMadeIt-V2" component={BtsV2} durationInFrames={BTS_DURATIONS.v2} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="HowWeMadeIt-V2-NoMusic" component={BtsV2} durationInFrames={BTS_DURATIONS.v2} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="Thumb-HowWeMadeIt" component={Thumb2} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  </>
);
