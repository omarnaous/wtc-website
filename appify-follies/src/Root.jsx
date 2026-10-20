import { Composition } from "remotion";
import { Reel, HeroOnly } from "./Reel.jsx";
import { FPS, DURATION } from "./timing.js";
import { FILM } from "./fdm/HeroFilm.jsx";

export const Root = () => (
  <>
    <Composition id="Follies" component={Reel} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Follies-NoMusic" component={Reel} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    {/* rendered once to public/hero-desk.mp4 and public/hero-phone.mp4 (frames 250-510) for the device screens */}
    <Composition id="HeroDesk" component={HeroOnly} durationInFrames={FILM.duration} fps={FPS} width={1440} height={900} />
    <Composition id="HeroPhone" component={HeroOnly} durationInFrames={FILM.duration} fps={FPS} width={780} height={1698} />
  </>
);
