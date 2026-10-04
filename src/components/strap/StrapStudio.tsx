"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useMemo, useRef, useState } from "react";
import Restrap, { RESTRAP } from "@/remotion/Restrap";
import type { StrapOption } from "@/lib/store/straps";
import type { ColorGroup, Product } from "@/data/types";
import { COLOR_GROUPS } from "@/lib/products/constants";
import { cx, usd } from "@/lib/format";
import { thumb } from "@/lib/thumb";
import { revealElement, scrollToIdSurely } from "@/lib/scroll";
import { emitStrap, onAdded } from "@/lib/cart/events";
import AddToCart from "@/components/cart/AddToCart";

/**
 * Every frame in a set is the same watch photographed in the same position,
 * so a straight cross-fade shows only the strap changing. It is what a change
 * of watch uses, and any swap the re-strap cannot play (a strap that has not
 * been photographed on this watch, or reduced motion).
 */
const FADE = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

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
  strapsLabel: "Straps",
  bagLabel: "Add to bag",
  addedLabel2: "Added to bag",
  soldOutLabel: "Sold out",
  note: "Watch not included.",
};

/**
 * The stage's light for a strap on a watch: a tall glow in the strap's colour
 * running the length of the strap, a smaller one in the dial's colour behind
 * the case, and a faint floor. Mixed in OKLab against transparency, so pale
 * straps give a soft halo rather than a white sheet and dark ones still read.
 */
function stageLight(strap: string, dial?: string, kase?: string): string {
  const mix = (c: string, pct: number) => `color-mix(in oklab, ${c} ${pct}%, transparent)`;
  const layers = [
    `radial-gradient(ellipse 34% 58% at 50% 46%, ${mix(strap, 30)} 0%, ${mix(strap, 10)} 45%, transparent 75%)`,
  ];
  if (dial) layers.push(`radial-gradient(circle at 50% 46%, ${mix(dial, 22)} 0%, transparent 34%)`);
  if (kase) layers.push(`radial-gradient(ellipse 70% 30% at 50% 100%, ${mix(kase, 14)} 0%, transparent 70%)`);
  return layers.join(", ");
}

/**
 * Which photo set a frame belongs to — its folder. The re-strap only plays
 * between two frames of one set: they are the same watch shot from the same
 * spot, so only the strap moves. The Velcro try-ons and the rubber photos
 * are framed differently, so a swap between them cross-fades instead.
 */
const setOf = (src: string) => src.slice(0, src.lastIndexOf("/"));

/** A strap as offered on the watch on screen. */
type Opt = StrapOption & { onThis: boolean };

type Tab = "all" | "fitted" | "rubber" | "velcro";

