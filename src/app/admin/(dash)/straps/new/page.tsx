import StrapForm from "@/components/admin/StrapForm";
import { PageHeader } from "@/components/admin/ui";
import { listAllProducts } from "@/lib/store/products";
import { createStrap } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Add a strap" };

export default async function NewStrapPage() {
  const products = await listAllProducts();
  return (
    <>
      <PageHeader
        title="Add a strap"
        subtitle="Fit it to watches afterwards, from each watch's page."
        back={{ href: "/admin/straps", label: "Straps" }}
      />
      <StrapForm
        products={products.map((p) => ({ value: p.slug, label: p.name }))}
        action={createStrap}
        isNew
      />
    </>
  );
}
