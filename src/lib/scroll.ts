/**
 * Programmatic scrolling: the scrolls the site starts itself — anchors, the
 * bag button moving on to the straps, the Strap Studio bringing its preview
 * back into view. All of them quick, and all of them yield to the reader.
 */

/** Clears the fixed header, plus a little air. */
export const HEADER_OFFSET = 88;

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Ease-out cubic: leaves quickly, lands gently. */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

let running = 0;

/**
 * Scrolls the window to `top`, quickly.
 *
 * The browser's own smooth scroll takes its time — the better part of a
 * second over a screen or two — which read as sluggish every time a tap
 * moved the page. This one takes a quarter to half a second, scaled to the
 * distance, and is dropped the moment the reader touches, scrolls or presses
 * a key: being dragged somewhere you have decided against is worse than slow.
 */
export function scrollTo(top: number) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const max = root.scrollHeight - window.innerHeight;
  const target = Math.max(0, Math.min(top, Math.max(0, max)));
  const start = window.scrollY;
  const delta = target - start;
  if (Math.abs(delta) < 4) return;
  if (reduced()) {
    window.scrollTo(0, target);
    return;
  }

  const duration = Math.min(480, Math.max(240, 200 + Math.abs(delta) * 0.12));
  const id = ++running;
  const prev = root.style.scrollBehavior;
  // Each frame sets the position outright; left on, the CSS smooth scroll
  // would turn every one of those into an animation of its own.
  root.style.scrollBehavior = "auto";

  let stopped = false;
  const stop = () => (stopped = true);
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("keydown", stop);
  const finish = () => {
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("keydown", stop);
    if (running === id) root.style.scrollBehavior = prev;
  };

  const t0 = performance.now();
  const step = (now: number) => {
    if (stopped || running !== id) return finish();
    const t = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, start + delta * ease(t));
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
 * Brings an element fully into view, unless it already is.
 *
 * Used by the Strap Studio: every tap on a strap brings the watch back on
 * screen, wherever in the picker you were. When the whole element fits under
 * the header it is placed just below it; a taller one is centred.
 */
export function revealElement(el: Element | null) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const room = window.innerHeight - HEADER_OFFSET;
  const fully = r.top >= HEADER_OFFSET - 8 && r.bottom <= window.innerHeight + 8;
  if (fully) return;
  const top =
    r.height <= room
      ? r.top + window.scrollY - HEADER_OFFSET + 8
      : r.top + window.scrollY - (window.innerHeight - r.height) / 2;
  scrollTo(top);
}

/**
 * Scrolls an element to just under the header, and makes sure it got there.
 *
 * A smooth scroll on a phone can be cut short — a finger still settling from
 * the tap that started it, or the page still gliding from a flick — and then
 * it simply stops partway. This checks once the scroll should be over and
 * finishes the job, unless the reader has touched or scrolled the page
 * themselves in the meantime (that is them deciding to look elsewhere).
 */
export function scrollToIdSurely(id: string, offset = HEADER_OFFSET) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id.replace(/^#/, ""));
  if (!el) return;
  let interrupted = false;
  const stop = () => (interrupted = true);
  const go = () => scrollTo(el.getBoundingClientRect().top + window.scrollY - offset);
  go();
  // Listen only after the scroll has started, so the tap that began it does
  // not count as an interruption.
  const arm = window.setTimeout(() => {
    window.addEventListener("touchstart", stop, { passive: true, once: true });
    window.addEventListener("wheel", stop, { passive: true, once: true });
  }, 150);
  const check = (left: number) =>
    window.setTimeout(() => {
      if (interrupted) return done();
      const off = el.getBoundingClientRect().top - offset;
      if (Math.abs(off) > 24) {
        go();
        if (left > 0) return check(left - 1);
      }
      done();
    }, 650);
  const done = () => {
    clearTimeout(arm);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("wheel", stop);
  };
  check(2);
}
