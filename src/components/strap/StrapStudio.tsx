"use client";

import Image from "next/image";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StrapOption } from "@/lib/store/straps";
import type { Product } from "@/data/types";
import { cx, usd } from "@/lib/format";
import { thumb } from "@/lib/thumb";
import { revealElement } from "@/lib/scroll";
import { useCart } from "@/lib/cart/CartContext";

/**
 * Every frame in a set is the same watch photographed in the same position,
 * so a straight cross-fade shows only the strap changing. The flash at the
 * lugs and the recoil on the panel are there to give that change a moment of
 * physical weight — without them the swap reads as a dissolve.
 */
const FADE = { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const };

export interface StudioLabels {
  watchPickerLabel: string;
  strapsLabel: string;
  bagLabel: string;
  addedLabel2: string;
  soldOutLabel: string;
  note: string;
}

/** Matches the defaults declared in src/lib/content/schema.ts. */
const LABELS: StudioLabels = {
  watchPickerLabel: "Select your watch",
  strapsLabel: "Rubber straps",
  bagLabel: "Add to bag",
  addedLabel2: "Added to bag",
  soldOutLabel: "Sold out",
  note: "Watch not included. Checkout opens when the store goes live.",
};

export default function StrapStudio({
  product,
  models,
  sets,
  labels,
  commerce = true,
  compact = false,
}: {
  product: Product;
  /** When provided, the studio also lets you swap the watch head. */
  models?: Product[];
  /** The straps offered on each watch, keyed by slug. Set per watch in the dashboard. */
  sets: Record<string, StrapOption[]>;
  /** Every label in the studio — Sections → Strap Studio. */
  labels?: Partial<StudioLabels>;
  /** False in the static export, which cannot take an order. */
  commerce?: boolean;
  compact?: boolean;
}) {
  const t = { ...LABELS, ...labels };
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [head, setHead] = useState(product);
  const options = useMemo(() => sets[head.slug] ?? [], [sets, head.slug]);
  const [strap, setStrap] = useState<StrapOption | undefined>(() => options[0]);
  const [swaps, setSwaps] = useState(0);
  const controls = useAnimationControls();
  const preview = useRef<HTMLDivElement>(null);

  /**
   * Brings the watch back into view.
   *
   * Stacked on a phone the preview sits a screen above the bag button, so
   * adding a strap confirmed a change to something you could not see. Only
   * scrolls when it is actually out of view, which on a desktop is never.
   */
  const showPreview = () => revealElement(preview.current);

  // Only offer a watch in the head rail if straps have been fitted to it.
  const heads = useMemo(
    () => (models ?? []).filter((m) => (sets[m.slug]?.length ?? 0) > 0),
    [models, sets],
  );

  useEffect(() => {
    setStrap(options[0]);
  }, [options]);

  // Warm the whole set so a swap never waits on the network.
  useEffect(() => {
    options.forEach((s) => {
      const img = new window.Image();
      img.src = s.image;
    });
  }, [options]);

  // A different strap or watch means the last confirmation no longer applies.
  useEffect(() => setAdded(false), [strap, head]);

  useEffect(() => {
    if (!strap) return;
    controls.start({
      scale: [1, 0.985, 1.004, 1],
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    });
    setSwaps((n) => n + 1);
  }, [strap, controls]);

  if (!strap) return null;

  // The studio prices the strap and nothing else, on every page it appears on.
  // It is a strap shop with a watch in the photograph: showing a watch total
  // here read as though the watch were in the bag, which it never was.
  const strapPrice = strap.price;

  return (
    <div
      className={cx(
        // The preview takes the room it needs and the controls take a fixed
        // rail beside it. The old split gave the controls half the width, so
        // on a wide screen a column of 56px swatches sat in the middle of an
        // empty half-page while the watch was squeezed.
        "grid grid-cols-1 gap-6 lg:gap-10",
        compact
          ? "lg:grid-cols-[minmax(0,1fr)_21rem]"
          : "lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]"
      )}
    >
      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      <div className="min-w-0">
        <motion.div
          ref={preview}
          animate={controls}
          className="relative overflow-hidden rounded-3xl border border-line bevel bg-[radial-gradient(ellipse_at_50%_28%,#1b1b21_0%,#121216_58%,#0b0b0e_100%)]"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[34%] h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
            animate={{ backgroundColor: strap.color, opacity: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Sized from its height rather than its width. The photograph is a
              tall portrait, so filling the column made it tower over the page
              on a desktop and swallow the whole screen on a phone — with the
              straps you are meant to be comparing pushed out of sight. */}
          {/* svh, not vh. On a phone `vh` follows the address bar, so the
              preview resized on every change of scroll direction and pushed
              everything under it up and down as you read. `svh` is the small
              viewport — it does not move. */}
          <div className="relative mx-auto aspect-[700/1195] h-[clamp(19rem,52svh,32rem)] max-w-full">
            <AnimatePresence initial={false}>
              <motion.div
                key={strap.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
              >
                <Image
                  src={strap.image}
                  alt={`${head.name} fitted with the ${strap.name} strap`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 20rem"
                  priority
                  className="object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.55)]"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* A light sweep across the glass as the strap lands. */}
          <AnimatePresence>
            <motion.div
              key={swaps}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 will-change-transform"
              style={{
                background:
                  "linear-gradient(105deg, transparent, rgba(255,255,255,0.16), transparent)",
              }}
              initial={{ x: "-110%", opacity: 0 }}
              animate={{ x: "410%", opacity: [0, 1, 0] }}
              transition={{ duration: 0.85, ease: "easeOut" }}
            />
          </AnimatePresence>
        </motion.div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={strap.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="min-w-0"
            >
              <p className="truncate font-display text-sm font-semibold">{strap.name}</p>
              <p className="mt-0.5 text-[11px] text-mute-2">
                Shown on {head.name}
              </p>
            </motion.div>
          </AnimatePresence>
          <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[11px] text-mute">
            {usd(strapPrice)}
          </span>
        </div>
      </div>

      {/* ── Picker ─────────────────────────────────────────────────────── */}
      {/* Deliberately not sticky. Pinning this column looked right on a tall
          screen and broke on a short one: the rail is around 620px, so on a
          620px laptop it pinned at 96px and the last 96px of it — the price and
          the bag button — could not be scrolled to at all. The two columns are
          near enough the same height that sticking bought nothing anyway. */}
      <div className="flex min-w-0 flex-col">
        {heads.length > 1 && (
          <div className="mb-7">
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow">{t.watchPickerLabel}</p>
              <p className="text-[11px] text-mute-2">{heads.length} watches</p>
            </div>

            {/* A rail of the watches themselves rather than a row of name
                pills. Names alone are no help to someone who knows their watch
                by sight, and at 375px a pill rail showed three of them. Each
                card is a scroll-snap stop, so the same gesture works with a
                trackpad, a wheel and a thumb. */}
            <div
              className="no-bar mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
              /* Fades the last card out at the edge, so a rail that runs past
                 the column looks like one rather than like a clipped row. */
              style={{
                maskImage:
                  "linear-gradient(to right, #000 0, #000 calc(100% - 2.5rem), transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, #000 0, #000 calc(100% - 2.5rem), transparent 100%)",
              }}
            >
              {heads.map((m) => {
                const active = m.slug === head.slug;
                return (
                  <button
                    key={m.slug}
                    onClick={() => setHead(m)}
                    aria-pressed={active}
                    title={m.name}
                    className={cx(
                      "flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl border px-1.5 py-2 transition-colors",
                      active
                        ? "border-gold bg-gold/10"
                        : "border-line hover:border-mute-2 hover:bg-surface/50"
                    )}
                  >
                    <span className="relative block h-11 w-11">
                      <Image
                        src={thumb(m.images.front)}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-contain"
                      />
                    </span>
                    <span
                      className={cx(
                        "line-clamp-2 text-center text-[10px] leading-tight",
                        active ? "text-gold" : "text-mute"
                      )}
                    >
                      {m.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">{t.strapsLabel}</p>
          <p className="text-[11px] text-mute-2">{options.length} for this model</p>
        </div>

        <div className="no-bar mt-4 grid max-h-[22rem] grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] items-start gap-2.5 overflow-y-auto pr-1 sm:grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))]">
          {options.map((s) => {
            const active = s.id === strap.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setStrap(s);
                  showPreview();
                }}
                title={s.name}
                aria-label={s.name}
                aria-pressed={active}
                className={cx(
                  "relative aspect-square overflow-hidden rounded-xl border transition-all duration-300",
                  active
                    ? "border-gold ring-2 ring-gold/30"
                    : "border-line hover:-translate-y-0.5 hover:border-mute-2"
                )}
              >
                {/* The pre-cut swatch, not a CSS zoom into the full shot.
                    It is a square of the strap taken below the case using the
                    measured geometry of each photograph, so it shows the whole
                    width — both rows of stitching — with no studio paper at
                    the edges and none of the lit cut end at the strap's top. */}
                <Image
                  src={s.chip}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>

        <div className="mt-7 rounded-2xl border border-line bg-surface/60 p-5">
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">{strap.name}</p>
              <p className="mt-1 truncate text-[12px] text-mute-2">{t.strapsLabel}</p>
            </div>
            <p className="shrink-0 font-display text-lg font-semibold">{usd(strapPrice)}</p>
          </div>

          {commerce && (
            <button
              type="button"
              onClick={() => {
                add("strap", strap.id);
                setAdded(true);
                showPreview();
              }}
              disabled={strap.soldOut}
              className={cx(
                "mt-4 w-full rounded-full py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-mute-2",
                added ? "bg-gold text-ink" : "bg-chalk text-ink hover:opacity-85",
              )}
            >
              {strap.soldOut ? t.soldOutLabel : added ? t.addedLabel2 : t.bagLabel}
            </button>
          )}
          <p className="mt-3 text-center text-[11px] text-mute-2">{t.note}</p>
        </div>
      </div>
    </div>
  );
}
