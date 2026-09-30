import ReviewForm from "@/components/admin/ReviewForm";
import { PageHeader } from "@/components/admin/ui";
import { listAllProducts } from "@/lib/store/products";
import { createReview } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Add a review" };

export default async function NewReviewPage() {
  const products = await listAllProducts();
  return (
    <>
      <PageHeader
        title="Add a review"
        subtitle="Their words, not ours — paste what the customer actually sent."
        back={{ href: "/admin/reviews", label: "Reviews" }}
      />
      <ReviewForm
        products={products.map((p) => ({ value: p.slug, label: p.name }))}
        action={createReview}
        isNew
      />
    </>
  );
}
