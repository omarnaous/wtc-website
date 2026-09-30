"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button, INPUT, Label, cx } from "./ui";
import { useNotifyForm } from "./use-notify-form";
import { thumb } from "@/lib/thumb";

/** One watch as the picker needs it. Kept flat so no store reaches the browser. */
export interface PickerProduct {
  slug: string;
  name: string;
  shortName: string;
  image: string;
  /** Draft and archived watches are still pickable, but say so. */
  status?: string;
}

/**
 * Picks watches from the catalogue, in order.
 *
 * Replaces a list of free-typed slugs. A slug is not something anyone should
 * have to remember or spell, and a typo in one was silently dropped from the
 * film with nothing to say why — this shows the actual photographs, so the
 * order on screen is the order on the site.
 *
 * Order is the point rather than a detail: the first watch is the one the
 * film holds in the centre, so it is drawn as the featured slot and every
 * other row can be promoted into it in one click.
 *
 * Submits as one hidden field of comma-separated slugs; see parseFields.
 */
export default function ProductPicker({
  name,
  label,
  help,
  value,
  products,
  max,
  featuredNote = "Held in the centre of the film",
}: {
  name: string;
  label: string;
  help?: string;
  /** Slugs, in order. */
  value: string[];
  products: PickerProduct[];
  max?: number;
  featuredNote?: string;
}) {
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  // Anything stored that is no longer in the catalogue is dropped here rather
  // than drawn as a blank row — it would only be saved straight back.
  const [chosen, setChosen] = useState<string[]>(() => value.filter((s) => bySlug.has(s)));
  const [query, setQuery] = useState("");

  const full = max != null && chosen.length >= max;

  // Every edit here is a button, not a keystroke, so the form is told by hand.
  const anchor = useNotifyForm(chosen.join(","));

  const move = (from: number, to: number) =>
    setChosen((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });

  const remove = (slug: string) => setChosen((prev) => prev.filter((s) => s !== slug));
  const add = (slug: string) =>
    setChosen((prev) => (prev.includes(slug) || full ? prev : [...prev, slug]));

  const q = query.trim().toLowerCase();
  const library = products.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.slug.includes(q),
  );

  return (
    <div>
      <Label help={help}>{label}</Label>
      <input ref={anchor} type="hidden" name={name} value={chosen.join(",")} />

      {/* ── Chosen, in order ──────────────────────────────────────────────── */}
      {chosen.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--admin-line)] px-4 py-6 text-center text-[13px] text-[var(--admin-mute)]">
          No watches picked yet. Choose them below — the first one you pick is the featured watch.
        </p>
      ) : (
        <ol className="space-y-2">
          {chosen.map((slug, i) => {
            const p = bySlug.get(slug);
            if (!p) return null;
            const featured = i === 0;
            return (
              <li
                key={slug}
                className={cx(
                  "flex items-center gap-3 rounded-lg border bg-white p-2.5",
                  featured
                    ? "border-[var(--admin-gold)] ring-1 ring-[var(--admin-gold)]/20"
                    : "border-[var(--admin-line)]",
                )}
              >
                <span className="tnum w-5 shrink-0 text-center text-[12px] text-[var(--admin-mute-2)]">
                  {i + 1}
                </span>

                <span className="relative block h-10 w-10 shrink-0">
                  <Image src={thumb(p.image)} alt="" fill sizes="40px" className="object-contain" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                  <span className="mt-0.5 block text-[11.5px] text-[var(--admin-mute-2)]">
                    {featured ? (
                      <span className="font-medium text-[var(--admin-gold)]">
                        Featured · {featuredNote}
                      </span>
                    ) : (
                      p.slug
                    )}
                    {p.status && p.status !== "active" && ` · ${p.status}`}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-1">
                  {!featured && (
                    <button
                      type="button"
                      onClick={() => move(i, 0)}
                      title="Make this the featured watch"
                      className="rounded-md px-2 py-1 text-[11.5px] text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] hover:text-[var(--admin-text)]"
                    >
                      Make featured
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label={`Move ${p.name} up`}
                    className="rounded-md px-2 py-1 text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === chosen.length - 1}
                    aria-label={`Move ${p.name} down`}
                    className="rounded-md px-2 py-1 text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(slug)}
                    aria-label={`Remove ${p.name}`}
                    className="rounded-md px-2 py-1 text-[var(--admin-mute-2)] hover:bg-red-50 hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* ── The catalogue ─────────────────────────────────────────────────── */}
      <div className="mt-4 rounded-lg border border-[var(--admin-line)] bg-[var(--admin-line-soft)]/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-[var(--admin-mute)]">
            Add from the catalogue
          </p>
          <p className="text-[11.5px] text-[var(--admin-mute-2)]">
            {chosen.length}
            {max ? ` of ${max}` : ""} picked
          </p>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search watches"
          className={cx(INPUT, "mt-2 !py-1.5 !text-[13px]")}
        />

        <div className="mt-3 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5 lg:grid-cols-6">
          {library.map((p) => {
            const picked = chosen.includes(p.slug);
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => (picked ? remove(p.slug) : add(p.slug))}
                disabled={!picked && full}
                title={picked ? `Remove ${p.name}` : `Add ${p.name}`}
                aria-pressed={picked}
                className={cx(
                  "flex flex-col items-center gap-1 rounded-lg border bg-white px-1.5 py-2 transition-colors",
                  picked
                    ? "border-[var(--admin-gold)] bg-[var(--admin-gold)]/5"
                    : "border-[var(--admin-line)] hover:border-[var(--admin-mute-2)]",
                  !picked && full && "cursor-not-allowed opacity-40",
                )}
              >
                <span className="relative block h-10 w-10">
                  <Image src={thumb(p.image)} alt="" fill sizes="40px" className="object-contain" />
                </span>
                <span className="line-clamp-2 text-center text-[10.5px] leading-tight text-[var(--admin-mute)]">
                  {p.shortName || p.name}
                </span>
              </button>
            );
          })}
        </div>

        {library.length === 0 && (
          <p className="py-4 text-center text-[12.5px] text-[var(--admin-mute-2)]">
            Nothing matches “{query}”.
          </p>
        )}

        {full && (
          <p className="mt-2 text-[11.5px] text-[var(--admin-mute-2)]">
            That is the maximum of {max}. Remove one to swap another in.
          </p>
        )}

        {chosen.length > 0 && (
          <Button
            type="button"
            onClick={() => setChosen([])}
            className="mt-3 !py-1.5 !text-[12px]"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
