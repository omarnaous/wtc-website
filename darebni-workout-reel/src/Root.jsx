import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FormCheck, FC } from "./FormCheck.jsx";
import { FormClip, FL } from "./FormClip.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  <>
    <Composition id="PushDay" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="PushDay-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="FormCheck" component={FormCheck} durationInFrames={FC.DURATION} fps={FC.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="FormCheck-NoMusic" component={FormCheck} durationInFrames={FC.DURATION} fps={FC.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="FormClip" component={FormClip} durationInFrames={FL.DURATION} fps={FL.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="FormClip-NoMusic" component={FormClip} durationInFrames={FL.DURATION} fps={FL.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
  </>
);
