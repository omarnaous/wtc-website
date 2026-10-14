// 15 s at 30 fps. Silent: the user adds trending audio in-app.
// Footage: the user's screen recording of the Earshot site (1280x762, 30 fps, 327 frames) in public/rec/.
export const FPS = 30;
export const DURATION = 450;
export const SRC_FRAMES = 327;
export const END = 330;          // spark cut to the game-over end card: "LEVEL COMPLETE", from $500, DM
// [reel frame, source frame]: real time, the last world (Aurora) slowed a little so it reads
export const MAP = [[0, 0], [300, 300], [END, 326]];
export const WORLDS = [[0, "Mirage Miles"], [84, "Pack Light"], [210, "Tide Runs"], [300, "Aurora Relay"]];   // [frame, name]
export const SECTIONS = [84, 210, 300];   // a punch-in + flash on each new world
export const CUTS = [END];
