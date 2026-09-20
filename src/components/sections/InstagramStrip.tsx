import Image from "next/image";
import { bestsellers } from "@/data/products";
import { site } from "@/data/site";

/**
 * A link out to the client's Instagram. Deliberately shows product
 * photography rather than mocked-up posts — wire this to the Instagram Basic
 * Display API when the backend lands to pull the real grid.
 */
export default function InstagramStrip() {
  return (
    <section className="border-b border-line py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">On Instagram</p>
            <h2 className="mt-4 font-display text-[clamp(1.6rem,3.4vw,2.5rem)] font-bold tracking-[-0.03em]">
              {site.social.instagramHandle}
            </h2>
            <p className="mt-3 max-w-md text-sm text-mute">
              Unboxings, new arrivals and strap swaps — posted the day they land in Beirut.
            </p>
          </div>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-line px-6 py-3 text-[12px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
          >
            Follow on Instagram
          </a>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {bestsellers.slice(0, 6).map((p) => (
            <a
              key={p.slug}
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl border border-line"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${p.palette.case}26 0%, #121216 70%)`,
              }}
            >
              <Image
                src={p.images.angle}
                alt={p.name}
                fill
                sizes="(max-width: 1024px) 33vw, 16vw"
                className="object-contain p-3 transition-transform duration-700 group-hover:scale-110"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
