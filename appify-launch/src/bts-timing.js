// "How we made it" (16 s, 9:16): Dev explains the Roadster-trend reel was built with Claude, the prompt types out and
// is cut off behind a blur, the finished reel plays, then "Comment PROMPT and we'll DM you". Read by sound/bts_cues.py.
export const FPS = 30;
export const BTS_DURATION = 480;
// Dev's lines: [start, end, text]
export const LINES = [
  [10, 82, "Everyone's posting the Tesla Roadster trend 🚀"],
  [86, 150, "So we made one… with an app."],
  [154, 214, "The whole video? Built with Claude."],
  [218, 296, "Here's the prompt we used…"],
  [300, 362, "…nah, not all of it 😏"],
  [366, 430, "Want to join the Roadster trend?"],
];
export const CHAT = 150;        // the clip makes way for the Claude chat
export const TYPE = 214;        // the prompt starts typing
export const TYPE_END = 296;
export const LOCK = 300;        // the rest of the prompt blurs, lock chip
export const REPLY = 318;       // the reply with the finished reel
export const CTA = 366;         // "Comment PROMPT"
export const COMMENT = 392;     // PROMPT gets typed into the comment box
