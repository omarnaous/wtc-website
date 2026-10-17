// The questions and answers from the FAQ on appify-lb.com (the faqs table), cut to Story length without adding
// anything the site doesn't say. Each Story has its own background and its own Instagram-native sticker, so the
// highlight doesn't feel like one Story eight times. `kind` picks the layout in Main.jsx.
export const FAQS = [
  { id: "Cost", kind: "photo", bg: "violet", tilt: -3, q: "How much does a website cost?",
    a: ["$360", "for an e-commerce website.", "Paid once."], b: "Web apps with custom features from $500.", photo: "img/wtc.jpg", photoTag: "watchtradechronicles.com" },
  { id: "Time", kind: "countdown", bg: "ocean", tilt: 2, q: "How long does it take to build a website?",
    a: ["Under 7 days."], b: "Bigger projects get a timeline agreed with you before we start." },
  { id: "Fees", kind: "quiz", bg: "lilac", tilt: -2, q: "Are there monthly fees?",
    quiz: { title: "Monthly fees with Appify?", options: ["$39 / month", "$0. Pay once."], right: 1 }, a: ["You pay once.", "The website is yours."], b: "Hosting is included." },
  { id: "Own", kind: "neon", bg: "ink", tilt: 3, q: "Do I own my website? Can I edit it myself?",
    a: ["Yes."], list: ["Products", "Prices", "Text", "Images"], b: "Every site comes with an admin panel." },
  { id: "Apps", kind: "app", bg: "photoApp", tilt: -2, q: "Do you build mobile apps?",
    a: ["Yes. iOS + Android."], b: "From the first screens to the App Store and Google Play.", link: "Darebni AI · App Store" },
  { id: "Motion", kind: "tags", bg: "magenta", tilt: 2, q: "What are motion graphics and content ads?",
    a: ["Short videos", "made for social media."], tags: ["#reels", "#productads", "#logoreveals", "#3D", "#kinetictype"], b: "With sound designed to the picture." },
  { id: "Ads", kind: "quiz", bg: "midnight", tilt: -3, q: "Is boosting a post the same as running Meta ads?",
    quiz: { title: "Boosting a post =", options: ["Running Meta ads", "One button, limited targeting"], right: 1 }, a: ["We run real campaigns:"], b: "the right objective, retargeting, creative tests and tracked results." },
  { id: "Book", kind: "link", bg: "violet2", tilt: 2, q: "How do I book a call with Appify?",
    a: ["On WhatsApp.", "The call is free."], b: "Pick a day and time, send it, and we reply to confirm.", link: "appify‑lb.com/book" },
];
