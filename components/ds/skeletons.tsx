import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { posterGridClass, railWidths } from "./classes";

/*
 * Loading skeletons. Each one mirrors the geometry of the component it
 * stands in for (same aspect ratios, widths, radii and text line heights) so
 * nothing shifts when the content arrives. Server-safe: no hooks.
 *
 * Every top-level skeleton is a role="status" region with an sr-only
 * "Loading" label; the blocks themselves are aria-hidden.
 */

type RailSkeletonVariant = "poster" | "landscape" | "person" | "logo";

const RAIL_GAP: Record<RailSkeletonVariant, string> = {
  poster: "gap-3 md:gap-4",
  landscape: "gap-3 md:gap-4",
  person: "gap-2 md:gap-3",
  logo: "gap-3 md:gap-4",
};

const RAIL_COUNT: Record<RailSkeletonVariant, number> = {
  poster: 8,
  landscape: 5,
  person: 10,
  logo: 8,
};

/** A pulsing bg-muted block. Media radius by default; pass rounded-full for pills, avatars and text lines. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-skeleton rounded-media bg-muted", className)} />;
}

/** A text line inside a fixed line box, so the skeleton keeps the real line height. */
function SkeletonLine({ box = "h-5", className }: { box?: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center", box)}>
      <SkeletonBlock className={cn("h-3 rounded-full", className)} />
    </span>
  );
}

function Status({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Loading</span>
      {children}
    </div>
  );
}

/** Mirrors PosterCard (frame, 20px title line, 20px meta line). */
export function PosterCardSkeleton({ width = "rail" }: { width?: "rail" | "fill" }) {
  return (
    <div aria-hidden="true" className={cn("shrink-0", width === "rail" ? railWidths.poster : "w-full")}>
      <SkeletonBlock className="aspect-[2/3] w-full" />
      <span className="mt-2 block">
        <SkeletonLine className="h-3.5 w-4/5" />
        <SkeletonLine className="w-2/5" />
      </span>
    </div>
  );
}

function LandscapeCardSkeleton() {
  return (
    <div aria-hidden="true" className={cn("shrink-0", railWidths.landscape)}>
      <SkeletonBlock className="aspect-video w-full" />
      <span className="mt-2 block">
        <SkeletonLine className="h-3.5 w-3/4" />
        <SkeletonLine box="h-[18px]" className="w-1/3" />
      </span>
    </div>
  );
}

function PersonCardSkeleton() {
  return (
    <div aria-hidden="true" className={cn("flex shrink-0 flex-col items-center", railWidths.person)}>
      <SkeletonBlock className="size-20 rounded-full" />
      <span className="mt-2 flex w-full flex-col items-center">
        <SkeletonLine className="h-3.5 w-4/5" />
        <SkeletonLine box="mt-0.5 h-[18px]" className="w-3/5" />
      </span>
    </div>
  );
}

function ProviderTileSkeleton() {
  return (
    <div aria-hidden="true" className={cn("shrink-0", railWidths.provider)}>
      <SkeletonBlock className="aspect-square w-full" />
      <SkeletonLine box="mt-2 h-[18px]" className="w-3/4" />
    </div>
  );
}

function RailItemSkeleton({ variant }: { variant: RailSkeletonVariant }) {
  if (variant === "landscape") return <LandscapeCardSkeleton />;
  if (variant === "person") return <PersonCardSkeleton />;
  if (variant === "logo") return <ProviderTileSkeleton />;
  return <PosterCardSkeleton />;
}

/** Rail geometry without the status wrapper (for composition inside other skeletons). */
function RailSkeletonBody({
  variant = "poster",
  count,
  titleWidth = "w-40 md:w-56",
}: {
  variant?: RailSkeletonVariant;
  count?: number;
  titleWidth?: string;
}) {
  const total = count ?? RAIL_COUNT[variant];
  return (
    <div className="py-5 md:py-7">
      <div className="flex min-h-11 items-center px-gutter">
        <SkeletonBlock className={cn("h-[22px] rounded-full md:h-[26px]", titleWidth)} />
      </div>
      <div className={cn("-mb-1 mt-2 flex overflow-hidden px-gutter py-1", RAIL_GAP[variant])}>
        {Array.from({ length: total }, (_, index) => (
          <RailItemSkeleton key={index} variant={variant} />
        ))}
      </div>
    </div>
  );
}

/** Mirrors Rail: py-5 md:py-7, 44px header row, full-bleed scroller with px-gutter. */
export function RailSkeleton({
  variant = "poster",
  count,
  titleWidth,
}: {
  variant?: RailSkeletonVariant;
  count?: number;
  /** Tailwind width classes for the heading block, for example "w-48". */
  titleWidth?: string;
}) {
  return (
    <Status>
      <RailSkeletonBody variant={variant} count={count} titleWidth={titleWidth} />
    </Status>
  );
}

/**
 * Home spotlight. Mobile: backdrop, switcher, then text. lg: text column
 * (5/12) and switcher on the left, 16:9 backdrop (7/12) on the right.
 */
