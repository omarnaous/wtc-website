import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

const props = { title: "Hello", subtitle: "made in code" };

// One component, every format. Remove the ones you don't need.
const FORMATS = [
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
  { id: "Reel", width: 1080, height: 1920 },   // Reels / Stories / TikTok 9:16
  // { id: "Wide", width: 1920, height: 1080 }, // YouTube / stream 16:9
  // { id: "Square", width: 1080, height: 1080 },
];

export const Root = () => (
  <>
    {FORMATS.map((f) => (
      <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} defaultProps={props} />
    ))}
  </>
);
