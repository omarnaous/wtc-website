"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { site } from "@/data/site";
import { cx } from "@/lib/format";

const NAV = [
  { href: "/products", label: "Shop all" },
  { href: "/#bestsellers", label: "Bestsellers" },
  { href: "/#strap-studio", label: "Strap Studio" },
  { href: "/#about", label: "About" },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        solid ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13px] font-medium text-mute transition-colors hover:text-chalk"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-line px-4 py-2 text-[12px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold sm:block"
          >
            WhatsApp
          </a>
          <Link
            href="/products"
            className="rounded-full bg-chalk px-4 py-2 text-[12px] font-semibold text-ink transition-opacity hover:opacity-85"
          >
            Shop
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className="block h-px w-6 bg-chalk" />
            <span className="mt-1.5 block h-px w-6 bg-chalk" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-ink px-4 pb-5 pt-3 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-mute hover:text-chalk"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
