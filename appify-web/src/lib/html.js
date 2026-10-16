// HTML helpers and the page shell (head, nav, footer). Everything is server-rendered so search engines
// get the full content; the browser script only adds motion and interaction on top.
import { WORDMARK, sparkPath } from "../../public/assets/js/brand.js";

export const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const json = (s) => { try { return JSON.parse(s || "[]"); } catch { return []; } };
export const ASSET_V = "20261016w";

export const icon = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17v11h-17z M3.5 7l8.5 6.5L20.5 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.4L3 21l4.7-1.2A9 9 0 1 0 12 3Zm0 1.8a7.2 7.2 0 1 1-3.7 13.4l-.3-.2-2.8.7.8-2.7-.2-.3A7.2 7.2 0 0 1 12 4.8Zm-3 3.6c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.9 2.6.7 3.1.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.5.3-.4v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4H9Z" fill="currentColor"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
};
export const sparkSVG = (cls = "spark", fill = "currentColor") => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><path d="${sparkPath(50, 50, 48, 0.22)}" fill="${fill}"/></svg>`;
export const wordmarkSVG = (cls = "wordmark", label = "Appify") => `<svg class="${cls}" viewBox="${WORDMARK.viewBox}" role="img" aria-label="${label}"><path d="${WORDMARK.letters}" fill="currentColor"/><path class="wm-spark" d="${WORDMARK.spark}"/></svg>`;

const NAV = [["Work", "/#work"], ["Apps", "/#apps"], ["Motion", "/#motion"], ["FAQ", "/#faq"]];

export function layout({ site, title, description, path = "/", image = "/og.png", jsonld = [], body, bodyClass = "" }) {
  const url = site.url + path;
  const img = image.startsWith("http") ? image : site.url + image;
  const ld = jsonld.filter(Boolean).map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add("js")</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1">
<meta name="theme-color" content="#0A0913">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Appify">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(img)}">
<meta name="geo.region" content="LB">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/sora-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-mono-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${ASSET_V}">
<script type="module" src="/assets/js/app.js?v=${ASSET_V}"></script>
${ld}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>
<header class="nav" data-nav>
  <div class="wrap nav-in">
    <a class="brand" href="/" aria-label="Appify home">${wordmarkSVG("wordmark", "Appify")}</a>
    <nav class="nav-links" aria-label="Main">
      ${NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}
      <details class="nav-more"><summary>Services</summary><div class="nav-menu">${site.services.map((s) => `<a href="/services/${s.slug}">${esc(s.name)}</a>`).join("")}</div></details>
    </nav>
    <a class="btn primary sm magnetic nav-cta" href="/book">Book a call</a>
    <button class="nav-burger" aria-label="Open menu" aria-expanded="false" data-burger><span></span><span></span></button>
  </div>
  <div class="nav-mobile" data-mobile-menu>
    ${NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}
    ${site.services.map((s) => `<a class="sub" href="/services/${s.slug}">${esc(s.name)}</a>`).join("")}
    <a class="btn primary" href="/book">Book a call</a>
  </div>
</header>
<main id="main">
${body}
</main>
${footer(site)}
<dialog class="player" data-player aria-label="Video player">
  <button class="player-x" data-close aria-label="Close video">×</button>
  <video controls playsinline preload="none"></video>
  <p class="player-title"></p>
</dialog>
</body>
</html>`;
}

function footer(site) {
  const y = new Date().getUTCFullYear();
  return `<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-brand">
      <a href="/" aria-label="Appify home">${wordmarkSVG("wordmark big", "Appify")}</a>
      <p class="foot-tag">${esc(site.settings.tagline || "Ideas, appified.")}</p>
      <p class="foot-sub">Websites, mobile apps, motion graphics and Meta ads, made in Lebanon.</p>
    </div>
    <nav class="foot-col" aria-label="Services"><h2>Services</h2>${site.services.map((s) => `<a href="/services/${s.slug}">${esc(s.name)}</a>`).join("")}</nav>
    <nav class="foot-col" aria-label="Site"><h2>Studio</h2><a href="/#work">Websites</a><a href="/#apps">Mobile apps</a><a href="/#motion">Motion graphics</a><a href="/#faq">FAQ</a><a href="/book">Book a call</a></nav>
    <div class="foot-col"><h2>Contact</h2>
      <a href="mailto:${esc(site.settings.email)}">${icon.mail}${esc(site.settings.email)}</a>
      ${site.settings.whatsapp ? `<a href="https://wa.me/${esc(site.settings.whatsapp)}" rel="noopener">${icon.wa}WhatsApp</a>` : ""}
      <a href="${esc(site.settings.instagram)}" rel="noopener me" target="_blank">${icon.ig}${esc(site.settings.instagram_handle)}</a>
    </div>
  </div>
  <div class="wrap foot-bottom"><span>© ${y} Appify. All rights reserved.</span><span>Concept builds are labelled as concepts.</span></div>
</footer>`;
}
