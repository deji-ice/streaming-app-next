/**
 * /search URL state: parsing, normalizing and building links.
 *
 * Plain functions with no server-only imports, so Server Components and
 * client leaves can share them.
 */

export type SearchTab = "all" | "movie" | "tv" | "person";

export interface SearchState {
  /** Trimmed query as typed (case kept for display), at most 100 characters. */
  q: string;
  type: SearchTab;
  /** Release year (movies) or first-air year (series). */
  year: number | null;
  /** Minimum TMDB rating, 0 < r <= 10. */
  minRating: number | null;
  page: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** TMDB result totals per tab; null when a count could not be loaded. */
export type TabCounts = Record<SearchTab, number | null>;

export const MAX_QUERY_LENGTH = 100;
/** Shorter queries are not sent to TMDB (the API route also returns an empty page). */
export const MIN_QUERY_LENGTH = 2;
/** TMDB serves at most 500 pages of search results. */
export const MAX_PAGE = 500;
export const MIN_YEAR = 1900;
export const RATING_OPTIONS = [5, 6, 7, 8, 9] as const;

export const SEARCH_TABS: ReadonlyArray<{ value: SearchTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
  { value: "person", label: "People" },
];

const first = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export function parseTab(value: string): SearchTab {
  switch (value.trim().toLowerCase()) {
    case "movie":
    case "movies":
      return "movie";
    case "tv":
    case "series":
      return "tv";
    case "person":
    case "people":
      return "person";
    default:
      return "all";
  }
}

export function parseYear(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d{4}$/.test(trimmed)) return null;
  const year = Number(trimmed);
  return year >= 1870 && year <= 2100 ? year : null;
}

export function parseMinRating(value: string): number | null {
  const rating = Number.parseFloat(value);
  if (!Number.isFinite(rating) || rating <= 0) return null;
  return Math.round(Math.min(rating, 10) * 10) / 10;
}

export function parsePage(value: string): number {
  const page = Number.parseInt(value, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, MAX_PAGE);
}

export function parseSearchParams(params: RawSearchParams): SearchState {
  return {
    q: first(params.q).replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH),
    type: parseTab(first(params.type)),
    year: parseYear(first(params.year)),
    minRating: parseMinRating(first(params.minRating)),
    page: parsePage(first(params.page)),
  };
}

/** Year and rating filters never apply to people. */
export const filtersApply = (type: SearchTab) => type !== "person";

/** True when a year or rating filter is set and the current tab can use it. */
export const hasFilters = (state: Pick<SearchState, "year" | "minRating" | "type">) =>
  filtersApply(state.type) && (state.year !== null || state.minRating !== null);

/** True when the query is long enough to search. */
export const hasQuery = (state: Pick<SearchState, "q">) => state.q.length >= MIN_QUERY_LENGTH;

/**
 * Builds a /search URL. Empty values are left out, page 1 is implicit and
 * the type is written as "movie" | "tv" | "person" (TV links say "tv", the
 * value the API uses; "series" is still accepted when parsing).
 */
export function searchHref(state: Partial<SearchState>): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.type && state.type !== "all") params.set("type", state.type);
  if (state.year) params.set("year", String(state.year));
  if (state.minRating) params.set("minRating", String(state.minRating));
  if (state.page && state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

/** Years offered in the filter: next year down to MIN_YEAR, plus a selected year outside that range. */
export function yearOptions(currentYear: number, selected: number | null): number[] {
  const years: number[] = [];
  for (let year = currentYear + 1; year >= MIN_YEAR; year -= 1) years.push(year);
  if (selected !== null && !years.includes(selected)) {
    years.push(selected);
    years.sort((a, b) => b - a);
  }
  return years;
}

/** Rating thresholds offered in the filter, plus a selected value that is not one of them. */
export function ratingOptions(selected: number | null): number[] {
  const values: number[] = [...RATING_OPTIONS];
  if (selected !== null && !values.includes(selected)) {
    values.push(selected);
    values.sort((a, b) => a - b);
  }
  return values;
}

/** "movie" | "movies", "series", "person" | "people", "result" | "results". */
export function resultNoun(type: SearchTab, count: number): string {
  const one = count === 1;
  if (type === "movie") return one ? "movie" : "movies";
  if (type === "tv") return "series";
  if (type === "person") return one ? "person" : "people";
  return one ? "result" : "results";
}
