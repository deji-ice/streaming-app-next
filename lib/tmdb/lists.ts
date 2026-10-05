import "server-only";
import { cached, TTL } from "./cached";
import { tmdbFetch, type TmdbParams } from "./client";
import { toCards, toGenres, toPaged, type RawListItem, type RawPaged } from "./normalize";
import type { CardDTO, GenreDTO, MediaType, Paged } from "./types";

/* ------------------------------------------------------------------------ */
/* Shared helpers                                                            */
/* ------------------------------------------------------------------------ */

/** Clamp a page number to TMDB's 1..500. */
export function clampPage(page: unknown): number {
  const n = typeof page === "number" ? page : Number.parseInt(String(page ?? "1"), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(500, Math.max(1, Math.trunc(n)));
}

/** UTC date (YYYY-MM-DD) `offsetDays` from today; day-rounded so cache keys stay stable for a day. */
export function isoDay(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Talk (10767), news (10763), reality (10764) and documentary (99) are excluded from "new" TV rows. */
export const TV_NOISE_GENRES = "10763,10767,10764,99";

/** Stable query string for cache keys: sorted keys, empty values dropped. */
function stableQuery(params: TmdbParams): string {
  const qs = new URLSearchParams();
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, String(value));
  }
  return qs.toString();
}

const parseQuery = (qs: string): TmdbParams => Object.fromEntries(new URLSearchParams(qs).entries());

/* ------------------------------------------------------------------------ */
/* Genres                                                                    */
/* ------------------------------------------------------------------------ */

/** One genre list per media type (movie and TV ids differ, never merge them). */
export const getGenres = cached(
  "genres",
  TTL.config,
  (type: MediaType) => ["genres", `genres:${type}`],
  async (type: MediaType): Promise<GenreDTO[]> => {
    const raw = await tmdbFetch<{ genres?: { id: number; name: string }[] }>(`/genre/${type}/list`);
    return toGenres(raw.genres);
  },
);

/** Genre id -> name for one media type. */
export async function getGenreMap(type: MediaType): Promise<Record<number, string>> {
  const genres = await getGenres(type);
  return Object.fromEntries(genres.map((g) => [g.id, g.name]));
}

/* ------------------------------------------------------------------------ */
/* Trending and fixed lists                                                  */
/* ------------------------------------------------------------------------ */

export type TrendingType = "all" | "movie" | "tv";
export type TrendingWindow = "day" | "week";

const trendingLoader = cached(
  "trending",
  TTL.trending,
  (type, window, _page) => ["trending", `trending:${type}:${window}`],
  async (type: TrendingType, window: TrendingWindow, page: number): Promise<Paged<CardDTO>> => {
    const raw = await tmdbFetch<RawPaged<RawListItem>>(`/trending/${type}/${window}`, { page });
    return toPaged(raw, toCards(raw.results, type === "all" ? undefined : type));
  },
);

/** /trending/{type}/{window}. People are dropped from "all". */
export function getTrending(type: TrendingType = "all", window: TrendingWindow = "week", page: number = 1): Promise<Paged<CardDTO>> {
  return trendingLoader(type, window, clampPage(page));
}

export const MOVIE_LISTS = ["popular", "now_playing", "upcoming", "top_rated"] as const;
export type MovieList = (typeof MOVIE_LISTS)[number];
export const TV_LISTS = ["popular", "airing_today", "on_the_air", "top_rated"] as const;
export type TvList = (typeof TV_LISTS)[number];

export const isMovieList = (value: string): value is MovieList => (MOVIE_LISTS as readonly string[]).includes(value);
export const isTvList = (value: string): value is TvList => (TV_LISTS as readonly string[]).includes(value);

const movieListLoaders = Object.fromEntries(
  MOVIE_LISTS.map((list) => [
    list,
    cached(
      `list:movie:${list}`,
      list === "top_rated" ? TTL.listTopRated : TTL.list,
      () => [`list:movie:${list}`],
      async (page: number, region: string): Promise<Paged<CardDTO>> => {
        const raw = await tmdbFetch<RawPaged<RawListItem>>(`/movie/${list}`, { page, region: region || undefined });
        return toPaged(raw, toCards(raw.results, "movie"));
      },
    ),
  ]),
) as Record<MovieList, (page: number, region: string) => Promise<Paged<CardDTO>>>;

