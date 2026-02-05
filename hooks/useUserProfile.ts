import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
    id: string;
    email: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProfileStats {
    totalMoviesWatched: number;
    totalSeriesWatched: number;
    totalHours: number;
    watchlistCount: number;
    favoritesCount: number;
}

export function useUserProfile() {
    const user = useUserStore((state) => state.user);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile
    const fetchProfile = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (fetchError) throw fetchError;

            setProfile(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch profile";
            setError(message);
            console.error("Profile fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    // Fetch profile statistics
    const fetchStats = useCallback(async () => {
        if (!user?.id) return;

        try {
            const [watchHistoryRes, watchlistRes, favoritesRes] = await Promise.all([
                supabase
                    .from("watch_history")
                    .select("id, media_type", { count: "exact" })
                    .eq("user_id", user.id),
                supabase
                    .from("watchlist")
                    .select("id", { count: "exact" })
                    .eq("user_id", user.id),
                supabase
                    .from("favorites")
                    .select("id", { count: "exact" })
                    .eq("user_id", user.id),
            ]);

            const movieCount =
                watchHistoryRes.data?.filter((item: any) => item.media_type === "movie").length || 0;
            const seriesCount =
                watchHistoryRes.data?.filter((item: any) => item.media_type === "tv").length || 0;

            setStats({
                totalMoviesWatched: movieCount,
                totalSeriesWatched: seriesCount,
                totalHours: Math.round((movieCount + seriesCount * 6) * 1.5), // Rough estimate
                watchlistCount: watchlistRes.count || 0,
                favoritesCount: favoritesRes.count || 0,
            });
        } catch (err) {
            console.error("Stats fetch error:", err);
        }
    }, [user?.id]);

    // Update profile
    const updateProfile = useCallback(
        async (updates: Partial<UserProfile>) => {
            if (!user?.id) return;

            try {
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({
                        ...updates,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", user.id);

                if (updateError) throw updateError;

                setProfile((prev) => (prev ? { ...prev, ...updates } : null));
                return true;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to update profile";
                setError(message);
                console.error("Profile update error:", err);
                return false;
            }
        },
        [user?.id]
    );

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, [fetchProfile, fetchStats]);

    return {
        profile,
        stats,
        isLoading,
        error,
        updateProfile,
        refresh: () => {
            fetchProfile();
            fetchStats();
        },
    };
}
