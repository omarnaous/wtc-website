"use client";

import { useEffect, useRef } from "react";
import { track, untrack } from "@/lib/motion/scroll-engine";

/**
 * A list whose items move with the scroll — see src/lib/motion/scroll-engine.ts.
 *
 * Every direct child is animated. Children added or removed later (a filter
 * in the catalogue) are picked up as they change. The markup is served as
 * is, fully visible: without JavaScript, or with reduced motion, it is just
 * the list.
 */
export default function ScrollList({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "ul" | "ol";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let current = new Set<HTMLElement>();
    const sync = () => {
      const next = new Set(Array.from(root.children) as HTMLElement[]);
      for (const el of current) if (!next.has(el)) untrack(el);
      for (const el of next) if (!current.has(el)) track(el);
      current = next;
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { childList: true });
    return () => {
      mo.disconnect();
      for (const el of current) untrack(el);
    };
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
