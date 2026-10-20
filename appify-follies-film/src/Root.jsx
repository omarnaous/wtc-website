import { Composition } from "remotion";
import { ShopThumb } from "./ShopThumb.jsx";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";
import { Magazine } from "./Magazine.jsx";
import { Shop } from "./Shop.jsx";
import { DURATION as SHOP } from "./shop-timing.js";
import { DURATION as MAG } from "./mag-timing.js";

export const Root = () => (
  <>
    <Composition id="Echappee" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Echappee-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Magazine" component={Magazine} durationInFrames={MAG} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Magazine-NoMusic" component={Magazine} durationInFrames={MAG} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Shop" component={Shop} durationInFrames={SHOP} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Shop-Thumb" component={ShopThumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="Shop-NoMusic" component={Shop} durationInFrames={SHOP} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
  </>
);
