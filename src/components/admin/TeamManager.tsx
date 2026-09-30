"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  changeRole,
  inviteMember,
  removeMember,
  revokeInvite,
  setStatus,
  type State,
} from "@/app/admin/(dash)/team/actions";
import { Button, Card, INPUT, Label, Notice, Pill, cx, shortDate } from "./ui";

export interface Member {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "staff";
  status: "active" | "suspended";
  created_at: string;
  last_login_at: string | null;
}

export interface Invite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

const ROLE_HELP: Record<string, string> = {
  owner: "Everything, including removing other owners.",
  admin: "Everything except removing an owner.",
  staff: "Orders, inventory and the figures — no catalogue or settings.",
};

function Submit({ children, tone = "primary" }: { children: string; tone?: "primary" | "default" }) {
  const { pending } = useFormStatus();
  return (
    <Button tone={tone} type="submit" disabled={pending}>
      {pending ? "Working…" : children}
    </Button>
  );
}

function CopyLink({ href }: { href: string }) {
  const [copied, setCopied] = useState(false);
  const full = typeof window === "undefined" ? href : new URL(href, window.location.origin).toString();

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-md bg-black/5 px-2 py-1.5 text-[12px]">
        {full}
      </code>
      <Button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(full);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        className="!py-1.5 !text-[12px]"
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}

export default function TeamManager({
  members,
  invites,
  me,
}: {
  members: Member[];
  invites: Invite[];
  me: { id: string; role: string };
}) {
  const [inviteState, inviteAction] = useActionState<State, FormData>(inviteMember, {});
  const [roleState, roleAction] = useActionState<State, FormData>(changeRole, {});
  const [statusState, statusAction] = useActionState<State, FormData>(setStatus, {});
  const [revokeState, revokeAction] = useActionState<State, FormData>(revokeInvite, {});
  const [removeState, removeAction] = useActionState<State, FormData>(removeMember, {});
  const [confirming, setConfirming] = useState<string | null>(null);

  const notices = [roleState, statusState, revokeState, removeState];

  return (
    <div className="space-y-4">
      {notices.map((n, i) => (n.error ? <Notice key={i} tone="error">{n.error}</Notice> : null))}
      {notices.map((n, i) => (n.ok ? <Notice key={`ok-${i}`} tone="success">{n.ok}</Notice> : null))}

      <Card title="Accounts" description={`${members.length} with access to this dashboard.`} bodyClassName="p-0">
        <ul className="divide-y divide-[var(--admin-line-soft)]">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-line-soft)] text-[12px] font-semibold">
                {m.name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[13.5px] font-medium">{m.name}</span>
                  {m.id === me.id && <Pill tone="blue">You</Pill>}
                  {m.status === "suspended" && <Pill tone="red">Suspended</Pill>}
                </span>
                <span className="block truncate text-[12px] text-[var(--admin-mute)]">
                  {m.email} ·{" "}
                  {m.last_login_at ? `last in ${shortDate(m.last_login_at)}` : "never signed in"}
                </span>
              </span>

              <form action={roleAction} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={m.id} />
                <select
                  name="role"
                  defaultValue={m.role}
                  aria-label={`Role for ${m.name}`}
                  disabled={m.id === me.id}
                  className={cx(INPUT, "h-8 w-auto !py-1 pr-7 text-[12.5px] disabled:opacity-60")}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                {m.id !== me.id && (
                  <button
                    type="submit"
                    className="rounded-md border border-[var(--admin-line)] px-2 py-1 text-[12px] hover:bg-[var(--admin-line-soft)]"
                  >
                    Set
                  </button>
                )}
              </form>

              {m.id !== me.id && (
                <div className="flex items-center gap-1.5">
                  <form action={statusAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={m.status === "active" ? "suspended" : "active"}
                    />
                    <button
                      type="submit"
                      className="rounded-md px-2 py-1 text-[12px] text-[var(--admin-mute)] hover:bg-[var(--admin-line-soft)] hover:text-[var(--admin-text)]"
                    >
                      {m.status === "active" ? "Suspend" : "Restore"}
                    </button>
                  </form>

                  {confirming === m.id ? (
                    <form action={removeAction} className="flex items-center gap-1">
                      <input type="hidden" name="__id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-red-600 px-2 py-1 text-[12px] font-medium text-white"
                      >
                        Really remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(null)}
                        className="rounded-md px-1.5 py-1 text-[12px] text-[var(--admin-mute)]"
                      >
                        No
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(m.id)}
                      className="rounded-md px-2 py-1 text-[12px] text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {invites.length > 0 && (
        <Card title="Pending invites" bodyClassName="p-0">
          <ul className="divide-y divide-[var(--admin-line-soft)]">
            {invites.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{i.email}</span>
                  <span className="block text-[12px] text-[var(--admin-mute)]">
                    {i.role} · expires {shortDate(i.expires_at)}
                  </span>
                </span>
                <form action={revokeAction}>
                  <input type="hidden" name="id" value={i.id} />
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1 text-[12px] text-red-600 hover:bg-red-50"
                  >
                    Revoke
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card
        title="Invite someone"
        description="They get a one-time link and choose their own password — no passwords over chat."
      >
        {inviteState.error && (
          <div className="mb-4">
            <Notice tone="error">{inviteState.error}</Notice>
          </div>
        )}
        {inviteState.ok && (
          <div className="mb-4">
            <Notice tone="success">
              {inviteState.ok}
              {inviteState.link && <CopyLink href={inviteState.link} />}
            </Notice>
          </div>
        )}

        <form action={inviteAction} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <input
              id="invite-email"
              name="email"
              type="email"
              required
              className={INPUT}
              placeholder="them@example.com"
            />
          </div>
          <div>
            <Label htmlFor="invite-role">Role</Label>
            <select id="invite-role" name="role" defaultValue="staff" className={cx(INPUT, "pr-8")}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              {me.role === "owner" && <option value="owner">Owner</option>}
            </select>
          </div>
          <Submit>Create invite</Submit>
        </form>

        <dl className="mt-5 space-y-1.5 border-t border-[var(--admin-line-soft)] pt-4 text-[12.5px]">
          {Object.entries(ROLE_HELP).map(([role, help]) => (
            <div key={role} className="flex gap-2">
              <dt className="w-14 shrink-0 font-medium capitalize">{role}</dt>
              <dd className="text-[var(--admin-mute)]">{help}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
