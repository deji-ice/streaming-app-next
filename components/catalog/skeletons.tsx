import { GridSkeleton, RailSkeleton, SkeletonBlock } from "@/components/ds/skeletons";
import { cn } from "@/lib/utils";

import { catalogPage, catalogPageBottom, catalogPageTop, chipScroller } from "./styles";

/*
 * Loading states for the catalog pages. They use the same wrapper classes,
 * margins, control heights and grid as the real pages (see styles.ts), so
 * nothing moves when the content arrives. Server-safe: no hooks.
 *
 * Only GridSkeleton (and RailSkeleton) carry the role="status" region and
 * the sr-only "Loading" text; everything else here is aria-hidden.
 */

/** Chip widths that look like genre names ("Action", "Documentary", "Science Fiction"). */
const CHIP_WIDTHS = [
  "w-24", "w-28", "w-24", "w-20", "w-28", "w-20", "w-24", "w-28", "w-20", "w-32",
  "w-24", "w-24", "w-28", "w-20", "w-24", "w-28", "w-20", "w-24", "w-28",
] as const;

/** Genre chip row. */
export function ChipRowSkeleton({ count = 19 }: { count?: number }) {
  return (
    <div aria-hidden="true" className={cn(chipScroller, "overflow-hidden")}>
      <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
        {Array.from({ length: count }, (_, index) => (
          <SkeletonBlock
            key={index}
            className={cn("h-11 shrink-0 rounded-full md:h-9", CHIP_WIDTHS[index % CHIP_WIDTHS.length])}
          />
        ))}
      </div>
    </div>
  );
}

/** "Page x of y" line under the listing title. */
export function PageCountSkeleton() {
  return (
    <div aria-hidden="true" className="mt-2 flex h-5 items-center">
      <SkeletonBlock className="h-3 w-24 rounded-full" />
    </div>
  );
}

/** Sort pill, genre chips and (browse pages) the type tabs. Mirrors CatalogControls. */
export function ControlsSkeleton({ withTabs = false, chips = 19 }: { withTabs?: boolean; chips?: number }) {
  const sort = <SkeletonBlock className="h-11 w-full rounded-full sm:w-52 md:h-9" />;

  if (withTabs) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <SkeletonBlock className="h-[54px] w-full rounded-full sm:w-[238px] md:h-[46px]" />
          {sort}
        </div>
        <ChipRowSkeleton count={chips} />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
      <div className="md:shrink-0">{sort}</div>
      <div className="min-w-0 md:flex-1">
        <ChipRowSkeleton count={chips} />
      </div>
    </div>
  );
}

/** The poster grid (20 per page) and the pagination row under it. Mirrors ResultsSection. */
export function ResultsSkeleton({ count = 20 }: { count?: number }) {
  return (
    <>
      <GridSkeleton count={count} />
      <div aria-hidden="true" className="mt-10 flex justify-center md:mt-12">
        <SkeletonBlock className="h-11 w-64 rounded-full md:w-[30rem]" />
      </div>
    </>
  );
}

/** /movie and /series: title, page count, controls, grid. */
export function ListingPageSkeleton({ chips = 19 }: { chips?: number }) {
  return (
    <div className={catalogPage}>
      <div aria-hidden="true">
        <SkeletonBlock className="h-8 w-40 rounded-full md:h-10" />
      </div>
      <PageCountSkeleton />
      <div className="mt-6">
        <ControlsSkeleton chips={chips} />
      </div>
      <div className="mt-6 md:mt-8">
        <ResultsSkeleton />
      </div>
    </div>
  );
}

/** Streaming provider header: 56px logo, name, region picker and the JustWatch credit. */
export function ProviderHeaderSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="size-14 shrink-0" />
        <SkeletonBlock className="h-8 w-48 rounded-full md:h-10" />
      </div>
      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-3.5 w-20 rounded-full" />
          <SkeletonBlock className="h-11 w-48 rounded-full md:h-9" />
        </div>
        <div className="flex h-5 items-center">
          <SkeletonBlock className="h-3 w-44 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Studio and network header: logo chip, name and origin country. */
export function EntityHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
      <SkeletonBlock className="h-14 w-[172px] shrink-0" />
      <div className="min-w-0">
        <SkeletonBlock className="h-8 w-56 rounded-full md:h-10" />
        <div className="mt-1 flex h-5 items-center">
          <SkeletonBlock className="h-3 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * /browse/[slug], /company/[slug], /network/[slug]. Providers show the
 * originals rail on the first page, so their skeleton includes it.
 */
export function EntityPageSkeleton({ kind, chips }: { kind: "provider" | "company" | "network"; chips?: number }) {
  const rail = kind === "provider";
  return (
    <>
      <div className={catalogPageTop}>
        {kind === "provider" ? <ProviderHeaderSkeleton /> : <EntityHeaderSkeleton />}
      </div>
      {rail ? <RailSkeleton variant="poster" count={8} titleWidth="w-48" /> : null}
      <div className={catalogPageBottom}>
        <div className={rail ? undefined : "mt-6 md:mt-8"}>
          <ControlsSkeleton withTabs={kind !== "network"} chips={chips ?? (kind === "network" ? 16 : 19)} />
        </div>
        <div className="mt-6 md:mt-8">
          <ResultsSkeleton />
        </div>
      </div>
    </>
  );
}

function ProviderTileSkeleton() {
  return (
    <div aria-hidden="true" className="w-full">
      <SkeletonBlock className="aspect-square w-full" />
      <div className="mt-2 flex h-[18px] items-center">
        <SkeletonBlock className="h-3 w-3/4 rounded-full" />
      </div>
    </div>
  );
}

function SectionHeadingSkeleton({ description = false }: { description?: boolean }) {
  return (
    <div aria-hidden="true">
      <SkeletonBlock className="h-[22px] w-48 rounded-full md:h-[26px]" />
      {description ? (
        <div className="mt-1 flex h-5 items-center">
          <SkeletonBlock className="h-3 w-52 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}

function ChipGridSkeleton({ count }: { count: number }) {
  return (
    <div aria-hidden="true" className="mt-5 flex flex-wrap gap-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonBlock key={index} className="h-14 w-[172px]" />
      ))}
    </div>
  );
}

/** /browse: title, intro line, then the services grid and the network and studio chip grids. */
export function BrowseIndexSkeleton({ services = 8, networks = 10, studios = 9 }: { services?: number; networks?: number; studios?: number }) {
  return (
    <div className={catalogPage}>
      <div aria-hidden="true">
        <SkeletonBlock className="h-8 w-32 rounded-full md:h-10" />
        <div className="mt-2 flex h-5 items-center">
          <SkeletonBlock className="h-3 w-64 rounded-full" />
        </div>
      </div>

      <div role="status" aria-busy="true">
        <span className="sr-only">Loading</span>
        <section className="mt-8 md:mt-10">
          <SectionHeadingSkeleton description />
          <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: services }, (_, index) => (
              <ProviderTileSkeleton key={index} />
            ))}
          </div>
        </section>
        <section className="mt-12 md:mt-16">
          <SectionHeadingSkeleton />
          <ChipGridSkeleton count={networks} />
        </section>
        <section className="mt-12 md:mt-16">
          <SectionHeadingSkeleton />
          <ChipGridSkeleton count={studios} />
        </section>
      </div>
    </div>
  );
}
