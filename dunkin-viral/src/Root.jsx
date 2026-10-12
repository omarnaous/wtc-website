import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

// logo: drop the official Dunkin' logo file into public/ and set its name here (e.g. "dunkin-logo.svg").
// Until then the end card sets the brand name as plain text; no logo is imitated.
const props = {
  brand: "Dunkin' Lebanon",
  handle: "@dunkinleb",
  logo: null,
  finePrint: "Spec concept by Appify · Offer and terms set by Dunkin' Lebanon",
};

const FORMATS = [
  { id: "Reel", width: 1080, height: 1920 },   // Reels / Stories / TikTok 9:16
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
];

export const Root = () => (
  <>
    {FORMATS.map((f) => (
      <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} defaultProps={props} />
    ))}
  </>
);
