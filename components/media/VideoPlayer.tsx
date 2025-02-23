"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  tmdbId: number;
  type: "movie" | "series";
  posterPath: string;
  title: string;
  episode?: {
    season: number;
    number: number;
  };
}

export default function VideoPlayer({
  tmdbId,
  type,
  posterPath,
  title,
  episode,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const url =
    type === "movie"
      ? `https://vidsrc.to/embed/movie/${tmdbId}`
      : `https://vidsrc.to/embed/tv/${tmdbId}/${episode?.season || 1}/${
          episode?.number || 1
        }`;

  const backdropUrl = posterPath
    ? `https://image.tmdb.org/t/p/original${posterPath}`
    : "/placeholder-poster.jpg";

  if (!isPlaying) {
    return (
      <div
        className="relative aspect-video w-full group cursor-pointer"
        onClick={() => setIsPlaying(true)}
      >
        <Image
          src={backdropUrl}
          alt={title}
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary/90 p-4 rounded-full transition-transform group-hover:scale-110">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className="absolute inset-0 w-full h-full"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  );
}
