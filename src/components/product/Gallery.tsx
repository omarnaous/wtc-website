"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/data/types";
import { cx } from "@/lib/format";

export default function Gallery({ product }: { product: Product }) {
  const views = [
    { id: "front", src: product.images.front, label: "Front" },
    { id: "angle", src: product.images.angle, label: "Angle" },
    { id: "side", src: product.images.side, label: "Profile" },
  ];
  const [active, setActive] = useState(0);

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
            key={views[active].id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={views[active].src}
              alt={`${product.name} — ${views[active].label}`}
              fill
              priority
              sizes="(max-width: 1024px) 92vw, 46vw"
              className="object-contain p-8"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex gap-3">
        {views.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setActive(i)}
            aria-label={v.label}
            aria-pressed={i === active}
            className={cx(
              "relative aspect-square w-20 overflow-hidden rounded-xl border transition-colors",
              i === active ? "border-gold" : "border-line hover:border-mute-2"
            )}
            style={{ background: "#121216" }}
          >
            <Image src={v.src} alt="" fill sizes="80px" className="object-contain p-1.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
