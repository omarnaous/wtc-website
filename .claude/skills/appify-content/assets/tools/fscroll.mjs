// Record the live Follies homepage as a frame-accurate desktop scroll (1440x900), one screenshot per reel frame,
// with the site's own scroll-reveal animations playing as each section enters.
// - headless_shell can't decode H.264, so the store's hero film (/media/brand/...mp4) is served as a VP8 copy and
//   canPlayType is told yes (otherwise the site falls back to its old /film/hero-*.mp4).
// - the film is paused and seeked to the reel frame's time; CSS transitions are slowed to match the capture speed.
// - lazy images are warmed in a first pass, then the page is reloaded so every one-shot reveal is still unplayed.
import { routedBrowser } from "./routed.mjs";
import fs from "node:fs";
const [WEBM, OUT] = [process.argv[2], process.argv[3]], N = Number(process.argv[4] || 360);
const HOLD = Number(process.env.HOLD || 75), STOP = N - 18;
fs.mkdirSync(OUT, { recursive: true });
const { b, ctx } = await routedBrowser({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.addInitScript(() => {
  const cpt = HTMLMediaElement.prototype.canPlayType;
  HTMLMediaElement.prototype.canPlayType = function (t) { return /mp4|avc1/.test(t) ? "probably" : cpt.call(this, t); };
  HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };   // we drive the film's time
});
const film = fs.readFileSync(WEBM);
// serve the film with byte ranges, or the element can't seek
const serveFilm = (film) => (r) => {
  const m = /bytes=(\d*)-(\d*)/.exec(r.request().headers()["range"] || "");
  if (!m) return r.fulfill({ status: 200, body: film, contentType: "video/webm", headers: { "accept-ranges": "bytes" } });
  const a = m[1] ? +m[1] : 0, e = m[2] ? Math.min(+m[2], film.length - 1) : film.length - 1;
  return r.fulfill({ status: 206, body: film.subarray(a, e + 1), contentType: "video/webm", headers: { "accept-ranges": "bytes", "content-range": `bytes ${a}-${e}/${film.length}` } });
};
await page.route("**/media/brand/**/*.mp4", serveFilm(film));
const load = async () => { await page.goto("https://folliesdapresmidi.com/", { waitUntil: "networkidle", timeout: 90000 }).catch(() => {}); await page.waitForTimeout(2500); };
await load();
const H = await page.evaluate(() => document.documentElement.scrollHeight), MAX = H - 900;
for (let y = 0; y <= H; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(150); }
await load();
console.log("video", JSON.stringify(await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => [v.currentSrc.slice(-40), v.className, v.readyState, v.duration]))));
const secs = await page.evaluate(() => Object.fromEntries(["maison", "boutique", "accessories", "lookbook", "popups"].map((id) => [id, Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY)])));
const cdp = await ctx.newCDPSession(page);
await cdp.send("Animation.enable");
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u) * 0.35 + u * 0.65);
const ys = []; let t0 = Date.now(), rate = 0.2;
await cdp.send("Animation.setPlaybackRate", { playbackRate: rate });
for (let i = 0; i < N; i++) {
  const y = Math.round(MAX * ease((i - HOLD) / (STOP - HOLD)));
  ys.push(y);
  await page.evaluate(async ([y, t]) => {
    window.scrollTo(0, y);
    const vs = [...document.querySelectorAll("video")].filter((v) => v.getBoundingClientRect().bottom > 0 && v.readyState > 0);
    await Promise.all(vs.map((v) => new Promise((res) => { v.pause(); if (Math.abs(v.currentTime - t) < 0.001) return res(); const k = setTimeout(res, 1500); v.addEventListener("seeked", () => { clearTimeout(k); res(); }, { once: true }); v.currentTime = t; })));
  }, [y, Math.min(13.9, i / 30)]);
  await page.waitForTimeout(30);
  await page.screenshot({ path: `${OUT}/${String(i + 1).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 });
  if (i === 20) { rate = Math.min(1, 33.3 / ((Date.now() - t0) / 21)); await cdp.send("Animation.setPlaybackRate", { playbackRate: rate }); console.log("ms/frame", ((Date.now() - t0) / 21).toFixed(0), "rate", rate.toFixed(3)); }
}
fs.writeFileSync(`${OUT}/scroll.json`, JSON.stringify({ H, secs, ys, hold: HOLD }));
console.log("H", H, JSON.stringify(secs), "frames", N);
await b.close();
