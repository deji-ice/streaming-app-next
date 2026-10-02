"use client";

import { useCallback, useMemo } from "react";
import type { MediaType } from "@/types";
import { idSet, mediaKey } from "@/lib/user-data/shared";
import { useFavoriteActions, useFavoriteItems } from "@/lib/user-data/favorites";

export type { AddToFavoritesInput, Favorite } from "@/lib/user-data/favorites";

/**
 * Favorite rows and actions, backed by ONE shared TanStack Query per user
 * (["user-data", "favorites", userId], staleTime 60s). Any number of
 * components can call this; they share a single request.
 *
 * `mediaType` accepts "movie", "tv" or "series" ("series" and "tv" are the
 * same table value). For a single card prefer `useIsFavorite(id, type)` and
 * `useFavoriteActions()` from "@/lib/user-data".
 */
export function useFavorites() {
  const { items, isLoading, error, refetch } = useFavoriteItems();
  const { add, remove } = useFavoriteActions();
  const ids = useMemo(() => idSet(items), [items]);

  const isInFavorites = useCallback(
    (tmdbId: number, mediaType: MediaType) => ids.has(mediaKey(mediaType, tmdbId)),
    [ids],
  );

  const addToFavorites = useCallback(
    (
      tmdbId: number,
      mediaType: MediaType,
      title: string,
      posterPath?: string | null,
      extra?: { backdropPath?: string | null; voteAverage?: number | null },
    ) =>
      add({
        tmdbId,
        mediaType,
        title,
        posterPath: posterPath ?? null,
        backdropPath: extra?.backdropPath ?? null,
        voteAverage: extra?.voteAverage ?? null,
      }),
    [add],
  );

  const removeFromFavorites = useCallback(
    (tmdbId: number, mediaType: MediaType) => remove(tmdbId, mediaType),
    [remove],
  );

  const refresh = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  return useMemo(
    () => ({
      items,
      isLoading,
      error,
      addToFavorites,
      removeFromFavorites,
      isInFavorites,
      refresh,
    }),
    [items, isLoading, error, addToFavorites, removeFromFavorites, isInFavorites, refresh],
  );
}
