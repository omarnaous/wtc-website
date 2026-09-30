"use client";

import { EditorForm, NumberField, SelectField, TextArea, TextField } from "./fields";
import { Card } from "./ui";
import type { PolicyDoc } from "@/lib/store/policies";

export default function PolicyForm({
  policy,
  action,
  isNew = false,
}: {
  policy?: PolicyDoc;
  action: (s: { error?: string; ok?: string }, d: FormData) => Promise<{ error?: string; ok?: string }>;
  isNew?: boolean;
}) {
  return (
    <EditorForm action={action}>
      {policy && <input type="hidden" name="__slug" value={policy.slug} />}
      <Card title={policy?.title ?? "New policy"}>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="title" label="Title" defaultValue={policy?.title} required />
          {isNew ? (
            <TextField
              name="slug"
              label="Web address"
              help="Leave empty to build it from the title."
              placeholder="shipping"
            />
          ) : (
            <NumberField name="position" label="Sort order" defaultValue={policy?.position ?? 0} />
          )}
          <div className="sm:col-span-2">
            <TextField
              name="summary"
              label="Summary"
              help="One line. Shown on the policies list and in the footer."
              defaultValue={policy?.summary}
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              name="body"
              label="Body"
              help="Leave a blank line between paragraphs."
              rows={12}
              defaultValue={policy?.body.join("\n\n")}
            />
          </div>
          {!isNew && (
            <SelectField
              name="status"
              label="Status"
              defaultValue={policy?.status ?? "active"}
              options={[
                { value: "active", label: "Published" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
          )}
        </div>
      </Card>
    </EditorForm>
  );
}
