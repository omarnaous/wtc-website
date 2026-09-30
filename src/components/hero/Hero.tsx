import Link from "next/link";
import HeroPlayer from "./HeroPlayer";
import { getSection, flag, list, str } from "@/lib/store/content";
import { getSettings } from "@/lib/store/settings";
import { listProducts } from "@/lib/store/products";

/**
 * The opening screen. Every word, both buttons, the figures and the cast of
 * the film behind them come from Sections → Hero in the dashboard.
 */
export default async function Hero() {
  const [hero, { brand }, products] = await Promise.all([
    getSection("hero"),
    getSettings(),
    listProducts(),
  ]);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const cast = list<{ slug: string }>(hero, "film")
    .map((row) => bySlug.get(row.slug)?.images.front)
    .filter((src): src is string => Boolean(src));

  const stats = list<{ value: string; label: string }>(hero, "stats");
  const eyebrow = str(hero, "eyebrow") || `${brand.longName} · ${brand.location}`;
  const accent = str(hero, "accent");

  return (
    <section className="relative grain min-h-[92svh] overflow-hidden border-b border-line">
      <HeroPlayer rail={cast} />

      {/* The film is cropped to cover, so guarantee contrast under the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_8%,rgba(9,9,10,0.92)_34%,rgba(9,9,10,0.55)_58%,transparent_88%)] lg:bg-[linear-gradient(to_right,var(--color-ink)_0%,rgba(9,9,10,0.88)_30%,rgba(9,9,10,0.4)_50%,transparent_70%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-4 pb-14 pt-32 sm:px-6 lg:px-10 lg:pb-20">
        <p className="eyebrow">{eyebrow}</p>

        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.6rem,7.5vw,5.75rem)] font-bold leading-[0.95] tracking-[-0.03em]">
          {str(hero, "title")}
          {accent && (
            <>
              <br />
              <span className="font-serif font-normal italic text-gold-soft">{accent}</span>
            </>
          )}
        </h1>

        <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-mute">{str(hero, "copy")}</p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          {str(hero, "primaryLabel") && (
            <Link
              href={str(hero, "primaryHref") || "/products"}
              className="rounded-full bg-chalk px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-85"
            >
              {str(hero, "primaryLabel")}
            </Link>
          )}
          {str(hero, "secondaryLabel") && (
            <Link
              href={str(hero, "secondaryHref") || "#strap-studio"}
              className="rounded-full border border-line bg-ink/40 px-7 py-3.5 text-sm font-medium text-chalk backdrop-blur transition-colors hover:border-gold hover:text-gold"
            >
              {str(hero, "secondaryLabel")}
            </Link>
          )}
        </div>

        {/* Four figures across a 375px screen leaves ~80px a column, which
            breaks the numbers onto two lines. They wrap instead, at whatever
            count the dashboard is set to. */}
        {flag(hero, "showStats") && stats.length > 0 && (
          <dl className="mt-14 grid max-w-2xl grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-x-6 gap-y-7 border-t border-line pt-7">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-2xl font-semibold tracking-tight text-chalk sm:text-3xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-mute-2">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
