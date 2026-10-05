import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const services = ["UI/UX", "Websites", "Mobile apps", "Motion graphics"];
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.js") });
for (const id of ["RevealFeed", "RevealReel"]) for (const style of ["line", "pills"]) {
  const inputProps = { url: "www.appify-lb.com", slogan: "Ideas, appified.", services, servicesStyle: style };
  const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable });
  await renderStill({ composition, serveUrl, frame: 239, inputProps, output: `out/opt-${id}-${style}.png`, browserExecutable });
}
