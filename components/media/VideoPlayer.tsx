"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { CaretLeftIcon, CaretRightIcon, PlayIcon } from "@phosphor-icons/react";
import { VideoPlayerProps } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useStreamSource } from "@/hooks/useStreamSource";
import { getProvider } from "@/lib/stream-providers";
import SourceSelector from "@/components/media/SourceSelector";
import { IMAGE_SIZES, tmdbImage } from "@/lib/tmdb-image";
import { cn } from "@/lib/utils";
import { playerHeight } from "@/components/details/layout-classes";

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

  // The TMDB image loader picks a sane size (w1280 at most) from `sizes`.
  const posterSrc = tmdbImage(posterPath);

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
      <div className="flex flex-wrap justify-center gap-3 px-gutter pb-4">
        <Button
          variant="secondary"
          onClick={() => navigateEpisode("prev")}
          disabled={!episode || episode.number <= 1}
        >
          <CaretLeftIcon aria-hidden="true" /> Previous Episode
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigateEpisode("next")}
          disabled={
            !episode ||
            (seasonLength !== undefined && episode.number >= seasonLength)
          }
        >
          Next Episode <CaretRightIcon aria-hidden="true" />
        </Button>
      </div>
    ) : null;
  };

  if (!isPlaying) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Play ${title}`}
          className={cn(
            "group relative block w-full overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            playerHeight,
          )}
        >
          {posterSrc ? (
            <Image
              src={posterSrc}
              alt=""
              fill
              sizes={IMAGE_SIZES.player}
              className="object-cover"
              priority
            />
          ) : null}
          <span aria-hidden="true" className="absolute inset-0 bg-black/40" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-[72px] items-center justify-center rounded-full bg-primary text-primary-foreground transition-[transform,background-color] duration-150 ease-out group-hover:bg-primary-hover group-active:scale-[0.98]">
              <PlayIcon weight="fill" size={32} aria-hidden="true" />
              <span className="sr-only">Play {title}</span>
            </span>
          </span>
        </button>
      </div>
    );
  }

  return streamUrl ? (
    <div className="w-full">
      <div className={cn("relative w-full", playerHeight)}>
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
      {/* The player band is full-bleed, so the controls under it use the page gutter. */}
      <div className="px-gutter pb-4 pt-1">
        <SourceSelector value={providerId} onChange={setProviderId} />
      </div>
      <EpisodeControls />
    </div>
  ) : null;
}
