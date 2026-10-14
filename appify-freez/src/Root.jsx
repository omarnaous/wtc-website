import { Composition } from "remotion";
import { Film } from "./Film.jsx";
import { FPS, DURATION } from "./timing.js";

// Raw 16:9 film (it goes inside the browser-window frame later).
export const Root = () => <Composition id="Film" component={Film} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />;
