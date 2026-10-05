import { Composition } from "remotion";
import { Reveal } from "./Reveal.jsx";
import { FPS, DURATION } from "./timing.js";

const props = { url: "appifylb.netlify.app" };

export const Root = () => (
  <>
    {/* Instagram feed post, 4:5 */}
    <Composition id="RevealFeed" component={Reveal} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} defaultProps={props} />
    {/* Reels / Stories, 9:16 */}
    <Composition id="RevealReel" component={Reveal} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={props} />
  </>
);
