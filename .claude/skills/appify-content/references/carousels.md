# Carousels

Instagram carousel: **1080×1350 (4:5)**, up to 20 slides. Either photos (JPG q95) or motion (each slide a seamless
6 s MP4 loop whose frame 0 is a finished still, with a silent AAC track). Deliver numbered files in order.

## The system that worked (`assets/examples/carousel-store360.jsx`)
- One shared wide canvas: every slide draws the same ink background, the 60 px iris grid offset by −1080 × slide,
  and a glowing UV **thread** (polyline across the whole carousel width) with a yellow node on every slide edge, so
  swiping feels continuous.
- Chrome on every slide: Appify wordmark top-left, `0X / 0N` top-right (Geist Mono), "Swipe →" bottom-right
  (not on the last slide).
- Slide header: eyebrow (spark + mono label, e.g. "01 · Premium template"), then a 2-line Sora title with the
  second line in iris/yellow/pink.
- Visual cards: browser windows, phones (ink bezel + island), dashboards, receipts with a "PAID ONCE" stamp,
  chat bubbles, calendars, step chains. Fill sample UI with plausible content and label it "Sample screens".
- Motion: everything periodic in the 6 s loop (conveyors move a whole content period per loop, stamps lift and
  slam back, globes rotate by a symmetric step). Check seamlessness: diff(last→first) ≈ diff between neighbours.

## Structures that converted
**Offer carousel ($360 store, 8 slides)**: hook with the price ("Your brand's online store. $360. Once.") →
the monthly trap (other platforms bill every month vs one receipt) → 01 template → 02 admin panel → 03 hosting →
04 pay once (receipt) → 05 delivered in under 7 days → book a call / DM.

**Pain-first carousel (inventory system, 9 slides)**: "Your stock lives in a notebook." → one order, four places
to check → you sold it twice → every Friday you count again → the fix → it runs by itself (automation chain) →
one screen (dashboard) → price receipt (from $500, pay once) → DM "SYSTEM".

**High-conversion version (mobile apps, 7 slides)**, the tightest one:
1. Hook = outcome + price: "From your Notes to the App Store" + "From $999 · iPhone + Android"
2. Proof early: "We build apps that go live" (Darebni AI, live on the App Store, real screens)
3. The offer stack: "Everything to launch. One price." (each inclusion + its benefit)
4–6. Numbered process: Step 1 design → Step 2 build & publish → Step 3 launch
7. CTA with what happens next: 1 DM "APP" (your idea in one line) → 2 we book a call → 3 your exact price.

Rules: one message per slide, fewer slides beats more, price in the hook filters buyers, proof by slide 2, the CTA
says what happens after the DM. Ideas still unused: "$360 vs paying every month" cost chart (needs verified
competitor prices), "Your store in 5 steps", "Instagram shop vs a real website", "Which plan fits you?".

## Caption pattern
Hook line → ✅ checklist of real inclusions → one proof line → DM keyword CTA (+ "we'll book a call") → 5–7
hashtags (#lebanon #smallbusinesslebanon #ecommerce #appdevelopment #webdesign #appify …).
