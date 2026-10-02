import { GridSkeleton, SkeletonBlock } from "@/components/ds/skeletons";

import type { SearchState } from "./params";
import { ResultTabs } from "./result-tabs";
import { SearchPageFrame } from "./search-page-frame";

/*
 * Loading states for /search. They reuse the real wrapper, the real h1 and
 * the same control heights as the page (input h-14, controls and tabs h-11,
 * summary line 20px), so nothing moves when the results arrive.
 */

const PEOPLE_GRID =
  "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8";

function SummarySkeleton() {
  return (
    <div aria-hidden="true" className="mt-6 flex h-5 items-center">
      <SkeletonBlock className="h-3.5 w-48 rounded-full" />
    </div>
  );
}

/** Mirrors the people grid: 112px avatar, name line, role line. */
function PeopleSkeleton({ count = 16 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className="mt-6">
      <span className="sr-only">Loading</span>
      <ul aria-hidden="true" className={PEOPLE_GRID}>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="flex justify-center">
            <div className="flex w-28 flex-col items-center md:w-32">
              <SkeletonBlock className="size-28 rounded-full" />
              <span className="mt-2 flex h-5 w-full items-center justify-center">
                <SkeletonBlock className="h-3.5 w-4/5 rounded-full" />
              </span>
              <span className="mt-0.5 flex h-[18px] w-full items-center justify-center">
                <SkeletonBlock className="h-3 w-3/5 rounded-full" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Suspense fallback while results load. The tabs are real links (without
 * counts) so they stay usable, followed by a summary line and a grid.
 */
export function SearchBodySkeleton({ state }: { state: SearchState }) {
  return (
    <>
      <ResultTabs state={state} counts={null} />
      <SummarySkeleton />
      {state.type === "person" ? (
        <PeopleSkeleton />
      ) : (
        <div className="mt-6">
          <GridSkeleton count={20} />
        </div>
      )}
    </>
  );
}

/** loading.tsx: no search state is known yet, so the controls are placeholders. */
export function SearchPageSkeleton() {
  return (
    <SearchPageFrame>
      <div aria-hidden="true" className="mt-5 md:mt-6">
        <SkeletonBlock className="h-14 w-full rounded-full" />
        <div className="mt-3 flex flex-wrap gap-2">
          <SkeletonBlock className="h-11 w-32 rounded-full" />
          <SkeletonBlock className="h-11 w-36 rounded-full" />
          <SkeletonBlock className="h-11 w-32 rounded-full" />
        </div>
      </div>
      <div aria-hidden="true" className="no-scrollbar -mx-[var(--gutter)] mt-6 overflow-hidden px-gutter">
        <div className="flex w-max gap-2">
          {["w-20", "w-28", "w-28", "w-28"].map((width, index) => (
            <SkeletonBlock key={index} className={`h-11 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
      </div>
      <SummarySkeleton />
      <div className="mt-6">
        <GridSkeleton count={20} />
      </div>
    </SearchPageFrame>
  );
}
