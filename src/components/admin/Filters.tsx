"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { INPUT, cx } from "./ui";

/**
 * Search and dropdown filters that live in the URL, so a filtered list can be
 * bookmarked and the back button behaves.
 */
export default function Filters({
  search,
  selects,
}: {
  search?: { name: string; placeholder: string };
  selects?: { name: string; label: string; options: { value: string; label: string }[] }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [term, setTerm] = useState(params.get(search?.name ?? "q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    push(next);
  };

  // Typing shouldn't fire a navigation per keystroke.
  useEffect(() => {
    if (!search) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = params.get(search.name) ?? "";
      if (current !== term) set(search.name, term);
    }, 280);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {search && (
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={search.placeholder}
          aria-label={search.placeholder}
          className={cx(INPUT, "h-9 max-w-[260px] flex-1 !py-1.5")}
        />
      )}
      {selects?.map((s) => (
        <select
          key={s.name}
          aria-label={s.label}
          value={params.get(s.name) ?? "all"}
          onChange={(e) => set(s.name, e.target.value)}
          className={cx(INPUT, "h-9 w-auto !py-1.5 pr-8 text-[13px]")}
        >
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
