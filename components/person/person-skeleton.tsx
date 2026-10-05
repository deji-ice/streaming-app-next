import { SkeletonBlock } from "@/components/ds/skeletons";
import { railWidths } from "@/components/ds/classes";
import { cn } from "@/lib/utils";

/*
 * Loading skeleton for /person/[slug]. Mirrors the final page: same grid and
 * column widths, portrait aspect ratio, line boxes (facts 20px, biography
 * 25.6px), rail geometry (py-5 md:py-7, 44px header row, 3-line credit card)
 * and filmography rows (60px thumbnail + 6px padding top and bottom).
 */

/** A text line inside a fixed line box, so the skeleton keeps the real line height. */
function Line({ box = "h-5", className }: { box?: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center", box)}>
      <SkeletonBlock className={cn("h-3 rounded-full", className)} />
    </span>
  );
}

function CreditCardSkeleton() {
  return (
    <div aria-hidden="true" className={cn("shrink-0", railWidths.poster)}>
      <SkeletonBlock className="aspect-[2/3] w-full" />
      <span className="mt-2 block">
        <Line className="h-3.5 w-4/5" />
        <Line className="w-3/5" />
        <Line className="w-2/5" />
      </span>
    </div>
  );
}

function RailBlock({ titleWidth }: { titleWidth: string }) {
  return (
    <div aria-hidden="true" className="py-5 md:py-7">
      <div className="flex min-h-11 items-center px-gutter">
        <SkeletonBlock className={cn("h-[22px] rounded-full md:h-[26px]", titleWidth)} />
      </div>
      <div className="-mb-1 mt-2 flex gap-3 overflow-hidden px-gutter py-1 md:gap-4">
        {Array.from({ length: 8 }, (_, index) => (
          <CreditCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function RowSkeleton({ titleWidth, roleWidth }: { titleWidth: string; roleWidth: string }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-3 py-1.5 md:grid-cols-[40px_minmax(0,1.25fr)_minmax(0,1fr)] md:gap-x-5">
      <SkeletonBlock className="h-[60px] w-10" />
      <span className="block min-w-0 md:contents">
        <Line className={cn("h-3.5", titleWidth)} />
        <Line box="h-[18px]" className={roleWidth} />
      </span>
    </div>
  );
}

function GroupSkeleton({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div aria-hidden="true" className="border-t border-border py-3 first:border-t-0 first:pt-0 sm:grid sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-4">
      <span className="flex items-center pb-1 sm:h-[72px] sm:pb-0">
        <SkeletonBlock className="h-3.5 w-10 rounded-full" />
      </span>
      <div>
        {rows.map(([titleWidth, roleWidth], index) => (
          <RowSkeleton key={index} titleWidth={titleWidth} roleWidth={roleWidth} />
        ))}
      </div>
    </div>
  );
}

export function PersonPageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="pb-12 md:pb-16">
      <span className="sr-only">Loading</span>

      <div className="mx-auto w-full max-w-[1440px] px-gutter pb-4 pt-6 md:pb-6 md:pt-10">
        <div
          aria-hidden="true"
          className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:grid-rows-[auto_1fr] sm:gap-x-8 sm:gap-y-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-10"
        >
          <SkeletonBlock className="aspect-[2/3] w-full sm:row-span-2" />

          <div className="min-w-0 self-center sm:self-start">
            <SkeletonBlock className="h-8 w-full max-w-sm rounded-full md:h-10 xl:h-12" />
            <Line box="mt-2 h-6" className="w-36" />
          </div>

          <div className="col-span-2 min-w-0 sm:col-span-1">
            <div className="space-y-2">
              <Line className="w-56 max-w-full" />
              <Line className="w-64 max-w-full" />
              <Line className="w-48 max-w-full" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <SkeletonBlock className="size-11 rounded-full" />
              <SkeletonBlock className="size-11 rounded-full" />
              <SkeletonBlock className="size-11 rounded-full" />
              <SkeletonBlock className="h-11 w-24 rounded-full" />
            </div>
            <div className="mt-6 max-w-[65ch]">
              {["w-full", "w-full", "w-11/12", "w-full", "w-5/6", "w-2/3"].map((width, index) => (
                <Line key={index} box="h-[25.6px]" className={cn("h-3.5", width)} />
              ))}
              {/* Room for the Read more button. */}
              <span className="mt-1 block h-11" />
            </div>
          </div>
        </div>
      </div>

      <RailBlock titleWidth="w-28" />
      <RailBlock titleWidth="w-20" />

      <div aria-hidden="true" className="mx-auto mt-6 w-full max-w-[1440px] px-gutter md:mt-10">
        <div>
          <SkeletonBlock className="h-[22px] w-36 rounded-full md:h-[26px]" />
          <Line box="mt-1 h-5" className="w-20" />
        </div>
        <SkeletonBlock className="mt-4 h-[54px] w-72 max-w-full rounded-full md:mt-5 md:h-[46px]" />
        <div className="mt-5 max-w-4xl md:mt-6">
          <GroupSkeleton
            rows={[
              ["w-2/5", "w-1/4"],
              ["w-1/2", "w-1/3"],
            ]}
          />
          <GroupSkeleton
            rows={[
              ["w-1/3", "w-1/4"],
              ["w-3/5", "w-1/5"],
              ["w-2/5", "w-1/3"],
            ]}
          />
        </div>
      </div>
    </div>
  );
}
