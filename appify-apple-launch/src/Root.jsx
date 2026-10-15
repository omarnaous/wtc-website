import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

// A Mac screen, so 16:9.
export const Root = () => <Composition id="Film" component={Main} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />;
