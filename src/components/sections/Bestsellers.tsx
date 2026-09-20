"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import { bestsellers } from "@/data/products";
import Badge from "@/components/product/Badge";
import { usd } from "@/lib/format";

export default function Bestsellers() {
  const rail = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="bestsellers" className="relative border-b border-line py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">What is moving</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              The ten our customers
              <span className="font-serif font-normal italic text-gold-soft"> keep asking for</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => nudge(-1)}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-gold hover:text-gold"
            >
              ←
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-gold hover:text-gold"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rail}
        className="no-bar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 lg:px-10"
      >
        {bestsellers.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, delay: Math.min(i, 5) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="w-[76vw] shrink-0 snap-start sm:w-[44vw] lg:w-[25vw] xl:w-[22rem]"
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
          </motion.div>
        ))}
      </div>
    </section>
  );
}
