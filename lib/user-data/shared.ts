/**
 * Shared pieces for the per-table TanStack Query caches.
 *
 * One query per table, keyed by user id. Every consumer (40 cards, the
 * dashboard, the list pages) shares that one cache entry, so a page issues at
 * most one request per table per staleTime window.
 */
import type { QueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/store";

export type UserMediaType = "movie" | "tv";
/** Anything the app uses for a media type: "series" maps to "tv". */
export type AnyMediaType = "movie" | "tv" | "series";

/** Fresh for 60s; after that a mount or invalidation refetches once (deduped). */
export const USER_DATA_STALE_TIME = 60_000;

export const userDataKeys = {
  all: ["user-data"] as const,
  watchlist: (userId: string | null) => ["user-data", "watchlist", userId] as const,
  favorites: (userId: string | null) => ["user-data", "favorites", userId] as const,
  history: (userId: string | null) => ["user-data", "history", userId] as const,
  profile: (userId: string | null) => ["user-data", "profile", userId] as const,
  counts: (userId: string | null) => ["user-data", "counts", userId] as const,
  recommendations: (seeds: string, exclude: string) =>
    ["user-data", "recommendations", seeds, exclude] as const,
};

export const normalizeMediaType = (type: AnyMediaType | string): UserMediaType =>
  type === "movie" ? "movie" : "tv";

/** "movie:123" / "tv:456", the same format /api/recommendations uses. */
export const mediaKey = (type: AnyMediaType | string, tmdbId: number) =>
  `${normalizeMediaType(type)}:${tmdbId}`;

/**
 * Untyped view of the browser Supabase client. types/database.ts does not
 * match supabase-schema.sql (it says media_id/progress/last_watched_at), so
 * rows are typed by the interfaces in this folder instead.
 */
export const db = (): SupabaseClient => supabase as unknown as SupabaseClient;

/** The signed-in user's id, or null. Re-renders only when the id changes. */
export const useUserId = (): string | null => useUserStore((s) => s.user?.id ?? null);

const idSetCache = new WeakMap<readonly object[], Set<string>>();

/**
 * Set of "type:id" keys for a row array. Memoized per array reference, so the
 * 40 card selectors that read the same cached rows build the Set once.
 */
export function idSet<T extends { tmdb_id: number; media_type: string }>(
  rows: readonly T[],
): Set<string> {
  let ids = idSetCache.get(rows);
  if (!ids) {
    ids = new Set(rows.map((row) => mediaKey(row.media_type, row.tmdb_id)));
    idSetCache.set(rows, ids);
  }
  return ids;
}

export const errorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
};

/** Postgres unique violation: the row already exists, treat as success. */
export const isDuplicateError = (error: unknown): boolean =>
  !!error && typeof error === "object" && (error as { code?: unknown }).code === "23505";

/**
 * Drop every cached user-data query (call on sign-out so the next account on
 * this device never sees the previous one's lists).
 */
export function resetUserDataCache(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: userDataKeys.all });
}
