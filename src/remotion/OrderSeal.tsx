import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * The receipt's opening moment: a chronograph that times the order in.
 *
 * A gold seconds hand makes one sweep of the dial, lighting each minute tick
 * as it passes and drawing the arc behind it; when it reaches twelve the dial
 * settles and a check mark is drawn at the centre. It plays once, in a little
 * over two seconds, and holds its last frame — the confirmation should be
 * something you see, not something you wait for.
 *
 * Transparent background: it sits on the page, not in a box.
 */

export const SEAL = {
  size: 480,
  fps: 60,
  durationInFrames: 138,
} as const;

const GOLD = "#c9a227";
const GOLD_SOFT = "#e2c469";
const LINE = "#2c2c33";
const TICKS = 60;

const out = Easing.bezier(0.16, 1, 0.3, 1);

export default function OrderSeal() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const c = width / 2;
  const R = width * 0.42;

  // 0 → 1: the sweep. 1 → the check.
  const sweep = interpolate(frame, [6, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: out,
  });
  const appear = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const handFade = interpolate(frame, [76, 92], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const check = interpolate(frame, [82, 112], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: out,
  });
  const pop = interpolate(frame, [82, 98, 116], [0.86, 1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const halo = interpolate(frame, [80, 104, 138], [0, 0.55, 0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const angle = sweep * 360;
  const arcLen = 2 * Math.PI * R;
  const checkLen = 160;

  return (
    <AbsoluteFill style={{ opacity: appear }}>
      <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
        <defs>
          <radialGradient id="seal-halo">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
            <stop offset="60%" stopColor={GOLD} stopOpacity={0.08} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </radialGradient>
        </defs>

        <circle cx={c} cy={c} r={R * 1.18} fill="url(#seal-halo)" opacity={halo} />

        {/* Dial */}
        <circle cx={c} cy={c} r={R} fill="#111114" stroke={LINE} strokeWidth={2} />

        {/* Minute ticks: each lights when the hand has passed it. */}
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * 360;
          const lit = angle >= a;
          const major = i % 5 === 0;
          const r1 = R * (major ? 0.8 : 0.86);
          const r2 = R * 0.93;
          const rad = ((a - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={c + Math.cos(rad) * r1}
              y1={c + Math.sin(rad) * r1}
              x2={c + Math.cos(rad) * r2}
              y2={c + Math.sin(rad) * r2}
              stroke={lit ? (major ? GOLD_SOFT : GOLD) : LINE}
              strokeWidth={major ? 4 : 2}
              strokeLinecap="round"
            />
          );
        })}

        {/* The arc behind the hand. */}
        <circle
          cx={c}
          cy={c}
          r={R * 0.99}
          fill="none"
          stroke={GOLD}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${arcLen * sweep} ${arcLen}`}
          transform={`rotate(-90 ${c} ${c})`}
        />

        {/* Seconds hand, with its counterweight. */}
        <g transform={`rotate(${angle} ${c} ${c})`} opacity={handFade}>
          <line x1={c} y1={c + R * 0.18} x2={c} y2={c - R * 0.86} stroke={GOLD_SOFT} strokeWidth={4} strokeLinecap="round" />
          <circle cx={c} cy={c} r={9} fill={GOLD_SOFT} />
        </g>

        {/* The check, drawn once the hand is home. */}
        <g transform={`translate(${c} ${c}) scale(${pop}) translate(${-c} ${-c})`} opacity={check > 0 ? 1 : 0}>
          <circle cx={c} cy={c} r={R * 0.46} fill={GOLD} opacity={0.12 + 0.1 * check} />
          <path
            d={`M ${c - R * 0.22} ${c + R * 0.01} L ${c - R * 0.05} ${c + R * 0.17} L ${c + R * 0.25} ${c - R * 0.16}`}
            fill="none"
            stroke={GOLD_SOFT}
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={checkLen}
            strokeDashoffset={checkLen * (1 - check)}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
}
