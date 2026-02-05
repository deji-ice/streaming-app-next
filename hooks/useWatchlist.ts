"use client";

import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/store";
import type { MediaType } from "@/types";

export type WatchlistMediaType = "movie" | "tv";

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
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number | null;
  releaseDate: string | null;
}

const normalizeMediaType = (type: MediaType): WatchlistMediaType =>
  type === "series" ? "tv" : (type as WatchlistMediaType);

interface WatchlistStore {
  items: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  lastUserId: string | null;
  fetchWatchlist: (userId: string) => Promise<void>;
  addToWatchlist: (userId: string, input: AddToWatchlistInput) => Promise<void>;
  removeFromWatchlist: (userId: string, tmdbId: number, mediaType: MediaType) => Promise<void>;
  clear: () => void;
}

const useWatchlistStore = create<WatchlistStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  lastUserId: null,

  fetchWatchlist: async (userId) => {
    set({ isLoading: true, error: null, lastUserId: userId });
    const { data, error } = await supabase
      .from("watchlist")
      .select(
        "id, user_id, tmdb_id, media_type, title, poster_path, backdrop_path, vote_average, release_date, added_at",
      )
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      return;
    }

    set({ items: (data as WatchlistItem[]) ?? [], isLoading: false });
  },

  addToWatchlist: async (userId, input) => {
    set({ error: null });
    const payload = {
      user_id: userId,
      tmdb_id: input.tmdbId,
      media_type: normalizeMediaType(input.mediaType),
      title: input.title,
      poster_path: input.posterPath,
      backdrop_path: input.backdropPath,
      vote_average: input.voteAverage,
      release_date: input.releaseDate,
    };

    const { error } = await supabase.from("watchlist").insert([payload]);

    if (error && error.code !== "23505") {
      set({ error: error.message });
      throw error;
    }
  },

  removeFromWatchlist: async (userId, tmdbId, mediaType) => {
    set({ error: null });
    const normalized = normalizeMediaType(mediaType);
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("tmdb_id", tmdbId)
      .eq("media_type", normalized);

    if (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clear: () => set({ items: [], isLoading: false, error: null, lastUserId: null }),
}));

export function useWatchlist() {
  const userId = useUserStore((state) => state.user?.id ?? null);
  const {
    items,
    isLoading,
    error,
    lastUserId,
    fetchWatchlist,
    addToWatchlist: addToWatchlistStore,
    removeFromWatchlist: removeFromWatchlistStore,
    clear,
  } = useWatchlistStore();

  useEffect(() => {
    if (!userId) {
      clear();
      return;
    }

    if (lastUserId !== userId) {
      fetchWatchlist(userId);
    }
  }, [userId, lastUserId, fetchWatchlist, clear]);

  const isInWatchlist = useCallback(
    (tmdbId: number, mediaType: MediaType) => {
      const normalized = normalizeMediaType(mediaType);
      return items.some(
        (item) => item.tmdb_id === tmdbId && item.media_type === normalized,
      );
    },
    [items],
  );

  const addToWatchlist = useCallback(
    async (input: AddToWatchlistInput) => {
      if (!userId) {
        throw new Error("You must be signed in to add to watchlist.");
      }

      await addToWatchlistStore(userId, input);
      await fetchWatchlist(userId);
    },
    [addToWatchlistStore, fetchWatchlist, userId],
  );

  const removeFromWatchlist = useCallback(
    async (tmdbId: number, mediaType: MediaType) => {
      if (!userId) {
        throw new Error("You must be signed in to remove from watchlist.");
      }

      await removeFromWatchlistStore(userId, tmdbId, mediaType);
      await fetchWatchlist(userId);
    },
    [removeFromWatchlistStore, fetchWatchlist, userId],
  );

  return useMemo(
    () => ({
      items,
      isLoading,
      error,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      refresh: userId ? () => fetchWatchlist(userId) : () => undefined,
    }),
    [
      items,
      isLoading,
      error,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      fetchWatchlist,
      userId,
    ],
  );
}
