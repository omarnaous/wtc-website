import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import Starfield from "./Starfield";
import { HERO } from "./constants";
import { asset } from "@/lib/asset";

/**
 * The hero film.
 *
 * The Player is handed the hero box's own pixel size, so the composition is
 * laid out from `useVideoConfig()` rather than a fixed 16:9 frame — nothing is
 * ever cropped or blown up, on a phone or on a widescreen monitor. Every
 * motion is periodic over HERO.durationInFrames so the loop has no seam.
 */

const RAIL = [
  "SO33W700", "SO33M100", "SO33R100", "SO33L103",
  "SO33N700", "SO33G100", "SO33O100", "SO33J100",
];

const CENTREPIECE = "SO33W700";

const src = (sku: string) => asset(`/products/watches/${sku}_sa200.png`);

/**
 * Where the watch sits, and how big.
 *
 * Landscape pushes it right of centre so the headline column stays clear;
 * portrait lifts it into the top third for the same reason. Nothing is
 * cropped, so an off-centre focal point is safe at any size.
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
    fy: height * (portrait ? 0.2 : 0.46),
    size: min * (portrait ? 0.46 : 0.62),
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
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${Math.round(c * 0.06)} ${Math.round(c)}`}
            transform={`rotate(${t * 360 - 90} ${fx} ${fy})`}
            opacity={0.5}
          />
        );
      })()}
    </svg>
  );
}

/** Watches drifting right-to-left behind the centrepiece. */
function Rail() {
  const frame = useCurrentFrame();
  const { fx, fy, size, width } = useStage();
  const t = frame / HERO.durationInFrames;
  const gap = width / 3.2;
  const span = RAIL.length * gap;
  const box = size * 0.86;

  return (
    <AbsoluteFill>
      {RAIL.map((sku, i) => {
        const raw = i * gap - t * span;
        const x = (((raw % span) + span) % span) - gap;
        const d = Math.abs(x - fx) / fx; // 0 at the focal point, 1 at the edges
        const scale = interpolate(d, [0, 1], [0.62, 0.44], { extrapolateRight: "clamp" });
        const opacity = interpolate(d, [0, 0.55, 1], [0.34, 0.16, 0], {
          extrapolateRight: "clamp",
        });
        const bob = Math.sin(t * Math.PI * 2 * 2 + i) * (size * 0.03);

        return (
          <Img
            key={sku}
            src={src(sku)}
            style={{
              position: "absolute",
              left: x - box / 2,
              top: fy - box / 2 + bob,
              width: box,
              height: box,
              objectFit: "contain",
              transform: `scale(${scale})`,
              opacity,
              filter: "blur(1.5px) saturate(0.8)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/** The hero watch: breathing scale, a slow tilt, and a warm halo. */
function Centrepiece() {
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

  const breathe = 1 + Math.sin(t * Math.PI * 2) * 0.016;
  const tilt = Math.sin(t * Math.PI * 2) * 2.4;
  const lift = Math.cos(t * Math.PI * 2) * (size * 0.02);
  const scale = (0.94 + 0.06 * appear) * breathe;
  const halo = size * 1.45;

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
      <Img
        src={src(CENTREPIECE)}
        style={{
          position: "absolute",
          left: fx - size / 2,
          top: fy - size / 2,
          width: size,
          height: size,
          objectFit: "contain",
          transform: `translateY(${lift}px) rotate(${tilt}deg) scale(${scale})`,
          opacity: appear,
          filter: "drop-shadow(0 50px 90px rgba(0,0,0,0.85))",
        }}
      />
    </AbsoluteFill>
  );
}

export default function HeroVideo() {
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
      <Rail />
      <Centrepiece />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${gx}% ${gy}%, transparent 34%, rgba(9,9,10,0.3) 66%, rgba(9,9,10,0.82) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}
