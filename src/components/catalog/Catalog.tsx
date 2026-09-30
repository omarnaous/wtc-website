"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { COLOR_GROUPS, FAMILIES, FAMILY_LABEL, AVAILABILITY_LABEL, products as ALL } from "@/data/products";
import { collections as COLLECTIONS } from "@/data/collections";
import type {
  Availability,
  CollectionId,
  ColorGroup,
  Family,
  Product,
} from "@/data/types";
import { EMPTY, SORTS, activeCount, apply, type FilterState, type Sort } from "@/lib/filters";
import { cx, usd } from "@/lib/format";

const PRICE_STOPS = [500, 700, 950] as const;
const AVAILABILITIES: Availability[] = ["in-stock", "low-stock", "pre-order"];

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "rounded-full border px-3.5 py-2 text-[12px] font-medium transition-colors",
        active
          ? "border-gold bg-gold/10 text-gold"
          : "border-line text-mute hover:border-mute-2 hover:text-chalk"
      )}
    >
      {children}
    </button>
  );
}

export interface CatalogCopy {
  searchPlaceholder: string;
  emptyMessage: string;
  emptyCopy: string;
  clearLabel: string;
}

/** Matches the defaults declared in src/lib/content/schema.ts. */
const COPY: CatalogCopy = {
  searchPlaceholder: "Search a mission or reference…",
  emptyMessage: "Nothing matches that yet",
  emptyCopy:
    "Loosen a filter, or message us — we source references to order and can usually find one within a week.",
  clearLabel: "Clear filters",
};

export default function Catalog({
  products = ALL,
  collections = COLLECTIONS,
  copy,
  initialFamily,
  initialCollection,
  limit,
}: {
  products?: Product[];
  /** Filter chips. Comes from the shop so a new house appears here too. */
  collections?: { id: string; name: string }[];
  /** Sections → Catalogue page. */
  copy?: Partial<CatalogCopy>;
  initialFamily?: Family;
  initialCollection?: CollectionId;
  limit?: number;
}) {
  const t = { ...COPY, ...copy };
  const [f, setF] = useState<FilterState>({
    ...EMPTY,
    collections: initialCollection ? [initialCollection] : [],
    families: initialFamily ? [initialFamily] : [],
  });
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const r = apply(products, f);
    return limit ? r.slice(0, limit) : r;
  }, [products, f, limit]);

  const n = activeCount(f);

  return (
    <div>
      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[13rem] flex-1">
          <input
            value={f.query}
            onChange={(e) => setF({ ...f, query: e.target.value })}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-full border border-line bg-surface/60 px-5 py-2.5 text-sm text-chalk placeholder:text-mute-2 focus:border-mute-2 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={cx(
            "rounded-full border px-4 py-2.5 text-[12px] font-medium transition-colors",
            n ? "border-gold text-gold" : "border-line text-mute hover:text-chalk"
          )}
          aria-expanded={open}
        >
          Filters{n ? ` · ${n}` : ""}
        </button>

        <label className="sr-only" htmlFor="sort">
          Sort
        </label>
        <select
          id="sort"
          value={f.sort}
          onChange={(e) => setF({ ...f, sort: e.target.value as Sort })}
          className="rounded-full border border-line bg-surface/60 px-4 py-2.5 text-[12px] text-chalk focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id} className="bg-surface">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 grid gap-6 rounded-2xl border border-line bg-surface/40 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="eyebrow">Collection</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {collections.map((c) => (
                    <Chip
                      key={c.id}
                      active={f.collections.includes(c.id as CollectionId)}
                      onClick={() =>
                        setF({ ...f, collections: toggle(f.collections, c.id as CollectionId) })
                      }
                    >
                      {c.name}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Series</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FAMILIES.map((fam) => (
                    <Chip
                      key={fam}
                      active={f.families.includes(fam)}
                      onClick={() => setF({ ...f, families: toggle(f.families, fam) })}
                    >
                      {FAMILY_LABEL[fam]}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Colour</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {COLOR_GROUPS.map((c) => {
                    const active = f.colors.includes(c.id as ColorGroup);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setF({ ...f, colors: toggle(f.colors, c.id) })}
                        aria-pressed={active}
                        title={c.label}
                        aria-label={c.label}
                        className={cx(
                          "h-7 w-7 rounded-full border-2 transition-transform",
                          active ? "border-gold scale-110" : "border-line hover:scale-105"
                        )}
                        style={{ background: c.swatch }}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="eyebrow">Availability</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AVAILABILITIES.map((a) => (
                    <Chip
                      key={a}
                      active={f.availability.includes(a)}
                      onClick={() => setF({ ...f, availability: toggle(f.availability, a) })}
                    >
                      {AVAILABILITY_LABEL[a]}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow">Budget</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRICE_STOPS.map((p) => (
                    <Chip
                      key={p}
                      active={f.maxPrice === p}
                      onClick={() => setF({ ...f, maxPrice: f.maxPrice === p ? Infinity : p })}
                    >
                      Under {usd(p)}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <button
                  onClick={() => setF({ ...EMPTY })}
                  className="text-[12px] text-mute underline underline-offset-4 hover:text-chalk"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-[12px] text-mute-2">
        {results.length} {results.length === 1 ? "reference" : "references"}
      </p>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      {results.length ? (
        <motion.div
          layout
          className="mt-5 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {results.map((p, i) => (
              <motion.div
                key={p.slug}
                layout="position"
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={p} priority={i < 4} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-line p-12 text-center">
          <p className="font-display text-lg font-semibold">{t.emptyMessage}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-mute">{t.emptyCopy}</p>
          <button
            onClick={() => setF({ ...EMPTY })}
            className="mt-6 rounded-full border border-line px-5 py-2.5 text-[12px] text-chalk hover:border-gold hover:text-gold"
          >
            {t.clearLabel}
          </button>
        </div>
      )}
    </div>
  );
}
