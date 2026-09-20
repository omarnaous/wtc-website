import Hero from "@/components/hero/Hero";
import Bestsellers from "@/components/sections/Bestsellers";
import SectionHead from "@/components/sections/SectionHead";
import InstagramStrip from "@/components/sections/InstagramStrip";
import Catalog from "@/components/catalog/Catalog";
import StrapStudio from "@/components/strap/StrapStudio";
import Link from "next/link";
import { bestsellers, bySlug, products } from "@/data/products";

export default function Home() {
  const studioHead = bySlug("mission-to-the-moon") ?? products[0];

  return (
    <>
      <Hero />
      <Bestsellers />

      <section id="collection" className="border-b border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <SectionHead
            eyebrow="The collection"
            title="Twenty-six references,"
            accent="filtered your way."
            copy="Every Bioceramic MoonSwatch we carry — the eleven original missions, both Moonphases, the Earthphase series and the specials. Filter by collection, colour, availability or budget."
          >
            <Link
              href="/products"
              className="rounded-full border border-line px-6 py-3 text-[12px] font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
            >
              Open full catalogue
            </Link>
          </SectionHead>

          <div className="mt-12">
            <Catalog limit={8} />
          </div>
        </div>
      </section>

      <section id="strap-studio" className="border-b border-line py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <SectionHead
            eyebrow="Strap Studio"
            title="Change the strap,"
            accent="change the watch."
            copy="Thirty-seven straps, thirty-eight seconds to fit. Pick a watch head, then swap through every VELCRO® and rubber strap we stock and watch it change on the wrist."
          />

          <div className="mt-12">
            <StrapStudio product={studioHead} models={bestsellers} />
          </div>
        </div>
      </section>

      <InstagramStrip />
    </>
  );
}
