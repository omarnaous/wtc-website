// Darebni form reel for arm day, the deadlift / push-up correction format (DeadliftFix.jsx) over the library's EZ-bar skull
// crusher clip (public/lib/t459.mp4 = "Treinos (459).mp4", 0-20.7 s used, end card cut, kept out of git; the source app's
// waistband print is tiny and unreadable in every shot, so the clip is used as is). One view, two fixes turning from red
// to green: upper arms drifting back (side), elbows flaring out (front); then correct reps under "Do it right". The
// opening voice-over ("You've been doing skull crushers wrong. Let's fix that today.") stays audible, then the clip's
// audio fades out before its own "save this" line; the shared end card follows.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

// the clip plays as four pieces with hard cuts, skipping its camera swings (where the other app's print shows at angles the
// clean-up can't reach): [clip from, clip to] -> placed back to back. Reel times below are after the cuts.
const PIECES = [[0, 620]];
const PLAYED = PIECES.reduce((a, [x, y]) => a + y - x, 0);   // 573
export const SKF = { FPS: 30, CLIP: PLAYED, END_LEN,
  SEG: [[8, 70, 122], [150, 216, 280]],   // [label in, turns green, out]
  MOVES: [128, 284, 450], DEMO: 292 };
SKF.DURATION = SKF.CLIP + SKF.END_LEN;
const { FPS, CLIP, SEG, DEMO } = SKF;
// the clip's own voice-over (0-4 s) stays audible; then the clip's audio fades out and the music (ducked under the
// voice in sound/build_bicepscurl_cues.py) comes back up
const VO_END = 98;
const RED = "#FF4D5E", GRN = "#3DDC97";
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.2) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: "0% 50%" });

const CARD = { x: 113, y: 420, w: 853, h: 1517 };
const FIX = [
  { wrong: "Upper arms drifting back", right: "Upper arms vertical", why: ["it turns into a pullover", "tension stays on the triceps"] },
  { wrong: "Elbows flaring out", right: "Elbows tucked in", why: ["stress on the elbow joint", "triceps do all the work"] },
];

function Label({ f, i }) {
  const [a, g, out] = SEG[i], L = FIX[i];
  if (f < a - 2 || f > out + 6) return null;
  const good = f >= g, c = good ? GRN : RED, o = interpolate(f, [out - 6, out], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: CARD.x + 26, top: CARD.y + 26, opacity: o, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.12em", marginBottom: 10, padding: "4px 12px", borderRadius: 10, background: "rgba(7,7,26,.8)", ...rise(sp(f, a)) }}>Mistake {i + 1}/{FIX.length}</div>
      <div key={good ? "g" : "w"} style={{ ...pop(sp(f, good ? g : a + 4, 11, 260)), display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 22px 12px 14px", borderRadius: 18,
        background: "rgba(7,7,26,.85)", border: `3px solid ${c}`, boxShadow: `0 10px 30px rgba(0,0,0,.45), 0 0 26px ${c}66` }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: c, display: "flex", alignItems: "center", justifyContent: "center", ...D, fontSize: 34, color: B.ink }}>{good ? "✓" : "✕"}</div>
        <div style={{ ...D, fontSize: 52, color: B.cream, whiteSpace: "nowrap" }}>{good ? L.right : L.wrong}</div>
      </div>
      <div key={good ? "gw" : "ww"} style={{ marginTop: 10, marginLeft: 6, padding: "7px 16px", borderRadius: 10, background: "rgba(7,7,26,.75)", ...UIR, fontSize: 32, color: good ? "#B9F5DA" : "#FFC2C8", ...rise(sp(f, (good ? g : a) + 14)) }}>
        {good ? L.why[1] : L.why[0]}
      </div>
    </div>
  );
}

function DoItRight({ f }) {
  if (f < DEMO - 2 || f > CLIP + 4) return null;
    const o = interpolate(f, [CLIP - 6, CLIP], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: CARD.x + 26, top: CARD.y + 26, opacity: o, padding: "22px 26px", borderRadius: 24, background: "rgba(7,7,26,.8)", border: "2px solid rgba(139,128,255,.4)" }}>
      <div style={{ ...D, fontSize: 30, color: GRN, letterSpacing: "0.1em", ...rise(sp(f, DEMO)) }}>Do it right</div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {["3 × 10-12", "Rest 90 s", "RPE 8"].map((x, k) => (
          <div key={x} style={{ padding: "8px 16px", borderRadius: 12, background: k ? "rgba(7,7,26,.6)" : B.primary, border: `2px solid ${k ? "rgba(139,128,255,.45)" : B.lo}`, ...D, fontSize: 32, color: B.cream, ...rise(sp(f, DEMO + 6 + k * 4)) }}>{x}</div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {[...FIX, { right: "Lower to your forehead" }].map((x, k) => <div key={x.right} style={{ ...UI, fontSize: 34, color: B.cream, ...rise(sp(f, DEMO + 18 + k * 12)) }}><span style={{ color: GRN }}>✓</span> {x.right}</div>)}
      </div>
    </div>
  );
}

function Title({ f }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 232, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ ...D, fontSize: 80, color: B.cream, whiteSpace: "nowrap", ...pop(sp(f, 0, 10, 260), 1.3) }}>Skull crushers</div>
        <div style={{ ...D, fontSize: 80, color: B.lo, whiteSpace: "nowrap", marginTop: 4, ...pop(sp(f, 6, 10, 260), 1.3) }}>hurting your elbows?</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, ...rise(sp(f, 4)) }}>
        <Img src={staticFile("darebni-icon.png")} style={{ width: 50, height: 50, borderRadius: 13 }} />
        <span style={{ ...D, fontSize: 30, color: B.cream, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Darebni AI</span>
      </div>
    </div>
  );
}

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

export const SkullFix = ({ music = true }) => {
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
          {PIECES.map(([a, b], k) => {
            const at = PIECES.slice(0, k).reduce((s2, [x, y]) => s2 + y - x, 0);
            return (
              <Sequence key={k} from={at} durationInFrames={b - a + (k === PIECES.length - 1 ? 4 : 0)} layout="none">
                <OffthreadVideo src={staticFile("lib/t459.mp4")} startFrom={a} muted={k > 0} volume={(t) => interpolate(t, [VO_END, VO_END + 12], [1, 0], clamp)}
                  style={{ position: "absolute", inset: 0, width: CARD.w, height: CARD.h }} />
              </Sequence>
            );
          })}
                  </div>
        <Title f={f} />
        {SEG.map((_, i) => <Label key={i} f={f} i={i} />)}
        <DoItRight f={f} />
      </Sequence>
      <EndCard f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [CLIP - 2, CLIP, CLIP + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.03} />
      <Audio src={staticFile(music ? "skullfix.wav" : "skullfix-sfx.wav")} />
    </AbsoluteFill>
  );
};
