// "How we made it" (9:16): Dev explains the Roadster-trend reel was built with Claude, the prompt types out and is cut
// off behind a blur, the finished reel plays, then "Comment PROMPT and we'll DM you". Everything hangs off Dev's
// voice: vo/bts_vo.py writes src/bts-vo.json (line starts, word timings, mouth). sound/bts_cues.py reads both.
import VO from "./bts-vo.json";
export { VO };
export const FPS = 30;
const L = Object.fromEntries(VO.lines.map((l) => [l.key, l]));
export const BTS_DURATION = VO.duration;
export const CHAT = L.claude.start - 4;     // the clip makes way for the Claude chat
export const TYPE = L.prompt.start + 6;     // the prompt starts typing
export const TYPE_END = L.nah.start - 6;
export const LOCK = L.nah.start;            // the rest of the prompt blurs, lock chip
export const REPLY = LOCK + 24;             // the reply with the finished reel
export const CTA = L.join.start - 4;        // "Join the Roadster trend"
export const COMMENT = L.cta.start + 4;     // PROMPT gets typed into the comment box
export const OURS = L.ours, NAH = L.nah;
