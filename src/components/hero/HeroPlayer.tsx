"use client";

import { Player } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import HeroVideo from "@/remotion/HeroVideo";
import { HERO } from "@/remotion/constants";
import { asset } from "@/lib/asset";

/**
 * Hosts the Remotion film. The composition is given the hero box's own pixel
 * size, so it fills the section exactly at any aspect ratio instead of being
 * cropped or letterboxed. Falls back to a still when the OS asks for less
 * motion, and mounts only on the client — the Player is a browser surface.
 */
export default function HeroPlayer() {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Round hard: re-mounting the composition on every sub-pixel resize
      // would restart the film.
      const w = Math.max(320, Math.round(width / 8) * 8);
      const h = Math.max(320, Math.round(height / 8) * 8);
      setSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-ink">
      {reduced ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_36%,#16161f_0%,#0b0b0e_46%,#09090a_100%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/products/watches/SO33W700_sa200.png")}
            alt=""
            className="absolute left-1/2 top-[34%] w-[min(60vw,420px)] -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      ) : size ? (
        <Player
          component={HeroVideo}
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
        />
      ) : null}
    </div>
  );
}
