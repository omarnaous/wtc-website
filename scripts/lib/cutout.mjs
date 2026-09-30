/**
 * Turns the flat studio background of a Wristbuddys packshot transparent.
 *
 * The shots sit on a perfectly uniform #f5f5f5 with no drop shadow, so a flood
 * fill from the frame edges is exact where a global colour key would eat the
 * white-dialled watches.
 *
 * The hard part is that the strap runs off the top and bottom of frame, and a
 * white strap is within ~3 RGB units of the background — so a fill seeded from
 * those edges pours straight down the strap and erases it.
 *
 * What separates them is not colour but **texture**: the studio paper is
 * mathematically flat, while even a white strap has weave and stitching. So
 * the fill is refused on any pixel that carries texture, and colour alone is
 * never enough to protect or remove anything.
 *
 * An earlier version walled off the strap's whole column between the rows the
 * subject occupied. That protected the strap, but it also protected every
 * background pixel *beside* it inside that rectangle — which is where the
 * leftover white came from. Texture has no such blind spot: it follows the
 * strap's actual silhouette.
 */

/** Band the strap occupies, as a fraction of width. Used for chip placement. */
export const STRAP_COLUMN = [0.32, 0.63];

const TOLERANCE = 12;
const FEATHER = [6, 34];
const FLAT = 0.9;   // luminance std below this is flat studio paper
const RUN = 6;      // consecutive textured rows needed to call it subject
/**
 * How far the protected area grows around each textured pixel. A weave has
 * flat spots between threads; without this the fill seeps through them and
 * speckles the strap.
 */
const GROW = 2;
/**
 * Texture threshold for the per-pixel gate inside the strap column.
 *
 * Much higher than FLAT, which reads averaged sample columns. These are JPEGs
 * off a CDN, so the "flat" paper still carries compression noise; at FLAT the
 * noise reads as weave, the dilation merges it into walls, and the fill cannot
 * cross the background at all.
 */
const WEAVE = 2.4;

const lum = (rgba, i) =>
  0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];

function localStd(rgba, W, H, cx, cy, r = 3) {
  let n = 0, sum = 0, sum2 = 0;
  for (let y = cy - r; y <= cy + r; y++) {
    if (y < 0 || y >= H) continue;
    for (let x = cx - r; x <= cx + r; x++) {
      if (x < 0 || x >= W) continue;
      const v = lum(rgba, y * W + x);
      sum += v; sum2 += v * v; n++;
    }
  }
  const mean = sum / n;
  return Math.sqrt(Math.max(0, sum2 / n - mean * mean));
}

/**
 * Rows the subject occupies inside the strap column, and the widest row (the
 * case), measured with texture so white-on-white still registers.
 */
export function analyse(rgba, W, H) {
  const bg = [rgba[0], rgba[1], rgba[2]];
  const colourAway = (i) => {
    const o = i * 4;
    return Math.hypot(rgba[o] - bg[0], rgba[o + 1] - bg[1], rgba[o + 2] - bg[2]);
  };

  const cols = [0.36, 0.42, 0.47, 0.53, 0.59].map((f) => Math.round(f * W));
  const textured = new Uint8Array(H);
  for (let y = 0; y < H; y++) {
    for (const x of cols) {
      if (colourAway(y * W + x) > 10 || localStd(rgba, W, H, x, y) > FLAT) {
        textured[y] = 1;
        break;
      }
    }
  }

  const firstRun = (from, to, step) => {
    let run = 0;
    for (let y = from; step > 0 ? y < to : y > to; y += step) {
      run = textured[y] ? run + 1 : 0;
      if (run >= RUN) return y - step * (RUN - 1);
    }
    return step > 0 ? to : from;
  };

  const top = firstRun(0, H, 1);
  const bottom = firstRun(H - 1, -1, -1);

  // The case is the widest part; find where it ends so swatches can avoid it.
  let caseBottom = Math.round(H * 0.5);
  for (let y = bottom; y > top; y--) {
    let wide = 0;
    for (let x = 0; x < W; x += 4) {
      if (colourAway(y * W + x) > 10 || localStd(rgba, W, H, x, y, 2) > FLAT) wide++;
    }
    if (wide / (W / 4) > 0.55) { caseBottom = y; break; }
  }

  return { subjectTop: top, subjectBottom: bottom, caseBottom };
}

