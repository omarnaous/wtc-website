"use client";

import { useEffect, useState } from "react";
import AddToCart from "@/components/cart/AddToCart";
import { onAdded, onStrap, type StrapDetail } from "@/lib/cart/events";
import { usd } from "@/lib/format";
import { thumb } from "@/lib/thumb";

/**
 * The buy bar pinned to the bottom of the product page, always on screen:
 * the photo, the name, the price and the button, wherever you are on the
 * page. A watch that is out of stock says so in place of the button.
 *
 * Once the watch is in the bag, the bar moves on to the strap: it shows
 * whichever strap the Strap Studio has selected — the first one, picked as
 * the page scrolls down to it — with its own "Add to bag".
 *
 * The footer gets room under it (`.sticky-buy` in globals.css) so the bar
 * never covers the last lines of the page.
 */
export default function StickyBuy({
  slug,
  name,
  price,
  image,
  label,
  addedLabel,
  soldOut,
  soldOutLabel,
  inquire,
}: {
  slug: string;
  name: string;
  price: number;
  image: string;
  label: string;
  addedLabel: string;
  soldOut: boolean;
  soldOutLabel: string;
  /** WhatsApp link offered when the watch is out of stock. */
  inquire?: string;
  /** No longer used: the bar no longer steps aside. */
  watch?: string[];
}) {
  const [watchIn, setWatchIn] = useState(false);
  const [strap, setStrap] = useState<StrapDetail | null>(null);
  useEffect(() => onStrap(setStrap), []);
  useEffect(
    () =>
      onAdded((d) => {
        if (d.kind === "watch" && d.ref === slug) setWatchIn(true);
      }),
    [slug],
  );

  if (watchIn && strap) {
    return (
      <div className="sticky-buy fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/[0.97] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
        <div key={strap.id} className="mx-auto flex max-w-3xl items-center gap-3 [animation:fade-in_240ms_ease-out]">
          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gold/40 bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={strap.chip} alt="" decoding="async" className="h-full w-full object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[14px] font-semibold">{strap.name}</p>
            <p className="truncate text-[12px] text-mute-2">
              <span className="font-display font-semibold tabular-nums text-gold-soft">{usd(strap.price)}</span>
              <span className="px-1.5">·</span>
              <span className="text-emerald-300/90">✓ Watch in bag</span>
            </p>
          </div>
          {strap.soldOut ? (
            <span className="shrink-0 rounded-full border border-line px-4 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
              {soldOutLabel}
            </span>
          ) : (
            <AddToCart
              kind="strap"
              refId={strap.id}
              label={label}
              addedLabel={addedLabel}
              className="h-11 shrink-0 px-6 py-0 text-[13px]"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky-buy fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/[0.97] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 [animation:slide-up_420ms_cubic-bezier(0.16,1,0.3,1)_both] sm:px-6">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {image && <img src={thumb(image)} alt="" decoding="async" className="h-full w-full object-contain p-1" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[14px] font-semibold">{name}</p>
          {soldOut ? (
            <p className="font-display text-[12px] font-semibold uppercase tracking-[0.12em] text-mute">
              {soldOutLabel}
            </p>
          ) : (
            <p className="font-display text-[13px] tabular-nums text-gold-soft">{usd(price)}</p>
          )}
        </div>
        {soldOut ? (
          inquire ? (
            <a
              href={inquire}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 shrink-0 items-center rounded-full bg-chalk px-5 text-[13px] font-semibold text-ink transition-colors hover:bg-gold-soft"
            >
              Inquire on WhatsApp
            </a>
          ) : (
            <span className="shrink-0 rounded-full border border-line px-4 py-2 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
              {soldOutLabel}
            </span>
          )
        ) : (
          <AddToCart
            kind="watch"
            refId={slug}
            label={label}
            addedLabel={addedLabel}
            className="h-11 shrink-0 px-6 py-0 text-[13px]"
          />
        )}
      </div>
    </div>
  );
}
