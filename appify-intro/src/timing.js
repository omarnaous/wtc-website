// 26 s at 30 fps on a 120 BPM grid (one beat = 15 frames, one bar = 60). Picture and sound/build_cues.py read this.
// Story: who we are -> our mission -> what we do (five services, each with a real example) -> the slogan -> Book.
export const FPS = 30;
export const DURATION = 780;
export const BEAT = 15;
export const DEV_IN = 6;        // spotlight on, Dev rises and waves
export const HELLO = 18;        // "Hi, we're" / "Appify."
export const MISSION = 84;      // cut: our mission
export const M_WORDS = [102, 117, 132];   // "websites," "apps" "& content" land on the beat
export const M_SPOT = 156;      // "that put your brand in the spotlight." (the beam flares)
export const WHAT = 210;        // cut + drop: what we do
export const SVC_LEN = 75;      // each service holds 2.5 s (five beats)
export const SVCS = [0, 1, 2, 3, 4].map((k) => WHAT + k * SVC_LEN);   // 210 285 360 435 510
export const IDEA = 585;        // cut: "Got an idea?"
export const SPARK = 600;       // the spark lights above Dev's head
export const APPIFY = 618;      // "Appify it."
export const FLY = 645;         // the camera pushes into the spark (quiet beat)
export const END = 660;         // wordmark, slogan, services, the call to action
export const CUTS = [MISSION, WHAT, IDEA, END];
