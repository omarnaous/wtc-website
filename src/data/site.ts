/**
 * Brand, contact and policy content for WTC.
 *
 * Sourced from the client's Instagram profile (@watchtradechronicles).
 * ⚠️ PHONE NUMBER IS A PLACEHOLDER — replace `contact.phone` and
 * `contact.whatsapp` with the real numbers before this goes live.
 */
export const site = {
  name: "WTC",
  longName: "Watchtradechronicles",
  tagline: "Your Watch Insider",
  intro:
    "Redefining the luxury of time elegance. Explore the world of watches, one tick at a time.",
  heroCopy:
    "Carefully sourced watches, checked in hand and shipped complete — with everything they came with.",
  blurb:
    "WTC started with a love for watches and the search for pieces that stand out. What began with a few watches has grown into a place where different timepieces, straps and styles come together.",
  location: "Beirut, Lebanon",
  /** The real mark, imported from the Instagram profile picture. */
  logo: "/brand/logo.png" as string | null,
  stats: [
    { value: "200+", label: "Satisfied customers" },
    { value: "26", label: "Items in stock" },
    { value: "100%", label: "Carefully selected" },
  ],
  contact: {
    // TODO: replace with the real numbers before launch.
    phone: "+961 00 000 000",
    whatsapp: "96100000000",
  },
  social: {
    instagram: "https://www.instagram.com/watchtradechronicles",
    instagramHandle: "@watchtradechronicles",
    tiktok: "#",
  },
  policies: [
    {
      slug: "shipping",
      title: "Shipping & delivery",
      summary: "2–4 working days across Lebanon.",
      body: [
        "Orders are dispatched within 24 hours.",
        "Delivery across Lebanon takes 2 to 4 working days.",
      ],
    },
    {
      slug: "returns",
      title: "Returns & exchanges",
      summary: "Two days to change your mind, fourteen to exchange.",
      body: [
        "Unworn watches can be returned within 2 days of delivery for a full refund, provided the piece is in the condition it was sent, with the box, bag, papers and original strap included.",
        "Exchanges can be done within 14 days of delivery, provided the piece is in the condition it was sent, with the box, bag, papers and original strap included.",
      ],
    },
    {
      slug: "warranty",
      title: "Warranty & service",
      summary: "3 months of coverage, from us.",
      body: [
        "Every watch comes with a 3-month warranty covering manufacturing defects and issues that occur under normal use.",
        "If a covered issue appears during the warranty period, contact us and we'll arrange the next steps.",
        "The warranty does not cover battery replacement, water or moisture damage, physical damage, scratches, accidental damage, or damage caused by improper use or third-party repairs.",
      ],
    },
    {
      slug: "privacy",
      title: "Privacy",
      summary: "We keep what an order needs, and nothing beyond it.",
      body: [
        "We collect only what is required to fulfil an order: name, delivery address, phone number and email. We do not sell, rent or share that data with anyone other than the courier carrying your parcel.",
        "Payment is handled at checkout or on delivery. WTC does not store card numbers on this site or anywhere else.",
      ],
    },
  ],
} as const;

export type Policy = (typeof site.policies)[number];
export const policyBySlug = (slug: string) =>
  site.policies.find((p) => p.slug === slug);
