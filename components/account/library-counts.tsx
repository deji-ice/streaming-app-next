import { SkeletonBlock } from "@/components/ds/skeletons";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CountItem {
  label: string;
  /** null or undefined while the count is loading. */
  value: number | null | undefined;
}

interface LibraryCountsProps {
  items: CountItem[];
  /** "row": labelled numbers side by side (dashboard). "list": label left, number right (profile). */
  layout?: "row" | "list";
  className?: string;
}

/**
 * Real counts as plain labelled figures, never tiles. Values come straight
 * from the account data; a skeleton stands in while one is loading.
 */
export function LibraryCounts({ items, layout = "row", className }: LibraryCountsProps) {
  if (layout === "list") {
    return (
      <dl className={cn("divide-y divide-border border-y border-border", className)}>
        {items.map((item) => (
          <div key={item.label} className="flex min-h-14 items-center justify-between gap-4 py-3">
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="flex h-7 items-center font-display text-xl font-bold tabular-nums text-foreground">
              {item.value === null || item.value === undefined ? (
                <SkeletonBlock className="h-5 w-8 rounded-full" />
              ) : (
                formatCompact(item.value)
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={cn("flex flex-wrap gap-x-10 gap-y-5", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[13px] leading-5 text-subtle-foreground">{item.label}</dt>
          <dd className="mt-1 flex h-9 items-center font-display text-3xl font-bold leading-none tabular-nums text-foreground [font-stretch:86%]">
            {item.value === null || item.value === undefined ? (
              <SkeletonBlock className="h-7 w-10 rounded-full" />
            ) : (
              formatCompact(item.value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
