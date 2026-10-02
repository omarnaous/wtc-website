"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import Badge from "./Badge";
import type { Product } from "@/data/types";
import { usd } from "@/lib/format";
import { thumb } from "@/lib/thumb";

/**
 * Under a mouse, the photograph's box tilts toward the pointer and a soft
 * light follows it across, like turning a watch in the hand. Written straight
 * to the element's style once a frame — no React render per mouse move — and
 * only where there is a real pointer to follow: on touch it never runs.
 */
function useTilt() {
  const box = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const fine = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;

  const onPointerMove = (e: React.PointerEvent) => {
    const el = box.current;
    if (!el || e.pointerType !== "mouse" || !fine()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transition = "transform 120ms ease-out";
      el.style.transform = `perspective(700px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg)`;
      el.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty("--sheen", "1");
    });
  };
  const onPointerLeave = () => {
    const el = box.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transition = "transform 600ms cubic-bezier(0.16,1,0.3,1)";
    el.style.transform = "";
    el.style.setProperty("--sheen", "0");
  };
  return { box, onPointerMove, onPointerLeave };
}

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const tilt = useTilt();
  const router = useRouter();
  const href = `/products/${product.slug}`;
  // Not fetched just for being on screen — a catalogue of thirty cards was
  // thirty product pages downloading in the background while you scrolled.
  // A finger landing on it or a pointer resting over it is enough notice.
  const warm = () => router.prefetch(href);
  return (
    // Visible as served. Where it sits in a ScrollList, the list moves it
    // with the scroll; the card itself only answers the pointer.
    <article className="group relative">
      <Link
        href={href}
        prefetch={false}
        onPointerEnter={warm}
        onTouchStart={warm}
        className="block"
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
      >
        <div
          ref={tilt.box}
          className="relative aspect-square overflow-hidden rounded-2xl border border-line bevel transition-[border-color] duration-300 group-hover:border-mute-2 active:scale-[0.98]"
          style={{
            background: `radial-gradient(circle at 50% 38%, ${product.palette.case}22 0%, #121215 62%, #0d0d10 100%)`,
          }}
        >
          <Image
            src={thumb(product.images.front)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            /* The card holds one photograph. Fading a second one in under the
               cursor swapped the dial for whatever the second shot happened to
               be — usually the caseback, which is not what anyone is shopping
               for. The lift alone is enough of a response. */
            className="object-contain p-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />
          {/* The light that follows the pointer. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[var(--sheen,0)] transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle at var(--mx,50%) var(--my,30%), rgba(255,255,255,0.10) 0%, rgba(226,196,105,0.06) 25%, transparent 55%)",
            }}
          />
          {/* Above the photograph, which gets its own layer when it scales on
              hover and was painting over the badge. */}
          <div className="absolute left-3 top-3 z-10">
            <Badge availability={product.availability} />
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Two lines, not one: "Mission to the Moon…" cut at the point
                that tells the Moon from the Moonphase from the 1969. */}
            <h3 className="line-clamp-2 min-h-[2.5em] font-display text-[15px] font-semibold leading-[1.25] tracking-tight text-chalk">
              {product.name}
            </h3>
            <p className="mt-1 truncate text-[12px] text-mute-2">
              {product.sku} · {product.colorway}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-[15px] font-semibold text-chalk">{usd(product.price)}</p>
            {product.compareAt && (
              <p className="text-[11px] text-mute-2 line-through">{usd(product.compareAt)}</p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
