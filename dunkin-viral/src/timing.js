// Beat sheet: 20 s at 30 fps on a 120 BPM grid (one beat = 15 frames). Picture, camera and sound share it.
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 15;
export const T = {
  hook: 0,        // a $1 bill flutters down: "WHAT CAN $1 GET YOU?" one line per beat
  smash: 60,      // the cup slams into frame (beat 4): the answer
  ice1: 75, ice2: 90, ice3: 105,  // three ice cubes, one per beat (ASMR clinks)
  pour: 120,      // coffee pours in...
  full: 150,      // ...full; milk blooms and swirls
  straw: 180,     // straw drops in
  turn: 195,      // the cup turns to show its print
  price: 210,     // "$1" slam (beat 14)
  week: 240,      // seven hard cuts, one per day (beats 16-22)
  every: 345, single: 360, day: 375,  // EVERY. SINGLE. DAY. punch zooms
  drop: 390,      // silence; camera flips to top-down
  eyes: 405,      // latte-art smiley: eyes pop (beat 27), the beat comes back
  mouth: 420,     // the smile draws
  finale: 465,    // pull back: donuts orbit, "$1 A DAY"
  end: 510,       // end card copy, held to the last frame
};