export function HeroSkeleton() {
  return (
    <Status className="mx-auto max-w-[1440px] px-gutter pt-4 md:pt-8">
      <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-10 lg:gap-y-6">
        <SkeletonBlock className="aspect-video w-full lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1" />
        <div className="flex gap-2 overflow-hidden lg:col-span-5 lg:col-start-1 lg:row-start-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock key={index} className="aspect-video w-24 shrink-0" />
          ))}
        </div>
        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-end">
          <SkeletonLine box="h-4" className="w-32" />
          <div className="mt-4 space-y-2">
            <SkeletonBlock className="h-10 w-4/5 rounded-full md:h-14" />
            <SkeletonBlock className="h-10 w-3/5 rounded-full md:h-14" />
          </div>
          <SkeletonLine box="mt-4 h-5" className="w-2/3" />
          <div className="mt-4 max-w-[52ch]">
            <SkeletonLine box="h-6" className="w-full" />
            <SkeletonLine box="h-6" className="w-11/12" />
            <SkeletonLine box="h-6" className="w-3/4" />
          </div>
          <div className="mt-6 flex gap-3">
            <SkeletonBlock className="h-11 w-36 rounded-full" />
            <SkeletonBlock className="h-11 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </Status>
  );
}

/**
 * Movie and series detail: player band, title header, overview and facts,
 * episodes (series only), then the cast rail.
 */
export function DetailSkeleton({ kind }: { kind: "movie" | "series" }) {
  return (
    <Status>
      <div className="bg-black">
        <div className="mx-auto w-full max-w-[min(100%,calc((100dvh-64px)*1.6))]">
          <SkeletonBlock className="aspect-video w-full rounded-none" />
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1440px] flex-col gap-10 px-gutter md:mt-10 md:gap-14">
        <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
          <SkeletonBlock className="aspect-[2/3] w-full" />
          <div className="min-w-0">
            <SkeletonBlock className="h-9 w-3/4 rounded-full md:h-12" />
            <SkeletonLine box="mt-3 h-6" className="w-1/2" />
            <SkeletonLine box="mt-4 h-5" className="w-2/3" />
            <SkeletonLine box="mt-3 h-5" className="w-28" />
            <div className="mt-6 flex flex-wrap gap-3">
              <SkeletonBlock className="h-11 w-32 rounded-full" />
              <SkeletonBlock className="size-11 rounded-full" />
              <SkeletonBlock className="size-11 rounded-full" />
              <SkeletonBlock className="size-11 rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-[65ch]">
            {["w-full", "w-full", "w-11/12", "w-full", "w-2/3"].map((width, index) => (
              <SkeletonLine key={index} box="h-[26px]" className={cn("h-3.5", width)} />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-1">
                <SkeletonLine box="h-4" className="w-20" />
                <SkeletonLine box="h-5" className="w-40" />
              </div>
            ))}
          </div>
        </div>

        {kind === "series" ? (
          <div>
            <SkeletonBlock className="h-[22px] w-32 rounded-full md:h-[26px]" />
            <div className="mt-4 flex gap-2 overflow-hidden">
              {Array.from({ length: 5 }, (_, index) => (
                <SkeletonBlock key={index} className="h-11 w-24 shrink-0 rounded-full" />
              ))}
            </div>
            <div className="mt-6 space-y-5">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                  <SkeletonBlock className="aspect-video w-full" />
                  <div>
                    <SkeletonLine box="h-6" className="w-1/2" />
                    <SkeletonLine box="mt-1 h-5" className="w-1/3" />
                    <SkeletonLine box="mt-1 h-5" className="w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 md:mt-8">
        <RailSkeletonBody variant="person" titleWidth="w-24 md:w-28" />
      </div>
    </Status>
  );
}

/** Person page: portrait, name and facts, biography, then a credits rail. */
export function PersonSkeleton() {
  return (
    <Status>
      <div className="mx-auto max-w-[1440px] px-gutter pt-6 md:pt-10">
        <div className="grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <SkeletonBlock className="aspect-[2/3] w-40 sm:w-full" />
          <div className="min-w-0">
            <SkeletonBlock className="h-9 w-2/3 rounded-full md:h-12" />
            <SkeletonLine box="mt-3 h-6" className="w-40" />
            <div className="mt-5 space-y-2">
              <SkeletonLine className="w-56" />
              <SkeletonLine className="w-48" />
            </div>
            <div className="mt-6 flex gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <SkeletonBlock key={index} className="size-11 rounded-full" />
              ))}
            </div>
            <div className="mt-8 max-w-[65ch]">
              {["w-full", "w-full", "w-11/12", "w-full", "w-5/6", "w-1/2"].map((width, index) => (
                <SkeletonLine key={index} box="h-[26px]" className={cn("h-3.5", width)} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 md:mt-10">
        <RailSkeletonBody variant="poster" />
      </div>
    </Status>
  );
}

/** Listing grid of fill-width PosterCards (2 / 3 sm / 4 md / 5 lg / 6 xl / 7 2xl columns). */
export function GridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <Status>
      <div className={posterGridClass}>
        {Array.from({ length: count }, (_, index) => (
          <PosterCardSkeleton key={index} width="fill" />
        ))}
      </div>
    </Status>
  );
}

/**
 * Listing page: h1 + page count, controls row (sort pill + genre chips), then
 * the poster grid. For loading.tsx of /movie, /series, /search and /browse/[slug].
 */
export function ListingSkeleton({ count = 20, withControls = true }: { count?: number; withControls?: boolean }) {
  return (
    <div className="mx-auto max-w-[1440px] px-gutter pt-6 md:pt-10">
      <div aria-hidden="true">
        <SkeletonBlock className="h-8 w-40 rounded-full md:h-10" />
        <SkeletonLine box="mt-2 h-5" className="w-28" />
        {withControls ? (
          <div className="mt-6 flex gap-2 overflow-hidden">
            <SkeletonBlock className="h-11 w-40 shrink-0 rounded-full" />
            {Array.from({ length: 7 }, (_, index) => (
              <SkeletonBlock key={index} className="h-11 w-20 shrink-0 rounded-full" />
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-6 md:mt-8">
        <GridSkeleton count={count} />
      </div>
    </div>
  );
}
