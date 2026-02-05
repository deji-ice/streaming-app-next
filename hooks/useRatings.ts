import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export interface Rating {
    id: string;
    user_id: string;
    tmdb_id: number;
    media_type: "movie" | "tv";
    rating: number; // 1-10
    review: string | null;
    created_at: string;
    updated_at: string;
}

export interface AggregatedRating {
    averageRating: number;
    totalRatings: number;
}

export function useRatings() {
    const user = useUserStore((state) => state.user);
    const [userRating, setUserRating] = useState<Rating | null>(null);
    const [aggregated, setAggregated] = useState<AggregatedRating | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch user's rating for a specific item
    const fetchUserRating = useCallback(
        async (tmdbId: number, mediaType: "movie" | "series") => {
            if (!user?.id) return;

            try {
                setIsLoading(true);
                const type = mediaType === "series" ? "tv" : "movie";

                const { data, error } = await supabase
                    .from("user_ratings")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("tmdb_id", tmdbId)
                    .eq("media_type", type)
                    .single();

                if (error && error.code !== "PGRST116") {
                    throw error;
                }

                setUserRating(data || null);
            } catch (err) {
                console.error("Fetch user rating error:", err);
            } finally {
                setIsLoading(false);
            }
        },
        [user?.id]
    );

    // Fetch aggregated ratings for a specific item
    const fetchAggregatedRating = useCallback(
        async (tmdbId: number, mediaType: "movie" | "series") => {
            try {
                const type = mediaType === "series" ? "tv" : "movie";

                const { data, error } = await supabase
                    .from("user_ratings")
                    .select("rating")
                    .eq("tmdb_id", tmdbId)
                    .eq("media_type", type);

                if (error) throw error;

                if (data && data.length > 0) {
                    const sum = data.reduce((acc: number, item: any) => acc + item.rating, 0);
                    setAggregated({
                        averageRating: sum / data.length,
                        totalRatings: data.length,
                    });
                } else {
                    setAggregated({ averageRating: 0, totalRatings: 0 });
                }
            } catch (err) {
                console.error("Fetch aggregated rating error:", err);
            }
        },
        []
    );

    // Submit or update rating
    const submitRating = useCallback(
        async (
            tmdbId: number,
            mediaType: "movie" | "series",
            rating: number,
            review?: string
        ) => {
            if (!user?.id || rating < 1 || rating > 10) return;

            try {
                const type = mediaType === "series" ? "tv" : "movie";

                if (userRating) {
                    // Update existing rating
                    const { error } = await supabase
                        .from("user_ratings")
                        .update({
                            rating,
                            review: review || null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", userRating.id);

                    if (error) throw error;
                } else {
                    // Insert new rating
                    const { error } = await supabase.from("user_ratings").insert([
                        {
                            user_id: user.id,
                            tmdb_id: tmdbId,
                            media_type: type,
                            rating,
                            review: review || null,
                        },
                    ]);

                    if (error) throw error;
                }

                // Refresh both user and aggregated ratings
                await Promise.all([
                    fetchUserRating(tmdbId, mediaType),
                    fetchAggregatedRating(tmdbId, mediaType),
                ]);

                return true;
            } catch (err) {
                console.error("Submit rating error:", err);
                throw err;
            }
        },
        [user?.id, userRating, fetchUserRating, fetchAggregatedRating]
    );

    // Delete rating
    const deleteRating = useCallback(
        async (tmdbId: number, mediaType: "movie" | "series") => {
            if (!user?.id || !userRating) return;

            try {
                const { error } = await supabase
                    .from("user_ratings")
                    .delete()
                    .eq("id", userRating.id);

                if (error) throw error;

                setUserRating(null);

                // Refresh aggregated rating
                await fetchAggregatedRating(tmdbId, mediaType);

                return true;
            } catch (err) {
                console.error("Delete rating error:", err);
                throw err;
            }
        },
        [user?.id, userRating, fetchAggregatedRating]
    );

    return {
        userRating,
        aggregated,
        isLoading,
        fetchUserRating,
        fetchAggregatedRating,
        submitRating,
        deleteRating,
    };
}
