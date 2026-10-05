import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/ds/empty-state";

import { MIN_QUERY_LENGTH, type SearchState } from "./params";

/**
 * Page wrapper and the one h1 for /search. Shared by the page and its
 * loading.tsx so the header is identical in both by construction.
 */
export function SearchPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-gutter pb-16 pt-6 md:pt-10">
      <h1 className="type-display-md text-foreground">Search</h1>
      {children}
    </div>
  );
}

/** Shown before there is a query to search for (empty, or shorter than the minimum). */
export function SearchPrompt({ state }: { state: Pick<SearchState, "q"> }) {
  const tooShort = state.q.length > 0 && state.q.length < MIN_QUERY_LENGTH;
  return (
    <EmptyState
      className="mt-8"
      icon={<MagnifyingGlassIcon weight="duotone" />}
      title={tooShort ? `Enter at least ${MIN_QUERY_LENGTH} characters` : "Search movies, series and people"}
      body={
        tooShort
          ? "Add a little more and press Search."
          : "Type a title or a name, then press Search. Use the tabs and filters to narrow the results."
      }
    />
  );
}
