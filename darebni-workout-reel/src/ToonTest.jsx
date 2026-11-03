import { AbsoluteFill } from "remotion";
import { SportDev } from "./cartoon/SportDev.jsx";
const P = [{}, { shock: 1, brow: 20 }, { point: 1, smile: 1, open: 0.5 }, { happy: 1, smile: 1, thumbs: 1 }, { lid: 0.5, smile: 0.1, brow: 2 }, { wave: 1, waveAng: 20, smile: 1, open: 0.4 }];
export const ToonTest = () => (
  <AbsoluteFill style={{ background: "#1B1745" }}>
    {P.map((p, i) => <div key={i} style={{ position: "absolute", left: (i % 3) * 360 + 20, top: 40 }}><SportDev who="karim" width={300} {...p} /></div>)}
    {P.map((p, i) => <div key={i} style={{ position: "absolute", left: (i % 3) * 360 + 20, top: 1000 }}><SportDev who="sami" width={300} {...p} /></div>)}
  </AbsoluteFill>
);
