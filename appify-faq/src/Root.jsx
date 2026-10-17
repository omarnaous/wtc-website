import { Composition, Still } from "remotion";
import { Main, Cover } from "./Main.jsx";
import { FAQS } from "./faqs.js";
import { FPS, DURATION } from "./timing.js";

// One Instagram Story per question (1080 x 1920), with music and an effects-only cut ("-NoMusic"), plus the highlight
// cover. Ids are numbered so they post in order: 1-Cost, 2-Time, ...
export const Root = () => (
  <>
    {FAQS.map((faq, i) => [
      <Composition key={faq.id} id={`${i + 1}-${faq.id}`} component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ faq, index: i, total: FAQS.length, music: true }} />,
      <Composition key={faq.id + "n"} id={`${i + 1}-${faq.id}-NoMusic`} component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ faq, index: i, total: FAQS.length, music: false }} />,
    ])}
    <Still id="HighlightCover" component={Cover} width={1080} height={1920} />
  </>
);
