import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { Cover } from "./Cover.jsx";
import { Day1 } from "./Day1.jsx";
import { Day1Cover } from "./Day1Cover.jsx";
import { FPS, DURATION, D1_DURATION } from "./timing.js";

const FORMATS = [
  { id: "Reel", width: 1080, height: 1920 },   // Reels / TikTok 9:16
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
];
export const Root = () => (
  <>
    {FORMATS.map((f) => <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} />)}
    {FORMATS.map((f) => <Composition key={"Cover" + f.id} id={"Cover" + f.id} component={Cover} durationInFrames={1} fps={FPS} width={f.width} height={f.height} />)}
    {/* series cut: "Day 1 of making ads for Lebanese brands", in the website-reel frame */}
    {FORMATS.map((f) => <Composition key={"Day1" + f.id} id={"Day1" + f.id} component={Day1} durationInFrames={D1_DURATION} fps={FPS} width={f.width} height={f.height} />)}
    {FORMATS.map((f) => <Composition key={"Day1Cover" + f.id} id={"Day1Cover" + f.id} component={Day1Cover} durationInFrames={1} fps={FPS} width={f.width} height={f.height} />)}
  </>
);
