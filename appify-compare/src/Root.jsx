import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { FPS, DURATION } from "./timing.js";

// Edit the comparison here. [label, subscription builder, Appify custom]
const props = {
  rows: [
    ["PRICE", "$468/year, forever", "$360 one-time"],
    ["OWNERSHIP", "You rent it", "You own it"],
    ["DESIGN", "Same templates as everyone", "Custom design + real animations"],
    ["CUSTOMIZATION", "Limited by the theme", "Every single detail"],
    ["ANALYTICS & ADMIN", "Generic reports & admin", "Custom analytics + admin panel"],
    ["DELIVERY", "You set it all up yourself", "Delivered in under 1 week"],
  ],
  price: 360,
  monthly: 39,
  cta: "Appify Ecommerce",
  url: "www.appify-lb.com",
};

const FORMATS = [
  { id: "Feed", width: 1080, height: 1350 },   // Instagram feed 4:5
  { id: "Reel", width: 1080, height: 1920 },   // Reels / Stories 9:16
];

export const Root = () => (
  <>
    {FORMATS.map((f) => (
      <Composition key={f.id} id={f.id} component={Main} durationInFrames={DURATION} fps={FPS} width={f.width} height={f.height} defaultProps={props} />
    ))}
  </>
);
