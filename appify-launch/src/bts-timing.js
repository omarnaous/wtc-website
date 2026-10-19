// "How we made it" (9:16): Dev explains the Roadster-trend reel was built with Claude, the prompt types out and is cut
// off behind a blur, the finished reel plays, then "Comment PROMPT and we'll DM you". Everything hangs off Dev's
// voice: vo/bts_vo.py (V1, punchy) and vo/bts_vo2.py (V2, smooth and slower) write src/bts-vo*.json (line starts,
// word timings, mouth). sound/bts_cues.py reads the same anchors.
export const FPS = 30;
export function timing(VO) {
  const L = Object.fromEntries(VO.lines.map((l) => [l.key, l]));
  return {
    L, DURATION: VO.duration,
    CHAT: L.claude.start - 4,       // the clip makes way for the Claude chat
    TYPE: L.prompt.start + 6,       // the prompt starts typing
    TYPE_END: L.nah.start - 6,
    LOCK: L.nah.start,              // the rest of the prompt blurs, lock chip
    REPLY: L.too.start + 2,         // the reply with the finished reel, as he says "you can make one too"
    CTA: L.cta.start - 6,           // "Join the Roadster trend"
    COMMENT: L.cta.start + 2,       // PROMPT gets typed into the comment box as he says it
  };
}
