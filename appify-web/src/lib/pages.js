// The pages: home, case studies, service landing pages, 404. Each returns a full HTML document.
import { esc, icon, sparkSVG, wordmarkSVG, layout } from "./html.js";
import { devSVG } from "../../public/assets/js/dev.js";

const KIND = { ad: "Content ad", brand: "Brand film", reel: "Reel", client: "Client work" };
const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const isoDur = (s) => `PT${Math.floor(s / 60) ? Math.floor(s / 60) + "M" : ""}${s % 60}S`;
// Cards autoplay a short, light preview (media/p/); the player opens the full video with sound.
const preview = (v) => (v || "").replace("/media/", "/media/p/");
const poster = (p) => `--poster:url('${esc((p || "").replace("/media/", "/media/b/"))}')`; // pre-blurred backdrop
const DEV_LINES = ["Hi, I'm Dev. Tap my tablet!", "That's our intro playing.", "Your first prototype is free.", "Delivered in under 7 days.", "Tap me, I do tricks."];
// The hero intro video, playing on Dev's tablet (a wide 16:9 video fits it best). Placeholder until the real intro is ready.
const INTRO = { video: "/media/showreel.mp4", poster: "/media/showreel.webp" };

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
      { "@type": "Offer", name: "Lifetime website", price: "360", priceCurrency: "USD", description: "UI/UX design, admin panel, custom analytics, motion graphics and free hosting. One payment, $0 per month, delivered in under 7 days." },
      { "@type": "Offer", name: "Animated website", priceSpecification: { "@type": "PriceSpecification", minPrice: "500", priceCurrency: "USD" } },
    ],
  };
}
const graph = (...items) => ({ "@context": "https://schema.org", "@graph": items.filter(Boolean) });
const faqLD = (faqs) => faqs.length && { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) };
const videoLD = (site, m) => ({ "@type": "VideoObject", name: m.title, description: m.summary, thumbnailUrl: site.url + m.poster, contentUrl: site.url + m.video, uploadDate: m.upload_date || "2026-10-14", duration: isoDur(m.duration || 0), creator: { "@id": `${site.url}/#org` } });
const crumbs = (site, list) => ({ "@type": "BreadcrumbList", itemListElement: list.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: site.url + path })) });

// ── pieces ───────────────────────────────────────────────────────────────────────────────────────
const head = (num, eyebrow, h2, text) => `<header class="sec-head" data-reveal><p class="eyebrow"><span>${num}</span>${esc(eyebrow)}</p><h2>${h2}</h2>${text ? `<p class="sec-text">${text}</p>` : ""}</header>`;

// At most two sentences on a card.
const twoSentences = (t = "") => (t.match(/[^.!?]+[.!?]+(\s|$)/g) || [t]).slice(0, 2).join("").trim();
// A website card, in the same style as the video cards: the frame, a play button in the corner, text below.
// Tapping the frame plays the full video in place, with sound.
function workCard(p, i = 0) {
  const cats = [p.category === "Animated website" ? "animated" : "", p.category === "E-commerce" ? "ecommerce" : ""].join(" ");
  return `<article class="reel site" data-cats="${cats}" data-reveal style="--d:${(i % 5) * 70}ms">
  <div class="reel-media${p.aspect === "4/5" ? "" : " fit"}" style="${poster(p.poster)}" data-vcard>
    <video playsinline preload="none" poster="${esc(p.poster)}" data-full="${esc(p.video)}" aria-label="${esc(p.title)} video"></video>
    <button class="vtap" type="button" aria-label="Play the ${esc(p.title)} video"><span class="reel-play">${icon.play}</span></button>
    <i class="vbar" aria-hidden="true"></i>
  </div>
  <h3><a href="/work/${p.slug}">${esc(p.title)}</a></h3>
  <p class="summary">${esc(twoSentences(p.summary))}</p>
  <div class="work-actions">
    ${p.live_url ? `<a class="btn sm card-btn" href="${esc(p.live_url)}" target="_blank" rel="noopener">Visit site${icon.ext}</a>` : ""}
    <a class="btn sm card-btn" href="/work/${p.slug}">Case study${icon.arrow}</a>
  </div>
</article>`;
}
// Website videos' lengths in seconds (ffprobe), for the time tag on the home row.
const SITE_SECONDS = { "/media/wtc-launch.mp4": 25, "/media/firnlight.mp4": 20, "/media/oddball.mp4": 21, "/media/valmora.mp4": 21, "/media/earshot.mp4": 15 };
// The home websites row uses the video card exactly as section 3 does (motionCard), fed with a website.
const siteReel = (p, i) => motionCard({ ...p, kind: p.category, duration: SITE_SECONDS[p.video] || 0, client: "Appify" }, i).replace('<article class="reel" data-kind="', `<article class="reel" data-cats="${[p.category === "Animated website" ? "animated" : "", p.category === "E-commerce" ? "ecommerce" : ""].join(" ")}" data-kind="`);
// Horizontal rows (websites, videos): arrows, drag, a progress line. id ties the controls to the row.
const rowBar = (id, filters) => `<div class="motion-bar">${filters}<div class="scroll-btns"><button type="button" data-scroll="-1" data-for="${id}" aria-label="Previous">${icon.arrow}</button><button type="button" data-scroll="1" data-for="${id}" aria-label="Next">${icon.arrow}</button></div></div>`;
const rowProg = (id) => `<div class="wrap"><div class="row-prog" data-prog-for="${id}" aria-hidden="true"><i></i></div></div>`;

