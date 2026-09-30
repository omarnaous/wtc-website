"use client";

import { useEffect } from "react";
import { scrollToElement } from "@/lib/scroll";

/**
 * Routes in-page anchor clicks through the site's own scroll.
 *
 * Every "#strap-studio" link — the hero's second button, the header nav —
 * scrolled with the browser's built-in curve, which is close to linear and
 * reads as slow over the length of this page. This hands them the same
 * ease-out the buttons use, so every scroll the site starts moves the same
 * way.
 *
 * Only plain left-clicks on links that point at a section of the page you are
 * already on are taken; a modifier, a new tab, a different route or a missing
 * target all fall through to the browser untouched.
 */
export default function SmoothAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) return;
      if (!url.hash || url.hash === "#") return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      scrollToElement(target);
      // Keeps the address bar honest without a second, instant jump.
      history.replaceState(null, "", url.hash);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