export default function StrapStudio({
  product,
  models,
  sets,
  labels,
  commerce = true,
  compact = false,
}: {
  product: Product;
  /** When provided, the studio also lets you swap the watch head. Every one
   * listed must have straps; those not in `sets` are fetched when picked. */
  models?: Product[];
  /** The straps photographed on each watch, keyed by slug. */
  sets: Record<string, StrapOption[]>;
  /** No longer used: only straps pictured on the watch on show are offered. */
  catalogue?: StrapOption[];
  watchNames?: Record<string, string>;
  /** Every label in the studio — Sections → Strap Studio. */
  labels?: Partial<StudioLabels>;
  /** False in the static export, which cannot take an order. */
  commerce?: boolean;
  /** The product page's studio: one watch, and it follows that watch's buy button. */
  compact?: boolean;
}) {
  const t = { ...LABELS, ...labels };
  const [head, setHead] = useState(product);
  const [tab, setTab] = useState<Tab>("all");
  const [colour, setColour] = useState<ColorGroup | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);

  // Sets fetched since the page loaded, on top of the ones it came with.
  const [loaded, setLoaded] = useState<Record<string, StrapOption[]>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const allSets = useMemo(() => ({ ...sets, ...loaded }), [sets, loaded]);

  // Only straps pictured on the watch on show. Offering a strap whose only
  // photo is on another watch swapped the watch under you when you picked it;
  // every strap now has a try-on on every watch with an official photo
  // (scripts/make-velcro-tryons.mjs, make-strap-tryons.mjs), so nothing is
  // lost by this.
  const options = useMemo<Opt[]>(
    () => (allSets[head.slug] ?? []).map((o) => ({ ...o, onThis: true })),
    [allSets, head.slug],
  );

  const [strapId, setStrapId] = useState<string | undefined>(() => options[0]?.id);
  const strap = options.find((o) => o.id === strapId) ?? options[0];

  /*
   * The re-strap: a Remotion composition played over the photograph when you
   * swap between two straps photographed on this watch in the same set — the
   * new strap revealed from the case outwards. Any other swap cross-fades.
   */
  const shown = useRef<{ src: string; frame: boolean } | null>(null);
  const restrapPlayer = useRef<PlayerRef>(null);
  const [restrap, setRestrap] = useState<{ from: string; to: string; n: number } | null>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // A new watch keeps the strap you were looking at when it has been
  // photographed on that watch too, and otherwise starts on its own default.
  const switchTo = (m: Product, fitted: StrapOption[]) => {
    if (!fitted.some((o) => o.id === strapId)) setStrapId(fitted[0]?.id);
    setHead(m);
    setRestrap(null);
  };
  const pickHead = async (m: Product) => {
    if (m.slug === head.slug) return;
    const have = allSets[m.slug];
    if (have) return switchTo(m, have);
    setLoading(m.slug);
    try {
      const res = await fetch(`/api/straps/${encodeURIComponent(m.slug)}`);
      const fitted = res.ok ? ((await res.json()) as StrapOption[]) : [];
      if (!fitted.length) return;
      // Its frames start downloading now, so the swap lands on a photo.
      const img = new window.Image();
      img.src = (fitted.find((o) => o.id === strapId) ?? fitted[0]).image;
      setLoaded((cur) => ({ ...cur, [m.slug]: fitted }));
      switchTo(m, fitted);
    } finally {
      setLoading((cur) => (cur === m.slug ? null : cur));
    }
  };

  const counts = useMemo(
    () => ({
      all: options.length,
      fitted: options.filter((o) => o.onThis).length,
      rubber: options.filter((o) => o.type === "rubber").length,
      velcro: options.filter((o) => o.type === "velcro").length,
    }),
    [options],
  );
  const colours = useMemo(() => {
    const present = new Set(options.map((o) => o.colorGroup));
    return COLOR_GROUPS.filter((c) => present.has(c.id));
  }, [options]);

  const visible = useMemo(
    () =>
      options.filter(
        (o) =>
          (tab === "all" ||
            (tab === "fitted" && o.onThis) ||
            (tab !== "fitted" && o.type === tab)) &&
          (!colour || o.colorGroup === colour),
      ),
    [options, tab, colour],
  );

  // The new photo is decoded before the reveal starts — the Player would
  // otherwise hold a frame while it downloads — and if that takes more than a
  // beat the swap simply cross-fades instead of waiting.
  const pending = useRef(0);
  const pickStrap = (s: Opt) => {
    const from = shown.current;
    const canRestrap =
      !reduced && from?.frame && s.onThis && from.src !== s.image && setOf(from.src) === setOf(s.image);
    if (!canRestrap) {
      setRestrap(null);
      setStrapId(s.id);
      return;
    }
    const ticket = ++pending.current;
    const img = new window.Image();
    img.src = s.image;
    let settled = false;
    const go = (animate: boolean) => {
      if (settled || ticket !== pending.current) return;
      settled = true;
      setRestrap(animate ? { from: from!.src, to: s.image, n: Date.now() } : null);
      setStrapId(s.id);
    };
    img.decode().then(() => go(true), () => go(false));
    setTimeout(() => go(false), 450);
  };

  // The overlay's last frame is the new photograph exactly, so it is removed
  // the moment it ends. The timeout is a backstop for a stalled image.
  useEffect(() => {
    const p = restrapPlayer.current;
    if (!restrap) return;
    const done = () => setRestrap((cur) => (cur?.n === restrap.n ? null : cur));
    p?.addEventListener("ended", done);
    const backstop = setTimeout(done, 2000);
    return () => {
      p?.removeEventListener("ended", done);
      clearTimeout(backstop);
    };
  }, [restrap]);

  useEffect(() => {
    if (strap) shown.current = { src: strap.image, frame: strap.onThis };
  }, [strap]);

  /*
   * Warm this watch's photographs — but only once the studio is close to the
   * screen. Doing it on mount downloaded a megabyte of frames for every
   * visitor to the homepage, most of whom never scroll this far, and it did
   * so while the page above was still trying to load.
   */
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: "600px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!near) return;
    for (const s of allSets[head.slug] ?? []) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = s.image;
    }
  }, [near, allSets, head.slug]);

  /*
   * On a product page (`compact`), putting the watch in the bag moves on to
   * its straps: the page scrolls down to the studio and the first strap is
   * picked, ready to add from the bar along the bottom.
   */
  const pickRef = useRef(pickStrap);
  pickRef.current = pickStrap;
  const firstRef = useRef(options[0]);
  firstRef.current = options[0];
  useEffect(() => {
    if (!compact) return;
    return onAdded((d) => {
      if (d.kind !== "watch" || d.ref !== head.slug) return;
      setTab("all");
      setColour(null);
      setNear(true);
      // A beat, so the button has said "Added" before the page moves.
      setTimeout(() => {
        scrollToIdSurely("strap-studio");
        const first = firstRef.current;
        if (!first) return;
        pickRef.current(first);
        // Said outright: when the first strap was already the one selected,
        // nothing changes and the bar would otherwise never hear of it.
        emitStrap({
          id: first.id,
          name: first.name,
          price: first.price,
          chip: first.chip,
          soldOut: Boolean(first.soldOut),
          available: first.available ?? null,
          watch: head.name,
        });
      }, 160);
    });
  }, [compact, head.slug, head.name]);

  // Tells the product page's buy bar what is selected.
  useEffect(() => {
    if (!compact || !strap) return;
    emitStrap({
      id: strap.id,
      name: strap.name,
      price: strap.price,
      chip: strap.chip,
      soldOut: Boolean(strap.soldOut),
      available: strap.available ?? null,
      watch: head.name,
    });
  }, [compact, strap, head.name]);


  // Only offer a watch in the head rail if straps have been fitted to it.
  // The page only lists watches that have straps, so every one is offered.
  const heads = models ?? [];

  // ── Desktop pages ──────────────────────────────────────────────────────
  const PAGE = 20;
  const pages = useMemo(() => {
    const out: Opt[][] = [];
    for (let i = 0; i < visible.length; i += PAGE) out.push(visible.slice(i, i + PAGE));
    return out;
  }, [visible]);
  const pager = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const goPage = (i: number) => {
    const el = pager.current;
    if (!el) return;
    const to = Math.max(0, Math.min(pages.length - 1, i));
    el.scrollTo({ left: to * el.clientWidth, behavior: "smooth" });
    setPage(to);
  };
  const onPagerScroll = () => {
    const el = pager.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    setPage((cur) => (cur === i ? cur : i));
  };
  // A new filter starts on its first page.
  useEffect(() => {
    pager.current?.scrollTo({ left: 0 });
    setPage(0);
  }, [tab, colour, head.slug]);

  if (!strap) return null;

  /** Brings the watch back into view when it has scrolled off — on a phone. */
  const showPreview = () => revealElement(preview.current);

  const pictured = `On ${head.name}`;

  // One swatch, drawn the same in the phone rail and the desktop pages.
  const chip = (s: Opt) => {
    const active = s.id === strap.id;
    return (
      <button
        key={s.id}
        onClick={() => {
          pickStrap(s);
          showPreview();
        }}
        title={s.name}
        aria-label={s.name}
        aria-pressed={active}
        className={cx(
          "shimmer relative aspect-square w-full snap-start overflow-hidden rounded-xl border bg-surface transition-[border-color,transform] duration-200",
          active ? "border-gold ring-2 ring-gold/30" : "border-line hover:-translate-y-0.5 hover:border-mute-2",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.chip} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        {s.soldOut && <span aria-hidden className="absolute inset-0 bg-ink/60" />}
      </button>
    );
  };

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "all", label: "All", n: counts.all },
    { id: "rubber", label: "Rubber", n: counts.rubber },
    { id: "velcro", label: "Velcro", n: counts.velcro },
  ];

  return (
    <div
      ref={root}
      className={cx(
        "grid grid-cols-1 gap-8 lg:gap-12",
        compact
          ? "lg:grid-cols-[minmax(0,1fr)_23rem]"
          : "lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]",
      )}
    >
      {/* ── The stage: watch on top, a buy row along its foot ───────────── */}
      {/* On a desktop the stage stretches to the height of the picker beside
          it, the watch centred in it — the picker runs taller (pages of
          swatches, the pager), and a fixed-height stage left an empty block
          under it. */}
      <div className="min-w-0 lg:flex lg:flex-col">
        <div
          ref={preview}
          className="reveal-scale relative overflow-hidden rounded-3xl lg:flex lg:flex-1 lg:flex-col border border-line bevel bg-[radial-gradient(ellipse_at_50%_40%,#19191f_0%,#111115_55%,#0a0a0d_100%)]"
        >
          {/* The light behind the watch, taken from the strap and the dial.
              Each colour is its own layer that cross-fades into the next, so
              a change of strap or of watch melts from one tint to the other
              instead of snapping. Opacity only — nothing to repaint. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={`${head.slug}:${strap.color}`}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: stageLight(strap.color, head.palette?.dial, head.palette?.case) }}
            />
          </AnimatePresence>

          {/* Sized from its height, in svh so the phone's address bar sliding
              in and out does not resize it while you scroll. */}
          <div className="shimmer relative mx-auto aspect-[700/1195] h-[clamp(15rem,40svh,25rem)] max-w-full lg:my-auto lg:h-[clamp(22rem,52svh,32rem)]">
            <AnimatePresence initial={false}>
              <motion.div
                key={`${head.slug}:${strap.id}`}
                className="absolute inset-0"
                initial={restrap ? { opacity: 1 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={restrap ? { duration: 0 } : FADE}
              >
                {near && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={strap.image}
                    alt={`${head.name} with the ${strap.name} strap`}
                    decoding="async"
                    className={cx(
                      "h-full w-full object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.5)]",
                    )}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {restrap && (
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
                <Player
                  key={restrap.n}
                  ref={restrapPlayer}
                  component={Restrap}
                  inputProps={{ from: restrap.from, to: restrap.to }}
                  durationInFrames={RESTRAP.durationInFrames}
                  fps={RESTRAP.fps}
                  compositionWidth={RESTRAP.width}
                  compositionHeight={RESTRAP.height}
                  style={{ width: "100%", height: "100%" }}
                  autoPlay
                  controls={false}
                  clickToPlay={false}
                  doubleClickToFullscreen={false}
                  spaceKeyToPlayOrPause={false}
                  acknowledgeRemotionLicense
                  numberOfSharedAudioTags={0}
                />
              </div>
            )}
          </div>

          {/* The buy row: what you are looking at, what it costs, and the
              button, in one line along the foot of the stage — the way a
              configurator sums up a choice — instead of a full-width slab
              under it. */}
          <div className="relative flex items-center gap-3 border-t border-line/80 bg-ink/70 p-3 sm:gap-4 sm:p-4">
            <span className="shimmer relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={strap.chip} alt="" decoding="async" className="h-full w-full object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={strap.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <p className="truncate font-display text-[15px] font-semibold leading-tight">
                    {strap.name}
                  </p>
                  <p className="mt-1 truncate text-[12px] leading-tight text-mute-2">
                    <span className="font-display font-semibold tabular-nums text-gold-soft">
                      {usd(strap.price)}
                    </span>
                    <span className="px-1.5 text-line">|</span>
                    {pictured}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {commerce && (
              <AddToCart
                kind="strap"
                refId={strap.id}
                label={t.bagLabel}
                soldOut={strap.soldOut}
                soldOutLabel={t.soldOutLabel}
                max={strap.available}
                className="h-11 shrink-0 px-4 py-0 text-[13px] sm:px-5"
              />
            )}
          </div>
        </div>

        {t.note && <p className="mt-3 text-center text-[11px] text-mute-2">{t.note}</p>}

        {/* The watch rail sits under the watch: it is a choice about the
            stage, and beside the straps it pushed the swatches half a screen
            down on a desktop, leaving the column empty above them. */}
        {heads.length > 1 && (
          <div className="mt-7">
            <div className="flex items-baseline justify-between gap-3">
              <p className="eyebrow">{t.watchPickerLabel}</p>
              <p className="text-[11px] text-mute-2">{heads.length} watches</p>
            </div>

            <div
              className="no-bar mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
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
                    onClick={() => void pickHead(m)}
                    aria-pressed={active}
                    aria-busy={loading === m.slug}
                    title={m.name}
                    className={cx(
                      "shimmer flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl border px-1.5 py-2 transition-colors",
                      active ? "border-gold bg-gold/10" : "border-line hover:border-mute-2 hover:bg-surface/50",
                      loading === m.slug && "animate-pulse border-gold/60",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb(m.images.front)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-11 w-11 object-contain"
                    />
                    <span
                      className={cx(
                        "line-clamp-2 text-center text-[11px] leading-tight",
                        active ? "text-gold" : "text-mute",
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

      </div>

      {/* ── Picker ─────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <p className="eyebrow">{t.strapsLabel}</p>
          <p className="text-[11px] text-mute-2">
            {visible.length} of {options.length}
          </p>
        </div>

        {/* Filters: a segmented row for kind, then the colours on offer. */}
        <div role="tablist" aria-label="Filter straps" className="no-bar mt-3 flex gap-1.5 overflow-x-auto">
          {tabs
            .filter((x) => x.n > 0)
            .map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => setTab(x.id)}
                className={cx(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-medium transition-colors",
                  tab === x.id
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-mute hover:border-mute-2 hover:text-chalk",
                )}
              >
                {x.label}
                <span className="tabular-nums text-mute-2">{x.n}</span>
              </button>
            ))}
        </div>

        {colours.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter by colour">
            {colours.map((c) => {
              const on = colour === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setColour(on ? null : c.id)}
                  aria-pressed={on}
                  aria-label={c.label}
                  title={c.label}
                  className="group flex h-9 w-9 items-center justify-center"
                >
                  <span
                    className={cx(
                      "h-6 w-6 rounded-full border-2 transition-transform",
                      on ? "scale-110 border-gold" : "border-line group-hover:scale-105",
                    )}
                    style={{ background: c.swatch }}
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* On a phone a two-row rail you swipe sideways — a grid inside the
            page that scrolled on its own fought the page's scroll. */}
        <div className="no-bar mt-4 grid snap-x grid-flow-col grid-rows-[4.25rem_4.25rem] auto-cols-[4.25rem] gap-2.5 overflow-x-auto pb-1 lg:hidden">
          {visible.map((s) => chip(s))}
        </div>

        {/* On a desktop, pages of twenty — five by four — that you step
            through with the arrows or swipe sideways on a trackpad; each
            page snaps into place. A long scrolling box of seventy-eight
            swatches gave no sense of where you were in it. */}
        {visible.length > 0 && (
          <div className="mt-4 hidden lg:block">
            <div
              ref={pager}
              onScroll={onPagerScroll}
              className="no-bar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth"
            >
              {pages.map((group, i) => (
                <div
                  key={i}
                  className="grid w-full shrink-0 snap-start snap-always grid-cols-5 content-start gap-2.5"
                  aria-hidden={i !== page}
                  inert={i !== page}
                >
                  {group.map((s) => chip(s))}
                </div>
              ))}
            </div>

            {pages.length > 1 && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goPage(page - 1)}
                  disabled={page === 0}
                  aria-label="Previous straps"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30"
                >
                  ←
                </button>
                <div className="flex items-center gap-1.5" aria-label={`Page ${page + 1} of ${pages.length}`}>
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goPage(i)}
                      aria-label={`Page ${i + 1}`}
                      aria-current={i === page}
                      className="flex h-6 items-center px-0.5"
                    >
                      <span
                        className={cx(
                          "block h-1.5 rounded-full transition-all duration-300",
                          i === page ? "w-6 bg-gold" : "w-1.5 bg-line hover:bg-mute-2",
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-display text-[11px] tabular-nums text-mute-2">
                    {page + 1} / {pages.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => goPage(page + 1)}
                  disabled={page >= pages.length - 1}
                  aria-label="More straps"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-mute transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}

        {visible.length === 0 ? (
          <p className="mt-4 text-[12px] text-mute">
            No strap matches.{" "}
            <button
              onClick={() => {
                setTab("all");
                setColour(null);
              }}
              className="underline underline-offset-4 hover:text-chalk"
            >
              Show all
            </button>
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-mute-2">
            Every strap shown on {head.shortName} — tap one to try it on.
          </p>
        )}
      </div>
    </div>
  );
}
