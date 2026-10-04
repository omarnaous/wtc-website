import PulseApp, { PULSE } from "./remotion/PulseApp.jsx";
import TabblApp, { TABBL } from "./remotion/TabblApp.jsx";
import CedarSite, { CEDAR } from "./remotion/CedarSite.jsx";
import LumenSite, { LUMEN } from "./remotion/LumenSite.jsx";

// Concept projects. Replace each entry with real client work as it ships:
// keep `kind`, swap the title/summary/stack, and set `concept: false`.
export const PROJECTS = [
  {
    id: "pulse", kind: "app", title: "Pulse", concept: true,
    summary: "A fitness tracker built around streaks and weekly plans. Activity rings, adaptive workouts and a heart-rate view that reads at a glance.",
    stack: ["React Native", "Expo", "HealthKit"], comp: PulseApp, meta: PULSE,
  },
  {
    id: "cedar", kind: "web", title: "Cedar Estates", concept: true,
    summary: "A property marketplace for coastal and mountain towns. Search-first hero, parallax landscape and listings that load as you scroll.",
    stack: ["Next.js", "Mapbox", "Sanity"], comp: CedarSite, meta: CEDAR,
  },
  {
    id: "tabbl", kind: "app", title: "Tabbl", concept: true,
    summary: "Order-ahead for a mezze restaurant. Add to cart in one tap, pay in two, and follow the order live from kitchen to door.",
    stack: ["Flutter", "Stripe", "Firebase"], comp: TabblApp, meta: TABBL,
  },
  {
    id: "lumen", kind: "web", title: "Lumen Dental", concept: true,
    summary: "A clinic site where booking is the homepage. Pick a day, pick a slot, get an SMS reminder. Built to cut phone calls in half.",
    stack: ["Astro", "Cal.com API", "Twilio"], comp: LumenSite, meta: LUMEN,
  },
];
