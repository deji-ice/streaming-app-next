"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { MediaListCard } from "@/components/media/MediaListCard";

const toSlug = (title: string, id: number) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`;

export default function FavoritesPage() {
  const { items, isLoading, removeFromFavorites } = useFavorites();

  const handleRemove = async (
    tmdbId: number,
    mediaType: "movie" | "series",
  ) => {
    try {
      await removeFromFavorites(tmdbId, mediaType);
      toast.success("Removed from favorites");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove from favorites";
      toast.error(message);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-10 pt-16 md:pt-20">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold">
          Your Favorites
        </h1>
        <p className="text-sm text-muted-foreground">
          Movies and series you love the most.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading favorites...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border p-6 bg-card">
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Your favorites list is empty. Add your favorite movies or series
              to get started.
            </p>
          </div>
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
                href={`/${mediaType}/${slug}`}
                onAction={() => handleRemove(item.tmdb_id, mediaType)}
                actionIcon={Heart}
                actionLabel="Remove from favorites"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
