// The pages: home, case studies, service landing pages, 404. Each returns a full HTML document.
import { esc, icon, sparkSVG, wordmarkSVG, layout } from "./html.js";
import { devSVG } from "../../public/assets/js/dev.js";

const KIND = { ad: "Content ad", brand: "Brand film", reel: "Reel", client: "Client work" };
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const DEV_LINES = ["Hi, I'm Dev. Watch this!", "Tap the screen to watch.", "We made every frame of it.", "Tap me, I do tricks."];
// The hero intro (source: appify-intro/): the screen next to Dev shows the poster; tap to play it with sound. Made with scripts/intro.sh, which fits any
// video to the 16:9 screen at full sharpness.
const INTRO = { video: "/media/intro.mp4?v=4", poster: "/media/intro.webp?v=4" };

// ── structured data ──────────────────────────────────────────────────────────────────────────────
function orgLD(site) {
  const s = site.settings;
  return {
    "@type": "ProfessionalService", "@id": `${site.url}/#org`, name: "Appify", url: site.url + "/",
    logo: `${site.url}/icon-512.png`, image: `${site.url}/og.png`, email: s.email, slogan: s.tagline,
    description: "Appify is a creative tech studio in Lebanon designing animated websites, online stores, mobile apps, motion graphics and Meta ad campaigns.",
    areaServed: { "@type": "Country", name: "Lebanon" }, address: { "@type": "PostalAddress", addressCountry: "LB" },
    sameAs: [s.instagram].filter(Boolean), ...(s.whatsapp ? { telephone: "+" + s.whatsapp } : {}),
    knowsAbout: ["Web design", "E-commerce websites", "Animated websites", "Mobile app development", "Motion graphics", "Video ads", "Meta ads", "UI/UX design"],
    makesOffer: [
      { "@type": "Offer", name: "E-commerce website", price: "360", priceCurrency: "USD", description: "Premium template, admin panel and hosting included. Pay once, no monthly fees." },
      { "@type": "Offer", name: "Web app", priceSpecification: { "@type": "PriceSpecification", minPrice: "500", priceCurrency: "USD" }, description: "CRMs, business systems, automations and dashboards, with an admin panel and hosting. Pay once." },
      { "@type": "Offer", name: "Mobile app", priceSpecification: { "@type": "PriceSpecification", minPrice: "999", priceCurrency: "USD" } },
      { "@type": "Offer", name: "Motion graphics, 3 videos", price: "199", priceCurrency: "USD" },
    ],
  };
}
const graph = (...items) => ({ "@context": "https://schema.org", "@graph": items.filter(Boolean) });
const faqLD = (faqs) => faqs.length && { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) };
const crumbs = (site, list) => ({ "@type": "BreadcrumbList", itemListElement: list.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: site.url + path })) });

// ── pieces ───────────────────────────────────────────────────────────────────────────────────────
const head = (num, eyebrow, h2, text) => `<header class="sec-head" data-reveal><p class="eyebrow"><span>${num}</span>${esc(eyebrow)}</p><h2>${h2}</h2>${text ? `<p class="sec-text">${text}</p>` : ""}</header>`;

// A live client website: a preview of the real site (desktop, with its phone view in front); the card opens the site.
const host = (u = "") => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
const isLive = (p) => p.status === "live" && p.live_url && p.preview;
function siteCard(p) {
  return `<a class="site-card" href="${esc(p.live_url)}" target="_blank" rel="noopener" aria-label="Visit ${esc(p.title)} (opens in a new tab)">
  <div class="site-shot">
    <div class="site-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(host(p.live_url))}</span></div>
    <img class="site-d" src="${esc(p.preview)}" alt="The ${esc(p.title)} website" loading="lazy" decoding="async" width="1200" height="750">
    <img class="site-m" src="${esc(p.preview.replace(".webp", "-m.webp"))}" alt="" loading="lazy" decoding="async" width="360" height="779">
  </div>
  <p class="meta">${esc(p.category)}</p>
  <h3>${esc(p.title)}</h3>
  <p class="summary">${esc(p.summary)}</p>
  <span class="link">Visit site${icon.ext}</span>
</a>`;
}
const igOf = (site, x) => x.ig_url || site.settings.instagram;
const reelOf = (site) => (m, i) => motionCard({ ...m, href: igOf(site, m) }, i);
// Concept websites use the video card exactly as the motion row does (motionCard), with their reel's own Instagram
// cover, and open that reel.
const siteReel = (site) => (p, i) => motionCard({ ...p, kind: p.category, aspect: "9/16", duration: 0, client: "Appify", href: igOf(site, p) }, i);
// Horizontal rows (websites, videos): arrows, drag, a progress line. id ties the controls to the row.
const rowBar = (id, filters) => `<div class="motion-bar">${filters}<div class="scroll-btns"><button type="button" data-scroll="-1" data-for="${id}" aria-label="Previous">${icon.arrow}</button><button type="button" data-scroll="1" data-for="${id}" aria-label="Next">${icon.arrow}</button></div></div>`;
const rowProg = (id) => `<div class="wrap"><div class="row-prog" data-prog-for="${id}" aria-hidden="true"><i></i></div></div>`;