const tvListLoaders = Object.fromEntries(
  TV_LISTS.map((list) => [
    list,
    cached(
      `list:tv:${list}`,
      list === "top_rated" ? TTL.listTopRated : list === "popular" ? TTL.list : TTL.listAiring,
      () => [`list:tv:${list}`],
      async (page: number): Promise<Paged<CardDTO>> => {
        const raw = await tmdbFetch<RawPaged<RawListItem>>(`/tv/${list}`, { page });
        return toPaged(raw, toCards(raw.results, "tv"));
      },
    ),
  ]),
) as Record<TvList, (page: number) => Promise<Paged<CardDTO>>>;

/** /movie/{popular|now_playing|upcoming|top_rated}. `region` (ISO 3166-1) narrows release-based lists. */
export function getMovieList(list: MovieList, page: number = 1, region?: string): Promise<Paged<CardDTO>> {
  return movieListLoaders[list](clampPage(page), region ? region.toUpperCase() : "");
}

/** /tv/{popular|airing_today|on_the_air|top_rated}. */
export function getTvList(list: TvList, page: number = 1): Promise<Paged<CardDTO>> {
  return tvListLoaders[list](clampPage(page));
}

/* ------------------------------------------------------------------------ */
/* Discover                                                                  */
/* ------------------------------------------------------------------------ */

export const MOVIE_SORTS = ["popularity.desc", "primary_release_date.desc", "vote_average.desc", "vote_count.desc", "revenue.desc"] as const;
export type MovieSort = (typeof MOVIE_SORTS)[number];
export const TV_SORTS = ["popularity.desc", "first_air_date.desc", "vote_average.desc", "vote_count.desc"] as const;
export type TvSort = (typeof TV_SORTS)[number];

/**
 * Map any sort string the app uses to a sort TMDB honors for that media type
 * (unsupported values are silently ignored by TMDB, finding 9). Legacy
 * aliases: "release_date.desc" and "first_air_date.desc" mean newest for both.
 */
export function normalizeSort(type: "movie", sort?: string | null): MovieSort;
export function normalizeSort(type: "tv", sort?: string | null): TvSort;
export function normalizeSort(type: MediaType, sort?: string | null): MovieSort | TvSort;
export function normalizeSort(type: MediaType, sort?: string | null): MovieSort | TvSort {
  const s = (sort ?? "").trim();
  const newest = /^(primary_)?release_date\.desc$|^first_air_date\.desc$|^latest(_air_date)?(\.desc)?$|^newest$/.test(s);
  if (type === "movie") {
    if (newest) return "primary_release_date.desc";
    return (MOVIE_SORTS as readonly string[]).includes(s) ? (s as MovieSort) : "popularity.desc";
  }
  if (newest) return "first_air_date.desc";
  if (s === "revenue.desc") return "popularity.desc";
  return (TV_SORTS as readonly string[]).includes(s) ? (s as TvSort) : "popularity.desc";
}

export interface DiscoverFilters {
  sort?: string | null;
  page?: number;
  /** AND-ed genre ids (with_genres=a,b) */
  genres?: number[];
  withoutGenres?: number[];
  /** Override the per-sort default minimum vote count */
  minVotes?: number;
  /** Movies: primary_release_date range; TV: first_air_date range (YYYY-MM-DD) */
  dateFrom?: string;
  dateTo?: string;
  /** TV only: episodes aired in this range (YYYY-MM-DD) */
  airDateFrom?: string;
  airDateTo?: string;
  /** OR-ed company ids */
  companies?: number[];
  /** TV only: OR-ed network ids */
  networks?: number[];
  /** OR-ed watch provider ids; requires watchRegion */
  providers?: number[];
  watchRegion?: string;
  /** Default "flatrate" when providers are set */
  monetization?: "flatrate" | "free" | "ads" | "rent" | "buy";
  originalLanguage?: string;
}

const ids = (list: number[] | undefined, sep: "," | "|") =>
  list && list.length ? [...new Set(list.filter((n) => Number.isSafeInteger(n) && n > 0))].sort((a, b) => a - b).join(sep) : undefined;
const day = (value: string | undefined) => (value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined);

