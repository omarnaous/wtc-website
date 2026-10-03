"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { MAX_QTY, type LineKind } from "@/lib/cart/types";
import { cx } from "@/lib/format";
import { scrollToId } from "@/lib/scroll";
import { emitAdded } from "@/lib/cart/events";

const BagIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The bag button, and what it turns into once the piece is in the bag.
 *
 * It reads the bag rather than remembering its own clicks. It used to say
 * "Added to bag" because it had been pressed — so after the piece was taken
 * out again in the bag drawer it still said so. Now:
 *
 *  - not in the bag: "Add to bag";
 *  - in the bag: a counter, "− 2 in bag +", with + stopping at the number of
 *    pieces actually in stock (and the bag's own limit), and − at one taking
 *    it out again.
 *
 * Every copy on the page — the button by the price, the bar along the
 * bottom, the Strap Studio — reads the same bag, so they always agree, and
 * so does a change made from the drawer or another tab.
 */
export default function AddToCart({
  kind,
  refId,
  label,
  soldOut = false,
  soldOutLabel = "Sold out",
  variant = "solid",
  className,
  onAdded,
  scrollTo,
  max,
}: {
  kind: LineKind;
  refId: string;
  label: string;
  /** Kept for callers; the counter now says what is in the bag. */
  addedLabel?: string;
  soldOut?: boolean;
  soldOutLabel?: string;
  variant?: "solid" | "outline";
  className?: string;
  onAdded?: () => void;
  /** Id of a section to move to once the piece first goes in. */
  scrollTo?: string;
  /** Pieces in stock; null or undefined when stock is not tracked. */
  max?: number | null;
}) {
  const { lines, ready, add, setQty } = useCart();
  const qty = lines.find((l) => l.kind === kind && l.ref === refId)?.qty ?? 0;
  const limit = Math.min(MAX_QTY, max ?? MAX_QTY);
  const atLimit = qty >= limit;

  // A short pulse on the count whenever it goes up, so a tap on + is seen.
  const [bump, setBump] = useState(0);
  const prev = useRef(qty);
  useEffect(() => {
    if (qty > prev.current) setBump((b) => b + 1);
    prev.current = qty;
  }, [qty]);

  // Out of stock is a statement, not a button you cannot press.
  if (soldOut || limit <= 0) {
    return (
      <p
        className={cx(
          "inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-mute",
          className,
        )}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-mute-2" />
        {soldOutLabel}
      </p>
    );
  }

  if (ready && qty > 0) {
    return (
      <div
        className={cx(
          "inline-flex items-center justify-between gap-1 rounded-full border border-gold/60 bg-gold/10 p-1 text-sm font-semibold text-chalk",
          className,
          "px-1 py-1",
        )}
        role="group"
        aria-label={`${qty} in bag`}
      >
        <button
          type="button"
          onClick={() => setQty(kind, refId, qty - 1)}
          aria-label={qty === 1 ? "Remove from bag" : "One fewer"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none text-chalk transition-colors hover:bg-white/10 active:scale-90"
        >
          {qty === 1 ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            "−"
          )}
        </button>
        <span className="flex min-w-0 flex-col items-center px-1 leading-tight">
          <span key={bump} className="whitespace-nowrap tabular-nums [animation:fade-in_220ms_ease-out]">
            {qty} in bag
          </span>
          {atLimit && max != null && (
            <span className="whitespace-nowrap text-[10px] font-medium text-gold-soft">
              Only {limit} available
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={() => add(kind, refId)}
          disabled={atLimit}
          aria-label="One more"
          title={atLimit ? `Only ${limit} available` : undefined}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none text-chalk transition-colors hover:bg-white/10 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    );
  }

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all active:scale-[0.97]";

  return (
    <button
      type="button"
      onClick={() => {
        add(kind, refId);
        emitAdded({ kind, ref: refId });
        onAdded?.();
        if (scrollTo) setTimeout(() => scrollToId(scrollTo), 160);
      }}
      className={cx(
        base,
        variant === "solid"
          ? "bg-chalk text-ink hover:bg-gold-soft"
          : "border border-line text-chalk hover:border-gold hover:text-gold",
        className,
      )}
    >
      <BagIcon />
      {label}
    </button>
  );
}
