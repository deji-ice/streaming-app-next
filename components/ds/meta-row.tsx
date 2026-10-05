import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface MetaRowProps {
  /** Falsy items (null, undefined, false, "", 0) are skipped. */
  items: Array<ReactNode | null | undefined | false>;
  className?: string;
}

/**
 * Inline metadata (year, certification, runtime, genres...). Items are spaced
 * with gap only, never separator glyphs.
 */
export function MetaRow({ items, className }: MetaRowProps) {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground tabular-nums md:text-sm",
        className,
      )}
    >
      {visible.map((item, index) => (
        <li key={index} className="inline-flex items-center">
          {item}
        </li>
      ))}
    </ul>
  );
}
