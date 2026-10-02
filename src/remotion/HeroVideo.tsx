import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import Starfield from "./Starfield";
import { HERO } from "./constants";

/**
 * The hero film.
 *
 * The Player is handed the hero box's own pixel size, so the composition is
 * laid out from `useVideoConfig()` rather than a fixed 16:9 frame — nothing is
 * ever cropped or blown up, on a phone or on a widescreen monitor. Every
 * motion is periodic over HERO.durationInFrames so the loop has no seam.
 */

/*
 * There is no built-in cast. The film used to fall back to a list of bundled
 * packshots, and those files are gone — every photograph is an R2 object now —
 * so a hero with no watches picked in the dashboard would have drawn broken
 * images. Without a cast it simply draws the backdrop and the orbits.
 */

/**
 * Which watches appear, as image paths. Passed in by the host so the film
 * follows the catalogue — editing the cast in the dashboard re-casts it.
 */
export interface HeroFilmProps {
  rail?: string[];
  centre?: string;
}

/**
 * Where the watch sits, and how big.
 *
 * Landscape pushes it right of centre so the headline column stays clear;
 * portrait puts it in the top third, large — on a phone the watch is the
 * reason anyone is on the page, and at 46% of the width it read as a
 * thumbnail beside the eyebrow. HeroPlayer's poster sits on the same spot, so
 * the film fades in over it without a jump.
 */
function useStage() {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const min = Math.min(width, height);
  return {
    width,
    height,
    portrait,
    fx: width * (portrait ? 0.5 : 0.66),
    fy: height * (portrait ? 0.27 : 0.46),
    size: min * 0.62,
  };
}

