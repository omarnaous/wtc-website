"use client";

import { useState } from "react";
import { ColorField, EditorForm, TextArea, TextField } from "./fields";
import { Button, Card } from "./ui";
import { createCollection } from "@/app/admin/(dash)/collections/actions";

export default function NewCollection() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} tone="primary">
        Add a collection
      </Button>
    );
  }

  return (
    <EditorForm action={createCollection}>
      <Card
        title="New collection"
        description="A brand or house. Watches are put into one from their own page."
        actions={
          <Button type="button" tone="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Name" placeholder="Blancpain × Swatch" required />
          <TextField name="id" label="Id" help="Leave empty to build it from the name." />
          <div className="sm:col-span-2">
            <TextArea name="blurb" label="Blurb" rows={2} />
          </div>
          <ColorField name="accent" label="Accent colour" defaultValue="#c9a227" />
        </div>
      </Card>
    </EditorForm>
  );
}
