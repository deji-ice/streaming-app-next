"use client";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type AccountProfile,
  useAccountProfile,
  useUpdateProfile,
  useUserDataCounts,
} from "@/lib/user-data/profile";
import { useUserId, userDataKeys } from "@/lib/user-data/shared";

/** public.profiles row. `bio` is not in supabase-schema.sql and is always null unless the database adds it. */
export type UserProfile = AccountProfile;

/**
 * Real values only. `totalHours` is kept for compatibility but is always null:
 * playback progress is not tracked, so watch time cannot be computed.
 */
export interface ProfileStats {
  /** Distinct movies in account watch history. */
  totalMoviesWatched: number;
  /** Distinct series in account watch history. */
  totalSeriesWatched: number;
  /** Always null (not computable). Do not display. */
  totalHours: number | null;
  watchlistCount: number;
  favoritesCount: number;
}

/**
 * Profile row + real counts. Both are shared TanStack queries
 * (["user-data", "profile" | "counts", userId], staleTime 60s); counts use
 * head-only exact count queries.
 */
export function useUserProfile() {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const { profile, isLoading, error } = useAccountProfile();
  const { counts } = useUserDataCounts();
  const update = useUpdateProfile();

  const stats = useMemo<ProfileStats | null>(
    () =>
      counts
        ? {
            totalMoviesWatched: counts.moviesWatched,
            totalSeriesWatched: counts.seriesWatched,
            totalHours: null,
            watchlistCount: counts.watchlist,
            favoritesCount: counts.favorites,
          }
        : null,
    [counts],
  );

  /** Sends only full_name, username and avatar_url (the editable schema columns). */
  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => update(updates),
    [update],
  );

  const refresh = useCallback(() => {
    if (!userId) return;
    void queryClient.invalidateQueries({ queryKey: userDataKeys.profile(userId) });
    void queryClient.invalidateQueries({ queryKey: userDataKeys.counts(userId) });
  }, [queryClient, userId]);

  return {
    profile,
    stats,
    isLoading,
    error,
    updateProfile,
    refresh,
  };
}
