import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

const props = {
  slogan: "Ideas, appified.",
  url: "www.appify-lb.com",
  // service tags under the url; empty list hides them
  tags: ["UI/UX", "Websites", "Mobile apps", "Motion graphics", "Framer Motion", "AI agents", "Meta Ads"],
};

export const Root = () => (
  <>
    <Composition id="RevealFeed" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} defaultProps={props} />
    <Composition id="RevealReel" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={props} />
  </>
);
