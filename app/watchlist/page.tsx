"use client";

import { Trash2 } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { toast } from "sonner";
import { MediaListCard } from "@/components/media/MediaListCard";
import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

const toSlug = (title: string, id: number) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`;

export default function WatchlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useUser();
  const { openAuthModal } = useAuthModal();
  const { items, isLoading, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openAuthModal();
    }
  }, [authLoading, isAuthenticated, openAuthModal]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleRemove = async (
    tmdbId: number,
    mediaType: "movie" | "series",
  ) => {
    try {
      await removeFromWatchlist(tmdbId, mediaType);
      toast.success("Removed from watchlist");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove from watchlist";
      toast.error(message);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-10 pt-16 md:pt-20">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold">
          Your Watchlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Movies and series saved to watch later.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading watchlist...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border p-6 bg-card">
          <p className="text-muted-foreground">
            Your watchlist is empty. Add a movie or series to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item) => {
            const mediaType = item.media_type === "tv" ? "series" : "movie";
            const slug = toSlug(item.title, item.tmdb_id);

            return (
              <MediaListCard
                key={item.id}
                title={item.title}
                posterPath={item.poster_path}
                year={
                  item.release_date
                    ? new Date(item.release_date).getFullYear()
                    : undefined
                }
                href={`/${mediaType}/${slug}`}
                onAction={() => handleRemove(item.tmdb_id, mediaType)}
                actionIcon={Trash2}
                actionLabel="Remove from watchlist"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
