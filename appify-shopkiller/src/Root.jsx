import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

// Edit the offer here. `price` and `monthly` drive every number in the video.
export const props = {
  product: ["SHOPIFY", "KILLER"],
  price: 360,
  monthly: 30,
  cta: "STORE",
  url: "www.appify-lb.com",
};

export const Root = () => (
  <Composition id="ShopifyKiller" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={props} />
);
