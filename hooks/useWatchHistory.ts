"use client";

import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/store";
import type { MediaType } from "@/types";

export type HistoryMediaType = "movie" | "tv";

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

const normalizeMediaType = (type: MediaType): HistoryMediaType =>
    type === "series" ? "tv" : (type as HistoryMediaType);

interface WatchHistoryStore {
    items: WatchHistoryItem[];
    isLoading: boolean;
    error: string | null;
    lastUserId: string | null;
    fetchHistory: (userId: string) => Promise<void>;
    logWatchStart: (userId: string, input: LogWatchInput) => Promise<void>;
    clear: () => void;
}

const useWatchHistoryStore = create<WatchHistoryStore>((set) => ({
    items: [],
    isLoading: false,
    error: null,
    lastUserId: null,

    fetchHistory: async (userId) => {
        set({ isLoading: true, error: null, lastUserId: userId });
        const { data, error } = await supabase
            .from("watch_history")
            .select(
                "id, user_id, tmdb_id, media_type, title, poster_path, backdrop_path, season_number, episode_number, progress_seconds, duration_seconds, watched_at, updated_at",
            )
            .eq("user_id", userId)
            .order("watched_at", { ascending: false });

        if (error) {
            set({ error: error.message, isLoading: false });
            return;
        }

        set({ items: (data as WatchHistoryItem[]) ?? [], isLoading: false });
    },

    logWatchStart: async (userId, input) => {
        set({ error: null });

        const normalized = normalizeMediaType(input.mediaType);

        let deleteQuery = supabase
            .from("watch_history")
            .delete()
            .eq("user_id", userId)
            .eq("tmdb_id", input.tmdbId)
            .eq("media_type", normalized);

        if (normalized === "tv") {
            if (typeof input.seasonNumber === "number") {
                deleteQuery = deleteQuery.eq("season_number", input.seasonNumber);
            } else {
                deleteQuery = deleteQuery.is("season_number", null);
            }

            if (typeof input.episodeNumber === "number") {
                deleteQuery = deleteQuery.eq("episode_number", input.episodeNumber);
            } else {
                deleteQuery = deleteQuery.is("episode_number", null);
            }
        } else {
            deleteQuery = deleteQuery.is("season_number", null).is("episode_number", null);
        }

        await deleteQuery;

        const payload = {
            user_id: userId,
            tmdb_id: input.tmdbId,
            media_type: normalized,
            title: input.title,
            poster_path: input.posterPath,
            backdrop_path: input.backdropPath,
            season_number: input.seasonNumber ?? null,
            episode_number: input.episodeNumber ?? null,
            progress_seconds: input.progressSeconds ?? 0,
            duration_seconds: input.durationSeconds ?? null,
            watched_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("watch_history").insert([payload]);

        if (error) {
            set({ error: error.message });
            throw error;
        }
    },

    clear: () => set({ items: [], isLoading: false, error: null, lastUserId: null }),
}));

export function useWatchHistory() {
    const userId = useUserStore((state) => state.user?.id ?? null);
    const {
        items,
        isLoading,
        error,
        lastUserId,
        fetchHistory,
        logWatchStart: logWatchStartStore,
        clear,
    } = useWatchHistoryStore();

    useEffect(() => {
        if (!userId) {
            clear();
            return;
        }

        if (lastUserId !== userId) {
            fetchHistory(userId);
        }
    }, [userId, lastUserId, fetchHistory, clear]);

    const logWatchStart = useCallback(
        async (input: LogWatchInput) => {
            if (!userId) {
                throw new Error("You must be signed in to continue watching.");
            }

            await logWatchStartStore(userId, input);
            await fetchHistory(userId);
        },
        [userId, logWatchStartStore, fetchHistory],
    );

    return useMemo(
        () => ({
            items,
            isLoading,
            error,
            logWatchStart,
            refresh: userId ? () => fetchHistory(userId) : () => undefined,
        }),
        [items, isLoading, error, logWatchStart, fetchHistory, userId],
    );
}