// A video card: its thumbnail; tapping it opens the video where it lives (m.href: the Instagram reel, or the App Store).
function motionCard(m, i) {
  const where = m.where || "Instagram", fit = m.aspect === "9/16" ? "" : " fit";
  const open = m.play
    ? `<button class="reel-media${fit}" type="button" data-play="${esc(m.video)}" data-title="${esc(m.title)}" aria-label="Play ${esc(m.title)} with sound">`
    : `<a class="reel-media${fit}" href="${esc(m.href)}" target="_blank" rel="noopener" aria-label="${where === "Instagram" ? "Watch" : "View"} ${esc(m.title)} on ${where === "Instagram" ? "" : "the "}${where} (opens in a new tab)">`;
  const badge = m.play ? "" : `<span class="reel-ig">${where === "Instagram" ? `${icon.ig}Watch on Instagram` : `View on the ${where}`}</span>`;
  return `<article class="reel" data-kind="${m.kind}" data-reveal>
  ${open}
    <img src="${esc(m.poster)}" alt="" loading="lazy" decoding="async">
    ${badge}${m.play || where === "Instagram" ? `<span class="reel-play">${icon.play}</span>` : ""}${m.duration ? `<span class="reel-time">${mmss(m.duration)}</span>` : ""}
  ${m.play ? "</button>" : "</a>"}
  <p class="meta">${esc(KIND[m.kind] || m.kind)}${m.client !== "Appify" ? ` · ${esc(m.client)}` : ""}</p>
  <h3>${esc(m.title)}</h3>
  <p class="summary">${esc(m.summary)}</p>
</article>`;
}

// Apps use the same video card as section 3. Until an app has its own video, it shows a placeholder one.
// What each app shows: first a photo of the real app (opens its store page), then a video of its features (plays here).
// Made in appify-darebni/ from the screens on darebniai.com.
const APP_MEDIA = {
  "darebni-ai": [
    { poster: "/media/darebni-photo.webp", summary: "An AI workout coach for iPhone that builds and adapts your training plan. Live on the App Store." },
    { poster: "/media/darebni-showcase.webp", video: "/media/darebni-showcase.mp4", duration: 20, play: true, title: "Darebni AI: inside the app",
      summary: "The features we built, on the real screens: onboarding, today's session, set logging, the workout builder, AI analytics, pinned lifts and the exercise library." },
  ],
};
const APP_PLACEHOLDER = { video: "/media/ecommerce-chat.mp4", poster: "/media/ecommerce-chat.webp", aspect: "9/16", duration: 24 };
const appCards = (site) => (p) => {
  const store = p.store_url ? { href: p.store_url, where: "App Store" } : { href: igOf(site, p) };
  const base = { title: p.title, summary: p.summary, kind: p.category, client: "Appify", aspect: "9/16", ...store };
  return (APP_MEDIA[p.slug] || [{ ...APP_PLACEHOLDER }]).map((m, i) => motionCard({ ...base, ...m }, i)).join("");
};

