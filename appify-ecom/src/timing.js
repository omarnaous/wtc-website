// 20 s at 30 fps on a 120 BPM tech-house grid (one beat = 15 frames, a bar = 60). sound/build_cues.py reads this file.
export const FPS = 30;
export const DURATION = 600;
export const BEAT = 15;
export const MSG = "Hey Appify, I want an ecommerce website";
export const TYPE0 = -6, TYPE_RATE = 1.1;          // typing starts before frame 0 so the first frame already reads "Hey Appi…"
export const TYPED = TYPE0 + Math.ceil(MSG.length / TYPE_RATE);   // 30: prompt fully typed
export const SEND = 44;          // the prompt is sent
export const DOTS = 52;          // Dev is typing…
export const REPLY = 72;         // "Say less. Your store, live in 7 days."
export const GAP = 96;           // the music drops out: a beat of tension before the drop
export const BUILD = 120;        // the drop: the store builds itself, one day every 3 beats
export const DAY_LEN = 45;
export const DAYS = ["UI/UX design", "Products & cart", "Checkout & payments", "Admin panel", "Custom analytics", "Motion graphics", "Live"];
export const dayAt = (i) => BUILD + i * DAY_LEN;
export const PRICE = BUILD + DAYS.length * DAY_LEN;   // 435: $360 once
export const END = 495;          // your turn: DM LAUNCH
export const CUTS = [BUILD, PRICE, END];
