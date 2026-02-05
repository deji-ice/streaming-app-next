"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { hoverLift, fadeIn } from "@/lib/gsap-config";
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

  // GSAP animations
  useGSAP(() => {
    if (cardRef.current) {
      // Fade in animation on mount
      fadeIn(cardRef.current, { y: 20, duration: 0.4 });

      // Setup hover lift effect
      const { onEnter, onLeave } = hoverLift(cardRef.current);

      cardRef.current.addEventListener("mouseenter", onEnter);
      cardRef.current.addEventListener("mouseleave", onLeave);

      return () => {
        cardRef.current?.removeEventListener("mouseenter", onEnter);
        cardRef.current?.removeEventListener("mouseleave", onLeave);
      };
    }
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
      className="group relative bg-card rounded-xl overflow-hidden w-fit"
    >
      <Link href={`/${type}/${slug}`} className=" ">
        <div className=" w-fit aspect-[2/3] relative" ref={imageRef}>
          <Image
            src={imageUrl}
            alt={title}
            height={300}
            width={200}
            className="object-cover transition-transform duration-500 
                     group-hover:scale-105 md:group-hover:brightness-75"
          />

          <div
            className="absolute inset-0 bg-gradient-to-t 
                        from-black/20 via-black/10 to-transparent"
          />

          <button
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                 md:opacity-0 md:group-hover:opacity-100 
                 transition-opacity duration-500 "
            onClick={handlePlay}
          >
            <Play className="w-4 h-4" />
          </button>

          {/* Bookmark button */}
          <button
            className={`absolute z-30 top-2 left-2 text-white hover:text-primary 
                     transition-colors duration-300 ${
                       isBookmarked ? "text-primary" : ""
                     }`}
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Favorite button */}
          <button
            className={`absolute z-30 top-2 right-2 text-white hover:text-red-500 
                     transition-colors duration-300 ${
                       isFavorited ? "text-red-500" : ""
                     }`}
            onClick={handleFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500" : ""}`} />
          </button>

          {/* Always visible info section on mobile, hover on desktop */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 
                       bg-gradient-to-t from-black to-transparent"
          >
            <h3
              className="font-montserrat font-semibold text-white 
                        truncate mb-2"
            >
              {title}
            </h3>
            <div className="flex items-center justify-between gap-3 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{item.vote_average.toFixed(1)}</span>
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