const SERVICE_ICON = {
  "web-design-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="9" width="38" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M5 16h38M17 43h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  "mobile-app-development-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="13" y="4" width="22" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M21 10h6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  "motion-graphics-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 18v12l10-6z" fill="currentColor"/></svg>',
  "meta-ads-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 34V14l18-6v32l-18-6Zm18-20c8 0 12 4 12 10s-4 10-12 10M8 34l4 9h6l-3-9" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
};
// Appify's prices, per service (Meta ads is priced on a call). Shown on each service page and as a line on the home cards.
const PRICING = {
  "web-design-lebanon": [
    { tier: "Standard", name: "E-commerce website", price: 360, note: "One-time payment",
      lines: ["Premium template", "Admin panel", "Hosting included", "Pay once, no monthly fees"] },
    { tier: "Custom", name: "Web app", price: 500, from: true, featured: true, note: "Starting price, one-time payment",
      lines: ["CRM for your clients", "Business systems", "Automations & workflows", "Custom dashboards", "Fully custom design", "Admin panel", "Hosting included", "Pay once, no monthly fees"] },
  ],
  "mobile-app-development-lebanon": [
    { tier: "iOS + Android", name: "Mobile app", price: 999, from: true, featured: true, note: "Starting price",
      lines: ["UI/UX design, every screen", "One app for iOS and Android", "App Store and Google Play publishing", "Hosting on iOS and Android", "Free landing page website, connected to the app", "Admin panel for your team"] },
  ],
  "motion-graphics-lebanon": [
    { tier: "3-video pack", name: "Motion graphics", price: 199, was: 300, featured: true, note: "1 video alone is $100, so the pack saves you $101",
      lines: ["3 videos, 15 s to 1 min each", "Reels, ads, 3D or logo reveals", "A hook in the first second", "Delivered in every format you post", "Sound design, plus a silent cut for trending audio"] },
  ],
};
const fromPrice = (slug) => { const p = PRICING[slug]; return p ? Math.min(...p.map((x) => x.price)) : null; };
const priceCard = (p, i) => `<article class="price-card${p.featured ? " featured" : ""}" data-reveal style="--d:${i * 80}ms">
  <p class="price-tier">${esc(p.tier)}</p>
  <h3>${esc(p.name)}</h3>
  <p class="price-amt">${p.from ? `<span class="price-from">from</span>` : ""}${p.was ? `<s>$${p.was}</s>` : ""}<b>$${p.price}</b></p>
  <p class="price-note">${esc(p.note)}</p>
  <ul class="price-list">${p.lines.map((l) => `<li>${icon.check}${esc(l)}</li>`).join("")}</ul>
  <a class="btn ${p.featured ? "primary" : "ghost"} big" href="/book">Book a call${icon.arrow}</a>
</article>`;
const pricing = (s) => PRICING[s.slug] ? `<section class="section pricing" id="pricing" aria-labelledby="pricing-h"><div class="wrap">${head("", "Pricing", `<span id="pricing-h">${esc(s.name)}: what it costs</span>`, "Clear prices up front. Book a call and we'll confirm yours.")}<div class="price-grid n${PRICING[s.slug].length}">${PRICING[s.slug].map(priceCard).join("")}</div></div></section>` : "";

const serviceCard = (s, i) => `<a class="svc" href="/services/${s.slug}" data-reveal style="--d:${i * 70}ms"><span class="svc-ic">${SERVICE_ICON[s.slug] || ""}</span><h3>${esc(s.name)}</h3><p>${esc(s.intro.split(". ")[0].replace(/\.$/, ""))}.</p>${fromPrice(s.slug) ? `<span class="svc-price">${PRICING[s.slug][0].was ? "3 videos" : "from"} <b>$${fromPrice(s.slug)}</b></span>` : ""}<span class="link">Learn more${icon.arrow}</span></a>`;

function faqList(faqs) {
  return `<div class="faq-list">${faqs.map((f, i) => `<details class="faq" data-reveal style="--d:${(i % 4) * 50}ms"${i === 0 ? " open" : ""}><summary><h3>${esc(f.question)}</h3><span class="faq-ic" aria-hidden="true"></span></summary><div class="faq-a"><p>${esc(f.answer)}</p></div></details>`).join("")}</div>`;
}

