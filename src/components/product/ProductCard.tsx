"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "./Badge";
import type { Product } from "@/data/types";
import { usd } from "@/lib/format";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className="relative aspect-square overflow-hidden rounded-2xl border border-line bevel"
          style={{
            background: `radial-gradient(circle at 50% 38%, ${product.palette.case}22 0%, #121215 62%, #0d0d10 100%)`,
          }}
        >
          <Image
            src={product.images.front}
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
          <div className="absolute left-3 top-3">
            <Badge availability={product.availability} />
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[15px] font-semibold tracking-tight text-chalk">
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
    </motion.article>
  );
}
