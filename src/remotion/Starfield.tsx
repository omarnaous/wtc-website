import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { HERO } from "./constants";

/** Deterministic PRNG so the field is identical on every render and reload. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Positions are normalised 0–1 so the field fits whatever size it is given. */
type Star = { x: number; y: number; r: number; o: number; layer: number; phase: number };

const STARS: Star[] = (() => {
  const rand = mulberry32(20220326); // MoonSwatch launch day
  return Array.from({ length: 240 }, () => {
    const layer = rand() < 0.62 ? 0 : rand() < 0.8 ? 1 : 2;
    return {
      x: rand(),
      y: rand(),
      r: 0.6 + rand() * (layer === 2 ? 2.1 : 1.1),
      o: 0.18 + rand() * (layer === 2 ? 0.7 : 0.4),
      layer,
      phase: rand() * Math.PI * 2,
    };
  });
})();

const DRIFT = [0.03, 0.07, 0.13]; // fraction of the width drifted per loop
const q = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Drawn once per size, then moved as three layers.
 *
 * It used to place and fade 240 circles individually on every frame, which
 * is 240 SVG nodes for React to diff and the browser to repaint thirty times
 * a second — in the hero and again in the scroll reel. Each layer is now one
 * group, drawn twice side by side so it can wrap, and the frame only moves
 * the three groups and breathes their opacity.
 */
export default function Starfield() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / HERO.durationInFrames; // 0 → 1 across the loop

  const layers = useMemo(
    () =>
      [0, 1, 2].map((layer) => {
        const stars = STARS.filter((s) => s.layer === layer);
        const draw = (dx: number) =>
          stars.map((s, i) => (
            <circle
              key={`${dx}-${i}`}
              cx={q(s.x * width + dx)}
              cy={q(s.y * height)}
              r={q(s.r)}
              fill={layer === 2 ? "#e2c469" : "#ffffff"}
              opacity={q(s.o)}
            />
          ));
        return (
          <>
            {draw(0)}
            {draw(-width)}
          </>
        );
      }),
    [width, height],
  );

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      {layers.map((stars, layer) => {
        // Wrapping at 1 keeps the drift continuous across the loop point.
        const x = ((t * DRIFT[layer]) % 1) * width;
        const twinkle = 0.8 + 0.2 * Math.sin(t * Math.PI * 2 * 3 + layer * 2.1);
        return (
          <g key={layer} transform={`translate(${q(x)} 0)`} opacity={q(twinkle)}>
            {stars}
          </g>
        );
      })}
    </svg>
  );
}
