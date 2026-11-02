import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { Thumb } from "./Thumb.jsx";
import { BenchElbows, BE } from "./BenchElbows.jsx";
import { BenchThumb } from "./BenchThumb.jsx";
import { Commercial, CM } from "./Commercial.jsx";
import { CommercialThumb } from "./CommercialThumb.jsx";
import { StoryCreatine, SC } from "./StoryCreatine.jsx";
import { FormCheck, FC } from "./FormCheck.jsx";
import { FormClip, FL } from "./FormClip.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  <>
    <Composition id="PushDay" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="PushDay-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="PushDay-Thumb" component={Thumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="Creatine" component={StoryCreatine} durationInFrames={SC.DURATION} fps={SC.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Creatine-NoMusic" component={StoryCreatine} durationInFrames={SC.DURATION} fps={SC.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Commercial-Thumb" component={CommercialThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Commercial" component={Commercial} durationInFrames={CM.DURATION} fps={CM.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Commercial-NoMusic" component={Commercial} durationInFrames={CM.DURATION} fps={CM.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="BenchElbows-Thumb" component={BenchThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="BenchElbows" component={BenchElbows} durationInFrames={BE.DURATION} fps={BE.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="BenchElbows-NoMusic" component={BenchElbows} durationInFrames={BE.DURATION} fps={BE.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="FormCheck" component={FormCheck} durationInFrames={FC.DURATION} fps={FC.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="FormCheck-NoMusic" component={FormCheck} durationInFrames={FC.DURATION} fps={FC.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="FormClip" component={FormClip} durationInFrames={FL.DURATION} fps={FL.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="FormClip-NoMusic" component={FormClip} durationInFrames={FL.DURATION} fps={FL.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
  </>
);
