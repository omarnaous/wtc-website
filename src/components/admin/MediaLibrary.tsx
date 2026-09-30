"use client";

import { useState } from "react";
import imageData from "@/data/images.json";
import { Button, Card, INPUT, Notice, cx } from "./ui";

interface Group {
  label: string;
  dir: string;
  files: { path: string; size: number }[];
}

export interface Uploaded {
  id: string;
  key: string;
  filename: string;
  size: number;
  created_at: string;
}

const GROUPS = (imageData as { groups: Group[] }).groups ?? [];

function Copyable({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title={path}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(path);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          setCopied(false);
        }
      }}
      className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--admin-line)] bg-[var(--admin-line-soft)] p-1.5 transition-colors hover:border-[var(--admin-text)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={path} alt="" loading="lazy" className="h-full w-full object-contain" />
      <span
        className={cx(
          "absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[10px] text-white transition-opacity",
          copied ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {copied ? "Path copied" : "Copy path"}
      </span>
    </button>
  );
}

export default function MediaLibrary({
  uploadsOn,
  uploaded,
}: {
  uploadsOn: boolean;
  uploaded: Uploaded[];
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [items, setItems] = useState(uploaded);

  const groups = GROUPS.map((g) => ({
    ...g,
    files: query ? g.files.filter((f) => f.path.toLowerCase().includes(query.toLowerCase())) : g.files,
  })).filter((g) => g.files.length);

  async function upload(form: HTMLFormElement) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: new FormData(form) });
      const body = (await res.json()) as { error?: string; id?: string; filename?: string; url?: string };
      if (!res.ok) throw new Error(body.error ?? "The upload failed.");
      setItems((prev) => [
        {
          id: body.id!,
          key: body.url!.replace("/api/media/", ""),
          filename: body.filename!,
          size: 0,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setMessage({ tone: "success", text: `${body.filename} uploaded.` });
      form.reset();
    } catch (e) {
      setMessage({ tone: "error", text: e instanceof Error ? e.message : "The upload failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {uploadsOn ? (
        <Card title="Upload" description="PNG, JPEG, WebP, AVIF or SVG, up to 8 MB.">
          {message && <div className="mb-4"><Notice tone={message.tone}>{message.text}</Notice></div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void upload(e.currentTarget);
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="text-[13px] file:mr-3 file:rounded-lg file:border file:border-[var(--admin-line)] file:bg-white file:px-3 file:py-1.5 file:text-[13px]"
            />
            <Button tone="primary" type="submit" disabled={busy}>
              {busy ? "Uploading…" : "Upload"}
            </Button>
          </form>

          {items.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {items.map((m) => (
                <Copyable key={m.id} path={`/api/media/${m.key}`} />
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Notice tone="info">
          Uploads are off — R2 is not enabled on this Cloudflare account. Everything below is
          already in the site and can be used anywhere an image is asked for; any image field also
          accepts a full URL.
        </Notice>
      )}

      <Card
        title="In the site"
        description="Every picture that ships with the shop. Click one to copy its path."
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name…"
          aria-label="Filter images"
          className={cx(INPUT, "mb-4 max-w-[280px]")}
        />
        <div className="space-y-6">
          {groups.length === 0 && (
            <p className="py-6 text-center text-[13px] text-[var(--admin-mute)]">
              Nothing matches that.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.dir}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--admin-mute-2)]">
                {g.label} · {g.files.length}
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {g.files.slice(0, 48).map((f) => (
                  <Copyable key={f.path} path={f.path} />
                ))}
              </div>
              {g.files.length > 48 && (
                <p className="mt-2 text-[12px] text-[var(--admin-mute)]">
                  Showing 48 of {g.files.length} — filter to find the rest.
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