export function cutout(rgba, width, height, { tolerance = TOLERANCE, geometry } = {}) {
  const n = width * height;
  const bg = [rgba[0], rgba[1], rgba[2]];
  const outside = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;

  const g = geometry ?? analyse(rgba, width, height);

  const delta = (i) => {
    const o = i * 4;
    const dr = rgba[o] - bg[0];
    const dg = rgba[o + 1] - bg[1];
    const db = rgba[o + 2] - bg[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // ── What holds the strap back ───────────────────────────────────────────
  // Colour alone protects the watch and every coloured strap. The one place it
  // cannot is the strap's own column, where a white strap and the paper are a
  // few RGB units apart — there, weave decides.
  //
  // The gate is confined to that column on purpose. Applied frame-wide it also
  // catches JPEG noise in the paper, and once dilated that noise becomes a wall
  // the fill cannot cross.
  const left = Math.round(STRAP_COLUMN[0] * width);
  const right = Math.round(STRAP_COLUMN[1] * width);
  const bandTop = Math.max(0, g.subjectTop - 2);
  const bandBottom = Math.min(height - 1, g.subjectBottom + 2);

  const woven = new Uint8Array(n);
  for (let y = bandTop; y <= bandBottom; y++) {
    for (let x = left; x <= right; x++) {
      if (localStd(rgba, width, height, x, y, 2) > WEAVE) {
        // Grown so the flat gaps between threads are covered too.
        for (let dy = -GROW; dy <= GROW; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -GROW; dx <= GROW; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            woven[ny * width + nx] = 1;
          }
        }
      }
    }
  }

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (outside[i] || delta(i) > tolerance || woven[i]) return;
    outside[i] = 1;
    stack[sp++] = i;
  };

  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }

  while (sp > 0) {
    const i = stack[--sp];
    const x = i % width;
    const y = (i - x) / width;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  fillHoles(outside, width, height);
  const band = repairBand(outside, width, height, g);

  // Only the ring touching the removed area is feathered — applying the ramp
  // everywhere would punch holes through white dials.
  const near = new Uint8Array(n);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (outside[i]) continue;
      let hit = 0;
      for (let dy = -2; dy <= 2 && !hit; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (outside[ny * width + nx]) { hit = 1; break; }
        }
      }
      near[i] = hit;
    }
  }

  for (let i = 0; i < n; i++) {
    if (outside[i]) { rgba[i * 4 + 3] = 0; continue; }
    const y = (i / width) | 0;
    // A repaired row's edge is a straightened line, not a colour boundary, so
    // the colour ramp has nothing to read there — on a white strap it would
    // measure "this is the same as the paper" and rub the edge back out. One
    // half-lit pixel does the anti-aliasing instead.
    if (band.rows[y]) {
      const x = i - y * width;
      rgba[i * 4 + 3] = x === band.left[y] || x === band.right[y] ? 150 : 255;
      continue;
    }
    if (band.filled[i]) { rgba[i * 4 + 3] = 255; continue; }
    if (!near[i]) { rgba[i * 4 + 3] = 255; continue; }
    const a = ((delta(i) - FEATHER[0]) / (FEATHER[1] - FEATHER[0])) * 255;
    rgba[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(a)));
  }

  defringe(rgba, width, height);
  return g;
}

/**
 * Takes the white out of the edge.
 *
 * A pixel on the strap's boundary is a blend of strap and studio paper. Giving
 * it partial alpha makes the shape right, but its colour is still half paper —
 * so against the site's near-black surface the strap wears a pale halo. That
 * halo is what reads as "there is still white on it".
 *
 * The fix is to keep the alpha and throw the colour away: every partly
 * transparent pixel takes the colour of the nearest fully opaque one. The
 * silhouette stays soft; the white goes.
 */
function defringe(rgba, width, height, radius = 3) {
  const n = width * height;
  const src = new Uint8ClampedArray(rgba.length);
  src.set(rgba);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const a = src[i * 4 + 3];
      if (a === 0 || a === 255) continue;

      let best = -1;
      let bestDist = Infinity;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const j = ny * width + nx;
          if (src[j * 4 + 3] !== 255) continue;
          const d = dx * dx + dy * dy;
          if (d < bestDist) { bestDist = d; best = j; }
        }
      }
      if (best < 0) continue;

      rgba[i * 4] = src[best * 4];
      rgba[i * 4 + 1] = src[best * 4 + 1];
      rgba[i * 4 + 2] = src[best * 4 + 2];
    }
  }
  void n;
}


/**
 * Closes anything the fill hollowed out but did not reach from outside.
 *
 * Beside each lug the strap runs into the case, and the fill can squeeze
 * through that junction and eat a pocket out of the strap without ever getting
 * back out. The pocket is transparent but it is not background: nothing
 * outside the watch connects to it. A second fill, this time over the removed
 * area itself, marks everything that really does reach the frame edge; what it
 * cannot reach is a hole in the subject and is given back.
 *
 * Unlike the silhouette repair below this needs no notion of where the strap
 * is, so it works on the case rows too — which is exactly where the pockets
 * are.
 */
function fillHoles(outside, W, H) {
  const n = W * H;
  const reached = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    if (reached[i] || !outside[i]) return;
    reached[i] = 1;
    stack[sp++] = i;
  };

  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }

  while (sp > 0) {
    const i = stack[--sp];
    const x = i % W;
    const y = (i - x) / W;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  for (let i = 0; i < n; i++) if (outside[i] && !reached[i]) outside[i] = 0;
}

