"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/reviews/constants";
import { submitReview, type ReviewState } from "@/app/(site)/review-actions";
import { cx } from "@/lib/format";
import ScrollList from "@/components/motion/ScrollList";

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

const field =
  "w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-[14px] text-chalk placeholder:text-mute-2 focus:border-gold/60 focus:outline-none";

/**
 * The review form. What is sent is saved to the shop's database and lands in
 * Dashboard → Reviews, hidden until someone publishes it.
 */
export function ReviewForm({
  productNames,
  onClose,
  defaults,
}: {
  productNames: Record<string, string>;
  /** Absent on the review page, which has nowhere to close to. */
  onClose?: () => void;
  /** Filled in from an order, when the form is reached from the delivery email. */
  defaults?: { author?: string; location?: string; productSlug?: string };
}) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [opened] = useState(() => Date.now());
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, []);

  if (state.ok) {
    return (
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-semibold">Thank you — it is with us.</p>
          <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-mute">
            Your review shows here as soon as we have read it.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="h-11 shrink-0 rounded-full border border-line px-5 text-[13px] text-chalk transition-colors hover:border-gold hover:text-gold"
          >
            Close
          </button>
        ) : (
          <a
            href="/products"
            className="flex h-11 shrink-0 items-center rounded-full border border-line px-5 text-[13px] text-chalk transition-colors hover:border-gold hover:text-gold"
          >
            Back to the shop
          </a>
        )}
      </div>
    );
  }

  const shown = hover || rating;
  const names = Object.entries(productNames).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="rating" value={rating || ""} />
      <input type="hidden" name="opened" value={opened} />
      {/* Never shown; a bot that fills every field fills this one too. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="sm:col-span-2">
        <p id="rating-label" className="text-[12px] text-mute">Your rating</p>
        <div
          role="radiogroup"
          aria-labelledby="rating-label"
          className="mt-1.5 flex"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              ref={n === 1 ? first : undefined}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="flex h-11 w-11 items-center justify-center text-gold transition-transform active:scale-90"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className={cx("h-7 w-7 transition-transform duration-200", n <= shown && "scale-110")}
                fill={n <= shown ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-[12px] text-mute">Your name</span>
        <input name="author" required maxLength={60} autoComplete="name" defaultValue={defaults?.author} className={cx(field, "mt-1.5")} />
      </label>
      <label className="block">
        <span className="text-[12px] text-mute">
          Where you are <span className="text-mute-2">(optional)</span>
        </span>
        <input name="location" maxLength={60} placeholder="Beirut" defaultValue={defaults?.location} className={cx(field, "mt-1.5")} />
      </label>

      {names.length > 0 && (
        <label className="block sm:col-span-2">
          <span className="text-[12px] text-mute">
            Which watch <span className="text-mute-2">(optional)</span>
          </span>
          <select name="productSlug" defaultValue={defaults?.productSlug ?? ""} className={cx(field, "mt-1.5")}>
            <option value="" className="bg-surface">
              —
            </option>
            {names.map(([slug, name]) => (
              <option key={slug} value={slug} className="bg-surface">
                {name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block sm:col-span-2">
        <span className="text-[12px] text-mute">Your review</span>
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={1200}
          rows={4}
          placeholder="How did it land? The watch, the strap, the delivery…"
          className={cx(field, "mt-1.5 resize-y leading-relaxed")}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-[13px] text-red-300 sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-chalk px-7 text-sm font-semibold text-ink transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Post my review"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-full px-4 text-[13px] text-mute transition-colors hover:text-chalk"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Customer reviews.
 *
 * Anyone can write one here; it is saved to the shop and published from the
 * dashboard. With nothing published the section still stands, but it asks
 * for a review rather than showing one. The one thing it will never do is fill itself with
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
  /** No longer used — reviews are written on the site now, not sent by DM. */
  whatsapp?: string;
  instagram?: string;
  inviteTitle: string;
  inviteCopy: string;
  inviteCta: string;
}) {
  const empty = reviews.length === 0;
  const [writing, setWriting] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const openForm = () => {
    setWriting(true);
    requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  };

  const formCard = (
    <div
      ref={panel}
      className="mt-10 overflow-hidden rounded-3xl border border-gold/30 bevel bg-[radial-gradient(ellipse_at_20%_0%,#17171c_0%,#111114_60%,#0c0c0f_100%)] p-6 [animation:fade-in_220ms_ease-out] sm:p-8"
    >
      <p className="eyebrow mb-5">Write a review</p>
      <ReviewForm productNames={productNames} onClose={() => setWriting(false)} />
    </div>
  );

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

          <div className="flex items-end gap-4">
          {!empty && !writing && (
            <button
              type="button"
              onClick={openForm}
              className="h-11 rounded-full border border-line px-5 text-[13px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
            >
              Write a review
            </button>
          )}
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
        </div>

        {writing && formCard}

        {empty && !writing ? (
          <div className="mt-10 overflow-hidden rounded-3xl border border-line bevel bg-[radial-gradient(ellipse_at_20%_0%,#17171c_0%,#111114_60%,#0c0c0f_100%)] p-8 sm:p-10">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-lg">
                <Stars rating={5} className="text-gold/40" />
                <p className="mt-4 font-display text-lg font-semibold sm:text-xl">{inviteTitle}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-mute">{inviteCopy}</p>
              </div>
              <button
                type="button"
                onClick={openForm}
                className="h-12 shrink-0 rounded-full bg-chalk px-6 text-sm font-semibold text-ink transition-opacity hover:opacity-85"
              >
                {inviteCta || "Write a review"}
              </button>
            </div>
          </div>
        ) : empty ? null : (
          <ScrollList as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => {
              const watch = r.product_slug ? productNames[r.product_slug] : undefined;
              return (
                <li
                  key={r.id}
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
                </li>
              );
            })}
          </ScrollList>
        )}

        <p className="mt-8 text-[12px] text-mute-2">
          <Link prefetch={false} href="/products" className="hit transition-colors hover:text-gold">
            Browse the catalogue →
          </Link>
        </p>
      </div>
    </section>
  );
}
