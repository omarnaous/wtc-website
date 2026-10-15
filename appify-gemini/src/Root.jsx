import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

// 9:16 for Reels / TikTok / Shorts (the layout fits the 1080x1920 stage; other sizes letterbox it)
export const Root = () => <Composition id="Reel" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />;
