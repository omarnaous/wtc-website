import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

export const props = {
  client: "Watch Trade Chronicles",
  film: "Website launch ad",
  cta: "Motion",
  url: "www.appify-lb.com",
};

export const Root = () => (
  <Composition id="MotionShowcase" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={props} />
);
