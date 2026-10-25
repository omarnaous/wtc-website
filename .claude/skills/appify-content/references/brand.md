# Appify brand, offers and proof

## Identity
- Name: **Appify** · site **appify-lb.com** · booking page **appify-lb.com/book** · Instagram **@appifylb**
- Location: Lebanon. Tone: confident, friendly, a bit playful, emojis in captions (✅ 📩 🛍️ 📱 ✨ 🤍).
- Wordmark: `assets/brand.js` (`WORDMARK.viewBox`, `.letters`, `.spark`). Draw letters in white/ink, the spark in
  yellow (on dark) or UV (on light). Never set "appify" in a font.
- Colours: ink `#0A0913` · ink2 `#15122A` · UV `#5B2BFF` · iris `#8F72FF` · paper `#F3F1FA` · yellow `#FFD23F`
  · pink `#FF2D6F` (problems / "the trap") · mint `#3DDC97` (success / online / paid) · mute `#8A84A3`
- Fonts: **Sora 600** (display, letter-spacing −0.045em, line-height ~0.98), **Geist 400/600** (UI/body),
  **Geist Mono 500** (eyebrows/labels, uppercase, letter-spacing 0.16em). Files live in the repos' `public/`.
- House look: ink background + 60 px iris grid at ~0.3 opacity + a UV radial glow; yellow spark accents;
  rounded cards (22–28 px radius); white receipt/paper cards with dashed rules and a "PAID ONCE" stamp.

## Plans and prices (from appify-web/src/lib/pages.js — only claim these)
| Plan | Price | Includes |
|---|---|---|
| E-commerce website (Standard) | **$360, pay once** | Premium template, admin panel, hosting included, no monthly fees |
| Web app (Custom) | **from $500, pay once** | CRM, business systems, automations & workflows, custom dashboards, admin panel, hosting included |
| Mobile app (iOS + Android) | **from $999** ("starting at"; *not* stated as pay once) | UI/UX design every screen, one app for iOS + Android, App Store & Google Play publishing, admin panel, free landing page website connected to the app |
| Motion graphics | **3 videos $199** (1 video $100, so the pack saves $101) | 15 s–1 min each, reels/ads/3D/logo reveals, hook in the first second, every format, sound design + silent cut |

Extra claims Omar has stated himself (OK to use for the $360 store): **delivered in under 7 days**, **1 month of
full support**. Earlier concept reels used "Websites that look this expensive · from $500" (animated websites).
The site says "Book a call and we'll confirm yours" → CTA wording "we confirm your exact price on the call".

## DM keywords used so far
`ECOMMERCE` ($360 store) · `APP` (mobile app) · `SYSTEM` (inventory / web app) · `CALL` (book a call) ·
`ANIMATED WEBSITE` (concept-site reels) · `PROMPT` (the "how we made it" Claude reel).

## Proof you can show
- **Darebni AI**: Appify's AI workout coach for **iPhone**, live on the App Store (screens + icon in
  `appify-darebni/public/screens/`). iPhone only: never show it as an Android app.
- **Follies d'Après-Midi** (FDM): Lebanese couture/prêt-à-porter label, site folliesdapresmidi.com built by Appify
  (custom, not the $360 template: don't use it as $360 proof). Hero film comes from the store API
  (`/api/store` → `home.hero.video.url`), not `/film/hero-*.mp4` (old fallback).
- Concept websites: NAÏADE (jewelry), Oddball, Tide Runs (game-like site), etc.

## Useful outside numbers (verify again before posting; prices change)
- Shopify Basic: $29/mo billed yearly, $39/mo monthly → $1,044–$1,404 over 3 years (Oct 2026).
- Cloudflare .com domain at cost ≈ $10.46/yr (wholesale rises Nov 1 2026 → ≈ $11.17). Hosting is included in
  Appify plans; the domain is the only yearly extra, registered in the client's name.
