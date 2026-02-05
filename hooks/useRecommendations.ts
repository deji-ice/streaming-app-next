import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { tmdb } from "@/lib/tmdb";

export interface Recommendation {
    id: number;
    title: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    media_type: "movie" | "tv";
    score: number; // Recommendation score (0-100)}
}

export function useRecommendations() {
    const user = useUserStore((state) => state.user);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateRecommendations = useCallback(async () => {
        if (!user?.id) {
            setRecommendations([]);
            return;
        }

        try {
            setIsLoading(true);

            // Fetch user's watchlist and favorites
            const [watchlistRes, favoritesRes] = await Promise.all([
                supabase
                    .from("watchlist")
                    .select("tmdb_id, media_type")
                    .eq("user_id", user.id),
                supabase
                    .from("favorites")
                    .select("tmdb_id, media_type")
                    .eq("user_id", user.id),
            ]);

            const watchlistIds = watchlistRes.data?.map((item: any) => item.tmdb_id) || [];
            const favoriteIds = favoritesRes.data?.map((item: any) => item.tmdb_id) || [];
            const allUserItems = [...new Set([...watchlistIds, ...favoriteIds])];

            if (allUserItems.length === 0) {
                // If no watchlist/favorites, return trending content
                const trending = await tmdb.getTrending();

                const allTrending = (trending.results || [])
                    .map((item: any) => ({
                        ...item,
                        media_type: item.media_type || "movie",
                        score: (item.popularity || 0) * 5,
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 20);

                setRecommendations(allTrending);
                return;
            }

            // Get similar items for each user item
            const recommendedMap = new Map<number, Recommendation>();

            for (const itemId of allUserItems.slice(0, 5)) {
                // Limit to first 5 for performance
                const watchlistItem = watchlistRes.data?.find((w: any) => w.tmdb_id === itemId);
                const mediaType = watchlistItem?.media_type || "movie";

                try {
                    const details = await tmdb.getMediaDetails(
                        itemId.toString(),
                        mediaType === "tv" ? "tv" : "movie"
                    );

                    const similar = (details as any).similar?.results || [];

                    if (similar && similar.length > 0) {
                        for (const item of similar) {
                            const key = `${mediaType}-${item.id}`;

                            // Increase score if already in recommendations
                            if (recommendedMap.has(item.id)) {
                                const existing = recommendedMap.get(item.id)!;
                                existing.score += item.vote_average || 5;
                            } else {
                                recommendedMap.set(item.id, {
                                    ...item,
                                    media_type: mediaType as "movie" | "tv",
                                    score: (item.vote_average || 5) * (favoriteIds.includes(itemId) ? 1.5 : 1),
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching similar content for ${itemId}:`, err);
                }
            }

            // Filter out items already in user's watchlist/favorites
            const filtered = Array.from(recommendedMap.values())
                .filter((rec) => !allUserItems.includes(rec.id))
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);

            setRecommendations(filtered);
        } catch (err) {
            console.error("Recommendations generation error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        generateRecommendations();
    }, [generateRecommendations]);

    return {
        recommendations,
        isLoading,
        refresh: generateRecommendations,
    };
}
