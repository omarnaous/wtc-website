import { Composition } from "remotion";
import { Reveal } from "./Reveal.jsx";
import { Board } from "./Board.jsx";
import { FPS, DURATION } from "./timing.js";

// The reveal in every format, plus the static brand board.
const FORMATS = [
  { id: "Square", width: 1080, height: 1080 },
  { id: "Reel", width: 1080, height: 1920 },
  { id: "Wide", width: 1920, height: 1080 },
];

export const Root = () => (
  <>
    {FORMATS.map((f) => (
      <Composition key={f.id} id={f.id} component={Reveal} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} />
    ))}
    <Composition id="Board" component={Board} durationInFrames={1} fps={FPS} width={1920} height={1080} />
  </>
);
