/**
 * Account watch history (public.watch_history) merged with the local-first
 * store in lib/history.
 *
 * - One query per user: the latest rows, newest first.
 * - Display = local + account, one item per title (tmdb_id + media_type),
 *   newest first. Local-only items get id "local:{media_type}:{tmdb_id}" and
 *   user_id "".
 * - Once per page session, when a user id is present and both sides are
 *   loaded, local entries that are newer than the account copy are written to
 *   the account (insert the new row, then delete older rows for that title;
 *   the table has no unique constraint, so no ON CONFLICT upsert).
 */
import { useCallback, useEffect, useMemo } from "react";
import { type QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MediaType } from "@/types";
import {
  type LocalHistoryEntry,
  type LocalHistoryState,
  clearLocalHistory,
  getLocalHistorySnapshot,
  removeHistoryEntry,
  useLocalHistory,
  useLocalHistoryHydrated,
} from "@/lib/history";
import {
  type AnyMediaType,
  USER_DATA_STALE_TIME,
  db,
  errorMessage,
  mediaKey,
  normalizeMediaType,
  useUserId,
  userDataKeys,
} from "./shared";

export type HistoryMediaType = "movie" | "tv";

/** A row of public.watch_history (supabase-schema.sql), or a mapped local entry. */
export interface WatchHistoryItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: HistoryMediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  season_number: number | null;
  episode_number: number | null;
  progress_seconds: number;
  duration_seconds: number | null;
  watched_at: string;
  updated_at: string;
}

export interface LogWatchInput {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds?: number;
  durationSeconds?: number | null;
}

const HISTORY_COLUMNS =
  "id, user_id, tmdb_id, media_type, title, poster_path, backdrop_path, season_number, episode_number, progress_seconds, duration_seconds, watched_at, updated_at";

/** Rows fetched for display. Legacy data can hold one row per episode. */
export const ACCOUNT_HISTORY_LIMIT = 200;

const EMPTY: WatchHistoryItem[] = [];
const selectEntries = (state: LocalHistoryState) => state.entries;
const time = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
};
const byNewest = (a: WatchHistoryItem, b: WatchHistoryItem) => time(b.watched_at) - time(a.watched_at);
const keyOf = (item: { tmdb_id: number; media_type: string }) => mediaKey(item.media_type, item.tmdb_id);

/** The one account history query. */
export const historyQueryOptions = (userId: string | null) =>
  queryOptions({
    queryKey: userDataKeys.history(userId),
    enabled: !!userId,
    staleTime: USER_DATA_STALE_TIME,
    refetchOnMount: true,
    queryFn: async (): Promise<WatchHistoryItem[]> => {
      if (!userId) return [];
      const { data, error } = await db()
        .from("watch_history")
        .select(HISTORY_COLUMNS)
        .eq("user_id", userId)
        .order("watched_at", { ascending: false })
        .limit(ACCOUNT_HISTORY_LIMIT);
      if (error) throw error;
      return (data ?? []) as WatchHistoryItem[];
    },
  });

/** Maps a local entry to the WatchHistoryItem shape the pages use. */
export function localEntryToItem(entry: LocalHistoryEntry): WatchHistoryItem {
  const isTv = entry.mediaType === "tv";
  return {
    id: `local:${entry.mediaType}:${entry.tmdbId}`,
    user_id: "",
    tmdb_id: entry.tmdbId,
    media_type: entry.mediaType,
    title: entry.title,
    poster_path: entry.posterPath,
    backdrop_path: entry.backdropPath,
    season_number: isTv ? (entry.season ?? null) : null,
    episode_number: isTv ? (entry.episode ?? null) : null,
    progress_seconds: 0,
    duration_seconds: null,
    watched_at: entry.watchedAt,
    updated_at: entry.watchedAt,
  };
}

/** Local + account, one item per title, newest first. */
export function mergeHistory(
  local: readonly LocalHistoryEntry[],
  account: readonly WatchHistoryItem[],
): WatchHistoryItem[] {
  const byKey = new Map<string, WatchHistoryItem>();

  for (const row of account) {
    const key = keyOf(row);
    const existing = byKey.get(key);
    if (!existing || time(row.watched_at) > time(existing.watched_at)) byKey.set(key, row);
  }

  for (const entry of local) {
    const item = localEntryToItem(entry);
    const key = keyOf(item);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, item);
    } else if (time(item.watched_at) > time(existing.watched_at)) {
      byKey.set(key, {
        ...item,
        // A page view without an explicit episode keeps the account's episode.
        season_number: item.season_number ?? existing.season_number,
        episode_number: item.season_number == null ? existing.episode_number : item.episode_number,
        poster_path: item.poster_path ?? existing.poster_path,
        backdrop_path: item.backdrop_path ?? existing.backdrop_path,
      });
    }
  }

  return Array.from(byKey.values()).sort(byNewest);
}

