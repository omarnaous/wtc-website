"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/data/types";
import { cx } from "@/lib/format";

export default function Gallery({ product }: { product: Product }) {
  // However many photographs this watch has — one or five. The old three named
  // views meant a watch shot once showed the same picture three times.
  const views =
    product.photos?.length
      ? product.photos
      : [...new Set([product.images.front, product.images.angle, product.images.side])].filter(
          Boolean,
        );
  const [active, setActive] = useState(0);

  if (!views.length) return null;

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-3xl border border-line bevel"
        style={{
          background: `radial-gradient(circle at 50% 34%, ${product.palette.case}2b 0%, #131317 58%, #0b0b0e 100%)`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={views[active]}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={views[active]}
              alt={`${product.name} — photograph ${active + 1} of ${views.length}`}
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="object-contain p-8"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {views.length > 1 && (
        <div className="no-bar mt-4 flex gap-3 overflow-x-auto pb-1">
          {views.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Photograph ${i + 1}`}
              aria-pressed={i === active}
              className={cx(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border transition-colors",
                i === active ? "border-gold" : "border-line hover:border-mute-2"
              )}
              style={{ background: "#121216" }}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
