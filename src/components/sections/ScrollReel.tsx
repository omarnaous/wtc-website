"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reel, { reelFrames, type ReelEntry } from "@/remotion/ScrollReel";
import { HERO } from "@/remotion/constants";

/**
 * Scroll *is* the timeline here: the section is three screens tall, the stage
 * sticks to the viewport, and the page's progress through the section is
 * seeked straight into the Remotion composition. Nothing plays on its own, so
 * scrolling back up runs it backwards.
 */
export default function ScrollReelSection({
  film,
  eyebrow,
  title,
  accent,
  height = 320,
}: {
  film: ReelEntry[];
  eyebrow: string;
  title: string;
  accent: string;
  /** How many screens tall the section is — longer means a slower reel. */
  height?: number;
}) {
  const frames = reelFrames(film.length);
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [reduced, setReduced] = useState(false);
  // Mounted only once the section is close: it sits far down the homepage,
  // and building it on arrival slowed every navigation to the homepage.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: "100% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.max(320, Math.round(width / 16) * 16);
      const h = Math.max(320, Math.round(height / 48) * 48);
      setSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Seek only when the frame actually changes: the scroll reports far more
  // often than there are frames, and every seek re-renders the composition.
  const last = useRef(-1);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const frame = Math.min(frames - 1, Math.max(0, Math.round(v * (frames - 1))));
    if (frame === last.current) return;
    last.current = frame;
    player.current?.seekTo(frame);
  });

  return (
    <section
      ref={section}
      aria-label="The collection, scrubbed by scroll"
      className="relative border-b border-line"
      style={{ height: `${height}svh` }}
    >
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden bg-ink">
        {size && near && !reduced && (
          <Player
            ref={player}
            component={Reel}
            inputProps={{ film }}
            durationInFrames={frames}
            fps={HERO.fps}
            compositionWidth={size.w}
            compositionHeight={size.h}
            style={{ width: "100%", height: "100%" }}
            controls={false}
            clickToPlay={false}
            doubleClickToFullscreen={false}
            spaceKeyToPlayOrPause={false}
            acknowledgeRemotionLicense
                  numberOfSharedAudioTags={0}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-10">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 max-w-md font-display text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            {title}
            {accent && (
              <span className="font-serif font-normal italic text-gold-soft"> {accent}</span>
            )}
          </h2>
        </div>
      </div>
    </section>
  );
}
