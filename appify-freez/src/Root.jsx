import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

// Raw 16:9 cut (it goes inside the browser-window frame later); a square cut for the feed.
export const Root = () => (
  <>
    <Composition id="Wide" component={Main} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
  </>
);
