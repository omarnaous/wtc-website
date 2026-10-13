// Records the firnlight site (run its dev server on :5173 first; needs playwright-core)  as an image sequence: N evenly spaced scroll positions, each settled before capture.
import { chromium } from "playwright-core";
import fs from "node:fs";
const [, , name, outDir, N] = process.argv;
const exe = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const cfg = { m: { vp: { width: 432, height: 768 }, dpr: 2.5, mobile: true }, d: { vp: { width: 1440, height: 900 }, dpr: 1, mobile: false } }[name];
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch({ executablePath: exe, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: cfg.vp, deviceScaleFactor: cfg.dpr, reducedMotion: "reduce", isMobile: cfg.mobile, hasTouch: cfg.mobile });
const p = await ctx.newPage();
await p.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await p.waitForTimeout(9000);   // let the 466-frame sequence finish decoding
const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const n = Number(N);
for (let i = 0; i < n; i++) {
  await p.evaluate((y) => new Promise((r) => { window.scrollTo(0, y); requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 30))); }), Math.round((H * i) / (n - 1)));
  await p.screenshot({ path: `${outDir}/${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 });
}
console.log(name, "done", n, "frames, scroll range", H);
await b.close();
