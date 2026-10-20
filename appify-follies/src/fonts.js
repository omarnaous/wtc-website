import { useFonts } from "./fx.jsx";
// the site's type: Instrument Serif and Inter (Google Fonts, kept locally so renders never depend on the network)
export const useSiteFonts = () => useFonts([
  ["Instrument Serif", "fonts2/InstrumentSerif-400.woff2", { weight: "400", style: "normal" }],
  ["Instrument Serif", "fonts2/InstrumentSerif-400i.woff2", { weight: "400", style: "italic" }],
  ["Inter", "fonts2/Inter-400.woff2", { weight: "400 600" }],
]);