function motionCard(m, i) {
  return `<article class="reel" data-kind="${m.kind}" data-reveal>
  <button class="reel-media${m.aspect === "9/16" ? "" : " fit"}" type="button" style="${poster(m.poster)}" data-play="${esc(m.video)}" data-title="${esc(m.title)}" aria-label="Play ${esc(m.title)} with sound">
    <video muted loop playsinline preload="none" poster="${esc(m.poster)}" data-src="${esc(preview(m.video))}" aria-hidden="true"></video>
    <span class="reel-play">${icon.play}</span><span class="reel-time">${mmss(m.duration || 0)}</span>
  </button>
  <p class="meta">${esc(KIND[m.kind] || m.kind)}${m.client !== "Appify" ? ` · ${esc(m.client)}` : ""}</p>
  <h3>${esc(m.title)}</h3>
  <p class="summary">${esc(m.summary)}</p>
</article>`;
}

// Apps use the same video card as section 3. Until an app has its own video, it shows a placeholder one.
const APP_PLACEHOLDER = { video: "/media/ecommerce-chat.mp4", poster: "/media/ecommerce-chat.webp", aspect: "9/16", duration: 24 };
const appReel = (p, i) => motionCard({ ...APP_PLACEHOLDER, ...(p.video ? { video: p.video, poster: p.poster, aspect: p.aspect, duration: 0 } : {}), title: p.title, summary: p.summary, kind: p.category, client: "Appify" }, i);

const SERVICE_ICON = {
  "web-design-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="5" y="9" width="38" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M5 16h38M17 43h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  "mobile-app-development-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="13" y="4" width="22" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M21 10h6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  "motion-graphics-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="10" width="40" height="28" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 18v12l10-6z" fill="currentColor"/></svg>',
  "meta-ads-lebanon": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 34V14l18-6v32l-18-6Zm18-20c8 0 12 4 12 10s-4 10-12 10M8 34l4 9h6l-3-9" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>',
};
const serviceCard = (s, i) => `<a class="svc" href="/services/${s.slug}" data-reveal style="--d:${i * 70}ms"><span class="svc-ic">${SERVICE_ICON[s.slug] || ""}</span><h3>${esc(s.name)}</h3><p>${esc(s.intro.split(". ")[0])}.</p><span class="link">Learn more${icon.arrow}</span></a>`;

function faqList(faqs) {
  return `<div class="faq-list">${faqs.map((f, i) => `<details class="faq" data-reveal style="--d:${(i % 4) * 50}ms"${i === 0 ? " open" : ""}><summary><h3>${esc(f.question)}</h3><span class="faq-ic" aria-hidden="true"></span></summary><div class="faq-a"><p>${esc(f.answer)}</p></div></details>`).join("")}</div>`;
}

