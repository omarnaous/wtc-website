// Darebni form reel for abs day, the biceps-curl correction format (BicepsCurl.jsx) over the library's plank clip
// (public/lib/t409.mp4 = "Treinos (409).mp4", 0-20.4 s, end card cut; the other app's print on the back of the top
// painted out frame by frame in the shoulder-blade shot; kept out of git). The clip is one view with five fixes, each
// turning from red to green (timings read from the clip): hands clasped, head dropping, shoulder blades caving in, hips
// sagging, feet together. Its two camera moves into and out of the back shot (where the print shows at angles that can't
// be cleaned) are hard-cut. The opening voice-over ("Think you're doing planks right? Watch this.") stays audible; the
// last correct plank holds as a still under "Do it right"; the shared end card follows.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { useFonts, clamp, Grain } from "./fx.jsx";
import { B, D, UI, UIR, Outro } from "./Main.jsx";
import { END_LEN } from "./timing.js";

// the clip plays as four pieces with hard cuts, skipping its camera swings (where the other app's print shows at angles the
// clean-up can't reach): [clip from, clip to] -> placed back to back. Reel times below are after the cuts.
const PIECES = [[0, 246], [264, 331], [352, 612]];
const PLAYED = PIECES.reduce((a, [x, y]) => a + y - x, 0);   // 573
export const PF = { FPS: 30, CLIP: PLAYED + 60, END_LEN,      // the last correct plank holds 2 s as a still
  SEG: [[68, 120, 158], [176, 206, 242], [248, 281, 311], [323, 356, 391], [421, 454, 497]],   // [label in, turns green, out]
  DEMO: 515, CUTS: [246, 313] };
PF.DURATION = PF.CLIP + PF.END_LEN;
const { FPS, CLIP, SEG, DEMO } = PF;
// the clip's own voice-over (0-4 s) stays audible; then the clip's audio fades out and the music (ducked under the
// voice in sound/build_bicepscurl_cues.py) comes back up
const VO_END = 72;
const RED = "#FF4D5E", GRN = "#3DDC97";
const sp = (f, at, d = 12, st = 220) => spring({ frame: f - at, fps: FPS, config: { damping: d, stiffness: st } });
const rise = (p, d = 40) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - Math.min(1, p)) * d}px)` });
const pop = (p, k = 1.2) => ({ opacity: Math.min(1, p * 3), transform: `scale(${interpolate(p, [0, 1], [k, 1])})`, transformOrigin: "0% 50%" });

const CARD = { x: 113, y: 420, w: 853, h: 1517 };
const FIX = [
  { wrong: "Hands clasped together", right: "Forearms parallel", why: ["your shoulders roll in", "palms down, a solid base"] },
  { wrong: "Head dropping", right: "Neck in line", why: ["it strains your neck", "eyes on the floor, just ahead"] },
  { wrong: "Shoulder blades caving in", right: "Push the floor away", why: ["your shoulders sink", "spread your shoulder blades"] },
  { wrong: "Hips sagging", right: "One straight line", why: ["your lower back takes the load", "squeeze glutes, brace your abs"] },
  { wrong: "Feet glued together", right: "Feet hip-width", why: ["you shake out sooner", "a steadier base, a longer hold"] },
];

function Label({ f, i }) {
  const [a, g, out] = SEG[i], L = FIX[i];
  if (f < a - 2 || f > out + 6) return null;
  const good = f >= g, c = good ? GRN : RED, o = interpolate(f, [out - 6, out], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: CARD.x + 26, top: CARD.y + 26, opacity: o, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ ...D, fontSize: 30, color: B.xlo, letterSpacing: "0.12em", marginBottom: 10, ...rise(sp(f, a)) }}>Mistake {i + 1}/{FIX.length}</div>
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
        {["3 × 30–60 s", "Rest 45 s", "RPE 8"].map((x, k) => (
          <div key={x} style={{ padding: "8px 16px", borderRadius: 12, background: k ? "rgba(7,7,26,.6)" : B.primary, border: `2px solid ${k ? "rgba(139,128,255,.45)" : B.lo}`, ...D, fontSize: 32, color: B.cream, ...rise(sp(f, DEMO + 6 + k * 4)) }}>{x}</div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {FIX.map((x, k) => <div key={x.right} style={{ ...UI, fontSize: 34, color: B.cream, ...rise(sp(f, DEMO + 18 + k * 12)) }}><span style={{ color: GRN }}>✓</span> {x.right}</div>)}
      </div>
    </div>
  );
}

function Title({ f }) {
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 232, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ ...D, fontSize: 80, color: B.cream, whiteSpace: "nowrap", ...pop(sp(f, 0, 10, 260), 1.3) }}>Think you're</div>
        <div style={{ ...D, fontSize: 80, color: B.lo, whiteSpace: "nowrap", marginTop: 4, ...pop(sp(f, 6, 10, 260), 1.3) }}>planking right?</div>
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

export const PlankFix = ({ music = true }) => {
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
                <OffthreadVideo src={staticFile("lib/t409.mp4")} startFrom={a} muted={k > 0} volume={(t) => interpolate(t, [VO_END, VO_END + 12], [1, 0], clamp)}
                  style={{ position: "absolute", inset: 0, width: CARD.w, height: CARD.h }} />
              </Sequence>
            );
          })}
          {f >= PLAYED && <Img src={staticFile("lib/clean/plank-end.png")} style={{ position: "absolute", inset: 0, width: CARD.w, height: CARD.h }} />}
        </div>
        <Title f={f} />
        {SEG.map((_, i) => <Label key={i} f={f} i={i} />)}
        <DoItRight f={f} />
      </Sequence>
      <EndCard f={f} />
      <AbsoluteFill style={{ background: B.lo, opacity: interpolate(f, [CLIP - 2, CLIP, CLIP + 6], [0, 0.35, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />
      <Grain f={f} opacity={0.03} />
      <Audio src={staticFile(music ? "plankfix.wav" : "plankfix-sfx.wav")} />
    </AbsoluteFill>
  );
};
