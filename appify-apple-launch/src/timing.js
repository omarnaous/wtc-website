// 22 s at 30 fps. The bed is 72 BPM (a beat = 25 frames): "hello" takes one bar, then every scene is three beats.
// One idea: Appify lives in the notch. The black notch at the top centre of a Mac screen grows into a widget for each
// thing Appify makes, one scene at a time, and closes back to rest on the wordmark.
export const FPS = 30;
export const HELLO = 0;
export const SCENE0 = 100, SCENE_LEN = 75;
// facts from Appify's own site copy (appify-web/migrations/0002_seed.sql). Nothing else goes on screen.
export const SCENES = [
  { key: "web", caption: "A website for life, $0 a month.", tint: 3, w: 760, h: 300, wall: ["#06173F", "#2F6BFF", "#74C6FF"], tintC: "#9CC7FF" },
  { key: "anim", caption: "Animated websites, from $500.", tint: 2, w: 820, h: 300, wall: ["#14063F", "#5B2BFF", "#B28CFF"], tintC: "#C9B8FF" },
  { key: "apps", caption: "Apps for iOS and Android.", tint: 2, w: 620, h: 330, wall: ["#032A2E", "#14B8A6", "#5EEAD4"], tintC: "#9FF3E6" },
  { key: "motion", caption: "Motion that stops the scroll.", tint: 2, w: 860, h: 320, wall: ["#3A0A22", "#F0386B", "#FF9A3C"], tintC: "#FFB7C8" },
  { key: "ads", caption: "Ads, not boosts.", tint: 1, w: 700, h: 260, wall: ["#0B2A12", "#22C55E", "#A3E635"], tintC: "#B9F5C9" },
  { key: "days", caption: "Live in under 7 days.", tint: 2, w: 780, h: 220, wall: ["#3A2A04", "#F5A524", "#FFD23F"], tintC: "#FFE59A" },
];
export const sceneAt = (i) => SCENE0 + i * SCENE_LEN;
export const END = sceneAt(SCENES.length);     // black: the notch closes to rest, the wordmark, "Ideas, appified."
export const DURATION = END + 110;
