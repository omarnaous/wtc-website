// The portfolio. Only real work goes here: client projects say who the client is, and Appify's own
// promos are tagged as originals. Media lives in public/media (re-encode new videos with scripts/encode.sh).
const m = (f) => `${import.meta.env.BASE_URL}media/${f}`;

export const MOTION = [
  {
    id: "wtc-launch", title: "Website launch ad", client: "Watch Trade Chronicles", tag: "Client work",
    blurb: "A 25-second launch film for a watch store's new website: kinetic type, animated counters, a strap try-on and a logo reveal.",
    video: m("wtc-launch.mp4"), poster: m("wtc-launch.jpg"), ratio: "16/9", length: "0:25", featured: true,
  },
  {
    id: "logo-reveal", title: "Logo reveal", client: "Appify", tag: "Appify original",
    blurb: "A spark falls onto a home screen, becomes an app icon and lands as the dot on the i.",
    video: m("logo-reveal.mp4"), poster: m("logo-reveal.jpg"), ratio: "4/5", length: "0:09",
  },
  {
    id: "motion-reel", title: "“Photos get scrolled” reel", client: "Appify", tag: "Appify original",
    blurb: "A mascot-led Instagram reel: a meme crash-zoom, a real case study and a real stat, with a synthesized soundtrack.",
    video: m("motion-reel.mp4"), poster: m("motion-reel.jpg"), ratio: "9/16", length: "0:50",
  },
  {
    id: "subscription-killer", title: "Subscription Killer launch", client: "Appify", tag: "Appify original",
    blurb: "A product launch reel for our one-time-payment store offer, voiced by Dev.",
    video: m("subscription-killer.mp4"), poster: m("subscription-killer.jpg"), ratio: "9/16", length: "0:35",
  },
  {
    id: "comparison", title: "Comparison graphic", client: "Appify", tag: "Appify original",
    blurb: "Subscription store vs. a store you own, row by row, as an animated feed post.",
    video: m("comparison.mp4"), poster: m("comparison.jpg"), ratio: "4/5", length: "0:15",
  },
  {
    id: "ideas-appified", title: "“Ideas, appified.”", client: "Appify", tag: "Appify original",
    blurb: "Kinetic typography: the letters of the slogan snap into app tiles.",
    video: m("ideas-appified.mp4"), poster: m("ideas-appified.jpg"), ratio: "9/16", length: "0:08",
  },
];

export const BUILDS = [
  {
    id: "wtc", kind: "Website", title: "Watch Trade Chronicles", place: "Beirut, Lebanon",
    url: "https://watchtradechronicles.com", urlLabel: "watchtradechronicles.com",
    blurb: "An online store for a watch reseller in Beirut, with a full admin dashboard behind it.",
    features: [
      "Product catalogue and collections",
      "Strap Studio: try straps on a watch before buying",
      "Orders, inventory and sales analytics",
      "Customer reviews, moderated before they go live",
      "Team accounts with invite links",
    ],
    stack: ["Next.js", "React", "Cloudflare Workers", "D1 database", "Tailwind", "Framer Motion"],
    shots: [m("wtc-3.2.jpg"), m("wtc-7.5.jpg"), m("wtc-10.3.jpg"), m("wtc-12.8.jpg"), m("wtc-22.8.jpg")],
    shotsNote: "Frames from the site's launch ad",
  },
  {
    id: "darebni", kind: "Mobile app", title: "Darebni AI", place: "",
    blurb: "An AI-powered fitness app.",
    features: [], stack: [], shots: [], soon: true,
  },
];
