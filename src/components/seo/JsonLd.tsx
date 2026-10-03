/**
 * Structured data for search engines (schema.org, as JSON-LD). What lets
 * Google show a watch with its price and stock, the shop with its logo, and a
 * search box under the result.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // `<` escaped so a product description can never close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
