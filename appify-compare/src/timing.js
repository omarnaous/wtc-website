// Beat sheet, 30 fps, 17.3 s, 100 BPM (one beat = 18 frames). sound/cues.json uses the same frames.
export const FPS = 30;
export const DURATION = 520;
export const T = {
  title: 0,        // "Subscription builder vs Appify custom"
  heads: 30,       // the two column headers slide in
  row0: 54,        // first row; one row every 2 beats
  rowGap: 36,
  hush: 336,       // quiet beat: music drops, the left column starts to fade
  verdict: 354,    // WINNER stamp on Appify, the builder column greys out
  out: 390,        // table lifts away
  end: 402,        // end card: own it, pay once, price, extras, CTA, logo
};
export const rowAt = (i) => T.row0 + i * T.rowGap;
