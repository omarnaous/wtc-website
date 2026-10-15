// One motion effect on the 8 s clock (references/effects.md): a pill button grows into a player card (effect 01),
// holds while something small keeps living, then returns. Frame 240 = frame 0, so it loops seamlessly.
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Audio, staticFile } from "remotion";
import { useFonts, fonts, clamp, type } from "./apple.jsx";
import { LOOP } from "./timing.js";

// Play -> pause as a morph of two shapes (each half of the triangle becomes one bar), never a swap.
const PLAY = [[[7, 3], [15, 8], [15, 18], [7, 23]], [[15, 8], [23, 13], [23, 13], [15, 18]]];
const PAUSE = [[[6, 3], [11, 3], [11, 23], [6, 23]], [[15, 3], [20, 3], [20, 23], [15, 23]]];
const playPause = (t) => PLAY.map((q, i) => "M" + q.map(([x, y], j) => `${x + (PAUSE[i][j][0] - x) * t} ${y + (PAUSE[i][j][1] - y) * t}`).join(" L") + " Z").join(" ");
const io = Easing.bezier(0.65, 0, 0.35, 1); // cubic in-out, symmetric so the return retraces the move
export function Loop({ label, title, accent }) {
  useFonts(fonts);
  const f = useCurrentFrame(), { moveEnd, holdEnd, duration } = LOOP;
  const p = interpolate(f, [0, moveEnd, holdEnd, duration], [0, 1, 1, 0], { ...clamp, easing: io });
  const live = interpolate(f, [moveEnd, holdEnd], [0, 1], clamp);                 // the hold keeps moving
  const lab = 1 - interpolate(p, [0, 0.25], [0, 1], clamp), body = interpolate(p, [0.5, 1], [0, 1], clamp);
  const W = 260 + (820 - 260) * p, H = 84 + (560 - 84) * p, R = 42 - 14 * p;
  const pause = interpolate(f, [moveEnd + 12, moveEnd + 22, holdEnd - 10, holdEnd], [0, 1, 1, 0], { ...clamp, easing: io });
  return (
    <AbsoluteFill style={{ background: "#F5F5F7", alignItems: "center", justifyContent: "center" }}>
      {/* ghost of the button where it started */}
      <div style={{ position: "absolute", width: 260, height: 84, borderRadius: 42, border: "1.5px dashed rgba(0,0,0,.08)", opacity: p * 0.8 }} />
      <div style={{ width: W, height: H, borderRadius: R, background: "#fff", overflow: "hidden", position: "relative",
        boxShadow: `0 1px 2px rgba(0,0,0,.06), 0 ${10 + 30 * p}px ${30 + 60 * p}px rgba(0,0,0,${0.08 + 0.06 * p})` }}>
        <div style={{ position: "absolute", inset: 0, opacity: body, background: `linear-gradient(135deg, ${accent}22, ${accent}55)` }} />
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, opacity: body }}>
          <div style={{ ...type(40), color: "#1D1D1F", marginBottom: 22 }}>{title}</div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,.1)" }}>
            <div style={{ height: 6, width: `${8 + 70 * live}%`, borderRadius: 3, background: accent }} />
          </div>
        </div>
        {/* the play icon travels from the button's left edge to the card centre, grows a disc, morphs to pause */}
        <div style={{ position: "absolute", left: 30 + (W / 2 - 30 - 30) * p, top: H / 2 - 30 - 60 * body, width: 60, height: 60, borderRadius: 30,
          background: `rgba(29,29,31,${0.85 * body})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={26} height={26} viewBox="0 0 26 26"><path fill={body > 0.5 ? "#fff" : "#1D1D1F"} d={playPause(pause)} /></svg>
        </div>
        <div style={{ position: "absolute", left: 96, top: 0, height: 84, display: "flex", alignItems: "center", ...type(30), fontWeight: 600, color: "#1D1D1F", opacity: lab }}>{label}</div>
      </div>
      <Audio src={staticFile("loop.wav")} />
    </AbsoluteFill>
  );
}
