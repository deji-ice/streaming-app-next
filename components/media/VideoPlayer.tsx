"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { MediaType } from "@/types";

interface VideoPlayerProps {
  tmdbId: number;
  type: MediaType;
  posterPath: string | null;
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
  const [streamUrl, setStreamUrl] = useState<string>("");

  const handlePlay = async () => {
    try {
      const params = new URLSearchParams({
        type,
        id: tmdbId.toString(),
        ...(episode && {
          season: episode.season.toString(),
          episode: episode.number.toString(),
        }),
      });

      const res = await fetch(`/api/stream?${params}`);
      const data = await res.json();

      if (data.url) {
        setStreamUrl(data.url);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error fetching stream URL:", error);
    }
  };

  const backdropUrl = posterPath
    ? `https://image.tmdb.org/t/p/original${posterPath}`
    : "/placeholder-poster.jpg";

  if (!isPlaying) {
    return (
      <div
        className="relative aspect-video w-full group cursor-pointer"
        onClick={handlePlay}
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

  return streamUrl ? (
    <iframe
      src={streamUrl}
      className="absolute inset-0 w-full h-full"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  ) : null;
}
