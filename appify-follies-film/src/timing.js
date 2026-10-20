// "Échappée" — a 20 s fashion film for Follies d'Après-Midi, cut to a 120 BPM runway house bed (beat = 15 frames,
// bar = 60). The idea: the lookbook steps into the brand's own desert film. Each look is cut out of its studio shot
// and stands, giant, in front of a huge word, turning on every beat (front, side, back), one look per bar; then all
// four line up on the desert floor, and the film's empty afternoon comes back for the wordmark.
// Picture and sound/build_cues.py both read this file.
export const FPS = 30;
export const BEAT = 15, BAR = 60;
export const DURATION = 600;
export const DROP = 60;                       // the first look lands
// one look per bar: lookbook frames (front, side, back), the word behind it and the ground under it
export const LOOKS = [
  { at: 60, shots: ["01", "02", "03"], word: "ÉPICÉE.", bg: "film", ink: "#F27043" },
  { at: 120, shots: ["04", "05", "06"], word: "LIBRE.", bg: "orange", ink: "#F2EDE6" },
  { at: 180, shots: ["07", "08", "09"], word: "4 À 7", bg: "ink", ink: "#F27043", italic: true },
  { at: 240, shots: ["10", "11", "12"], word: "BEIRUT", bg: "film2", ink: "#F2EDE6" },
];
export const LINEUP = 300;                    // the four looks line up on the desert floor, one per beat
export const TURN = 360;                      // ...and turn to the back
export const END = 420;                       // the empty afternoon and the wordmark
export const END_TEXT = [432, 450, 468, 486]; // wordmark, "Épicée. Libre.", URL, credit
