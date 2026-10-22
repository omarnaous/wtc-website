import { Composition } from "remotion";
import { Slide } from "./Carousel.jsx";
import { InvSlide, INV_N } from "./Inventory.jsx";
import { AppSlide, APP_N } from "./Apps.jsx";
import { W, H, N, FPS, LOOP } from "./timing.js";

export const Root = () => (
  <>
    {Array.from({ length: N }, (_, i) => (
      <Composition key={i} id={`Store360-${i + 1}`} component={Slide} durationInFrames={LOOP} fps={FPS} width={W} height={H} defaultProps={{ slide: i }} />
    ))}
    {Array.from({ length: INV_N }, (_, i) => (
      <Composition key={`inv${i}`} id={`Inventory-${i + 1}`} component={InvSlide} durationInFrames={LOOP} fps={FPS} width={W} height={H} defaultProps={{ slide: i }} />
    ))}
    {Array.from({ length: APP_N }, (_, i) => (
      <Composition key={`app${i}`} id={`App-${i + 1}`} component={AppSlide} durationInFrames={LOOP} fps={FPS} width={W} height={H} defaultProps={{ slide: i }} />
    ))}
  </>
);
