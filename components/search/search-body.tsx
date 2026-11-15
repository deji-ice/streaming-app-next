import { TrackEvent } from "@/components/analytics/track-event";

import { loadSearch } from "./data";
import { MIN_QUERY_LENGTH, type SearchState } from "./params";
import { ResultTabs } from "./result-tabs";
import { SearchResultsView } from "./search-results";

/**
 * Tabs + results for a query. Async: awaits TMDB, so render it inside a
 * Suspense boundary (see app/search/page.tsx). Errors propagate to
 * app/error.tsx.
 */
export async function SearchBody({ state }: { state: SearchState }) {
  const data = await loadSearch(state);
  const { counts } = data;

  // Nothing in any tab: the tabs would only repeat "0", so show the empty state alone.
  const nothingAnywhere = counts.movie === 0 && counts.tv === 0 && counts.person === 0;
  // TMDB totals ignore the rating filter, so counts are left out while it is set.
  const showCounts = state.minRating === null;

  // One search event per typed query: a real query (not the empty page), and not for
  // pagination. Searches with no results show which titles people want that are missing.
  const isNewSearch = state.q.length >= MIN_QUERY_LENGTH && state.page === 1;

  return (
    <>
      {isNewSearch ? (
        <TrackEvent
          name="search"
          dedupeKey={state.q}
          params={{
            search_term: state.q,
            result_count: data.totalResults,
            no_results: nothingAnywhere,
          }}
        />
      ) : null}
      {nothingAnywhere ? null : <ResultTabs state={state} counts={showCounts ? counts : null} />}
      <SearchResultsView state={state} data={data} />
    </>
  );
}
