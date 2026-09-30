import { notFound } from "next/navigation";
import DangerZone from "@/components/admin/DangerZone";
import ReviewForm from "@/components/admin/ReviewForm";
import { PageHeader } from "@/components/admin/ui";
import { getReview } from "@/lib/store/reviews";
import { listAllProducts } from "@/lib/store/products";
import { deleteReview, saveReview } from "../actions";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [review, products] = await Promise.all([getReview(id), listAllProducts()]);
  if (!review) notFound();

  return (
    <>
      <PageHeader
        title={review.author}
        subtitle={`${review.rating}/5 · ${review.source}`}
        back={{ href: "/admin/reviews", label: "Reviews" }}
      />
      <div className="space-y-4">
        <ReviewForm
          review={review}
          products={products.map((p) => ({ value: p.slug, label: p.name }))}
          action={saveReview}
        />
        <DangerZone
          action={deleteReview}
          hiddenName="__id"
          hiddenValue={review.id}
          confirmWord={review.author}
          label="Delete this review"
          description="Hide it instead if you only want it off the site — hidden reviews stay here and keep their place in the order."
        />
      </div>
    </>
  );
}
