import "server-only";
import type { Episode, Genre, Movie, MovieDetails, Series, SeriesDetails } from "@/types";
import { isTmdbNotFound } from "./tmdb/client";
import { getMovie, getSeason, getTv } from "./tmdb/details";
import {
  toLegacyCard,
  toLegacyEpisodes,
  toLegacyMovie,
  toLegacyMovieDetails,
  toLegacySeriesDetails,
  toLegacySeriesItem,
  withLegacyFields,
  withLegacyPersonFields,
} from "./tmdb/legacy";
import { getGenres, getLatestSeries as getLatestSeriesCards, getMovieList, getTrending } from "./tmdb/lists";
import { searchMulti } from "./tmdb/search";

/**
 * Server-only entry point for TMDB data.
 *
 * New code: import the loaders re-exported below (getMovie, getTv,
 * getTrending, discoverMovies, search...), which return the DTOs in
 * lib/tmdb/types. Client components must never import this module (the
 * "server-only" import makes such a build fail); they call /api/search,
 * /api/recommendations, /api/movies or /api/series instead.
 *
 * Legacy: the `tmdb` object and getSeriesDetails keep the old method names
 * and raw-TMDB-shaped return values for the pages that still use them. They
 * run on the new cached loaders (no throttler, no module-level LRU) and go
 * away when those pages are rewritten.
 */

export type * from "./tmdb/types";
export { TmdbError, isTmdbNotFound } from "./tmdb/client";
export {
  clampPage,
  discover,
  discoverMovies,
  discoverTv,
  getGenreMap,
  getGenres,
  getLatestMovies,
  getLatestSeries,
  getMovieList,
  getNowPlayingMovies,
  getTrending,
  getTvList,
  isMovieList,
  isTvList,
  isoDay,
  MOVIE_LISTS,
  MOVIE_SORTS,
  normalizeSort,
  TV_LISTS,
  TV_SORTS,
  type DiscoverFilters,
  type MovieList,
  type MovieSort,
  type TrendingType,
  type TrendingWindow,
  type TvList,
  type TvSort,
} from "./tmdb/lists";
export { getCollection, getMovie, getPerson, getSeason, getTv, getWatchProviders } from "./tmdb/details";
export { normalizeQuery, search, searchMovies, searchMulti, searchPeople, searchTv, type SearchResultDTO, type SearchType } from "./tmdb/search";
export {
  CATALOG_REGION,
  discoverByCompany,
  discoverByNetwork,
  discoverByProvider,
  getCompany,
  getNetwork,
  getProviderOriginals,
  type BrowseOptions,
} from "./tmdb/browse";
export {
  CURATED_NETWORKS,
  CURATED_PROVIDERS,
  CURATED_STUDIOS,
  curatedSlugForProviderId,
  getCuratedNetwork,
  getCuratedProvider,
  getCuratedStudio,
  resolveCompanySlug,
  resolveNetworkSlug,
  selectWatchProviders,
  type CuratedNetwork,
  type CuratedProvider,
  type CuratedStudio,
} from "./tmdb/providers";

/* ------------------------------------------------------------------------ */
/* Legacy facade                                                             */
/* ------------------------------------------------------------------------ */

interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

type LegacyMediaType = "movie" | "tv";

const legacyPage = <T>(paged: { page: number; totalPages: number; totalResults: number }, results: T[]): TMDBResponse<T> => ({
  results,
  page: paged.page,
  total_pages: paged.totalPages,
  total_results: paged.totalResults,
});

const EMPTY_PAGE = { results: [], page: 1, total_pages: 0, total_results: 0 };

