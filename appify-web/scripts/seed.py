"""Builds migrations/0002_seed.sql: the site's starting content. Only real work and the facts Omar gave:
client projects name the client, concept builds say so, apps in development say so, prices are Appify's own.
Stage 2 (admin panel) edits these rows in D1 directly; re-running this script is only for a fresh database.
    python3 scripts/seed.py"""
import json, subprocess, os

def dur(slug):
    p = f"public/media/{slug}.mp4"
    if not os.path.exists(p): return 0
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout
    return round(float(out or 0))

def q(v):
    if v is None: return "NULL"
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, (list, dict)): v = json.dumps(v, ensure_ascii=False)
    return "'" + str(v).replace("'", "''") + "'"

SETTINGS = {
    "site_name": "Appify",
    "tagline": "Ideas, appified.",
    "email": "omar@appify-lb.com",
    "whatsapp": "",                       # digits only, e.g. 9613123456. Empty = WhatsApp button hidden.
    "instagram": "https://www.instagram.com/appifylb",
    "instagram_handle": "@appifylb",
    "booking_days": "14",
    "booking_closed_weekdays": "[0]",     # 0 = Sunday
    "booking_slots": json.dumps(["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]),
    "content_version": "1",               # bump to bust the edge cache after edits
}

PROJECTS = [
    dict(slug="watch-trade-chronicles", kind="website", title="Watch Trade Chronicles", client="Watch Trade Chronicles", category="E-commerce",
         status="live", live_url="https://watchtradechronicles.com", video="/media/wtc-launch.mp4", poster="/media/wtc-launch.webp", aspect="16/9", featured=1,
         summary="An online store for a watch reseller in Beirut, with a full admin dashboard behind it.",
         description="Watch Trade Chronicles sells pre-owned luxury watches. Appify designed and built the whole store: the catalogue and collections, a Strap Studio where buyers try straps on a watch before they order, and the admin side the team runs the business from: orders, inventory, sales analytics, review moderation and team accounts. We also made the launch film.",
         features=["Product catalogue and collections", "Strap Studio: try straps on a watch before buying", "Orders, inventory and sales analytics", "Customer reviews, moderated before they go live", "Team accounts with invite links"],
         stack=["Next.js", "React", "Cloudflare Workers", "D1 database", "Tailwind", "Framer Motion"],
         seo_title="Watch Trade Chronicles: e-commerce website by Appify",
         seo_description="Case study: an online watch store in Beirut with a Strap Studio, admin dashboard, inventory and sales analytics. Designed and built by Appify."),
    dict(slug="firnlight", kind="website", title="Firnlight", client="Concept brand", category="Animated website",
         status="concept", live_url="https://omarnaous.github.io/firnlight/", video="/media/firnlight.mp4", poster="/media/firnlight.webp", aspect="4/5", featured=1,
         summary="A product site that plays like a film: your scroll scrubs a 466-frame sequence while the specs animate in.",
         description="Firnlight is a concept brand we designed and built to show what a scroll-driven product page can do. The scroll bar is the timeline: 466 rendered frames play as you move, the specs animate in on cue, macro detail shots take over the screen, and add-to-cart is built into the experience instead of bolted on at the end.",
         features=["Scroll-scrubbed 466-frame product film", "Specs that animate in on cue", "Macro detail shots", "Add to cart built into the page"],
         stack=["Vite", "JavaScript", "Lenis smooth scroll"],
         seo_title="Firnlight: scroll-driven animated product website (concept) by Appify",
         seo_description="A concept product website where scrolling plays a 466-frame film, specs animate in and add-to-cart is part of the story. Designed and built by Appify."),
    dict(slug="oddball", kind="website", title="Oddball", client="Concept brand", category="Animated website",
         status="concept", live_url=None, video="/media/oddball.mp4", poster="/media/oddball.webp", aspect="4/5", featured=1,
         summary="A basketball brand site with a 3D mascot that actually plays, cards that flip and light that follows your scroll.",
         description="Oddball is Animated Website 01 in our series: a concept basketball brand built to feel like a game day. A 3D mascot dunks on the hero, no two player cards look alike, light follows the scroll, the roster flips in 3D, the playbook animates, and even the sign-up form stays on brand.",
         features=["3D mascot in the hero", "Player cards that flip in 3D", "Scroll-reactive lighting", "Animated playbook section", "On-brand forms"],
         stack=[],
         seo_title="Oddball: animated 3D basketball website (concept) by Appify",
         seo_description="Animated Website 01: a concept basketball brand with a 3D mascot, flipping roster cards and a scroll-driven playbook. Designed and built by Appify."),
    dict(slug="valmora", kind="website", title="Valmora", client="Concept marque", category="Animated website",
         status="concept", live_url=None, video="/media/valmora.mp4", poster="/media/valmora.webp", aspect="4/5", featured=1,
         summary="A classic grand tourer, unveiled as you scroll: the cover comes off, the details get close-ups and a live gauge reads out the specs.",
         description="Valmora is Animated Website 02: a concept car marque. The car sits under a cover until you scroll it off, the hero is staged like a launch event, the crystal headlamps, wire wheels and quilted cabin each get their own close-up, a working gauge reads out the specs, and the private-viewing invitation form matches the rest of the brand. The car, specifications and imagery are illustrative.",
         features=["Scroll-driven cover reveal", "Detail close-ups with callouts", "Live speedometer spec readout", "Private-viewing invitation form"],
         stack=[],
         seo_title="Valmora: luxury car website with scroll reveal (concept) by Appify",
         seo_description="Animated Website 02: a concept classic-car marque with a scroll-driven unveil, detail close-ups and a live spec gauge. Designed and built by Appify."),
    dict(slug="earshot", kind="website", title="Earshot", client="Concept brand", category="Animated website",
         status="concept", live_url=None, video="/media/earshot.mp4", poster="/media/earshot.webp", aspect="4/5", featured=1,
         summary="It looks like a video game, but it's a website: a fennec fox runs through four worlds as you scroll.",
         description="Earshot is Animated Website 03: a concept site where the hero never stops running. A fennec fox crosses four worlds (Mirage Miles, Pack Light, Tide Runs and Aurora Relay) and each world brings its own headline, colours and call to action, so the page feels like levels in a game.",
         features=["Four scroll-driven worlds", "Continuous character animation", "Per-world colour and copy", "Game-style navigation"],
         stack=[],
         seo_title="Earshot: game-style animated website (concept) by Appify",
         seo_description="Animated Website 03: a concept website that plays like a video game, with a fox running through four scroll-driven worlds. Designed and built by Appify."),
    dict(slug="darebni-ai", kind="app", title="Darebni AI", client="Darebni AI", category="Mobile app",
         status="in-development", live_url=None, video=None, poster=None, aspect="9/19.5", featured=1,
         summary="An AI-powered fitness app, in development.",
         description="Darebni AI is an AI-powered fitness app Appify is building. Screens and store links will be added here at launch.",
         features=[], stack=[]),
]

MOTION = [
    dict(slug="balloon", title="The 7-second balloon", kind="ad", summary="A 3D balloon with our logo is pumped up toward a needle and pops into confetti at exactly 7 seconds. Built to hold attention, then prove it."),
    dict(slug="showreel", title="Appify showreel", kind="brand", summary="Nine motion styles in one reel: kinetic type, product shots, 3D, data and character animation."),
    dict(slug="ecommerce-chat", title="“Hey Appify, I want an e-commerce website”", kind="ad", summary="A chat-style hook into a 7-day build, the price and a comparison table against subscription stores."),
    dict(slug="lifetime", title="$360 lifetime website vs. subscriptions", kind="ad", summary="Everything included in our lifetime website, side by side with what subscription builders charge every month."),
    dict(slug="meta-ads", title="Meta ads vs. boosting", kind="ad", summary="Why an Ads Manager campaign beats the Boost button, explained by our second mascot."),
    dict(slug="photos-get-scrolled", title="“Photos get scrolled”", kind="reel", summary="A mascot-led Instagram reel: a meme crash-zoom, a real case study and a real stat, with a synthesized soundtrack."),
    dict(slug="subscription-killer", title="Subscription Killer launch", kind="ad", summary="A product launch reel for our one-time-payment store offer, voiced by Dev."),
    dict(slug="ideas-appified", title="“Ideas, appified.”", kind="brand", summary="Kinetic typography: the letters of our slogan snap into app tiles.", aspect="9/16"),
    dict(slug="logo-reveal", title="Logo reveal", kind="brand", summary="A spark falls onto a home screen, becomes an app icon and lands as the dot on the i.", aspect="4/5"),
    dict(slug="comparison", title="Comparison graphic", kind="ad", summary="Subscription store vs. a store you own, row by row, as an animated feed post.", aspect="4/5"),
    dict(slug="wtc-launch", title="Website launch film", client="Watch Trade Chronicles", kind="client", summary="A 25-second launch film for a watch store's new website: kinetic type, animated counters, a strap try-on and a logo reveal.", aspect="16/9"),
]

FAQS = [
    ("websites", "How much does a website cost in Lebanon with Appify?", "Our lifetime website is $360, paid once. It includes the UI/UX design, an admin panel, custom analytics, motion graphics and free hosting, with no monthly subscription. Animated websites like the ones in our portfolio start from $500. Send us what you need and we'll confirm the price before we start."),
    ("websites", "How long does it take to build a website?", "We deliver websites in under 7 days. Bigger projects, like an online store with a large catalogue or custom features, get a timeline agreed with you before we start."),
    ("websites", "Are there monthly fees?", "No. You pay once and the website is yours. Hosting is included, so there's no monthly subscription to keep it online."),
    ("websites", "Do I own my website and can I edit it myself?", "Yes. Every site comes with an admin panel, so you can update products, prices, text and images yourself, and you keep full control of the website."),
    ("websites", "What is an animated website?", "A website where motion does the selling: scroll-driven product films, 3D, reveals and micro-interactions, like Firnlight, Oddball, Valmora and Earshot in our portfolio. They take longer to build than a standard site and start from $500."),
    ("websites", "Will my website show up on Google?", "We build every site on fast, mobile-first foundations: clean page structure, titles and descriptions for each page, structured data, a sitemap and quick load times. Ranking also depends on your content and competition, and we'll tell you what to focus on."),
    ("apps", "Do you build mobile apps?", "Yes. We design and build mobile apps for iOS and Android, from the first screens to the admin side and publishing on the App Store and Google Play. Darebni AI, an AI-powered fitness app, is in development with us now."),
    ("motion", "What are motion graphics and content ads?", "Short animated videos made for social media: reels, product ads, logo reveals, 3D pieces and kinetic typography, with sound designed to the picture. Every video in our motion section is our own work."),
    ("motion", "Which formats do you deliver for Instagram and TikTok?", "Reels and TikTok in 9:16, feed posts in 4:5, and 16:9 for YouTube and websites, plus a silent version so you can add trending audio, and a cover image for your grid."),
    ("ads", "Is boosting a post the same as running Meta ads?", "No. Boosting is one button with limited targeting. A campaign in Meta Ads Manager lets us choose the right objective, target and retarget audiences, test different creatives and track results. We set up and run those campaigns for you."),
    ("general", "How do I book a call with Appify?", "Use the booking form on this page: pick a day and time, choose what you need, and send it by WhatsApp or email. We reply to confirm."),
]

SERVICES = [
    dict(slug="web-design-lebanon", name="Websites", related="websites", faq_topic="websites", sort=1,
         h1="Website design and development in Lebanon",
         meta_title="Web Design in Lebanon | Websites from $360, $0/month | Appify",
         meta_description="Appify designs and builds fast, animated websites and online stores in Lebanon: UI/UX, admin panel, analytics and free hosting. $360 lifetime, delivered in under 7 days.",
         intro="We design and build websites and online stores that load fast, look like your brand and keep working without a monthly subscription. You get the design, the admin panel and the hosting for one price, delivered in under 7 days.",
         points=[dict(title="UI/UX design", text="Pages designed around what your customers need to do, on phones first."),
                 dict(title="Admin panel", text="Update products, prices, text and images yourself, any time."),
                 dict(title="Custom analytics", text="See your visits, orders and what's selling, without extra tools."),
                 dict(title="Free hosting, $0 per month", text="Pay once. No subscription to keep your site online."),
                 dict(title="Motion built in", text="Animated sections and product motion, or a fully animated site from $500."),
                 dict(title="Delivered in under 7 days", text="From the first call to a live website in a week.")]),
    dict(slug="mobile-app-development-lebanon", name="Mobile apps", related="apps", faq_topic="apps", sort=2,
         h1="Mobile app development in Lebanon",
         meta_title="Mobile App Development in Lebanon | iOS & Android | Appify",
         meta_description="Appify designs and builds iOS and Android apps in Lebanon: UI/UX, the app, the admin side and App Store and Google Play publishing.",
         intro="We turn app ideas into products people use: designed screen by screen, built for iOS and Android, with the admin side your team needs and the store listings handled for you.",
         points=[dict(title="Product and UI/UX design", text="Flows and screens designed and tested before a line of code."),
                 dict(title="iOS and Android", text="One app, built for both stores."),
                 dict(title="Admin and backend", text="Manage users, content and data from a web dashboard."),
                 dict(title="Store publishing", text="App Store and Google Play listings, screenshots and review handled.")]),
    dict(slug="motion-graphics-lebanon", name="Motion graphics", related="motion", faq_topic="motion", sort=3,
         h1="Motion graphics and content ads in Lebanon",
         meta_title="Motion Graphics & Video Ads in Lebanon | Reels, 3D, Logo Reveals | Appify",
         meta_description="Scroll-stopping motion graphics in Lebanon: Instagram and TikTok reels, product ads, 3D, logo reveals and kinetic typography, with sound designed to the picture.",
         intro="Your brand has a second to stop the scroll. We make motion graphics that use it: reels, product ads, 3D pieces and logo reveals, timed to the beat and delivered in every format you post.",
         points=[dict(title="Reels and TikToks", text="9:16 videos built around a hook in the first second."),
                 dict(title="Product and launch ads", text="Your product, your offer and your price, animated."),
                 dict(title="3D and logo reveals", text="Brand moments that make your logo memorable."),
                 dict(title="Sound design", text="Every hit has a sound, plus a silent cut for trending audio.")]),
    dict(slug="meta-ads-lebanon", name="Meta ads", related="motion", faq_topic="ads", sort=4,
         h1="Meta ads management in Lebanon",
         meta_title="Meta Ads in Lebanon | Facebook & Instagram Campaigns, Not Boosting | Appify",
         meta_description="Appify runs Facebook and Instagram ad campaigns in Meta Ads Manager for Lebanese businesses: the right objective, targeting, retargeting and creatives that stop the scroll.",
         intro="Boosting a post is not an ad strategy. We build and run campaigns in Meta Ads Manager, pairing the right objective and audience with motion creatives made to stop the scroll.",
         points=[dict(title="The right objective", text="Messages, leads, sales or traffic, chosen for what you need."),
                 dict(title="Targeting and retargeting", text="Reach new people and bring back the ones who already looked."),
                 dict(title="Creative testing", text="Several ad versions, so the budget goes to what works."),
                 dict(title="Motion creatives", text="Ads made by the same team as our motion graphics.")]),
]

lines = ["-- Generated by scripts/seed.py. Starting content; the admin panel (stage 2) edits it in place.", "DELETE FROM settings; DELETE FROM projects; DELETE FROM motion; DELETE FROM faqs; DELETE FROM services;"]
for k, v in SETTINGS.items():
    lines.append(f"INSERT INTO settings (key, value) VALUES ({q(k)}, {q(v)});")
cols = ["slug", "kind", "title", "client", "category", "status", "summary", "description", "features", "stack", "live_url", "video", "poster", "aspect", "seo_title", "seo_description", "featured", "sort"]
for i, p in enumerate(PROJECTS):
    p = {**p, "sort": i + 1}
    lines.append(f"INSERT INTO projects ({', '.join(cols)}) VALUES ({', '.join(q(p.get(c)) for c in cols)});")
mcols = ["slug", "title", "client", "kind", "summary", "video", "poster", "aspect", "duration", "upload_date", "sort"]
for i, m in enumerate(MOTION):
    m = {"client": "Appify", "aspect": "9/16", **m, "video": f"/media/{m['slug']}.mp4", "poster": f"/media/{m['slug']}.webp", "duration": dur(m["slug"]), "upload_date": "2026-10-14", "sort": i + 1}
    lines.append(f"INSERT INTO motion ({', '.join(mcols)}) VALUES ({', '.join(q(m.get(c)) for c in mcols)});")
for i, (topic, qq, a) in enumerate(FAQS):
    lines.append(f"INSERT INTO faqs (topic, question, answer, sort) VALUES ({q(topic)}, {q(qq)}, {q(a)}, {i + 1});")
scols = ["slug", "name", "h1", "meta_title", "meta_description", "intro", "points", "related", "faq_topic", "sort"]
for s in SERVICES:
    lines.append(f"INSERT INTO services ({', '.join(scols)}) VALUES ({', '.join(q(s.get(c)) for c in scols)});")
open("migrations/0002_seed.sql", "w").write("\n".join(lines) + "\n")
print("migrations/0002_seed.sql", len(lines), "statements")
