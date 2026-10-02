import { useCallback } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { USER_DATA_STALE_TIME, db, errorMessage, useUserId, userDataKeys } from "./shared";

/** public.profiles (supabase-schema.sql). `bio` is not a column there: always null unless the database adds it. */
export interface AccountProfile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

/** Columns a user may edit (the ones that exist in supabase-schema.sql). */
export type ProfileUpdate = Partial<Pick<AccountProfile, "full_name" | "username" | "avatar_url">>;

/** Real counts only. */
export interface UserDataCounts {
  watchlist: number;
  favorites: number;
  /** Distinct movies in account watch history. */
  moviesWatched: number;
  /** Distinct series in account watch history. */
  seriesWatched: number;
}

export const profileQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: userDataKeys.profile(userId),
    enabled: !!userId,
    staleTime: USER_DATA_STALE_TIME,
    refetchOnMount: true,
    queryFn: async (): Promise<AccountProfile | null> => {
      if (!userId) return null;
      const { data, error } = await db()
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as Partial<AccountProfile> & { id: string; email: string };
      return {
        id: row.id,
        email: row.email,
        username: row.username ?? null,
        full_name: row.full_name ?? null,
        avatar_url: row.avatar_url ?? null,
        bio: row.bio ?? null,
        created_at: row.created_at ?? "",
        updated_at: row.updated_at ?? "",
      };
    },
  });

const countOf = async (query: PromiseLike<{ count: number | null; error: unknown }>) => {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
};

/**
 * Head-only exact counts (no rows transferred) for watchlist, favorites and
 * watched movies. Series are counted by distinct tmdb_id from the tmdb_id
 * column only, because older history stored one row per episode.
 */
export const countsQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: userDataKeys.counts(userId),
    enabled: !!userId,
    staleTime: USER_DATA_STALE_TIME,
    refetchOnMount: true,
    queryFn: async (): Promise<UserDataCounts> => {
      if (!userId) return { watchlist: 0, favorites: 0, moviesWatched: 0, seriesWatched: 0 };
      const uid = userId;
      const [watchlist, favorites, moviesWatched, seriesRows] = await Promise.all([
        countOf(db().from("watchlist").select("id", { count: "exact", head: true }).eq("user_id", uid)),
        countOf(db().from("favorites").select("id", { count: "exact", head: true }).eq("user_id", uid)),
        countOf(
          db()
            .from("watch_history")
            .select("id", { count: "exact", head: true })
            .eq("user_id", uid)
            .eq("media_type", "movie"),
        ),
        db().from("watch_history").select("tmdb_id").eq("user_id", uid).eq("media_type", "tv"),
      ]);
      if (seriesRows.error) throw seriesRows.error;
      const seriesWatched = new Set(
        ((seriesRows.data ?? []) as Array<{ tmdb_id: number }>).map((row) => row.tmdb_id),
      ).size;
      return { watchlist, favorites, moviesWatched, seriesWatched };
    },
  });

export function useAccountProfile() {
  const userId = useUserId();
  const query = useQuery(profileQueryOptions(userId));
  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error, "Failed to fetch profile") : null,
    refetch: query.refetch,
  };
}

export function useUserDataCounts() {
  const userId = useUserId();
  const query = useQuery(countsQueryOptions(userId));
  return { counts: query.data ?? null, isLoading: query.isLoading, refetch: query.refetch };
}

/**
 * Optimistic profile update. Only columns that exist in the schema are sent
 * (full_name, username, avatar_url); other keys are ignored. Resolves to
 * true on success, false on failure or when signed out.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useUserId();

  return useCallback(
    async (updates: Partial<AccountProfile>): Promise<boolean> => {
      if (!userId) return false;
      const patch: ProfileUpdate = {};
      if (updates.full_name !== undefined) patch.full_name = updates.full_name;
      if (updates.username !== undefined) patch.username = updates.username;
      if (updates.avatar_url !== undefined) patch.avatar_url = updates.avatar_url;
      if (Object.keys(patch).length === 0) return true;

      const queryKey = userDataKeys.profile(userId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AccountProfile | null>(queryKey);
      queryClient.setQueryData<AccountProfile | null>(queryKey, (current) =>
        current ? { ...current, ...patch } : current,
      );

      const { error } = await db()
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        queryClient.setQueryData(queryKey, previous);
        console.error("Profile update error:", error.message);
        return false;
      }
      void queryClient.invalidateQueries({ queryKey });
      return true;
    },
    [queryClient, userId],
  );
}
