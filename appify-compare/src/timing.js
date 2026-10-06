// Beat sheet, 30 fps, 15 s, 90 BPM (one beat = 20 frames). sound/cues.json uses the same frames.
export const FPS = 30;
export const DURATION = 450;
export const T = {
  title: 0,        // "Subscription builder vs Appify custom"
  heads: 30,       // the two column headers slide in
  row0: 60,        // first row; one row every 2 beats
  rowGap: 40,
  hush: 286,       // quiet beat: music drops, the left column starts to fade
  verdict: 300,    // 6/6 stamp on Appify, the builder column greys out
  out: 340,        // table lifts away
  end: 352,        // end card: own it, pay once, price, CTA, logo
};
export const rowAt = (i) => T.row0 + i * T.rowGap;
