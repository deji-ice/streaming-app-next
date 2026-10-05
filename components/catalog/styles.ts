/**
 * Class strings shared by the catalog pages and their skeletons, so the
 * loading state and the real page always use the same geometry.
 */

import { focusRing } from "@/components/ds/classes";

/** Whole-page wrapper for pages without a full-bleed rail: top and bottom padding. */
export const catalogPage = "mx-auto w-full max-w-[1440px] px-gutter pb-12 pt-6 md:pb-16 md:pt-10";

/** Header block of a page that has a full-bleed rail between it and the results. */
export const catalogPageTop = "mx-auto w-full max-w-[1440px] px-gutter pt-6 md:pt-10";

/** Results block that follows a rail. */
export const catalogPageBottom = "mx-auto w-full max-w-[1440px] px-gutter pb-12 md:pb-16";

/** h1 of the listing pages: one fixed line box (32px, 40px md+) so the skeleton matches exactly. */
export const catalogTitle = "type-display-md flex h-8 items-center text-foreground md:h-10";

/** h1 of entity pages: same line box as a minimum, grows when a long name wraps. */
export const entityTitle = "type-display-md flex min-h-8 items-center text-foreground md:min-h-10";

/**
 * Chip row. Below md it scrolls sideways and bleeds to the screen edges (the
 * partly hidden last chip shows there is more). From md up the chips wrap.
 * The vertical padding keeps the 4px focus ring from being clipped.
 */
export const chipScroller =
  "no-scrollbar -mx-[var(--gutter)] -my-1 overflow-x-auto px-gutter py-1 scroll-px-gutter md:mx-0 md:my-0 md:overflow-visible md:px-0 md:py-0";

/** Chip (genre toggle, clear link): 44px below md, 36px from md. */
export const chipBase = `inline-flex h-11 shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.98] md:h-9 ${focusRing}`;

export const chipOff = "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground";
export const chipOn = "border-primary bg-primary text-primary-foreground hover:bg-primary-hover";

/** Text link inside the credit line and similar inline copy. */
export const inlineLink = `rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-primary hover:decoration-primary ${focusRing}`;
