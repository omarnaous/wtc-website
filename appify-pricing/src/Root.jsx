import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";
import { PLANS } from "./plans.js";

// One Instagram/TikTok Story per plan (1080 x 1920), each with music and an effects-only cut ("-NoMusic") for posting
// with a trending track.
export const Root = () => (
  <>
    {PLANS.map((plan) => [
      <Composition key={plan.id} id={plan.id} component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ plan, music: true }} />,
      <Composition key={plan.id + "n"} id={`${plan.id}-NoMusic`} component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ plan, music: false }} />,
    ])}
  </>
);
