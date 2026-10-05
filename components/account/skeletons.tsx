import type { ReactNode } from "react";

import { railWidths } from "@/components/ds/classes";
import { SkeletonBlock } from "@/components/ds/skeletons";
import { cn } from "@/lib/utils";

import { HISTORY_GRID, POSTER_GRID } from "./classes";
import { LibraryCounts } from "./library-counts";
import { AccountPage } from "./page-shell";

/*
 * Loading states for the signed-in pages. They are used twice: as each
 * route's loading.tsx and as the fallback inside the client views while the
 * session and the data load, so the page does not move between the two.
 * They reuse the real page shell, the real h1/h2 text and the real counts
 * component, and match the cards' line heights (20/18px text, 44/36px action).
 */

function Status({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Loading</span>
      {children}
    </div>
  );
}

/** A text line inside a fixed line box, like the real card text. */
function Line({ box = "h-5", className }: { box?: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center", box)}>
      <SkeletonBlock className={cn("h-3.5 rounded-full", className)} />
    </span>
  );
}

function DescriptionSkeleton() {
  return <SkeletonBlock className="h-3.5 w-40 rounded-full" />;
}

/** Poster card with title, "Movie/Series" and year/rating lines, plus the Remove button's space. */
function PosterEntrySkeleton({ withAction }: { withAction: boolean }) {
  return (
    <div aria-hidden="true">
      <SkeletonBlock className="aspect-[2/3] w-full" />
      <span className="mt-2 block">
        <Line className="w-4/5" />
        <Line className="w-1/4" />
        <Line className="w-2/5" />
      </span>
      {withAction ? <div className="h-11 md:h-9" /> : null}
    </div>
  );
}

function HistoryEntrySkeleton() {
  return (
    <div aria-hidden="true">
      <SkeletonBlock className="aspect-video w-full" />
      <span className="mt-2 block">
        <Line className="w-3/4" />
        <Line box="h-[18px]" className="w-1/4" />
        <Line box="h-[18px]" className="w-2/5" />
      </span>
      <div className="h-11 md:h-9" />
    </div>
  );
}

/** Watchlist and favorites. */
export function LibrarySkeleton({ title, count = 14 }: { title: string; count?: number }) {
  return (
    <AccountPage title={title} description={<DescriptionSkeleton />}>
      <Status className="mt-8">
        <ul aria-hidden="true" className={POSTER_GRID}>
          {Array.from({ length: count }, (_, index) => (
            <li key={index}>
              <PosterEntrySkeleton withAction />
            </li>
          ))}
        </ul>
      </Status>
    </AccountPage>
  );
}

export function HistorySkeleton({ count = 8 }: { count?: number }) {
  return (
    <AccountPage
      title="History"
      description={<DescriptionSkeleton />}
      actions={<SkeletonBlock className="h-11 w-36 rounded-full" />}
    >
      <Status className="mt-8">
        <ul aria-hidden="true" className={HISTORY_GRID}>
          {Array.from({ length: count }, (_, index) => (
            <li key={index}>
              <HistoryEntrySkeleton />
            </li>
          ))}
        </ul>
      </Status>
    </AccountPage>
  );
}

export function RecommendationsSkeleton({ count = 14 }: { count?: number }) {
  return (
    <AccountPage title="Recommended for you" description={<DescriptionSkeleton />}>
      <Status className="mt-8">
        <ul aria-hidden="true" className={POSTER_GRID}>
          {Array.from({ length: count }, (_, index) => (
            <li key={index}>
              <PosterEntrySkeleton withAction={false} />
            </li>
          ))}
        </ul>
      </Status>
    </AccountPage>
  );
}

/** Rail geometry: py-5 md:py-7, a 44px header row, then the cards (see components/ds/rail). */
function RailPlaceholder({ variant }: { variant: "landscape" | "poster" }) {
  return (
    <div aria-hidden="true" className="py-5 md:py-7">
      <div className="flex min-h-11 items-center px-gutter">
        <SkeletonBlock className="h-[22px] w-40 rounded-full md:h-[26px] md:w-56" />
      </div>
      <div className="-mb-1 mt-2 flex gap-3 overflow-hidden px-gutter py-1 md:gap-4">
        {variant === "landscape"
          ? Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={cn("shrink-0", railWidths.landscape)}>
                <SkeletonBlock className="aspect-video w-full" />
                <span className="mt-2 block">
                  <Line className="w-3/4" />
                  <Line box="h-[18px]" className="w-1/4" />
                  <Line box="h-[18px]" className="w-2/5" />
                </span>
              </div>
            ))
          : Array.from({ length: 8 }, (_, index) => (
              <div key={index} className={cn("shrink-0", railWidths.poster)}>
                <SkeletonBlock className="aspect-[2/3] w-full" />
                <span className="mt-2 block">
                  <Line className="w-4/5" />
                  <Line className="w-1/4" />
                  <Line className="w-2/5" />
                </span>
              </div>
            ))}
      </div>
    </div>
  );
}

export const DASHBOARD_COUNT_LABELS = ["Watchlist", "Favorites", "Movies watched", "Series watched"] as const;

export function DashboardSkeleton() {
  return (
    <Status>
      <AccountPage title="Dashboard" description={<DescriptionSkeleton />} className="pb-0">
        <LibraryCounts className="mt-8" items={DASHBOARD_COUNT_LABELS.map((label) => ({ label, value: null }))} />
      </AccountPage>
      <RailPlaceholder variant="landscape" />
      <RailPlaceholder variant="poster" />
      <RailPlaceholder variant="poster" />
      <div aria-hidden="true" className="mx-auto flex w-full max-w-[1440px] flex-wrap gap-2 px-gutter pb-16 pt-4">
        {["w-32", "w-32", "w-28", "w-44", "w-28"].map((width, index) => (
          <SkeletonBlock key={index} className={cn("h-11 rounded-full", width)} />
        ))}
      </div>
    </Status>
  );
}

export const PROFILE_COUNT_LABELS = ["Movies watched", "Series watched", "Watchlist", "Favorites"] as const;

export function ProfileSkeleton() {
  return (
    <AccountPage title="Profile" description="Your account details and activity.">
      <Status className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,640px)_minmax(0,360px)] lg:gap-14">
        <section>
          <h2 className="type-section text-foreground">Account</h2>
          <div aria-hidden="true" className="mt-4 rounded-panel border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-4 sm:gap-5">
              <SkeletonBlock className="size-20 shrink-0 rounded-full sm:size-24" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-6 w-48 max-w-full rounded-full" />
                <SkeletonBlock className="mt-3 h-3.5 w-56 max-w-full rounded-full" />
              </div>
            </div>
            <SkeletonBlock className="mt-6 h-3.5 w-40 rounded-full" />
            <SkeletonBlock className="mt-6 h-11 w-36 rounded-full" />
          </div>
        </section>
        <section>
          <h2 className="type-section text-foreground">Activity</h2>
          <LibraryCounts
            layout="list"
            className="mt-4"
            items={PROFILE_COUNT_LABELS.map((label) => ({ label, value: null }))}
          />
        </section>
      </Status>
    </AccountPage>
  );
}
