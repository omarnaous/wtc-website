// The launch reel for the new folliesdapresmidi.com. It runs the site's own new hero film (src/fdm/HeroFilm.jsx,
// copied from the site repo: leader, ÉPICÉE., the contact sheet, LIBRE., Échappée 4 à 7 on paper, the wordmark),
// then cuts on a chilli wipe to the launch card: the new site on a laptop and a phone, both playing that film in
// their hero and scrolling into the shop. Picture and sound/build_cues.py both read this file.
export const FPS = 30;
export const FILM_CUT = 728;          // where the reel leaves the film (it is fading to black)
export const STAGE = FILM_CUT;        // the launch card starts under the wipe
export const STAGE_LEN = 250;
export const DURATION = FILM_CUT + STAGE_LEN;
// the film's own acts (frames), for the sound
export const ACT = { leader: 0, flash: 70, epicee: 70, wipe1: 244, libre: 250, paper: 430, wipe2: 556, wordmark: 565 };
// inside the launch card (relative to STAGE)
export const S = { wipe: 0, laptop: 10, phone: 26, title: 30, scroll: [96, 196], url: 62, credit: 120 };
// the devices play the film from here (the contact sheet), pre-rendered to public/hero-*.mp4
export const DEVICE_FILM_FROM = 274, DEVICE_FILM_LEN = 260;
