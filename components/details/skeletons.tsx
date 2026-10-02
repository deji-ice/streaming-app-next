import { railWidths } from "@/components/ds/classes";
import { PosterCardSkeleton } from "@/components/ds/skeletons";
import { cn } from "@/lib/utils";

import { blockGap, bodyGrid, headerGrid, pageWrapper, playerBand, playerFrame, playerHeight } from "./layout-classes";

/*
 * Loading skeletons for the movie and series detail pages. They are built from
 * the same layout constants as the real components (layout-classes.ts), so the
 * grids, aspect ratios, widths and text line boxes match and nothing shifts
 * when the content arrives. Server-safe: no hooks, no data access.
 */

/**
 * Pulsing bg-muted block. The radius is always explicit: media radius unless
 * the caller passes a rounded-* class. (tailwind-merge does not know
 * rounded-media, so a default rounded-media next to rounded-full would win in
 * the stylesheet and turn pills and circles into 10px corners.)
 */
function Block({ className }: { className?: string }) {
  const radius = className?.includes("rounded-") ? "" : "rounded-media";
  return <span aria-hidden="true" className={cn("block animate-skeleton bg-muted", radius, className)} />;
}

/** A text line bar inside a fixed line box, so the skeleton keeps the real line height. */
function Line({ box = "h-5", className }: { box?: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center", box)}>
      <Block className={cn("h-3 rounded-full", className)} />
    </span>
  );
}

function PlayerBandSkeleton() {
  return (
    <div className={playerBand}>
      <div className={playerFrame}>
        <Block className={cn("w-full rounded-none", playerHeight)} />
      </div>
    </div>
  );
}

/**
 * Episodes rail (mirrors EpisodesRail: Rail geometry, season pills, 16:9
 * cards with two title lines, a meta line and two overview lines).
 */
