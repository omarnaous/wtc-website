"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Palette, Strap } from "@/data/types";
import { alpha, readableOn, shade } from "@/lib/color";

/**
 * A vector MoonSwatch. The case is driven by the product's sampled palette and
 * the two strap halves are independent layers, so a strap can be animated off
 * and a new one animated on without touching the watch head.
 *
 * Geometry: 420 x 620 viewBox, case centred at (210, 310) with r = 122.
 */

const CX = 210;
const CY = 310;
const R = 122;
const SW = 132;            // strap width
const SX = CX - SW / 2;    // strap left edge

/** Fixed precision, so the server and the browser emit identical attributes. */
const q = (n: number) => Math.round(n * 100) / 100;

const SWAP_SPRING = { type: "spring" as const, stiffness: 260, damping: 26, mass: 0.9 };

function Ticks({ color }: { color: string }) {
  return (
    <g opacity={0.85}>
      {Array.from({ length: 60 }).map((_, i) => {
        const major = i % 5 === 0;
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const r1 = R - 24;
        const r2 = r1 - (major ? 9 : 5);
        return (
          <line
            key={i}
            x1={q(CX + Math.cos(a) * r1)}
            y1={q(CY + Math.sin(a) * r1)}
            x2={q(CX + Math.cos(a) * r2)}
            y2={q(CY + Math.sin(a) * r2)}
            stroke={color}
            strokeWidth={major ? 1.8 : 0.8}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function Markers({ color }: { color: string }) {
  return (
    <g>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const r1 = R - 46;
        const r2 = r1 - 11;
        return (
          <line
            key={i}
            x1={q(CX + Math.cos(a) * r1)}
            y1={q(CY + Math.sin(a) * r1)}
            x2={q(CX + Math.cos(a) * r2)}
            y2={q(CY + Math.sin(a) * r2)}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}
    </g>
  );
}

function VelcroStrap({ strap, side }: { strap: Strap; side: "top" | "bottom" }) {
  const top = side === "top";
  const body = strap.primary;
  const stitch = alpha(readableOn(body), 0.42);
  const y = top ? -12 : 408;
  const h = 232;
  const flapY = top ? 22 : 520;

  return (
    <g>
      <rect x={SX} y={y} width={SW} height={h} rx={10} fill={body} />
      <rect
        x={SX}
        y={y}
        width={SW}
        height={h}
        rx={10}
        fill="url(#strapSheen)"
        style={{ mixBlendMode: "soft-light" }}
      />
      {/* Keeper flap with its stitched border — the Velcro signature. */}
      <rect x={SX + 10} y={flapY} width={SW - 20} height={78} rx={8} fill={shade(body, -0.12)} />
      <rect
        x={SX + 16}
        y={flapY + 5}
        width={SW - 32}
        height={68}
        rx={6}
        fill="none"
        stroke={stitch}
        strokeWidth={1.4}
        strokeDasharray="5 4"
      />
      <text
        x={210}
        y={flapY + 46}
        textAnchor="middle"
        fontSize={15}
        fontWeight={700}
        letterSpacing={1}
        fill={alpha(readableOn(body), 0.8)}
        fontFamily="var(--font-display), sans-serif"
      >
        {top ? "swatch" : "Ω"}
      </text>
      {/* Woven edges */}
      <line x1={SX + 5} y1={y + 4} x2={SX + 5} y2={y + h - 4} stroke={stitch} strokeWidth={1} />
      <line x1={SX + SW - 5} y1={y + 4} x2={SX + SW - 5} y2={y + h - 4} stroke={stitch} strokeWidth={1} />
    </g>
  );
}

function RubberStrap({ strap, side }: { strap: Strap; side: "top" | "bottom" }) {
  const top = side === "top";
  const body = strap.primary;
  const lining = strap.secondary;
  const edge = alpha(readableOn(body), 0.25);

  // Tapered silhouette: full width at the lug, narrower at the free end.
  const d = top
    ? `M${SX} 200 L${SX} 40 Q${SX} 22 ${SX + 16} 18 L${SX + SW - 16} 18 Q${SX + SW} 22 ${SX + SW} 40 L${SX + SW} 200 Z`
    : `M${SX} 420 L${SX} 580 Q${SX} 598 ${SX + 16} 602 L${SX + SW - 16} 602 Q${SX + SW} 598 ${SX + SW} 580 L${SX + SW} 420 Z`;

  return (
    <g>
      <path d={d} fill={body} />
      <path d={d} fill="url(#strapSheen)" style={{ mixBlendMode: "soft-light" }} />
      {/* Centre channel in the second colour */}
      <rect
        x={198}
        y={top ? 26 : 424}
        width={24}
        height={168}
        rx={12}
        fill={lining}
        opacity={0.95}
      />
      {top ? (
        <g fill={edge}>
          {[46, 78, 110].map((yy) => (
            <ellipse key={yy} cx={210} cy={yy} rx={7} ry={5} />
          ))}
        </g>
      ) : (
        /* Pin buckle */
        <g>
          <rect
            x={172}
            y={548}
            width={76}
            height={48}
            rx={8}
            fill="none"
            stroke="#c9cbd0"
            strokeWidth={6}
          />
          <line x1={210} y1={548} x2={210} y2={596} stroke="#c9cbd0" strokeWidth={4} />
        </g>
      )}
      <path d={d} fill="none" stroke={edge} strokeWidth={1.2} />
    </g>
  );
}

function StrapHalf({ strap, side }: { strap: Strap; side: "top" | "bottom" }) {
  const top = side === "top";
  return (
    <g>
      {strap.type === "velcro" ? (
        <VelcroStrap strap={strap} side={side} />
      ) : (
        <RubberStrap strap={strap} side={side} />
      )}
      {/* The strap darkens as it runs beneath the case. */}
      <rect
        x={SX}
        y={top ? 150 : 400}
        width={SW}
        height={70}
        fill={top ? "url(#tuckTop)" : "url(#tuckBottom)"}
      />
    </g>
  );
}

export default function WatchSvg({
  palette,
  strap,
  family,
  className,
}: {
  palette: Palette;
  strap: Strap;
  family?: string;
  className?: string;
}) {
  const dialInk = readableOn(palette.dial);
  const bezelInk = readableOn(palette.bezel);
  const complication = family === "moonphase" || family === "earthphase";

  return (
    <svg
      viewBox="0 0 420 620"
      className={className}
      role="img"
      aria-label={`MoonSwatch shown on the ${strap.name} strap`}
    >
      <defs>
        <linearGradient id="strapSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="28%" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="caseSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id="crystal" cx="34%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.30" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
        <linearGradient id="tuckTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="tuckBottom" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <filter id="caseShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* ── Straps, behind the head ─────────────────────────────────────── */}
      <AnimatePresence initial={false} mode="sync">
        <motion.g
          key={`${strap.sku}-top`}
          initial={{ y: -96, opacity: 0, rotate: -2.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -96, opacity: 0, rotate: 2.5 }}
          transition={SWAP_SPRING}
          style={{ originX: "210px", originY: "310px" }}
        >
          <StrapHalf strap={strap} side="top" />
        </motion.g>
      </AnimatePresence>

      <AnimatePresence initial={false} mode="sync">
        <motion.g
          key={`${strap.sku}-bottom`}
          initial={{ y: 96, opacity: 0, rotate: 2.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 96, opacity: 0, rotate: -2.5 }}
          transition={SWAP_SPRING}
          style={{ originX: "210px", originY: "310px" }}
        >
          <StrapHalf strap={strap} side="bottom" />
        </motion.g>
      </AnimatePresence>

      {/* ── Watch head ──────────────────────────────────────────────────── */}
      <g filter="url(#caseShadow)">
        {/* Lugs, bridging the case out over the strap ends */}
        {[
          `M${SX + 2} 238 L${SX + 20} 186 L${CX - 6} 186 L${CX - 16} 242 Z`,
          `M${SX + SW - 2} 238 L${SX + SW - 20} 186 L${CX + 6} 186 L${CX + 16} 242 Z`,
          `M${SX + 2} 382 L${SX + 20} 434 L${CX - 6} 434 L${CX - 16} 378 Z`,
          `M${SX + SW - 2} 382 L${SX + SW - 20} 434 L${CX + 6} 434 L${CX + 16} 378 Z`,
        ].map((d, i) => (
          <path key={i} d={d} fill={shade(palette.case, -0.06)} />
        ))}

        {/* Crown and pushers, seated into the case rather than floating beside it */}
        <rect x={CX + R - 16} y={CY - 19} width={34} height={38} rx={6} fill={shade(palette.case, 0.06)} />
        {[-13, -6.5, 0, 6.5, 13].map((d) => (
          <line
            key={d}
            x1={CX + R + 4}
            y1={CY + d - 6}
            x2={CX + R + 4}
            y2={CY + d + 6}
            stroke={alpha("#000000", 0.28)}
            strokeWidth={1.2}
          />
        ))}
        <rect x={CX + R - 16} y={CY - 68} width={28} height={28} rx={6} fill={shade(palette.case, 0.02)} />
        <rect x={CX + R - 16} y={CY + 40} width={28} height={28} rx={6} fill={shade(palette.case, 0.02)} />

        <circle cx={CX} cy={CY} r={R} fill={palette.case} />
        <circle cx={CX} cy={CY} r={R} fill="url(#caseSheen)" style={{ mixBlendMode: "soft-light" }} />
        <circle cx={CX} cy={CY} r={R - 4} fill="none" stroke={alpha("#000000", 0.25)} strokeWidth={1} />

        {/* Tachymetre bezel */}
        <circle cx={CX} cy={CY} r={R - 14} fill={palette.bezel} />
        <Ticks color={bezelInk} />
        <text
          x={CX}
          y={CY - R + 40}
          textAnchor="middle"
          fontSize={9}
          letterSpacing={1.6}
          fill={alpha(bezelInk, 0.85)}
          fontFamily="var(--font-display), sans-serif"
        >
          TACHYMÈTRE
        </text>

        {/* Dial */}
        <circle cx={CX} cy={CY} r={R - 40} fill={palette.dial} />
        <Markers color={dialInk} />

        {/* Three counters */}
        {[
          [CX - 44, CY - 8],
          [CX + 44, CY - 8],
          [CX, CY + 46],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={23} fill={shade(palette.subdial, luminanceBump(palette.subdial))} opacity={0.96} />
            <circle cx={x} cy={y} r={23} fill="none" stroke={alpha(dialInk, 0.25)} strokeWidth={0.8} />
            <line x1={x} y1={y} x2={x} y2={y - 14} stroke={readableOn(palette.subdial)} strokeWidth={1.6} strokeLinecap="round" />
          </g>
        ))}

        {complication && (
          <g>
            <circle cx={CX} cy={CY - 46} r={17} fill={alpha(dialInk, 0.12)} />
            <circle cx={CX - 4} cy={CY - 46} r={11} fill="#c9a227" />
            <circle cx={CX + 4} cy={CY - 48} r={11} fill={palette.dial} />
          </g>
        )}

        <text
          x={CX}
          y={CY - 20}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          letterSpacing={0.6}
          fill={alpha(dialInk, 0.92)}
          fontFamily="var(--font-display), sans-serif"
        >
          Ω × swatch
        </text>
        <text
          x={CX}
          y={CY + 26}
          textAnchor="middle"
          fontSize={8.5}
          letterSpacing={1.3}
          fill={alpha(dialInk, 0.72)}
          fontFamily="var(--font-display), sans-serif"
        >
          MOONSWATCH
        </text>

        {/* Hands, parked at ten past ten */}
        <g stroke={dialInk} strokeLinecap="round">
          <line x1={CX} y1={CY} x2={CX - 42} y2={CY - 40} strokeWidth={6} />
          <line x1={CX} y1={CY} x2={CX + 52} y2={CY - 30} strokeWidth={4.5} />
        </g>
        <line x1={CX} y1={CY + 18} x2={CX} y2={CY - 74} stroke="#d9534f" strokeWidth={2} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={5} fill={dialInk} />

        {/* Crystal highlight */}
        <circle cx={CX} cy={CY} r={R - 40} fill="url(#crystal)" pointerEvents="none" />
      </g>
    </svg>
  );
}

/** Nudge the counters away from the dial so they stay visible either way. */
function luminanceBump(hex: string) {
  return readableOn(hex) === "#111111" ? -0.12 : 0.16;
}
