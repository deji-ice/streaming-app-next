import { useCallback, useMemo } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { runLibraryWrite } from "./library";
import {
  type AnyMediaType,
  type UserMediaType,
  USER_DATA_STALE_TIME,
  db,
  errorMessage,
  idSet,
  isDuplicateError,
  mediaKey,
  normalizeMediaType,
  useUserId,
  userDataKeys,
} from "./shared";

export type WatchlistMediaType = UserMediaType;

/** A row of public.watchlist (supabase-schema.sql). */
export interface WatchlistItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: WatchlistMediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  release_date: string | null;
  added_at: string;
}

export interface AddToWatchlistInput {
  tmdbId: number;
  mediaType: AnyMediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  releaseDate: string | null;
}

const WATCHLIST_COLUMNS =
  "id, user_id, tmdb_id, media_type, title, poster_path, backdrop_path, vote_average, release_date, added_at";

const EMPTY: WatchlistItem[] = [];

/** The one watchlist query: every row for the user, newest first. */
export const watchlistQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: userDataKeys.watchlist(userId),
    enabled: !!userId,
    staleTime: USER_DATA_STALE_TIME,
    refetchOnMount: true,
    queryFn: async (): Promise<WatchlistItem[]> => {
      if (!userId) return [];
      const { data, error } = await db()
        .from("watchlist")
        .select(WATCHLIST_COLUMNS)
        .eq("user_id", userId)
        .order("added_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WatchlistItem[];
    },
  });

/** All watchlist rows plus load state (shares the one cached query). */
export function useWatchlistItems() {
  const userId = useUserId();
  const query = useQuery(watchlistQueryOptions(userId));
  return {
    items: query.data ?? EMPTY,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error, "Failed to load watchlist") : null,
    refetch: query.refetch,
  };
}

/**
 * Per-card membership check. Selects a boolean from the shared cached rows,
 * so a card re-renders only when its own state flips and never fetches.
 */
export function useIsInWatchlist(tmdbId: number, mediaType: AnyMediaType): boolean {
  const userId = useUserId();
  const key = mediaKey(mediaType, tmdbId);
  const select = useCallback((rows: WatchlistItem[]) => idSet(rows).has(key), [key]);
  const { data } = useQuery({ ...watchlistQueryOptions(userId), select });
  return data ?? false;
}

/** Optimistic add/remove/toggle. All throw when signed out. */
export function useWatchlistActions() {
  const queryClient = useQueryClient();
  const userId = useUserId();

  const add = useCallback(
    async (input: AddToWatchlistInput) => {
      if (!userId) throw new Error("You must be signed in to add to watchlist.");
      const mediaType = normalizeMediaType(input.mediaType);
      const key = mediaKey(mediaType, input.tmdbId);
      const now = new Date().toISOString();
      const optimisticRow: WatchlistItem = {
        id: `optimistic:${key}`,
        user_id: userId,
        tmdb_id: input.tmdbId,
        media_type: mediaType,
        title: input.title,
        poster_path: input.posterPath,
        backdrop_path: input.backdropPath,
        vote_average: input.voteAverage,
        release_date: input.releaseDate,
        added_at: now,
      };

      await runLibraryWrite<WatchlistItem>({
        queryClient,
        table: "watchlist",
        userId,
        optimistic: (rows) => (idSet(rows).has(key) ? rows : [optimisticRow, ...rows]),
        revert: (rows) => rows.filter((row) => row.id !== optimisticRow.id),
        request: async () => {
          const { error } = await db()
            .from("watchlist")
            .insert([
              {
                user_id: userId,
                tmdb_id: input.tmdbId,
                media_type: mediaType,
                title: input.title,
                poster_path: input.posterPath,
                backdrop_path: input.backdropPath,
                vote_average: input.voteAverage,
                release_date: input.releaseDate,
              },
            ]);
          if (error && !isDuplicateError(error)) throw error;
        },
      });
    },
    [queryClient, userId],
  );

  const remove = useCallback(
    async (tmdbId: number, mediaTypeInput: AnyMediaType) => {
      if (!userId) throw new Error("You must be signed in to remove from watchlist.");
      const mediaType = normalizeMediaType(mediaTypeInput);
      const key = mediaKey(mediaType, tmdbId);
      let removed: WatchlistItem[] = [];

      await runLibraryWrite<WatchlistItem>({
        queryClient,
        table: "watchlist",
        userId,
        optimistic: (rows) => {
          removed = rows.filter((row) => mediaKey(row.media_type, row.tmdb_id) === key);
          return removed.length ? rows.filter((row) => !removed.includes(row)) : rows;
        },
        revert: (rows) =>
          idSet(rows).has(key)
            ? rows
            : [...removed, ...rows].sort((a, b) => Date.parse(b.added_at) - Date.parse(a.added_at)),
        request: async () => {
          const { error } = await db()
            .from("watchlist")
            .delete()
            .eq("user_id", userId)
            .eq("tmdb_id", tmdbId)
            .eq("media_type", mediaType);
          if (error) throw error;
        },
      });
    },
    [queryClient, userId],
  );

  /** Adds or removes based on the cached state. Resolves to the new state. */
  const toggle = useCallback(
    async (input: AddToWatchlistInput): Promise<boolean> => {
      const rows = queryClient.getQueryData<WatchlistItem[]>(userDataKeys.watchlist(userId)) ?? EMPTY;
      if (idSet(rows).has(mediaKey(input.mediaType, input.tmdbId))) {
        await remove(input.tmdbId, input.mediaType);
        return false;
      }
      await add(input);
      return true;
    },
    [add, remove, queryClient, userId],
  );

  return useMemo(() => ({ add, remove, toggle }), [add, remove, toggle]);
}
