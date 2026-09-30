import { money } from "./ui";

/**
 * Revenue per day. Plain SVG rather than a charting library: it is one series
 * and the dashboard should not ship 60 kB to draw thirty rectangles.
 */
export default function BarChart({
  points,
  height = 132,
}: {
  points: { day: string; revenue: number; orders: number }[];
  height?: number;
}) {
  const max = Math.max(1, ...points.map((p) => p.revenue));
  const gap = 2;
  const width = points.length * 10;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-[132px] w-full"
        role="img"
        aria-label={`Revenue over the last ${points.length} days`}
      >
        {points.map((p, i) => {
          const h = p.revenue === 0 ? 1.5 : Math.max(3, (p.revenue / max) * (height - 6));
          return (
            <rect
              key={p.day}
              x={i * 10 + gap / 2}
              y={height - h}
              width={10 - gap}
              height={h}
              rx={1.5}
              className={p.revenue > 0 ? "fill-zinc-800" : "fill-zinc-200"}
            >
              <title>{`${p.day} · ${money(p.revenue)} · ${p.orders} order(s)`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[11.5px] text-[var(--admin-mute-2)]">
        <span>{points[0]?.day}</span>
        <span>Peak {money(max)}</span>
        <span>{points.at(-1)?.day}</span>
      </div>
    </div>
  );
}
