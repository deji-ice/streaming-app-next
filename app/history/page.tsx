"use client";

import { Trash2 } from "lucide-react";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/store";
import { MediaListCard } from "@/components/media/MediaListCard";

const toSlug = (title: string, id: number) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`;

export default function HistoryPage() {
  const { items, isLoading, refresh } = useWatchHistory();
  const userId = useUserStore((state) => state.user?.id ?? null);

  const handleRemove = async (
    tmdbId: number,
    mediaType: "movie" | "series",
    seasonNumber?: number | null,
    episodeNumber?: number | null,
  ) => {
    if (!userId) return;

    try {
      let deleteQuery = supabase
        .from("watch_history")
        .delete()
        .eq("user_id", userId)
        .eq("tmdb_id", tmdbId)
        .eq("media_type", mediaType === "series" ? "tv" : "movie");

      if (mediaType === "series") {
        if (typeof seasonNumber === "number") {
          deleteQuery = deleteQuery.eq("season_number", seasonNumber);
        } else {
          deleteQuery = deleteQuery.is("season_number", null);
        }

        if (typeof episodeNumber === "number") {
          deleteQuery = deleteQuery.eq("episode_number", episodeNumber);
        } else {
          deleteQuery = deleteQuery.is("episode_number", null);
        }
      } else {
        deleteQuery = deleteQuery
          .is("season_number", null)
          .is("episode_number", null);
      }

      const { error } = await deleteQuery;

      if (error) {
        throw error;
      }

      toast.success("Removed from history");
      refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to remove history item";
      toast.error(message);
    }
  };

  return (
    <div className="container mx-auto px-4 pb-10 pt-16 md:pt-20">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold">
          Watch History
        </h1>
        <p className="text-sm text-muted-foreground">
          Jump back into what you were watching.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading watch history...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border p-6 bg-card">
          <p className="text-muted-foreground">Your watch history is empty.</p>
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
                season={item.season_number ?? undefined}
                episode={item.episode_number ?? undefined}
                lastWatchedDate={item.watched_at}
                href={`/${mediaType}/${slug}`}
                onAction={() =>
                  handleRemove(
                    item.tmdb_id,
                    mediaType,
                    item.season_number,
                    item.episode_number,
                  )
                }
                actionIcon={Trash2}
                actionLabel="Remove from history"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
