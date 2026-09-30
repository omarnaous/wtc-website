import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPolicy, listPolicies } from "@/lib/store/policies";
import { getSettings } from "@/lib/store/settings";
import { getSection, str } from "@/lib/store/content";
export { dynamic } from "@/lib/runtime";

export async function generateStaticParams() {
  const policies = await listPolicies();
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPolicy(slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [policy, policies, { contact }, copy] = await Promise.all([
    getPolicy(slug),
    listPolicies(),
    getSettings(),
    getSection("policyPage"),
  ]);
  if (!policy || policy.status === "hidden") notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-32 sm:px-6">
      <p className="eyebrow">{str(copy, "eyebrow", "Policies")}</p>
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
        <p className="font-display text-sm font-semibold">
          {str(copy, "helpHeading", "Still unsure?")}
        </p>
        <p className="mt-2 text-sm text-mute">
          {str(copy, "helpCopy", "Message us on WhatsApp at")}{" "}
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            {contact.phone}
          </a>
          .
        </p>
      </div>

      <nav className="mt-12 flex flex-wrap gap-3">
        {policies
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
