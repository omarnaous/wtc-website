"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import WatchSvg from "./WatchSvg";
import { straps, strapsFor } from "@/data/straps";
import type { Product, Strap } from "@/data/types";
import { cx, usd } from "@/lib/format";

type Filter = "all" | "velcro" | "rubber";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All straps" },
  { id: "velcro", label: "VELCRO®" },
  { id: "rubber", label: "Rubber" },
];

export default function StrapStudio({
  product,
  models,
  compact = false,
}: {
  product: Product;
  /** When provided, the studio also lets you swap the watch head. */
  models?: Product[];
  compact?: boolean;
}) {
  const [head, setHead] = useState(product);
  const [filter, setFilter] = useState<Filter>("all");
  const [strap, setStrap] = useState<Strap>(
    () => strapsFor(product.stockStrapSku)[0] ?? straps[0]
  );
  const [pulse, setPulse] = useState(0);
  const controls = useAnimationControls();

  // Changing the head resets to that model's own Velcro strap.
  useEffect(() => {
    setStrap(strapsFor(head.stockStrapSku)[0] ?? straps[0]);
  }, [head]);

  // A short recoil on every swap sells the weight of the watch.
  useEffect(() => {
    controls.start({
      scale: [1, 0.972, 1.008, 1],
      transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] },
    });
    setPulse((p) => p + 1);
  }, [strap.sku, controls]);

  const visible = useMemo(
    () => (filter === "all" ? straps : straps.filter((s) => s.type === filter)),
    [filter]
  );

  const isStock = strap.sku === head.stockStrapSku;

  return (
    <div
      className={cx(
        // minmax(0, …) everywhere: an `auto` track would size to the
        // max-content width of the nowrap strap name and blow out the page.
        "grid grid-cols-1 gap-8 lg:gap-12",
        compact
          ? "lg:grid-cols-[minmax(0,1fr)_20rem]"
          : "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      )}
    >
      {/* ── Stage ──────────────────────────────────────────────────────── */}
      <div className="relative min-w-0 overflow-hidden rounded-3xl border border-line bevel bg-[radial-gradient(ellipse_at_50%_28%,#1b1b21_0%,#121216_55%,#0b0b0e_100%)]">
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[38%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
          animate={{ backgroundColor: strap.primary, opacity: 0.32 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Shockwave on swap */}
        <AnimatePresence>
          <motion.div
            key={pulse}
            aria-hidden
            className="absolute left-1/2 top-[38%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: strap.primary }}
            initial={{ scale: 0.6, opacity: 0.55 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </AnimatePresence>

        <motion.div animate={controls} className="relative mx-auto w-[min(76%,22rem)] py-10">
          <WatchSvg
            palette={head.palette}
            strap={strap}
            family={head.family}
            className="w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
          />
        </motion.div>

        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={strap.sku}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="min-w-0"
            >
              <p className="truncate font-display text-sm font-semibold">{strap.name}</p>
              <p className="mt-0.5 text-[11px] text-mute-2">
                {strap.sku} · {strap.colorway}
              </p>
            </motion.div>
          </AnimatePresence>
          <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[11px] text-mute">
            {isStock ? "Strap as supplied" : `+ ${usd(strap.price)}`}
          </span>
        </div>
      </div>

      {/* ── Picker ─────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-col">
        {models && models.length > 1 && (
          <div className="mb-7">
            <p className="eyebrow">Watch head</p>
            <div className="no-bar mt-3 flex gap-2 overflow-x-auto pb-1">
              {models.map((m) => (
                <button
                  key={m.slug}
                  onClick={() => setHead(m)}
                  className={cx(
                    "shrink-0 rounded-full border px-3.5 py-2 text-[12px] transition-colors",
                    m.slug === head.slug
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-line text-mute hover:border-mute-2 hover:text-chalk"
                  )}
                >
                  {m.shortName}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Strap</p>
          <div className="flex gap-1 rounded-full border border-line p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cx(
                  "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors",
                  filter === f.id ? "bg-chalk text-ink" : "text-mute hover:text-chalk"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="no-bar mt-5 grid max-h-[22rem] grid-cols-6 items-start gap-2.5 overflow-y-auto pr-1 sm:grid-cols-8 lg:grid-cols-6">
          {visible.map((s) => {
            const active = s.sku === strap.sku;
            return (
              <button
                key={s.sku}
                onClick={() => setStrap(s)}
                title={`${s.name} — ${s.colorway}`}
                aria-label={s.name}
                aria-pressed={active}
                className={cx(
                  "group relative aspect-square overflow-hidden rounded-xl border transition-all duration-300",
                  active
                    ? "border-gold ring-2 ring-gold/30"
                    : "border-line hover:border-mute-2 hover:-translate-y-0.5"
                )}
              >
                <span className="absolute inset-0" style={{ background: s.primary }} />
                <span
                  className="absolute inset-x-0 bottom-0 h-1/3"
                  style={{ background: s.secondary }}
                />
                {s.type === "velcro" && (
                  <span className="absolute inset-x-1.5 top-1.5 h-1.5 rounded-full bg-black/20" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-7 rounded-2xl border border-line bg-surface/60 p-5">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold">{head.name}</p>
              <p className="mt-1 text-[12px] text-mute-2">
                on {strap.name}
              </p>
            </div>
            <p className="font-display text-lg font-semibold">
              {usd(head.price + (isStock ? 0 : strap.price))}
            </p>
          </div>

          <button
            type="button"
            className="mt-5 w-full rounded-full bg-chalk py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-85"
          >
            Add to bag
          </button>
          <p className="mt-3 text-center text-[11px] text-mute-2">
            Checkout opens when the store goes live — message us to reserve.
          </p>
        </div>
      </div>
    </div>
  );
}
