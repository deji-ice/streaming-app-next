import { IntentLink } from "@/components/ds/intent-link";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

import { SEARCH_TABS, searchHref, type SearchState, type TabCounts } from "./params";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * All / Movies / Series / People as real links (the tab lives in the URL).
 * Counts are TMDB totals; pass null to leave them out (while loading, or when
 * the rating filter makes them meaningless).
 *
 * The strip bleeds to the screen edges and scrolls sideways on narrow phones.
 */
export function ResultTabs({ state, counts }: { state: SearchState; counts: TabCounts | null }) {
  return (
    <nav aria-label="Result type" className="no-scrollbar relative -mx-[var(--gutter)] mt-6 overflow-x-auto px-gutter">
      <ul className="flex w-max gap-2">
        {SEARCH_TABS.map((tab) => {
          const active = state.type === tab.value;
          const count = counts ? counts[tab.value] : null;
          return (
            <li key={tab.value}>
              <IntentLink
                href={searchHref({ ...state, type: tab.value, page: 1 })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.98]",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                  focusRing,
                )}
              >
                {tab.label}
                {count !== null ? (
                  <span className={cn("tabular-nums", active ? "text-primary-foreground" : "text-subtle-foreground")}>
                    {formatCompact(count)}
                    <span className="sr-only">{count === 1 ? " result" : " results"}</span>
                  </span>
                ) : null}
              </IntentLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
