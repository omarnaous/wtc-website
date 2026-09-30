"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

export interface Post {
  id: string;
  image: string;
  permalink: string;
  caption: string;
  isVideo: boolean;
}

export default function InstagramStrip({
  posts,
  live,
  handle,
  link,
  eyebrow,
  copy,
  ctaLabel,
}: {
  posts: Post[];
  /** False when these are stand-in product shots rather than real posts. */
  live: boolean;
  handle: string;
  link: string;
  eyebrow: string;
  copy: string;
  ctaLabel: string;
}) {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start end", "end start"],
  });
  // Opposing drifts give the row depth as it passes through the viewport.
  const driftUp = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const driftDown = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  // Only on the six-across layout. In the three-across phone grid the tiles
  // are adjacent enough that opposing drifts read as the grid shivering, and
  // it is six transforms recomputed on every scroll frame for the trouble.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section ref={section} className="overflow-hidden border-b border-line py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-4 font-display text-[clamp(1.6rem,3.4vw,2.5rem)] font-bold tracking-[-0.03em]">
              {handle}
            </h2>
            <p className="mt-3 max-w-md text-sm text-mute">{copy}</p>
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-6 py-3 text-[12px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
          >
            {ctaLabel}
          </a>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {posts.map((t, i) => (
            <motion.a
              key={t.id}
              href={t.permalink}
              target="_blank"
              rel="noopener noreferrer"
              style={wide ? { y: i % 2 ? driftDown : driftUp } : undefined}
              className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface"
            >
              <Image
                src={live ? asset(t.image) : t.image}
                alt={t.caption || "Instagram post"}
                fill
                sizes="(max-width: 1024px) 33vw, 16vw"
                className={
                  live
                    ? "object-cover transition-transform duration-700 group-hover:scale-105"
                    : "object-contain p-3 transition-transform duration-700 group-hover:scale-110"
                }
              />
              {t.isVideo && (
                <span className="absolute right-2 top-2 text-[11px] text-chalk/80" aria-hidden>
                  ▶
                </span>
              )}
            </motion.a>
          ))}
        </div>

        {!live && (
          <p className="mt-5 text-[11px] text-mute-2">
            Showing stock photography — run <code className="text-mute">npm run instagram</code> with
            an access token to pull the live grid.
          </p>
        )}
      </div>
    </section>
  );
}
