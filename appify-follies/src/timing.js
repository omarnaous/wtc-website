// 24 s at 30 fps, 9:16, cut to an 80 BPM tape lo-fi bed (one bar = 90 frames, an 8th = 11.25 frames).
// The idea: ride the lift of the house. The site numbers its sections 01-06 like floors ("Six floors, one long
// afternoon"), so the film goes up a floor every bar: the lift doors close over the phone, a bell, the doors open on
// the next part of the real site. The lookbook floor breaks out of the phone, full bleed. Sound reads this file.
export const FPS = 30;
export const DURATION = 720;
export const BAR = 90, EIGHTH = 11.25;
// floor, first frame, last frame
export const FLOORS = [
  { n: "01", key: "hero", start: 0, end: 90 },
  { n: "02", key: "maison", start: 90, end: 180, label: "Maison FDM", title: "Six floors" },
  { n: "03", key: "boutique", start: 180, end: 270, label: "The boutique", title: "Accalmie" },
  { n: "04", key: "accessories", start: 270, end: 360, label: "Accessories", title: "Bold colour" },
  { n: "05", key: "lookbook", start: 360, end: 495, label: "The lookbook", title: "The lookbook" },
  { n: "06", key: "popups", start: 495, end: 585, label: "Where to find us", title: "Pop-ups" },
];
export const SHRINK = [50, 78];      // the hero film shrinks from full bleed into the phone
export const DOOR_CLOSE = 12, DOOR_OPEN = 14;
export const END = 585;              // end card
export const CREDIT = 660;           // "Website by appify"
// carousel steps land on the beats of each bar
export const SLIDES = { boutique: [202, 225, 248], accessories: [292, 315, 338] };
export const MAISON_STEPS = [104, 115, 126, 138, 149, 160];
export const LOOK0 = 360;            // 12 lookbook frames, one per 8th
