"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlayerProps } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useStreamSource } from "@/hooks/useStreamSource";
import { getProvider } from "@/lib/stream-providers";
import SourceSelector from "@/components/media/SourceSelector";

export default function VideoPlayer({
  tmdbId,
  type,
  posterPath,
  title,
  episode,
  seasonLength,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const { logWatchStart } = useWatchHistory();
  const { providerId, setProviderId } = useStreamSource();

  // Build the embed URL synchronously from the registry — no fetch, no await —
  // so the whole play action stays inside the user-gesture call stack (friendlier
  // to iOS autoplay/gesture rules than awaiting an API round-trip first).
  const buildUrl = useCallback(
    (id: string) =>
      getProvider(id).buildUrl({
        type,
        tmdbId,
        season: episode?.season,
        episode: episode?.number,
      }),
    [type, tmdbId, episode?.season, episode?.number]
  );

  const handlePlay = () => {
    setStreamUrl(buildUrl(providerId));
    setIsPlaying(true);

    // Watch history + analytics are fire-and-forget; never gate playback on them.
    const numericTmdbId = Number(tmdbId);
    if (!Number.isNaN(numericTmdbId)) {
      logWatchStart({
        tmdbId: numericTmdbId,
        mediaType: type,
        title,
        posterPath: posterPath ?? null,
        backdropPath: posterPath ?? null,
        seasonNumber: episode?.season,
        episodeNumber: episode?.number,
      }).catch((error) =>
        console.error("Failed to log watch history:", error)
      );
    }

    trackEvent("video_play", {
      content_type: type,
      content_id: tmdbId,
      title: title,
      ...(episode && { season: episode.season, episode: episode.number }),
    });
  };

  // Switching source (or navigating episodes) while watching reloads instantly.
  useEffect(() => {
    if (isPlaying) setStreamUrl(buildUrl(providerId));
  }, [providerId, isPlaying, buildUrl]);

  const backdropUrl = posterPath
    ? `https://image.tmdb.org/t/p/original${posterPath}`
    : "/placeholder-poster.jpg";

  // episode navigation controls
  const EpisodeControls = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const navigateEpisode = (direction: "prev" | "next") => {
      if (type !== "series" || !episode) return;
      const newEpisode =
        direction === "next"
          ? episode.number + 1
          : Math.max(1, episode.number - 1);
      const params = new URLSearchParams(searchParams);
      params.set("episode", newEpisode.toString());
      router.push(`${pathname}?${params.toString()}`);
    };

    return type === "series" ? (
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigateEpisode("prev")}
          disabled={!episode || episode.number <= 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous Episode
        </Button>
        <Button
          variant="outline"
          onClick={() => navigateEpisode("next")}
          disabled={
            !episode ||
            (seasonLength !== undefined && episode.number >= seasonLength)
          }
        >
          Next Episode <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ) : null;
  };

  if (!isPlaying) {
    return (
      <div className="w-full pt-[56px] md:pt-0">
        <div
          className="relative w-full aspect-video cursor-pointer group"
          onClick={handlePlay}
        >
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover  brightness-50"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-800 p-3 sm:p-4 rounded-full transition-transform group-hover:scale-110">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return streamUrl ? (
    <div className="w-full pt-[56px] md:pt-0">
      <div className="relative w-full aspect-video">
        <iframe
          // Remounting on source/episode change forces a clean reload.
          key={`${providerId}-${episode?.season ?? 0}-${episode?.number ?? 0}`}
          src={streamUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
        />
      </div>
      <div className="px-4 md:px-0">
        <SourceSelector value={providerId} onChange={setProviderId} />
      </div>
      <EpisodeControls />
    </div>
  ) : null;
}