function toInsertRow(
  userId: string,
  values: {
    tmdbId: number;
    mediaType: HistoryMediaType;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    season: number | null;
    episode: number | null;
    progressSeconds?: number;
    durationSeconds?: number | null;
    watchedAt: string;
  },
) {
  const isTv = values.mediaType === "tv";
  return {
    user_id: userId,
    tmdb_id: values.tmdbId,
    media_type: values.mediaType,
    title: values.title,
    poster_path: values.posterPath,
    backdrop_path: values.backdropPath,
    season_number: isTv ? values.season : null,
    episode_number: isTv ? values.episode : null,
    progress_seconds: values.progressSeconds ?? 0,
    duration_seconds: values.durationSeconds ?? null,
    watched_at: values.watchedAt,
    updated_at: values.watchedAt,
  };
}

/**
 * Write one play to the account: optimistic cache merge, insert, then remove
 * older rows of the same title. Never refetches the whole list.
 */
export async function writeWatchToAccount(
  queryClient: QueryClient,
  userId: string,
  input: LogWatchInput,
  watchedAt: string,
): Promise<void> {
  const mediaType = normalizeMediaType(input.mediaType);
  const key = mediaKey(mediaType, input.tmdbId);
  const queryKey = userDataKeys.history(userId);
  const payload = toInsertRow(userId, {
    tmdbId: input.tmdbId,
    mediaType,
    title: input.title,
    posterPath: input.posterPath,
    backdropPath: input.backdropPath,
    season: input.seasonNumber ?? null,
    episode: input.episodeNumber ?? null,
    progressSeconds: input.progressSeconds,
    durationSeconds: input.durationSeconds,
    watchedAt,
  });
  const optimisticId = `optimistic:${key}:${watchedAt}`;
  const hadTitle = !!queryClient.getQueryData<WatchHistoryItem[]>(queryKey)?.some((r) => keyOf(r) === key);

  queryClient.setQueryData<WatchHistoryItem[]>(queryKey, (rows) =>
    rows
      ? [{ id: optimisticId, ...payload }, ...rows.filter((row) => keyOf(row) !== key)].slice(
          0,
          ACCOUNT_HISTORY_LIMIT,
        )
      : rows,
  );

  const { data, error } = await db().from("watch_history").insert([payload]).select(HISTORY_COLUMNS).single();
  if (error || !data) {
    void queryClient.invalidateQueries({ queryKey });
    throw error ?? new Error("Failed to save watch history");
  }

  const saved = data as WatchHistoryItem;
  queryClient.setQueryData<WatchHistoryItem[]>(queryKey, (rows) =>
    rows ? rows.map((row) => (row.id === optimisticId ? saved : row)) : rows,
  );

  const { error: cleanupError } = await db()
    .from("watch_history")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", input.tmdbId)
    .eq("media_type", mediaType)
    .neq("id", saved.id);
  if (cleanupError) console.warn("[history] Could not remove older rows", cleanupError.message);

  if (!hadTitle) void queryClient.invalidateQueries({ queryKey: userDataKeys.counts(userId) });
}

/**
 * Push local entries that are missing from the account (or newer than the
 * account copy). Returns how many titles were written.
 */
export async function syncLocalHistoryToAccount(
  queryClient: QueryClient,
  userId: string,
  local: readonly LocalHistoryEntry[],
  account: readonly WatchHistoryItem[],
): Promise<number> {
  const latest = new Map<string, number>();
  for (const row of account) {
    const key = keyOf(row);
    latest.set(key, Math.max(latest.get(key) ?? 0, time(row.watched_at)));
  }

  // 1s tolerance: plays logged while signed in were written to both sides.
  const pending = local.filter((entry) => {
    const accountTime = latest.get(mediaKey(entry.mediaType, entry.tmdbId));
    return accountTime === undefined || time(entry.watchedAt) > accountTime + 1000;
  });
  if (pending.length === 0) return 0;

  const rows = pending.map((entry) =>
    toInsertRow(userId, {
      tmdbId: entry.tmdbId,
      mediaType: entry.mediaType,
      title: entry.title,
      posterPath: entry.posterPath,
      backdropPath: entry.backdropPath,
      season: entry.season ?? null,
      episode: entry.episode ?? null,
      watchedAt: entry.watchedAt,
    }),
  );

  const { data, error } = await db().from("watch_history").insert(rows).select(HISTORY_COLUMNS);
  if (error) throw error;
  const inserted = (data ?? []) as WatchHistoryItem[];
  const insertedIds = inserted.map((row) => row.id);

  // Remove the older rows of the titles just written (per media type, so a
  // movie and a series that share a TMDB id never touch each other).
  if (insertedIds.length > 0) {
    const idList = `(${insertedIds.join(",")})`;
    await Promise.all(
      (["movie", "tv"] as const).map(async (type) => {
        const ids = pending.filter((e) => e.mediaType === type).map((e) => e.tmdbId);
        if (ids.length === 0) return;
        const { error: cleanupError } = await db()
          .from("watch_history")
          .delete()
          .eq("user_id", userId)
          .eq("media_type", type)
          .in("tmdb_id", ids)
          .not("id", "in", idList);
        if (cleanupError) console.warn("[history] Could not remove older rows", cleanupError.message);
      }),
    );
  }

  const pushed = new Set(pending.map((entry) => mediaKey(entry.mediaType, entry.tmdbId)));
  queryClient.setQueryData<WatchHistoryItem[]>(userDataKeys.history(userId), (current) =>
    [...inserted, ...(current ?? []).filter((row) => !pushed.has(keyOf(row)))]
      .sort(byNewest)
      .slice(0, ACCOUNT_HISTORY_LIMIT),
  );
  void queryClient.invalidateQueries({ queryKey: userDataKeys.counts(userId) });
  return pending.length;
}

