"use client";

import Link from "next/link";
import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useMemo, useRef, useState } from "react";
import Spotlight, { SPOT } from "@/remotion/Spotlight";
import { cx, usd } from "@/lib/format";
import type { Product } from "@/data/types";
import { thumb } from "@/lib/thumb";

const pad = (n: number) => String(n).padStart(2, "0");
const hex = (c: string | undefined) => (c && /^#[0-9a-f]{6}$/i.test(c) ? c : "#c9a227");

/**
 * Bestsellers, as a showcase rather than a rail of identical cards.
 *
 * A stage on one side plays the Remotion spotlight (src/remotion/Spotlight.tsx)
 * for one watch at a time and moves on to the next by itself; the ranked list
 * beside it is the way in. Pointing at a row (or tapping it) brings that
 * watch onto the stage; scrolling past the rows does nothing. On a phone the list is a rail of small cards under the stage.
 *
 * One Player for the whole section, mounted only once the section is close
 * and paused whenever it is off screen, so it costs nothing while you are
 * elsewhere on the page.
 */
export default function Bestsellers({
  products,
  eyebrow,
  title,
  accent,
}: {
  products: Product[];
  eyebrow: string;
  title: string;
  accent: string;
}) {
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const section = useRef<HTMLElement>(null);
  const player = useRef<PlayerRef>(null);
  const rail = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef(0);

  const n = products.length;
  const p = products[active] ?? products[0];

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = section.current;
    if (!el) return;
    // The film mounts the first time the stage is actually seen, and starts
    // through the Player's own autoplay — the path Remotion uses for "play on
    // load", which a phone honours. Before that the stage holds a still.
    const seen = new IntersectionObserver(([e]) => {
      setOnScreen(e.isIntersecting);
      if (e.isIntersecting) setNear(true);
    });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  // Every change of watch replays the entrance from the top.
  const shownActive = useRef(active);
  useEffect(() => {
    const pl = player.current;
    if (!pl || shownActive.current === active) return;
    shownActive.current = active;
    pl.seekTo(0);
    if (onScreen && !document.hidden) pl.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /*
   * Plays only while seen. Then makes sure it really is playing: if the frame
   * has not moved a moment later the Player is told again, and if it still
   * has not, the watch is put on stage landed — a still watch is fine, an
   * empty stage is not.
   */
  useEffect(() => {
    const pl = player.current;
    if (!pl) return;
    if (!onScreen) {
      pl.pause();
      return;
    }
    pl.play();
    const f0 = pl.getCurrentFrame();
    const t1 = setTimeout(() => {
      if (pl.getCurrentFrame() !== f0) return;
      pl.play();
      const f1 = pl.getCurrentFrame();
      t2 = setTimeout(() => {
        if (pl.getCurrentFrame() === f1 && f1 < SPOT.landed) pl.seekTo(SPOT.landed);
      }, 700);
    }, 700);
    let t2: ReturnType<typeof setTimeout> | undefined;
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onScreen, near]);

  // When it finishes, the next one.
  useEffect(() => {
    const pl = player.current;
    if (!pl) return;
    const next = () => setActive((a) => (a + 1) % n);
    pl.addEventListener("ended", next);
    return () => pl.removeEventListener("ended", next);
  }, [n, near, reduced]);

  // The next photograph, fetched while this one plays.
  useEffect(() => {
    const nx = products[(active + 1) % n];
    if (!nx || !near) return;
    const img = new window.Image();
    img.src = nx.images.front;
  }, [active, n, products, near]);

  // Keep the phone rail's active card in view, sideways only.
  useEffect(() => {
    const r = rail.current;
    const card = r?.children[active] as HTMLElement | undefined;
    if (!r || !card) return;
    r.scrollTo({ left: card.offsetLeft - r.clientWidth / 2 + card.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  // The ranked list only changes the watch on stage when a row is pointed
  // at (or tapped on a phone) — scrolling past the rows leaves it alone.
  const list = useRef<HTMLOListElement>(null);

  const choose = (i: number) => {
    setActive(i);
  };
  const hover = (i: number) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => choose(i), 90);
  };

  const inputProps = useMemo(
    () => ({ image: p?.images.front ?? "", rank: active + 1, accent: hex(p?.palette.case) }),
    [p, active],
  );

  if (!p) return null;
  const playing = onScreen && !reduced;

  return (
    <section ref={section} id="bestsellers" className="relative border-b border-line py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="reveal-left">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            {title}
            {accent && <span className="font-serif font-normal italic text-gold-soft"> {accent}</span>}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
          {/* ── Stage ──────────────────────────────────────────────────── */}
          <div className="reveal-scale min-w-0 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-[2rem] border border-line bevel bg-[radial-gradient(ellipse_at_50%_45%,#18181e_0%,#101013_60%,#0a0a0c_100%)] lg:aspect-square">
              {/* The film: square on a phone with the details under it; on a
                  desktop it fills the stage and the details sit over its foot. */}
              <div className="relative aspect-square lg:absolute lg:inset-0 lg:aspect-auto">
              {near && !reduced ? (
                <Player
                  ref={player}
                  component={Spotlight}
                  inputProps={inputProps}
                  durationInFrames={SPOT.durationInFrames}
                  fps={SPOT.fps}
                  compositionWidth={SPOT.size}
                  compositionHeight={SPOT.size}
                  style={{ width: "100%", height: "100%" }}
                  autoPlay
                  numberOfSharedAudioTags={0}
                  controls={false}
                  clickToPlay={false}
                  doubleClickToFullscreen={false}
                  spaceKeyToPlayOrPause={false}
                  acknowledgeRemotionLicense
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reduced ? p.images.front : thumb(p.images.front)}
                  alt=""
                  className="absolute left-[13%] top-[10%] h-[74%] w-[74%] object-contain"
                />
              )}

              {/* What is on stage, in type you can read and links you can use. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
                <span className="rounded-full border border-gold/30 bg-ink/70 px-3 py-1 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
                  No. {pad(active + 1)}
                </span>
                <span className="font-display text-[11px] tabular-nums text-mute-2">
                  {pad(active + 1)} / {pad(n)}
                </span>
              </div>
              </div>

              <div className="relative border-t border-line/60 p-5 sm:p-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:border-0 lg:bg-gradient-to-t lg:from-ink lg:via-ink/85 lg:to-transparent lg:pt-20">
                {/* How long until the next one. */}
                <div className="mb-4 h-0.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    key={active}
                    className="h-full origin-left bg-gold/80"
                    style={{
                      animation: `grow-x ${SPOT.durationInFrames / SPOT.fps}s linear both`,
                      animationPlayState: playing ? "running" : "paused",
                    }}
                  />
                </div>
                <div key={active} className="flex items-end justify-between gap-4 [animation:fade-in_320ms_ease-out]">
                  <div className="min-w-0">
                    <h3 className="font-display text-[clamp(1.15rem,2.4vw,1.6rem)] font-bold leading-tight tracking-tight">
                      {p.name}
                    </h3>
                    <p className="mt-1 truncate text-[12px] text-mute">
                      {p.familyLabel} · {p.colorway}
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-xl font-semibold tabular-nums text-gold-soft">
                    {usd(p.price)}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/products/${p.slug}`}
                    prefetch={false}
                    className="flex h-11 flex-1 items-center justify-center rounded-full bg-chalk text-[13px] font-semibold text-ink transition-colors hover:bg-gold-soft sm:flex-none sm:px-7"
                  >
                    View this watch
                  </Link>
                  <button
                    type="button"
                    onClick={() => choose((active - 1 + n) % n)}
                    aria-label="Previous bestseller"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ink/60 text-mute transition-colors hover:border-gold hover:text-gold"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => choose((active + 1) % n)}
                    aria-label="Next bestseller"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ink/60 text-mute transition-colors hover:border-gold hover:text-gold"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* ── Phone: a rail of small cards ─────────────────────────── */}
            <div
              ref={rail}
              className="no-bar -mx-4 mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 lg:hidden"
            >
              {products.map((q, i) => {
                const on = i === active;
                return (
                  <button
                    key={q.slug}
                    type="button"
                    onClick={() => choose(i)}
                    aria-pressed={on}
                    aria-label={`${q.name}, number ${i + 1}`}
                    className={cx(
                      "shimmer relative flex w-[6.5rem] shrink-0 snap-center flex-col items-center rounded-2xl border px-2 pb-2.5 pt-3 transition-[border-color,background-color,transform] duration-300 active:scale-95",
                      on ? "border-gold bg-gold/10" : "border-line bg-surface/40",
                    )}
                  >
                    <span className={cx("absolute left-2 top-1.5 font-display text-[10px] font-bold", on ? "text-gold" : "text-mute-2")}>
                      {pad(i + 1)}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb(q.images.front)} alt="" loading="lazy" decoding="async" className="h-16 w-16 object-contain" />
                    <span className={cx("mt-1.5 line-clamp-2 text-center text-[11px] leading-tight", on ? "text-chalk" : "text-mute")}>
                      {q.shortName}
                    </span>
                    <span className="mt-1 font-display text-[11px] tabular-nums text-mute-2">{usd(q.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Desktop: the ranked list ───────────────────────────────── */}
          <ol ref={list} className="hidden lg:block">
            {products.map((q, i) => {
              const on = i === active;
              return (
                <li key={q.slug} data-i={i} className="border-b border-line/70 first:border-t">
                  <Link
                    href={`/products/${q.slug}`}
                    prefetch={false}
                    onMouseEnter={() => hover(i)}
                    onMouseLeave={() => clearTimeout(hoverTimer.current)}
                    onFocus={() => choose(i)}
                    className={cx(
                      "group relative flex items-center gap-5 py-4 pl-5 pr-3 transition-colors duration-300",
                      on ? "bg-gradient-to-r from-gold/[0.09] to-transparent" : "hover:bg-surface/40",
                    )}
                  >
                    {/* The marker that slides to the watch on stage. */}
                    <span
                      aria-hidden
                      className={cx(
                        "absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 origin-center rounded-full bg-gold transition-transform duration-300",
                        on ? "scale-y-100" : "scale-y-0",
                      )}
                    />
                    <span
                      className={cx(
                        "w-9 shrink-0 font-display text-2xl font-bold tabular-nums tracking-tight transition-colors",
                        on ? "text-gold" : "text-white/15 group-hover:text-white/30",
                      )}
                    >
                      {pad(i + 1)}
                    </span>
                    <span className="shimmer relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb(q.images.front)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={cx(
                          "h-full w-full object-contain p-1.5 transition-transform duration-500",
                          on ? "scale-110" : "group-hover:scale-105",
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cx("block truncate font-display text-[15px] font-semibold", on ? "text-chalk" : "text-chalk/85")}>
                        {q.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-mute-2">
                        {q.familyLabel} · {q.colorway}
                      </span>
                    </span>
                    <span className="shrink-0 font-display text-[15px] font-semibold tabular-nums">{usd(q.price)}</span>
                    <span
                      aria-hidden
                      className={cx(
                        "shrink-0 text-mute-2 transition-transform duration-300",
                        on ? "translate-x-0.5 text-gold" : "group-hover:translate-x-0.5",
                      )}
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
