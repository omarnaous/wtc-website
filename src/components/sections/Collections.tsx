"use client";

import Image from "next/image";
import Link from "next/link";
import type { AdminCollection } from "@/lib/store/collections";
import { thumb } from "@/lib/thumb";
import ScrollList from "@/components/motion/ScrollList";

export interface CollectionTile extends AdminCollection {
  /** Resolved here rather than in the tile so the client gets one flat prop. */
  heroImage?: string;
}

/**
 * The top of the catalogue: one tile per brand partnership. Opening a tile
 * hands the catalogue a ?collection= filter rather than showing a product
 * grid here, so adding a house later is a data change, not a layout change.
 */
export default function Collections({
  collections,
  whatsapp,
  comingSoonLabel,
  countLabel,
  upcomingMessage,
}: {
  collections: CollectionTile[];
  whatsapp: string;
  /** Shared wording; a collection may override the badge with its own. */
  comingSoonLabel: string;
  countLabel: string;
  upcomingMessage: string;
}) {
  return (
    <ScrollList className="grid gap-5 sm:grid-cols-2">
      {collections.map((c) => {
        const count = c.count ?? 0;
        // "auto" is the old rule — empty means not open yet. The other two say
        // so outright, for a collection that is stocked but not launched, or
        // one that is empty on purpose and should still open.
        const upcoming =
          c.state === "upcoming" ? true : c.state === "open" ? false : count === 0;
        const hero = c.heroImage && thumb(c.heroImage);

        const inner = (
          <>
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.16] transition-opacity duration-700 group-hover:opacity-30"
              style={{
                background: `radial-gradient(circle at 78% 42%, ${c.accent} 0%, transparent 62%)`,
              }}
            />

            {hero ? (
              <Image
                src={hero}
                alt=""
                width={320}
                height={320}
                className="drift pointer-events-none absolute -right-6 top-1/2 w-44 -translate-y-1/2 object-contain transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[54%] group-hover:scale-105 sm:w-52"
              />
            ) : (
              c.monogram && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-display text-[5.5rem] font-bold leading-none text-white/[0.06]"
                >
                  {c.monogram}
                </span>
              )
            )}

            <div className="relative max-w-[62%]">
              <h3 className="font-display text-[clamp(1.35rem,2.6vw,1.9rem)] font-bold tracking-[-0.02em]">
                {c.name}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-mute">{c.blurb}</p>

              <p className="mt-6 inline-flex items-center gap-2 text-[12px] font-medium text-chalk">
                {upcoming ? (
                  <span className="rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-mute">
                    {c.badge || comingSoonLabel}
                  </span>
                ) : (
                  <>
                    <span>{countLabel.replace("{n}", String(count))}</span>
                    <span
                      aria-hidden
                      className="transition-transform duration-500 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </>
                )}
              </p>
            </div>
          </>
        );

        const className =
          "group relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-3xl border border-line bevel bg-[radial-gradient(ellipse_at_20%_20%,#17171c_0%,#111114_60%,#0c0c0f_100%)] p-7 transition-colors hover:border-mute-2";

        return (
          <div key={c.id}>
            {upcoming ? (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  upcomingMessage.replace("{collection}", c.name)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            ) : (
              <Link prefetch={false} href={`/products?collection=${c.id}`} className={className}>
                {inner}
              </Link>
            )}
          </div>
        );
      })}
    </ScrollList>
  );
}
