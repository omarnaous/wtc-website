"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx, usd } from "@/lib/format";

interface Hit {
  slug: string;
  name: string;
  sku: string;
  family: string;
  colorway: string;
  price: number;
  image: string;
  bestseller: number | null;
}

/** One request per visit, shared by every opening of the panel. */
let cache: Promise<Hit[]> | null = null;
const loadIndex = () =>
  (cache ??= fetch("/api/search")
    .then((r) => (r.ok ? (r.json() as Promise<Hit[]>) : []))
    .catch(() => {
      cache = null;
      return [];
    }));

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Every word has to appear somewhere in the name, reference, series or colour. */
function match(hits: Hit[], q: string): Hit[] {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [...hits]
      .sort((a, b) => (a.bestseller ?? 999) - (b.bestseller ?? 999))
      .slice(0, 6);
  }
  return hits.filter((h) => {
    const hay = norm(`${h.name} ${h.sku} ${h.family} ${h.colorway}`);
    return words.every((w) => hay.includes(w));
  });
}

/**
 * The header's search: a magnifier that opens a panel under the bar, with
 * results as you type. Enter opens the first result; "See all" hands the
 * query to the catalogue, which keeps it in its search box.
 */
export default function Search() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Hit[] | null>(null);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    void loadIndex().then((h) => alive && setIndex(h));
    const id = requestAnimationFrame(() => input.current?.focus());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const btn = button.current;
    return () => {
      alive = false;
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prev;
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  const results = useMemo(() => (index ? match(index, q) : []), [index, q]);
  useEffect(() => setActive(0), [q]);

  const close = () => setOpen(false);
  const go = (href: string) => {
    close();
    router.push(href);
  };
  const all = `/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`;

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close search" : "Search watches"}
        aria-expanded={open}
        aria-controls="site-search"
        className={cx(
          "flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
          open ? "border-gold text-gold" : "border-line text-chalk hover:border-gold hover:text-gold",
        )}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" fill="none" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id="site-search"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="fixed inset-x-0 bottom-0 top-16 z-[45] flex flex-col bg-ink/97 [animation:fade-in_180ms_ease-out]"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div className="mx-auto w-full max-w-2xl px-4 pt-5 sm:px-6 sm:pt-8">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  const hit = results[active];
                  go(hit && q.trim() ? `/products/${hit.slug}` : all);
                }}
                className="relative"
              >
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" stroke="currentColor" strokeWidth="1.7" fill="none" aria-hidden>
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={input}
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActive((a) => Math.min(a + 1, Math.max(0, results.length - 1)));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActive((a) => Math.max(0, a - 1));
                    }
                  }}
                  placeholder="Search a mission, colour or reference…"
                  aria-label="Search watches"
                  className="h-14 w-full rounded-full border border-line bg-surface pl-12 pr-5 text-[15px] text-chalk placeholder:text-mute-2 focus:border-gold/60 focus:outline-none"
                />
              </form>

              <p className="mt-6 px-1 text-[11px] uppercase tracking-[0.2em] text-mute-2">
                {!index ? "Loading…" : q.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular"}
              </p>
            </div>

            <div className="no-bar mx-auto mt-3 w-full max-w-2xl flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
              {index && q.trim() && results.length === 0 ? (
                <p className="px-1 py-8 text-[14px] text-mute">
                  Nothing matches “{q.trim()}”. Try a planet, a colour or a reference like SO33.
                </p>
              ) : (
                <ul className="divide-y divide-line/70">
                  {results.slice(0, 12).map((h, i) => (
                    <li key={h.slug}>
                      <Link
                        href={`/products/${h.slug}`}
                        prefetch={false}
                        onClick={close}
                        onMouseEnter={() => setActive(i)}
                        className={cx(
                          "flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors",
                          i === active && q.trim() ? "bg-surface" : "hover:bg-surface/60",
                        )}
                      >
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={h.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[14px] font-semibold">{h.name}</span>
                          <span className="mt-0.5 block truncate text-[12px] text-mute-2">
                            {h.family} · {h.sku}
                          </span>
                        </span>
                        <span className="shrink-0 font-display text-[14px] tabular-nums text-mute">{usd(h.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {index && (
                <Link
                  href={all}
                  onClick={close}
                  className="mt-5 flex h-12 items-center justify-center rounded-full border border-line text-[13px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
                >
                  {q.trim() ? `See all results for “${q.trim()}”` : "Browse the whole catalogue"} →
                </Link>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
