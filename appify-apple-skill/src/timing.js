// Beat sheet in frames (30 fps). Picture (Main.jsx) and sound/score.json both read these.
export const FPS = 30;
export const S = { hello: 0, title: 75, film: 165, fx: 330, spring: 510, brief: 630, check: 750, end: 855 };
export const DURATION = 975; // 32.5 s
// Film scene, relative to S.film: notch opens, changes widget, closes.
export const FILM = { open: 30, second: 95, close: 150 };
// Effects scene, relative to S.fx: button -> player move, pause morph, shrink into tile 01, other tiles stack in.
export const FX = { move: 6, moveEnd: 72, pause: 80, shrink: 112, tiles: 118, tileGap: 3 };
export const BRIEF = { first: 10, gap: 7 };
export const CHECK = { thumbs: 6, gap: 3, readout: 52 };
