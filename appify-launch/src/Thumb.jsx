// Reel cover: Dev (the Appify mascot) rides the rocket phone off the track, thumbs up, over the trend headline.
// Text and the mascot stay inside the centre 1080x1440, which is what the Instagram profile grid shows.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "./fx.jsx";
import { Dev } from "./Dev.jsx";

const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.98 };
const M = { fontFamily: "Mono", letterSpacing: "0.18em", textTransform: "uppercase" };
const SHIFT = 190;                                  // the frame is moved down so the phone sits under the headline

export const Thumb = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"]]);
  const phoneTop = 925 + SHIFT, cx = 545;
  const w = 280, h = (w * 830) / 420;
  return (
    <AbsoluteFill style={{ background: "#040309", overflow: "hidden" }}>
      <Img src={staticFile("thumb-bg.png")} style={{ position: "absolute", left: 0, top: SHIFT, width: 1080, height: 1920 }} />
      <AbsoluteFill style={{ background: "radial-gradient(60% 40% at 50% 48%, rgba(91,43,255,.22), rgba(0,0,0,0) 70%)" }} />
      {/* speed lines behind the rider */}
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {[[300, 640, 170], [250, 760, 230], [330, 880, 150], [770, 700, 190], [800, 830, 140]].map(([x, y, l], k) => (
          <line key={k} x1={x} y1={y} x2={x} y2={y + l} stroke="rgba(255,255,255,.35)" strokeWidth="5" strokeLinecap="round" />
        ))}
      </svg>
      {/* Dev standing on the top edge of the phone */}
      <div style={{ position: "absolute", left: cx - w / 2 + 6, top: phoneTop - h * 0.985 + 16 }}>
        <Dev width={w} thumbs={1} smile={1} happy={1} brow={14} lid={0.05} tilt={-4} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,3,9,.95) 0%, rgba(4,3,9,.75) 22%, rgba(4,3,9,0) 34%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 262, textAlign: "center" }}>
        <div style={{ ...M, fontSize: 32, color: "#ff2d6f" }}>● The Tesla Roadster trend</div>
        <div style={{ ...D, fontSize: 112, color: "#fff", marginTop: 22, textShadow: "0 6px 40px rgba(0,0,0,.8)" }}>but it's<br />an app</div>
      </div>
    </AbsoluteFill>
  );
};
