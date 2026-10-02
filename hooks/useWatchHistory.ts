"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { recordView, rehydrateLocalHistory } from "@/lib/history";
import { type LogWatchInput, useMergedHistory, writeWatchToAccount } from "@/lib/user-data/history";
import { errorMessage, userDataKeys } from "@/lib/user-data/shared";

export type { HistoryMediaType, LogWatchInput, WatchHistoryItem } from "@/lib/user-data/history";

/**
 * Watch history for display and logging.
 *
 * - `items`: local (localStorage) + account history merged, one item per
 *   title, newest first. Local-only items have id "local:{media_type}:{tmdb_id}"
 *   and user_id "".
 * - `logWatchStart`: always records locally (works signed out, never throws
 *   for signed-out users). Signed in, it also writes to Supabase with an
 *   optimistic cache merge (no full refetch). Rejects only when that account
 *   write fails.
 * - `refresh`: re-reads localStorage and refetches the account history.
 *
 * Removing or clearing history: `useHistoryActions()` from "@/lib/user-data".
 */
export function useWatchHistory() {
  const queryClient = useQueryClient();
  const { userId, items, isLoading, error: loadError } = useMergedHistory();
  const [writeError, setWriteError] = useState<string | null>(null);

  const logWatchStart = useCallback(
    async (input: LogWatchInput): Promise<void> => {
      const watchedAt = new Date().toISOString();
      recordView({
        tmdbId: input.tmdbId,
        mediaType: input.mediaType,
        title: input.title,
        posterPath: input.posterPath,
        backdropPath: input.backdropPath,
        season: input.seasonNumber,
        episode: input.episodeNumber,
        watchedAt,
      });

      if (!userId) return;

      try {
        await writeWatchToAccount(queryClient, userId, input, watchedAt);
        setWriteError(null);
      } catch (error) {
        setWriteError(errorMessage(error, "Failed to save watch history"));
        throw error;
      }
    },
    [queryClient, userId],
  );

  const refresh = useCallback(async (): Promise<void> => {
    rehydrateLocalHistory();
    if (userId) await queryClient.invalidateQueries({ queryKey: userDataKeys.history(userId) });
  }, [queryClient, userId]);

  return useMemo(
    () => ({
      items,
      isLoading,
      error: writeError ?? loadError,
      logWatchStart,
      refresh,
    }),
    [items, isLoading, writeError, loadError, logWatchStart, refresh],
  );
}
