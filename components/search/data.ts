import "server-only";

import {
  searchMovies,
  searchMulti,
  searchPeople,
  searchTv,
  type CardDTO,
  type PersonCardDTO,
} from "@/lib/tmdb";

import type { SearchState, TabCounts } from "./params";

/**
 * Data for /search. Server only.
 *
 * One page view makes at most four TMDB calls, all cached for an hour by the
 * data layer, so switching tabs for the same query costs no new requests:
 *
 * - All, no filters: multi search for the page + movie, tv and person page 1 (tab counts).
 * - All with a year or rating filter: movie page + tv page (merged, titles only,
 *   year applied by TMDB) + person page 1 (count).
 * - Movies, Series, People: that typed search for the page + the other two page 1.
 *
 * TMDB multi search has no year filter and no search endpoint has a rating
 * filter, which is why "All" switches to the typed searches when a filter is
 * set. The rating filter is applied to the titles of the current page only.
 */

export interface SearchResults {
  /** Titles to show on this page, after the rating filter. */
  titles: CardDTO[];
  people: PersonCardDTO[];
  /** True when TMDB ranks a person first on the unfiltered All tab. */
  topHitIsPerson: boolean;
  /** Titles TMDB returned for this page, before the rating filter. */
  titlesBeforeRating: number;
  /** TMDB's total for the active tab, across all pages. */
  totalResults: number;
  totalPages: number;
  /** TMDB totals per tab (year applied where TMDB supports it, rating not applied). */
  counts: TabCounts;
}

const unwrap = <T>(result: PromiseSettledResult<T>): T => {
  if (result.status === "rejected") throw result.reason;
  return result.value;
};

const valueOf = <T>(result: PromiseSettledResult<T>): T | null =>
  result.status === "fulfilled" ? result.value : null;

/** a1, b1, a2, b2 ... keeps each list's own relevance order. */
function interleave<T>(first: readonly T[], second: readonly T[]): T[] {
  const merged: T[] = [];
  const length = Math.max(first.length, second.length);
  for (let i = 0; i < length; i += 1) {
    if (i < first.length) merged.push(first[i]);
    if (i < second.length) merged.push(second[i]);
  }
  return merged;
}

function sum(values: ReadonlyArray<number | null>): number | null {
  let total = 0;
  for (const value of values) {
    if (value === null) return null;
    total += value;
  }
  return total;
}

export async function loadSearch(state: SearchState): Promise<SearchResults> {
  const { q, type, year, minRating, page } = state;
  const filtered = year !== null || minRating !== null;
  const mergedTitles = type === "all" && filtered;
  const useMulti = type === "all" && !filtered;

  const [multi, movies, series, people] = await Promise.allSettled([
    useMulti ? searchMulti(q, page) : Promise.resolve(null),
    searchMovies(q, { year, page: type === "movie" || mergedTitles ? page : 1 }),
    searchTv(q, { year, page: type === "tv" || mergedTitles ? page : 1 }),
    searchPeople(q, type === "person" ? page : 1),
  ]);

  const movieTotal = valueOf(movies)?.totalResults ?? null;
  const tvTotal = valueOf(series)?.totalResults ?? null;
  const personTotal = valueOf(people)?.totalResults ?? null;
  const multiTotal = valueOf(multi)?.totalResults ?? null;

  // Multi search totals equal movie + tv + person totals (checked against TMDB).
  const counts: TabCounts = {
    movie: movieTotal,
    tv: tvTotal,
    person: personTotal,
    all: filtered ? sum([movieTotal, tvTotal]) : (multiTotal ?? sum([movieTotal, tvTotal, personTotal])),
  };

  let titles: CardDTO[] = [];
  let peopleRows: PersonCardDTO[] = [];
  let topHitIsPerson = false;
  let totalResults = 0;
  let totalPages = 0;

  if (useMulti) {
    const paged = unwrap(multi);
    if (!paged) throw new Error("Search returned no data");
    for (const row of paged.results) {
      if (row.mediaType === "person") peopleRows.push(row);
      else titles.push(row);
    }
    topHitIsPerson = paged.results[0]?.mediaType === "person";
    totalResults = paged.totalResults;
    totalPages = paged.totalPages;
  } else if (mergedTitles) {
    const movie = unwrap(movies);
    const tv = unwrap(series);
    titles = interleave(movie.results, tv.results);
    totalResults = movie.totalResults + tv.totalResults;
    totalPages = Math.max(movie.totalPages, tv.totalPages);
  } else if (type === "movie") {
    const movie = unwrap(movies);
    titles = movie.results;
    totalResults = movie.totalResults;
    totalPages = movie.totalPages;
  } else if (type === "tv") {
    const tv = unwrap(series);
    titles = tv.results;
    totalResults = tv.totalResults;
    totalPages = tv.totalPages;
  } else {
    const paged = unwrap(people);
    peopleRows = paged.results;
    totalResults = paged.totalResults;
    totalPages = paged.totalPages;
  }

  const titlesBeforeRating = titles.length;
  if (minRating !== null) {
    titles = titles.filter((title) => (title.rating ?? 0) >= minRating);
  }

  return {
    titles,
    people: peopleRows,
    topHitIsPerson,
    titlesBeforeRating,
    totalResults,
    totalPages,
    counts,
  };
}
