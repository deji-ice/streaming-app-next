import type { ReactNode } from "react";

import { bodyGrid } from "./layout-classes";

export interface OverviewSectionProps {
  overview: string | null | undefined;
  /** Fun facts block, usually a <Suspense> around <FunFacts>. Sits under the overview. */
  funFacts?: ReactNode;
  /** Right column: the FactsList. Kept short so both columns end at about the same height. */
  children: ReactNode;
  /**
   * Full-width row under both columns: StreamingOn, networks and production
   * companies, laid out side by side so their logos flow horizontally instead
   * of stacking in the narrow column. Pass null when there is nothing to show.
   */
  credits?: ReactNode;
}

/**
 * Overview and fun facts on the left, the details list on the right (340px
 * from lg; one column below lg), then a full-width credits row with the
 * streaming services, networks and production logos.
 */
export function OverviewSection({ overview, funFacts, children, credits }: OverviewSectionProps) {
  const text = overview?.trim();

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <div className={bodyGrid}>
        <section aria-labelledby="overview-heading" className="min-w-0">
          <h2 id="overview-heading" className="type-section text-foreground">
            Overview
          </h2>
          {text ? (
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-foreground">{text}</p>
          ) : (
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-muted-foreground">
              No overview is available yet.
            </p>
          )}
          {funFacts ? <div className="mt-8">{funFacts}</div> : null}
        </section>

        <section
          aria-labelledby="details-heading"
          className="min-w-0 border-t border-border pt-8 lg:border-t-0 lg:pt-0"
        >
          <h2 id="details-heading" className="type-section text-foreground">
            Details
          </h2>
          <div className="mt-4">{children}</div>
        </section>
      </div>

      {credits ? (
        <div className="flex flex-wrap items-start gap-x-14 gap-y-8 border-t border-border pt-8 [&>section:last-child]:min-w-0 [&>section:last-child]:flex-[1_1_320px]">
          {credits}
        </div>
      ) : null}
    </div>
  );
}
