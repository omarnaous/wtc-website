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
export const SHOTS = [
  [180, "hero", 0, 0, "A cinematic film as the homepage"],
  [240, "page", 860, 1000, "Six floors to explore the house"],
  [300, "page", 1900, 2000, "The boutique, by collection"],
  [360, "product", 0, 0, "Product pages, sizes & size chart"],
  [390, "added", 0, 0, "Add to bag in one tap"],
  [420, "bag", 0, 0, "A bag with subtotal & checkout"],
  [480, "page", 3600, 4500, "Shop the lookbook · pop-ups"],
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
