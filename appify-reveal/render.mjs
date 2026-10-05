import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const browserExecutable = process.env.CHROME || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const ids = process.argv[2] ? process.argv[2].split(",") : ["RevealFeed", "RevealReel"];
const stills = process.argv[3]; // e.g. "30,84,90,115,200" to render frames only

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.js") });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  if (stills) {
    for (const frame of stills.split(",").map(Number)) {
      await renderStill({ composition, serveUrl, frame, output: `out/${id}-f${frame}.png`, browserExecutable });
    }
    continue;
  }
  await renderMedia({
    composition, serveUrl, codec: "h264", crf: 16, pixelFormat: "yuv420p", audioCodec: "aac", audioBitrate: "320k",
    outputLocation: `out/appify-reveal-${id === "RevealFeed" ? "feed-4x5" : "reel-9x16"}.mp4`, browserExecutable,
    onProgress: ({ progress }) => process.stdout.write(`\r${id} ${(progress * 100).toFixed(0)}%   `),
  });
  console.log();
}
