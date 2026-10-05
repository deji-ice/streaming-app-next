/**
 * Client side of GET /api/recommendations (route owned by the data layer).
 *
 * Request:  ?seeds=movie:1,tv:2[&exclude=movie:3,...]
 * Response: { results: RecommendationResult[] }
 *
 * Seeds come from favorites, watchlist and history (local + account), each
 * newest first, interleaved in that order, deduped, up to 5. Works signed out
 * (history seeds from localStorage only). Never imports lib/tmdb.
 */
import { useMemo } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { favoritesQueryOptions } from "./favorites";
import { useMergedHistory } from "./history";
import { type UserMediaType, mediaKey, useUserId, userDataKeys } from "./shared";
import { watchlistQueryOptions } from "./watchlist";

export interface RecommendationResult {
  id: number;
  mediaType: UserMediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: string | number | null;
  rating: number | null;
}

export type RecommendationSeedSource = "favorite" | "watchlist" | "history";

export interface RecommendationSeed {
  tmdbId: number;
  mediaType: UserMediaType;
  title: string;
  source: RecommendationSeedSource;
  /** "movie:123" */
  key: string;
}

export const MAX_RECOMMENDATION_SEEDS = 5;
const MAX_EXCLUDE = 100;
const RECOMMENDATIONS_STALE_TIME = 10 * 60_000;

/** Fetch recommendations for "type:id" seeds. Throws on HTTP errors. */
export async function fetchRecommendations(
  seeds: readonly string[],
  exclude: readonly string[] = [],
  signal?: AbortSignal,
): Promise<RecommendationResult[]> {
  if (seeds.length === 0) return [];
  const params = new URLSearchParams({ seeds: seeds.join(",") });
  if (exclude.length > 0) params.set("exclude", exclude.join(","));
  const response = await fetch(`/api/recommendations?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`Recommendations request failed (${response.status})`);
  const body = (await response.json()) as { results?: RecommendationResult[] };
  return Array.isArray(body.results) ? body.results : [];
}

export const recommendationsQueryOptions = (seeds: readonly string[], exclude: readonly string[]) =>
  queryOptions({
    queryKey: userDataKeys.recommendations(seeds.join(","), exclude.join(",")),
    enabled: seeds.length > 0,
    staleTime: RECOMMENDATIONS_STALE_TIME,
    queryFn: ({ signal }) => fetchRecommendations(seeds, exclude, signal),
  });

interface SeedCandidate {
  tmdb_id: number;
  media_type: string;
  title: string;
}

/**
 * Seeds for recommendations plus every key the user already has (to exclude).
 * `isLoading` stays true until the sources that apply have loaded, so the
 * recommendations request is sent once with the final seed list.
 */
export function useRecommendationSeeds(limit: number = MAX_RECOMMENDATION_SEEDS) {
  const userId = useUserId();
  const watchlist = useQuery(watchlistQueryOptions(userId));
  const favorites = useQuery(favoritesQueryOptions(userId));
  const history = useMergedHistory();

  const isLoading = history.isLoading || (!!userId && (watchlist.isLoading || favorites.isLoading));

  const { seeds, exclude } = useMemo(() => {
    const sources: Array<[RecommendationSeedSource, readonly SeedCandidate[]]> = [
      ["favorite", userId ? (favorites.data ?? []) : []],
      ["watchlist", userId ? (watchlist.data ?? []) : []],
      ["history", history.items],
    ];

    const picked: RecommendationSeed[] = [];
    const seen = new Set<string>();
    const longest = Math.max(...sources.map(([, rows]) => rows.length));
    for (let i = 0; i < longest && picked.length < limit; i += 1) {
      for (const [source, rows] of sources) {
        const row = rows[i];
        if (!row || picked.length >= limit) continue;
        const key = mediaKey(row.media_type, row.tmdb_id);
        if (seen.has(key)) continue;
        seen.add(key);
        picked.push({
          tmdbId: row.tmdb_id,
          mediaType: row.media_type === "movie" ? "movie" : "tv",
          title: row.title,
          source,
          key,
        });
      }
    }

    const excluded: string[] = [];
    const seedKeys = new Set(picked.map((seed) => seed.key));
    const excludedSeen = new Set<string>();
    for (const [, rows] of sources) {
      for (const row of rows) {
        if (excluded.length >= MAX_EXCLUDE) break;
        const key = mediaKey(row.media_type, row.tmdb_id);
        if (seedKeys.has(key) || excludedSeen.has(key)) continue;
        excludedSeen.add(key);
        excluded.push(key);
      }
    }

    return { seeds: picked, exclude: excluded };
  }, [userId, favorites.data, watchlist.data, history.items, limit]);

  return { seeds, exclude, isLoading };
}
