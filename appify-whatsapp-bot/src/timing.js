// Beat sheet (30 fps, 120 BPM: beat = 15 frames). Picture (Main.jsx) and sound (sound/build_cues.py) read these.
export const FPS = 30;
export const DURATION = 840;   // 28 s
export const HOOK = 0;         // the WhatsApp flood: booking by hand
export const FLIP = 90;        // "let a bot book them for you"
export const DEMO = 135;       // the live chat books a meeting
export const DIAGRAM = 450;    // how it works
export const CTA = 690;        // DM "BOT"
// the hook's incoming messages (frames)
export const FLOOD = [8, 16, 23, 30, 37, 44, 51, 58];
// the demo chat, frames relative to DEMO
export const CHAT = {
  ask: 12,                       // customer: can I book?
  type1: 26, days: 44,           // bot types, then offers days
  tapDay: 80, pickDay: 88,       // tap "Wed 4", it is sent
  type2: 98, times: 112,         // bot types, then offers times
  tapTime: 146, pickTime: 154,   // tap "12:30", it is sent
  type3: 164, booked: 180,       // bot types, then confirms
  calendar: 206,                 // the meeting lands in your calendar
};
// the diagram: one node per beat-pair, starting just after DIAGRAM
export const NODE0 = DIAGRAM + 30, NODE_STEP = 30;