function booking(site, page = false) {
  const s = site.settings;
  const services = ["Website", "Online store", "Animated website", "Mobile app", "Motion graphics", "Meta ads", "Something else"];
  const slots = JSON.parse(s.booking_slots || "[]");
  const h = page ? "h1" : "h2";
  return `<section class="section book${page ? " book-page" : ""}" id="book" aria-labelledby="book-h">
  ${page ? `<div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div><div class="beam"></div></div>` : ""}
  <div class="wrap book-grid">
    <div class="book-copy" data-reveal>
      ${page ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">Book a call</span></nav><p class="eyebrow"><span>Free</span>Prototype call</p>` : `<p class="eyebrow"><span>04</span>Book a call</p>`}
      <${h} id="book-h">Tell us your idea. <span class="grad">We'll appify it.</span></${h}>
      <p class="sec-text">Pick a day and a time, choose what you need, and send it by ${s.whatsapp ? "WhatsApp or email" : "email"}. We reply to confirm your call.</p>
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
        ${s.whatsapp ? `<button class="btn primary big magnetic" type="submit" name="channel" value="whatsapp">${icon.wa}Send on WhatsApp</button>` : ""}
        <button class="btn ${s.whatsapp ? "ghost" : "primary"} big magnetic" type="submit" name="channel" value="email">${icon.mail}Send by email</button>
      </div>
    </form>
  </div>
</section>`;
}

// ── home ─────────────────────────────────────────────────────────────────────────────────────────
export function homePage(site) {
  const websites = site.projects.filter((p) => p.kind === "website");
  const apps = site.projects.filter((p) => p.kind === "app");
  const motion = site.motion;
  const marquee = ["Websites", "Online stores", "Animated websites", "Mobile apps", "Motion graphics", "3D", "Content ads", "Meta ads", "UI/UX"];
  const body = `
<section class="hero" data-hero>
  <div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div><div class="beam"></div>${[1, 2, 3, 4, 5, 6].map((i) => `<span class="float f${i}">${sparkSVG("fs")}</span>`).join("")}</div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">${sparkSVG("k-spark")}<span>${esc(site.settings.tagline)}</span><span class="dot"></span><span>Made in Lebanon</span></p>
      <h1 class="hero-title" data-split>Websites, apps &amp; motion graphics that <span class="grad">stop the scroll.</span></h1>
      <p class="lede">Appify is a creative tech studio in Lebanon. We design animated websites and online stores, build mobile apps and make content ads that put your brand in the spotlight.</p>
      <div class="cta-row"><a class="btn primary big magnetic" href="/book" data-hero-cta>Get a free prototype${icon.arrow}</a></div>
    </div>
    <div class="hero-dev" data-dev data-lines='${esc(JSON.stringify(DEV_LINES))}'>
      <div class="orbit" aria-hidden="true">${["Websites", "Apps", "Motion", "Meta ads", "3D", "UI/UX"].map((x) => `<span><i>${x}</i></span>`).join("")}</div>
      <div class="dev-talk"><div class="dev-bubble" aria-hidden="true">${esc(DEV_LINES[0])}</div><a class="dev-cta" href="/book" tabindex="-1">Book your free prototype${icon.arrow}</a></div>
      <div class="dev-body">
        <button class="dev-btn" type="button" aria-label="Dev, the Appify mascot. Tap him.">${devSVG({ wave: 1, waveAng: 10, brow: 12, lid: 0.08, smile: 1 })}</button>
        <div class="dev-screen" aria-hidden="true"><video muted loop playsinline preload="none" poster="${esc(INTRO.poster)}" data-src="${esc(preview(INTRO.video))}"></video></div>
        <div class="dev-fg" aria-hidden="true">${devSVG({ wave: 1, waveAng: 10, screen: "fg" }, "")}</div>
        <button class="dev-tab" type="button" data-intro data-play="${esc(INTRO.video)}" data-title="Meet Appify" aria-label="Play the Appify intro with sound"><span class="tab-play">${icon.play}</span></button>
      </div>
      <div class="dev-floor" aria-hidden="true"></div>
    </div>
  </div>
  <div class="marquee" aria-hidden="true"><div class="marquee-in">${[...marquee, ...marquee].map((m) => `<span>${m}</span>${sparkSVG("m-spark")}`).join("")}</div></div>
</section>

