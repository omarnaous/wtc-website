// The four Appify plans, exactly as priced by Appify. Each one renders as its own Story.
// line: [text, included?] — included=false prints as a "—" note (what the plan does not include).
export const PLANS = [
  {
    id: "Store360", n: 1, accent: "#8F72FF",
    question: ["How much is", "an online store?"],
    name: "Online store · Standard",
    price: 360, from: false, totalLabel: "Total · paid once", stamp: "PAID ONCE",
    lines: [["Basic template", true], ["Admin panel", true], ["One-time payment", true], ["No customizations", false]],
    next: "Custom stores from $500",
  },
  {
    id: "Store500", n: 2, accent: "#74C6FF",
    question: ["Want it built", "around your brand?"],
    name: "Online store · Custom",
    price: 500, from: true, totalLabel: "Starting at", stamp: "CUSTOM",
    lines: [["Full customization", true], ["Scroll animations", true], ["Automations & systems", true], ["Custom dashboards", true], ["Admin panel", true]],
    next: "Mobile apps from $999",
  },
  {
    id: "App999", n: 3, accent: "#39E29B",
    question: ["Got an", "app idea?"],
    name: "Mobile app",
    price: 999, from: true, totalLabel: "Starting at", stamp: "iOS + ANDROID",
    lines: [["Hosting on iOS & Android", true], ["Free landing page website", true], ["Connected to your app", true], ["Admin panel", true]],
    next: "3 motion videos for $199",
  },
  {
    id: "Motion199", n: 4, accent: "#FFD23F",
    question: ["Need content that", "stops the scroll?"],
    name: "Motion graphics",
    price: 199, from: false, totalLabel: "3-video pack", stamp: "3 VIDEOS",
    lines: [["3 videos", true], ["15 s to 1 min each", true], ["Every frame & sound by us", true]],
    next: null,
  },
];
