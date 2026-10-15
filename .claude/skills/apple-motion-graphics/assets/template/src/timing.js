// Beat sheet in frames. Picture (Film.jsx, Loop.jsx) and sound/cues.json both use these numbers.
export const FPS = 30;

// Launch film: about 2.5 s a scene. Scene 0 is "hello", the last scene is the black close.
export const SCENE = 75;
export const FILM_SCENES = 4;                  // hello + 2 feature scenes + close (match the scenes prop)
export const END_HOLD = 45;                    // the closed notch + product line holds 1.5 s more
export const FILM_DURATION = SCENE * FILM_SCENES + END_HOLD;
export const at = (i) => i * SCENE;            // first frame of scene i

// Notch size per scene in 1920-wide px: [width, height]. Rest = the closed MacBook notch.
export const REST = [200, 34];
export const NOTCH = [[620, 120], [760, 220], [560, 160], REST];

// Effect loop: one 8 s clock (see references/effects.md).
export const LOOP = { duration: 240, moveEnd: 66, holdEnd: 198 }; // move 0-2.2 s, hold to 6.6 s, return by 8.0 s
