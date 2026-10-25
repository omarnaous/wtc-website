// rasterize logo SVGs to PNG (transparent where the SVG has no background): node svg2png.mjs <svg dir> <png dir>
import { chromium } from "playwright-core";
import fs from "node:fs";
const [src, dst] = process.argv.slice(2); fs.mkdirSync(dst, { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell" });
const p = await b.newPage();
const sizes = { logo: 2400, symbol: 1024, "app-icon": 1024 };
for (const f of fs.readdirSync(src).filter((x) => x.endsWith(".svg"))) {
  const svg = fs.readFileSync(`${src}/${f}`, "utf8"), [, , , w, h] = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/).map(Number);
  const W = sizes[Object.keys(sizes).find((k) => f.includes(k))], H = Math.round((W * h) / w);
  await p.setViewportSize({ width: W, height: H });
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${W}" height="${H}" `)}</body></html>`);
  await p.screenshot({ path: `${dst}/${f.replace(".svg", ".png")}`, omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
}
await b.close(); console.log("done");