<section class="section svcs" aria-labelledby="svc-h">
  <div class="wrap">
    ${head("00", "What we do", `<span id="svc-h">Four ways we grow your brand</span>`, "")}
    <div class="svc-grid">${site.services.map(serviceCard).join("")}</div>
  </div>
</section>

<section class="section work" id="work" aria-labelledby="work-h">
  <div class="wrap">
    ${head("01", "Websites", `<span id="work-h">Websites we designed &amp; built</span>`, "A live client store and four concept builds from our Animated Website series. Tap any video to watch it with sound.")}
    ${rowBar("work-row", `<div class="filters" role="group" aria-label="Filter websites" data-filter="#work-row .reel"><button type="button" class="on" data-f="*">All</button><button type="button" data-f="animated">Animated</button><button type="button" data-f="ecommerce">E-commerce</button></div>`)}
  </div>
  <div class="hrow reel-row" id="work-row" data-row tabindex="0" aria-label="Websites we built">${websites.slice(0, 5).map(siteReel).join("")}</div>
  ${rowProg("work-row")}
</section>

<section class="section apps" id="apps" aria-labelledby="apps-h">
  <div class="wrap">
    ${head("02", "Mobile apps", `<span id="apps-h">Apps for iOS &amp; Android</span>`, "From the first screens to the App Store and Google Play, with the admin side your team needs.")}
    ${rowBar("apps-row", "<span></span>")}
  </div>
  <div class="hrow reel-row" id="apps-row" data-row tabindex="0" aria-label="Apps we built">${apps.map(appReel).join("")}</div>
  ${rowProg("apps-row")}
</section>

<section class="section motion" id="motion" aria-labelledby="motion-h">
  <div class="wrap">
    ${head("03", "Motion graphics & content ads", `<span id="motion-h">Content that holds attention</span>`, "Reels, ads, 3D and brand films, every frame and every sound made by us. Tap any video to watch it with sound.")}
    ${rowBar("reel-row", `<div class="filters" role="group" aria-label="Filter videos" data-filter="#reel-row .reel"><button type="button" class="on" data-f="*">All</button><button type="button" data-f="ad">Ads</button><button type="button" data-f="brand">Brand</button><button type="button" data-f="reel">Reels</button><button type="button" data-f="client">Client work</button></div>`)}
  </div>
  <div class="hrow reel-row" id="reel-row" data-row tabindex="0" aria-label="Motion graphics videos">${motion.map(motionCard).join("")}</div>
  ${rowProg("reel-row")}
</section>

<section class="section spot" aria-label="Why Appify">
  <div class="wrap spot-in" data-reveal>
    <p class="spot-k">You just scrolled past ${motion.length} videos and ${Math.min(5, websites.length)} websites.</p>
    <p class="spot-big">That's what we do to your brand: <span class="grad">put it in the spotlight.</span></p>
    <a class="btn primary big magnetic" href="#book">Start your project${icon.arrow}</a>
  </div>
</section>

${booking(site)}

<section class="section faqs" id="faq" aria-labelledby="faq-h">
  <div class="wrap faq-grid">
    <div data-reveal>${head("05", "FAQ", `<span id="faq-h">Questions people ask us</span>`, `Still unsure? <a href="#book">Book a call</a> or email <a href="mailto:${esc(site.settings.email)}">${esc(site.settings.email)}</a>.`)}</div>
    ${faqList(site.faqs)}
  </div>
</section>`;
  return layout({
    site, path: "/", body, bodyClass: "home",
    title: "Appify | Web Design, Mobile Apps & Motion Graphics in Lebanon",
    description: "Appify is a creative tech studio in Lebanon: animated websites and online stores from $360 with $0/month, mobile apps, motion graphics, content ads and Meta ads.",
    jsonld: [graph(orgLD(site), { "@type": "WebSite", "@id": `${site.url}/#website`, name: "Appify", url: site.url + "/", publisher: { "@id": `${site.url}/#org` }, inLanguage: "en" }, faqLD(site.faqs), ...motion.map((m) => videoLD(site, m)))],
  });
}

