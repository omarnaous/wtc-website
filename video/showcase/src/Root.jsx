import { Composition } from "remotion";
import { Main, Pov } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  <>
  <Composition id="POV" component={Pov} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  <Composition id="Reel" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  </>
);
