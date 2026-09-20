import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { policyBySlug, site } from "@/data/site";

export function generateStaticParams() {
  return site.policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = policyBySlug(slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = policyBySlug(slug);
  if (!policy) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-32 sm:px-6">
      <p className="eyebrow">Policies</p>
      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.04] tracking-[-0.03em]">
        {policy.title}
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-mute">{policy.summary}</p>

      <div className="mt-10 rule" />

      <div className="mt-10 space-y-6">
        {policy.body.map((para, i) => (
          <p key={i} className="text-[15px] leading-[1.75] text-mute">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-line bg-surface/50 p-6">
        <p className="font-display text-sm font-semibold">Still unsure?</p>
        <p className="mt-2 text-sm text-mute">
          Message us on WhatsApp at {site.contact.phone} or write to{" "}
          <a href={`mailto:${site.contact.email}`} className="text-gold hover:underline">
            {site.contact.email}
          </a>
          .
        </p>
      </div>

      <nav className="mt-12 flex flex-wrap gap-3">
        {site.policies
          .filter((p) => p.slug !== policy.slug)
          .map((p) => (
            <Link
              key={p.slug}
              href={`/policies/${p.slug}`}
              className="rounded-full border border-line px-4 py-2 text-[12px] text-mute transition-colors hover:border-gold hover:text-gold"
            >
              {p.title}
            </Link>
          ))}
      </nav>
    </div>
  );
}
