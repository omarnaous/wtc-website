import { Composition } from "remotion";
import { Panna, PannaThumb, PK } from "./Panna.jsx";
export const Root = () => (
  <>
    <Composition id="Panna" component={Panna} durationInFrames={PK.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Panna-NoMusic" component={Panna} durationInFrames={PK.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Panna-Thumb" component={PannaThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
