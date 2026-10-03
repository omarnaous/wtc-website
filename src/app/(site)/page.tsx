import Link from "next/link";
import Hero from "@/components/hero/Hero";
import Bestsellers from "@/components/sections/Bestsellers";
import SectionHead from "@/components/sections/SectionHead";
import InstagramStrip, { type Post } from "@/components/sections/InstagramStrip";
import ScrollReel from "@/components/sections/ScrollReel";
import Collections, { type CollectionTile } from "@/components/sections/Collections";
import Reviews from "@/components/sections/Reviews";
import StrapStudio from "@/components/strap/StrapStudio";
import { getSections, flag, num, str, getSetting, getSettings, listCollections, listReviews, reviewSummary } from "@/lib/store/storefront";
import { listStorefrontProducts } from "@/lib/store/products";
import { slugsWithStraps, strapSetsFor } from "@/lib/store/straps";
import { studioLabels } from "@/lib/content/studio";
export { dynamic } from "@/lib/runtime";
import { COMMERCE_ENABLED } from "@/lib/runtime";
import { thumb } from "@/lib/thumb";

const SECTION_KEYS = [
  "bestsellers",
  "collections",
  "reel",
  "strapStudio",
  "reviews",
  "instagram",
] as const;

export default async function Home() {
  const [sections, { social, contact }, collections, products, reviews, ratings, feed] =
    await Promise.all([
      getSections([...SECTION_KEYS]),
      getSettings(),
      listCollections(),
      listStorefrontProducts(),
      listReviews(),
      reviewSummary(),
      // The grid lives in D1 with its images in R2, so a new capture is a
      // dashboard change rather than a deploy.
      getSetting<{ posts: Post[] }>("instagram_feed", { posts: [] }),
    ]);

  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const bestsellers = products
    .filter((p) => p.bestsellerRank)
    .sort((a, b) => a.bestsellerRank! - b.bestsellerRank!);

  // ── Strap Studio ─────────────────────────────────────────────────────────
  // Every watch in the catalogue is selectable, not just the bestsellers — the
  // studio's whole point is "see this strap on the watch you own", and the
  // watch someone owns is as likely to be the twelfth seller as the first.
  // Bestsellers still lead the rail; the rest follow in catalogue order.
  const studio = sections.strapStudio;
  const ranked = [...bestsellers, ...products.filter((p) => !p.bestsellerRank)];
  const featured = bySlug.get(str(studio, "featured")) ?? ranked[0] ?? products[0];
  // The watch the studio opens on leads the rail, so the selected card is the
  // first one rather than the second.
  const models = featured ? [featured, ...ranked.filter((p) => p.slug !== featured.slug)] : ranked;
  // Only the featured watch's straps travel with the page; the rest are
  // fetched when their watch is picked (/api/straps/[slug]).
  const [strapSets, fitted] = await Promise.all([
    featured ? strapSetsFor([featured.slug]) : Promise.resolve({} as Awaited<ReturnType<typeof strapSetsFor>>),
    slugsWithStraps(),
  ]);
  const studioHasStraps = Boolean(featured && strapSets[featured.slug]?.length);
  const studioModels = models.filter((m) => fitted.includes(m.slug));

  // ── Instagram ────────────────────────────────────────────────────────────
  const ig = sections.instagram;
  const igLimit = num(ig, "limit", 6);
  const live = feed.posts?.length > 0;
  const posts: Post[] = live
    ? feed.posts.slice(0, igLimit)
    : bestsellers.slice(0, igLimit).map((p) => ({
        id: p.slug,
        image: p.images.angle,
        permalink: social.instagram,
        caption: p.name,
        isVideo: false,
      }));

  // ── Collections ──────────────────────────────────────────────────────────
  const tiles: CollectionTile[] = collections.map((c) => ({
    ...c,
    heroImage: c.heroSlug ? bySlug.get(c.heroSlug)?.images.front : undefined,
  }));

  const reel = sections.reel;
  const reelFilm = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    family: p.familyLabel,
    year: p.year,
    src: thumb(p.images.front),
  }));

  return (
    <>
      <Hero />

      {flag(sections.bestsellers, "enabled") && bestsellers.length > 0 && (
        <Bestsellers
          products={bestsellers.slice(0, num(sections.bestsellers, "limit", 10))}
          eyebrow={str(sections.bestsellers, "eyebrow")}
          title={str(sections.bestsellers, "title")}
          accent={str(sections.bestsellers, "accent")}
        />
      )}

      {flag(sections.collections, "enabled") && tiles.length > 0 && (
        <section id="collection" className="border-b border-line py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <SectionHead
              eyebrow={str(sections.collections, "eyebrow")}
              title={str(sections.collections, "title")}
              accent={str(sections.collections, "accent")}
              copy={str(sections.collections, "copy")}
            >
              {str(sections.collections, "ctaLabel") && (
                <Link
                  href={str(sections.collections, "ctaHref") || "/products"}
                  className="rounded-full border border-line px-6 py-3 text-[12px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
                >
                  {str(sections.collections, "ctaLabel")}
                </Link>
              )}
            </SectionHead>

            <div className="mt-12">
              <Collections
                collections={tiles}
                whatsapp={contact.whatsapp}
                comingSoonLabel={str(sections.collections, "comingSoonLabel", "Coming soon")}
                countLabel={str(sections.collections, "countLabel", "{n} references")}
                upcomingMessage={str(
                  sections.collections,
                  "upcomingMessage",
                  "Hi WTC — let me know when {collection} lands.",
                )}
              />
            </div>
          </div>
        </section>
      )}

      {flag(reel, "enabled") && reelFilm.length > 0 && (
        <ScrollReel
          film={reelFilm}
          eyebrow={str(reel, "eyebrow")}
          title={str(reel, "title")}
          accent={str(reel, "accent")}
          height={num(reel, "height", 320)}
        />
      )}

      {flag(studio, "enabled") && studioHasStraps && (
        <section id="strap-studio" className="border-b border-line py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <SectionHead
              eyebrow={str(studio, "eyebrow")}
              title={str(studio, "title")}
              accent={str(studio, "accent")}
              copy={str(studio, "copy")}
            />

            <div className="mt-12">
              <StrapStudio
                product={featured}
                models={studioModels}
                sets={strapSets}
                labels={studioLabels(studio)}
                commerce={COMMERCE_ENABLED}
              />
            </div>
          </div>
        </section>
      )}

      {flag(sections.reviews, "enabled") && (
        <Reviews
          reviews={reviews.slice(0, num(sections.reviews, "limit", 6))}
          summary={ratings}
          eyebrow={str(sections.reviews, "eyebrow")}
          title={str(sections.reviews, "title")}
          accent={str(sections.reviews, "accent")}
          copy={str(sections.reviews, "copy")}
          showRating={flag(sections.reviews, "showRating")}
          productNames={Object.fromEntries(products.map((p) => [p.slug, p.name]))}
          whatsapp={contact.whatsapp}
          instagram={social.instagram}
          inviteTitle={str(sections.reviews, "inviteTitle")}
          inviteCopy={str(sections.reviews, "inviteCopy")}
          inviteCta={str(sections.reviews, "inviteCta")}
        />
      )}

      {flag(ig, "enabled") && posts.length > 0 && (
        <InstagramStrip
          posts={posts}
          live={live}
          handle={social.instagramHandle}
          link={social.instagram}
          eyebrow={str(ig, "eyebrow")}
          copy={str(ig, "copy")}
          ctaLabel={str(ig, "ctaLabel", "Follow")}
        />
      )}
    </>
  );
}
