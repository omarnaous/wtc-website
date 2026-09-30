"use client";

import { useActionState } from "react";
import { AutoField, EditorForm } from "./fields";
import type { PickerProduct } from "./ProductPicker";
import { Button, Card, Notice } from "./ui";
import { resetSection, saveSection, type State } from "@/app/admin/(dash)/content/actions";
import type { SectionDef } from "@/lib/content/schema";

export default function SectionEditor({
  section,
  values,
  products = [],
}: {
  section: SectionDef;
  values: Record<string, unknown>;
  /** Loaded only for sections that have a `products` field. */
  products?: PickerProduct[];
}) {
  const [resetState, resetAction] = useActionState<State, FormData>(resetSection, {});

  return (
    <div className="space-y-4">
      {resetState.error && <Notice tone="error">{resetState.error}</Notice>}
      {resetState.ok && <Notice tone="success">{resetState.ok}</Notice>}

      <EditorForm action={saveSection}>
        <input type="hidden" name="__key" value={section.key} />
        <Card title={section.label} description={section.description}>
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className={
                  field.type === "textarea" ||
                  field.type === "list" ||
                  field.type === "image" ||
                  field.type === "products"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <AutoField field={field} value={values[field.key]} products={products} />
              </div>
            ))}
          </div>
        </Card>
      </EditorForm>

      <form action={resetAction}>
        <input type="hidden" name="__key" value={section.key} />
        <Card
          title="Reset"
          description="Puts this section back to the copy the design shipped with."
        >
          <Button type="submit" tone="danger">
            Reset {section.label}
          </Button>
        </Card>
      </form>
    </div>
  );
}
