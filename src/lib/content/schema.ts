/**
 * The editable surface of the website, declared once.
 *
 * Every section of the storefront has an entry here: the fields it exposes,
 * and the copy it falls back to when nothing has been saved. The dashboard
 * renders its forms straight off this list, so adding a new editable field is
 * a one-line change here rather than a new form — and the storefront reads the
 * same defaults, which is why an empty database still renders the design.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "toggle"
  | "color"
  | "image"
  | "url"
  | "select"
  | "list"
  | "products";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  /** For `list`: the shape of one row. */
  item?: Field[];
  /** For `list`: the label shown on the add button. */
  addLabel?: string;
  /** For `products`: what the first, featured slot does. */
  featuredNote?: string;
  /**
   * Reads and writes something outside this section's JSON — see
   * src/lib/content/bindings.ts. A bound field has no entry in `defaults`.
   */
  binding?: "bestsellerRank";
}

export interface SectionDef {
  key: string;
  label: string;
  group: "Homepage" | "Catalogue" | "Site-wide";
  description: string;
  /** Anchor on the live site, for the "View on site" link. */
  preview?: string;
  fields: Field[];
  defaults: Record<string, unknown>;
}

const accentHelp = "Set in the serif italic gold — leave empty to drop it.";

export const SECTIONS: SectionDef[] = [
  {
    key: "hero",
    label: "Hero",
    group: "Homepage",
    description: "The opening screen: the film, the headline and the three figures under it.",
    preview: "/",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Leave empty to use the brand name and location." },
      { key: "title", label: "Headline", type: "text" },
      { key: "accent", label: "Headline accent", type: "text", help: accentHelp },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      { key: "primaryLabel", label: "Primary button", type: "text" },
      { key: "primaryHref", label: "Primary button link", type: "url" },
      { key: "secondaryLabel", label: "Secondary button", type: "text" },
      { key: "secondaryHref", label: "Secondary button link", type: "url" },
      {
        key: "film",
        label: "Watches in the film",
        type: "products",
        max: 10,
        help: "The reel drifting behind the headline. Order matters — the first watch is the one held in the centre.",
        featuredNote: "Held in the centre of the film",
      },
      { key: "showStats", label: "Show the figures row", type: "toggle" },
      {
        key: "stats",
        label: "Figures",
        type: "list",
        addLabel: "Add a figure",
        max: 4,
        item: [
          { key: "value", label: "Figure", type: "text" },
          { key: "label", label: "Caption", type: "text" },
        ],
      },
    ],
    defaults: {
      eyebrow: "",
      title: "Every watch,",
      accent: "one insider.",
      copy: "Carefully sourced watches, checked in hand and shipped complete — with everything they came with.",
      primaryLabel: "Shop the collection",
      primaryHref: "/products",
      secondaryLabel: "Try the Strap Studio",
      secondaryHref: "#strap-studio",
      film: [
        { slug: "mission-to-the-moonphase-full-moon" },
        { slug: "mission-to-the-moon" },
        { slug: "mission-to-mars" },
        { slug: "mission-on-earth-polar-lights" },
        { slug: "mission-to-the-super-blue-moonphase" },
        { slug: "mission-on-earth" },
        { slug: "mission-on-earth-lava" },
        { slug: "mission-to-the-sun" },
      ],
      showStats: true,
      stats: [
        { value: "200+", label: "Satisfied customers" },
        { value: "26", label: "Items in stock" },
        { value: "100%", label: "Carefully selected" },
      ],
    },
  },
  {
    key: "bestsellers",
    label: "Bestsellers rail",
    group: "Homepage",
    description: "The numbered rail across the homepage. Pick the watches and set their order here.",
    preview: "/#bestsellers",
    fields: [
      { key: "enabled", label: "Show this section", type: "toggle" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "accent", label: "Heading accent", type: "text", help: accentHelp },
      { key: "limit", label: "How many to show", type: "number", min: 3, max: 20 },
      {
        key: "picks",
        label: "Watches in the rail",
        type: "products",
        max: 20,
        binding: "bestsellerRank",
        help: "Numbered in this order on the site. This is the bestseller ranking itself, so it also orders the Strap Studio's watch rail.",
        featuredNote: "Number 01 in the rail",
      },
    ],
    defaults: {
      enabled: true,
      eyebrow: "What is moving",
      title: "The ten our customers",
      accent: "keep asking for",
      limit: 10,
    },
  },
  {
    key: "collections",
    label: "Collections tiles",
    group: "Homepage",
    description: "The browse-by-house block. Edit the tiles themselves under Collections.",
    preview: "/#collection",
    fields: [
      { key: "enabled", label: "Show this section", type: "toggle" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "accent", label: "Heading accent", type: "text", help: accentHelp },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      { key: "ctaLabel", label: "Button", type: "text" },
      { key: "ctaHref", label: "Button link", type: "url" },
      {
        key: "comingSoonLabel",
        label: "Badge on a tile that is not open yet",
        type: "text",
        help: "A collection can override this with its own wording under Collections.",
      },
      {
        key: "countLabel",
        label: "Line on a tile that is open",
        type: "text",
        help: "{n} is replaced with how many watches are in it.",
      },
      {
        key: "upcomingMessage",
        label: "WhatsApp message from a tile that is not open yet",
        type: "text",
        help: "{collection} is replaced with its name.",
      },
    ],
    defaults: {
      enabled: true,
      eyebrow: "The collection",
      title: "Browse by house,",
      accent: "then filter.",
      copy: "Everything we carry sits under one of these. Open one to see its full catalogue — filter from there by series, colour, availability or budget.",
      ctaLabel: "Open full catalogue",
      ctaHref: "/products",
      comingSoonLabel: "Coming soon",
      countLabel: "{n} references",
      upcomingMessage: "Hi WTC — let me know when {collection} lands.",
    },
  },
  {
    key: "reel",
    label: "Scroll reel",
    group: "Homepage",
    description: "The full-screen film that runs off the scroll wheel.",
    preview: "/",
    fields: [
      { key: "enabled", label: "Show this section", type: "toggle" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "accent", label: "Heading accent", type: "text", help: accentHelp },
      {
        key: "height",
        label: "Scroll length",
        type: "number",
        min: 150,
        max: 600,
        help: "In percent of screen height. Longer means the reel runs slower.",
      },
    ],
    defaults: {
      // Off at the client's request. The section, the Remotion composition and
      // this whole entry stay put — flip this back on to bring it back.
      enabled: false,
      eyebrow: "Every reference",
      title: "Keep scrolling",
      accent: "to run the reel.",
      height: 320,
    },
  },
  {
    key: "strapStudio",
    label: "Strap Studio",
    group: "Homepage",
    description: "The strap swapper. Which straps each watch offers is set on the product itself.",
    preview: "/#strap-studio",
    fields: [
      { key: "enabled", label: "Show this section", type: "toggle" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "accent", label: "Heading accent", type: "text", help: accentHelp },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      {
        key: "featured",
        label: "Watch shown first",
        type: "text",
        help: "Product slug, e.g. mission-to-the-moon.",
      },
      { key: "watchPickerLabel", label: "Label over the watch picker", type: "text" },
      { key: "strapsLabel", label: "Label over the strap swatches", type: "text" },
      { key: "bagLabel", label: "Add-to-bag button", type: "text" },
      { key: "addedLabel2", label: "…once it is in the bag", type: "text" },
      { key: "soldOutLabel", label: "…when the strap is sold out", type: "text" },
      { key: "note", label: "Note under the price", type: "text" },
    ],
    defaults: {
      enabled: true,
      eyebrow: "Strap Studio",
      title: "Change the strap,",
      accent: "change the story.",
      copy: "Endless combinations. Switch between the straps we stock and see your watch take on a completely different look.",
      featured: "mission-to-the-moon",
      watchPickerLabel: "Select your watch",
      strapsLabel: "Straps",
      bagLabel: "Add to bag",
      addedLabel2: "Added to bag",
      soldOutLabel: "Sold out",
      note: "Watch not included. Checkout opens when the store goes live.",
    },
  },
  {
    key: "reviews",
    label: "Customer reviews",
    group: "Homepage",
    description: "What customers have said. Add and edit the reviews themselves under Reviews.",
    preview: "/#reviews",
    fields: [
      { key: "enabled", label: "Show this section", type: "toggle" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "accent", label: "Heading accent", type: "text", help: accentHelp },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      { key: "limit", label: "How many to show", type: "number", min: 2, max: 12 },
      {
        key: "showRating",
        label: "Show the average rating",
        type: "toggle",
        help: "The star average across every published review.",
      },
      {
        key: "inviteTitle",
        label: "Before there are reviews — heading",
        type: "text",
        help: "Shown in place of the quotes until you publish your first review.",
      },
      { key: "inviteCopy", label: "Before there are reviews — copy", type: "textarea" },
      { key: "inviteCta", label: "Before there are reviews — button", type: "text" },
    ],
    defaults: {
      enabled: true,
      eyebrow: "In their words",
      title: "What people say",
      accent: "after it arrives.",
      copy: "Every piece is checked in hand before it ships. This is what customers tell us once it lands.",
      limit: 6,
      showRating: true,
      inviteTitle: "Bought from WTC? Tell us how it landed.",
      inviteCopy:
        "Write a few lines below and it goes up here with your name once we have read it. Nothing on this page is written by us.",
      inviteCta: "Write a review",
    },
  },
  {
    key: "instagram",
    label: "Instagram strip",
    group: "Homepage",
    description: "The latest posts. Refresh the feed itself from Settings → Instagram.",
    preview: "/",
    fields: [
      { key: "enabled", label: "Show this section", type: "toggle" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      { key: "ctaLabel", label: "Button", type: "text" },
      { key: "limit", label: "How many posts", type: "number", min: 3, max: 12 },
    ],
    defaults: {
      enabled: true,
      eyebrow: "On Instagram",
      copy: "Unboxings, new arrivals and strap swaps — posted the day they land in Beirut.",
      ctaLabel: "Follow",
      limit: 6,
    },
  },
  {
    key: "catalog",
    label: "Catalogue page",
    group: "Catalogue",
    description: "The heading above the filters on /products.",
    preview: "/products",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "accent", label: "Heading accent", type: "text", help: accentHelp },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      { key: "searchPlaceholder", label: "Search box placeholder", type: "text" },
      { key: "emptyMessage", label: "When no watch matches", type: "text" },
      { key: "emptyCopy", label: "…and the line under it", type: "textarea" },
      { key: "clearLabel", label: "Clear-filters button", type: "text" },
    ],
    defaults: {
      eyebrow: "The catalogue",
      title: "Every reference",
      accent: "we carry.",
      copy: "Filter by series, colour, availability or budget.",
      searchPlaceholder: "Search a mission or reference…",
      emptyMessage: "Nothing matches that yet",
      emptyCopy:
        "Loosen a filter, or message us — we source references to order and can usually find one within a week.",
      clearLabel: "Clear filters",
    },
  },
  {
    key: "productPage",
    label: "Product page",
    group: "Catalogue",
    description: "Labels and blocks shared by every watch page.",
    preview: "/products",
    fields: [
      { key: "buyLabel", label: "Buy button", type: "text" },
      { key: "addedLabel", label: "…once it is in the bag", type: "text" },
      { key: "soldOutLabel", label: "…when it is sold out", type: "text" },
      { key: "whatsappLabel", label: "WhatsApp button", type: "text" },
      {
        key: "whatsappMessage",
        label: "WhatsApp message it sends",
        type: "text",
        help: "{name} and {sku} are replaced with the watch's.",
      },
      { key: "strapHeading", label: "Strap section heading", type: "text" },
      { key: "strapCopy", label: "Strap section copy", type: "textarea" },
      { key: "specsHeading", label: "Specification heading", type: "text" },
      {
        key: "relatedHeading",
        label: "Related heading",
        type: "text",
        help: "{series} is replaced with the watch's series, e.g. Moonphase.",
      },
      {
        key: "includedNote",
        label: "What it ships with",
        type: "text",
        help: "Sits under the buttons. {strap} is replaced with the strap's name.",
      },
      { key: "homeLabel", label: "Breadcrumb — home", type: "text" },
      { key: "catalogueLabel", label: "Breadcrumb — catalogue", type: "text" },
      {
        key: "specs",
        label: "Specification rows",
        type: "list",
        addLabel: "Add a row",
        item: [
          { key: "label", label: "Label", type: "text" },
          { key: "value", label: "Value", type: "text" },
        ],
      },
    ],
    defaults: {
      buyLabel: "Add to bag",
      addedLabel: "Added to bag",
      soldOutLabel: "Sold out",
      whatsappLabel: "Ask on WhatsApp",
      whatsappMessage: "Hi — is the {name} ({sku}) available?",
      strapHeading: "Strap Studio",
      strapCopy: "See it on every strap we stock before you decide.",
      specsHeading: "Specification",
      relatedHeading: "More from {series}",
      includedNote: "Supplied on the {strap} strap, with box and papers.",
      homeLabel: "Home",
      catalogueLabel: "Catalogue",
      specs: [
        { label: "Case", value: "42 mm Bioceramic" },
        { label: "Movement", value: "Quartz chronograph" },
        { label: "Glass", value: "Bio-sourced material" },
        { label: "Water resistance", value: "3 bar" },
        { label: "Battery", value: "Renata 371" },
        { label: "Caseback", value: "Bio-sourced material, printed" },
      ],
    },
  },
  {
    key: "checkout",
    label: "Checkout",
    group: "Catalogue",
    description: "The order form, and what it promises. Delivery charges are under Settings.",
    preview: "/checkout",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      { key: "detailsHeading", label: "Contact section heading", type: "text" },
      { key: "addressHeading", label: "Address section heading", type: "text" },
      { key: "paymentHeading", label: "Payment section heading", type: "text" },
      { key: "paymentMethod", label: "Payment method", type: "text" },
      {
        key: "paymentCopy",
        label: "How payment works",
        type: "textarea",
        help: "There is no card gateway wired up — orders are cash on delivery.",
      },
      { key: "summaryHeading", label: "Summary heading", type: "text" },
      { key: "submitLabel", label: "Place-order button", type: "text" },
      { key: "reassurance", label: "Line under the button", type: "textarea" },
      { key: "emptyTitle", label: "Empty bag — heading", type: "text" },
      { key: "emptyCopy", label: "Empty bag — copy", type: "textarea" },
      { key: "emptyCta", label: "Empty bag — button", type: "text" },
    ],
    defaults: {
      eyebrow: "Checkout",
      title: "Almost yours.",
      copy: "Tell us where it is going. We confirm every order by phone before it leaves us.",
      detailsHeading: "Your details",
      addressHeading: "Where it is going",
      paymentHeading: "Payment",
      paymentMethod: "Cash on delivery",
      paymentCopy:
        "Pay the courier when the watch reaches you. Nothing is taken now, and we confirm the order by phone first.",
      summaryHeading: "Your order",
      submitLabel: "Place the order",
      reassurance: "No payment is taken now. We call to confirm before anything ships.",
      emptyTitle: "Your bag is empty",
      emptyCopy: "Add a watch or a strap and it will show up here.",
      emptyCta: "Browse the catalogue",
    },
  },
  {
    key: "orderPage",
    label: "Order confirmation",
    group: "Catalogue",
    description: "What a customer sees once the order is placed, and the page they can come back to.",
    preview: "/checkout",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Heading", type: "text" },
      { key: "copy", label: "Supporting copy", type: "textarea" },
      { key: "nextHeading", label: "What happens next — heading", type: "text" },
      {
        key: "steps",
        label: "What happens next",
        type: "list",
        addLabel: "Add a step",
        max: 5,
        item: [
          { key: "title", label: "Step", type: "text" },
          { key: "copy", label: "Detail", type: "text" },
        ],
      },
      { key: "keepLink", label: "Note about keeping the link", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Order placed",
      title: "Thank you.",
      copy: "We have it. Someone from WTC will call to confirm the details before it ships.",
      nextHeading: "What happens next",
      steps: [
        { title: "We confirm", copy: "A call or WhatsApp message within a few hours." },
        { title: "We pack it", copy: "Checked in hand, with the box, papers and original strap." },
        { title: "It arrives", copy: "2 to 4 working days across Lebanon. Pay the courier." },
      ],
      keepLink: "Keep this page — it is the only link to your order.",
    },
  },
  {
    key: "policyPage",
    label: "Policy pages",
    group: "Catalogue",
    description: "The frame around every policy. The policies themselves live under Policies.",
    preview: "/policies/shipping",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "helpHeading", label: "Help box heading", type: "text" },
      {
        key: "helpCopy",
        label: "Help box copy",
        type: "textarea",
        help: "The phone number is added after it, as a WhatsApp link.",
      },
    ],
    defaults: {
      eyebrow: "Policies",
      helpHeading: "Still unsure?",
      helpCopy: "Message us on WhatsApp at",
    },
  },
  {
    key: "header",
    label: "Header",
    group: "Site-wide",
    description: "The navigation bar.",
    fields: [
      {
        key: "nav",
        label: "Navigation",
        type: "list",
        addLabel: "Add a link",
        max: 8,
        item: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link", type: "url" },
        ],
      },
      { key: "ctaLabel", label: "Outline button", type: "text", help: "Empty to hide it." },
      { key: "ctaHref", label: "Outline button link", type: "url", help: "Empty falls back to WhatsApp." },
      { key: "shopLabel", label: "Solid button", type: "text" },
      { key: "shopHref", label: "Solid button link", type: "url" },
    ],
    defaults: {
      nav: [
        { label: "Bestsellers", href: "/#bestsellers" },
        { label: "Collection", href: "/#collection" },
        { label: "Strap Studio", href: "/#strap-studio" },
        { label: "All watches", href: "/products" },
      ],
      ctaLabel: "WhatsApp",
      ctaHref: "",
      shopLabel: "Shop",
      shopHref: "/products",
    },
  },
  {
    key: "footer",
    label: "Footer",
    group: "Site-wide",
    description: "The closing block: blurb, column headings and the small print.",
    fields: [
      { key: "blurb", label: "Blurb", type: "textarea" },
      { key: "shopHeading", label: "First column heading", type: "text" },
      { key: "policiesHeading", label: "Second column heading", type: "text" },
      { key: "contactHeading", label: "Third column heading", type: "text" },
      { key: "allLabel", label: "Link to the whole catalogue", type: "text" },
      {
        key: "soonLabel",
        label: "Tag on an empty collection",
        type: "text",
        help: "Shown beside a house with nothing in it yet.",
      },
      {
        key: "note",
        label: "Small print",
        type: "textarea",
        help: "The reseller disclaimer. Keep it — it is what separates WTC from the brands it resells.",
      },
    ],
    defaults: {
      blurb:
        "WTC started with a love for watches and the search for pieces that stand out. What began with a few watches has grown into a place where different timepieces, straps and styles come together.",
      shopHeading: "Shop",
      policiesHeading: "Policies",
      contactHeading: "Get in touch",
      allLabel: "All references",
      soonLabel: "soon",
      note: "WTC is an independent reseller. Not affiliated with, endorsed by or sponsored by Swatch AG or OMEGA SA. Product names and photography remain the property of their respective owners.",
    },
  },
  {
    key: "seo",
    label: "Search & sharing",
    group: "Site-wide",
    description: "Page titles, the description search engines show, and the sharing image.",
    fields: [
      { key: "title", label: "Homepage title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "ogImage", label: "Sharing image", type: "image" },
      {
        key: "indexable",
        label: "Allow search engines to index the site",
        type: "toggle",
        help: "Off while prices are placeholders. Turn on at launch.",
      },
    ],
    defaults: {
      title: "",
      description: "",
      ogImage: "",
      indexable: false,
    },
  },
];

export const sectionByKey = (key: string) => SECTIONS.find((s) => s.key === key);

export const SECTION_GROUPS = ["Homepage", "Catalogue", "Site-wide"] as const;

/** Defaults for one section, used whenever the row is missing or partial. */
export function sectionDefaults(key: string): Record<string, unknown> {
  return { ...(sectionByKey(key)?.defaults ?? {}) };
}
