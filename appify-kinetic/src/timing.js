// 120 BPM at 30 fps = 15 frames per beat. 4 bars = 16 beats = 240 frames (8 s).
// sound/cues.json uses the same frames.
export const FPS = 30;
export const DURATION = 240;
export const BEAT = 15;
export const BEATS = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225];
export const T = {
  letters: [0, 8, 15, 23, 30, 38], // "Ideas," outlined letters drop on 8th notes
  solid: 60,      // bar 2 downbeat: word fills solid on an ultraviolet field
  implode: 75,    // letters collapse into the idea (spark)
  spark: 90,      // the spark appears (chime)
  riserA: 92,
  silence: 112,   // dead air
  hit: 120,       // bar 3 downbeat: app icons burst onto a home-screen grid
  flip: 135,      // icons flip to show letters
  collapse: 150,  // icons snap into the word "appified."
  ideas: 165,     // "Ideas," returns above it
  end: 180,       // bar 4: lockup + wordmark, hold
  sheen: 200,
};
