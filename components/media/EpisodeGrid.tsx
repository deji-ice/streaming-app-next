"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Episode } from "@/types";

interface EpisodeGridProps {
  episodes: Episode[];
  seriesId: string;
  currentSeason: number;
  currentEpisode?: number;
}

export default function EpisodeGrid({
  episodes,
  seriesId,
  currentSeason,
  currentEpisode,
}: EpisodeGridProps) {
  const router = useRouter();
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(
    new Set(),
  );

  const toggleExpanded = (episodeId: number) => {
    setExpandedEpisodes((prev) => {
      const next = new Set(prev);
      if (next.has(episodeId)) next.delete(episodeId);
      else next.add(episodeId);
      return next;
    });
  };

  const playEpisode = (episodeNumber: number) => {
    router.push(
      `/series/${seriesId}?season=${currentSeason}&episode=${episodeNumber}`,
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {episodes.map((episode) => {
        const isAvailable = new Date() >= new Date(episode.air_date);
        const isCurrent = episode.episode_number === currentEpisode;
        const isExpanded = expandedEpisodes.has(episode.id);

        return (
          <article
            key={episode.id}
            className={cn(
              "overflow-hidden rounded-xl border transition-colors",
              isCurrent
                ? "border-primary ring-1 ring-primary"
                : isAvailable
                  ? "border-border hover:border-primary/60"
                  : "border-border/50",
            )}
          >
            <div
              role="button"
              tabIndex={isAvailable ? 0 : -1}
              aria-disabled={!isAvailable}
              aria-label={`Play episode ${episode.episode_number}: ${episode.name}`}
              onClick={() => isAvailable && playEpisode(episode.episode_number)}
              onKeyDown={(e) => {
                if (isAvailable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  playEpisode(episode.episode_number);
                }
              }}
              className={cn(
                "group relative aspect-video w-full",
                isAvailable ? "cursor-pointer" : "cursor-not-allowed",
              )}
            >
              <Image
                src={
                  episode?.still_path
                    ? `https://image.tmdb.org/t/p/w780${episode.still_path}`
                    : "/placeholder-poster.jpg"
                }
                alt={episode.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className={cn(
                  "object-cover transition",
                  isAvailable
                    ? "group-hover:brightness-90"
                    : "brightness-50 grayscale",
                )}
              />

              {/* Episode number */}
              <span className="absolute left-2 top-2 z-10 rounded-md bg-background/85 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
                EP {episode.episode_number}
              </span>

              {/* Availability with status dot */}
              <span
                className={cn(
                  "absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                  isAvailable
                    ? "bg-green-500/20 text-green-400"
                    : "bg-amber-500/20 text-amber-400",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isAvailable ? "bg-green-400" : "bg-amber-400",
                  )}
                />
                {isAvailable ? "Available" : "Coming soon"}
              </span>

              {isCurrent && (
                <span className="absolute bottom-2 left-2 z-10 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  Now playing
                </span>
              )}

              {isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
                  <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 p-4">
              <h3 className="line-clamp-1 font-montserrat text-base font-bold">
                {episode.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{episode.runtime ?? 0}m</span>
                <span>·</span>
                <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                <span>·</span>
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{episode.vote_average?.toFixed(1) ?? "N/A"}</span>
              </div>
              <p
                className={cn(
                  "text-sm leading-relaxed text-foreground/80",
                  !isExpanded && "line-clamp-3",
                )}
              >
                {episode.overview || "No description available."}
              </p>
              {episode.overview && episode.overview.length > 100 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleExpanded(episode.id);
                  }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
