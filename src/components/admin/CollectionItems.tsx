"use client";

import { useState } from "react";
import { useNotifyForm } from "./use-notify-form";
import { Label, cx } from "./ui";
import { thumb } from "@/lib/thumb";

export interface CollectionItem {
  slug: string;
  name: string;
  sku: string;
  image: string;
}

/**
 * The watches in one collection, in the order the shop shows them.
 *
 * Order used to be a number typed into each watch one at a time — you had to
 * hold the whole sequence in your head to change one thing in it. Here the
 * list is the order: move a row and that is the order, on the collection's
 * page of the shop, the moment you save.
 *
 * Removing takes the watch out of this collection. It does not delete it — the
 * watch stays in the catalogue, unfiled, and can be put into a collection
 * again from here or from the Watches list. Deleting a watch outright is on
 * the watch's own page, behind a confirmation, because orders may reference it.
 */
export default function CollectionItems({
  name = "items",
  items: initial,
}: {
  name?: string;
  items: CollectionItem[];
}) {
  const [items, setItems] = useState(initial);
  const anchor = useNotifyForm(items.map((i) => i.slug).join(","));

  const move = (from: number, to: number) =>
    setItems((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });

  const remove = (slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug));
  const removed = initial.length - items.length;

  return (
    <div>
      <Label help="Drawn in this order on the collection's page. Removing a watch leaves it in the catalogue, unfiled.">
        Watches in this collection
      </Label>

      <input ref={anchor} type="hidden" name={name} value={items.map((i) => i.slug).join(",")} />

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--admin-line)] px-4 py-5 text-center text-[13px] text-[var(--admin-mute)]">
          Nothing in it yet. File watches into it from the Watches list, or from a watch's own page.
        </p>
      ) : (
        <ol className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
          {items.map((it, i) => (
            <li
              key={it.slug}
              className="flex items-center gap-2.5 rounded-lg border border-[var(--admin-line)] bg-white p-2"
            >
              <span className="tnum w-5 shrink-0 text-center text-[11.5px] text-[var(--admin-mute-2)]">
                {i + 1}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--admin-line)] bg-[var(--admin-line-soft)]">
                {it.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(it.image)} alt="" className="h-full w-full object-contain p-0.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{it.name}</span>
                <span className="block truncate text-[11.5px] text-[var(--admin-mute-2)]">
                  {it.sku}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Move ${it.name} up`}
                  className="rounded-md px-1.5 py-1 text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Move ${it.name} down`}
                  className="rounded-md px-1.5 py-1 text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(it.slug)}
                  aria-label={`Take ${it.name} out of this collection`}
                  className="rounded-md px-1.5 py-1 text-[var(--admin-mute-2)] hover:bg-red-50 hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      {removed > 0 && (
        <p className={cx("mt-2 text-[12px] text-amber-700")}>
          {removed} watch{removed === 1 ? "" : "es"} will be taken out of this collection on save.
          They stay in the catalogue.
        </p>
      )}
    </div>
  );
}
