import { Composition, AbsoluteFill } from "remotion";
import { Girl } from "./Girl.jsx";
import { Main, Cover } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

const FORMATS = [
  { id: "Reel", width: 1080, height: 1920 },   // Reels / TikTok 9:16
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
];
// mascot reference sheet: rest, phone, point + talk, wave + happy, shock, wink + phone
const Poses = () => (
  <AbsoluteFill style={{ background: "#0A0913", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", padding: 40 }}>
    {[{}, { phone: 1, look: -6 }, { point: 1, look: 8, open: 0.5 }, { wave: 1, waveAng: 10, happy: 1 }, { shock: 1 }, { wink: 1, phone: 1 }].map((p, i) => <Girl key={i} width={330} {...p} />)}
  </AbsoluteFill>
);
export const Root = () => (
  <>
    {FORMATS.map((f) => <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} />)}
    {FORMATS.map((f) => <Composition key={"Cover" + f.id} id={"Cover" + f.id} component={Cover} durationInFrames={1} fps={FPS} width={f.width} height={f.height} />)}
    <Composition id="Poses" component={Poses} durationInFrames={1} fps={FPS} width={2100} height={800} />
  </>
);
