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
 */
export default function ImageLoadWatcher() {
  useEffect(() => {
    const mark = (img: HTMLImageElement) => {
      if (img.complete && img.naturalWidth > 0) img.dataset.loaded = "1";
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
      if (t instanceof HTMLImageElement) t.dataset.loaded = "error";
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
