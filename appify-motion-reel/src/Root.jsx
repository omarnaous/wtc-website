import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";
import VO from "./vo.json";

export const props = {
  client: "Watch Trade Chronicles",
  film: "Website launch ad",
  cta: "Motion",
  url: "www.appify-lb.com",
};

export const Root = () => (
  <Composition id={VO.id || "MotionShowcase"} component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={props} />
);
