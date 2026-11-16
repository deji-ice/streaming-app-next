/**
 * URL state for the catalog pages (/movie, /series, /browse/[slug],
 * /company/[slug], /network/[slug]): parsing, normalizing and building links.
 *
 * Plain functions with no server-only imports, so Server Components and the
 * small client leaves (SortSelect and friends) share them.
 */

/** TMDB media type. The app route for "tv" is /series. */
export type CatalogType = "movie" | "tv";

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Values a catalog URL can carry. Missing, null and empty values are left out of the URL. */
export type CatalogQuery = Record<string, string | number | null | undefined>;

/** TMDB serves at most 500 pages of discover results. */
export const MAX_PAGE = 500;
/**
 * Genres are AND-ed by TMDB, so two is already narrow. Kept low on purpose: every genre
 * chip is a crawlable link, and at 5 genres in any order each catalog page had about
 * 1.5 million distinct URLs. A scraper walking them made each request a full, uncached
 * render (Nov 2026). With 2, sorted, it is 1 + 27 + 351 per page.
 */
export const MAX_GENRES = 2;

/**
 * Every TMDB genre id, movie and TV together (GET /genre/movie/list and /genre/tv/list,
 * checked 2026-11-15). middleware.ts runs before any TMDB call, so it cannot fetch the
 * list; ids outside it are dropped from URLs. If TMDB adds a genre, add its id here or the
 * new chip's links will redirect back without it.
 */
export const TMDB_GENRE_IDS: ReadonlySet<number> = new Set([
  12, 14, 16, 18, 27, 28, 35, 36, 37, 53, 80, 99, 878, 9648, 10402, 10749, 10751, 10752, 10759, 10762,
  10763, 10764, 10765, 10766, 10767, 10768, 10770,
]);
export const DEFAULT_SORT = "popularity.desc";

export type CatalogSort =
  | "popularity.desc"
  | "vote_average.desc"
  | "release_date.desc"
  | "first_air_date.desc";

export interface SortOption {
  value: CatalogSort;
  label: string;
}

/** First value of a search param ("" when missing). */
export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** 1..500, 1 for anything that is not a positive integer. */
export function parsePage(raw: string): number {
  const page = Number.parseInt(raw, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, MAX_PAGE);
}

/** "movie" | "movies" -> movie, "tv" | "series" -> tv, anything else -> null. */
export function parseType(raw: string): CatalogType | null {
  switch (raw.trim().toLowerCase()) {
    case "movie":
    case "movies":
      return "movie";
    case "tv":
    case "series":
      return "tv";
    default:
      return null;
  }
}

/**
 * "35,18" -> [18, 35]. Known TMDB genre ids only, unique, the first MAX_GENRES given, then
 * sorted, so every selection has exactly one URL (see canonicalGenreHref).
 */
export function parseGenreIds(raw: string): number[] {
  const ids: number[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!/^\d{1,7}$/.test(trimmed)) continue;
    const id = Number(trimmed);
    if (TMDB_GENRE_IDS.has(id) && !ids.includes(id)) ids.push(id);
    if (ids.length === MAX_GENRES) break;
  }
  return ids.sort((a, b) => a - b);
}

/**
 * Where to send a catalog URL whose ?genres= is not in canonical form (unsorted, repeated,
 * unknown ids, more than MAX_GENRES, or the param given twice). Returns null when the URL is
 * already canonical. Used by middleware.ts, so a non-canonical URL costs a redirect, not a
 * render plus TMDB calls. Other params are kept as they are.
 */
export function canonicalGenreHref(href: string): string | null {
  const url = new URL(href);
  const values = url.searchParams.getAll("genres");
  if (values.length === 0) return null;
  const canonical = parseGenreIds(values[0]).join(",");
  if (values.length === 1 && values[0] === canonical) return null;
  // set() keeps the param where it was and drops any repeats.
  if (canonical) url.searchParams.set("genres", canonical);
  else url.searchParams.delete("genres");
  // Same readable commas as catalogHref (?genres=18,35).
  url.search = url.searchParams.toString().replace(/%2C/gi, ",");
  return url.href;
}

const NEWEST = /^(primary_)?release_date\.desc$|^first_air_date\.desc$|^latest(_air_date)?(\.desc)?$|^newest$/;

/** The "newest first" sort value for a media type (movies: release_date.desc, series: first_air_date.desc). */
export function newestSort(type: CatalogType): CatalogSort {
  return type === "movie" ? "release_date.desc" : "first_air_date.desc";
}

/**
 * Maps any sort string a URL may carry to one of the three sorts the UI
 * offers. The page passes this value to TMDB, so what the select shows is
 * always what was fetched.
 */
export function canonicalSort(type: CatalogType, raw: string | null | undefined): CatalogSort {
  const value = (raw ?? "").trim();
  if (NEWEST.test(value)) return newestSort(type);
  if (value === "vote_average.desc") return "vote_average.desc";
  return DEFAULT_SORT;
}

export function sortOptions(type: CatalogType): SortOption[] {
  return [
    { value: "popularity.desc", label: "Most popular" },
    { value: "vote_average.desc", label: "Highest rated" },
    { value: newestSort(type), label: "Newest" },
  ];
}

/**
 * Builds `${basePath}?a=b&c=d`. Empty values are left out. Commas stay
 * readable (?genres=28,12); they are legal in a query string.
 */
export function catalogHref(basePath: string, query: CatalogQuery = {}): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value)).replace(/%2C/gi, ",")}`);
  }
  return parts.length > 0 ? `${basePath}?${parts.join("&")}` : basePath;
}

/**
 * The params every link on a catalog page keeps (everything except `page`).
 * Defaults are left out so URLs stay short: the default sort is never written.
 */
export function pageQuery(input: {
  type?: CatalogType | null;
  sort?: string | null;
  genres?: readonly number[];
}): CatalogQuery {
  return {
    type: input.type ?? undefined,
    sort: input.sort && input.sort !== DEFAULT_SORT ? input.sort : undefined,
    genres: input.genres && input.genres.length > 0 ? input.genres.join(",") : undefined,
  };
}

/**
 * Adds the genre when it is not selected, removes it when it is. The result is sorted, the
 * canonical order. GenreChips offers no "add" once MAX_GENRES are selected; the slice only
 * guards other callers.
 */
export function toggleGenre(selected: readonly number[], id: number): number[] {
  if (selected.includes(id)) return selected.filter((genreId) => genreId !== id);
  return [...selected, id].slice(-MAX_GENRES).sort((a, b) => a - b);
}

/** Canonical path of a catalog page: no sort, no genres, `page` only above 1. */
export function catalogCanonical(basePath: string, opts: { type?: CatalogType | null; page?: number } = {}): string {
  return catalogHref(basePath, {
    type: opts.type ?? undefined,
    page: opts.page && opts.page > 1 ? opts.page : undefined,
  });
}

export type PageSlot = number | "gap-start" | "gap-end";

/**
 * Page numbers shown on desktop: always 7 slots once there are more than 7
 * pages, so the control keeps its width while paging.
 * 1 2 3 4 5 ... 500 | 1 ... 7 8 9 ... 500 | 1 ... 496 497 498 499 500
 */
export function pageWindow(current: number, total: number): PageSlot[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "gap-end", total];
  if (current >= total - 3) return [1, "gap-start", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "gap-start", current - 1, current, current + 1, "gap-end", total];
}
