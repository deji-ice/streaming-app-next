"use client";

import {
  BookmarkSimpleIcon,
  ClockCounterClockwiseIcon,
  HeartIcon,
  SparkleIcon,
  SquaresFourIcon,
  UserIcon,
  type Icon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { EmptyState } from "@/components/ds/empty-state";
import { LandscapeCard } from "@/components/ds/landscape-card";
import { PosterCard } from "@/components/ds/poster-card";
import { Rail } from "@/components/ds/rail";
import { Button } from "@/components/ui/button";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatRelativeTime } from "@/lib/format";
import { mediaHref } from "@/lib/slug";
import { useUserStore } from "@/lib/store";
import { useFavoriteItems, useWatchlistItems } from "@/lib/user-data";

import { AuthGate } from "./auth-gate";
import { historyHref, historySubtitle, typeLabel } from "./history-utils";
import { LibraryCounts, type CountItem } from "./library-counts";
import { AccountPage } from "./page-shell";
import { DashboardSkeleton } from "./skeletons";

/** Titles shown in each dashboard rail; "See all" opens the full page. */
const PREVIEW_COUNT = 12;

const QUICK_LINKS: ReadonlyArray<{ href: string; label: string; icon: Icon }> = [
  { href: "/watchlist", label: "Watchlist", icon: BookmarkSimpleIcon },
  { href: "/favorites", label: "Favorites", icon: HeartIcon },
  { href: "/history", label: "History", icon: ClockCounterClockwiseIcon },
  { href: "/recommendations", label: "Recommendations", icon: SparkleIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

function DashboardContent() {
  const { profile, stats } = useUserProfile();
  const storeName = useUserStore((state) => state.user?.name);
  const watchlist = useWatchlistItems();
  const favorites = useFavoriteItems();
  const history = useWatchHistory();

  if (watchlist.isLoading || favorites.isLoading || history.isLoading) return <DashboardSkeleton />;

  const displayName = profile?.full_name?.trim() || profile?.username?.trim() || storeName?.trim() || "";
  const firstName = displayName.split(/\s+/)[0];

  const recent = history.items.slice(0, PREVIEW_COUNT);
  const saved = watchlist.items.slice(0, PREVIEW_COUNT);
  const loved = favorites.items.slice(0, PREVIEW_COUNT);
  const nothingYet = recent.length === 0 && saved.length === 0 && loved.length === 0;

  // Real numbers only. The two "watched" counts come from the account history.
  const counts: CountItem[] = [
    { label: "Watchlist", value: watchlist.items.length },
    { label: "Favorites", value: favorites.items.length },
    { label: "Movies watched", value: stats?.totalMoviesWatched },
    { label: "Series watched", value: stats?.totalSeriesWatched },
  ];

  return (
    <>
      <AccountPage
        title="Dashboard"
        description={firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
        className="pb-0"
      >
        <LibraryCounts className="mt-8" items={counts} />
        {nothingYet ? (
          <EmptyState
            className="mt-10"
            icon={<SquaresFourIcon weight="duotone" />}
            title="Nothing here yet"
            body="Watch something, or save titles to your watchlist or favorites, and they will show up on this page."
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
        ) : null}
      </AccountPage>

      <div className="mt-4 md:mt-6">
        {recent.length > 0 ? (
          <Rail title="Continue watching" href="/history" variant="landscape">
            {recent.map((item) => (
              <LandscapeCard
                key={item.id}
                href={historyHref(item)}
                title={item.title}
                imagePath={item.backdrop_path ?? item.poster_path}
                subtitle={historySubtitle(item)}
                meta={formatRelativeTime(item.watched_at)}
              />
            ))}
          </Rail>
        ) : null}

        {saved.length > 0 ? (
          <Rail title="Watchlist" href="/watchlist" variant="poster">
            {saved.map((item) => (
              <PosterCard
                key={item.id}
                href={mediaHref(item.media_type, item.tmdb_id, item.title)}
                title={item.title}
                posterPath={item.poster_path}
                year={item.release_date}
                rating={item.vote_average}
                subtitle={typeLabel(item.media_type)}
              />
            ))}
          </Rail>
        ) : null}

        {loved.length > 0 ? (
          <Rail title="Favorites" href="/favorites" variant="poster">
            {loved.map((item) => (
              <PosterCard
                key={item.id}
                href={mediaHref(item.media_type, item.tmdb_id, item.title)}
                title={item.title}
                posterPath={item.poster_path}
                rating={item.vote_average}
                subtitle={typeLabel(item.media_type)}
              />
            ))}
          </Rail>
        ) : null}
      </div>

      <nav aria-label="Account pages" className="mx-auto flex w-full max-w-[1440px] flex-wrap gap-2 px-gutter pb-16 pt-4">
        {QUICK_LINKS.map(({ href, label, icon: LinkIcon }) => (
          <Button key={href} asChild variant="secondary">
            <Link href={href}>
              <LinkIcon aria-hidden="true" />
              {label}
            </Link>
          </Button>
        ))}
      </nav>
    </>
  );
}

export function DashboardView() {
  return (
    <AuthGate title="Dashboard" what="your dashboard" fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </AuthGate>
  );
}
