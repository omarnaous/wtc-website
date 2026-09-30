"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Review } from "@/lib/reviews/constants";

/** Five stars, `rating` of them filled. */
function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={className} role="img" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          aria-hidden
          className="inline-block h-[13px] w-[13px]"
          fill={n <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Customer reviews.
 *
 * With nothing published the section still stands, but it asks for a review
 * rather than showing one. The one thing it will never do is fill itself with
 * written-in quotes: a review is a sentence attributed to a named person, and
 * inventing those is inventing customers.
 */
export default function Reviews({
  reviews,
  summary,
  eyebrow,
  title,
  accent,
  copy,
  showRating,
  productNames,
  whatsapp,
  instagram,
  inviteTitle,
  inviteCopy,
  inviteCta,
}: {
  reviews: Review[];
  summary: { count: number; average: number };
  eyebrow: string;
  title: string;
  accent: string;
  copy: string;
  showRating: boolean;
  /** slug → name, so a review can name the watch it is about. */
  productNames: Record<string, string>;
  /** Digits only. Where the invitation sends people when nothing is published. */
  whatsapp?: string;
  instagram?: string;
  inviteTitle: string;
  inviteCopy: string;
  inviteCta: string;
}) {
  const empty = reviews.length === 0;
  const waHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi WTC — here is how my watch landed:")}`
    : instagram || "";

  return (
    <section id="reviews" className="border-b border-line py-20 lg:py-28">
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
            {copy && <p className="mt-4 max-w-md text-[15px] leading-relaxed text-mute">{copy}</p>}
          </div>

          {showRating && summary.count > 0 && (
            <div className="rounded-2xl border border-line bg-surface/40 px-5 py-4 text-right">
              <p className="font-display text-3xl font-semibold leading-none">
                {summary.average.toFixed(1)}
              </p>
              <Stars rating={summary.average} className="mt-2 block text-gold" />
              <p className="mt-2 text-[11px] text-mute-2">
                {summary.count} review{summary.count === 1 ? "" : "s"}
              </p>
            </div>
          )}
        </div>

        {empty ? (
          <div className="mt-10 overflow-hidden rounded-3xl border border-line bevel bg-[radial-gradient(ellipse_at_20%_0%,#17171c_0%,#111114_60%,#0c0c0f_100%)] p-8 sm:p-10">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-lg">
                <Stars rating={5} className="text-gold/40" />
                <p className="mt-4 font-display text-lg font-semibold sm:text-xl">{inviteTitle}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-mute">{inviteCopy}</p>
              </div>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full bg-chalk px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-85"
                >
                  {inviteCta}
                </a>
              )}
            </div>
          </div>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => {
              const watch = r.product_slug ? productNames[r.product_slug] : undefined;
              return (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(i, 5) * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col rounded-3xl border border-line bevel bg-[radial-gradient(ellipse_at_20%_0%,#17171c_0%,#111114_60%,#0c0c0f_100%)] p-6"
                >
                  <Stars rating={r.rating} className="text-gold" />

                  <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-chalk/90">
                    {r.body}
                  </blockquote>

                  <footer className="mt-5 border-t border-line pt-4">
                    <p className="font-display text-[13px] font-semibold">{r.author}</p>
                    <p className="mt-0.5 text-[11.5px] text-mute-2">
                      {[r.location, watch].filter(Boolean).join(" · ")}
                    </p>
                  </footer>
                </motion.li>
              );
            })}
          </ul>
        )}

        <p className="mt-8 text-[12px] text-mute-2">
          <Link href="/products" className="transition-colors hover:text-gold">
            Browse the catalogue →
          </Link>
        </p>
      </div>
    </section>
  );
}