// ── case study ───────────────────────────────────────────────────────────────────────────────────
export function workPage(site, p) {
  const others = site.projects.filter((x) => x.kind === "website" && x.slug !== p.slug);
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
      <div class="cta-row">${p.live_url ? `<a class="btn primary big magnetic" href="${esc(p.live_url)}" target="_blank" rel="noopener">Visit the live site${icon.ext}</a>` : ""}<a class="btn ghost big" href="/book">Get a website like this</a></div>
    </div>
  </section>
  ${p.video ? `<div class="wrap case-video" data-reveal><video controls playsinline preload="metadata" poster="${esc(p.poster)}" style="aspect-ratio:${p.aspect}"><source src="${esc(p.video)}" type="video/mp4"></video></div>` : ""}
  <section class="wrap case-body">
    <div class="case-text" data-reveal><h2>About the project</h2><p>${esc(p.description)}</p></div>
    ${p.features.length ? `<div class="case-feat" data-reveal><h2>What we built</h2><ul>${p.features.map((f) => `<li>${sparkSVG("li-spark")}${esc(f)}</li>`).join("")}</ul></div>` : ""}
    ${p.stack.length ? `<div class="case-stack" data-reveal><h2>Built with</h2><div class="tags">${p.stack.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>` : ""}
  </section>
  ${next ? `<section class="wrap case-next" data-reveal><p class="eyebrow">Next project</p><a class="next-link" href="/work/${next.slug}"><span>${esc(next.title)}</span>${icon.arrow}</a></section>` : ""}
  <section class="section"><div class="wrap">${head("", "More work", "More websites by Appify", "")}<div class="work-grid">${others.slice(0, 3).map(workCard).join("")}</div></div></section>
</article>
${booking(site)}`;
  const vid = p.video ? { "@type": "VideoObject", name: `${p.title}: website by Appify`, description: p.summary, thumbnailUrl: site.url + p.poster, contentUrl: site.url + p.video, uploadDate: (p.created_at || "2026-10-14").slice(0, 10) } : null;
  return layout({
    site, path: `/work/${p.slug}`, body, bodyClass: "page-case", image: p.poster ? p.poster.replace(".webp", ".jpg") : "/og.png",
    title: p.seo_title || `${p.title} | Appify`, description: p.seo_description || p.summary,
    jsonld: [graph({ "@type": "CreativeWork", name: p.title, about: p.category, description: p.description, url: `${site.url}/work/${p.slug}`, creator: { "@id": `${site.url}/#org` }, ...(p.live_url ? { sameAs: p.live_url } : {}), ...(vid ? { video: vid } : {}) }, crumbs(site, [["Home", "/"], ["Work", "/#work"], [p.title, `/work/${p.slug}`]]), orgLD(site))],
  });
}

// ── service landing page ─────────────────────────────────────────────────────────────────────────
export function servicePage(site, s) {
  const faqs = site.faqs.filter((f) => f.topic === s.faq_topic || f.topic === "general");
  const related = s.related === "motion" ? `<div class="hrow reel-row static" data-row>${site.motion.slice(0, 6).map(motionCard).join("")}</div>`
    : s.related === "apps" ? `<div class="hrow reel-row static" data-row>${site.projects.filter((p) => p.kind === "app").map(appReel).join("")}</div>`
    : `<div class="wrap"><div class="work-grid">${site.projects.filter((p) => p.kind === "website").slice(0, 6).map(workCard).join("")}</div></div>`;
  const body = `
<section class="case-hero svc-hero">
  <div class="hero-bg" aria-hidden="true"><div class="grid"></div><div class="glow"></div><div class="spot"></div><div class="beam"></div></div>
  <div class="wrap svc-hero-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Services</span><span>/</span><span aria-current="page">${esc(s.name)}</span></nav>
      <p class="kicker">${sparkSVG("k-spark")}<span>${esc(s.name)}</span><span class="dot"></span><span>Lebanon</span></p>
      <h1 class="case-title" data-split>${esc(s.h1)}</h1>
      <p class="lede">${esc(s.intro)}</p>
      <div class="cta-row"><a class="btn primary big magnetic" href="#book">Book a free call${icon.arrow}</a><a class="btn ghost big" href="/#work">See our work</a></div>
    </div>
    <div class="svc-dev" aria-hidden="true">${devSVG({ thumbs: 1, brow: 14, lid: 0.05, smile: 1, look: -4, tilt: 3 }, "")}</div>
  </div>
</section>
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
