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

/** A row of public.favorites (supabase-schema.sql). */
export interface Favorite {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: UserMediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  added_at: string;
}

export interface AddToFavoritesInput {
  tmdbId: number;
  mediaType: AnyMediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number | null;
}

const FAVORITES_COLUMNS =
  "id, user_id, tmdb_id, media_type, title, poster_path, backdrop_path, vote_average, added_at";

const EMPTY: Favorite[] = [];

/** The one favorites query: every row for the user, newest first. */
export const favoritesQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: userDataKeys.favorites(userId),
    enabled: !!userId,
    staleTime: USER_DATA_STALE_TIME,
    refetchOnMount: true,
    queryFn: async (): Promise<Favorite[]> => {
      if (!userId) return [];
      const { data, error } = await db()
        .from("favorites")
        .select(FAVORITES_COLUMNS)
        .eq("user_id", userId)
        .order("added_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Favorite[];
    },
  });

/** All favorite rows plus load state (shares the one cached query). */
export function useFavoriteItems() {
  const userId = useUserId();
  const query = useQuery(favoritesQueryOptions(userId));
  return {
    items: query.data ?? EMPTY,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error, "Failed to load favorites") : null,
    refetch: query.refetch,
  };
}

/** Per-card membership check derived from the shared cached rows. */
export function useIsFavorite(tmdbId: number, mediaType: AnyMediaType): boolean {
  const userId = useUserId();
  const key = mediaKey(mediaType, tmdbId);
  const select = useCallback((rows: Favorite[]) => idSet(rows).has(key), [key]);
  const { data } = useQuery({ ...favoritesQueryOptions(userId), select });
  return data ?? false;
}

/** Optimistic add/remove/toggle. All throw when signed out. */
export function useFavoriteActions() {
  const queryClient = useQueryClient();
  const userId = useUserId();

  const add = useCallback(
    async (input: AddToFavoritesInput) => {
      if (!userId) throw new Error("You must be signed in to add favorites.");
      const mediaType = normalizeMediaType(input.mediaType);
      const key = mediaKey(mediaType, input.tmdbId);
      const optimisticRow: Favorite = {
        id: `optimistic:${key}`,
        user_id: userId,
        tmdb_id: input.tmdbId,
        media_type: mediaType,
        title: input.title,
        poster_path: input.posterPath ?? null,
        backdrop_path: input.backdropPath ?? null,
        vote_average: input.voteAverage ?? null,
        added_at: new Date().toISOString(),
      };

      await runLibraryWrite<Favorite>({
        queryClient,
        table: "favorites",
        userId,
        optimistic: (rows) => (idSet(rows).has(key) ? rows : [optimisticRow, ...rows]),
        revert: (rows) => rows.filter((row) => row.id !== optimisticRow.id),
        request: async () => {
          const { error } = await db()
            .from("favorites")
            .insert([
              {
                user_id: userId,
                tmdb_id: input.tmdbId,
                media_type: mediaType,
                title: input.title,
                poster_path: input.posterPath ?? null,
                backdrop_path: input.backdropPath ?? null,
                vote_average: input.voteAverage ?? null,
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
      if (!userId) throw new Error("You must be signed in to remove favorites.");
      const mediaType = normalizeMediaType(mediaTypeInput);
      const key = mediaKey(mediaType, tmdbId);
      let removed: Favorite[] = [];

      await runLibraryWrite<Favorite>({
        queryClient,
        table: "favorites",
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
            .from("favorites")
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
    async (input: AddToFavoritesInput): Promise<boolean> => {
      const rows = queryClient.getQueryData<Favorite[]>(userDataKeys.favorites(userId)) ?? EMPTY;
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
