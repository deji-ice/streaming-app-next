"use client";

import { BookmarkSimpleIcon, HeartIcon, WarningCircleIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ds/empty-state";
import { PosterCard } from "@/components/ds/poster-card";
import { Button } from "@/components/ui/button";
import { formatCompact } from "@/lib/format";
import { mediaHref } from "@/lib/slug";
import {
  useFavoriteActions,
  useFavoriteItems,
  useWatchlistActions,
  useWatchlistItems,
  type Favorite,
  type WatchlistItem,
} from "@/lib/user-data";
import { cn } from "@/lib/utils";

import { AuthGate } from "./auth-gate";
import { POSTER_GRID } from "./classes";
import { typeLabel } from "./history-utils";
import { AccountPage } from "./page-shell";
import { RemoveButton } from "./remove-button";
import { LibrarySkeleton } from "./skeletons";
import { useRemovalFocus } from "./use-removal-focus";

/** What the grid needs from a watchlist or favorites row. */
interface LibraryEntry {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  /** A date string (PosterCard reduces it to the year) or null. */
  releaseDate: string | null;
  rating: number | null;
}

interface LibraryPageProps {
  title: string;
  /** Lower-case name of the list, for labels: "watchlist". */
  list: string;
  entries: LibraryEntry[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyBody: string;
  onRemove: (entry: LibraryEntry) => Promise<void>;
}

function LibraryPage({
  title,
  list,
  entries,
  isLoading,
  error,
  onRetry,
  emptyIcon,
  emptyTitle,
  emptyBody,
  onRemove,
}: LibraryPageProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const focus = useRemovalFocus(listRef, entries.length);

  const handleRemove = useCallback(
    async (entry: LibraryEntry, index: number) => {
      focus.expect(index);
      try {
        await onRemove(entry);
      } finally {
        focus.cancel();
      }
    },
    [focus, onRemove],
  );

  if (isLoading) return <LibrarySkeleton title={title} />;

  if (error) {
    return (
      <AccountPage title={title}>
        <EmptyState
          className="mt-8"
          icon={<WarningCircleIcon weight="duotone" />}
          title={`Could not load your ${list}`}
          body="Check your connection and try again."
          action={
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      </AccountPage>
    );
  }

  const count = entries.length;

  return (
    <AccountPage title={title} description={`${formatCompact(count)} ${count === 1 ? "title" : "titles"}`}>
      {count === 0 ? (
        <EmptyState
          className="mt-8"
          icon={emptyIcon}
          title={emptyTitle}
          body={emptyBody}
          action={
            <>
              <Button asChild>
                <Link href="/movie">Browse movies</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/series">Browse series</Link>
              </Button>
            </>
          }
        />
      ) : (
        <ul ref={listRef} className={cn("mt-8", POSTER_GRID)}>
          {entries.map((entry, index) => (
            <li key={entry.id} className="min-w-0">
              <PosterCard
                width="fill"
                href={mediaHref(entry.mediaType, entry.tmdbId, entry.title)}
                title={entry.title}
                posterPath={entry.posterPath}
                year={entry.releaseDate}
                rating={entry.rating}
                subtitle={typeLabel(entry.mediaType)}
              />
              <RemoveButton title={entry.title} from={list} onClick={() => handleRemove(entry, index)} />
            </li>
          ))}
        </ul>
      )}
    </AccountPage>
  );
}

/* -------------------------------------------------------------------------- */
/* Watchlist                                                                  */
/* -------------------------------------------------------------------------- */

const watchlistEntry = (item: WatchlistItem): LibraryEntry => ({
  id: item.id,
  tmdbId: item.tmdb_id,
  mediaType: item.media_type,
  title: item.title,
  posterPath: item.poster_path,
  releaseDate: item.release_date,
  rating: item.vote_average,
});

function WatchlistContent() {
  const { items, isLoading, error, refetch } = useWatchlistItems();
  const { remove, add } = useWatchlistActions();
  const entries = useMemo(() => items.map(watchlistEntry), [items]);

  const onRemove = useCallback(
    async (entry: LibraryEntry) => {
      const removed = items.find((item) => item.id === entry.id);
      try {
        await remove(entry.tmdbId, entry.mediaType);
      } catch {
        toast.error(`Could not remove ${entry.title}. Try again.`);
        return;
      }
      toast.success(`Removed ${entry.title} from your watchlist`, {
        action: removed
          ? {
              label: "Undo",
              onClick: () => {
                add({
                  tmdbId: removed.tmdb_id,
                  mediaType: removed.media_type,
                  title: removed.title,
                  posterPath: removed.poster_path,
                  backdropPath: removed.backdrop_path,
                  voteAverage: removed.vote_average,
                  releaseDate: removed.release_date,
                }).catch(() => toast.error(`Could not add ${removed.title} back.`));
              },
            }
          : undefined,
      });
    },
    [items, remove, add],
  );

  return (
    <LibraryPage
      title="Watchlist"
      list="watchlist"
      entries={entries}
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      emptyIcon={<BookmarkSimpleIcon weight="duotone" />}
      emptyTitle="Your watchlist is empty"
      emptyBody="Save movies and series from their pages to watch them later."
      onRemove={onRemove}
    />
  );
}

export function WatchlistView() {
  return (
    <AuthGate title="Watchlist" what="your watchlist" fallback={<LibrarySkeleton title="Watchlist" />}>
      <WatchlistContent />
    </AuthGate>
  );
}

/* -------------------------------------------------------------------------- */
/* Favorites                                                                  */
/* -------------------------------------------------------------------------- */

const favoriteEntry = (item: Favorite): LibraryEntry => ({
  id: item.id,
  tmdbId: item.tmdb_id,
  mediaType: item.media_type,
  title: item.title,
  posterPath: item.poster_path,
  releaseDate: null,
  rating: item.vote_average,
});

function FavoritesContent() {
  const { items, isLoading, error, refetch } = useFavoriteItems();
  const { remove, add } = useFavoriteActions();
  const entries = useMemo(() => items.map(favoriteEntry), [items]);

  const onRemove = useCallback(
    async (entry: LibraryEntry) => {
      const removed = items.find((item) => item.id === entry.id);
      try {
        await remove(entry.tmdbId, entry.mediaType);
      } catch {
        toast.error(`Could not remove ${entry.title}. Try again.`);
        return;
      }
      toast.success(`Removed ${entry.title} from your favorites`, {
        action: removed
          ? {
              label: "Undo",
              onClick: () => {
                add({
                  tmdbId: removed.tmdb_id,
                  mediaType: removed.media_type,
                  title: removed.title,
                  posterPath: removed.poster_path,
                  backdropPath: removed.backdrop_path,
                  voteAverage: removed.vote_average,
                }).catch(() => toast.error(`Could not add ${removed.title} back.`));
              },
            }
          : undefined,
      });
    },
    [items, remove, add],
  );

  return (
    <LibraryPage
      title="Favorites"
      list="favorites"
      entries={entries}
      isLoading={isLoading}
      error={error}
      onRetry={() => void refetch()}
      emptyIcon={<HeartIcon weight="duotone" />}
      emptyTitle="No favorites yet"
      emptyBody="Mark movies and series you love as favorites and they will show up here."
      onRemove={onRemove}
    />
  );
}

export function FavoritesView() {
  return (
    <AuthGate title="Favorites" what="your favorites" fallback={<LibrarySkeleton title="Favorites" />}>
      <FavoritesContent />
    </AuthGate>
  );
}
