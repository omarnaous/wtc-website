import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";
import { Magazine } from "./Magazine.jsx";
import { DURATION as MAG } from "./mag-timing.js";

export const Root = () => (
  <>
    <Composition id="Echappee" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Echappee-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Magazine" component={Magazine} durationInFrames={MAG} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Magazine-NoMusic" component={Magazine} durationInFrames={MAG} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
  </>
);
