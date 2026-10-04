"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/types";
import { cx } from "@/lib/format";

/**
 * The product photographs, as one swipeable track.
 *
 * On a phone a thumbnail strip under a square photo is three 80px targets
 * standing in for the gesture everyone already uses on a product page — swipe.
 * So the photos sit in a scroll-snap track (native momentum, no library, no
 * gesture code to fight the browser's back-swipe), with dots underneath. On a
 * desktop the same track is driven by thumbnails, and a trackpad can still
 * swipe it.
 *
 * The first photo is in the served markup at full opacity. It used to arrive
 * at opacity 0 and wait for the bundle to fade it in, which made the largest
 * image on the page — the one the page is judged by — the last thing to show.
 */
export default function Gallery({ product }: { product: Product }) {
  const views =
    product.photos?.length
      ? product.photos
      : [...new Set([product.images.front, product.images.angle, product.images.side])].filter(
          Boolean,
        );
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Which slide is showing, read from the scroll position once per frame.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  if (!views.length) return null;

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-3xl border border-line bevel"
        style={{
          background: `radial-gradient(circle at 50% 34%, ${product.palette.case}2b 0%, #131317 58%, #0b0b0e 100%)`,
        }}
      >
        <div
          ref={track}
          className="no-bar flex snap-x snap-mandatory overflow-x-auto"
          aria-roledescription="carousel"
          aria-label={`${product.name} photographs`}
        >
          {views.map((src, i) => (
            <div
              key={src}
              className="shimmer relative aspect-square w-full shrink-0 snap-center snap-always"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${views.length}`}
            >
              <Image
                src={src}
                alt={`${product.name} — photograph ${i + 1} of ${views.length}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="object-contain p-8"
              />
            </div>
          ))}
        </div>

        {views.length > 1 && (
          <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-line bg-ink/75 px-2.5 py-1 font-display text-[11px] tabular-nums text-mute lg:hidden">
            {active + 1} / {views.length}
          </span>
        )}
      </div>

      {views.length > 1 && (
        <>
          {/* Dots on a phone: the swipe is the control, these say where you are. */}
          <div className="mt-3 flex justify-center gap-1 lg:hidden">
            {views.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photograph ${i + 1}`}
                aria-current={i === active}
                className="flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={cx(
                    "h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    i === active ? "w-5 bg-chalk" : "w-1.5 bg-mute-2",
                  )}
                />
              </button>
            ))}
          </div>

          {/* Thumbnails on a desktop. */}
          <div className="no-bar mt-4 hidden gap-3 overflow-x-auto pb-1 lg:flex">
            {views.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Photograph ${i + 1}`}
                aria-pressed={i === active}
                className={cx(
                  "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border transition-colors",
                  i === active ? "border-gold" : "border-line hover:border-mute-2",
                )}
                style={{ background: "#121216" }}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
