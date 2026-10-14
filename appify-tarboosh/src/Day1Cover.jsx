// Day 1 thumbnail: the slow-motion burst in the window frame, the series hook on top, the chocolate buddy peeking in.
import { AbsoluteFill, useVideoConfig } from "remotion";
import { useFonts } from "./fx.jsx";
import { FONTS, Stage } from "./Main.jsx";
import { Backdrop, Window, T } from "./Day1.jsx";
import { Buddy } from "./Buddy.jsx";

const D = { fontFamily: "Display", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 };
const caption = { color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.7)", textAlign: "center" };
export const Day1Cover = () => {
  const ready = useFonts(FONTS);
  const { width: W, height: H } = useVideoConfig();
  const feed = H < 1920;
  return (
    <AbsoluteFill>
      <Backdrop f={0} />
      <Stage W={W} H={H}>
        <div style={{ position: "absolute", left: 0, right: 0, top: feed ? 330 : 250, ...caption }}>
          <div style={{ ...D, fontSize: feed ? 112 : 104, lineHeight: 1.04 }}>Day 1 of making ads<br />for <span style={{ color: T.gold }}>Lebanese brands</span></div>
        </div>
        <div style={{ position: "absolute", left: 14, top: 640 }}><Window g={214} ready={ready} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1380, ...caption }}>
          <div style={{ ...D, fontSize: 96, color: T.gold }}>Tarboosh</div>
        </div>
        <div style={{ position: "absolute", left: 760, top: 1290, transform: "rotate(8deg)" }}><Buddy width={250} wave={1} waveAng={10} look={-8} /></div>
      </Stage>
    </AbsoluteFill>
  );
};
