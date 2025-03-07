"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { VideoPlayerProps } from "@/types";

export default function VideoPlayer({
  tmdbId,
  type,
  posterPath,
  title,
  episode,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");

  const handlePlay = async () => {
    try {
      // Base params for all types
      const params = new URLSearchParams({
        type,
        id: tmdbId.toString(),
      });

      // Add season and episode params only for series
      if (type === "series" && episode) {
        params.append("season", episode.season.toString());
        params.append("episode", episode.number.toString());
      }

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
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "/placeholder-poster.jpg";

  if (!isPlaying) {
    return (
      <div className="w-full pt-[56px] md:pt-0">
        {/* Add top padding for mobile */}
        <div
          className="relative w-full aspect-video cursor-pointer group"
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
            <div className="bg-primary/90 p-3 sm:p-4 rounded-full transition-transform group-hover:scale-110">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return streamUrl ? (
    <div className="w-full pt-[56px] md:pt-0">
      {/* Add top padding for mobile */}
      <div className="relative w-full aspect-video">
        <iframe
          src={streamUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          referrerPolicy="no-referrer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  ) : null;
}
