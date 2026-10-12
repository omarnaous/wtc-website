import { Composition } from "remotion";
import { Main, Cover } from "./Main.jsx";
import { CoverLogo, CoverStore, CoverProduct, CoverShowreel, AvatarUV, AvatarInk, AvatarSky } from "./Covers.jsx";
import { FPS, DURATION } from "./timing.js";

const FORMATS = [
  { id: "Reel", width: 1080, height: 1920 },   // Reels / TikTok 9:16
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
];
export const Root = () => (
  <>
    {FORMATS.map((f) => <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} />)}
    {FORMATS.map((f) => <Composition key={"Cover" + f.id} id={"Cover" + f.id} component={Cover} durationInFrames={1} fps={FPS} width={f.width} height={f.height} />)}
    {[["PostLogo", CoverLogo], ["PostStore", CoverStore], ["PostProduct", CoverProduct], ["PostShowreel", CoverShowreel]].map(([id, c]) => <Composition key={id} id={id} component={c} durationInFrames={1} fps={FPS} width={1080} height={1920} />)}
    {[["AvatarUV", AvatarUV], ["AvatarInk", AvatarInk], ["AvatarSky", AvatarSky]].map(([id, c]) => <Composition key={id} id={id} component={c} durationInFrames={1} fps={FPS} width={1080} height={1080} />)}
  </>
);