function discoverParams(type: MediaType, f: DiscoverFilters): TmdbParams {
  const sort = normalizeSort(type, f.sort);
  const newest = sort === "primary_release_date.desc" || sort === "first_air_date.desc";
  // Without a vote floor, rating and date sorts surface obscure or unreleased titles.
  const defaultMinVotes = sort === "vote_average.desc" ? 300 : newest ? 10 : undefined;
  const dateTo = day(f.dateTo) ?? (newest ? isoDay(0) : undefined);
  const params: TmdbParams = {
    sort_by: sort,
    page: clampPage(f.page ?? 1),
    include_adult: "false",
    with_genres: ids(f.genres, ","),
    without_genres: ids(f.withoutGenres, ","),
    "vote_count.gte": f.minVotes ?? defaultMinVotes,
    with_companies: ids(f.companies, "|"),
    with_original_language: f.originalLanguage,
  };
  if (type === "movie") {
    params["primary_release_date.gte"] = day(f.dateFrom);
    params["primary_release_date.lte"] = dateTo;
  } else {
    params["first_air_date.gte"] = day(f.dateFrom);
    params["first_air_date.lte"] = dateTo;
    params["air_date.gte"] = day(f.airDateFrom);
    params["air_date.lte"] = day(f.airDateTo);
    params.with_networks = ids(f.networks, "|");
  }
  const providers = ids(f.providers, "|");
  if (providers) {
    params.with_watch_providers = providers;
    params.watch_region = (f.watchRegion ?? "US").toUpperCase();
    params.with_watch_monetization_types = f.monetization ?? "flatrate";
  }
  return params;
}

const discoverRaw = cached(
  "discover",
  TTL.discover,
  (type, _query) => [`discover:${type}`],
  async (type: MediaType, query: string): Promise<Paged<CardDTO>> => {
    const raw = await tmdbFetch<RawPaged<RawListItem>>(`/discover/${type}`, parseQuery(query));
    return toPaged(raw, toCards(raw.results, type));
  },
);

/** /discover/movie with real server-side filtering (genres, dates, companies, providers). */
export function discoverMovies(filters: DiscoverFilters = {}): Promise<Paged<CardDTO>> {
  return discoverRaw("movie", stableQuery(discoverParams("movie", filters)));
}

/** /discover/tv with real server-side filtering (genres, dates, networks, companies, providers). */
export function discoverTv(filters: DiscoverFilters = {}): Promise<Paged<CardDTO>> {
  return discoverRaw("tv", stableQuery(discoverParams("tv", filters)));
}

export function discover(type: MediaType, filters: DiscoverFilters = {}): Promise<Paged<CardDTO>> {
  return type === "movie" ? discoverMovies(filters) : discoverTv(filters);
}

/* ------------------------------------------------------------------------ */
/* Corrected "latest" rows (finding 9)                                       */
/* ------------------------------------------------------------------------ */

/** Movies in theaters now (now_playing; TMDB ignores sort_by there, so none is sent). */
export function getNowPlayingMovies(page: number = 1, region?: string): Promise<Paged<CardDTO>> {
  return getMovieList("now_playing", page, region);
}

/** Newest released movies with some traction: last 60 days, popularity order, at least 20 votes. */
export function getLatestMovies(page: number = 1): Promise<Paged<CardDTO>> {
  return discoverMovies({ sort: "popularity.desc", page, dateFrom: isoDay(-60), dateTo: isoDay(0), minVotes: 20 });
}

const latestSeriesLoader = cached(
  "discover:tv:new-episodes",
  TTL.listAiring,
  () => ["discover:tv"],
  async (page: number, from: string, to: string): Promise<Paged<CardDTO>> => {
    const raw = await tmdbFetch<RawPaged<RawListItem>>("/discover/tv", {
      page,
      sort_by: "popularity.desc",
      "air_date.gte": from,
      "air_date.lte": to,
      without_genres: TV_NOISE_GENRES,
      "vote_count.gte": 50,
      include_adult: "false",
    });
    return toPaged(raw, toCards(raw.results, "tv"));
  },
);

/**
 * Series with new episodes this week: aired in the last 7 days, popularity
 * order, no talk/news/reality/documentary, at least 50 votes (checked live).
 */
export function getLatestSeries(page: number = 1): Promise<Paged<CardDTO>> {
  return latestSeriesLoader(clampPage(page), isoDay(-7), isoDay(0));
}

/* ------------------------------------------------------------------------ */
/* Watch regions                                                             */
/* ------------------------------------------------------------------------ */

export interface RegionDTO {
  code: string;
  name: string;
}

/** Regions TMDB has watch-provider data for (about 140). */
export const getWatchRegions = cached(
  "watch-regions",
  TTL.config,
  () => ["watch-regions"],
  async (): Promise<RegionDTO[]> => {
    const raw = await tmdbFetch<{ results?: { iso_3166_1: string; english_name: string }[] }>("/watch/providers/regions");
    return (raw.results ?? [])
      .map((r) => ({ code: r.iso_3166_1, name: r.english_name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
);
