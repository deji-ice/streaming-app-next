"use client";

import { useCallback, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  type RecommendationResult,
  recommendationsQueryOptions,
  useRecommendationSeeds,
} from "@/lib/user-data/recommendations";

/** Legacy TMDB-like shape kept for existing consumers. */
export interface Recommendation {
    id: number;
    title: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    /** Always "" (the recommendations route does not return overviews). */
    overview: string;
    vote_average: number;
    /** Always 0 (not returned by the route). */
    vote_count: number;
    media_type: "movie" | "tv";
    /** Rank-based ordering score, 100 for the first result. Internal: do not display. */
    score: number;
}

const EMPTY: Recommendation[] = [];

function toRecommendation(result: RecommendationResult, index: number): Recommendation {
    const year = result.year != null && String(result.year).trim() !== "" ? String(result.year) : undefined;
    const base = {
        id: result.id,
        title: result.title,
        poster_path: result.posterPath ?? null,
        backdrop_path: result.backdropPath ?? null,
        overview: "",
        vote_average: typeof result.rating === "number" ? result.rating : 0,
        vote_count: 0,
        media_type: result.mediaType === "tv" ? ("tv" as const) : ("movie" as const),
        score: Math.max(0, 100 - index),
    };
    return result.mediaType === "tv"
        ? { ...base, name: result.title, first_air_date: year }
        : { ...base, release_date: year };
}

/**
 * Recommendations from GET /api/recommendations, seeded by favorites,
 * watchlist and history (local history works signed out). Returns an empty
 * list when there are no seeds yet.
 */
export function useRecommendations() {
    const { seeds, exclude, isLoading: seedsLoading } = useRecommendationSeeds();
    const seedKeys = useMemo(() => seeds.map((seed) => seed.key), [seeds]);

    const query = useQuery({
        ...recommendationsQueryOptions(seedKeys, exclude),
        enabled: !seedsLoading && seedKeys.length > 0,
        placeholderData: keepPreviousData,
    });

    const recommendations = useMemo(
        () => (query.data ? query.data.map(toRecommendation) : EMPTY),
        [query.data],
    );

    const { refetch } = query;
    const refresh = useCallback(async (): Promise<void> => {
        if (seedKeys.length > 0) await refetch();
    }, [refetch, seedKeys.length]);

    return {
        recommendations: seedKeys.length > 0 ? recommendations : EMPTY,
        isLoading: seedsLoading || query.isLoading,
        refresh,
    };
}
