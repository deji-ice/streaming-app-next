import { posterGridClass } from "@/components/ds/classes";

/** Saved titles (watchlist, favorites) and recommendations: fill-width PosterCards. */
export const POSTER_GRID = posterGridClass;

/** Watch history: 16:9 cards, 2 columns on phones up to 4 on wide screens. */
export const HISTORY_GRID =
  "grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4";

/** Focus ring for controls that sit on the page background. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
