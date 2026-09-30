import Link from "next/link";
import { Card, Empty, LinkButton, PageHeader, Pill, shortDate } from "@/components/admin/ui";
import { listReviews, reviewSummary } from "@/lib/store/reviews";
import { listAllProducts } from "@/lib/store/products";

export const dynamic = "force-dynamic";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, summary, products] = await Promise.all([
    listReviews(true),
    reviewSummary(),
    listAllProducts(),
  ]);
  const names = new Map(products.map((p) => [p.slug, p.name]));

  return (
    <>
      <PageHeader
        title="Customer reviews"
        subtitle={
          summary.count
            ? `${summary.count} published · ${summary.average.toFixed(1)} average`
            : "Nothing published yet."
        }
        actions={<LinkButton href="/admin/reviews/new" tone="primary">Add a review</LinkButton>}
      />

      {reviews.length === 0 ? (
        <Empty
          title="No reviews yet"
          action={
            <LinkButton href="/admin/reviews/new" tone="primary">
              Add the first one
            </LinkButton>
          }
        >
          The section is built and sits on the homepage between the Strap Studio and Instagram — it
          stays hidden until there is something real to put in it. Add what customers have actually
          told you on Instagram or WhatsApp; nothing has been made up to fill it.
        </Empty>
      ) : (
        <Card bodyClassName="p-0">
          <ul className="divide-y divide-[var(--admin-line-soft)]">
            {reviews.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/reviews/${r.id}`}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[var(--admin-line-soft)]/60"
                >
                  <span className="tnum shrink-0 text-[13px] text-[var(--admin-gold)]">
                    {"★".repeat(r.rating)}
                    <span className="text-[var(--admin-mute-2)]">{"★".repeat(5 - r.rating)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium">
                      {r.author}
                      {r.location && (
                        <span className="font-normal text-[var(--admin-mute)]"> · {r.location}</span>
                      )}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-[12.5px] leading-relaxed text-[var(--admin-mute)]">
                      {r.body}
                    </span>
                    <span className="mt-1.5 block text-[11.5px] text-[var(--admin-mute-2)]">
                      {r.source}
                      {r.product_slug && names.has(r.product_slug) && ` · ${names.get(r.product_slug)}`}
                      {r.reviewed_on && ` · ${shortDate(r.reviewed_on)}`}
                    </span>
                  </span>
                  {r.status === "hidden" && <Pill tone="grey">Hidden</Pill>}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
