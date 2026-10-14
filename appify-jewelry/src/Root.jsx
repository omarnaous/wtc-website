import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { Cover } from "./Cover.jsx";
import { FPS, DURATION } from "./timing.js";

// One format for this one: the 9:16 Reel and its thumbnail.
export const Root = () => (
  <>
    <Composition id="Reel" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="CoverReel" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  </>
);
