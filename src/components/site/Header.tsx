"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import Search from "./Search";
import CartButton from "@/components/cart/CartButton";
import { scrollTo } from "@/lib/scroll";

export interface NavLink {
  label: string;
  href: string;
}

/**
 * The navigation bar. Links, the WhatsApp button and the mark all come from
 * the dashboard — Sections → Header, and Settings for the brand itself.
 */
export default function Header({
  nav,
  ctaLabel,
  ctaHref,
  whatsapp,
  brand,
  commerce = true,
}: {
  nav: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  /** Kept for the dashboard's Header section; the bar shows a search instead. */
  shopLabel?: string;
  shopHref?: string;
  whatsapp: string;
  brand: { name: string; tagline: string; logo: string };
  /** False in the static export, which has no server to price a bag. */
  commerce?: boolean;
}) {
  const [open, setOpen] = useState(false);

  // The logo and the name always go home, to the top of the hero. On the
  // homepage that is a scroll back up; anywhere else, a navigation that
  // lands at the top rather than wherever the router last left it.
  const router = useRouter();
  const onLogo = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setOpen(false);
    if (location.pathname === "/") {
      scrollTo(0);
      if (location.hash) history.replaceState(history.state, "", "/");
      return;
    }
    router.push("/");
    // After the new page has drawn.
    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }), 60);
  };

  // Escape closes the menu, and so does growing past the breakpoint that hides
  // the toggle — otherwise the panel is left open and unreachable.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 768px)");
    const onWide = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  // The menu covers the page, so the page must not scroll under it — on iOS a
  // swipe on the panel otherwise scrolls the document behind. Focus goes to
  // the first link on open and back to the toggle on close.
  const toggle = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const id = requestAnimationFrame(() => firstLink.current?.focus({ preventScroll: true }));
    const btn = toggle.current;
    return () => {
      root.style.overflow = prev;
      cancelAnimationFrame(id);
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  // An empty link falls back to WhatsApp, which is how most people reach WTC.
  const cta = ctaHref || (whatsapp ? `https://wa.me/${whatsapp}` : "");
  const external = cta.startsWith("http");

  return (
    /* Always on screen and always solid. It used to be clear over the hero
       and blurred once scrolled — a live backdrop blur under a fixed bar is
       re-rendered on every frame of scroll, which on a phone is most of what
       made the page feel heavy. A near-opaque fill looks the same. */
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/95">
      {/* Reading progress, driven by the browser's scroll timeline — no
          JavaScript runs while scrolling. */}
      <div aria-hidden className="scroll-progress absolute inset-x-0 bottom-0 h-px origin-left bg-gold/70" />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" onClick={onLogo} aria-label={`${brand.name} home`} className="flex min-h-11 items-center">
          <Logo logo={brand.logo} name={brand.name} tagline={brand.tagline} />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <Link
              key={`${n.href}-${n.label}`}
              href={n.href}
              className="text-[13px] font-medium text-mute transition-colors hover:text-chalk"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {ctaLabel && cta && (
            <a
              href={cta}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="hidden rounded-full border border-line px-4 py-2 text-[12px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold sm:block"
            >
              {ctaLabel}
            </a>
          )}
          <Search />
          {commerce && <CartButton />}
          <button
            ref={toggle}
            onClick={() => setOpen((v) => !v)}
            /* -mr-2.5 keeps the bars optically aligned with the row while the
               tappable box reaches the 44px minimum. */
            className="-mr-2.5 flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {/* Three lines; open, the middle one fades and the outer two
                cross. 6px apart, so each outer line travels 7px to meet. */}
            <motion.span
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px w-6 origin-center bg-chalk"
            />
            <motion.span
              animate={open ? { opacity: 0, scaleX: 0.4 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px w-6 origin-center bg-chalk"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px w-6 origin-center bg-chalk"
            />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────────
          Full screen rather than a strip under the bar: a dropdown of 14px
          links over a page that showed through underneath read as unfinished,
          and its targets were the smallest on the site. Large type, one link
          per row, a backdrop that owns the screen, and the page held still. */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-line bg-ink md:hidden"
          >
            <nav className="flex min-h-full flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
              <ul>
                {nav.map((n, i) => (
                  <motion.li
                    key={`${n.href}-${n.label}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + i * 0.05, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-line/70"
                  >
                    <Link
                      ref={i === 0 ? firstLink : undefined}
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between py-4 font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-chalk transition-colors active:text-gold"
                    >
                      {n.label}
                      <span
                        aria-hidden
                        className="text-lg text-mute-2 transition-transform duration-300 group-active:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + nav.length * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-auto pt-10"
              >
                {ctaLabel && cta && (
                  <a
                    href={cta}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center justify-center rounded-full border border-gold/50 text-sm font-semibold text-gold"
                  >
                    {ctaLabel}
                  </a>
                )}
                <p className="mt-5 text-center text-[12px] text-mute-2">{brand.tagline}</p>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
