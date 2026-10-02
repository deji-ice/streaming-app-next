"use client";

import { BookmarkSimpleIcon, HeartIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useUser";
import {
  useFavoriteActions,
  useIsFavorite,
  useIsInWatchlist,
  useWatchlistActions,
} from "@/lib/user-data";

/*
 * Action buttons of a detail page. Each is a small client leaf: the page is a
 * Server Component and renders these once (not once per card). Watchlist and
 * favorites read the shared cache from lib/user-data, so the saved state is
 * correct as soon as the account lists have loaded.
 */

export interface SaveTarget {
  tmdbId: number;
  /** "tv" for series. */
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  /** TMDB vote_average, null when there are no votes. */
  voteAverage: number | null;
  /** movie release date or series first air date (YYYY-MM-DD). */
  releaseDate: string | null;
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function WatchlistToggle({ target }: { target: SaveTarget }) {
  const status = useAuthStatus();
  const { openAuthModal } = useAuthModal();
  const saved = useIsInWatchlist(target.tmdbId, target.mediaType);
  const { toggle } = useWatchlistActions();

  const onClick = async () => {
    // The session is still being restored: do nothing rather than show the sign-in
    // dialog to someone who is already signed in.
    if (status === "loading") return;
    if (status === "unauthenticated") {
      openAuthModal();
      toast("Sign in to save to your watchlist.");
      return;
    }
    try {
      const nowSaved = await toggle(target);
      toast.success(nowSaved ? "Added to watchlist" : "Removed from watchlist", {
        description: target.title,
        duration: 2500,
      });
    } catch (error) {
      toast.error(errorText(error, "Could not update your watchlist."));
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Save to watchlist"
      aria-pressed={saved}
      title={saved ? "Remove from watchlist" : "Add to watchlist"}
      onClick={onClick}
      className={saved ? "text-primary" : undefined}
    >
      <BookmarkSimpleIcon weight={saved ? "fill" : "regular"} aria-hidden="true" />
    </Button>
  );
}

export function FavoriteToggle({ target }: { target: SaveTarget }) {
  const status = useAuthStatus();
  const { openAuthModal } = useAuthModal();
  const saved = useIsFavorite(target.tmdbId, target.mediaType);
  const { toggle } = useFavoriteActions();

  const onClick = async () => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      openAuthModal();
      toast("Sign in to save favorites.");
      return;
    }
    try {
      const nowSaved = await toggle({
        tmdbId: target.tmdbId,
        mediaType: target.mediaType,
        title: target.title,
        posterPath: target.posterPath,
        backdropPath: target.backdropPath,
        voteAverage: target.voteAverage,
      });
      toast.success(nowSaved ? "Added to favorites" : "Removed from favorites", {
        description: target.title,
        duration: 2500,
      });
    } catch (error) {
      toast.error(errorText(error, "Could not update your favorites."));
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Add to favorites"
      aria-pressed={saved}
      title={saved ? "Remove from favorites" : "Add to favorites"}
      onClick={onClick}
      className={saved ? "text-primary" : undefined}
    >
      <HeartIcon weight={saved ? "fill" : "regular"} aria-hidden="true" />
    </Button>
  );
}

/** Web Share API where the browser has it, otherwise copies the page link and says so. */
export function ShareButton({ title }: { title: string }) {
  const onClick = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // The person closed the share sheet: nothing to report.
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Any other failure falls through to copying the link.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={`Share ${title}`}
      title="Share"
      onClick={onClick}
    >
      <ShareNetworkIcon aria-hidden="true" />
    </Button>
  );
}
