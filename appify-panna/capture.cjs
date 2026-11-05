// Record pannaking.com/en as a frame-accurate desktop scroll (1440x900), one JPEG per reel frame, with the site's own
// scroll-reveal animations (lazy images warmed in a first pass, then a reload so the one-shot reveals are unplayed;
// CSS/Web animations at real browser speed (RATE=1, so each reveal finishes while its section is on screen)). Writes public/rec/NNNN.jpg + scroll.json (y per frame,
// section tops by heading). node capture.cjs [frames=420]   (HOLD=60 frames on the hero first)
const { chromium } = require("playwright");
const fs = require("fs");
const N = Number(process.argv[2] || 420), HOLD = Number(process.env.HOLD || 60), STOP = N - 15, OUT = "public/rec";
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const load = async () => { await page.goto("https://www.pannaking.com/en", { waitUntil: "networkidle", timeout: 90000 }).catch(() => {}); await page.waitForTimeout(2500); };
  await load();
  let H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(140); }
  await load();
  H = await page.evaluate(() => document.documentElement.scrollHeight);
  const MAX = H - 900;
  const secs = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll("h1,h2")].map((h) => [h.innerText.trim().slice(0, 40), Math.round(h.getBoundingClientRect().top + scrollY)])));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Animation.enable");
  const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u) * 0.35 + u * 0.65);
  const ys = []; const t0 = Date.now(); let rate = Number(process.env.RATE || 1);
  await cdp.send("Animation.setPlaybackRate", { playbackRate: rate });
  for (let i = 0; i < N; i++) {
    const y = Math.round(MAX * ease((i - HOLD) / (STOP - HOLD)));
    ys.push(y);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(30);
    await page.screenshot({ path: `${OUT}/${String(i + 1).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 });
    if (i === 20) console.log("ms/frame", ((Date.now() - t0) / 21).toFixed(0), "rate", rate);
  }
  fs.writeFileSync(`${OUT}/scroll.json`, JSON.stringify({ H, secs, ys, hold: HOLD }));
  console.log("H", H, JSON.stringify(secs), "frames", N);
  await b.close();
})();
