"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import Logo from "./Logo";
import CartButton from "@/components/cart/CartButton";
import { cx } from "@/lib/format";

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
  shopLabel,
  shopHref,
  whatsapp,
  brand,
  commerce = true,
}: {
  nav: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  shopLabel: string;
  shopHref: string;
  whatsapp: string;
  brand: { name: string; tagline: string; logo: string };
  /** False in the static export, which has no server to price a bag. */
  commerce?: boolean;
}) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  // Spring it so the line eases rather than tracking the wheel one-to-one.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });

  useEffect(() => {
    // Read once per frame rather than once per scroll event: the handler only
    // flips a boolean, but on a phone the event fires far faster than paint.
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        setSolid(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // An empty link falls back to WhatsApp, which is how most people reach WTC.
  const cta = ctaHref || (whatsapp ? `https://wa.me/${whatsapp}` : "");
  const external = cta.startsWith("http");

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gold/70"
      />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={`${brand.name} home`}>
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

        <div className="flex items-center gap-3">
          {ctaLabel && cta && (
            <a
              href={cta}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="hidden rounded-full border border-line px-4 py-2 text-[12px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold sm:block"
            >
              {ctaLabel}
            </a>
          )}
          {commerce && <CartButton />}
          {shopLabel && (
            <Link
              href={shopHref || "/products"}
              className="rounded-full bg-chalk px-4 py-2 text-[12px] font-semibold text-ink transition-opacity hover:opacity-85"
            >
              {shopLabel}
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            /* -mr-2.5 keeps the bars optically aligned with the row while the
               tappable box reaches the 44px minimum. */
            className="-mr-2.5 flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <motion.span
              animate={open ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px w-6 origin-center bg-chalk"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="block h-px w-6 origin-center bg-chalk"
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-ink md:hidden"
          >
            <div className="px-4 pb-5 pt-3">
              {nav.map((n) => (
                <Link
                  key={`${n.href}-${n.label}`}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm text-mute transition-colors hover:text-chalk"
                >
                  {n.label}
                </Link>
              ))}
              {ctaLabel && cta && (
                <a
                  href={cta}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => setOpen(false)}
                  className="mt-2 block border-t border-line pt-4 text-sm text-gold sm:hidden"
                >
                  {ctaLabel}
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
