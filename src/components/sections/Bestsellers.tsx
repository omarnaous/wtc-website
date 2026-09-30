"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import Badge from "@/components/product/Badge";
import { usd } from "@/lib/format";
import type { Product } from "@/data/types";

/**
 * The numbered rail. Which watches appear is the bestseller rank on each
 * product; the heading above them is Sections → Bestsellers rail.
 */
export default function Bestsellers({
  products,
  eyebrow,
  title,
  accent,
}: {
  products: Product[];
  eyebrow: string;
  title: string;
  accent: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  const sync = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // Scroll snapping can settle a few pixels short of either end, so a tight
    // threshold leaves the arrow enabled with nowhere left to go.
    const slack = 16;
    setEnds({ start: el.scrollLeft <= slack, end: el.scrollLeft >= max - slack });
  }, []);

  useEffect(() => {
    sync();
    const el = rail.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  const watching = useRef(0);

  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
    // A smooth scroll settles over several frames, so sample until it stops
    // rather than trusting a single scroll event to land after it finishes.
    cancelAnimationFrame(watching.current);
    const until = performance.now() + 900;
    const tick = () => {
      sync();
      if (performance.now() < until) watching.current = requestAnimationFrame(tick);
    };
    watching.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(watching.current), []);

  return (
    <section id="bestsellers" className="relative border-b border-line py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              {title}
              {accent && (
                <span className="font-serif font-normal italic text-gold-soft"> {accent}</span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => nudge(-1)}
              aria-label="Previous"
              disabled={ends.start}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition-colors enabled:hover:border-gold enabled:hover:text-gold disabled:opacity-30"
            >
              ←
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Next"
              disabled={ends.end}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition-colors enabled:hover:border-gold enabled:hover:text-gold disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* The rail fades in once, as one object.
          Animating each card on `whileInView` looked right on a grid and wrong
          here: a card three stops along the rail is outside the viewport
          horizontally, so it sat at zero opacity and then faded in *underneath
          the thumb* as you swiped to it. One entrance for the row, and the
          cards are simply there. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-10"
      >
        <div
          ref={rail}
          className="no-bar flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 lg:snap-proximity"
        >
        {products.map((p, i) => (
          <div
            key={p.slug}
            className="w-[80%] shrink-0 snap-start sm:w-[48%] lg:w-[32%] xl:w-[23.5%]"
          >
            <Link href={`/products/${p.slug}`} className="group block">
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bevel"
                style={{
                  background: `radial-gradient(circle at 50% 34%, ${p.palette.case}2e 0%, #131317 60%, #0c0c10 100%)`,
                }}
              >
                <span className="absolute left-5 top-4 font-display text-[3.5rem] font-bold leading-none text-white/[0.07]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <Image
                  src={p.images.front}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 76vw, (max-width: 1024px) 44vw, 22rem"
                  className="object-contain p-8 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08] group-hover:-rotate-2"
                />

                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
                  <Badge availability={p.availability} />
                  <span className="rounded-full bg-ink/70 px-3 py-1 text-[11px] font-medium text-chalk backdrop-blur">
                    {p.familyLabel}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-[12px] text-mute-2">{p.tagline}</p>
                </div>
                <p className="shrink-0 font-display text-base font-semibold">{usd(p.price)}</p>
              </div>
            </Link>
          </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
