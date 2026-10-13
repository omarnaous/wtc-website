import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { Cover } from "./Cover.jsx";
import { FPS, DURATION } from "./timing.js";

const FORMATS = [
  { id: "Reel", width: 1080, height: 1920 },   // Reels / TikTok 9:16
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
];
export const Root = () => (
  <>
    {FORMATS.map((f) => <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} />)}
    {FORMATS.map((f) => <Composition key={"Cover" + f.id} id={"Cover" + f.id} component={Cover} durationInFrames={1} fps={FPS} width={f.width} height={f.height} />)}
  </>
);
