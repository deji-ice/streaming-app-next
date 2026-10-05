/**
 * Layout class strings that the home page and its loading skeleton must share
 * so the skeleton keeps the exact geometry of the real page.
 */

/** Space below the last section, before the footer. */
export const HOME_PAGE_CLASS = "pb-6 md:pb-10";

/** Wrapper of the "Browse by genre" section: text-width container with the rail rhythm. */
export const GENRE_SECTION_CLASS = "mx-auto max-w-[1440px] px-gutter py-5 md:py-7";

/** The genre tile grid: 2 columns, 4 from md. 12px below the 44px header row, like a rail. */
export const GENRE_GRID_CLASS =
  "mt-3 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 md:gap-x-4 md:gap-y-6";
