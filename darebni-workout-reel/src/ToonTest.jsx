import { AbsoluteFill } from "remotion";
import { Toon, blendExpr } from "./cartoon/Toon.jsx";
const list = ["neutral", "panic", "shock", "confused", "suspicious", "happy", "smug", "worried"];
const list2 = ["smirk", "laugh", "explain", "calm", "excited", "listen", "neutral", "happy"];
export const ToonTest = () => (
  <AbsoluteFill style={{ background: "#1B1745" }}>
    {list.map((x, i) => <div key={x} style={{ position: "absolute", left: (i % 4) * 270, top: Math.floor(i / 4) * 480, transform: "scale(.38)", transformOrigin: "0 0" }}><Toon who="karim" e={blendExpr("neutral", x, 1)} mouth={i % 2 ? 0.6 : 0} /></div>)}
    {list2.map((x, i) => <div key={x} style={{ position: "absolute", left: (i % 4) * 270, top: 960 + Math.floor(i / 4) * 480, transform: "scale(.38)", transformOrigin: "0 0" }}><Toon who="sami" e={blendExpr("neutral", x, 1)} mouth={i % 2 ? 0.6 : 0} /></div>)}
  </AbsoluteFill>
);
