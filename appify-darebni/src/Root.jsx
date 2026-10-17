import { Composition, Still } from "remotion";
import { Showcase, Photo } from "./Showcase.jsx";
import { FPS, DURATION } from "./timing.js";

// Darebni AI showcase (9:16). "Showcase" has music, "Showcase-NoMusic" is effects only; "Photo" is the card still.
export const Root = () => (
  <>
    <Composition id="Showcase" component={Showcase} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Showcase-NoMusic" component={Showcase} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Still id="Photo" component={Photo} width={1080} height={1920} />
  </>
);
