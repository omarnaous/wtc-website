// "FDM — Issue 01": a magazine for Follies d'Après-Midi, 22 s at 30 fps, cut to 120 BPM (beat = 15 frames, bar = 60).
// The idea: the lookbook as a printed issue. The cover (the model in front of the masthead), three editorial spreads
// where the frames of the lookbook land on the beat, page turns between them, and the back cover is an appify issue
// with Dev as the cover star, holding the house's orange bags. Picture and sound/mag_cues.py both read this file.
export const FPS = 30, BEAT = 15, BAR = 60;
export const DURATION = 690;
export const COVER = 0, DROP = 60;                 // the cover; the beat drops on the masthead
export const FLIPS = [120, 240, 360, 480];         // page turns (each takes FLIP frames, the new page is under it)
export const FLIP = 16;
export const PAGES = [
  { key: "cover", from: 0 },
  { key: "spread1", from: 120 },                   // Look 01: three frames, front / side / back
  { key: "spread2", from: 240 },                   // Look 02: full-bleed half page + LIBRE.
  { key: "spread3", from: 360 },                   // the contact sheet: all 12 frames, then one opens to full bleed
  { key: "back", from: 480 },                      // the appify issue: Dev on the cover, the offer
];
