"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { fadeIn } from "@/lib/gsap-config";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play,
  Star,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Heart,
} from "lucide-react";
import { type Movie, type MediaType, SeriesDetails } from "@/types";

import { toast } from "sonner";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useFavorites } from "@/hooks/useFavorites";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

interface MediaCardProps {
  item: Movie | SeriesDetails;
  type: MediaType;
}

export default function MediaCard({ item, type }: MediaCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const { isAuthenticated } = useUser();
  const { openAuthModal } = useAuthModal();

  const title = "title" in item ? item.title : item.name;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${item.id}`;
  const imageUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : "/placeholder-poster.jpg";
  const year = new Date(
    "release_date" in item
      ? item.release_date
      : (item.last_episode_to_air?.air_date ?? item.first_air_date),
  ).getFullYear();

  const releaseDate =
    "release_date" in item
      ? item.release_date
      : (item.last_episode_to_air?.air_date ?? item.first_air_date);

  const isBookmarked = isInWatchlist(item.id, type);
  const mediaTypeForFavorite =
    type === "series" ? ("series" as const) : ("movie" as const);
  const isFavorited = isInFavorites(item.id, mediaTypeForFavorite);

  // GSAP fade-in animation on mount (compositor-only: opacity + translateY)
  useGSAP(() => {
    if (cardRef.current) {
      fadeIn(cardRef.current, { y: 20, duration: 0.4 });
    }

    // Cleanup: kill all tweens targeting this card on unmount
    return () => {
      if (cardRef.current) {
        gsap.killTweensOf(cardRef.current);
      }
    };
  }, []);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default to avoid double navigation
    router.push(`/${type}/${slug}`);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      toast.error("Sign in to save to your watchlist.");
      return;
    }
    try {
      if (isBookmarked) {
        await removeFromWatchlist(item.id, type);
        toast.success("Removed from Watchlist", {
          description: `${title} has been removed from your watchlist`,
          duration: 2500,
        });
      } else {
        await addToWatchlist({
          tmdbId: item.id,
          mediaType: type,
          title,
          posterPath: item.poster_path,
          backdropPath: item.backdrop_path,
          voteAverage: item.vote_average ?? null,
          releaseDate: releaseDate ?? null,
        });
        toast.success("Added to Watchlist", {
          description: `${title} has been added to your watchlist`,
          duration: 2500,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update watchlist";
      toast.error(message);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      toast.error("Sign in to save favorites.");
      return;
    }
    try {
      const favType =
        type === "series" ? ("series" as const) : ("movie" as const);
      if (isFavorited) {
        await removeFromFavorites(item.id, favType);
        toast.success("Removed from Favorites", {
          description: `${title} has been removed from your favorites`,
          duration: 2500,
        });
      } else {
        await addToFavorites(item.id, favType, title, item.poster_path);
        toast.success("Added to Favorites", {
          description: `${title} has been added to your favorites`,
          duration: 2500,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update favorites";
      toast.error(message);
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative w-full bg-card rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <Link href={`/${type}/${slug}`}>
        <div className="relative w-full aspect-[2/3]" ref={imageRef}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />

          {/* Play affordance — always on mobile, hover-reveal on desktop */}
          <button
            type="button"
            aria-label={`Play ${title}`}
            onClick={handlePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100"
          >
            <Play className="h-5 w-5 fill-current" />
          </button>

          {/* Bookmark — ~40px tap target */}
          <button
            type="button"
            aria-label={
              isBookmarked
                ? `Remove ${title} from watchlist`
                : `Add ${title} to watchlist`
            }
            aria-pressed={isBookmarked}
            onClick={handleBookmark}
            className="absolute z-30 top-2 left-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-colors hover:text-primary"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>

          {/* Favorite — ~40px tap target */}
          <button
            type="button"
            aria-label={
              isFavorited
                ? `Remove ${title} from favorites`
                : `Add ${title} to favorites`
            }
            aria-pressed={isFavorited}
            onClick={handleFavorite}
            className="absolute z-30 top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-colors hover:text-red-500"
          >
            <Heart
              className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>

          {/* Info band (flat overlay, no gradient) */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/70">
            <h3 className="font-montserrat font-semibold text-white truncate mb-1.5">
              {title}
            </h3>
            <div className="flex items-center justify-between gap-3 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{item.vote_average?.toFixed(1) ?? "N/A"}</span>
              </div>
              <div className="flex gap-2">
                {type === "series" && "last_episode_to_air" in item && (
                  <p>
                    S{item.last_episode_to_air?.season_number || 1} EP
                    {item.last_episode_to_air?.episode_number || 1}
                  </p>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{year}</span>
                </div>
              </div>
              {type === "movie" &&
                "runtime" in item &&
                typeof item.runtime === "number" && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
