// Record the live Follies homepage as a frame-accurate desktop scroll (1440x900): one screenshot per reel frame.
// headless_shell can't decode H.264, so the hero <video> shows the film's own frames through its poster.
import { routedBrowser } from "./routed.mjs";
import fs from "node:fs";
const S = process.argv[2], OUT = process.argv[3], N = Number(process.argv[4] || 360);
fs.mkdirSync(OUT, { recursive: true });
const { b, ctx } = await routedBrowser({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.route("https://folliesdapresmidi.com/__film/*", (r) => r.fulfill({ path: `${S}/filmframes/${r.request().url().split("/").pop()}`, contentType: "image/jpeg" }));
await page.goto("https://folliesdapresmidi.com/", { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
await page.waitForTimeout(2500);
const H = await page.evaluate(() => document.documentElement.scrollHeight), MAX = H - 900;
// load every lazy image, then back to the top
for (let y = 0; y <= H; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(150); }
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(2500);
const secs = await page.evaluate(() => Object.fromEntries(["maison", "boutique", "accessories", "lookbook", "popups"].map((id) => [id, Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY)])));
const cdp = await ctx.newCDPSession(page);
await cdp.send("Animation.enable"); await cdp.send("Animation.setPlaybackRate", { playbackRate: 0.2 });
// hold the hero ~1.2 s, then one continuous scroll to the footer, soft at both ends
const HOLD = 36, STOP = N - 18;
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u) * 0.35 + u * 0.65);
const ys = [];
for (let i = 0; i < N; i++) {
  const y = Math.round(MAX * ease((i - HOLD) / (STOP - HOLD)));
  ys.push(y);
  await page.evaluate(([y, k]) => {
    window.scrollTo(0, y);
    const v = document.querySelector("video"); if (v) v.poster = `/__film/${String(k).padStart(4, "0")}.jpg`;
  }, [y, (i % 347) + 1]);
  await page.waitForTimeout(40);
  await page.screenshot({ path: `${OUT}/${String(i + 1).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 });
}
fs.writeFileSync(`${OUT}/scroll.json`, JSON.stringify({ H, secs, ys }));
console.log("H", H, JSON.stringify(secs), "frames", N);
await b.close();
