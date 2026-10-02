import { loadSearch } from "./data";
import type { SearchState } from "./params";
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

  return (
    <>
      {nothingAnywhere ? null : <ResultTabs state={state} counts={showCounts ? counts : null} />}
      <SearchResultsView state={state} data={data} />
    </>
  );
}
