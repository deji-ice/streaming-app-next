"use client";

import Link from "next/link";
import {
  Activity,
  Bookmark,
  Heart,
  TrendingUp,
  Clock,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MediaListCard } from "@/components/media/MediaListCard";
import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

const toSlug = (title: string, id: number) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`;

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthModal } = useAuthModal();
  const { items: watchlist, isLoading: watchlistLoading } = useWatchlist();
  const { items: history, isLoading: historyLoading } = useWatchHistory();
  const { items: favorites, isLoading: favoritesLoading } = useFavorites();
  const { profile, stats, isLoading: profileLoading } = useUserProfile();

  const isLoading =
    watchlistLoading || historyLoading || favoritesLoading || profileLoading;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthModal();
    }
  }, [authLoading, isAuthenticated, openAuthModal]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 pt-24">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const recentHistory = history.slice(0, 5);
  const topFavorites = favorites.slice(0, 5);

  return (
    <div className="container mx-auto px-4 pb-10 pt-20 md:pt-24">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile?.full_name || "User"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile">View Profile</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Movies Watched
              </p>
              <p className="text-3xl font-bold mt-2">
                {stats?.totalMoviesWatched || 0}
              </p>
            </div>
            <Film className="w-8 h-8 text-primary/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Watchlist
              </p>
              <p className="text-3xl font-bold mt-2">{watchlist.length}</p>
            </div>
            <Bookmark className="w-8 h-8 text-primary/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Favorites
              </p>
              <p className="text-3xl font-bold mt-2">{favorites.length}</p>
            </div>
            <Heart className="w-8 h-8 text-primary/30" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Hours Watched
              </p>
              <p className="text-3xl font-bold mt-2">
                {stats?.totalHours || 0}h
              </p>
            </div>
            <Clock className="w-8 h-8 text-primary/30" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Continue Watching & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Watching */}
          {recentHistory.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-montserrat font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Continue Watching
                </h2>
                <Link
                  href="/history"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recentHistory.map((item) => {
                  const mediaType =
                    item.media_type === "tv" ? "series" : "movie";
                  const slug = toSlug(item.title, item.tmdb_id);

                  return (
                    <MediaListCard
                      key={item.id}
                      title={item.title}
                      posterPath={item.poster_path}
                      season={item.season_number ?? undefined}
                      episode={item.episode_number ?? undefined}
                      lastWatchedDate={item.watched_at}
                      href={`/${mediaType}/${slug}`}
                      showPlayIcon={true}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Top Favorites */}
          {topFavorites.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-montserrat font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Top Favorites
                </h2>
                <Link
                  href="/favorites"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {topFavorites.map((item) => {
                  const mediaType =
                    item.media_type === "tv" ? "series" : "movie";
                  const slug = toSlug(item.title, item.tmdb_id);

                  return (
                    <MediaListCard
                      key={item.id}
                      title={item.title}
                      posterPath={item.poster_path}
                      href={`/${mediaType}/${slug}`}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Links */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-sm text-muted-foreground">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <Link href="/watchlist">
                  <Bookmark className="w-4 h-4" />
                  My Watchlist
                  <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {watchlist.length}
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <Link href="/favorites">
                  <Heart className="w-4 h-4" />
                  My Favorites
                  <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {favorites.length}
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <Link href="/history">
                  <Activity className="w-4 h-4" />
                  Watch History
                  <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                    {history.length}
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Your Activity
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-semibold">
                  {recentHistory.length} watched
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2 mt-1">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((recentHistory.length / 10) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">
              Recommendations
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Based on your watchlist and favorites
            </p>
            <Button asChild className="w-full gap-2" size="sm">
              <Link href="/recommendations">
                <TrendingUp className="w-4 h-4" />
                Discover More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
