import { Composition } from "remotion";
import { Film } from "./Film.jsx";
import { Loop } from "./Loop.jsx";
import { FPS, FILM_DURATION, LOOP } from "./timing.js";

// Every word here must come from the user's facts list. These are placeholders to replace, never ship them.
const film = {
  product: "PRODUCT", line: "Its one line, word for word.",
  menu: ["PRODUCT", "File", "Edit", "View", "Window"],
  scenes: [
    { caption: "First feature lives here.", wall: { base: "#0B1E4A", a: "#2F6BFF", b: "#9B5CFF" }, tint: "rgba(170,200,255,.75)" },
    { caption: "Second feature, in one line.", wall: { base: "#2A0C1E", a: "#FF6A3D", b: "#FF2D8F" }, tint: "rgba(255,200,180,.8)" },
  ],
};
const loop = { label: "Preview", title: "Real title here", accent: "#0A84FF" };

export const Root = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={FILM_DURATION} fps={FPS} width={1920} height={1080} defaultProps={film} />
    <Composition id="FilmReel" component={Film} durationInFrames={FILM_DURATION} fps={FPS} width={1080} height={1920} defaultProps={film} />
    <Composition id="Loop" component={Loop} durationInFrames={LOOP.duration} fps={FPS} width={1080} height={1080} defaultProps={loop} />
  </>
);
