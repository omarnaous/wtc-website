#!/usr/bin/env node
/**
 * Syncs the catalogue photography between media/ and the wtc-media R2 bucket.
 *
 * None of it is in the repository. R2 is where it lives and where the Worker
 * serves it from (src/middleware.ts → /api/media); media/ is the local working
 * copy the image scripts read and write.
 *
 *   npm run media:push              media/ → local R2 (what `npm run dev` reads)
 *   npm run media:push -- --remote  media/ → the live bucket
 *   npm run media:pull -- --remote  the live bucket → media/ (a fresh clone)
 *
 * The key of every object is its path under media/, which is also the URL the
 * site asks for: media/products/watches/X.png is served at /products/watches/X.png.
 *
 * src/data/media-index.json records what was pushed (key, size, hash). Push
 * skips anything whose hash has not changed since; pull fetches what it lists.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "media");
const INDEX = path.join(ROOT, "src/data/media-index.json");
const BUCKET = "wtc-media";

const TYPES = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

const [command = "push", ...flags] = process.argv.slice(2);
const remote = flags.includes("--remote");
const force = flags.includes("--force");
const where = remote ? "--remote" : "--local";

function wrangler(args) {
  const r = spawnSync("npx", ["wrangler", ...args], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (TYPES[path.extname(e.name).toLowerCase()]) out.push(full);
  }
  return out;
}

const readIndex = async () => {
  try {
    return JSON.parse(await readFile(INDEX, "utf8"));
  } catch {
    return { bucket: BUCKET, objects: {} };
  }
};

async function push() {
  const index = await readIndex();
  // The index describes the live bucket. A local push starts from nothing,
  // since the local bucket is wiped whenever .wrangler/ is.
  const known = remote && !force ? index.objects : {};
  const byType = {};
  const next = {};
  let skipped = 0;

  for (const file of await walk(DIR)) {
    const key = path.relative(DIR, file).split(path.sep).join("/");
    const buf = await readFile(file);
    const hash = createHash("sha1").update(buf).digest("hex");
    next[key] = { size: buf.length, sha1: hash };
    if (known[key]?.sha1 === hash) {
      skipped++;
      continue;
    }
    const type = TYPES[path.extname(file).toLowerCase()];
    (byType[type] ??= []).push({ key, file });
  }

  const work = await mkdir(path.join(tmpdir(), "wtc-media"), { recursive: true }).then(() =>
    path.join(tmpdir(), "wtc-media"),
  );
  for (const [type, entries] of Object.entries(byType)) {
    const list = path.join(work, `${type.replace(/\W/g, "-")}.json`);
    await writeFile(list, JSON.stringify(entries));
    console.log(`\n${entries.length} × ${type} → ${BUCKET} (${remote ? "live" : "local"})`);
    wrangler(["r2", "bulk", "put", BUCKET, "--filename", list, "--content-type", type, where]);
  }

  const uploaded = Object.values(byType).reduce((n, e) => n + e.length, 0);
  console.log(`\n${uploaded} uploaded, ${skipped} unchanged.`);
  if (remote) {
    await writeFile(INDEX, JSON.stringify({ bucket: BUCKET, objects: next }, null, 2) + "\n");
    console.log(`Recorded ${Object.keys(next).length} objects in src/data/media-index.json.`);
  }
}

async function pull() {
  const { objects } = await readIndex();
  const keys = Object.keys(objects);
  if (!keys.length) {
    console.log("src/data/media-index.json lists nothing — push first.");
    return;
  }
  for (const [i, key] of keys.entries()) {
    const file = path.join(DIR, key);
    await mkdir(path.dirname(file), { recursive: true });
    if ((i + 1) % 50 === 0) console.log(`${i + 1} / ${keys.length}`);
    wrangler(["r2", "object", "get", `${BUCKET}/${key}`, "--file", file, where]);
  }
  console.log(`${keys.length} objects in media/.`);
}

if (command === "push") await push();
else if (command === "pull") await pull();
else {
  console.error(`Unknown command "${command}". Use push or pull.`);
  process.exit(1);
}
