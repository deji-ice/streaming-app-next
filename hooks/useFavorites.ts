import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export interface Favorite {
    id: string;
    user_id: string;
    tmdb_id: number;
    media_type: "movie" | "tv";
    title: string;
    poster_path: string | null;
}

export function useFavorites() {
    const user = useUserStore((state) => state.user);
    const [items, setItems] = useState<Favorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all favorites
    const fetchFavorites = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("favorites")
                .select("*")
                .eq("user_id", user.id);

            if (error) throw error;
            setItems(data || []);
        } catch (err) {
            console.error("Favorites fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Check if item is in favorites
    const isInFavorites = useCallback(
        (tmdbId: number, mediaType: "movie" | "series") => {
            const type = mediaType === "series" ? "tv" : "movie";
            return items.some((item) => item.tmdb_id === tmdbId && item.media_type === type);
        },
        [items]
    );

    // Add to favorites
    const addToFavorites = useCallback(
        async (
            tmdbId: number,
            mediaType: "movie" | "series",
            title: string,
            posterPath?: string | null
        ) => {
            if (!user?.id) {
                throw new Error("You must be signed in to add favorites.");
            }

            try {
                const type = mediaType === "series" ? "tv" : "movie";

                const { error } = await supabase.from("favorites").insert([
                    {
                        user_id: user.id,
                        tmdb_id: tmdbId,
                        media_type: type,
                        title,
                        poster_path: posterPath || null,
                    },
                ]);

                if (error) throw error;

                setItems((prev) => [
                    {
                        id: `temp-${Date.now()}`,
                        user_id: user.id,
                        tmdb_id: tmdbId,
                        media_type: type,
                        title,
                        poster_path: posterPath || null,
                    },
                    ...prev,
                ]);
            } catch (err) {
                console.error("Add to favorites error:", err);
                throw err;
            }
        },
        [user?.id]
    );

    // Remove from favorites
    const removeFromFavorites = useCallback(
        async (tmdbId: number, mediaType: "movie" | "series") => {
            if (!user?.id) {
                throw new Error("You must be signed in to remove favorites.");
            }

            try {
                const type = mediaType === "series" ? "tv" : "movie";

                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("tmdb_id", tmdbId)
                    .eq("media_type", type);

                if (error) throw error;

                setItems((prev) =>
                    prev.filter(
                        (item) => !(item.tmdb_id === tmdbId && item.media_type === type)
                    )
                );
            } catch (err) {
                console.error("Remove from favorites error:", err);
                throw err;
            }
        },
        [user?.id]
    );

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    return {
        items,
        isLoading,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
        refresh: fetchFavorites,
    };
}
