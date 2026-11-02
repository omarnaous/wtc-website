// Darebni form reel over the supplied bench-press clip (public/bench-clip.mp4, 18.5 s, kept out of git). The clip
// stacks three lifters: elbows tucked (top, ✕), about 45° (middle, ✓), flared to 90° (bottom, ✕), first from above,
// then from the side, then from above again. Darebni's labels sit at the top-left of each row and change with the
// clip's own phases (found from its frames): angle lines 4.6–7.3 s, camera move 9.5–10.4 s, side-view lines
// 11.6–14.4 s, move back 15.6–16.5 s. The push-day reel's end card (plan page, tracker page, download) follows.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

export const BE = { FPS: 30, CLIP: 555, LINES: 137, MOVE1: [285, 312], SIDE_LINES: 349, MOVE2: [468, 495], END_LEN };
BE.DURATION = BE.CLIP + BE.END_LEN;
const { FPS, CLIP, LINES, MOVE1, MOVE2 } = BE;
const RED = "#FF4D5E", GRN = "#3DDC97";
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.2) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: "0% 50%" });

// the clip as a card: 720x1280 scaled to 853 wide, under the title
const CARD = { x: 113, y: 400, w: 853, h: 1517 }, ROW = CARD.h / 3;
const ROWS = [
  { good: false, top: "Elbows tucked in", topWhy: "less chest, more triceps", side: "Forearm angled", sideWhy: "the bar isn't over the elbow" },
  { good: true, top: "Elbows at about 45°", topWhy: "the chest does the work", side: "Forearm vertical", sideWhy: "bar stacked over the elbow" },
  { good: false, top: "Elbows flared to 90°", topWhy: "the load moves to your shoulders", side: "Forearm angled", sideWhy: "the bar isn't over the elbow" },
];

function Label({ f, i }) {
  const r = ROWS[i], c = r.good ? GRN : RED;
  const side = f >= MOVE1[1] && f < MOVE2[0];
  // hidden while the camera moves, then back with the view's own wording
  const vis = f < MOVE1[0] ? 1 : f < MOVE1[1] + 4 ? interpolate(f, [MOVE1[0], MOVE1[0] + 6, MOVE1[1] - 2, MOVE1[1] + 4], [1, 0, 0, 1], clamp)
    : f < MOVE2[0] ? 1 : interpolate(f, [MOVE2[0], MOVE2[0] + 6, MOVE2[1] - 2, MOVE2[1] + 4], [1, 0, 0, 1], clamp);
  const at = f < MOVE1[1] ? 18 + i * 12 : f < MOVE2[0] ? MOVE1[1] + i * 6 : MOVE2[1] + i * 6;
  const whyAt = f < MOVE1[1] ? LINES + i * 6 : f < MOVE2[0] ? BE.SIDE_LINES + i * 6 : MOVE2[1] + 10 + i * 6;
  const end = f >= MOVE2[1];   // last view: only the right answer stays loud
  const dim = end && !r.good ? 0.55 : 1;
  const why = side ? r.sideWhy : r.topWhy;
  return (
    <div style={{ position: "absolute", left: CARD.x + 24, top: CARD.y + ROW * i + 18, opacity: vis * dim, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ ...pop(sp(f, at, 12, 240)), display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 20px 10px 12px", borderRadius: 18, background: "rgba(7,7,26,.82)", border: `2.5px solid ${c}`,
        boxShadow: `0 10px 30px rgba(0,0,0,.45), 0 0 24px ${c}55` }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: c, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 30, color: B.ink }}>{r.good ? "✓" : "✕"}</div>
        <div style={{ ...D, fontSize: 44, color: B.cream }}>{side ? r.side : r.top}</div>
      </div>
      <div style={{ marginTop: 8, marginLeft: 6, padding: "6px 14px", borderRadius: 10, background: "rgba(7,7,26,.72)", ...UIR, fontSize: 28, color: r.good ? "#B9F5DA" : "#FFC2C8", ...rise(sp(f, whyAt)) }}>{why}</div>
    </div>
  );
}

function Title({ f }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 232, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ ...D, fontSize: 80, color: B.cream, whiteSpace: "nowrap", ...pop(sp(f, 0, 10, 260), 1.3) }}>Still making these</div>
        <div style={{ ...D, fontSize: 80, color: B.lo, whiteSpace: "nowrap", marginTop: 4, ...pop(sp(f, 6, 10, 260), 1.3) }}>bench press mistakes?</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, ...rise(sp(f, 4)) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <span style={{ ...D, fontSize: 34, color: B.cream, letterSpacing: "0.04em" }}>Darebni AI</span>
      </div>
    </div>
  );
}

// the same two-page end card as the push-day reel (Main.jsx Outro): the weekly-plan page, then the tracker page,
// with the download button held under both
function EndCard({ f }) {
  if (f < CLIP) return null;
  return (
    <AbsoluteFill style={{ background: B.ink }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 62%, rgba(91,78,229,.35), transparent 60%)" }} />
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(139,128,255,.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(139,128,255,.08) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <Outro f={f} start={CLIP} />
    </AbsoluteFill>
  );
}

export const BenchElbows = ({ music = true }) => {
  const f = useCurrentFrame();
  useFonts([["Cond", "barlow-condensed-latin-800-normal.woff2", { weight: "800" }], ["Barlow", "barlow-latin-600-normal.woff2", { weight: "600" }], ["BarlowR", "barlow-latin-500-normal.woff2", { weight: "500" }]]);
  const card = sp(f, 0, 14, 160);
  return (
    <AbsoluteFill style={{ background: B.ink }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(91,78,229,.35), transparent 65%)" }} />
      <Sequence durationInFrames={CLIP + 4} layout="none">
        <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 36, overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,.55), 0 0 0 3px rgba(139,128,255,.55), 0 0 80px rgba(91,78,229,.35)",
          opacity: Math.min(1, card * 2), transform: `translateY(${(1 - Math.min(1, card)) * 80}px)` }}>
          <OffthreadVideo src={staticFile("bench-clip.mp4")} muted style={{ width: CARD.w, height: CARD.h }} />
        </div>
        <Title f={f} />
        {ROWS.map((_, i) => <Label key={i} f={f} i={i} />)}
      </Sequence>
      <EndCard f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [CLIP - 2, CLIP, CLIP + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.03} />
      <Audio src={staticFile(music ? "bench.wav" : "bench-sfx.wav")} />
    </AbsoluteFill>
  );
};
