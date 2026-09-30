import { notFound } from "next/navigation";
import DangerZone from "@/components/admin/DangerZone";
import PolicyForm from "@/components/admin/PolicyForm";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { getPolicy } from "@/lib/store/policies";
import { createPolicy, deletePolicy, savePolicy } from "../actions";

export const dynamic = "force-dynamic";

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "new") {
    return (
      <>
        <PageHeader title="Add a policy" back={{ href: "/admin/policies", label: "Policies" }} />
        <PolicyForm action={createPolicy} isNew />
      </>
    );
  }

  const policy = await getPolicy(slug);
  if (!policy) notFound();

  return (
    <>
      <PageHeader
        title={policy.title}
        subtitle={`/policies/${policy.slug}`}
        back={{ href: "/admin/policies", label: "Policies" }}
        actions={
          <LinkButton href={`/policies/${policy.slug}`} target="_blank">
            View on site ↗
          </LinkButton>
        }
      />
      <div className="space-y-4">
        <PolicyForm policy={policy} action={savePolicy} />
        <DangerZone
          action={deletePolicy}
          hiddenName="__slug"
          hiddenValue={policy.slug}
          confirmWord={policy.slug}
          label="Delete this policy"
          description="Removes the page and its link in the footer."
        />
      </div>
    </>
  );
}
