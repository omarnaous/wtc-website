"use client";

import { EditorForm, NumberField, SelectField, TextArea, TextField } from "./fields";
import { Card } from "./ui";
import { SOURCES, type Review } from "@/lib/reviews/constants";

export default function ReviewForm({
  review,
  products,
  action,
  isNew = false,
}: {
  review?: Review;
  products: { value: string; label: string }[];
  action: (s: { error?: string; ok?: string }, d: FormData) => Promise<{ error?: string; ok?: string }>;
  isNew?: boolean;
}) {
  const r = review;

  return (
    <EditorForm action={action} className="space-y-4">
      {r && <input type="hidden" name="__id" value={r.id} />}

      <Card title="The review">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="author"
            label="Name"
            help="As it should appear on the site."
            defaultValue={r?.author}
            required
          />
          <TextField
            name="location"
            label="Where they are"
            help="Optional — shown under the name."
            placeholder="Achrafieh"
            defaultValue={r?.location}
          />
          <div className="sm:col-span-2">
            <TextArea
              name="body"
              label="What they said"
              help="Their words. Tidy the typing if you like, but do not write it for them."
              rows={5}
              defaultValue={r?.body}
            />
          </div>
          <NumberField name="rating" label="Rating out of 5" min={1} max={5} defaultValue={r?.rating ?? 5} />
          <SelectField
            name="productSlug"
            label="About which watch"
            help="Optional. Shown beside their name."
            defaultValue={r?.product_slug ?? ""}
            options={[{ value: "", label: "Not about a particular one" }, ...products]}
          />
        </div>
      </Card>

      <Card title="Where it came from" description="For your reference — none of this is shown on the site.">
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            name="source"
            label="Source"
            defaultValue={r?.source ?? "instagram"}
            options={SOURCES.map((s) => ({ value: s, label: s.replace("-", " ") }))}
          />
          <TextField
            name="reviewedOn"
            label="When they said it"
            help="YYYY-MM-DD. Optional."
            placeholder="2026-09-01"
            defaultValue={r?.reviewed_on ?? ""}
          />
          <SelectField
            name="status"
            label="Status"
            defaultValue={r?.status ?? "published"}
            options={[
              { value: "published", label: "Published" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
          <NumberField
            name="position"
            label="Sort order"
            help="Lower shows first."
            defaultValue={r?.position ?? 0}
          />
        </div>
      </Card>
    </EditorForm>
  );
}
