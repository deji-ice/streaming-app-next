"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play } from "lucide-react";
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

      // Verify the URL matches what the API expects
      // console.log("Navigating to:", url);
      // console.log("Episode number:", episodeNumber);
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
      <div className="grid gap-4">
        {paginatedEpisodes.map((episode) => (
          <div
            key={episode.id}
            className="flex bg-card hover:bg-accent/50 transition-colors rounded-lg overflow-hidden group"
          >
            {/* Episode Thumbnail */}

            <div className="relative w-48 aspect-video flex-shrink-0">
              <Image
                src={
                  episode.still_path
                    ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                    : "/placeholder-episode.jpg"
                }
                alt={episode.name}
                fill
                className={`object-cover ${
                  episode.still_path ? "" : "bg-gray-300"
                } ${
                  new Date() < new Date(episode.air_date)
                    ? "filter grayscale cursor-not-allowed"
                    : " cursor-pointer"
                }`}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
                  onClick={(e) => handlePlayEpisode(episode.episode_number, e)}
                  disabled={
                    isLoading || new Date() < new Date(episode.air_date)
                  }
                >
                  <Play className="w-8 h-8" />
                </Button>
              </div>
            </div>

            {/* Episode Info */}
            <div className="p-4 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Episode {episode.episode_number}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {new Date() > new Date(episode.air_date)
                    ? new Date(episode.air_date).toLocaleDateString()
                    : `Available: ${new Date(
                        episode.air_date
                      ).toLocaleDateString()} `}
                </span>
              </div>
              <h3 className="font-montserrat font-bold text-lg">
                {episode.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {episode.overview}
              </p>
            </div>
          </div>
        ))}
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