function Orbits() {
  const frame = useCurrentFrame();
  const { fx, fy, size, width, height } = useStage();
  const t = frame / HERO.durationInFrames;

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      {[
        { k: 0.72, turns: 1, dash: "2 16", color: "#ffffff", op: 0.1 },
        { k: 1.02, turns: -1, dash: "1 26", color: "#ffffff", op: 0.08 },
        { k: 1.34, turns: 1, dash: "3 40", color: "#c9a227", op: 0.16 },
      ].map((o, i) => (
        <circle
          key={i}
          cx={fx}
          cy={fy}
          r={size * o.k}
          fill="none"
          stroke={o.color}
          strokeOpacity={o.op}
          strokeWidth={1}
          strokeDasharray={o.dash}
          transform={`rotate(${t * 360 * o.turns} ${fx} ${fy})`}
        />
      ))}

      {/* A chronograph sweep: one revolution per loop, like a seconds hand. */}
      {(() => {
        const r = size * 0.9;
        const c = 2 * Math.PI * r;
        return (
          <circle
            cx={fx}
            cy={fy}
            r={r}
            fill="none"
            stroke="#c9a227"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${Math.round(c * 0.08)} ${Math.round(c)}`}
            transform={`rotate(${t * 360 - 90} ${fx} ${fy})`}
            opacity={0.7}
          />
        );
      })()}
    </svg>
  );
}

/** Watches drifting right-to-left behind the centrepiece. */
function Rail({ rail = [] }: { rail?: string[] }) {
  const frame = useCurrentFrame();
  const { fx, fy, size, width, portrait } = useStage();
  const t = frame / HERO.durationInFrames;

  // A phone gets a shorter reel and no blur: an animated blur on eight images
  // at 30fps is by far the most expensive thing in this composition, and it
  // is what drops frames on mid-range hardware.
  const reel = portrait ? rail.slice(0, 5) : rail;
  const gap = width / (portrait ? 2.2 : 3.2);
  const span = reel.length * gap;
  const box = size * 0.86;

  return (
    <AbsoluteFill>
      {reel.map((image, i) => {
        const raw = i * gap - t * span;
        const x = (((raw % span) + span) % span) - gap;
        const d = Math.abs(x - fx) / fx; // 0 at the focal point, 1 at the edges
        const scale = interpolate(d, [0, 1], [0.66, 0.46], { extrapolateRight: "clamp" });
        const opacity = interpolate(d, [0, 0.5, 1], [0.62, 0.3, 0], {
          extrapolateRight: "clamp",
        });
        // Two cycles per loop: one was slow enough to read as a still image.
        const bob = Math.sin(t * Math.PI * 4 + i) * (size * 0.05);
        const spin = Math.sin(t * Math.PI * 4 + i * 0.7) * 5;

        return (
          <Img
            key={`${image}-${i}`}
            src={image}
            style={{
              position: "absolute",
              left: x - box / 2,
              top: fy - box / 2 + bob,
              width: box,
              height: box,
              objectFit: "contain",
              transform: `scale(${scale}) rotate(${spin}deg)`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/** The hero watch: breathing scale, a slow tilt, and a warm halo. */
function Centrepiece({ centre }: { centre?: string }) {
  const frame = useCurrentFrame();
  const { fx, fy, size } = useStage();
  const t = frame / HERO.durationInFrames;

  const entry = interpolate(frame, [0, 46], [0, 1], {
    extrapolateRight: "clamp",
    easing: (v) => 1 - Math.pow(1 - v, 4),
  });
  const exit = interpolate(
    frame,
    [HERO.durationInFrames - 26, HERO.durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const appear = Math.min(entry, exit);

  // Two cycles per loop on the tilt and rise, one on the sway, so the watch
  // traces a slow figure rather than a metronome — and at amplitudes you can
  // actually see. The previous values moved it well under a pixel a second.
  const cycle = t * Math.PI * 2;
  const breathe = 1 + Math.sin(cycle * 2) * 0.035;
  const tilt = Math.sin(cycle * 2) * 4;
  const lift = Math.cos(cycle * 2) * (size * 0.045);
  const sway = Math.sin(cycle) * (size * 0.03);
  const scale = (0.94 + 0.06 * appear) * breathe;
  const halo = size * 1.45;

  if (!centre) return null;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: fx - halo / 2,
          top: fy - halo / 2,
          width: halo,
          height: halo,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,162,39,0.20) 0%, rgba(201,162,39,0.05) 42%, transparent 68%)",
          opacity: appear,
        }}
      />
      {/* A soft shadow under the watch. It was a drop-shadow filter on the
          image, re-rendered on every frame because the image moves — the
          single most expensive thing in the film. A gradient ellipse that
          follows it costs nothing. */}
      <div
        style={{
          position: "absolute",
          left: fx - size * 0.38,
          top: fy + size * 0.3,
          width: size * 0.76,
          height: size * 0.22,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 45%, transparent 72%)",
          transform: `translate(${sway}px, ${lift * 0.4}px)`,
          opacity: appear,
        }}
      />
      <Img
        src={centre}
        style={{
          position: "absolute",
          left: fx - size / 2,
          top: fy - size / 2,
          width: size,
          height: size,
          objectFit: "contain",
          transform: `translate(${sway}px, ${lift}px) rotate(${tilt}deg) scale(${scale})`,
          opacity: appear,
        }}
      />
    </AbsoluteFill>
  );
}

export default function HeroVideo({ rail, centre }: HeroFilmProps) {
  const frame = useCurrentFrame();
  const { fx, fy, width, height } = useStage();
  const fade = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const gx = Math.round((fx / width) * 100);
  const gy = Math.round((fy / height) * 100);

  return (
    <AbsoluteFill style={{ backgroundColor: "#09090a", opacity: fade }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${gx}% ${gy}%, #16161f 0%, #0b0b0e 44%, #09090a 100%)`,
        }}
      />
      <Starfield />
      <Orbits />
      <Rail rail={rail} />
      <Centrepiece centre={centre} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${gx}% ${gy}%, transparent 38%, rgba(9,9,10,0.24) 68%, rgba(9,9,10,0.78) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}
