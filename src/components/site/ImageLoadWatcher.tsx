"use client";

import { useEffect } from "react";

/**
 * Marks every image on the page as loaded once it is (`data-loaded`), which
 * is what the `.shimmer` placeholders in globals.css key off: a box shows a
 * soft moving sheen while its photograph is on its way, and the photograph
 * fades in over it when it lands.
 *
 * Images already decoded when this starts are marked at once and only then is
 * the fade switched on (`html.img-fade`), so nothing that is already on screen
 * — the first view, served with the page — ever blinks out and back in.
 *
 * It is also the fallback for the media domain. Photographs come from the
 * bucket's own address (src/lib/media.ts); a network that cannot reach it —
 * a resolver that has not picked up the subdomain yet, a filter that blocks
 * it — would show an empty shop. The first photograph that fails there sends
 * it and every one after it back through /api/media, the Worker's route to
 * the same files.
 */

const MEDIA = /^https:\/\/media\.[^/]+\//;
let mediaDown = false;

/** Re-points a media-domain image at /api/media. True if it did. */
function fallBack(img: HTMLImageElement): boolean {
  const src = img.getAttribute("src") ?? "";
  if (!MEDIA.test(src)) return false;
  img.removeAttribute("srcset");
  img.src = src.replace(MEDIA, "/api/media/");
  return true;
}
export default function ImageLoadWatcher() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => {
      if (mediaDown && fallBack(img)) return;
      if (img.complete && img.naturalWidth > 0) img.dataset.loaded = "1";
      // Failed before this ran — before the page's scripts had loaded.
      else if (img.complete && img.getAttribute("src") && MEDIA.test(img.getAttribute("src")!)) {
        mediaDown = true;
        fallBack(img);
      }
    };
    document.querySelectorAll("img").forEach(mark);
    document.documentElement.classList.add("img-fade");

    // `load` does not bubble, but it can be caught on the way down.
    const onLoad = (e: Event) => {
      const t = e.target;
      if (t instanceof HTMLImageElement) t.dataset.loaded = "1";
    };
    // A broken image should stop shimmering too.
    const onError = (e: Event) => {
      const t = e.target;
      if (!(t instanceof HTMLImageElement)) return;
      if (fallBack(t)) {
        if (!mediaDown) {
          mediaDown = true;
          document.querySelectorAll("img").forEach((img) => img !== t && fallBack(img));
        }
        return;
      }
      t.dataset.loaded = "error";
    };
    document.addEventListener("load", onLoad, true);
    document.addEventListener("error", onError, true);

    // Images swapped in later from the cache can be complete before a load
    // event is ever seen; catch those as they are added or re-pointed.
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.target instanceof HTMLImageElement) {
          delete r.target.dataset.loaded;
          mark(r.target);
        }
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) mark(n);
          else if (n instanceof HTMLElement) n.querySelectorAll("img").forEach(mark);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });

    return () => {
      document.removeEventListener("load", onLoad, true);
      document.removeEventListener("error", onError, true);
      mo.disconnect();
    };
  }, []);
  return null;
}
