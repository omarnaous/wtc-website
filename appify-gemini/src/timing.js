// The picture follows the voice: vo/vo.py writes src/vo.json (each line's start frame and length), the scenes hang off it.
// One idea: the Gemini spark is the one doing the work. It types the job as the cursor, bursts into the mark, then hops
// through each scene doing what the voice says (ticks the plan, writes the code, scans the sketch, builds the site),
// keeps twinkling as a star while you sleep, and comes back as the mark.
import VO from "./vo.json";
export { VO };
export const FPS = 30;
export const DURATION = VO.total;
const at = (k) => VO[k].at;
export const S = {
  ask: 0,                         // a small old-style chat
  hand: at("hand") - 6,           // the prompt bar: the spark types the whole job
  send: at("hand") + 58,          // the job is sent; the spark charges (a quiet beat)
  name: at("name"),               // the spark bursts into the Gemini mark
  plans: at("plans") - 6, codes: at("codes") - 6, sees: at("sees") - 6, builds: at("builds") - 6,
  sleep: at("sleep") - 6,         // night: the spark is a star, the phone gets the results
  end: at("end") - 4,             // the mark, "Gemini 3.5", "Just hand it over."
};
export const PROMPT = "Plan the launch, build the site, book the venue and send the invites.";