function booking(site, page = false, num = "") {
  const s = site.settings;
  const services = ["Website", "Online store", "Animated website", "Mobile app", "Motion graphics", "Meta ads", "Something else"];
  const slots = JSON.parse(s.booking_slots || "[]");
  const h = page ? "h1" : "h2";
  return `<section class="section book${page ? " book-page" : ""}" id="book" aria-labelledby="book-h">
  ${page ? `<div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div><div class="beam"></div></div>` : ""}
  <div class="wrap book-grid">
    <div class="book-copy" data-reveal>
      ${page ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Book a call</span></nav><p class="eyebrow"><span>Free</span>Prototype call</p>` : `<p class="eyebrow"><span>${num}</span>Book a call</p>`}
      <${h} id="book-h">Tell us your idea. <span class="grad">We'll appify it.</span></${h}>
      <p class="sec-text">Pick a day and a time, tell us what you need, and book it. We reply to confirm your call.</p>
      <ul class="contact-list">
        <li><a href="mailto:${esc(s.email)}">${icon.mail}<span>${esc(s.email)}</span></a></li>
        ${s.whatsapp ? `<li><a href="https://wa.me/${esc(s.whatsapp)}" rel="noopener">${icon.wa}<span>WhatsApp us</span></a></li>` : ""}
        <li><a href="${esc(s.instagram)}" target="_blank" rel="noopener">${icon.ig}<span>${esc(s.instagram_handle)}</span></a></li>
      </ul>
      <div class="book-dev" aria-hidden="true">${devSVG({ point: 1, brow: 16, lid: 0.05, smile: 1, look: 7, tilt: -4 }, "")}</div>
    </div>
    <form class="book-form" method="post" action="/api/bookings" data-book data-days="${esc(s.booking_days || "14")}" data-closed="${esc(s.booking_closed_weekdays || "[0]")}" data-reveal novalidate>
      <fieldset><legend><span>1</span>What do you need?</legend>
        <div class="chips">${services.map((x) => `<label class="chip"><input type="checkbox" name="services" value="${esc(x)}"><span>${esc(x)}</span></label>`).join("")}</div>
      </fieldset>
      <fieldset><legend><span>2</span>Pick a day</legend>
        <div class="days" data-days-row></div>
        <input class="field nojs" type="date" name="day" aria-label="Day">
      </fieldset>
      <fieldset><legend><span>3</span>Pick a time</legend>
        <div class="chips times">${slots.map((t, i) => `<label class="chip"><input type="radio" name="time" value="${esc(t)}"${i === 0 ? "" : ""}><span>${esc(t)}</span></label>`).join("")}</div>
      </fieldset>
      <fieldset class="row"><legend><span>4</span>Your details</legend>
        <label class="fl"><span>Name</span><input class="field" name="name" autocomplete="name" required maxlength="80" placeholder="Your name"></label>
        <label class="fl"><span>Phone / WhatsApp</span><input class="field" name="phone" type="tel" autocomplete="tel" maxlength="30" placeholder="+961 …"></label>
        <label class="fl wide"><span>Email <em>(optional)</em></span><input class="field" name="email" type="email" autocomplete="email" maxlength="120" placeholder="you@company.com"></label>
        <label class="fl wide"><span>Tell us about the project <em>(optional)</em></span><textarea class="field" name="message" rows="3" maxlength="1200" placeholder="Your business, your idea, any links…"></textarea></label>
        <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      </fieldset>
      <p class="form-msg" role="status" aria-live="polite"></p>
      <div class="send">
        <button class="btn primary big" type="submit" name="channel" value="whatsapp">${icon.wa}Book on WhatsApp</button>
      </div>
    </form>
  </div>
</section>`;
}

// ── home ─────────────────────────────────────────────────────────────────────────────────────────
export function homePage(site) {
  const websites = site.projects.filter((p) => p.kind === "website");
  const live = websites.filter(isLive), concepts = websites.filter((p) => !isLive(p));
  const apps = site.projects.filter((p) => p.kind === "app");
  const motion = site.motion;
  const body = `
