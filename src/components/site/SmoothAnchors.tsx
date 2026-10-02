"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { scrollToElement } from "@/lib/scroll";

const JUMP = "wtc.jump";

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
  const pathname = usePathname();

  // A link to a section of another page ("Strap Studio" from a product page)
  // leaves a note, and the page it lands on scrolls to the section once it is
  // drawn — whether the router got there by itself or not. A reload starts at
  // the top regardless: the root layout drops any hash before the page draws.
  useEffect(() => {
    let id: string | null = null;
    try {
      id = sessionStorage.getItem(JUMP);
      sessionStorage.removeItem(JUMP);
    } catch {}
    if (!id) return;
    const t = setTimeout(() => scrollToElement(document.getElementById(id!)), 120);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !url.hash || url.hash === "#") return;
      const id = decodeURIComponent(url.hash.slice(1));
      if (url.pathname !== location.pathname) {
        try {
          sessionStorage.setItem(JUMP, id);
        } catch {}
        return;
      }

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      scrollToElement(target);
      // The hash is deliberately not written to the address bar: left there,
      // the next reload opened the homepage halfway down, on the section you
      // last jumped to.
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
