// "Follies d'Après-Midi — the boutique, online": 26 s at 30 fps on a 120 BPM grid (beat = 15, 8th = 7.5, bar = 60).
// 1) a fast lookbook rush (cut-outs on colour fields on the 8ths, triptychs on the beats, punch-ins), 2) the live site
// in a browser window like the other concept reels: hero film, the floors, the boutique, a product added to the bag,
// the bag, the lookbook and pop-ups, a chip naming each feature, 3) Dev with the FDM bags beside the full list of
// e-commerce features, the appify logo and the DM. Picture and sound/shop_cues.py read this file.
export const FPS = 30, BEAT = 15, EIGHTH = 7.5, BAR = 60;
export const DURATION = 780;
export const RUSH = 0;            // bar 1: 8 cut-outs on the 8ths
export const TRIPTYCH = 60;       // bar 2: one look per beat, three angles in three strips
export const PUNCH = 120;         // bar 3: full-bleed photos punching in on the 8ths
export const SITE = 180;          // the browser window
export const END = 540;           // Dev, the feature list, the logo
// what the browser shows, bar by bar: [from, kind, page-y from, page-y to (css px), chip]
// the site: public/rec is a frame-accurate recording of the live homepage (one frame per reel frame, from SITE),
// a 1.2 s hold on the hero film, then one scroll to the footer. Chips change as each section enters (frames from SITE).
export const REC_FRAMES = 360;
export const CHIPS = [
  [6, "A cinematic film as the homepage"],
  [71, "Six floors to explore the house"],
  [131, "The boutique, by collection"],
  [174, "Accessories boutique"],
  [217, "Shop the lookbook"],
  [257, "Pop-ups & newsletter sign-up"],
];
export const FEATURES = [
  "Collections & categories",
  "Product pages with size chart",
  "Bag, subtotal & checkout",
  "Search across every piece",
  "Shop the lookbook",
  "Accessories boutique",
  "Pop-ups & newsletter sign-up",
  "Exchange policy built in",
  "Made for every screen",
];
export const FEAT0 = 566;         // first feature ticks in, then one per 8th
