import Link from "next/link";
import HeroPlayer from "./HeroPlayer";
import { site } from "@/data/site";

export default function Hero() {
  return (
    <section className="relative grain min-h-[92svh] overflow-hidden border-b border-line">
      <HeroPlayer />

      {/* The film is cropped to cover, so guarantee contrast under the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_8%,rgba(9,9,10,0.92)_34%,rgba(9,9,10,0.55)_58%,transparent_88%)] lg:bg-[linear-gradient(to_right,var(--color-ink)_0%,rgba(9,9,10,0.88)_30%,rgba(9,9,10,0.4)_50%,transparent_70%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-4 pb-14 pt-32 sm:px-6 lg:px-10 lg:pb-20">
        <p className="eyebrow">
          OMEGA × Swatch specialist · {site.location}
        </p>

        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.6rem,7.5vw,5.75rem)] font-bold leading-[0.95] tracking-[-0.03em]">
          Every mission,
          <br />
          <span className="font-serif font-normal italic text-gold-soft">one insider.</span>
        </h1>

        <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-mute">
          {site.heroCopy}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-chalk px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-85"
          >
            Shop the collection
          </Link>
          <Link
            href="#strap-studio"
            className="rounded-full border border-line bg-ink/40 px-7 py-3.5 text-sm font-medium text-chalk backdrop-blur transition-colors hover:border-gold hover:text-gold"
          >
            Try the Strap Studio
          </Link>
        </div>

        <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-line pt-7">
          {site.stats.map((s) => (
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
      </div>
    </section>
  );
}
