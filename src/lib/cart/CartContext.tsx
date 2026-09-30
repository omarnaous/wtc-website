"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MAX_QTY, parseLines, sameLine, type CartLine, type LineKind } from "./types";

/**
 * The cart lives in localStorage and holds references only — see types.ts for
 * why. It also syncs across tabs, because a customer who adds a watch in one
 * tab and checks out in another should not lose it.
 */

const KEY = "wtc.cart.v1";

interface CartApi {
  lines: CartLine[];
  count: number;
  /** False until localStorage has been read, so the badge does not flash. */
  ready: boolean;
  add: (kind: LineKind, ref: string, qty?: number) => void;
  setQty: (kind: LineKind, ref: string, qty: number) => void;
  remove: (kind: LineKind, ref: string) => void;
  clear: () => void;
  has: (kind: LineKind, ref: string) => boolean;
}

const CartContext = createContext<CartApi | null>(null);

function read(): CartLine[] {
  try {
    return parseLines(JSON.parse(window.localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Read after mount: localStorage does not exist while this renders on the
  // server, and reading during render would mismatch the hydrated markup.
  useEffect(() => {
    setLines(read());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      // Private browsing, or a full quota. The cart still works for this page.
    }
  }, [lines, ready]);

  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === KEY) setLines(read());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const add = useCallback((kind: LineKind, ref: string, qty = 1) => {
    setLines((prev) => {
      const found = prev.find((l) => sameLine(l, { kind, ref }));
      if (found) {
        return prev.map((l) =>
          sameLine(l, { kind, ref }) ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
        );
      }
      return [...prev, { kind, ref, qty: Math.min(MAX_QTY, Math.max(1, qty)) }];
    });
  }, []);

  const setQty = useCallback((kind: LineKind, ref: string, qty: number) => {
    setLines((prev) =>
      qty < 1
        ? prev.filter((l) => !sameLine(l, { kind, ref }))
        : prev.map((l) =>
            sameLine(l, { kind, ref }) ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
          ),
    );
  }, []);

  const remove = useCallback((kind: LineKind, ref: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, { kind, ref })));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      ready,
      add,
      setQty,
      remove,
      clear,
      has: (kind, ref) => lines.some((l) => sameLine(l, { kind, ref })),
    }),
    [lines, ready, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}
