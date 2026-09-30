#!/usr/bin/env node
/**
 * Lists everything in public/ that an image field could point at, so the
 * dashboard's image picker has something to browse.
 *
 * Workers have no filesystem, so the list cannot be built at request time —
 * it is baked here and imported like any other data file. Re-run with
 * `npm run images` after adding photography.
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "src/data/images.json");

const EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif"]);

/** Chips are thumbnails of the photographs above them — not pickable on their own. */
const SKIP = new Set(["chips"]);

const GROUPS = [
  { dir: "products/watches", label: "Watch photography" },
  { dir: "products/strap-photos", label: "Strap photography" },
  { dir: "brand", label: "Brand" },
  { dir: "instagram", label: "Instagram" },
  { dir: "hero", label: "Hero frames" },
];

async function walk(dir, base = dir) {
  let out = [];
  let entries;
  try {
    entries = await readdir(path.join(PUBLIC, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP.has(entry.name)) continue;
      out = out.concat(await walk(rel, base));
    } else if (EXT.has(path.extname(entry.name).toLowerCase())) {
      const info = await stat(path.join(PUBLIC, rel));
      out.push({ path: "/" + rel.split(path.sep).join("/"), size: info.size });
    }
  }
  return out;
}

const groups = [];
for (const g of GROUPS) {
  const files = await walk(g.dir);
  if (files.length) {
    files.sort((a, b) => a.path.localeCompare(b.path));
    groups.push({ label: g.label, dir: g.dir, files });
  }
}

const total = groups.reduce((n, g) => n + g.files.length, 0);
await writeFile(OUT, JSON.stringify({ groups, total }, null, 2) + "\n");
console.log(`Wrote ${total} images across ${groups.length} groups to src/data/images.json`);