const syncedUsers = new Set<string>();

/**
 * Runs syncLocalHistoryToAccount once per page session per user, after the
 * local store hydrated and the account history loaded. Safe to mount many
 * times (a module-level guard dedupes).
 */
export function useSyncLocalHistory(): void {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const hydrated = useLocalHistoryHydrated();
  const { data, isSuccess } = useQuery(historyQueryOptions(userId));

  useEffect(() => {
    if (!userId || !hydrated || !isSuccess || !data || syncedUsers.has(userId)) return;
    syncedUsers.add(userId);
    const local = getLocalHistorySnapshot();
    if (local.length === 0) return;
    syncLocalHistoryToAccount(queryClient, userId, local, data).catch((error) => {
      console.warn("[history] Could not sync local history", errorMessage(error, "unknown error"));
    });
  }, [userId, hydrated, isSuccess, data, queryClient]);
}

/**
 * Merged local + account history for display. Signed out: local only.
 * `isLoading` is true until the local store hydrated and, when signed in,
 * until the account history loaded.
 */
export function useMergedHistory() {
  const userId = useUserId();
  const entries = useLocalHistory(selectEntries);
  const hydrated = useLocalHistoryHydrated();
  const query = useQuery(historyQueryOptions(userId));
  useSyncLocalHistory();

  const account = userId ? (query.data ?? EMPTY) : EMPTY;
  const items = useMemo(() => mergeHistory(entries, account), [entries, account]);

  return {
    userId,
    items,
    hydrated,
    isLoading: !hydrated || (!!userId && query.isLoading),
    error: userId && query.error ? errorMessage(query.error, "Failed to load watch history") : null,
  };
}

/** Remove one title or clear everything, locally and (signed in) in the account. */
export function useHistoryActions() {
  const queryClient = useQueryClient();
  const userId = useUserId();

  const remove = useCallback(
    async (tmdbId: number, mediaTypeInput: AnyMediaType) => {
      const mediaType = normalizeMediaType(mediaTypeInput);
      removeHistoryEntry(tmdbId, mediaType);
      if (!userId) return;

      const queryKey = userDataKeys.history(userId);
      const key = mediaKey(mediaType, tmdbId);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<WatchHistoryItem[]>(queryKey);
      queryClient.setQueryData<WatchHistoryItem[]>(queryKey, (rows) =>
        rows ? rows.filter((row) => keyOf(row) !== key) : rows,
      );

      const { error } = await db()
        .from("watch_history")
        .delete()
        .eq("user_id", userId)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType);
      if (error) {
        if (previous) queryClient.setQueryData(queryKey, previous);
        throw error;
      }
      void queryClient.invalidateQueries({ queryKey: userDataKeys.counts(userId) });
    },
    [queryClient, userId],
  );

  const clear = useCallback(async () => {
    clearLocalHistory();
    if (!userId) return;

    const queryKey = userDataKeys.history(userId);
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<WatchHistoryItem[]>(queryKey);
    queryClient.setQueryData<WatchHistoryItem[]>(queryKey, (rows) => (rows ? [] : rows));

    const { error } = await db().from("watch_history").delete().eq("user_id", userId);
    if (error) {
      if (previous) queryClient.setQueryData(queryKey, previous);
      throw error;
    }
    void queryClient.invalidateQueries({ queryKey: userDataKeys.counts(userId) });
  }, [queryClient, userId]);

  return useMemo(() => ({ remove, clear }), [remove, clear]);
}
