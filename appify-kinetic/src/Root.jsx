import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  // Reels / Stories / TikTok, 9:16
  <Composition id="IdeasAppified" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ first: "Ideas,", second: "appified." }} />
);
