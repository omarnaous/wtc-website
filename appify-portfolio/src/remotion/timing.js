// Beat sheet, 30 fps, 9 s. sound/cues.json uses the same frames.
export const FPS = 30;
export const DURATION = 270;
export const T = {
  ignite: 6,     // the idea: a spark lights up
  fallA: 14,     // spark falls onto a home screen of apps
  land: 44,      // lands in the centre slot, icons ripple
  clearA: 52,    // other icons fall away, centre icon grows
  flipA: 70,     // icon flips in 3D...
  flipB: 82,     // ...revealing the Appify app icon
  hush: 80,      // anticipation: squeeze + dim
  hit: 86,       // the tile shatters, the "a" mark slams in
  morphA: 112,   // mark glides into the wordmark's "a"
  morphB: 130,
  lettersA: 128, // p, p, i, f, y pop out of tiles (one per 4 frames)
  sparkA: 130,   // spark leaves the mark...
  sparkLand: 148,// ...and lands as the i-dot
  tagA: 156,     // "Ideas, appified."
  urlA: 170,
  tagsA: 186,    // service tags pop in under the url, one every 3 frames
  sheen: 214,
};