<section class="hero" data-hero>
  <div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div><div class="beam"></div>${[1, 2, 3, 4, 5, 6].map((i) => `<span class="float f${i}">${sparkSVG("fs")}</span>`).join("")}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">${sparkSVG("k-spark")}<span>${esc(site.settings.tagline)}</span><span class="dot"></span><span>Made in Lebanon</span></p>
      <h1 class="hero-title" data-split>Websites, apps &amp; motion graphics that <span class="grad">stop the scroll.</span></h1>
      <p class="lede">Appify is a creative tech studio in Lebanon. We design animated websites and online stores, build mobile apps and make content ads that put your brand in the spotlight.</p>
      <div class="cta-row"><a class="cta-hero" href="/book" data-hero-cta><span class="cta-txt"><b>Get a free prototype</b><small>Pick a day and a time</small></span><span class="cta-go">${icon.arrow}</span></a></div>
    </div>
    <div class="hero-stage" data-dev data-lines='${esc(JSON.stringify(DEV_LINES))}'>
      <div class="tv" data-tv data-full="${esc(INTRO.video)}">
        <video playsinline preload="none" poster="${esc(INTRO.poster)}" width="1920" height="1080"></video>
        <button class="tv-hit" type="button" aria-label="Play the Appify intro with sound"></button>
        <span class="tv-tag" aria-hidden="true"><i></i>Intro</span>
        <span class="tv-chip" aria-hidden="true"><span class="tv-off">${icon.play}Tap to play</span><span class="tv-on"><i class="eq"><b></b><b></b><b></b><b></b></i>Tap to pause</span><span class="tv-paused">${icon.play}Tap to play</span></span>
        <span class="tv-bar" aria-hidden="true"><i></i></span>
        <div class="tv-end"><p class="tv-end-k">That's Appify.</p><p class="tv-end-h">Your idea next?</p><div class="tv-end-btns"><a class="btn primary" href="/book">Book a call${icon.arrow}</a><button class="btn ghost tv-again" type="button">Watch again</button></div></div>
      </div>
      <div class="hero-dev">
        <div class="orbit" aria-hidden="true">${["Websites", "Apps", "Motion", "Meta ads", "3D", "UI/UX"].map((x) => `<span><i>${x}</i></span>`).join("")}</div>
        <div class="dev-bubble" aria-hidden="true">${esc(DEV_LINES[0])}</div>
        <div class="dev-body"><button class="dev-btn" type="button" aria-label="Dev, the Appify mascot. Tap him.">${devSVG({ wave: 1, waveAng: 10, brow: 12, lid: 0.08, smile: 1 })}</button></div>
        <div class="dev-floor" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</section>

<section class="section svcs" aria-labelledby="svc-h">
  <div class="wrap">
    ${head("01", "What we do", `<span id="svc-h">Four ways we grow your brand</span>`, "")}
    <div class="svc-grid">${site.services.map(serviceCard).join("")}</div>
  </div>
</section>

<section class="section work" id="work" aria-labelledby="work-h">
  <div class="wrap">
    ${head("02", "Websites", `<span id="work-h">Websites we designed &amp; built</span>`, "Live websites we built for our clients. Tap one to visit it.")}
    <div class="site-grid">${live.map(siteCard).join("")}</div>
    <div class="sub-head"><h3>Animated website concepts</h3><p>Concept builds from our Animated Website series. Tap one to watch it on Instagram.</p></div>
    ${rowBar("work-row", "<span></span>")}
  </div>
  <div class="hrow reel-row" id="work-row" data-row tabindex="0" aria-label="Animated website concepts">${concepts.map(siteReel(site)).join("")}</div>
  ${rowProg("work-row")}
</section>

<section class="section apps" id="apps" aria-labelledby="apps-h">
  <div class="wrap">
    ${head("03", "Mobile apps", `<span id="apps-h">Apps for iOS &amp; Android</span>`, "From the first screens to the App Store and Google Play, with the admin side your team needs.")}
    ${rowBar("apps-row", "<span></span>")}
  </div>
  <div class="hrow reel-row" id="apps-row" data-row tabindex="0" aria-label="Apps we built">${apps.map(appCards(site)).join("")}</div>
  ${rowProg("apps-row")}
</section>

<section class="section motion" id="motion" aria-labelledby="motion-h">
  <div class="wrap">
    ${head("04", "Motion graphics & content ads", `<span id="motion-h">Content that holds attention</span>`, "Reels, ads, 3D and brand films, every frame and every sound made by us. Tap any video to watch it on Instagram.")}
    ${rowBar("reel-row", `<div class="filters" role="group" aria-label="Filter videos" data-filter="#reel-row .reel"><button type="button" class="on" data-f="*">All</button><button type="button" data-f="ad">Ads</button><button type="button" data-f="brand">Brand</button><button type="button" data-f="reel">Reels</button><button type="button" data-f="client">Client work</button></div>`)}
  </div>
  <div class="hrow reel-row" id="reel-row" data-row tabindex="0" aria-label="Motion graphics videos">${motion.map(reelOf(site)).join("")}</div>
  ${rowProg("reel-row")}
</section>

<section class="section spot" aria-label="Start a project">
  <div class="wrap"><div class="spot-in">
    <p class="spot-big">Got an idea? <span class="grad">Appify it.</span></p>
    <p class="spot-sub">Book a free call. We'll turn your idea into a prototype and give you a clear price.</p>
    <a class="btn primary big" href="/book">Get a free prototype${icon.arrow}</a>
  </div></div>
