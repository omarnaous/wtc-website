// 20 s at 30 fps on a 120 BPM grid (one beat = 15 frames, one bar = 60). Picture and sound/build_cues.py read this.
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 15;
export const DEV_IN = 6;        // spotlight on, Dev rises and waves
export const HELLO = 24;        // "Hi, we're" / "Appify."
export const IDEA = 72;         // "Got an" / "idea?"
export const SPARK = 84;        // a spark lights above Dev's head
export const FLY = 105;         // the spark flies at the camera (quiet beat)
export const WEB = 120;         // drop: websites & web apps (WTC launch, Oddball)
export const SECOND = 168;      // the second site slides in
export const APP = 240;         // mobile apps
export const MOTION = 330;      // motion graphics: three reels
export const END = 450;         // wordmark, tagline, services, Book a call
export const CUTS = [WEB, APP, MOTION, END];
