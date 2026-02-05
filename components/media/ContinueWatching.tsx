"use client";

import { useWatchHistory } from "@/hooks/useWatchHistory";
import { MediaListCard } from "@/components/media/MediaListCard";

const toSlug = (title: string, id: number) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`;

export default function ContinueWatching() {
  const { items, isLoading } = useWatchHistory();

  if (isLoading) {
    return (
      <section className="mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-montserrat font-bold mb-6">
            Continue Watching
          </h2>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-montserrat font-bold mb-6">
          Continue Watching
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.slice(0, 10).map((item) => {
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
                showPlayIcon={true}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
