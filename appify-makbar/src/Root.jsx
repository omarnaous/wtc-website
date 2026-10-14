import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

const FORMATS = [
  { id: "Reel", width: 1080, height: 1920 },   // Reels / TikTok 9:16 (the footage is vertical)
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
];
export const Root = () => <>{FORMATS.map((f) => <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} />)}</>;
