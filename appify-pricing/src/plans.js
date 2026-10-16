// The four Appify plans, exactly as priced by Appify. Each one renders as its own Story.
// Lines come from Appify's offer and its service pages. `was` shows the crossed-out "bought one by one" price.
// Keep each receipt line within ~26 characters so it fits the paper.
export const PLANS = [
  {
    id: "Store360", n: 1, accent: "#8F72FF",
    question: ["How much is an", "e-commerce website?"],
    name: "E-commerce website · Standard",
    price: 360, from: false, totalLabel: "Total · pay once", stamp: "PAID ONCE",
    lines: ["Premium template", "Admin panel", "Hosting included", "Pay once, no monthly fees"],
    end: "Pay once · no monthly fees · hosting included",
  },
  {
    id: "WebApp500", n: 2, accent: "#74C6FF",
    question: ["Need a system", "for your business?"],
    name: "Web app · Custom",
    price: 500, from: true, totalLabel: "Starting at · pay once", stamp: "CUSTOM",
    lines: ["CRM for your clients", "Business systems", "Automations & workflows", "Custom dashboards", "Admin panel", "Hosting included", "Pay once, no monthly fees"],
    end: "Pay once · no monthly fees · hosting included",
  },
  {
    id: "App999", n: 3, accent: "#39E29B",
    question: ["Got an", "app idea?"],
    name: "Mobile app · iOS + Android",
    price: 999, from: true, totalLabel: "Starting at", stamp: "iOS + ANDROID",
    lines: ["UI/UX design, every screen", "One app, iOS + Android", "Store publishing handled", "Hosting on iOS & Android", "Free landing page website", "Admin panel for your team"],
    end: "Free landing page website included",
  },
  {
    id: "Motion199", n: 4, accent: "#FFD23F",
    question: ["Need content that", "stops the scroll?"],
    name: "Motion graphics · 3 videos",
    price: 199, was: 300, from: false, totalLabel: "3-video pack", stamp: "SAVE $101",
    lines: ["3 videos, 15 s to 1 min", "Reels, ads, 3D or logos", "Hook in the first second", "Every format you post", "Sound design + silent cut"],
    end: "1 video alone is $100 · 3 for $199",
  },
];
