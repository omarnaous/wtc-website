/**
 * Programmatic scrolling, with a curve worth watching.
 *
 * `scroll-behavior: smooth` in CSS is what anchor links use, and its curve is
 * whatever the browser feels like — a constant-ish glide that crawls over a
 * long page and overshoots the eye on a short one. These are the scrolls the
 * site starts itself, where the distance is known, so they get an ease-out and
 * a duration set from how far they are actually going.
 */

/** Ease-out quart: leaves quickly, arrives gently. */
const ease = (t: number) => 1 - Math.pow(1 - t, 4);

/** Clears the fixed header, plus a little air. */
export const HEADER_OFFSET = 88;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scrolls the window to `top`.
 *
 * The CSS `scroll-behavior` is switched off for the duration: left on, every
 * frame of this animation would start a browser animation of its own and the
 * page would crawl. It is put back exactly as it was.
 *
 * A wheel, a touch or a key press hands control straight back to the reader —
 * being dragged to a destination you have decided against is the thing that
 * makes automatic scrolling feel hostile.
 */
export function scrollTo(top: number) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const max = document.body.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(top, Math.max(0, max)));
  const start = window.scrollY;
  const delta = target - start;
  if (Math.abs(delta) < 8) return;

  if (reduced()) {
    window.scrollTo(0, target);
    return;
  }

  // Long jumps take longer, but not in proportion — a page-and-a-half should
  // not take three seconds.
  const duration = Math.min(820, Math.max(340, Math.abs(delta) * 0.42));
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    root.style.scrollBehavior = previous;
    window.removeEventListener("wheel", finish);
    window.removeEventListener("touchstart", finish);
    window.removeEventListener("keydown", finish);
  };

  window.addEventListener("wheel", finish, { passive: true });
  window.addEventListener("touchstart", finish, { passive: true });
  window.addEventListener("keydown", finish);

  const t0 = performance.now();
  const step = (now: number) => {
    if (done) return;
    const t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, Math.round(start + delta * ease(t)));
    if (t < 1) requestAnimationFrame(step);
    else finish();
  };
  requestAnimationFrame(step);
}

/** Puts an element's top just under the header. */
export function scrollToElement(el: Element | null, offset = HEADER_OFFSET) {
  if (!el) return;
  scrollTo(el.getBoundingClientRect().top + window.scrollY - offset);
}

/** Same, by id — `#strap-studio` or `strap-studio` both work. */
export function scrollToId(id: string, offset = HEADER_OFFSET) {
  if (typeof document === "undefined") return;
  scrollToElement(document.getElementById(id.replace(/^#/, "")), offset);
}

/**
 * Brings an element into view only if it is not really in view already.
 *
 * Used where the thing you changed may be off-screen — the Strap Studio's
 * preview on a phone — and where scrolling a reader who can already see it
 * would be nothing but an interruption.
 */
export function revealElement(el: Element | null, minVisible = 0.6) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
  if (visible > r.height * minVisible) return;
  scrollTo(r.top + window.scrollY - (window.innerHeight - r.height) / 2);
}
