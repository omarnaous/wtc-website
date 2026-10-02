import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * The Strap Studio's re-strap.
 *
 * Every frame in a set is the same watch in the same place — only the strap
 * differs — so the new photograph is revealed from the middle of the case
 * outward, top and bottom at once. The case never appears to change; the strap
 * seems to unroll from the lugs to its ends, which is what fitting a strap
 * looks like. A thin gold edge rides each front of the reveal, brightest over
 * the strap and fading out to the sides, so it reads as light on rubber rather
 * than as a line across the page. Nothing in it is a filter or a blur, so a
 * frame is two images and four gradients — cheap enough for a phone at 60fps.
 *
 * Played by the Strap Studio on each swap and unmounted when it ends: its last
 * frame is the new photograph exactly, so the hand-off to the still is
 * invisible.
 */

export const RESTRAP = {
  /** The try-on frames are 700 wide; the 1195 matches their crop. */
  width: 700,
  height: 1195,
  fps: 60,
  durationInFrames: 58,
} as const;

/** Where the case sits in the frame, as a fraction of its height. */
const CENTRE = 0.5;

export interface RestrapProps {
  from: string;
  to: string;
}

export default function Restrap({ from, to }: RestrapProps) {
  const frame = useCurrentFrame();
  const { height, durationInFrames } = useVideoConfig();

  // An even in-out rather than a hard ease-out: with ease-out the band was
  // 85% open inside 300ms and the strap appeared, rather than unrolled. This
  // keeps the fronts visibly travelling for most of the reveal.
  const p = interpolate(frame, [2, durationInFrames - 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });

  // Half-height of the revealed band, in px, growing from the case centre. A
  // touch past half, so the band clears both ends of the frame.
  const half = p * height * 0.52;
  const top = Math.max(0, height * CENTRE - half);
  const bottom = Math.max(0, height * (1 - CENTRE) - half);

  // The edges glow while they travel and are gone by the end.
  const glow = interpolate(p, [0, 0.12, 0.7, 1], [0, 1, 0.8, 0]);

  // Each front is a bright line over a soft band of gold either side of it.
  // Both are plain gradients: the band used to be a blurred box-shadow,
  // which the browser re-rasterises on every frame it moves.
  const edge = (y: number) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y - 22,
        height: 44,
        opacity: glow * 0.55,
        background:
          "radial-gradient(ellipse 30% 50% at 50% 50%, rgba(201,162,39,0.45) 0%, rgba(201,162,39,0) 100%)",
      }}
    />
  );
  const line = (y: number) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y - 1,
        height: 2,
        opacity: glow,
        background:
          "linear-gradient(90deg, transparent 22%, rgba(226,196,105,0.25) 33%, rgba(240,214,130,0.95) 50%, rgba(226,196,105,0.25) 67%, transparent 78%)",
      }}
    />
  );

  return (
    <AbsoluteFill>
      <Img src={from} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      <AbsoluteFill style={{ clipPath: `inset(${top}px 0 ${bottom}px 0)` }}>
        <Img src={to} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </AbsoluteFill>
      {p < 1 && (
        <>
          {edge(top)}
          {edge(height - bottom)}
          {line(top)}
          {line(height - bottom)}
        </>
      )}
    </AbsoluteFill>
  );
}
