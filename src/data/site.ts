/**
 * Brand, contact and policy content for WTC.
 *
 * Sourced from the client's Instagram profile (@watchtradechronicles).
 * ⚠️ PHONE NUMBER IS A PLACEHOLDER — replace `contact.phone` and
 * `contact.whatsapp` with the real numbers before this goes live.
 */
export const site = {
  name: "WTC",
  longName: "Watch Trade Chronicles",
  tagline: "Your Watch Insider",
  intro:
    "Redefining the luxury of time elegance. Explore the world of watches, one tick at a time.",
  heroCopy:
    "Boutique-sourced OMEGA × Swatch, checked in hand and shipped complete — box, papers and the original VELCRO® strap.",
  blurb:
    "WTC is an independent OMEGA × Swatch specialist based in Beirut. Every Bioceramic MoonSwatch we list is sourced from a Swatch boutique, checked in hand, and shipped with its full kit — box, papers and original VELCRO® strap.",
  location: "Beirut, Lebanon",
  stats: [
    { value: "200+", label: "Satisfied customers" },
    { value: "26", label: "References in stock" },
    { value: "100%", label: "Boutique-sourced" },
  ],
  contact: {
    // TODO: replace with the real numbers before launch.
    phone: "+961 00 000 000",
    whatsapp: "96100000000",
    email: "hello@watchtradechronicles.com",
  },
  social: {
    instagram: "https://www.instagram.com/watchtradechronicles",
    instagramHandle: "@watchtradechronicles",
    tiktok: "#",
  },
  policies: [
    {
      slug: "authenticity",
      title: "Authenticity guarantee",
      summary: "Every piece is boutique-sourced and checked in hand before it ships.",
      body: [
        "Each Bioceramic MoonSwatch sold by WTC is purchased from an authorised Swatch boutique. We do not deal in replicas, aftermarket cases or franken-builds of any kind.",
        "Every watch is opened, inspected, time-set and photographed before dispatch. The listing photography on this site is the official OMEGA × Swatch product photography; photographs of your exact piece are sent to you on request before payment.",
        "If an independent watchmaker finds that a piece bought from WTC is not a genuine Swatch product, we refund the full purchase price and the cost of the inspection.",
      ],
    },
    {
      slug: "shipping",
      title: "Shipping & delivery",
      summary: "Same-day inside Beirut, 2–5 working days across Lebanon, DHL worldwide.",
      body: [
        "Orders inside Beirut are hand-delivered the same day where possible, and always within 24 hours. Delivery across the rest of Lebanon takes two to five working days.",
        "International orders ship by DHL Express with full tracking and insurance to the declared value. Transit is typically three to seven working days depending on destination.",
        "Import duties and taxes outside Lebanon are the responsibility of the recipient. We declare every parcel accurately — we do not under-declare shipments.",
      ],
    },
    {
      slug: "returns",
      title: "Returns & exchanges",
      summary: "Seven days to change your mind on unworn pieces, kit complete.",
      body: [
        "Unworn watches can be returned within seven days of delivery for a full refund, provided the piece is in the condition it was sent, with the box, papers and original strap included.",
        "Straps are returnable only if the backing card is unopened. This is a hygiene limit, not a commercial one.",
        "Pre-order deposits are refundable up until the piece is allocated to you. Once allocated, a deposit can be moved to another reference but is no longer refundable.",
      ],
    },
    {
      slug: "warranty",
      title: "Warranty & service",
      summary: "The full Swatch international warranty, plus battery service from us.",
      body: [
        "Every watch carries its Swatch international warranty against manufacturing defects, valid from the original boutique purchase date shown on the papers supplied with the piece.",
        "WTC covers the first battery change free of charge for as long as you own the watch. Bring it in or post it to us and we will return it running.",
        "The warranty does not cover water damage, impact damage, or any work carried out by a third party. Bioceramic scratches and strap wear are normal use, not defects.",
      ],
    },
    {
      slug: "privacy",
      title: "Privacy",
      summary: "We keep what an order needs, and nothing beyond it.",
      body: [
        "We collect only what is required to fulfil an order: name, delivery address, phone number and email. We do not sell, rent or share that data with anyone other than the courier carrying your parcel.",
        "Payment is handled at checkout or on delivery. WTC does not store card numbers on this site or anywhere else.",
        "Write to us at the email address on this page to ask what we hold about you, or to have it deleted.",
      ],
    },
  ],
} as const;

export type Policy = (typeof site.policies)[number];
export const policyBySlug = (slug: string) =>
  site.policies.find((p) => p.slug === slug);
