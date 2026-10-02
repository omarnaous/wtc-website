import { Easing, interpolate } from "remotion";

/**
 * One scroll loop for every animated list on the page.
 *
 * Each list item is given a progress through the viewport — 0 as it enters
 * at the bottom, 1 once it has risen past the middle of the screen — and that progress is run
 * through Remotion's `interpolate` and `Easing`, the same curves the films
 * use, to place it: it rises, untilts and grows into place, and settles back
 * a touch as it leaves at the top. The page's scroll speed adds a slight
 * lean, so a fast flick visibly drags the cards and they spring upright as
 * it slows.
 *
 * Kept cheap enough for a phone, on purpose:
 *  - one passive scroll listener and one requestAnimationFrame for the lot,
 *    and the loop stops as soon as the page is still;
 *  - positions are measured once (and again on resize), from offsetTop,
 *    never read back during scroll — no layout work per frame;
 *  - only items near the screen are touched (an IntersectionObserver says
 *    which), and only transform and opacity are written, so the compositor
 *    does the rest;
 *  - a style is only written when it actually changed.
 */

interface Item {
  el: HTMLElement;
  top: number;
  height: number;
  /** Position in its row, for the stagger. */
  col: number;
  near: boolean;
  last: string;
  /**
   * Already on screen when it was first measured. It is left exactly where
   * it is — nothing on the first screen jumps backwards to animate in — until
   * it has gone off the bottom and comes back.
   */
  seen: boolean;
  fresh: boolean;
}

const items = new Map<HTMLElement, Item>();
let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;
let frame = 0;
let lastY = 0;
let lastT = 0;
let velocity = 0;
let vh = 800;
let measured = false;

const docTop = (el: HTMLElement) => {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
};
const docLeft = (el: HTMLElement) => {
  let x = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) x += n.offsetLeft;
  return x;
};

function measure() {
  vh = window.innerHeight;
  const rows = new Map<number, Item[]>();
  for (const it of items.values()) {
    it.top = docTop(it.el);
    it.height = it.el.offsetHeight;
    if (it.fresh) {
      it.fresh = false;
      it.seen = it.top < window.scrollY + vh;
    }
    const key = Math.round(it.top / 8);
    (rows.get(key) ?? rows.set(key, []).get(key)!).push(it);
  }
  for (const row of rows.values()) {
    row.sort((a, b) => docLeft(a.el) - docLeft(b.el)).forEach((it, i) => (it.col = i));
  }
  measured = true;
  schedule();
}

let measureTimer = 0;
function remeasure() {
  clearTimeout(measureTimer);
  measureTimer = window.setTimeout(measure, 120);
}

const RISE = Easing.out(Easing.cubic);
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

function paint(now: number) {
  frame = 0;
  const y = window.scrollY;
  const dt = Math.max(1, now - lastT);
  const instant = ((y - lastY) / dt) * 16; // px per 60fps frame
  velocity += (instant - velocity) * 0.18;
  lastY = y;
  lastT = now;
  const lean = Math.max(-3, Math.min(3, velocity * 0.06));

  for (const it of items.values()) {
    if (!it.near) continue;
    // Entering: from the item's top crossing the bottom edge until it is a
    // little over a third of the way up the screen. Neighbours in a row are
    // a beat apart.
    // Played out across the lower two-thirds of the screen — from just after
    // the top edge appears to when it is past the middle — so the motion
    // happens where you are looking, not at the bottom edge before you get
    // there.
    const enter = interpolate(
      y + vh - it.top,
      [vh * 0.04, vh * 0.66],
      [0, 1],
      { ...clampOpts, easing: RISE },
    );
    if (it.seen && it.top > y + vh) it.seen = false;
    const p = it.seen ? 1 : Math.max(0, Math.min(1, enter * (1 + it.col * 0.14) - it.col * 0.14));
    // Leaving: as its middle passes under the header.
    const leave = interpolate(y - (it.top + it.height * 0.5) + 80, [0, vh * 0.5], [0, 1], clampOpts);

    const ty = interpolate(p, [0, 1], [72, 0]) - leave * 18;
    const rx = interpolate(p, [0, 1], [16, 0]);
    const s = interpolate(p, [0, 1], [0.9, 1]) * interpolate(leave, [0, 1], [1, 0.95]);
    const o = interpolate(p, [0, 0.55], [0, 1], clampOpts) * interpolate(leave, [0, 1], [1, 0.55]);
    const sk = p > 0.98 ? lean : lean * p;

    const t =
      `perspective(1100px) translate3d(0,${ty.toFixed(1)}px,0) rotateX(${rx.toFixed(2)}deg) ` +
      `scale(${s.toFixed(4)}) skewY(${sk.toFixed(2)}deg)`;
    const key = `${t}|${o.toFixed(3)}`;
    if (key !== it.last) {
      it.last = key;
      it.el.style.transform = t;
      it.el.style.opacity = o.toFixed(3);
    }
  }

  // Keep going while the lean is still settling; stop when the page is still.
  if (Math.abs(velocity) > 0.05) schedule();
  else velocity = 0;
}

function schedule() {
  if (!frame && measured) frame = requestAnimationFrame(paint);
}

function onScroll() {
  schedule();
}

function start() {
  if (io) return;
  lastY = window.scrollY;
  lastT = performance.now();
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const it = items.get(e.target as HTMLElement);
        if (!it) continue;
        it.near = e.isIntersecting;
        // A compositor layer only while it can move.
        it.el.style.willChange = it.near ? "transform, opacity" : "";
      }
      schedule();
    },
    { rootMargin: "25% 0px 25% 0px" },
  );
  ro = new ResizeObserver(remeasure);
  ro.observe(document.body);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", remeasure, { passive: true });
}

function stop() {
  io?.disconnect();
  ro?.disconnect();
  io = null;
  ro = null;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", remeasure);
  cancelAnimationFrame(frame);
  frame = 0;
  measured = false;
}

export function track(el: HTMLElement) {
  if (items.has(el)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  start();
  items.set(el, { el, top: 0, height: 0, col: 0, near: false, last: "", seen: false, fresh: true });
  io!.observe(el);
  remeasure();
}

export function untrack(el: HTMLElement) {
  const it = items.get(el);
  if (!it) return;
  items.delete(el);
  io?.unobserve(el);
  el.style.transform = "";
  el.style.opacity = "";
  el.style.willChange = "";
  if (!items.size) stop();
}
