"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Episode } from "@/types";

interface EpisodeGridProps {
  episodes: Episode[];
  seriesId: string;
  currentSeason: number;
}

const EPISODES_PER_PAGE = 5;

export default function EpisodeGrid({
  episodes,
  seriesId,
  currentSeason,
}: EpisodeGridProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);

  const handlePlayEpisode = async (
    episodeNumber: number,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const url = `/series/${seriesId}?season=${currentSeason}&episode=${episodeNumber}`;
      await router.push(url);
    } catch (error) {
      console.error("Navigation error:", error);
    }
    setIsLoading(false);
  };

  const paginatedEpisodes = episodes.slice(
    (currentPage - 1) * EPISODES_PER_PAGE,
    currentPage * EPISODES_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {paginatedEpisodes.map((episode) => {
          const isAvailable = new Date() >= new Date(episode.air_date);

          return (
            <div
              key={episode.id}
              className={`relative rounded-xl overflow-hidden border transition-all ${
                isAvailable
                  ? "border-primary/20 hover:border-primary"
                  : "border-muted/30"
              }`}
            >
              <div className="grid md:grid-cols-[280px_1fr] gap-0">
                <div className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 font-semibold text-sm">
                  EP {episode.episode_number}
                </div>

                <div
                  className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-medium ${
                    isAvailable
                      ? "bg-green-500/20 text-green-500"
                      : "bg-amber-500/20 text-amber-500"
                  }`}
                >
                  {isAvailable ? "Available" : "Coming Soon"}
                </div>

                <div
                  className="relative aspect-video w-full h-full"
                  onClick={(e) => handlePlayEpisode(episode.episode_number, e)}
                >
                  <Image
                    src={
                      episode.still_path
                        ? `https://image.tmdb.org/t/p/w780${episode.still_path}`
                        : "/placeholder-episode.jpg"
                    }
                    alt={episode.name}
                    fill
                    className={`object-cover ${
                      isAvailable
                        ? "hover:brightness-75 cursor-pointer"
                        : "brightness-50 grayscale cursor-not-allowed"
                    }`}
                  />

                  {isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 transition-opacity hover:bg-black/30 dark:hover:bg-black/50">
                      <Button
                        variant="secondary"
                        size="default"
                        disabled={isLoading}
                        className="gap-2 font-medium bg-background/80 backdrop-blur-sm text-foreground border-primary/30"
                      >
                        <Play className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Episode Info */}
                <div className="p-5 flex flex-col">
                  <h3 className="font-montserrat text-xl font-bold mb-2 line-clamp-1">
                    {episode.name}
                  </h3>

                  <div className="flex flex-wrap gap-1.5  mb-3 items-center font-semibold text-sm text-slate-700 dark:text-slate-400">
                    <div className="flex items-center  gap-1">
                      {episode.runtime ?? 0}min
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <span>
                        {new Date(episode.air_date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{episode.vote_average.toFixed(1)}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-800 dark:text-slate-200 text-xs md:text-sm flex-grow line-clamp-4 md:line-clamp-3">
                      {episode.overview || "No description available."}
                    </p>

                    {episode.overview && episode.overview.length > 80 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const element = e.currentTarget
                            .previousElementSibling as HTMLElement;
                          if (element.classList.contains("line-clamp-4")) {
                            element.classList.remove(
                              "line-clamp-4",
                              "md:line-clamp-3"
                            );
                            e.currentTarget.textContent = "Show Less";
                          } else {
                            element.classList.add(
                              "line-clamp-4",
                              "md:line-clamp-3"
                            );
                            e.currentTarget.textContent = "Read More";
                          }
                        }}
                        className="text-black text-sm mt-2 md:hidden hover:underline"
                      >
                        Read More
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  className={
                    currentPage === i + 1
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
