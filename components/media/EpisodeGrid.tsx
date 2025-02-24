"use client";

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

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  air_date: string;
}

interface EpisodeGridProps {
  episodes: Episode[];
}

const EPISODES_PER_PAGE = 5;

export default function EpisodeGrid({
  episodes
}: EpisodeGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);

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
                    ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                    : "/placeholder-episode.jpg"
                }
                alt={episode.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="ghost" size="icon" className="text-white">
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
                  {new Date(episode.air_date).toLocaleDateString()}
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
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  active={currentPage === i + 1}
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
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
