import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import Starfield from "./Starfield";

export interface ReelEntry {
  sku: string;
  name: string;
  family: string;
  year: number;
  src: string;
}

/**
 * A Remotion composition with no clock behind it — the host seeks it frame by
 * frame from the scroll position, so scrolling the page *is* the timeline.
 *
 * Everything is a pure function of `frame`, which is what makes that work:
 * scrubbing backwards is as valid as playing forwards.
 */

/** Fourteen frames per watch — long enough to read, short enough to scroll. */
export const FRAMES_PER_ENTRY = 14;
export const reelFrames = (count: number) => Math.max(1, count) * FRAMES_PER_ENTRY;

/** Only the few frames either side of centre are worth drawing. */
const WINDOW = 3.4;

// The cast always comes in as a prop: the watches are D1 rows, and there is
// no shipped catalogue to stand in for them.
export default function ScrollReel({ film }: { film: ReelEntry[] }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;

  const t = interpolate(frame, [0, reelFrames(film.length) - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const active = t * (film.length - 1);
  const cx = width / 2;
  const cy = height * (portrait ? 0.42 : 0.46);
  const spacing = width * (portrait ? 0.46 : 0.3);
  const box = Math.min(width, height) * (portrait ? 0.62 : 0.56);

  const nearest = film[Math.round(active)] ?? film[0];
  // Hold the name legible for most of the travel and dip only across the
  // hand-off, rather than fading to nothing between every pair.
  const settle = interpolate(
    Math.abs(active - Math.round(active)),
    [0, 0.32, 0.5],
    [1, 1, 0.22],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#09090a" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, #17171f 0%, #0c0c10 48%, #09090a 100%)",
        }}
      />
      <Starfield />

      {/* The reel */}
      {film.map((item, i) => {
        const d = i - active;
        if (Math.abs(d) > WINDOW) return null;
        const a = Math.abs(d);
        const scale = interpolate(a, [0, 1, WINDOW], [1, 0.6, 0.4], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(a, [0, 1, WINDOW], [1, 0.38, 0], {
          extrapolateRight: "clamp",
        });
        const lift = interpolate(a, [0, 1], [0, box * 0.05], { extrapolateRight: "clamp" });

        return (
          <Img
            key={item.sku}
            src={item.src}
            style={{
              position: "absolute",
              left: cx + d * spacing - box / 2,
              top: cy - box / 2 + lift,
              width: box,
              height: box,
              objectFit: "contain",
              transform: `scale(${scale}) rotate(${d * 4}deg)`,
              opacity,
            }}
          />
        );
      })}

      {/* Caption for whichever piece is centred */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cy + box * 0.46,
          textAlign: "center",
          opacity: settle,
          fontFamily: "var(--font-display), sans-serif",
          color: "#f4f3f0",
          padding: "0 6%",
        }}
      >
        <div
          style={{
            fontSize: Math.round(Math.min(width, height) * 0.052),
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          {nearest.name}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: Math.round(Math.min(width, height) * 0.019),
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#8d8d95",
          }}
        >
          {nearest.family} · {nearest.year} · {nearest.sku}
        </div>
      </div>

      {/* Progress through the collection */}
      <div
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          bottom: height * 0.07,
          height: 2,
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: `${t * 100}%`,
            height: "100%",
            background: "#c9a227",
          }}
        />
      </div>

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 46%, transparent 40%, rgba(9,9,10,0.3) 72%, rgba(9,9,10,0.85) 100%)",
        }}
      />
    </AbsoluteFill>
  );
}
