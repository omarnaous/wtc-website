// Cover for the "how we made it" reel: Dev winks at the viewer next to the Claude chat with the prompt cut off behind
// a lock, the finished reel beside it. Text and Dev stay inside the centre 1080x1440 the profile grid shows.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts } from "./fx.jsx";
import { Dev } from "./Dev.jsx";

const C = { ink: "#0A0913", uv: "#5B2BFF", pink: "#ff2d6f", yellow: "#FFD23F" };
const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 0.98 };
const UI = { fontFamily: "UI", fontWeight: 600 };
const M = { fontFamily: "Mono", letterSpacing: "0.16em", textTransform: "uppercase" };

export const Thumb2 = () => {
  useFonts([["Display", "Sora-600.ttf", { weight: "600" }], ["Mono", "GeistMono-500.ttf"], ["UI", "Geist-600.ttf", { weight: "600" }], ["UI", "Geist-400.ttf", { weight: "400" }]]);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(143,114,255,.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(143,114,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, rgba(91,43,255,.45), transparent 62%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 262, textAlign: "center" }}>
        <div style={{ ...M, fontSize: 30, color: C.pink }}>● How we made it</div>
        <div style={{ ...D, fontSize: 104, color: "#fff", marginTop: 22 }}>The Roadster trend,<br />made with <span style={{ color: C.yellow }}>Claude</span></div>
      </div>
      {/* the finished reel, tilted behind the chat */}
      <div style={{ position: "absolute", left: 690, top: 600, width: 300, height: 533, borderRadius: 30, overflow: "hidden", border: "4px solid rgba(255,255,255,.18)", boxShadow: "0 40px 90px rgba(0,0,0,.6)", transform: "rotate(5deg)" }}>
        <Img src={staticFile("thumb-bg.png")} style={{ position: "absolute", width: 594, height: 1056, left: -150, top: -400 }} />
      </div>
      {/* the chat with the prompt cut off */}
      <div style={{ position: "absolute", left: 70, top: 640, width: 680, background: "#fff", borderRadius: 28, padding: "30px 34px 36px", boxShadow: "0 30px 80px rgba(0,0,0,.55)", transform: "rotate(-2deg)", overflow: "hidden" }}>
        <div style={{ ...M, fontSize: 22, color: "rgba(10,9,19,.45)", marginBottom: 14 }}>Prompt</div>
        <div style={{ ...UI, fontWeight: 400, fontSize: 34, lineHeight: 1.36, color: "#1b1a22" }}>Make a 9:16 reel for Appify. Nighttime engineering test: a phone running our app rides a giant curved steel track…</div>
        <div style={{ ...UI, fontWeight: 400, fontSize: 34, lineHeight: 1.36, color: "#1b1a22", filter: "blur(9px)", marginTop: 8 }}>fires three rocket thrusters, launches off the top and lands upright in smoke</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: -50 }}>
          <div style={{ ...UI, fontSize: 30, color: "#fff", background: C.ink, padding: "14px 28px", borderRadius: 999 }}>🔒 Comment PROMPT</div>
        </div>
      </div>
      {/* Dev winking, pointing at it */}
      <div style={{ position: "absolute", left: 40, top: 1110 }}>
        <Dev width={300} point={1} wink={1} smile={1} brow={18} lid={0.05} tilt={-4} />
      </div>
      <div style={{ position: "absolute", left: 370, top: 1240, padding: "22px 28px", background: "#fff", border: `5px solid ${C.ink}`, borderRadius: 14, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: "Mono", fontWeight: 600, fontSize: 46, color: C.ink, transform: "rotate(-3deg)" }}>Want the prompt? 👀</div>
    </AbsoluteFill>
  );
};
