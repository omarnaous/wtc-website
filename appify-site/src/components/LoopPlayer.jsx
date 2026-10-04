import { useEffect, useRef } from "react";
import { Player } from "@remotion/player";

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// A Remotion player that loops while on screen and pauses when scrolled away.
export default function LoopPlayer({ component, durationInFrames, width, height, fps = 30, restFrame, className, label }) {
  const ref = useRef(null);
  const box = useRef(null);

  useEffect(() => {
    const el = box.current;
    if (!el || reduced()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const p = ref.current;
        if (!p) return;
        entry.isIntersecting ? p.play() : p.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className={className} role="img" aria-label={label}>
      <Player
        ref={ref}
        component={component}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={fps}
        loop
        controls={false}
        initialFrame={restFrame ?? Math.round(durationInFrames * 0.45)}
        acknowledgeRemotionLicense
        style={{ width: "100%", aspectRatio: `${width} / ${height}` }}
      />
    </div>
  );
}