/**
 * Straightens the strap's silhouette.
 *
 * The texture gate keeps the fill out of a strap's weave, but a strap edge is
 * not woven — it is smooth moulded rubber, and on a white strap it is also the
 * same colour as the paper. So the fill walks in from the side, takes a bite
 * out of the strap, and stops when it hits weave again. The result is a strap
 * with notches chewed along both edges and, here and there, a whole corner
 * gone.
 *
 * What fixes it is not a better colour test but the shape itself. Away from
 * the case the strap is a band whose two edges move smoothly down the frame,
 * a few pixels per row at most. A bite is a sudden excursion in one of those
 * edges over a handful of rows, which a median across the rows around it does
 * not see. So each edge is replaced by its own running median: bites close,
 * and anything the fill left standing outside the band — the leftover white of
 * the earlier complaint — is outside the median too, and goes.
 *
 * Case rows are left alone. The case is where the silhouette genuinely is not
 * smooth (lugs, crown, pushers), and it is also the one part that never needed
 * help: it is never the colour of the paper.
 *
 * Returns a per-row mask of the rows it rewrote, carrying the edges it settled
 * on so the alpha pass can draw them.
 */
function repairBand(outside, W, H, g) {
  const RADIUS = 14;     // rows either side of the running median
  const CASE_RATIO = 1.5; // width above which a row is the case, not strap

  const lo = new Int32Array(H).fill(-1);
  const hi = new Int32Array(H).fill(-1);
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let a = -1;
    for (let x = 0; x < W; x++) if (!outside[row + x]) { a = x; break; }
    if (a < 0) continue;
    let b = -1;
    for (let x = W - 1; x >= 0; x--) if (!outside[row + x]) { b = x; break; }
    lo[y] = a;
    hi[y] = b;
  }

  const band = {
    rows: new Uint8Array(H),
    left: new Int32Array(H).fill(-1),
    right: new Int32Array(H).fill(-1),
    /** Pixels handed back on a case row; they get a hard edge, not a ramp. */
    filled: new Uint8Array(W * H),
  };

  const top = Math.max(0, g.subjectTop);
  const bottom = Math.min(H - 1, g.subjectBottom);

  const widths = [];
  for (let y = top; y <= bottom; y++) if (lo[y] >= 0) widths.push(hi[y] - lo[y] + 1);
  if (widths.length < 60) return band;
  widths.sort((a, b) => a - b);
  // Low enough in the distribution to be a strap row rather than the case,
  // high enough not to be one of the damaged ones.
  const strapW = widths[Math.floor(widths.length * 0.35)];
  const caseLimit = strapW * CASE_RATIO;

  const strapRow = new Uint8Array(H);
  for (let y = top; y <= bottom; y++) {
    if (lo[y] < 0) continue;
    if (hi[y] - lo[y] + 1 <= caseLimit) strapRow[y] = 1;
  }

  // Each run of strap rows is smoothed on its own, so the case between them
  // cannot pull the medians towards it.
  for (let start = top; start <= bottom; start++) {
    if (!strapRow[start]) continue;
    let end = start;
    while (end + 1 <= bottom && strapRow[end + 1]) end++;
    if (end - start >= RADIUS) {
      const med = (arr, y) => {
        const w = [];
        for (let k = Math.max(start, y - RADIUS); k <= Math.min(end, y + RADIUS); k++) {
          if (arr[k] >= 0) w.push(arr[k]);
        }
        if (!w.length) return -1;
        w.sort((a, b) => a - b);
        return w[w.length >> 1];
      };
      for (let y = start; y <= end; y++) {
        const l = med(lo, y);
        const r = med(hi, y);
        if (l < 0 || r < 0 || r - l < 8) continue;
        band.rows[y] = 1;
        band.left[y] = l;
        band.right[y] = r;
        const row = y * W;
        for (let x = 0; x < W; x++) outside[row + x] = x < l || x > r ? 1 : 0;
      }
    }
    start = end;
  }

  carryThroughCase(outside, W, H, top, bottom, band);
  return band;
}

/**
 * Carries the strap through the rows the case is in.
 *
 * Where the strap meets a lug the fill comes down the sliver of paper between
 * the two and takes a bite out of the strap — and that bite is not enclosed, so
 * closing holes does not reach it. Those rows also hold the case, which makes
 * them far too wide for the silhouette above to treat as strap.
 *
 * But the strap's own edges are known from the rows either side, and the strap
 * does not go anywhere: it runs under the case on the same line it arrives on.
 * So its edges are carried across the case rows and everything between them is
 * given back. Only given back — nothing is taken away on these rows, because
 * the lugs, crown and pushers lie outside that span and the fill had them
 * right.
 */
function carryThroughCase(outside, W, H, top, bottom, band) {
  let above = -1;
  for (let y = top; y <= bottom; y++) {
    if (band.rows[y]) { above = y; continue; }
    if (above < 0) continue;

    let below = -1;
    for (let k = y + 1; k <= bottom; k++) if (band.rows[k]) { below = k; break; }
    if (below < 0) break;

    // Linear between the last clean row above and the first below, so a strap
    // that tapers into the lugs is followed rather than stepped.
    const t = (y - above) / (below - above);
    const l = Math.round(band.left[above] + (band.left[below] - band.left[above]) * t);
    const r = Math.round(band.right[above] + (band.right[below] - band.right[above]) * t);
    const row = y * W;
    for (let x = l; x <= r; x++) {
      if (!outside[row + x]) continue;
      outside[row + x] = 0;
      band.filled[row + x] = 1;
    }
  }
}
