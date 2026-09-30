"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import type { LineKind } from "@/lib/cart/types";
import { cx } from "@/lib/format";
import { scrollToId } from "@/lib/scroll";

/**
 * Adds a line to the bag and says so for a moment.
 *
 * Deliberately does not open the bag: on a product page you often add the
 * watch and then the strap, and a panel sliding over the page between the two
 * gets in the way. `scrollTo` is the other half of that — once the watch is in
 * the bag the page moves on to the straps that fit it, which is the question
 * anyone buying one is about to ask anyway.
 */
export default function AddToCart({
  kind,
  refId,
  label,
  addedLabel = "Added to bag",
  soldOut = false,
  soldOutLabel = "Sold out",
  variant = "solid",
  className,
  onAdded,
  scrollTo,
}: {
  kind: LineKind;
  refId: string;
  label: string;
  addedLabel?: string;
  soldOut?: boolean;
  soldOutLabel?: string;
  variant?: "solid" | "outline";
  className?: string;
  onAdded?: () => void;
  /** Id of a section to move to once the line is in — skipped if it is absent. */
  scrollTo?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(t);
  }, [added]);

  // A new item under the same button (swapping strap in the studio) should
  // clear the confirmation rather than claim the new one is already in.
  useEffect(() => setAdded(false), [kind, refId]);

  const base =
    "rounded-full px-7 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed";

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => {
        if (soldOut) return;
        add(kind, refId);
        setAdded(true);
        onAdded?.();
        // A beat, so the button has said "Added" before the page moves.
        if (scrollTo) setTimeout(() => scrollToId(scrollTo), 260);
      }}
      aria-live="polite"
      className={cx(
        base,
        variant === "solid"
          ? "bg-chalk text-ink hover:opacity-85 disabled:bg-surface-2 disabled:text-mute-2"
          : "border border-line text-chalk hover:border-gold hover:text-gold disabled:opacity-40",
        added && variant === "solid" && "bg-gold text-ink",
        added && variant === "outline" && "border-gold text-gold",
        className,
      )}
    >
      {soldOut ? soldOutLabel : added ? addedLabel : label}
    </button>
  );
}
