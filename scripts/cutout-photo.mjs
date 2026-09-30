import sharp from "sharp";

/**
 * Lifts a watch off a textured background.
 *
 * Nothing like the studio packshots the strap pipeline handles — that one
 * floods in from a flat grey and is exact. Here the background is wicker shot
 * through glass: textured, unevenly lit, with reflections. What separates it
 * is not a colour but a pair of properties. The wicker is dark and grey
 * (lightness under 40%, saturation under 10%); the watch is either bright
 * (white strap 83%, dial 92%) or strongly coloured (the red case, 82%).
 */
const SUBJECT_L = 56;   // bright enough to be strap or dial
const SUBJECT_S = 36;   // saturated enough to be the case
const MIN_L = 22;       // a saturated shadow is still shadow

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const s = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
  return [s * 100, l * 100];
}

/** Largest 4-connected run of subject pixels; everything else is background. */
function keepLargest(mask, W, H) {
  const seen = new Int32Array(W * H).fill(-1);
  const stack = new Int32Array(W * H);
  let best = -1, bestSize = 0, label = 0;
  for (let start = 0; start < W * H; start++) {
    if (!mask[start] || seen[start] >= 0) continue;
    let sp = 0, size = 0;
    stack[sp++] = start; seen[start] = label;
    while (sp) {
      const i = stack[--sp]; size++;
      const x = i % W, y = (i / W) | 0;
      const push = (j) => { if (j >= 0 && j < W * H && mask[j] && seen[j] < 0) { seen[j] = label; stack[sp++] = j; } };
      if (x > 0) push(i - 1);
      if (x < W - 1) push(i + 1);
      if (y > 0) push(i - W);
      if (y < H - 1) push(i + W);
    }
    if (size > bestSize) { bestSize = size; best = label; }
    label++;
  }
  for (let i = 0; i < W * H; i++) if (seen[i] !== best) mask[i] = 0;
  return bestSize;
}

/** Anything enclosed by the subject is subject — dial markings, the crown gap. */
function fillHoles(mask, W, H) {
  const out = new Uint8Array(W * H);
  const stack = new Int32Array(W * H);
  let sp = 0;
  const push = (i) => { if (i >= 0 && i < W * H && !mask[i] && !out[i]) { out[i] = 1; stack[sp++] = i; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (sp) {
    const i = stack[--sp], x = i % W, y = (i / W) | 0;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (y > 0) push(i - W);
    if (y < H - 1) push(i + W);
  }
  for (let i = 0; i < W * H; i++) if (!out[i]) mask[i] = 1;
}

/** Morphological open then close, to drop speckle and bridge the weave. */
function morph(mask, W, H, r, grow) {
  const src = Uint8Array.from(mask);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let hit = grow ? 0 : 1;
    for (let dy = -r; dy <= r && (grow ? !hit : hit); dy++) {
      const ny = y + dy; if (ny < 0 || ny >= H) continue;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx; if (nx < 0 || nx >= W) continue;
        const v = src[ny * W + nx];
        if (grow && v) { hit = 1; break; }
        if (!grow && !v) { hit = 0; break; }
      }
    }
    mask[y * W + x] = hit;
  }
}

export async function cutWatch(input, output, { size = 1080, pad = 0.04 } = {}) {
  const { data, info } = await sharp(input).rotate().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  const mask = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const o = i * C;
    const [s, l] = hsl(data[o], data[o + 1], data[o + 2]);
    mask[i] = l >= MIN_L && (l >= SUBJECT_L || s >= SUBJECT_S) ? 1 : 0;
  }

  // Holes first, then open — the order matters more than the radii.
  //
  // The strap is printed with dark lettering, and every letter is a hole in a
  // brightness mask. Eroding first widened each of them until the strap came
  // apart down the middle. Closing them first leaves a solid band that an
  // erode can safely trim.
  keepLargest(mask, W, H);
  fillHoles(mask, W, H);
  // The wicker catches light along its weave, and those lit ridges read as
  // bright: they arrived as thin spikes off the strap's edge. Nothing that
  // thin survives a 4px erode, and the matching dilate restores the width.
  morph(mask, W, H, 4, false);
  morph(mask, W, H, 4, true);
  keepLargest(mask, W, H);
  fillHoles(mask, W, H);

  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (mask[y * W + x]) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 <= x0 || y1 <= y0) throw new Error("no subject found");

  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = data[i * C];
    rgba[i * 4 + 1] = data[i * C + 1];
    rgba[i * 4 + 2] = data[i * C + 2];
    rgba[i * 4 + 3] = mask[i] ? 255 : 0;
  }

  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

  const side = Math.round(Math.max(cw, ch) * (1 + pad * 2));
  const cut = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: x0, top: y0, width: cw, height: ch })
    // Explicit PNG: a raw-in pipeline returns raw pixels, which composite
    // cannot read back without being told their shape again.
    .png()
    .toBuffer();

  // Two passes on purpose. Sharp runs resize before composite whatever order
  // they are chained in, so squaring and shrinking in one call would shrink the
  // canvas first and then refuse the full-size cut-out as too big for it.
  const squared = await sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: cut, left: Math.round((side - cw) / 2), top: Math.round((side - ch) / 2) }])
    .png()
    .toBuffer();

  await sharp(squared).resize(size, size).png({ compressionLevel: 9 }).toFile(output);

  return { W, H, subject: [cw, ch], coverage: +(100 * mask.reduce((n, v) => n + v, 0) / (W * H)).toFixed(1) };
}

const jobs = [
  ["/tmp/mars-full.jpg", "/tmp/out-full.png"],
  ["/tmp/mars-dial.jpg", "/tmp/out-dial.png"],
  ["/tmp/mars-back.jpg", "/tmp/out-back.png"],
];
for (const [i, o] of jobs) {
  try { console.log("  " + o.split("/").pop(), JSON.stringify(await cutWatch(i, o))); }
  catch (e) { console.log("  " + o.split("/").pop(), "FAILED:", e.message); }
}
