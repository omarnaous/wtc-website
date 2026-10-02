"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useMemo, useRef, useState } from "react";
import HeroVideo from "@/remotion/HeroVideo";
import { HERO } from "@/remotion/constants";
import { thumb } from "@/lib/thumb";

/**
 * Hosts the Remotion film. The composition is given the hero box's own pixel
 * size, so it fills the section exactly at any aspect ratio instead of being
 * cropped or letterboxed. Falls back to a still when the OS asks for less
 * motion, and mounts only on the client — the Player is a browser surface.
 *
 * The cast comes in as props, so which watches drift past is set in the
 * dashboard rather than hard-coded here.
 *
 * The film also stops the moment it leaves the screen. It is a per-frame
 * render of a dozen animated layers, and left running it competes with the
 * scroll for the whole length of the page — which on a phone is felt as the
 * rest of the site being sticky, not as the hero being busy.
 */
export default function HeroPlayer({ rail = [], poster }: { rail?: string[]; poster?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);

  // The film waits until the page has drawn and the browser has a moment:
  // arriving on the homepage from another page, mounting a composition of a
  // few hundred layers in the same frame as the new page made the whole
  // navigation stutter. The poster below holds the spot in the meantime.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 700 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Visible means "on screen and in a foreground tab". A backgrounded tab
  // throttles rAF anyway, but it keeps the composition mounted and warm.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let onScreen = true;
    const sync = () => setVisible(onScreen && !document.hidden);
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    if (visible) p.play();
    else p.pause();
  }, [visible, size]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Quantise hard. Changing the composition size remounts it and restarts
      // the film from frame zero, and on a phone the address bar sliding in
      // and out resizes the container constantly — at a fine granularity that
      // makes the hero visibly restart while you scroll.
      const w = Math.max(320, Math.round(width / 16) * 16);
      const h = Math.max(320, Math.round(height / 48) * 48);
      setSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A new array identity on every render would remount the Player and restart
  // the film, so the input props are memoised on the cast itself.
  const key = rail.join("|");
  const inputProps = useMemo(
    () => (rail.length ? { rail: rail.map(thumb), centre: rail[0] } : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const still = poster ?? rail[0];

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-ink [container-type:size]">
      {/* The first frame, in the served markup. The film needs the bundle and
          a measured box before it can draw, so without this the hero opened
          on an empty black panel. Placed where the film puts its centrepiece;
          the film fades in over it. */}
      {still && !reduced && (
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_27%,#16161f_0%,#0b0b0e_46%,#09090a_100%)] landscape:bg-[radial-gradient(ellipse_at_66%_46%,#16161f_0%,#0b0b0e_44%,#09090a_100%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={still}
            alt=""
            fetchPriority="high"
            className="absolute left-1/2 top-[27%] w-[62cqmin] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_50px_90px_rgba(0,0,0,0.85)] landscape:left-[66%] landscape:top-[46%] landscape:w-[62cqmin]"
          />
        </div>
      )}
      {reduced ? (
        still ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_36%,#16161f_0%,#0b0b0e_46%,#09090a_100%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={still}
            alt=""
            className="absolute left-1/2 top-[34%] w-[min(60vw,420px)] -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        ) : null
      ) : size && ready ? (
        <Player
          ref={player}
          component={HeroVideo}
          inputProps={inputProps}
          durationInFrames={HERO.durationInFrames}
          fps={HERO.fps}
          compositionWidth={size.w}
          compositionHeight={size.h}
          style={{ width: "100%", height: "100%" }}
          autoPlay
          loop
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
                  numberOfSharedAudioTags={0}
        />
      ) : null}
    </div>
  );
}
