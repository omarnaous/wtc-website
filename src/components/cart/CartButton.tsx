"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import type { ResolvedCart } from "@/lib/cart/types";
import { cx, usd } from "@/lib/format";

/**
 * The bag, and the panel behind it.
 *
 * The panel asks the server to price the cart every time it opens, so what it
 * shows is the catalogue's current price and stock rather than whatever was
 * true when the item was added.
 */
export default function CartButton() {
  const { lines, count, ready, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<ResolvedCart | null>(null);
  const [loading, setLoading] = useState(false);

  const resolve = useCallback(async () => {
    if (!lines.length) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      setCart(res.ok ? ((await res.json()) as ResolvedCart) : null);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [lines]);

  useEffect(() => {
    if (open) void resolve();
  }, [open, resolve]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    // Stop the page behind the panel from scrolling with it.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={count ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag, empty"}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-chalk transition-colors hover:border-gold hover:text-gold"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
          <path
            d="M6 8h12l-1 12H7L6 8Zm3 0V6a3 3 0 0 1 6 0v2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {ready && count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-ink">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              role="dialog"
              aria-label="Your bag"
              className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-[420px] flex-col border-l border-line bg-ink-2"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-display text-sm font-semibold tracking-tight">
                  Your bag{count > 0 && <span className="text-mute"> · {count}</span>}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close bag"
                  className="rounded-full p-1.5 text-mute transition-colors hover:text-chalk"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" fill="none">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {!lines.length ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <p className="font-display text-sm font-semibold">Nothing in here yet</p>
                    <p className="mt-2 max-w-[24ch] text-[13px] leading-relaxed text-mute">
                      Every piece is checked in hand before it ships.
                    </p>
                    <Link
                      href="/products"
                      onClick={() => setOpen(false)}
                      className="mt-6 rounded-full border border-line px-5 py-2.5 text-[12px] text-chalk transition-colors hover:border-gold hover:text-gold"
                    >
                      Browse the catalogue
                    </Link>
                  </div>
                ) : loading && !cart ? (
                  <p className="py-10 text-center text-[13px] text-mute">Checking stock…</p>
                ) : (
                  <ul className="space-y-4">
                    {(cart?.lines ?? []).map((l) => (
                      <li key={`${l.kind}:${l.ref}`} className="flex gap-3">
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-line bg-surface"
                        >
                          {l.image && (
                            <Image
                              src={l.image}
                              alt=""
                              fill
                              sizes="72px"
                              className="object-contain p-1.5"
                            />
                          )}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={l.href}
                              onClick={() => setOpen(false)}
                              className="truncate text-[13px] font-medium hover:text-gold"
                            >
                              {l.name}
                            </Link>
                            <button
                              onClick={() => remove(l.kind, l.ref)}
                              aria-label={`Remove ${l.name}`}
                              className="shrink-0 text-mute-2 transition-colors hover:text-chalk"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" fill="none">
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {l.problem && (
                            <p className="mt-0.5 text-[11px] text-red-400">{l.problem}</p>
                          )}

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center rounded-full border border-line">
                              <button
                                onClick={() => setQty(l.kind, l.ref, l.qty - 1)}
                                aria-label={`One fewer ${l.name}`}
                                className="px-2.5 py-1 text-mute transition-colors hover:text-chalk"
                              >
                                −
                              </button>
                              <span className="min-w-[1.5rem] text-center text-[12px]">{l.qty}</span>
                              <button
                                onClick={() => setQty(l.kind, l.ref, l.qty + 1)}
                                disabled={l.available !== null && l.qty >= l.available}
                                aria-label={`One more ${l.name}`}
                                className="px-2.5 py-1 text-mute transition-colors hover:text-chalk disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[13px] font-medium">{usd(l.price * l.qty)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {lines.length > 0 && (
                <footer className="border-t border-line px-5 py-4">
                  {cart && (
                    <>
                      <div className="flex items-baseline justify-between text-[13px]">
                        <span className="text-mute">Subtotal</span>
                        <span className="font-medium">{usd(cart.totals.subtotal)}</span>
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between text-[13px]">
                        <span className="text-mute">Delivery</span>
                        <span className="font-medium">
                          {cart.totals.delivery === 0 ? "Free" : usd(cart.totals.delivery)}
                        </span>
                      </div>
                      {cart.totals.freeDeliveryAt !== null && (
                        <p className="mt-2 text-[11px] text-mute-2">
                          {usd(cart.totals.freeDeliveryAt)} more for free delivery.
                        </p>
                      )}
                      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                        <span className="text-sm">Total</span>
                        <span className="font-display text-lg font-semibold">
                          {usd(cart.totals.total)}
                        </span>
                      </div>
                    </>
                  )}

                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className={cx(
                      "mt-4 block rounded-full bg-chalk py-3 text-center text-sm font-semibold text-ink transition-opacity hover:opacity-85",
                      cart && cart.totals.items === 0 && "pointer-events-none opacity-40",
                    )}
                  >
                    Checkout
                  </Link>
                  <p className="mt-3 text-center text-[11px] text-mute-2">
                    Cash on delivery across Lebanon.
                  </p>
                </footer>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
