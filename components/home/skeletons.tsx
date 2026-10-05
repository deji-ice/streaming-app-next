import { PosterCardSkeleton, RailSkeleton, SkeletonBlock } from "@/components/ds/skeletons";
import { cn } from "@/lib/utils";

import { GENRE_GRID_CLASS, GENRE_SECTION_CLASS, HOME_PAGE_CLASS } from "./classes";

/*
 * Loading skeletons for the home page. They mirror the geometry of the real
 * sections (same wrappers, aspect ratios, line boxes), so nothing shifts when
 * the content arrives. Server-safe: no hooks.
 */

/** A text line inside a fixed line box. */
function Line({ box = "h-5", className }: { box?: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center", box)}>
      <SkeletonBlock className={cn("h-3 rounded-full", className)} />
    </span>
  );
}

/**
 * Spotlight: backdrop on top, then text, then the thumbnail switcher on small
 * screens. From lg the text and the switcher sit left of the 16:9 backdrop.
 */
export function SpotlightSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto max-w-[1440px] px-gutter pb-4 pt-4 md:pb-6 md:pt-8"
    >
      <span className="sr-only">Loading</span>
      <div
        aria-hidden="true"
        className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-10 lg:gap-y-6"
      >
        <SkeletonBlock className="aspect-video w-full lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center" />

        <div className="min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-end">
          <Line box="h-4" className="w-32" />
          <div className="mt-3 flex h-28 flex-col justify-center gap-2 lg:h-32">
            <SkeletonBlock className="h-10 w-4/5 rounded-full md:h-14" />
            <SkeletonBlock className="h-10 w-3/5 rounded-full md:h-14" />
          </div>
          <Line box="mt-3 h-5" className="w-2/3" />
          <div className="mt-3 max-w-[52ch]">
            <Line box="h-[25.6px]" className="w-full" />
            <Line box="h-[25.6px]" className="w-11/12" />
            <Line box="h-[25.6px]" className="w-3/4" />
          </div>
          <div className="flex gap-3 pt-5">
            <SkeletonBlock className="h-11 w-36 rounded-full" />
            <SkeletonBlock className="h-11 w-28 rounded-full" />
          </div>
        </div>

        <div className="-mx-1 flex min-w-0 gap-2 overflow-hidden px-1 py-1 lg:col-span-5 lg:col-start-1 lg:row-start-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock key={index} className="aspect-video w-24 shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The Continue watching rail skeleton. It only shows when the inline head
 * script flagged local history (html[data-history="1"]), because only then does
 * the .history-slot wrapper reserve the height; other visitors see nothing.
 */
export function HistoryRailSkeleton() {
  return (
    <div className="hidden [html[data-history='1']_&]:block">
      <RailSkeleton variant="landscape" titleWidth="w-44 md:w-56" />
    </div>
  );
}

/** Top 10 rail: a numeral placeholder beside each poster, same rail rhythm as Rail. */
export function RankedRailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="py-5 md:py-7">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true">
        <div className="flex min-h-11 items-center px-gutter">
          <SkeletonBlock className="h-[22px] w-56 rounded-full md:h-[26px] md:w-72" />
        </div>
        <div className="-mb-1 mt-2 flex gap-4 overflow-hidden px-gutter py-1 md:gap-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex shrink-0 items-end">
              <SkeletonBlock className="mb-12 mr-1 h-16 w-10 md:mr-2 md:h-[90px] md:w-14" />
              <PosterCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Browse by genre: header row and 8 tiles (16:9 frame, one 20px name line below). */
export function GenreGridSkeleton() {
  return (
    <div role="status" aria-busy="true" className={GENRE_SECTION_CLASS}>
      <span className="sr-only">Loading</span>
      <div aria-hidden="true">
        <div className="flex min-h-11 items-center">
          <SkeletonBlock className="h-[22px] w-44 rounded-full md:h-[26px] md:w-56" />
        </div>
        <div className={GENRE_GRID_CLASS}>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index}>
              <SkeletonBlock className="aspect-video w-full" />
              <Line box="mt-2 h-5" className="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** app/loading.tsx: the home page top to bottom. */
export function HomeSkeleton() {
  return (
    <div className={HOME_PAGE_CLASS}>
      <SpotlightSkeleton />
      <div className="history-slot">
        <HistoryRailSkeleton />
      </div>
      <RankedRailSkeleton />
      <RailSkeleton variant="logo" titleWidth="w-44 md:w-56" />
      <RailSkeleton variant="poster" titleWidth="w-40 md:w-56" />
      <RailSkeleton variant="poster" titleWidth="w-40 md:w-56" />
      <RailSkeleton variant="landscape" titleWidth="w-40 md:w-56" />
      <GenreGridSkeleton />
      <RailSkeleton variant="poster" titleWidth="w-48 md:w-64" />
    </div>
  );
}
