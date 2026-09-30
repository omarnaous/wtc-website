import { notFound } from "next/navigation";
import SectionEditor from "@/components/admin/SectionEditor";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { sectionByKey } from "@/lib/content/schema";
import { getSection } from "@/lib/store/content";
import { readBinding } from "@/lib/content/bindings";
import { listAllProducts } from "@/lib/store/products";

export const dynamic = "force-dynamic";

export default async function SectionPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const section = sectionByKey(key);
  if (!section) notFound();

  const values = await getSection(key);

  // A bound field's value lives elsewhere — read it in over the section JSON.
  for (const field of section.fields) {
    if (field.binding) values[field.key] = await readBinding(field.binding);
  }

  // Only the sections that actually pick watches pay for the catalogue query.
  const needsProducts = section.fields.some((f) => f.type === "products");
  const products = needsProducts
    ? (await listAllProducts()).map((p) => ({
        slug: p.slug,
        name: p.name,
        shortName: p.shortName,
        image: p.images.front,
        status: p.status,
      }))
    : [];

  return (
    <>
      <PageHeader
        title={section.label}
        subtitle={section.description}
        back={{ href: "/admin/content", label: "Sections" }}
        actions={
          section.preview ? (
            <LinkButton href={section.preview} target="_blank">
              View on site ↗
            </LinkButton>
          ) : null
        }
      />
      <SectionEditor section={section} values={values} products={products} />
    </>
  );
}