/** @deprecated Use the DTO loaders exported from this module. */
export const tmdb = {
  /** Trending movies this week. */
  async getTrending(): Promise<TMDBResponse<Movie>> {
    const paged = await getTrending("movie", "week", 1);
    return legacyPage(paged, paged.results.map(toLegacyMovie));
  },

  async getPopularMovies(): Promise<TMDBResponse<Movie>> {
    const paged = await getMovieList("popular", 1);
    return legacyPage(paged, paged.results.map(toLegacyMovie));
  },

  /** Trending series this week (list items: no credits, seasons or last episode). */
  async getPopularSeries(): Promise<TMDBResponse<SeriesDetails>> {
    const paged = await getTrending("tv", "week", 1);
    return legacyPage(paged, paged.results.map(toLegacySeriesItem));
  },

  async getMediaDetails(id: string, type: LegacyMediaType): Promise<MovieDetails | SeriesDetails> {
    return type === "movie" ? toLegacyMovieDetails(await getMovie(id)) : toLegacySeriesDetails(await getTv(id));
  },

  async searchMulti(query: string): Promise<TMDBResponse<Movie | Series>> {
    try {
      const paged = await searchMulti(query, 1);
      const rows = paged.results.map((r) => (r.mediaType === "person" ? withLegacyPersonFields(r) : withLegacyFields(r)));
      return legacyPage(paged, rows as unknown as (Movie | Series)[]);
    } catch (error) {
      console.error("TMDB search failed:", error);
      return EMPTY_PAGE;
    }
  },

  async getSeasonDetails(seriesId: number, seasonNumber: number): Promise<{ episodes: Episode[] }> {
    try {
      return { episodes: toLegacyEpisodes(await getSeason(seriesId, seasonNumber)) };
    } catch (error) {
      console.error("TMDB season failed:", error);
      return { episodes: [] };
    }
  },

  /** Recommendations from the cached details call (no extra request). */
  async getRecommendations(id: number, type: LegacyMediaType): Promise<(Movie | SeriesDetails)[]> {
    try {
      const details = type === "movie" ? await getMovie(id) : await getTv(id);
      return details.recommendations.slice(0, 10).map(toLegacyCard);
    } catch (error) {
      console.error("TMDB recommendations failed:", error);
      return [];
    }
  },

  /** Movie and TV genres merged (legacy behavior; new code uses getGenres(type)). */
  async getGenres(): Promise<Genre[]> {
    try {
      const [movie, tv] = await Promise.all([getGenres("movie"), getGenres("tv")]);
      return Array.from(new Map([...movie, ...tv].map((g) => [g.id, g])).values());
    } catch (error) {
      console.error("TMDB genres failed:", error);
      return [];
    }
  },

  /** Movies in theaters now (the sortBy argument was always ignored by TMDB). */
  async getLatestMovies(_sortBy?: string): Promise<TMDBResponse<Movie>> {
    try {
      const paged = await getMovieList("now_playing", 1);
      return legacyPage(paged, paged.results.map(toLegacyMovie));
    } catch (error) {
      console.error("TMDB now playing failed:", error);
      return EMPTY_PAGE;
    }
  },

  /** Series with new episodes this week (the old sort was silently ignored by TMDB). */
  async getLatestSeries(_sortBy?: string): Promise<TMDBResponse<SeriesDetails>> {
    try {
      const paged = await getLatestSeriesCards(1);
      return legacyPage(paged, paged.results.map(toLegacySeriesItem));
    } catch (error) {
      console.error("TMDB latest series failed:", error);
      return EMPTY_PAGE;
    }
  },

  /** YouTube embed URL of the main trailer, from the cached details. */
  async getTrailers(id: number, type: LegacyMediaType): Promise<string | null> {
    try {
      const details = type === "movie" ? await getMovie(id) : await getTv(id);
      return details.trailer ? `https://www.youtube-nocookie.com/embed/${details.trailer.key}` : null;
    } catch (error) {
      console.error("TMDB trailer failed:", error);
      return null;
    }
  },
};

/**
 * Series details with the current season's episodes (moved from lib/utils).
 * Details and season load in parallel. Returns null when the series does not exist.
 * @deprecated Use getTv + getSeason.
 */
export async function getSeriesDetails(slug: string, currentSeason: number = 1): Promise<SeriesDetails | null> {
  const id = slug.split("-").pop();
  if (!id || !/^\d+$/.test(id)) return null;
  try {
    const [series, season] = await Promise.all([getTv(id), getSeason(id, currentSeason).catch(() => null)]);
    return toLegacySeriesDetails(series, season);
  } catch (error) {
    if (!isTmdbNotFound(error)) console.error("Error fetching series details:", error);
    return null;
  }
}