</section>

${booking(site, false, "05")}

<section class="section faqs" id="faq" aria-labelledby="faq-h">
  <div class="wrap faq-grid">
    <div data-reveal>${head("06", "FAQ", `<span id="faq-h">Questions people ask us</span>`, `Still unsure? <a href="#book">Book a call</a> or email <a href="mailto:${esc(site.settings.email)}">${esc(site.settings.email)}</a>.`)}</div>
    ${faqList(site.faqs)}
  </div>
</section>`;
  return layout({
    site, path: "/", body, bodyClass: "home",
    title: "Appify | Web Design, Mobile Apps & Motion Graphics in Lebanon",
    description: "Appify is a creative tech studio in Lebanon: animated websites and online stores from $360 with $0/month, mobile apps, motion graphics, content ads and Meta ads.",
    jsonld: [graph(orgLD(site), { "@type": "WebSite", "@id": `${site.url}/#website`, name: "Appify", url: site.url + "/", publisher: { "@id": `${site.url}/#org` }, inLanguage: "en" }, faqLD(site.faqs))],
  });
}

// ── case study ───────────────────────────────────────────────────────────────────────────────────
export function workPage(site, p) {
  const others = site.projects.filter((x) => x.kind === "website" && x.slug !== p.slug);
  const moreLive = others.filter(isLive);
  const next = others[0];
  const body = `
<article class="case">
  <section class="case-hero">
    <div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div></div>
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/#work">Work</a><span>/</span><span aria-current="page">${esc(p.title)}</span></nav>
      <p class="kicker">${sparkSVG("k-spark")}<span>${esc(p.category)}</span><span class="dot"></span><span>${esc(p.client)}</span></p>
      <h1 class="case-title" data-split>${esc(p.title)}</h1>
      <p class="lede">${esc(p.summary)}</p>
      <div class="cta-row">${p.live_url ? `<a class="btn primary big" href="${esc(p.live_url)}" target="_blank" rel="noopener">Visit the live site${icon.ext}</a>` : ""}${!isLive(p) ? `<a class="btn ${p.live_url ? "ghost" : "primary"} big" href="${esc(igOf(site, p))}" target="_blank" rel="noopener">${icon.ig}Watch on Instagram</a>` : ""}<a class="btn ghost big" href="/book">Get a website like this</a></div>
    </div>
  </section>
  ${isLive(p) ? `<div class="wrap case-shot">${siteCard(p).replace(/<p class="meta">[\s\S]*<\/a>$/, "</a>")}</div>` : ""}
  <section class="wrap case-body">
    <div class="case-text" data-reveal><h2>About the project</h2><p>${esc(p.description)}</p></div>
    ${p.features.length ? `<div class="case-feat" data-reveal><h2>What we built</h2><ul>${p.features.map((f) => `<li>${sparkSVG("li-spark")}${esc(f)}</li>`).join("")}</ul></div>` : ""}
    ${p.stack.length ? `<div class="case-stack" data-reveal><h2>Built with</h2><div class="tags">${p.stack.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>` : ""}
  </section>
  ${next ? `<section class="wrap case-next" data-reveal><p class="eyebrow">Next project</p><a class="next-link" href="/work/${next.slug}"><span>${esc(next.title)}</span>${icon.arrow}</a></section>` : ""}
  <section class="section"><div class="wrap">${head("", "More work", "More websites by Appify", "")}<div class="site-grid">${moreLive.slice(0, 4).map(siteCard).join("")}</div></div></section>
</article>
${booking(site)}`;
  return layout({
    site, path: `/work/${p.slug}`, body, bodyClass: "page-case", image: p.poster ? p.poster.replace(".webp", ".jpg") : "/og.png",
    title: p.seo_title || `${p.title} | Appify`, description: p.seo_description || p.summary,
    jsonld: [graph({ "@type": "CreativeWork", name: p.title, about: p.category, description: p.description, url: `${site.url}/work/${p.slug}`, creator: { "@id": `${site.url}/#org` }, ...(p.live_url ? { sameAs: p.live_url } : {}) }, crumbs(site, [["Home", "/"], ["Work", "/#work"], [p.title, `/work/${p.slug}`]]), orgLD(site))],
  });
}

// ── service landing page ─────────────────────────────────────────────────────────────────────────
export function servicePage(site, s) {
  const faqs = site.faqs.filter((f) => f.topic === s.faq_topic || f.topic === "general");
  const related = s.related === "motion" ? `<div class="hrow reel-row static" data-row>${site.motion.slice(0, 6).map(reelOf(site)).join("")}</div>`
    : s.related === "apps" ? `<div class="hrow reel-row static" data-row>${site.projects.filter((p) => p.kind === "app").map(appCards(site)).join("")}</div>`
    : `<div class="wrap"><div class="site-grid">${site.projects.filter((p) => p.kind === "website" && isLive(p)).map(siteCard).join("")}</div></div>`;
  const body = `
<section class="case-hero svc-hero">
  <div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div><div class="beam"></div></div>
  <div class="wrap svc-hero-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Services</span><span>/</span><span aria-current="page">${esc(s.name)}</span></nav>
      <p class="kicker">${sparkSVG("k-spark")}<span>${esc(s.name)}</span><span class="dot"></span><span>Lebanon</span></p>
      <h1 class="case-title" data-split>${esc(s.h1)}</h1>
      <p class="lede">${esc(s.intro)}</p>
      <div class="cta-row"><a class="btn primary big" href="/book">Get a free prototype${icon.arrow}</a>${PRICING[s.slug] ? `<a class="btn ghost big" href="#pricing">See pricing</a>` : `<a class="btn ghost big" href="/#work">See our work</a>`}</div>
    </div>
    <div class="svc-dev" aria-hidden="true">${devSVG({ thumbs: 1, brow: 14, lid: 0.05, smile: 1, look: -4, tilt: 3 }, "")}</div>
  </div>
</section>
${pricing(s)}
<section class="section"><div class="wrap"><div class="points">${s.points.map((x, i) => `<div class="point" data-reveal style="--d:${(i % 3) * 70}ms">${sparkSVG("pt-spark")}<h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></div>`).join("")}</div></div></section>
<section class="section"><div class="wrap">${head("", "Our work", s.related === "motion" ? "Recent motion work" : s.related === "apps" ? "Apps we're building" : "Websites we built", "")}</div>${related}</section>
<section class="section faqs"><div class="wrap faq-grid"><div>${head("", "FAQ", `${esc(s.name)}: common questions`, "")}</div>${faqList(faqs)}</div></section>
<section class="section"><div class="wrap other-svcs">${head("", "Also from Appify", "Other services", "")}<div class="svc-grid">${site.services.filter((x) => x.slug !== s.slug).map(serviceCard).join("")}</div></div></section>
${booking(site)}`;
  return layout({
    site, path: `/services/${s.slug}`, body, bodyClass: "page-svc", title: s.meta_title, description: s.meta_description,
    jsonld: [graph({ "@type": "Service", name: s.h1, serviceType: s.name, description: s.meta_description, provider: { "@id": `${site.url}/#org` }, areaServed: { "@type": "Country", name: "Lebanon" }, url: `${site.url}/services/${s.slug}` }, faqLD(faqs), crumbs(site, [["Home", "/"], [s.name, `/services/${s.slug}`]]), orgLD(site))],
  });
}

// ── book a call: the booking form on its own page ────────────────────────────────────────────────
export function bookPage(site) {
  return layout({
    site, path: "/book", body: booking(site, true), bodyClass: "page-book",
    title: "Book a free prototype call | Appify", description: "Pick a day and a time for a free call with Appify in Lebanon. Tell us your idea for a website, an app or a video.",
    jsonld: [graph(crumbs(site, [["Home", "/"], ["Book a call", "/book"]]), orgLD(site))],
  });
}

export function notFoundPage(site) {
  const body = `<section class="case-hero nf"><div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div></div>
  <div class="wrap nf-in"><div class="nf-dev" aria-hidden="true">${devSVG({ shock: 1, brow: 18, look: 3 }, "")}</div>
  <div><p class="eyebrow">404</p><h1 class="case-title">This page popped.</h1><p class="lede">It moved or never existed. Here's the way back.</p>
  <div class="cta-row"><a class="btn primary big" href="/">Go home${icon.arrow}</a><a class="btn ghost big" href="/#work">See our work</a></div></div></div></section>`;
  return layout({ site, path: "/404", body, title: "Page not found | Appify", description: "This page doesn't exist." }).replace('content="index, follow, max-image-preview:large, max-video-preview:-1"', 'content="noindex"');
}
