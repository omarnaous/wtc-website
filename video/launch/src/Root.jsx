import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

const FORMATS = [
  { id: "Wide", width: 1920, height: 1080 },     // 16:9 — site, YouTube, LinkedIn
  { id: "Vertical", width: 1080, height: 1920 }, // 9:16 — Reels, Stories, TikTok
];

export const Root = () => (
  <>
    {FORMATS.map((f) => (
      <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} />
    ))}
  </>
);
