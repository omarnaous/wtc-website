// node render.mjs                 -> every composition to out/<id>.mp4
// node render.mjs A,B             -> only those compositions
// node render.mjs A 0,40,84       -> PNG stills of those frames (out/<id>-f<frame>.png)
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const candidates = [process.env.CHROME, "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"];
const found = candidates.find((p) => p && fs.existsSync(p));
const browserExecutable = found || undefined; // undefined -> Remotion downloads its own headless shell

fs.mkdirSync("out", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.js") });
const all = (await getCompositions(serveUrl, { browserExecutable })).map((c) => c.id);
const ids = process.argv[2] ? process.argv[2].split(",") : all;
const stills = process.argv[3];

for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  if (stills) {
    for (const frame of stills.split(",").map(Number)) {
      await renderStill({ composition, serveUrl, frame, output: `out/${id}-f${frame}.png`, browserExecutable });
    }
    console.log(`${id}: stills ${stills}`);
    continue;
  }
  await renderMedia({
    composition, serveUrl, codec: "h264", crf: 16, pixelFormat: "yuv420p",
    audioCodec: "aac", audioBitrate: "320k", outputLocation: `out/${id}.mp4`, browserExecutable,
    onProgress: ({ progress }) => process.stdout.write(`\r${id} ${(progress * 100).toFixed(0)}%   `),
  });
  console.log(`\n${id}: out/${id}.mp4`);
}
