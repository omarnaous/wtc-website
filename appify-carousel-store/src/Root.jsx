import { Composition } from "remotion";
import { Slide } from "./Carousel.jsx";
import { W, H, N, FPS, LOOP } from "./timing.js";

export const Root = () => (
  <>
    {Array.from({ length: N }, (_, i) => (
      <Composition key={i} id={`Store360-${i + 1}`} component={Slide} durationInFrames={LOOP} fps={FPS} width={W} height={H} defaultProps={{ slide: i }} />
    ))}
  </>
);