export function EpisodesRailSkeleton({ withPills = true, announce = true }: { withPills?: boolean; announce?: boolean }) {
  return (
    <div role={announce ? "status" : undefined} aria-busy={announce ? "true" : undefined} className="py-5 md:py-7">
      {announce ? <span className="sr-only">Loading episodes</span> : null}
      <div aria-hidden="true">
        <div className="flex min-h-11 items-center px-gutter">
          <Block className="h-[22px] w-28 rounded-full md:h-[26px]" />
        </div>
        {withPills ? (
          <div className="mt-2 flex gap-2 overflow-hidden px-gutter py-1">
            {Array.from({ length: 4 }, (_, index) => (
              <Block key={index} className="h-11 w-[104px] shrink-0 rounded-full" />
            ))}
          </div>
        ) : null}
        <div className="-mb-1 mt-2 flex gap-3 overflow-hidden px-gutter py-1 md:gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="w-[75vw] shrink-0 sm:w-[280px] lg:w-80">
              <Block className="aspect-video w-full" />
              <div className="mt-2">
                <Line className="w-4/5" />
                <Line className="w-2/5" />
              </div>
              <div className="mt-0.5">
                <Line className="w-1/3" />
              </div>
              <div className="mt-1">
                <Line className="w-full" />
                <Line className="w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mirrors TitleHeader: poster, title, tagline, meta, rating and the actions row. */
function HeaderSkeleton() {
  return (
    <div className={headerGrid}>
      <Block className="aspect-[2/3] w-full self-start lg:row-span-2" />
      <div className="min-w-0">
        <Block className="h-9 w-3/4 rounded-full md:h-12" />
        <div className="mt-2">
          <Line box="h-6" className="w-1/2" />
        </div>
        <div className="mt-3">
          <Line box="h-5" className="w-2/3" />
        </div>
        <div className="mt-2">
          <Line box="h-5" className="w-28" />
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap gap-2 sm:gap-3 lg:col-span-1 lg:col-start-2">
        <Block className="h-11 w-[116px] rounded-full" />
        <Block className="size-11 rounded-full" />
        <Block className="size-11 rounded-full" />
        <Block className="size-11 rounded-full" />
      </div>
    </div>
  );
}

/** Heading and four rows in the same two-column grid as the real fun facts list. */
export function FunFactsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex h-[22px] items-center">
        <Block className="h-4 w-24 rounded-full" />
      </div>
      <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-3">
            <Block className="mt-0.5 size-5 rounded-full" />
            <div>
              <Line box="h-5" className="w-16" />
              <Line box="h-5" className="w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mirrors OverviewSection: overview text and fun facts, the details list on
 * the right, then the full-width credits row (streaming services, production).
 */
function BodySkeleton() {
  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <div className={bodyGrid}>
        <div className="min-w-0">
          <Block className="h-[22px] w-28 rounded-full md:h-[26px]" />
          <div className="mt-3 max-w-[65ch]">
            {["w-full", "w-full", "w-11/12", "w-full", "w-2/3"].map((width, index) => (
              <Line key={index} box="h-[26px]" className={width} />
            ))}
          </div>
          <div className="mt-8">
            <FunFactsSkeleton />
          </div>
        </div>
        <div className="min-w-0 border-t border-border pt-8 lg:border-t-0 lg:pt-0">
          <Block className="h-[22px] w-24 rounded-full md:h-[26px]" />
          <div className="mt-4 grid grid-cols-[116px_minmax(0,1fr)] gap-x-4 gap-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="contents">
                <Line box="h-5" className="w-16" />
                <Line box="h-5" className="w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-x-14 gap-y-8 border-t border-border pt-8">
        <div>
          <Line box="h-[22px]" className="w-28" />
          <Line box="h-5" className="w-36" />
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 3 }, (_, index) => (
              <span key={index} className="flex size-11 items-center justify-center">
                <Block className="size-10" />
              </span>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_320px]">
          <Line box="h-[22px]" className="w-24" />
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Block key={index} className="h-14 w-[172px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mirrors Rail geometry (py-5 md:py-7, 44px header row, full-bleed scroller with px-gutter). */
function RailBlockSkeleton({ variant }: { variant: "person" | "poster" }) {
  const person = variant === "person";
  return (
    <div className="py-5 md:py-7">
      <div className="flex min-h-11 items-center px-gutter">
        <Block className="h-[22px] w-24 rounded-full md:h-[26px]" />
      </div>
      <div
        className={cn(
          "-mb-1 mt-2 flex overflow-hidden px-gutter py-1",
          person ? "gap-2 md:gap-3" : "gap-3 md:gap-4",
        )}
      >
        {person
          ? Array.from({ length: 10 }, (_, index) => (
              <div key={index} aria-hidden="true" className={cn("flex shrink-0 flex-col items-center", railWidths.person)}>
                <Block className="size-20 rounded-full" />
                <span className="mt-2 flex w-full flex-col items-center">
                  <Line className="w-4/5" />
                  <Line box="mt-0.5 h-[18px]" className="w-3/5" />
                </span>
              </div>
            ))
          : Array.from({ length: 8 }, (_, index) => <PosterCardSkeleton key={index} />)}
      </div>
    </div>
  );
}

/**
 * Whole movie or series page: the player (series: with the episode panel from
 * lg), title header, episodes (series below lg, right after the header),
 * overview and details, and the cast and recommendation rails.
 */
export function DetailPageSkeleton({ kind }: { kind: "movie" | "series" }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading</span>
      <PlayerBandSkeleton />
      {kind === "series" ? <EpisodesRailSkeleton announce={false} /> : null}
      <div className={cn(pageWrapper, "flex flex-col pt-6 md:pt-10", blockGap)}>
        <HeaderSkeleton />
        <BodySkeleton />
      </div>
      <div className="mt-6 md:mt-8">
        <RailBlockSkeleton variant="person" />
        <RailBlockSkeleton variant="poster" />
      </div>
    </div>
  );
}
