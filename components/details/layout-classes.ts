/**
 * Layout class strings shared by the movie and series detail pages and their
 * loading skeletons, so a skeleton can never drift from the real geometry.
 * Plain constants: safe to import from Server and Client Components.
 */

/** Text-heavy blocks. Rails are full-bleed and are never wrapped in this. */
export const pageWrapper = "mx-auto w-full max-w-[1440px] px-gutter";

/** Full-width black band behind the player (edge to edge, no padding). */
export const playerBand = "bg-black";

/** The player spans the full page width; its height is capped by playerHeight. */
export const playerFrame = "w-full";

/**
 * Player box height: 16:9 of the full width, capped by --player-max-h
 * (globals.css) so the embed's controls stay in view above the mobile tab bar
 * and a strip of page always shows under the player to scroll on. On wide or
 * short windows the box is wider than 16:9 and the embed letterboxes the video
 * inside it, as its own fullscreen mode does.
 * Used by VideoPlayer and the loading skeleton so they always match.
 */
export const playerHeight = "aspect-video max-h-[var(--player-max-h)]";

/**
 * Title header grid. Poster 96px on phones, 140px from md, 220px from lg.
 * Below lg the actions row spans both columns; from lg it sits under the
 * title block and the poster spans both rows.
 */
export const headerGrid =
  "grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-5 sm:gap-x-6 md:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-6";

/** Overview and fun facts (left), details (right). One column below lg. */
export const bodyGrid = "grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12";

/** Vertical rhythm between the blocks of a detail page (spec 2.3). */
export const blockGap = "gap-10 md:gap-14";
