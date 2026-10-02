import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * The Bestsellers stage: one watch at a time, presented.
 *
 * Over seven seconds the rank swings in behind it as a huge numeral, a gold
 * arc draws itself around the watch, the watch rises in on a spring and then
 * floats, a single band of light passes over it, and in the last half-second
 * it lifts away for the next one. The host advances to the next bestseller
 * when it ends, and jumps straight to any one you pick.
 *
 * Cheap on purpose: one image, one SVG, a handful of gradients — no filters,
 * no blurs, nothing that has to be re-rasterised as it moves. Transparent
 * background; the stage colour is the host's.
 */

export const SPOT = {
  size: 900,
  fps: 30,
  durationInFrames: 210,
  /** A frame with the watch risen and the arc drawn — where a still stage sits. */
  landed: 48,
} as const;

export interface SpotlightProps {
  image: string;
  rank: number;
  /** The watch's case colour, #rrggbb — tints the light behind it. */
  accent: string;
}

const GOLD = "#c9a227";
const GOLD_SOFT = "#e2c469";

export default function Spotlight({ image, rank, accent }: SpotlightProps) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const cx = width / 2;
  const cy = height * 0.47;
  const R = width * 0.36;

  const rise = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90, mass: 0.9 } });
  const settle = spring({ frame, fps, config: { damping: 200 } });
  const leave = interpolate(frame, [durationInFrames - 16, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // The arc draws over the first second, then a bead keeps orbiting.
  const draw = interpolate(frame, [6, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const orbit = (frame / durationInFrames) * 360 - 90;
  const circ = 2 * Math.PI * R;

  // Idle float once it has landed.
  const t = frame / fps;
  const bob = Math.sin(t * 1.6) * height * 0.012;
  const tilt = Math.sin(t * 1.1) * 2.2;

  const watchY = interpolate(rise, [0, 1], [height * 0.12, 0]) + bob - leave * height * 0.08;
  const watchS = interpolate(rise, [0, 1], [0.84, 1]) * (1 - leave * 0.06);
  const watchR = interpolate(rise, [0, 1], [-9, 0]) + tilt;
  // Never fully transparent: even on frame 0 the watch is there, faint and
  // low, so the stage is never an empty box whatever the Player is doing.
  const watchO = (0.45 + 0.55 * Math.min(1, rise * 1.4)) * (1 - leave * 0.9);

  // One pass of light across the watch, a second after it lands.
  const sweep = interpolate(frame, [34, 78], [-0.6, 1.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const numeral = String(rank).padStart(2, "0");
  const size = width * 0.74;

  return (
    <AbsoluteFill style={{ opacity: 1 - leave * 0.4 }}>
      {/* The watch's own colour, as light. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${(cy / height) * 100}%, ${accent}55 0%, ${accent}18 30%, transparent 62%)`,
          opacity: settle,
        }}
      />

      {/* The rank, huge and faint, swinging in from the left. */}
      <div
        style={{
          position: "absolute",
          left: width * 0.04,
          top: height * 0.02,
          fontFamily: "var(--font-display), sans-serif",
          fontWeight: 700,
          fontSize: width * 0.42,
          lineHeight: 1,
          letterSpacing: "-0.06em",
          color: "transparent",
          WebkitTextStroke: `2px rgba(226,196,105,${0.22 * settle})`,
          transform: `translateX(${interpolate(settle, [0, 1], [-width * 0.12, 0])}px)`,
        }}
      >
        {numeral}
      </div>

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* Fine ring, then the gold arc drawing in, then the orbiting bead. */}
        <circle cx={cx} cy={cy} r={R * 1.12} fill="none" stroke="#ffffff" strokeOpacity={0.06} strokeDasharray="2 14" />
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={GOLD}
          strokeOpacity={0.55}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${circ * 0.72 * draw} ${circ}`}
          transform={`rotate(-200 ${cx} ${cy})`}
        />
        <g transform={`rotate(${orbit} ${cx} ${cy})`} opacity={draw}>
          <circle cx={cx + R} cy={cy} r={6} fill={GOLD_SOFT} />
          <circle cx={cx + R} cy={cy} r={14} fill={GOLD} opacity={0.18} />
        </g>
      </svg>

      {/* Contact shadow: a gradient, not a filter. */}
      <div
        style={{
          position: "absolute",
          left: cx - size * 0.34,
          top: cy + size * 0.36,
          width: size * 0.68,
          height: size * 0.12,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, transparent 72%)",
          opacity: watchO,
          transform: `scale(${1 - bob / (height * 0.06)})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          transform: `translateY(${watchY}px) rotate(${watchR}deg) scale(${watchS})`,
          opacity: watchO,
        }}
      >
        <Img src={image} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        {/* The light passing over: clipped to a disc around the case, so it
            reads as a reflection on the crystal rather than a wipe. */}
        <div
          style={{
            position: "absolute",
            inset: "22%",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              left: `${sweep * 100}%`,
              background:
                "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.0) 20%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 80%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}
