"use client";

import { useCallback, useMemo } from "react";
import type { MediaType } from "@/types";
import { idSet, mediaKey } from "@/lib/user-data/shared";
import {
  type AddToWatchlistInput,
  useWatchlistActions,
  useWatchlistItems,
} from "@/lib/user-data/watchlist";

export type { AddToWatchlistInput, WatchlistItem, WatchlistMediaType } from "@/lib/user-data/watchlist";

/**
 * Watchlist rows and actions, backed by ONE shared TanStack Query per user
 * (["user-data", "watchlist", userId], staleTime 60s). Any number of
 * components can call this; they share a single request.
 *
 * For a single card prefer `useIsInWatchlist(id, type)` and
 * `useWatchlistActions()` from "@/lib/user-data": the card then re-renders
 * only when its own saved state changes.
 */
export function useWatchlist() {
  const { items, isLoading, error, refetch } = useWatchlistItems();
  const { add, remove } = useWatchlistActions();
  const ids = useMemo(() => idSet(items), [items]);

  const isInWatchlist = useCallback(
    (tmdbId: number, mediaType: MediaType) => ids.has(mediaKey(mediaType, tmdbId)),
    [ids],
  );

  const addToWatchlist = useCallback((input: AddToWatchlistInput) => add(input), [add]);

  const removeFromWatchlist = useCallback(
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
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      refresh,
    }),
    [items, isLoading, error, isInWatchlist, addToWatchlist, removeFromWatchlist, refresh],
  );
}
